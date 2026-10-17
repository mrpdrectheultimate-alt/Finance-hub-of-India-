"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
  ShieldCheck,
  Zap,
  Activity,
  UserCheck,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ============================================================
// FinanceHub — World-Class Forex Paper Trading Terminal
// components/trading/ForexPaperTrader.tsx
// Instant Guest Demo Mode (₹1,00,000) · Zero Login Wall
// Live Real-Time Ticks · Pro Dark Terminal · Auto Supabase Sync
// ============================================================

export type Position = {
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

export type Portfolio = {
  cash_balance: number;
  realized_pnl: number;
  trades_count: number;
  wins_count: number;
};

type PriceMap = Record<string, number>;

export const FOREX_PAIRS = [
  { symbol: "EURUSD", label: "EUR / USD", base: 1.0856, pip: 0.0001, spread: 0.0002, digits: 4, name: "Euro / US Dollar" },
  { symbol: "GBPUSD", label: "GBP / USD", base: 1.2734, pip: 0.0001, spread: 0.0003, digits: 4, name: "British Pound / US Dollar" },
  { symbol: "USDJPY", label: "USD / JPY", base: 149.82, pip: 0.01, spread: 0.02, digits: 2, name: "US Dollar / Japanese Yen" },
  { symbol: "USDCHF", label: "USD / CHF", base: 0.8923, pip: 0.0001, spread: 0.0002, digits: 4, name: "US Dollar / Swiss Franc" },
  { symbol: "AUDUSD", label: "AUD / USD", base: 0.6512, pip: 0.0001, spread: 0.0003, digits: 4, name: "Australian Dollar / US Dollar" },
  { symbol: "USDINR", label: "USD / INR", base: 83.24, pip: 0.01, spread: 0.05, digits: 2, name: "US Dollar / Indian Rupee" },
];

const LEVERAGE_OPTIONS = [1, 2, 5, 10, 20, 50];
const QUICK_QUANTITIES = [1000, 5000, 10000, 50000, 100000];
const INITIAL_CASH = 100000;

export default function ForexPaperTrader({
  embedded = false,
  defaultSymbol = "EURUSD",
}: {
  embedded?: boolean;
  defaultSymbol?: string;
}) {
  const [prices, setPrices] = useState<PriceMap>(() =>
    Object.fromEntries(FOREX_PAIRS.map((pair) => [pair.symbol, pair.base]))
  );
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [portfolio, setPortfolio] = useState<Portfolio>({
    cash_balance: INITIAL_CASH,
    realized_pnl: 0,
    trades_count: 0,
    wins_count: 0,
  });
  const [positions, setPositions] = useState<Position[]>([]);
  const [userId, setUserId] = useState("");
  const [portfolioId, setPortfolioId] = useState("");
  const [isGuest, setIsGuest] = useState(true);
  const [selectedPair, setSelectedPair] = useState(defaultSymbol);
  const [leverage, setLeverage] = useState(10);
  const [quantity, setQuantity] = useState(1000);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [closing, setClosing] = useState<string | null>(null);
  const [tradeLog, setTradeLog] = useState<{ text: string; pnl?: number; time: string }[]>([]);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const latestPrices = useRef<PriceMap>(prices);

  const currentPair = useMemo(
    () => FOREX_PAIRS.find((pair) => pair.symbol === selectedPair) || FOREX_PAIRS[0],
    [selectedPair]
  );

  useEffect(() => {
    latestPrices.current = prices;
  }, [prices]);

  // Initial synthetic price history for the selected currency pair
  useEffect(() => {
    const history = Array.from(
      { length: 40 },
      () => currentPair.base + (Math.random() - 0.5) * currentPair.pip * 24
    );
    setPriceHistory(history);
  }, [currentPair.base, currentPair.pip, selectedPair]);

  // High-frequency live tick generator (every 1.5 seconds)
  useEffect(() => {
    const interval = window.setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        const changes: Record<string, number> = {};

        FOREX_PAIRS.forEach((pair) => {
          const drift = (Math.random() - 0.499) * pair.pip * 2.8;
          const current = prev[pair.symbol] || pair.base;
          const raw = Math.max(current + drift, pair.base * 0.85);
          next[pair.symbol] = Number(raw.toFixed(pair.digits));
          changes[pair.symbol] = ((next[pair.symbol] - pair.base) / pair.base) * 100;
        });

        latestPrices.current = next;
        setPriceChanges(changes);
        return next;
      });

      setPriceHistory((prev) => {
        const base = latestPrices.current[selectedPair] || currentPair.base;
        const nextPrice = base + (Math.random() - 0.499) * currentPair.pip * 2.5;
        return [...prev.slice(-44), nextPrice];
      });
    }, 1500);

    return () => window.clearInterval(interval);
  }, [currentPair.base, currentPair.pip, selectedPair]);

  // Load guest data from localStorage
  const loadGuestStorage = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const storedPort = localStorage.getItem("forex_demo_portfolio");
      if (storedPort) {
        setPortfolio(JSON.parse(storedPort));
      } else {
        const defaultPort: Portfolio = {
          cash_balance: INITIAL_CASH,
          realized_pnl: 0,
          trades_count: 0,
          wins_count: 0,
        };
        setPortfolio(defaultPort);
        localStorage.setItem("forex_demo_portfolio", JSON.stringify(defaultPort));
      }

      const storedPos = localStorage.getItem("forex_demo_positions");
      if (storedPos) {
        setPositions(JSON.parse(storedPos));
      }

      const storedLog = localStorage.getItem("forex_demo_log");
      if (storedLog) {
        setTradeLog(JSON.parse(storedLog));
      } else {
        const initialLog = [
          {
            text: "Demo portfolio active with ₹1,00,000 virtual cash. Welcome to FinanceHub Forex Terminal.",
            time: new Date().toLocaleTimeString(),
          },
        ];
        setTradeLog(initialLog);
        localStorage.setItem("forex_demo_log", JSON.stringify(initialLog));
      }
    } catch (e) {
      console.warn("Could not read demo storage:", e);
    }
  }, []);

  const loadPortfolio = useCallback(async (id = portfolioId) => {
    if (!id) return;
    try {
      const [{ data: port }, { data: orders }] = await Promise.all([
        supabase.from("paper_portfolios" as never).select("*").eq("id", id).single(),
        supabase.from("paper_orders" as never).select("*").eq("portfolio_id", id).eq("status", "open"),
      ]);

      if (port) setPortfolio(port as Portfolio);
      if (orders) setPositions(orders as Position[]);
    } catch (err) {
      console.warn("Could not load cloud portfolio, keeping local fallback:", err);
    }
  }, [portfolioId]);

  const loadUser = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsGuest(true);
        loadGuestStorage();
        setLoading(false);
        return;
      }

      setUserId(user.id);
      setIsGuest(false);

      const { data: id } = await supabase.rpc("init_paper_portfolio" as never, {
        p_user_id: user.id,
        p_market_type: "forex",
      } as never);

      if (typeof id === "string") {
        setPortfolioId(id);
        await loadPortfolio(id);
      }
    } catch (err) {
      console.warn("Auth initialization error:", err);
      setIsGuest(true);
      loadGuestStorage();
    } finally {
      setLoading(false);
    }
  }, [loadPortfolio, loadGuestStorage]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const getPair = (symbol: string) =>
    FOREX_PAIRS.find((pair) => pair.symbol === symbol) || currentPair;

  const getAskPrice = (symbol: string) => {
    const pair = getPair(symbol);
    return Number(((prices[symbol] || pair.base) + pair.spread / 2).toFixed(pair.digits));
  };

  const getBidPrice = (symbol: string) => {
    const pair = getPair(symbol);
    return Number(((prices[symbol] || pair.base) - pair.spread / 2).toFixed(pair.digits));
  };

  const getPositionPnl = (position: Position) => {
    const currentPrice =
      position.order_type === "buy" ? getBidPrice(position.symbol) : getAskPrice(position.symbol);
    const diff =
      position.order_type === "buy"
        ? currentPrice - position.entry_price
        : position.entry_price - currentPrice;
    return Number((diff * position.quantity).toFixed(2));
  };

  const addLog = (text: string, pnl?: number) => {
    setTradeLog((prev) => {
      const updated = [{ text, pnl, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 24)];
      if (isGuest && typeof window !== "undefined") {
        try {
          localStorage.setItem("forex_demo_log", JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  // Execute Buy / Sell Order
  const placeOrder = async (type: "buy" | "sell") => {
    if (placing) return;
    setPlacing(true);

    const price = type === "buy" ? getAskPrice(selectedPair) : getBidPrice(selectedPair);
    const marginUsed = (price * quantity) / leverage;

    if (marginUsed > (portfolio?.cash_balance || 0)) {
      addLog(`❌ Insufficient margin for ${type.toUpperCase()} ${quantity.toLocaleString()} ${selectedPair}`);
      setPlacing(false);
      return;
    }

    if (isGuest) {
      // Offline Guest Execution
      const newPos: Position = {
        id: `demo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        symbol: selectedPair,
        order_type: type,
        quantity,
        entry_price: price,
        stop_loss: stopLoss ? Number.parseFloat(stopLoss) : null,
        take_profit: takeProfit ? Number.parseFloat(takeProfit) : null,
        leverage,
        margin_used: Number(marginUsed.toFixed(2)),
        opened_at: new Date().toISOString(),
      };

      const updatedPositions = [newPos, ...positions];
      const updatedPort: Portfolio = {
        ...portfolio,
        cash_balance: Number((portfolio.cash_balance - marginUsed).toFixed(2)),
      };

      setPositions(updatedPositions);
      setPortfolio(updatedPort);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("forex_demo_positions", JSON.stringify(updatedPositions));
          localStorage.setItem("forex_demo_portfolio", JSON.stringify(updatedPort));
        } catch {}
      }

      addLog(
        `✅ ${type.toUpperCase()} ${quantity.toLocaleString()} ${selectedPair} @ ${formatRate(
          price,
          currentPair.digits
        )} (${leverage}x leverage)`
      );
      setPlacing(false);
      return;
    }

    // Cloud Logged-in Execution
    try {
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
        lesson_context: "Manual forex terminal",
      } as never);

      if (error) {
        addLog("❌ Order placement failed. Please try again.");
      } else {
        await supabase
          .from("paper_portfolios" as never)
          .update({ cash_balance: (portfolio?.cash_balance || 0) - marginUsed } as never)
          .eq("id", portfolioId);
        addLog(
          `✅ ${type.toUpperCase()} ${quantity.toLocaleString()} ${selectedPair} @ ${formatRate(
            price,
            currentPair.digits
          )} (${leverage}x leverage)`
        );
        await loadPortfolio();
      }
    } catch (err) {
      addLog("❌ Network error placing order.");
    } finally {
      setPlacing(false);
    }
  };

  // Close Position
  const closePosition = async (position: Position) => {
    setClosing(position.id);
    const exitPrice =
      position.order_type === "buy" ? getBidPrice(position.symbol) : getAskPrice(position.symbol);

    if (isGuest) {
      const pnl = getPositionPnl(position);
      const returnedCash = position.margin_used + pnl;
      const updatedPort: Portfolio = {
        cash_balance: Number((portfolio.cash_balance + returnedCash).toFixed(2)),
        realized_pnl: Number((portfolio.realized_pnl + pnl).toFixed(2)),
        trades_count: portfolio.trades_count + 1,
        wins_count: portfolio.wins_count + (pnl > 0 ? 1 : 0),
      };

      const updatedPositions = positions.filter((p) => p.id !== position.id);
      setPositions(updatedPositions);
      setPortfolio(updatedPort);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("forex_demo_positions", JSON.stringify(updatedPositions));
          localStorage.setItem("forex_demo_portfolio", JSON.stringify(updatedPort));
        } catch {}
      }

      addLog(
        `🏁 Closed ${position.order_type.toUpperCase()} ${position.quantity.toLocaleString()} ${
          position.symbol
        } @ ${formatRate(exitPrice, getPair(position.symbol).digits)} | P&L: ${formatMoney(pnl)}`,
        pnl
      );
      setClosing(null);
      return;
    }

    // Cloud Logged-in Close
    try {
      const { data } = await supabase.rpc("close_paper_trade" as never, {
        p_order_id: position.id,
        p_exit_price: exitPrice,
      } as never);

      const result = data as { success?: boolean; pnl?: number } | null;
      if (result?.success) {
        const pnl = Number(result.pnl || 0);
        addLog(
          `🏁 Closed ${position.order_type.toUpperCase()} ${position.quantity.toLocaleString()} ${
            position.symbol
          } @ ${formatRate(exitPrice, getPair(position.symbol).digits)} | P&L: ${formatMoney(pnl)}`,
          pnl
        );
      }
      await loadPortfolio();
    } catch (err) {
      addLog("❌ Error closing trade.");
    } finally {
      setClosing(null);
    }
  };

  // Reset Portfolio to Initial Capital
  const resetPortfolio = async () => {
    if (!window.confirm("Reset your paper trading portfolio to ₹1,00,000? All open positions will be closed.")) {
      return;
    }

    if (isGuest) {
      const freshPort: Portfolio = {
        cash_balance: INITIAL_CASH,
        realized_pnl: 0,
        trades_count: 0,
        wins_count: 0,
      };
      setPortfolio(freshPort);
      setPositions([]);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("forex_demo_positions");
          localStorage.setItem("forex_demo_portfolio", JSON.stringify(freshPort));
        } catch {}
      }
      addLog("🔄 Demo portfolio reset to ₹1,00,000.");
      return;
    }

    // Cloud Reset
    try {
      for (const pos of positions) {
        const exitPrice = pos.order_type === "buy" ? getBidPrice(pos.symbol) : getAskPrice(pos.symbol);
        await supabase.rpc("close_paper_trade" as never, {
          p_order_id: pos.id,
          p_exit_price: exitPrice,
        } as never);
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

      addLog("🔄 Cloud portfolio reset to ₹1,00,000.");
      await loadPortfolio();
    } catch (err) {
      console.warn("Reset error:", err);
    }
  };

  const askPrice = getAskPrice(selectedPair);
  const bidPrice = getBidPrice(selectedPair);
  const totalFloatPnl = positions.reduce((sum, pos) => sum + getPositionPnl(pos), 0);
  const totalEquity = (portfolio?.cash_balance || 0) + totalFloatPnl;
  const winRate = portfolio?.trades_count
    ? Math.round((portfolio.wins_count / portfolio.trades_count) * 100)
    : 0;
  const marginRequired = (askPrice * quantity) / leverage;

  // SVG Chart points computation
  const chart = useMemo(() => {
    if (!priceHistory.length) return { line: "", area: "" };
    const min = Math.min(...priceHistory) * 0.9997;
    const max = Math.max(...priceHistory) * 1.0003;
    const range = max - min || 0.0001;
    const points = priceHistory.map((val, idx) => {
      const x = (idx / Math.max(priceHistory.length - 1, 1)) * 500;
      const y = 110 - ((val - min) / range) * 90;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const line = `M ${points.join(" L ")}`;
    return {
      line,
      area: `${line} L 500,120 L 0,120 Z`,
      min: min.toFixed(currentPair.digits),
      max: max.toFixed(currentPair.digits),
    };
  }, [priceHistory, currentPair.digits]);

  return (
    <div
      className={`w-full bg-[#0A111E] text-slate-100 rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden font-sans ${
        embedded ? "rounded-2xl" : ""
      }`}
    >
      {/* ── TOP TERMINAL BAR ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#070D18] border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-xs text-white tracking-wider shadow-lg shadow-emerald-900/30">
            FX
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {embedded ? "Live Forex Practice Terminal" : "Forex Paper Trading Terminal"}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Sim
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time tick engine • 6 major currency pairs • Zero financial risk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Account Sync Pill */}
          {isGuest ? (
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-950/50 text-amber-300 border border-amber-800/50">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Guest Demo Mode</span>
            </div>
          ) : (
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-teal-950/50 text-teal-300 border border-teal-800/50">
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Cloud Synced Account</span>
            </div>
          )}

          <button
            onClick={resetPortfolio}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-900/80 hover:bg-rose-950/40 border border-slate-700/80 hover:border-rose-700/60 rounded-xl transition-all"
            title="Reset demo capital to ₹1,00,000"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ── GUEST DEMO MODE BANNER (NON-BLOCKING) ────────────────── */}
      {isGuest && (
        <div className="px-6 py-2.5 bg-gradient-to-r from-emerald-950/50 via-teal-950/30 to-slate-900/60 border-b border-emerald-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Instant Practice Mode Active:</strong> You are trading with <strong>₹1,00,000</strong> virtual demo capital. Your open trades are stored locally.
            </span>
          </div>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors ml-auto"
          >
            <span>Sign in to save portfolio to cloud</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── CURRENCY PAIR SELECTOR BAR ───────────────────────────── */}
      <div className="px-6 py-3 bg-[#0B1424] border-b border-slate-800/80 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {FOREX_PAIRS.map((pair) => {
            const isSelected = selectedPair === pair.symbol;
            const livePrice = prices[pair.symbol] || pair.base;
            const pctChange = priceChanges[pair.symbol] || 0;
            const isUp = pctChange >= 0;

            return (
              <button
                key={pair.symbol}
                onClick={() => setSelectedPair(pair.symbol)}
                type="button"
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl border text-xs transition-all ${
                  isSelected
                    ? "bg-slate-800/90 border-emerald-500/80 shadow-md shadow-emerald-950/50 text-white"
                    : "bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                }`}
              >
                <div className="text-left">
                  <div className="font-bold tracking-wide text-white">{pair.label}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[100px]">{pair.name}</div>
                </div>
                <div className="text-right pl-2 border-l border-slate-800">
                  <div className="font-mono font-semibold text-slate-200">
                    {formatRate(livePrice, pair.digits)}
                  </div>
                  <div
                    className={`text-[10px] font-mono flex items-center justify-end gap-0.5 ${
                      isUp ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isUp ? "+" : ""}
                    {pctChange.toFixed(2)}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN TRADING TERMINAL COCKPIT ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
        {/* ── LEFT COLUMN: CHART & ORDER TICKET (7 COLS) ──────────── */}
        <div className="lg:col-span-7 p-6 space-y-5">
          {/* Pair Heading & Real-Time Bid / Ask Spread Display */}
          <div className="bg-[#0E1829] rounded-2xl p-4 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Selected Instrument
                </span>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  {currentPair.label}
                  <span className="text-xs font-normal text-slate-400">({currentPair.name})</span>
                </h3>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono">
                Spread: {((currentPair.spread / currentPair.pip) || 2).toFixed(1)} pips
              </div>
            </div>

            {/* Dual Bid / Ask Quotation Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-center">
                <span className="text-[10px] font-bold tracking-widest text-rose-400 uppercase block mb-1">
                  Sell Price (Bid)
                </span>
                <span className="font-mono text-2xl font-black text-rose-400 tracking-tight">
                  {formatRate(bidPrice, currentPair.digits)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-center">
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase block mb-1">
                  Buy Price (Ask)
                </span>
                <span className="font-mono text-2xl font-black text-emerald-400 tracking-tight">
                  {formatRate(askPrice, currentPair.digits)}
                </span>
              </div>
            </div>
          </div>

          {/* Live Streaming SVG Tick Chart */}
          <div className="bg-[#0E1829] rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Live Price Micro-Ticks
              </span>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-slate-500">Low: {chart.min}</span>
                <span className="text-slate-500">High: {chart.max}</span>
              </div>
            </div>

            <div className="relative w-full h-[120px] bg-slate-950/70 rounded-xl overflow-hidden border border-slate-800/60">
              <svg width="100%" height="120" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="forexChartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {priceHistory.length > 1 && (
                  <>
                    <path d={chart.area} fill="url(#forexChartGlow)" />
                    <path
                      d={chart.line}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </>
                )}
              </svg>
              <div className="absolute right-3 top-3 px-2 py-0.5 rounded bg-slate-900/90 border border-emerald-500/50 text-[10px] font-mono text-emerald-400 font-bold">
                {formatRate(prices[selectedPair] || currentPair.base, currentPair.digits)}
              </div>
            </div>
          </div>

          {/* Order Placement Ticket */}
          <div className="bg-[#0E1829] rounded-2xl p-5 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Order Execution Ticket
              </h4>
              <span className="text-xs text-slate-400">Market Order</span>
            </div>

            {/* Quantity Selector + Presets */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span>Position Size (Units / Lots)</span>
                <span className="text-slate-400 font-mono">
                  {quantity >= 100000
                    ? "1 Standard Lot (100k)"
                    : quantity >= 10000
                    ? `${(quantity / 10000).toFixed(1)} Mini Lots`
                    : `${(quantity / 1000).toFixed(1)} Micro Lots`}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={quantity}
                  min={100}
                  step={500}
                  onChange={(e) => setQuantity(Math.max(100, Number(e.target.value)))}
                  className="flex-1 bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2 font-mono text-sm text-white focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_QUANTITIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-mono border transition-all ${
                      quantity === q
                        ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {q >= 100000 ? "100k" : q >= 1000 ? `${q / 1000}k` : q}
                  </button>
                ))}
              </div>
            </div>

            {/* Leverage Pills */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span>Account Leverage</span>
                <span className="text-slate-400">Amplifies margin & volatility</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {LEVERAGE_OPTIONS.map((lev) => (
                  <button
                    key={lev}
                    type="button"
                    onClick={() => setLeverage(lev)}
                    className={`py-1.5 text-xs font-bold rounded-xl border font-mono transition-all ${
                      leverage === lev
                        ? "bg-teal-500 border-teal-400 text-slate-950 shadow-md shadow-teal-900/40"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Management: SL & TP */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">
                  Stop Loss (Price)
                </label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={stopLoss}
                  step={currentPair.pip}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-rose-500 rounded-xl px-3 py-2 font-mono text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">
                  Take Profit (Price)
                </label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={takeProfit}
                  step={currentPair.pip}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-3 py-2 font-mono text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Estimated Margin Callout */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Margin Required:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {formatMoney(marginRequired)}
              </span>
            </div>

            {/* Instant Dual Market Execution Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={placing}
                onClick={() => placeOrder("buy")}
                className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"
              >
                <span className="text-xs uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  BUY / LONG
                </span>
                <span className="font-mono text-xs font-semibold opacity-90">
                  @ {formatRate(askPrice, currentPair.digits)}
                </span>
              </button>

              <button
                type="button"
                disabled={placing}
                onClick={() => placeOrder("sell")}
                className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-rose-950/60 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"
              >
                <span className="text-xs uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <ArrowDownRight className="w-4 h-4" />
                  SELL / SHORT
                </span>
                <span className="font-mono text-xs font-semibold opacity-90">
                  @ {formatRate(bidPrice, currentPair.digits)}
                </span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              ⚠️ Simulated paper trading for financial education. No real funds or broker accounts involved.
            </p>
          </div>
        </div>

        {/* ── RIGHT COLUMN: PORTFOLIO, POSITIONS & TRADE LOG (5 COLS) */}
        <div className="lg:col-span-5 p-6 space-y-5 bg-[#09101C]">
          {/* Portfolio Dashboard Metrics */}
          <div className="bg-[#0E1829] rounded-2xl p-5 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Portfolio Overview
              </span>
              <span className="text-[11px] text-slate-400">Virtual INR</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                  Cash Balance
                </span>
                <span className="font-mono text-sm font-bold text-white block">
                  {formatMoney(portfolio?.cash_balance || 0)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                  Floating P&L
                </span>
                <span
                  className={`font-mono text-sm font-bold block ${
                    totalFloatPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {formatMoney(totalFloatPnl)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                  Total Equity
                </span>
                <span
                  className={`font-mono text-sm font-bold block ${
                    totalEquity >= INITIAL_CASH ? "text-emerald-300" : "text-amber-300"
                  }`}
                >
                  {formatMoney(totalEquity)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                  Realized P&L
                </span>
                <span
                  className={`font-mono text-sm font-bold block ${
                    (portfolio?.realized_pnl || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {formatMoney(portfolio?.realized_pnl || 0)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                  Win Rate
                </span>
                <span
                  className={`font-mono text-sm font-bold block ${
                    winRate >= 50 ? "text-emerald-400" : "text-slate-300"
                  }`}
                >
                  {winRate}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                  Closed Trades
                </span>
                <span className="font-mono text-sm font-bold text-white block">
                  {portfolio?.trades_count || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Active Open Positions Card */}
          <div className="bg-[#0E1829] rounded-2xl p-5 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Active Open Positions ({positions.length})
              </h4>
              <span className="text-[10px] text-slate-400">Floating Live</span>
            </div>

            {positions.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-800 text-slate-500 space-y-2">
                <div className="text-3xl">📊</div>
                <p className="text-xs font-medium text-slate-400">No open positions currently</p>
                <p className="text-[11px] text-slate-500">
                  Select a currency pair and execute a BUY or SELL order to practice.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                {positions.map((pos) => {
                  const pnl = getPositionPnl(pos);
                  const isUp = pnl >= 0;
                  const pair = getPair(pos.symbol);
                  const livePrice =
                    pos.order_type === "buy" ? getBidPrice(pos.symbol) : getAskPrice(pos.symbol);

                  return (
                    <div
                      key={pos.id}
                      className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase font-mono tracking-wider ${
                              pos.order_type === "buy"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : "bg-rose-950 text-rose-400 border border-rose-800"
                            }`}
                          >
                            {pos.order_type}
                          </span>
                          <span className="font-bold text-white text-xs">{pos.symbol}</span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {pos.quantity.toLocaleString()} units @ {pos.leverage}x
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono space-x-2">
                          <span>Entry: {formatRate(pos.entry_price, pair.digits)}</span>
                          <span>•</span>
                          <span>Mark: {formatRate(livePrice, pair.digits)}</span>
                        </div>
                        {(pos.stop_loss || pos.take_profit) && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {pos.stop_loss ? `SL: ${pos.stop_loss} ` : ""}
                            {pos.take_profit ? `TP: ${pos.take_profit}` : ""}
                          </div>
                        )}
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span
                          className={`font-mono text-sm font-black ${
                            isUp ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {formatMoney(pnl)}
                        </span>
                        <button
                          type="button"
                          disabled={closing === pos.id}
                          onClick={() => closePosition(pos)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all disabled:opacity-50"
                        >
                          {closing === pos.id ? "Closing..." : "Close"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live Execution Trade Log */}
          {tradeLog.length > 0 && (
            <div className="bg-[#0E1829] rounded-2xl p-4 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Terminal Execution Log
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Real-time</span>
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto font-mono text-[11px]">
                {tradeLog.slice(0, 10).map((log, idx) => (
                  <div
                    key={`${log.time}-${idx}`}
                    className="flex items-start justify-between gap-3 text-slate-400"
                  >
                    <span
                      className={`truncate ${
                        log.pnl !== undefined
                          ? log.pnl >= 0
                            ? "text-emerald-400 font-medium"
                            : "text-rose-400 font-medium"
                          : "text-slate-300"
                      }`}
                    >
                      {log.text}
                    </span>
                    <span className="text-slate-600 flex-shrink-0 text-[10px]">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatRate(value: number, digits: number) {
  return value.toFixed(digits);
}

function formatMoney(amount: number) {
  const sign = amount > 0 ? "+" : "";
  return `${sign}₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
