"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

type Position = {
  id: string;
  symbol: string;
  order_type: "buy" | "sell";
  quantity: number;
  entry_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  leverage: number;
  margin_used: number;
  opened_at: string;
};

type Portfolio = {
  cash_balance: number;
  realized_pnl: number;
  trades_count: number;
  wins_count: number;
};

type PriceMap = Record<string, number>;

const FOREX_PAIRS = [
  { symbol: "EURUSD", label: "EUR/USD", base: 1.0856, pip: 0.0001, spread: 0.0002, digits: 4 },
  { symbol: "GBPUSD", label: "GBP/USD", base: 1.2734, pip: 0.0001, spread: 0.0003, digits: 4 },
  { symbol: "USDJPY", label: "USD/JPY", base: 149.82, pip: 0.01, spread: 0.02, digits: 2 },
  { symbol: "USDCHF", label: "USD/CHF", base: 0.8923, pip: 0.0001, spread: 0.0002, digits: 4 },
  { symbol: "AUDUSD", label: "AUD/USD", base: 0.6512, pip: 0.0001, spread: 0.0003, digits: 4 },
  { symbol: "USDINR", label: "USD/INR", base: 83.24, pip: 0.01, spread: 0.05, digits: 2 },
];

const LEVERAGE_OPTIONS = [1, 2, 5, 10, 20, 50];
const INITIAL_CASH = 100000;

export default function ForexPaperTrader({
  embedded = false,
  defaultSymbol = "EURUSD",
}: {
  embedded?: boolean;
  defaultSymbol?: string;
}) {
  const [prices, setPrices] = useState<PriceMap>(() =>
    Object.fromEntries(FOREX_PAIRS.map((pair) => [pair.symbol, pair.base])),
  );
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [userId, setUserId] = useState("");
  const [portfolioId, setPortfolioId] = useState("");
  const [selectedPair, setSelectedPair] = useState(defaultSymbol);
  const [leverage, setLeverage] = useState(1);
  const [quantity, setQuantity] = useState(1000);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [closing, setClosing] = useState<string | null>(null);
  const [tradeLog, setTradeLog] = useState<{ text: string; pnl?: number; time: string }[]>([]);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const latestPrices = useRef<PriceMap>(prices);

  const currentPair = FOREX_PAIRS.find((pair) => pair.symbol === selectedPair) || FOREX_PAIRS[0];

  useEffect(() => {
    latestPrices.current = prices;
  }, [prices]);

  useEffect(() => {
    setPriceHistory(
      Array.from({ length: 40 }, () => currentPair.base + (Math.random() - 0.5) * currentPair.pip * 20),
    );
  }, [currentPair.base, currentPair.pip, selectedPair]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPrices((previous) => {
        const next = { ...previous };
        FOREX_PAIRS.forEach((pair) => {
          const drift = (Math.random() - 0.499) * pair.pip * 3;
          const raw = (previous[pair.symbol] || pair.base) + drift;
          next[pair.symbol] = Math.max(Number(raw.toFixed(pair.digits)), pair.base * 0.9);
        });
        latestPrices.current = next;
        return next;
      });

      setPriceHistory((previous) => {
        const base = latestPrices.current[selectedPair] || currentPair.base;
        const nextPrice = base + (Math.random() - 0.499) * currentPair.pip * 3;
        return [...previous.slice(-49), nextPrice];
      });
    }, 1500);

    return () => window.clearInterval(interval);
  }, [currentPair.base, currentPair.pip, selectedPair]);

  const loadPortfolio = useCallback(async (id = portfolioId) => {
    if (!id) return;

    const [{ data: port }, { data: orders }] = await Promise.all([
      supabase.from("paper_portfolios" as never).select("*").eq("id", id).single(),
      supabase.from("paper_orders" as never).select("*").eq("portfolio_id", id).eq("status", "open"),
    ]);

    if (port) setPortfolio(port as Portfolio);
    if (orders) setPositions(orders as Position[]);
  }, [portfolioId]);

  const loadUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);
    const { data: id } = await supabase.rpc("init_paper_portfolio" as never, {
      p_user_id: user.id,
      p_market_type: "forex",
    } as never);

    if (typeof id === "string") {
      setPortfolioId(id);
      await loadPortfolio(id);
    }
    setLoading(false);
  }, [loadPortfolio]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const getPair = (symbol: string) => FOREX_PAIRS.find((pair) => pair.symbol === symbol) || currentPair;

  const getAskPrice = (symbol: string) => {
    const pair = getPair(symbol);
    return Number(((prices[symbol] || pair.base) + pair.spread / 2).toFixed(pair.digits));
  };

  const getBidPrice = (symbol: string) => {
    const pair = getPair(symbol);
    return Number(((prices[symbol] || pair.base) - pair.spread / 2).toFixed(pair.digits));
  };

  const getPositionPnl = (position: Position) => {
    const currentPrice = position.order_type === "buy" ? getBidPrice(position.symbol) : getAskPrice(position.symbol);
    const diff = position.order_type === "buy" ? currentPrice - position.entry_price : position.entry_price - currentPrice;
    return Number((diff * position.quantity).toFixed(2));
  };

  const addLog = (text: string, pnl?: number) => {
    setTradeLog((previous) => [{ text, pnl, time: new Date().toLocaleTimeString() }, ...previous.slice(0, 19)]);
  };

  const placeOrder = async (type: "buy" | "sell") => {
    if (!portfolioId || !userId || placing) return;
    setPlacing(true);

    const price = type === "buy" ? getAskPrice(selectedPair) : getBidPrice(selectedPair);
    const marginUsed = (price * quantity) / leverage;

    if (marginUsed > (portfolio?.cash_balance || 0)) {
      addLog(`Insufficient margin for ${type.toUpperCase()} ${quantity} ${selectedPair}`);
      setPlacing(false);
      return;
    }

    const { error } = await supabase.from("paper_orders" as never).insert({
      portfolio_id: portfolioId,
      symbol: selectedPair,
      order_type: type,
      quantity,
      entry_price: price,
      stop_loss: stopLoss ? Number.parseFloat(stopLoss) : null,
      take_profit: takeProfit ? Number.parseFloat(takeProfit) : null,
      leverage,
      margin_used: Number(marginUsed.toFixed(2)),
      lesson_context: "Manual forex trade",
    } as never);

    if (error) {
      addLog("Order failed. Please try again.");
    } else {
      await supabase
        .from("paper_portfolios" as never)
        .update({ cash_balance: (portfolio?.cash_balance || 0) - marginUsed } as never)
        .eq("id", portfolioId);
      addLog(`${type.toUpperCase()} ${quantity} ${selectedPair} @ ${formatRate(price, currentPair.digits)} (${leverage}x)`);
      await loadPortfolio();
    }

    setPlacing(false);
  };

  const closePosition = async (position: Position) => {
    setClosing(position.id);
    const exitPrice = position.order_type === "buy" ? getBidPrice(position.symbol) : getAskPrice(position.symbol);
    const { data } = await supabase.rpc("close_paper_trade" as never, {
      p_order_id: position.id,
      p_exit_price: exitPrice,
    } as never);

    const result = data as { success?: boolean; pnl?: number } | null;
    if (result?.success) {
      const pnl = Number(result.pnl || 0);
      addLog(`Closed ${position.order_type.toUpperCase()} ${position.quantity} ${position.symbol} @ ${exitPrice} | P&L: ${formatMoney(pnl)}`, pnl);
    }

    await loadPortfolio();
    setClosing(null);
  };

  const resetPortfolio = async () => {
    if (!window.confirm("Reset your portfolio to Rs. 1,00,000? This will close all open positions.")) return;

    for (const position of positions) {
      const exitPrice = position.order_type === "buy" ? getBidPrice(position.symbol) : getAskPrice(position.symbol);
      await supabase.rpc("close_paper_trade" as never, { p_order_id: position.id, p_exit_price: exitPrice } as never);
    }

    await supabase
      .from("paper_portfolios" as never)
      .update({
        cash_balance: INITIAL_CASH,
        total_pnl: 0,
        realized_pnl: 0,
        trades_count: 0,
        wins_count: 0,
      } as never)
      .eq("id", portfolioId);

    addLog("Portfolio reset to Rs. 1,00,000");
    await loadPortfolio();
  };

  const askPrice = getAskPrice(selectedPair);
  const bidPrice = getBidPrice(selectedPair);
  const totalFloatPnl = positions.reduce((sum, position) => sum + getPositionPnl(position), 0);
  const totalEquity = (portfolio?.cash_balance || 0) + totalFloatPnl;
  const winRate = portfolio?.trades_count ? Math.round((portfolio.wins_count / portfolio.trades_count) * 100) : 0;
  const marginRequired = (askPrice * quantity) / leverage;

  const chart = useMemo(() => {
    const min = Math.min(...priceHistory) * 0.9998;
    const max = Math.max(...priceHistory) * 1.0002;
    const range = max - min || 0.001;
    const points = priceHistory.map((value, index) => `${(index / Math.max(priceHistory.length - 1, 1)) * 400},${80 - ((value - min) / range) * 70}`);
    const line = `M ${points.join(" L ")}`;
    return { line, area: `${line} L 400,80 L 0,80 Z` };
  }, [priceHistory]);

  return (
    <div style={{ ...s.wrap, ...(embedded ? s.wrapEmbedded : {}) }}>
      <div style={s.header}>
        <div>
          <div style={s.titleRow}>
            <span style={s.headerIcon}>FX</span>
            <h2 style={s.title}>{embedded ? "Live Forex Practice" : "Forex Paper Trading"}</h2>
            <div style={s.liveIndicator}>
              <span style={s.liveDot} />
              <span style={s.liveText}>LIVE SIM</span>
            </div>
          </div>
          {embedded && <p style={s.embeddedSub}>Practice with Rs. 1,00,000 fake money. No real money involved.</p>}
        </div>
        <button onClick={resetPortfolio} style={s.resetBtn} type="button">
          Reset
        </button>
      </div>

      {loading ? (
        <div style={s.loading}>Loading forex simulator...</div>
      ) : !userId ? (
        <div style={s.loading}>Log in to save your forex paper trading portfolio.</div>
      ) : (
        <div style={s.layout}>
          <div style={s.leftPanel}>
            <div style={s.pairTabs}>
              {FOREX_PAIRS.map((pair) => (
                <button
                  key={pair.symbol}
                  onClick={() => setSelectedPair(pair.symbol)}
                  style={{ ...s.pairTab, ...(selectedPair === pair.symbol ? s.pairTabActive : {}) }}
                  type="button"
                >
                  {pair.label}
                </button>
              ))}
            </div>

            <div style={s.priceCard}>
              <div style={s.pairLabel}>{currentPair.label}</div>
              <div style={s.priceRow}>
                <PriceBlock label="Bid" value={formatRate(bidPrice, currentPair.digits)} color="#B91C1C" />
                <div style={s.spread}>Spread: {(currentPair.spread / currentPair.pip).toFixed(0)} pips</div>
                <PriceBlock label="Ask" value={formatRate(askPrice, currentPair.digits)} color="#1D9E75" />
              </div>
            </div>

            <div style={s.chartWrap}>
              <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="forexChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1D9E75" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {priceHistory.length > 1 && (
                  <>
                    <path d={chart.area} fill="url(#forexChartGrad)" />
                    <path d={chart.line} fill="none" stroke="#1D9E75" strokeWidth="2" />
                  </>
                )}
              </svg>
            </div>

            <div style={s.orderPanel}>
              <div style={s.orderTitle}>Place Order</div>
              <div style={s.orderRow}>
                <Field label="Quantity (units)">
                  <input type="number" value={quantity} min={100} step={100} onChange={(event) => setQuantity(Number(event.target.value))} style={s.orderInput} />
                </Field>
                <Field label="Leverage">
                  <select value={leverage} onChange={(event) => setLeverage(Number(event.target.value))} style={s.orderSelect}>
                    {LEVERAGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}x
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div style={s.orderRow}>
                <Field label="Stop Loss">
                  <input type="number" value={stopLoss} placeholder="Optional" onChange={(event) => setStopLoss(event.target.value)} style={s.orderInput} step={currentPair.pip} />
                </Field>
                <Field label="Take Profit">
                  <input type="number" value={takeProfit} placeholder="Optional" onChange={(event) => setTakeProfit(event.target.value)} style={s.orderInput} step={currentPair.pip} />
                </Field>
              </div>
              <div style={s.marginInfo}>Margin required: {formatMoney(marginRequired)}</div>
              <div style={s.orderBtns}>
                <button onClick={() => placeOrder("buy")} disabled={placing} style={{ ...s.buyBtn, opacity: placing ? 0.7 : 1 }} type="button">
                  BUY {formatRate(askPrice, currentPair.digits)}
                </button>
                <button onClick={() => placeOrder("sell")} disabled={placing} style={{ ...s.sellBtn, opacity: placing ? 0.7 : 1 }} type="button">
                  SELL {formatRate(bidPrice, currentPair.digits)}
                </button>
              </div>
            </div>

            <div style={s.riskWarning}>Paper trading only. No real money is involved. This simulator is for education and practice.</div>
          </div>

          <div style={s.rightPanel}>
            <div style={s.portfolioCard}>
              <div style={s.portfolioTitle}>Portfolio</div>
              <div style={s.portfolioGrid}>
                <PortfolioStat label="Cash balance" value={formatMoney(portfolio?.cash_balance || 0)} />
                <PortfolioStat label="Float P&L" value={formatMoney(totalFloatPnl)} color={totalFloatPnl >= 0 ? "#1D9E75" : "#B91C1C"} />
                <PortfolioStat label="Total equity" value={formatMoney(totalEquity)} color={totalEquity >= INITIAL_CASH ? "#1D9E75" : "#B91C1C"} />
                <PortfolioStat label="Realized P&L" value={formatMoney(portfolio?.realized_pnl || 0)} color={(portfolio?.realized_pnl || 0) >= 0 ? "#1D9E75" : "#B91C1C"} />
                <PortfolioStat label="Total trades" value={`${portfolio?.trades_count || 0}`} />
                <PortfolioStat label="Win rate" value={`${winRate}%`} color={winRate >= 50 ? "#1D9E75" : "#B91C1C"} />
              </div>
            </div>

            <div style={s.positionsCard}>
              <div style={s.positionsTitle}>Open Positions ({positions.length})</div>
              {positions.length === 0 ? (
                <div style={s.noPositions}>No open positions. Place your first trade.</div>
              ) : (
                positions.map((position) => <PositionRow key={position.id} position={position} pnl={getPositionPnl(position)} closing={closing === position.id} onClose={() => closePosition(position)} getLivePrice={() => (position.order_type === "buy" ? getBidPrice(position.symbol) : getAskPrice(position.symbol))} />)
              )}
            </div>

            {tradeLog.length > 0 && (
              <div style={s.logCard}>
                <div style={s.logTitle}>Trade Log</div>
                {tradeLog.slice(0, 8).map((entry, index) => (
                  <div key={`${entry.time}-${index}`} style={s.logEntry}>
                    <span style={{ color: entry.pnl !== undefined ? (entry.pnl >= 0 ? "#1D9E75" : "#B91C1C") : "#888" }}>{entry.text}</span>
                    <span style={s.logTime}>{entry.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={s.orderField}>
      <label style={s.orderLabel}>{label}</label>
      {children}
    </div>
  );
}

function PriceBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={s.priceBlock}>
      <div style={s.priceLabel}>{label}</div>
      <div style={{ ...s.priceNum, color }}>{value}</div>
    </div>
  );
}

function PortfolioStat({ label, value, color = "#0a0a0a" }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={s.portfolioStatLabel}>{label}</div>
      <div style={{ ...s.portfolioStatVal, color }}>{value}</div>
    </div>
  );
}

function PositionRow({
  position,
  pnl,
  closing,
  onClose,
  getLivePrice,
}: {
  position: Position;
  pnl: number;
  closing: boolean;
  onClose: () => void;
  getLivePrice: () => number;
}) {
  const pair = FOREX_PAIRS.find((item) => item.symbol === position.symbol) || FOREX_PAIRS[0];
  return (
    <div style={s.positionRow}>
      <div>
        <div style={s.posSymbol}>
          <span style={{ ...s.posType, color: position.order_type === "buy" ? "#1D9E75" : "#B91C1C" }}>{position.order_type.toUpperCase()}</span>
          {position.symbol}
        </div>
        <div style={s.posDetail}>
          {position.quantity.toLocaleString()} units @ {formatRate(position.entry_price, pair.digits)} / {position.leverage}x
        </div>
        <div style={s.posDetail}>
          Live: {formatRate(getLivePrice(), pair.digits)}
          {position.stop_loss ? ` / SL: ${position.stop_loss}` : ""}
          {position.take_profit ? ` / TP: ${position.take_profit}` : ""}
        </div>
      </div>
      <div style={s.posRight}>
        <div style={{ ...s.posPnl, color: pnl >= 0 ? "#1D9E75" : "#B91C1C" }}>{formatMoney(pnl)}</div>
        <button onClick={onClose} disabled={closing} style={s.closeBtn} type="button">
          {closing ? "..." : "Close"}
        </button>
      </div>
    </div>
  );
}

function formatRate(value: number, digits: number) {
  return value.toFixed(digits);
}

function formatMoney(amount: number) {
  const sign = amount > 0 ? "+" : "";
  return `${sign}Rs. ${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

const s: Record<string, CSSProperties> = {
  wrap: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 16, overflow: "hidden", fontFamily: "system-ui,-apple-system,sans-serif" },
  wrapEmbedded: { borderRadius: 12 },
  loading: { padding: 36, textAlign: "center", color: "#888", fontSize: 13 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 20px 12px", borderBottom: "0.5px solid #eee", background: "#0a0a0a" },
  titleRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 2 },
  headerIcon: { fontSize: 11, color: "#fff", background: "#1D9E75", borderRadius: 7, padding: "5px 7px", fontWeight: 800 },
  title: { fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 },
  liveIndicator: { display: "flex", alignItems: "center", gap: 5 },
  liveDot: { width: 7, height: 7, background: "#1D9E75", borderRadius: "50%" },
  liveText: { fontSize: 9, fontWeight: 700, color: "#1D9E75", letterSpacing: ".1em" },
  embeddedSub: { fontSize: 11, color: "#888", margin: 0 },
  resetBtn: { padding: "5px 12px", fontSize: 11, border: "0.5px solid #333", borderRadius: 8, background: "transparent", color: "#888", cursor: "pointer", fontFamily: "system-ui" },
  layout: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", minHeight: 500 },
  leftPanel: { padding: 14, borderRight: "0.5px solid #eee" },
  pairTabs: { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 },
  pairTab: { padding: "5px 10px", fontSize: 11, fontWeight: 500, border: "0.5px solid #ddd", borderRadius: 8, background: "#fafafa", color: "#666", cursor: "pointer", fontFamily: "system-ui" },
  pairTabActive: { background: "#0a0a0a", color: "#fff", border: "0.5px solid #0a0a0a" },
  priceCard: { background: "#fafafa", borderRadius: 10, padding: 12, marginBottom: 10 },
  pairLabel: { fontSize: 11, color: "#888", marginBottom: 6, fontWeight: 600 },
  priceRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  priceBlock: { textAlign: "center" },
  priceLabel: { fontSize: 9, fontWeight: 700, color: "#aaa", letterSpacing: ".08em", marginBottom: 3, textTransform: "uppercase" },
  priceNum: { fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", fontFamily: "monospace" },
  spread: { fontSize: 10, color: "#aaa", textAlign: "center" },
  chartWrap: { background: "#fafafa", borderRadius: 8, marginBottom: 12, overflow: "hidden", height: 80 },
  orderPanel: { marginBottom: 10 },
  orderTitle: { fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 8 },
  orderRow: { display: "flex", gap: 8, marginBottom: 8 },
  orderField: { flex: 1 },
  orderLabel: { fontSize: 10, color: "#888", display: "block", marginBottom: 4 },
  orderInput: { width: "100%", padding: "7px 9px", fontSize: 12, border: "0.5px solid #ddd", borderRadius: 7, outline: "none", fontFamily: "monospace", boxSizing: "border-box" },
  orderSelect: { width: "100%", padding: "7px 9px", fontSize: 12, border: "0.5px solid #ddd", borderRadius: 7, outline: "none", fontFamily: "system-ui", background: "#fff" },
  marginInfo: { fontSize: 11, color: "#888", marginBottom: 8, textAlign: "center" },
  orderBtns: { display: "flex", gap: 8 },
  buyBtn: { flex: 1, padding: 11, fontSize: 13, fontWeight: 700, border: "none", borderRadius: 9, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "monospace" },
  sellBtn: { flex: 1, padding: 11, fontSize: 13, fontWeight: 700, border: "none", borderRadius: 9, background: "#B91C1C", color: "#fff", cursor: "pointer", fontFamily: "monospace" },
  riskWarning: { fontSize: 10, color: "#888", background: "#fafafa", borderRadius: 7, padding: "8px 10px", lineHeight: 1.5, marginTop: 8 },
  rightPanel: { padding: 14, display: "flex", flexDirection: "column", gap: 12 },
  portfolioCard: { background: "#fafafa", borderRadius: 10, padding: 12 },
  portfolioTitle: { fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 },
  portfolioGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  portfolioStatLabel: { fontSize: 9, color: "#888", marginBottom: 3 },
  portfolioStatVal: { fontSize: 14, fontWeight: 700, letterSpacing: "-0.3px", fontFamily: "monospace" },
  positionsCard: { flex: 1 },
  positionsTitle: { fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 8 },
  noPositions: { fontSize: 12, color: "#888", textAlign: "center", padding: "20px 0", border: "1.5px dashed #eee", borderRadius: 9 },
  positionRow: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafafa", borderRadius: 9, padding: "9px 12px", marginBottom: 6, gap: 12 },
  posSymbol: { fontSize: 13, fontWeight: 700, color: "#0a0a0a", display: "flex", alignItems: "center", gap: 6, marginBottom: 3 },
  posType: { fontSize: 10, fontWeight: 800 },
  posDetail: { fontSize: 10, color: "#888" },
  posRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 },
  posPnl: { fontSize: 14, fontWeight: 700, fontFamily: "monospace", letterSpacing: "-0.3px" },
  closeBtn: { padding: "4px 10px", fontSize: 10, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 7, background: "#fff", color: "#555", cursor: "pointer", fontFamily: "system-ui" },
  logCard: { background: "#0a0a0a", borderRadius: 10, padding: "10px 12px" },
  logTitle: { fontSize: 10, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 },
  logEntry: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, marginBottom: 5, lineHeight: 1.5, gap: 8 },
  logTime: { color: "#555", flexShrink: 0, fontFamily: "monospace" },
};
