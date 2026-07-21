"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Stock = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  sector: string;
};

type Holding = {
  symbol: string;
  name: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
};

type Transaction = {
  id: string;
  type: "BUY" | "SELL";
  symbol: string;
  qty: number;
  price: number;
  total: number;
  timestamp: Date;
};

const INITIAL_CASH = 100000;

const MOCK_STOCKS: Stock[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2847.5, change: 34.2, changePct: 1.21, sector: "Energy" },
  { symbol: "TCS", name: "Tata Consultancy", price: 3612, change: -28.5, changePct: -0.78, sector: "IT" },
  { symbol: "INFY", name: "Infosys", price: 1456.75, change: 12.3, changePct: 0.85, sector: "IT" },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 1623.4, change: -8.6, changePct: -0.53, sector: "Banking" },
  { symbol: "WIPRO", name: "Wipro", price: 478.9, change: 5.4, changePct: 1.14, sector: "IT" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", price: 6834.2, change: 145.8, changePct: 2.18, sector: "NBFC" },
  { symbol: "TITAN", name: "Titan Company", price: 3241.55, change: -22.1, changePct: -0.68, sector: "Consumer" },
  { symbol: "ASIANPAINT", name: "Asian Paints", price: 2978.3, change: 18.9, changePct: 0.64, sector: "Consumer" },
  { symbol: "MARUTI", name: "Maruti Suzuki", price: 10845, change: 234.5, changePct: 2.21, sector: "Auto" },
  { symbol: "SUNPHARMA", name: "Sun Pharma", price: 1234.6, change: -14.3, changePct: -1.14, sector: "Pharma" },
];

const formatMoney = (amount: number) => `Rs. ${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const formatPrice = (amount: number) => `Rs. ${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function PaperTradingGame() {
  const [stocks, setStocks] = useState<Stock[]>(MOCK_STOCKS);
  const [cash, setCash] = useState(INITIAL_CASH);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selected, setSelected] = useState<Stock | null>(MOCK_STOCKS[0]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"market" | "portfolio" | "history">("market");
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
  const [toast, setToast] = useState<string | null>(null);
  const [firstTrade, setFirstTrade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((previous) => {
        const nextStocks = previous.map((stock) => {
          const movePct = (Math.random() - 0.48) * 2;
          const newPrice = Math.max(10, stock.price * (1 + movePct / 100));
          const change = newPrice - stock.price;
          return {
            ...stock,
            price: Number(newPrice.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePct: Number(movePct.toFixed(2)),
          };
        });

        setSelected((current) => (current ? nextStocks.find((stock) => stock.symbol === current.symbol) || current : current));
        setHoldings((previousHoldings) =>
          previousHoldings.map((holding) => {
            const stock = nextStocks.find((item) => item.symbol === holding.symbol);
            return stock ? { ...holding, currentPrice: stock.price } : holding;
          }),
        );

        return nextStocks;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const totalPortfolioValue = holdings.reduce((sum, holding) => sum + holding.qty * holding.currentPrice, 0);
  const totalInvested = holdings.reduce((sum, holding) => sum + holding.qty * holding.avgPrice, 0);
  const totalPnL = totalPortfolioValue - totalInvested;
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const netWorth = cash + totalPortfolioValue;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const executeTrade = async () => {
    if (!selected || qty <= 0) return;

    const total = selected.price * qty;

    if (orderType === "BUY") {
      if (total > cash) {
        showToast("Insufficient cash.");
        return;
      }

      setCash((value) => value - total);
      setHoldings((previous) => {
        const existing = previous.find((holding) => holding.symbol === selected.symbol);
        if (existing) {
          const newQty = existing.qty + qty;
          const newAvg = (existing.qty * existing.avgPrice + total) / newQty;
          return previous.map((holding) =>
            holding.symbol === selected.symbol ? { ...holding, qty: newQty, avgPrice: newAvg, currentPrice: selected.price } : holding,
          );
        }

        return [...previous, { symbol: selected.symbol, name: selected.name, qty, avgPrice: selected.price, currentPrice: selected.price }];
      });
      showToast(`Bought ${qty} x ${selected.symbol} at ${formatPrice(selected.price)}.`);
    } else {
      const holding = holdings.find((item) => item.symbol === selected.symbol);
      if (!holding || holding.qty < qty) {
        showToast("Not enough shares.");
        return;
      }

      setCash((value) => value + total);
      setHoldings((previous) =>
        previous
          .map((item) => (item.symbol === selected.symbol ? { ...item, qty: item.qty - qty } : item))
          .filter((item) => item.qty > 0),
      );
      showToast(`Sold ${qty} x ${selected.symbol} at ${formatPrice(selected.price)}.`);
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: orderType,
      symbol: selected.symbol,
      qty,
      price: selected.price,
      total,
      timestamp: new Date(),
    };

    setTransactions((previous) => [transaction, ...previous]);

    if (transactions.length === 0 && !firstTrade) {
      setFirstTrade(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) return;

        const response = await fetch("/api/award-xp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ activity: "paper_trade" }),
        });

        const result = await response.json() as { xp_earned?: number; badge_earned?: string | null };
        if (response.ok && result.xp_earned) {
          showToast(`Badge unlocked: ${result.badge_earned || "First Trade"}. +${result.xp_earned} XP.`);
        }
      }
    }

    setQty(1);
  };

  return (
    <div style={s.page}>
      {toast ? <div style={s.toast}>{toast}</div> : null}

      <div style={s.topNav}>
        <Link href="/dashboard" style={s.back}>
          ← Dashboard
        </Link>
      </div>

      <div style={s.header}>
        <div>
          <div style={s.eyebrow}>Simulator</div>
          <h1 style={s.title}>Paper Trading</h1>
          <p style={s.sub}>Virtual Rs. 1,00,000 portfolio with zero real money risk.</p>
        </div>
        <div style={s.netWorthBox}>
          <div style={s.netWorthLabel}>Net worth</div>
          <div style={s.netWorthVal}>{formatMoney(netWorth)}</div>
          <div style={{ ...s.netPnL, color: totalPnL >= 0 ? "#1D9E75" : "#EF4444" }}>
            {totalPnL >= 0 ? "+" : ""}
            {formatMoney(totalPnL)} ({totalPnLPct.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div style={s.cashBar}>
        <span style={s.cashLabel}>Available cash</span>
        <span style={s.cashVal}>{formatMoney(cash)}</span>
      </div>

      <div style={s.tabs}>
        {(["market", "portfolio", "history"] as const).map((item) => (
          <button key={item} onClick={() => setTab(item)} style={{ ...s.tab, ...(tab === item ? s.tabActive : {}) }} type="button">
            {item === "market" ? "Market" : item === "portfolio" ? `Portfolio (${holdings.length})` : `History (${transactions.length})`}
          </button>
        ))}
      </div>

      {tab === "market" ? (
        <div style={s.layout}>
          <div style={s.stockList}>
            {stocks.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => {
                  setSelected(stock);
                  setOrderType("BUY");
                }}
                style={{ ...s.stockRow, ...(selected?.symbol === stock.symbol ? s.stockRowActive : {}) }}
                type="button"
              >
                <div style={s.stockLeft}>
                  <div style={s.stockSymbol}>{stock.symbol}</div>
                  <div style={s.stockName}>{stock.name}</div>
                  <div style={s.stockSector}>{stock.sector}</div>
                </div>
                <div style={s.stockRight}>
                  <div style={s.stockPrice}>{formatPrice(stock.price)}</div>
                  <div style={{ ...s.stockChange, color: stock.changePct >= 0 ? "#1D9E75" : "#EF4444", background: stock.changePct >= 0 ? "#E1F5EE" : "#FEF2F2" }}>
                    {stock.changePct >= 0 ? "Up" : "Down"} {Math.abs(stock.changePct).toFixed(2)}%
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selected ? (
            <div style={s.orderPanel}>
              <div style={s.orderStock}>
                <div style={s.orderSymbol}>{selected.symbol}</div>
                <div style={s.orderPrice}>{formatPrice(selected.price)}</div>
                <div style={{ ...s.orderChange, color: selected.changePct >= 0 ? "#1D9E75" : "#EF4444" }}>
                  {selected.changePct >= 0 ? "Up" : "Down"} {Math.abs(selected.changePct).toFixed(2)}%
                </div>
              </div>

              <div style={s.orderTypeTabs}>
                <button onClick={() => setOrderType("BUY")} style={{ ...s.orderTypeBtn, ...(orderType === "BUY" ? s.buyActive : {}) }} type="button">
                  Buy
                </button>
                <button onClick={() => setOrderType("SELL")} style={{ ...s.orderTypeBtn, ...(orderType === "SELL" ? s.sellActive : {}) }} type="button">
                  Sell
                </button>
              </div>

              <div style={s.orderField}>
                <label style={s.orderLabel}>Quantity</label>
                <div style={s.qtyRow}>
                  <button onClick={() => setQty((value) => Math.max(1, value - 1))} style={s.qtyBtn} type="button">
                    -
                  </button>
                  <input type="number" min={1} value={qty} onChange={(event) => setQty(Math.max(1, Number.parseInt(event.target.value, 10) || 1))} style={s.qtyInput} />
                  <button onClick={() => setQty((value) => value + 1)} style={s.qtyBtn} type="button">
                    +
                  </button>
                </div>
              </div>

              <div style={s.orderSummary}>
                <div style={s.orderSummaryRow}>
                  <span>Price per share</span>
                  <span>{formatPrice(selected.price)}</span>
                </div>
                <div style={s.orderSummaryRow}>
                  <span>Quantity</span>
                  <span>{qty}</span>
                </div>
                <div style={{ ...s.orderSummaryRow, fontWeight: 700 }}>
                  <span>Total</span>
                  <span>{formatMoney(selected.price * qty)}</span>
                </div>
              </div>

              {orderType === "SELL" && !holdings.find((holding) => holding.symbol === selected.symbol) ? (
                <div style={s.noHolding}>You do not own {selected.symbol}</div>
              ) : null}

              <button onClick={executeTrade} style={{ ...s.execBtn, background: orderType === "BUY" ? "#1D9E75" : "#EF4444" }} type="button">
                {orderType} {qty} x {selected.symbol}
              </button>
              <div style={s.disclaimer}>Paper trading only. No real money involved.</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "portfolio" ? (
        <div style={s.portfolioView}>
          {holdings.length === 0 ? (
            <EmptyState title="No holdings yet" description="Go to Market and buy your first stock." />
          ) : (
            <>
              <div style={s.pnlSummary}>
                <PnlCard label="Total invested" value={formatMoney(totalInvested)} />
                <PnlCard label="Current value" value={formatMoney(totalPortfolioValue)} />
                <PnlCard label="P&L" value={`${totalPnL >= 0 ? "+" : ""}${formatMoney(Math.abs(totalPnL))}`} tone={totalPnL >= 0 ? "good" : "bad"} />
              </div>
              {holdings.map((holding) => {
                const pnl = (holding.currentPrice - holding.avgPrice) * holding.qty;
                const pnlPct = ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
                return (
                  <div key={holding.symbol} style={s.holdingRow}>
                    <div>
                      <div style={s.holdingSymbol}>{holding.symbol}</div>
                      <div style={s.holdingQty}>
                        {holding.qty} shares - avg {formatPrice(holding.avgPrice)}
                      </div>
                    </div>
                    <div style={s.holdingRight}>
                      <div style={s.holdingValue}>{formatMoney(holding.currentPrice * holding.qty)}</div>
                      <div style={{ ...s.holdingPnl, color: pnl >= 0 ? "#1D9E75" : "#EF4444" }}>
                        {pnl >= 0 ? "+" : ""}
                        {formatMoney(Math.abs(pnl))} ({pnlPct.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      ) : null}

      {tab === "history" ? (
        <div style={s.historyView}>
          {transactions.length === 0 ? (
            <EmptyState title="No trades yet" description="Your executed trades will appear here." />
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} style={s.txRow}>
                <div style={{ ...s.txType, background: transaction.type === "BUY" ? "#E1F5EE" : "#FEF2F2", color: transaction.type === "BUY" ? "#0F6E56" : "#B91C1C" }}>
                  {transaction.type}
                </div>
                <div style={s.txDetails}>
                  <div style={s.txSymbol}>{transaction.symbol}</div>
                  <div style={s.txMeta}>
                    {transaction.qty} shares at {formatPrice(transaction.price)}
                  </div>
                </div>
                <div style={s.txRight}>
                  <div style={s.txTotal}>{formatMoney(transaction.total)}</div>
                  <div style={s.txTime}>{transaction.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function PnlCard({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div style={{ ...s.pnlCard, background: tone === "good" ? "#E1F5EE" : tone === "bad" ? "#FEF2F2" : "#fff" }}>
      <div style={s.pnlLabel}>{label}</div>
      <div style={{ ...s.pnlVal, color: tone === "good" ? "#1D9E75" : tone === "bad" ? "#EF4444" : "#0a0a0a" }}>{value}</div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div style={s.empty}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#888" }}>{description}</div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui, -apple-system, sans-serif", padding: "20px 16px 60px", position: "relative" },
  toast: { position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#0a0a0a", color: "#fff", padding: "10px 20px", borderRadius: 24, fontSize: 13, fontWeight: 500, zIndex: 200, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" },
  topNav: { maxWidth: 900, margin: "0 auto 14px" },
  back: { fontSize: 13, color: "#888", textDecoration: "none" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, maxWidth: 900, margin: "0 auto 14px", gap: 18 },
  eyebrow: { fontSize: 12, fontWeight: 600, color: "#185FA5", marginBottom: 4 },
  title: { fontSize: 24, fontWeight: 700, letterSpacing: 0, margin: "0 0 4px", color: "#0a0a0a" },
  sub: { fontSize: 13, color: "#888", margin: 0 },
  netWorthBox: { textAlign: "right" },
  netWorthLabel: { fontSize: 11, color: "#aaa", marginBottom: 2 },
  netWorthVal: { fontSize: 20, fontWeight: 800, color: "#0a0a0a", letterSpacing: 0 },
  netPnL: { fontSize: 12, fontWeight: 600, marginTop: 2 },
  cashBar: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 10, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, maxWidth: 900, margin: "0 auto 14px" },
  cashLabel: { fontSize: 13, color: "#666" },
  cashVal: { fontSize: 15, fontWeight: 700, color: "#0a0a0a" },
  tabs: { display: "flex", gap: 6, marginBottom: 14, maxWidth: 900, margin: "0 auto 14px" },
  tab: { padding: "8px 16px", fontSize: 13, fontWeight: 500, border: "0.5px solid #ddd", borderRadius: 20, background: "#fff", color: "#666", cursor: "pointer", fontFamily: "system-ui" },
  tabActive: { background: "#0a0a0a", color: "#fff", border: "0.5px solid #0a0a0a" },
  layout: { display: "grid", gridTemplateColumns: "1fr 280px", gap: 14, maxWidth: 900, margin: "0 auto" },
  stockList: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, overflow: "hidden" },
  stockRow: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: "none", borderBottom: "0.5px solid #f0f0f0", cursor: "pointer", transition: "background .15s", background: "#fff", textAlign: "left", fontFamily: "system-ui" },
  stockRowActive: { background: "#F0FAF6" },
  stockLeft: {},
  stockSymbol: { fontWeight: 700, fontSize: 14, color: "#0a0a0a" },
  stockName: { fontSize: 12, color: "#666", marginTop: 1 },
  stockSector: { fontSize: 10, color: "#aaa", marginTop: 1 },
  stockRight: { textAlign: "right" },
  stockPrice: { fontWeight: 700, fontSize: 15, color: "#0a0a0a" },
  stockChange: { fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 10, marginTop: 4, display: "inline-block" },
  orderPanel: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "18px", height: "fit-content", position: "sticky", top: 16 },
  orderStock: { marginBottom: 14, paddingBottom: 14, borderBottom: "0.5px solid #eee" },
  orderSymbol: { fontWeight: 700, fontSize: 16, color: "#0a0a0a" },
  orderPrice: { fontSize: 22, fontWeight: 800, letterSpacing: 0, color: "#0a0a0a", margin: "4px 0" },
  orderChange: { fontSize: 13, fontWeight: 600 },
  orderTypeTabs: { display: "flex", gap: 6, marginBottom: 14 },
  orderTypeBtn: { flex: 1, padding: "9px", fontSize: 13, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  buyActive: { background: "#E1F5EE", border: "1.5px solid #1D9E75", color: "#0F6E56" },
  sellActive: { background: "#FEF2F2", border: "1.5px solid #EF4444", color: "#B91C1C" },
  orderField: { marginBottom: 14 },
  orderLabel: { display: "block", fontSize: 12, fontWeight: 500, color: "#555", marginBottom: 6 },
  qtyRow: { display: "flex", gap: 8, alignItems: "center" },
  qtyBtn: { width: 36, height: 36, borderRadius: 8, border: "0.5px solid #ddd", background: "#fafafa", fontSize: 18, cursor: "pointer", fontFamily: "system-ui" },
  qtyInput: { flex: 1, padding: "8px", fontSize: 15, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 8, textAlign: "center", fontFamily: "system-ui", outline: "none", minWidth: 0 },
  orderSummary: { background: "#fafafa", borderRadius: 8, padding: "10px 12px", marginBottom: 14 },
  orderSummaryRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#444", marginBottom: 5 },
  noHolding: { fontSize: 12, color: "#B91C1C", background: "#FEF2F2", padding: "8px 12px", borderRadius: 8, marginBottom: 10, textAlign: "center" },
  execBtn: { width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, border: "none", borderRadius: 9, color: "#fff", cursor: "pointer", fontFamily: "system-ui", marginBottom: 8 },
  disclaimer: { fontSize: 10, color: "#ccc", textAlign: "center" },
  portfolioView: { maxWidth: 900, margin: "0 auto" },
  pnlSummary: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 },
  pnlCard: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 10, padding: "12px", textAlign: "center" },
  pnlLabel: { fontSize: 11, color: "#aaa", marginBottom: 4 },
  pnlVal: { fontSize: 16, fontWeight: 700, color: "#0a0a0a", letterSpacing: 0 },
  holdingRow: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 10, padding: "14px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", gap: 12 },
  holdingSymbol: { fontWeight: 700, fontSize: 15, color: "#0a0a0a" },
  holdingQty: { fontSize: 12, color: "#888", marginTop: 2 },
  holdingRight: { textAlign: "right" },
  holdingValue: { fontWeight: 700, fontSize: 15, color: "#0a0a0a" },
  holdingPnl: { fontSize: 12, fontWeight: 600, marginTop: 2 },
  historyView: { maxWidth: 900, margin: "0 auto" },
  txRow: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 },
  txType: { fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 },
  txDetails: { flex: 1 },
  txSymbol: { fontWeight: 600, fontSize: 14, color: "#0a0a0a" },
  txMeta: { fontSize: 12, color: "#888", marginTop: 1 },
  txRight: { textAlign: "right" },
  txTotal: { fontWeight: 700, fontSize: 14, color: "#0a0a0a" },
  txTime: { fontSize: 11, color: "#aaa", marginTop: 1 },
  empty: { padding: "48px", textAlign: "center", color: "#555", fontSize: 14, background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12 },
};
