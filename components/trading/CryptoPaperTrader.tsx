"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

type CryptoHolding = {
  symbol: string;
  quantity: number;
  avgPrice: number;
};

type Order = {
  id: string;
  symbol: string;
  order_type: "buy" | "sell";
  quantity: number;
  entry_price: number;
  pnl: number | null;
  status: string;
  opened_at: string;
};

type Portfolio = {
  cash_balance: number;
  realized_pnl: number;
  trades_count: number;
  wins_count: number;
};

type PriceMap = Record<string, number>;

const CRYPTO_ASSETS = [
  { symbol: "BTCUSDT", label: "Bitcoin", short: "BTC", base: 67500, mark: "BTC", color: "#F7931A" },
  { symbol: "ETHUSDT", label: "Ethereum", short: "ETH", base: 3420, mark: "ETH", color: "#627EEA" },
  { symbol: "SOLUSDT", label: "Solana", short: "SOL", base: 178, mark: "SOL", color: "#9945FF" },
  { symbol: "BNBUSDT", label: "BNB", short: "BNB", base: 595, mark: "BNB", color: "#F3BA2F" },
  { symbol: "ADAUSDT", label: "Cardano", short: "ADA", base: 0.45, mark: "ADA", color: "#0033AD" },
  { symbol: "MATICUSDT", label: "Polygon", short: "MATIC", base: 0.89, mark: "POL", color: "#8247E5" },
];

export default function CryptoPaperTrader({ embedded = false }: { embedded?: boolean }) {
  const [prices, setPrices] = useState<PriceMap>(() => Object.fromEntries(CRYPTO_ASSETS.map((asset) => [asset.symbol, asset.base])));
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [portfolioId, setPortfolioId] = useState("");
  const [userId, setUserId] = useState("");
  const [selected, setSelected] = useState("BTCUSDT");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [activeTab, setActiveTab] = useState<"trade" | "portfolio" | "history">("trade");
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});
  const latestPrices = useRef<PriceMap>(prices);

  const currentAsset = CRYPTO_ASSETS.find((asset) => asset.symbol === selected) || CRYPTO_ASSETS[0];

  useEffect(() => {
    latestPrices.current = prices;
  }, [prices]);

  useEffect(() => {
    const initialHistory: Record<string, number[]> = {};
    CRYPTO_ASSETS.forEach((asset) => {
      initialHistory[asset.symbol] = Array.from({ length: 30 }, () => asset.base * (1 + (Math.random() - 0.5) * 0.02));
    });
    setPriceHistory(initialHistory);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPrices((previous) => {
        const next = { ...previous };
        const changes: Record<string, number> = {};
        CRYPTO_ASSETS.forEach((asset) => {
          const previousPrice = previous[asset.symbol] || asset.base;
          const volatility = asset.base > 10000 ? 0.002 : asset.base > 100 ? 0.003 : 0.005;
          const drift = (Math.random() - 0.498) * asset.base * volatility;
          const nextPrice = Math.max(previousPrice + drift, asset.base * 0.5);
          changes[asset.symbol] = ((nextPrice - previousPrice) / previousPrice) * 100;
          next[asset.symbol] = Number(nextPrice.toFixed(nextPrice > 100 ? 2 : 4));
        });
        latestPrices.current = next;
        setPriceChanges(changes);
        return next;
      });

      setPriceHistory((previous) => {
        const next = { ...previous };
        CRYPTO_ASSETS.forEach((asset) => {
          const last = (previous[asset.symbol] || [asset.base]).slice(-1)[0];
          const drift = (Math.random() - 0.498) * last * 0.003;
          next[asset.symbol] = [...(previous[asset.symbol] || []).slice(-29), Number((last + drift).toFixed(2))];
        });
        return next;
      });
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  const loadPortfolio = useCallback(async (id = portfolioId) => {
    if (!id) return;

    const [{ data: port }, { data: orders }] = await Promise.all([
      supabase.from("paper_portfolios" as never).select("*").eq("id", id).single(),
      supabase.from("paper_orders" as never).select("*").eq("portfolio_id", id).order("opened_at", { ascending: false }).limit(50),
    ]);

    if (port) setPortfolio(port as Portfolio);
    if (orders) {
      const typedOrders = orders as Order[];
      setRecentOrders(typedOrders);
      setHoldings(calculateHoldings(typedOrders));
    }
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
      p_market_type: "crypto",
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

  const buyAsset = async () => {
    const spendAmount = Number.parseFloat(amount);
    if (!spendAmount || spendAmount <= 0 || !portfolioId || placing) return;
    if (spendAmount > (portfolio?.cash_balance || 0)) {
      window.alert("Insufficient balance");
      return;
    }

    setPlacing(true);
    const price = prices[selected] || currentAsset.base;
    const quantity = Number((spendAmount / price).toFixed(8));

    const { error } = await supabase.from("paper_orders" as never).insert({
      portfolio_id: portfolioId,
      symbol: selected,
      order_type: "buy",
      quantity,
      entry_price: price,
      leverage: 1,
      margin_used: spendAmount,
      lesson_context: "Crypto buy",
    } as never);

    if (!error) {
      await supabase
        .from("paper_portfolios" as never)
        .update({ cash_balance: (portfolio?.cash_balance || 0) - spendAmount } as never)
        .eq("id", portfolioId);
      setAmount("");
    }

    await loadPortfolio();
    setPlacing(false);
  };

  const sellHolding = async (holding: CryptoHolding, sellPct: number) => {
    if (!portfolioId || placing) return;
    const sellQty = holding.quantity * (sellPct / 100);
    const price = prices[holding.symbol] || holding.avgPrice;

    setPlacing(true);
    const { data: openOrders } = await supabase
      .from("paper_orders" as never)
      .select("*")
      .eq("portfolio_id", portfolioId)
      .eq("symbol", holding.symbol)
      .eq("status", "open")
      .eq("order_type", "buy")
      .order("opened_at");

    let remainingQty = sellQty;
    for (const order of (openOrders || []) as Order[]) {
      if (remainingQty <= 0) break;
      const closeQty = Math.min(order.quantity, remainingQty);
      const pnl = (price - order.entry_price) * closeQty;

      if (closeQty >= order.quantity) {
        await supabase.rpc("close_paper_trade" as never, { p_order_id: order.id, p_exit_price: price } as never);
      } else {
        await supabase.from("paper_orders" as never).update({ quantity: order.quantity - closeQty } as never).eq("id", order.id);
        await supabase.from("paper_orders" as never).insert({
          portfolio_id: portfolioId,
          symbol: holding.symbol,
          order_type: "sell",
          quantity: closeQty,
          entry_price: order.entry_price,
          exit_price: price,
          pnl: Number(pnl.toFixed(2)),
          status: "closed",
          leverage: 1,
          margin_used: 0,
        } as never);
        await supabase
          .from("paper_portfolios" as never)
          .update({
            cash_balance: (portfolio?.cash_balance || 0) + closeQty * price,
            realized_pnl: (portfolio?.realized_pnl || 0) + pnl,
            trades_count: (portfolio?.trades_count || 0) + 1,
            wins_count: (portfolio?.wins_count || 0) + (pnl > 0 ? 1 : 0),
          } as never)
          .eq("id", portfolioId);
      }

      remainingQty -= closeQty;
    }

    await loadPortfolio();
    setPlacing(false);
  };

  const getHoldingValue = (holding: CryptoHolding) => holding.quantity * (prices[holding.symbol] || 0);
  const getHoldingPnl = (holding: CryptoHolding) => ((prices[holding.symbol] || 0) - holding.avgPrice) * holding.quantity;
  const getHoldingPnlPct = (holding: CryptoHolding) => (holding.avgPrice > 0 ? (((prices[holding.symbol] || 0) - holding.avgPrice) / holding.avgPrice) * 100 : 0);

  const totalCryptoValue = holdings.reduce((sum, holding) => sum + getHoldingValue(holding), 0);
  const totalUnrealizedPnl = holdings.reduce((sum, holding) => sum + getHoldingPnl(holding), 0);
  const totalPortfolioValue = (portfolio?.cash_balance || 0) + totalCryptoValue;
  const winRate = portfolio?.trades_count ? Math.round(((portfolio.wins_count || 0) / portfolio.trades_count) * 100) : 0;
  const currentHolding = holdings.find((holding) => holding.symbol === selected);
  const rawChartData = priceHistory[selected];
  const chartData = useMemo(() => rawChartData || [], [rawChartData]);
  const isUp = chartData.length > 1 && chartData[chartData.length - 1] >= chartData[0];
  const chart = useMemo(() => buildChart(chartData), [chartData]);

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <div style={s.titleRow}>
            <span style={s.headerMark}>CRYPTO</span>
            <h2 style={s.title}>{embedded ? "Crypto Practice Terminal" : "Crypto Paper Trading"}</h2>
            <div style={s.live}>
              <span style={s.liveDot} />
              LIVE
            </div>
          </div>
          {!loading && (
            <div style={s.equity}>
              Portfolio: <strong>{formatMoney(totalPortfolioValue)}</strong>
            </div>
          )}
        </div>
        <div style={s.portfolioMini}>
          <MiniStat label="Cash" value={formatMoney(portfolio?.cash_balance || 0)} />
          <MiniStat label="Crypto value" value={formatMoney(totalCryptoValue)} />
          <MiniStat label="Unrealized P&L" value={formatMoney(totalUnrealizedPnl)} color={totalUnrealizedPnl >= 0 ? "#1D9E75" : "#B91C1C"} />
        </div>
      </div>

      {loading ? (
        <div style={s.empty}>Loading crypto simulator...</div>
      ) : !userId ? (
        <div style={s.empty}>Log in to save your crypto paper trading portfolio.</div>
      ) : (
        <>
          <div style={s.tickerBar}>
            {CRYPTO_ASSETS.map((asset) => {
              const price = prices[asset.symbol] || asset.base;
              const change = priceChanges[asset.symbol] || 0;
              const positive = change >= 0;
              return (
                <button key={asset.symbol} onClick={() => setSelected(asset.symbol)} style={{ ...s.tickerItem, ...(selected === asset.symbol ? s.tickerItemActive : {}), borderColor: selected === asset.symbol ? asset.color : "transparent" }} type="button">
                  <div style={{ ...s.tickerIcon, color: asset.color }}>{asset.mark}</div>
                  <div>
                    <div style={s.tickerSymbol}>{asset.short}</div>
                    <div style={s.tickerPrice}>{formatMoney(price)}</div>
                  </div>
                  <div style={{ ...s.tickerChange, color: positive ? "#1D9E75" : "#B91C1C" }}>
                    {positive ? "UP" : "DN"} {Math.abs(change).toFixed(2)}%
                  </div>
                </button>
              );
            })}
          </div>

          <div style={s.tabs}>
            {(["trade", "portfolio", "history"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }} type="button">
                {tab === "trade" ? "Trade" : tab === "portfolio" ? "Portfolio" : "History"}
              </button>
            ))}
          </div>

          {activeTab === "trade" && (
            <div style={s.tradeLayout}>
              <div style={s.chartSide}>
                <div style={s.assetInfo}>
                  <div style={{ ...s.assetIconLg, color: currentAsset.color }}>{currentAsset.mark}</div>
                  <div>
                    <div style={s.assetName}>{currentAsset.label}</div>
                    <div style={{ ...s.assetPrice, color: currentAsset.color }}>{formatMoney(prices[selected] || currentAsset.base)}</div>
                  </div>
                  <div style={{ ...s.change24h, color: isUp ? "#1D9E75" : "#B91C1C", background: isUp ? "#E1F5EE" : "#FEF2F2" }}>
                    {isUp ? "UP" : "DN"} {Math.abs(priceChanges[selected] || 0).toFixed(3)}%
                  </div>
                </div>

                <div style={{ ...s.chartWrap, borderColor: isUp ? "#1D9E75" : "#B91C1C" }}>
                  <svg width="100%" height="100" viewBox="0 0 300 100" preserveAspectRatio="none">
                    {chartData.length > 1 && (
                      <>
                        <path d={chart.area} fill={isUp ? "rgba(29,158,117,0.12)" : "rgba(185,28,28,0.12)"} />
                        <path d={chart.line} fill="none" stroke={isUp ? "#1D9E75" : "#B91C1C"} strokeWidth="2" />
                      </>
                    )}
                  </svg>
                </div>

                <div style={s.statsGrid}>
                  <StatItem label="Your holdings" value={`${currentHolding?.quantity.toFixed(6) || "0"} ${currentAsset.short}`} />
                  <StatItem label="Holdings value" value={formatMoney(currentHolding ? getHoldingValue(currentHolding) : 0)} />
                </div>
              </div>

              <div style={s.orderSide}>
                <div style={s.orderCard}>
                  <div style={s.orderTitle}>Buy / Sell {currentAsset.short}</div>
                  <div style={s.amountRow}>
                    <span style={s.amountCurr}>Rs.</span>
                    <input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Enter amount" style={s.amountInput} />
                  </div>
                  <div style={s.quickAmounts}>
                    {[1000, 5000, 10000, 25000].map((value) => (
                      <button key={value} onClick={() => setAmount(String(value))} style={s.quickBtn} type="button">
                        {value >= 1000 ? `${value / 1000}K` : value}
                      </button>
                    ))}
                    <button onClick={() => setAmount(String(Math.floor(portfolio?.cash_balance || 0)))} style={s.quickBtn} type="button">
                      MAX
                    </button>
                  </div>
                  {amount && (
                    <div style={s.willGet}>
                      You will get: <strong>{(Number.parseFloat(amount) / (prices[selected] || currentAsset.base)).toFixed(6)} {currentAsset.short}</strong>
                    </div>
                  )}
                  <div style={s.balanceRow}>Available: {formatMoney(portfolio?.cash_balance || 0)}</div>
                  <button onClick={buyAsset} disabled={placing || !amount} style={{ ...s.buyBtn, background: currentAsset.color, opacity: placing || !amount ? 0.6 : 1 }} type="button">
                    {placing ? "Processing..." : `Buy ${currentAsset.short}`}
                  </button>

                  {currentHolding && (
                    <div style={s.sellSection}>
                      <div style={s.sellTitle}>Sell {currentAsset.short}</div>
                      <div style={s.sellInfo}>
                        Holding: {currentHolding.quantity.toFixed(6)} / Avg: {formatMoney(currentHolding.avgPrice)} / P&L:{" "}
                        <span style={{ color: getHoldingPnl(currentHolding) >= 0 ? "#1D9E75" : "#B91C1C" }}>
                          {formatMoney(getHoldingPnl(currentHolding))} ({getHoldingPnlPct(currentHolding).toFixed(2)}%)
                        </span>
                      </div>
                      <div style={s.sellBtns}>
                        {[25, 50, 75, 100].map((pct) => (
                          <button key={pct} onClick={() => sellHolding(currentHolding, pct)} disabled={placing} style={s.sellPctBtn} type="button">
                            Sell {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div style={s.riskNote}>Paper trading simulator. No real money involved. Crypto markets are highly volatile.</div>
              </div>
            </div>
          )}

          {activeTab === "portfolio" && (
            <div style={s.portfolioTab}>
              <div style={s.portfolioSummary}>
                <SummaryCard label="Total equity" value={formatMoney(totalPortfolioValue)} />
                <SummaryCard label="Cash" value={formatMoney(portfolio?.cash_balance || 0)} color="#185FA5" />
                <SummaryCard label="Crypto value" value={formatMoney(totalCryptoValue)} color="#854F0B" />
                <SummaryCard label="Realized P&L" value={formatMoney(portfolio?.realized_pnl || 0)} color={(portfolio?.realized_pnl || 0) >= 0 ? "#1D9E75" : "#B91C1C"} />
                <SummaryCard label="Unrealized P&L" value={formatMoney(totalUnrealizedPnl)} color={totalUnrealizedPnl >= 0 ? "#1D9E75" : "#B91C1C"} />
                <SummaryCard label="Win rate" value={`${winRate}%`} color={winRate >= 50 ? "#1D9E75" : "#B91C1C"} />
              </div>

              <div style={s.holdingsTitle}>Your holdings</div>
              {holdings.length === 0 ? (
                <div style={s.empty}>No holdings yet. Buy some crypto to start your portfolio.</div>
              ) : (
                holdings.map((holding) => {
                  const asset = CRYPTO_ASSETS.find((item) => item.symbol === holding.symbol) || CRYPTO_ASSETS[0];
                  const pnl = getHoldingPnl(holding);
                  return (
                    <div key={holding.symbol} style={s.holdingRow}>
                      <div style={{ ...s.holdingIcon, color: asset.color }}>{asset.mark}</div>
                      <div style={s.holdingInfo}>
                        <div style={s.holdingName}>{asset.label}</div>
                        <div style={s.holdingQty}>{holding.quantity.toFixed(6)} {asset.short} / Avg: {formatMoney(holding.avgPrice)}</div>
                      </div>
                      <div style={s.holdingRight}>
                        <div style={s.holdingValue}>{formatMoney(getHoldingValue(holding))}</div>
                        <div style={{ ...s.holdingPnl, color: pnl >= 0 ? "#1D9E75" : "#B91C1C" }}>
                          {formatMoney(pnl)} ({getHoldingPnlPct(holding).toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div style={s.historyTab}>
              <div style={s.historyTitle}>Completed trades ({recentOrders.filter((order) => order.status === "closed").length})</div>
              {recentOrders.filter((order) => order.status === "closed").length === 0 ? (
                <div style={s.empty}>No completed trades yet.</div>
              ) : (
                recentOrders
                  .filter((order) => order.status === "closed")
                  .map((order) => {
                    const asset = CRYPTO_ASSETS.find((item) => item.symbol === order.symbol);
                    return (
                      <div key={order.id} style={s.historyRow}>
                        <div style={{ ...s.historyType, color: order.order_type === "buy" ? "#1D9E75" : "#B91C1C" }}>{order.order_type.toUpperCase()}</div>
                        <div style={s.historyInfo}>
                          <div style={s.historyAsset}>{asset?.label || order.symbol}</div>
                          <div style={s.historyDetail}>{order.quantity.toFixed(6)} @ {formatMoney(order.entry_price)}</div>
                        </div>
                        <div style={{ ...s.historyPnl, color: (order.pnl || 0) >= 0 ? "#1D9E75" : "#B91C1C" }}>{formatMoney(order.pnl || 0)}</div>
                        <div style={s.historyTime}>{new Date(order.opened_at).toLocaleDateString()}</div>
                      </div>
                    );
                  })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function calculateHoldings(orders: Order[]) {
  const holdingMap: Record<string, CryptoHolding> = {};
  orders
    .filter((order) => order.status === "open" && order.order_type === "buy")
    .forEach((order) => {
      const previous = holdingMap[order.symbol] || { symbol: order.symbol, quantity: 0, avgPrice: 0 };
      const totalQty = previous.quantity + order.quantity;
      const totalCost = previous.quantity * previous.avgPrice + order.quantity * order.entry_price;
      holdingMap[order.symbol] = { symbol: order.symbol, quantity: totalQty, avgPrice: totalQty > 0 ? totalCost / totalQty : 0 };
    });
  return Object.values(holdingMap).filter((holding) => holding.quantity > 0);
}

function buildChart(values: number[]) {
  const min = Math.min(...values) * 0.998;
  const max = Math.max(...values) * 1.002;
  const range = max - min || 1;
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 300},${100 - ((value - min) / range) * 90}`);
  const line = `M ${points.join(" L ")}`;
  return { line, area: `${line} L 300,100 L 0,100 Z` };
}

function formatMoney(value: number) {
  const sign = value > 0 ? "+" : "";
  const abs = Math.abs(value);
  const formatted = abs > 1000 ? abs.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : abs > 1 ? abs.toFixed(2) : abs.toFixed(4);
  return `${sign}Rs. ${formatted}`;
}

function MiniStat({ label, value, color = "#ccc" }: { label: string; value: string; color?: string }) {
  return (
    <div style={s.miniStat}>
      <div style={s.miniLabel}>{label}</div>
      <div style={{ ...s.miniVal, color }}>{value}</div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={s.statItem}>
      <div style={s.statLabel}>{label}</div>
      <div style={s.statVal}>{value}</div>
    </div>
  );
}

function SummaryCard({ label, value, color = "#0a0a0a" }: { label: string; value: string; color?: string }) {
  return (
    <div style={s.sumCard}>
      <div style={s.sumLabel}>{label}</div>
      <div style={{ ...s.sumVal, color }}>{value}</div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  wrap: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 16, overflow: "hidden", fontFamily: "system-ui,-apple-system,sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "#0a0a0a", borderBottom: "0.5px solid #1a1a1a", flexWrap: "wrap", gap: 12 },
  titleRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 3 },
  headerMark: { fontSize: 10, fontWeight: 800, color: "#0a0a0a", background: "#F7931A", borderRadius: 7, padding: "5px 7px" },
  title: { fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 },
  live: { display: "flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 800, color: "#F7931A", letterSpacing: ".1em" },
  liveDot: { width: 6, height: 6, background: "#F7931A", borderRadius: "50%" },
  equity: { fontSize: 12, color: "#888" },
  portfolioMini: { display: "flex", gap: 16, flexWrap: "wrap" },
  miniStat: { textAlign: "right" },
  miniLabel: { fontSize: 9, color: "#555", marginBottom: 2 },
  miniVal: { fontSize: 12, fontWeight: 700, fontFamily: "monospace" },
  tickerBar: { display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto", background: "#111", borderBottom: "0.5px solid #1a1a1a" },
  tickerItem: { display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", border: "1.5px solid transparent", borderRadius: 9, background: "#1a1a1a", cursor: "pointer", flexShrink: 0, fontFamily: "system-ui" },
  tickerItemActive: { background: "#222" },
  tickerIcon: { fontSize: 10, fontWeight: 800, flexShrink: 0 },
  tickerSymbol: { fontSize: 11, fontWeight: 700, color: "#ccc" },
  tickerPrice: { fontSize: 11, fontWeight: 600, color: "#fff", fontFamily: "monospace" },
  tickerChange: { fontSize: 10, fontWeight: 600 },
  tabs: { display: "flex", gap: 0, padding: "0 16px", background: "#fafafa", borderBottom: "0.5px solid #eee" },
  tab: { padding: "10px 18px", fontSize: 12, fontWeight: 500, border: "none", borderBottom: "2px solid transparent", background: "transparent", color: "#888", cursor: "pointer", fontFamily: "system-ui", marginBottom: -1 },
  tabActive: { color: "#F7931A", borderBottomColor: "#F7931A", fontWeight: 600 },
  tradeLayout: { display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" },
  chartSide: { padding: 16, borderRight: "0.5px solid #eee" },
  assetInfo: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  assetIconLg: { fontSize: 13, fontWeight: 800, flexShrink: 0 },
  assetName: { fontSize: 12, color: "#888", marginBottom: 2 },
  assetPrice: { fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", fontFamily: "monospace" },
  change24h: { fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 20, marginLeft: "auto", flexShrink: 0 },
  chartWrap: { border: "0.5px solid", borderRadius: 10, overflow: "hidden", marginBottom: 12, height: 100 },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  statItem: { background: "#fafafa", borderRadius: 9, padding: "10px 12px" },
  statLabel: { fontSize: 10, color: "#aaa", marginBottom: 4 },
  statVal: { fontSize: 13, fontWeight: 700, color: "#0a0a0a", fontFamily: "monospace" },
  orderSide: { padding: 16 },
  orderCard: { background: "#fafafa", borderRadius: 12, padding: 14, marginBottom: 10 },
  orderTitle: { fontSize: 13, fontWeight: 600, color: "#0a0a0a", marginBottom: 12 },
  amountRow: { display: "flex", alignItems: "center", background: "#fff", border: "1.5px solid #1D9E75", borderRadius: 9, padding: "0 12px", marginBottom: 8 },
  amountCurr: { fontSize: 12, fontWeight: 700, color: "#1D9E75", marginRight: 6 },
  amountInput: { flex: 1, padding: "10px 0", fontSize: 16, border: "none", outline: "none", fontFamily: "monospace", background: "transparent" },
  quickAmounts: { display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 },
  quickBtn: { padding: "5px 9px", fontSize: 10, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 8, background: "#fff", color: "#555", cursor: "pointer", fontFamily: "system-ui" },
  willGet: { fontSize: 12, color: "#888", marginTop: 6 },
  balanceRow: { fontSize: 12, color: "#888", marginBottom: 12 },
  buyBtn: { width: "100%", padding: 12, fontSize: 14, fontWeight: 700, border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontFamily: "system-ui", marginBottom: 12 },
  sellSection: { borderTop: "0.5px solid #eee", paddingTop: 12 },
  sellTitle: { fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 },
  sellInfo: { fontSize: 11, color: "#888", marginBottom: 8, lineHeight: 1.6 },
  sellBtns: { display: "flex", gap: 5 },
  sellPctBtn: { flex: 1, padding: 7, fontSize: 11, fontWeight: 600, border: "0.5px solid #B91C1C", borderRadius: 7, background: "#FEF2F2", color: "#B91C1C", cursor: "pointer", fontFamily: "system-ui" },
  riskNote: { fontSize: 10, color: "#888", lineHeight: 1.5 },
  portfolioTab: { padding: 16 },
  portfolioSummary: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 },
  sumCard: { background: "#fafafa", borderRadius: 10, padding: 12 },
  sumLabel: { fontSize: 10, color: "#aaa", marginBottom: 4 },
  sumVal: { fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px", fontFamily: "monospace" },
  holdingsTitle: { fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 10 },
  holdingRow: { display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: "#fafafa", borderRadius: 10, marginBottom: 8 },
  holdingIcon: { fontSize: 12, fontWeight: 800, flexShrink: 0 },
  holdingInfo: { flex: 1 },
  holdingName: { fontSize: 13, fontWeight: 600, color: "#0a0a0a", marginBottom: 2 },
  holdingQty: { fontSize: 11, color: "#888" },
  holdingRight: { textAlign: "right" },
  holdingValue: { fontSize: 14, fontWeight: 700, color: "#0a0a0a", marginBottom: 3, fontFamily: "monospace" },
  holdingPnl: { fontSize: 11, fontWeight: 600 },
  historyTab: { padding: 16 },
  historyTitle: { fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 12 },
  historyRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fafafa", borderRadius: 9, marginBottom: 6 },
  historyType: { fontSize: 10, fontWeight: 800, width: 36 },
  historyInfo: { flex: 1 },
  historyAsset: { fontSize: 13, fontWeight: 600, color: "#0a0a0a" },
  historyDetail: { fontSize: 11, color: "#888", fontFamily: "monospace" },
  historyPnl: { fontSize: 13, fontWeight: 700, fontFamily: "monospace" },
  historyTime: { fontSize: 10, color: "#888" },
  empty: { textAlign: "center", padding: 28, color: "#888", fontSize: 13 },
};
