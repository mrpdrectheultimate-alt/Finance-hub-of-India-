"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Lock,
  CheckCircle2,
  ChevronDown,
  BookOpen,
  Clock,
  Sparkles,
  Award,
  Layers,
  ShieldCheck,
  Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Track Syllabus & Curriculum Detail
// app/explore/[trackId]/page.tsx
// Phase 2: The Detail (Study) · Progressive Disclosure Accordion
// ============================================================

interface LessonItem {
  id: string;
  title: string;
  slug?: string;
  duration: string;
  duration_minutes?: number;
  free: boolean;
  completed: boolean;
}

interface LevelGroup {
  id: string;
  title: string;
  description: string;
  lessons: LessonItem[];
}

interface TrackDetailData {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  levelBadge: string;
  levels: LevelGroup[];
}

// ── Curated Fallback Curriculums (Instant Zero-Flicker Rendering) ──
const TRACK_FALLBACKS: Record<string, TrackDetailData> = {
  "personal-finance": {
    id: "personal-finance",
    slug: "personal-finance",
    title: "Personal Finance",
    description: "Budgeting, saving, emergency funds, debt elimination, SIP investing, and lifetime wealth planning.",
    icon: "💰",
    color: "#10B981",
    levelBadge: "Beginner",
    levels: [
      {
        id: "level-1",
        title: "Level 1: Foundations of Financial Freedom",
        description: "Master the fundamental rules of money management, cash flow, and inflation.",
        lessons: [
          { id: "pf-1", slug: "pf-why-money-management-matters", title: "Why Money Management Matters More Than Income", duration: "6m", free: true, completed: false },
          { id: "pf-2", slug: "pf-budgeting-50-30-20-rule", title: "How to Budget: The Realistic 50/30/20 Framework", duration: "8m", free: true, completed: false },
          { id: "pf-3", slug: "pf-building-emergency-fund", title: "Building a Bulletproof Emergency Fund in India", duration: "7m", free: true, completed: false },
          { id: "pf-4", slug: "pf-compound-interest-eighth-wonder", title: "Compound Interest: The Mathematical Eighth Wonder", duration: "10m", free: true, completed: false },
          { id: "pf-5", slug: "pf-inflation-the-silent-tax", title: "Inflation: How Cash in a Savings Account Loses Value Daily", duration: "8m", free: true, completed: false },
        ],
      },
      {
        id: "level-2",
        title: "Level 2: The Earning & Tax Engine",
        description: "Decode salary slips, master Indian tax regimes, and protect your capital.",
        lessons: [
          { id: "pf-6", slug: "pf-decoding-your-salary-slip", title: "Decoding Your Salary Slip: CTC vs. True Take-Home", duration: "11m", free: true, completed: false },
          { id: "pf-7", slug: "pf-old-vs-new-tax-regime", title: "Old vs. New Tax Regime: The Exact Mathematical Break-Even", duration: "12m", free: true, completed: false },
          { id: "pf-8", slug: "pf-pure-term-insurance-vs-ulip", title: "Pure Term Insurance vs. ULIPs: The Cost Trap Exposed", duration: "9m", free: false, completed: false },
          { id: "pf-9", slug: "pf-credit-cards-and-cibil-score", title: "Credit Cards: Avoiding the 42% APR Trap & Building 750+ CIBIL", duration: "10m", free: false, completed: false },
          { id: "pf-10", slug: "pf-health-insurance-super-topup", title: "Health Insurance & Super Top-Ups: Shielding Your Family", duration: "10m", free: false, completed: false },
        ],
      },
      {
        id: "level-3",
        title: "Level 3: Strategic Long-Term Wealth",
        description: "Automate low-cost mutual fund investing, gold allocation, and retirement readiness.",
        lessons: [
          { id: "pf-11", slug: "pf-index-funds-vs-active-funds", title: "Nifty 50 Index Funds vs. Active Mutual Funds: The Long-Term Truth", duration: "13m", free: false, completed: false },
          { id: "pf-12", slug: "pf-sip-step-up-calculator-mastery", title: "The Step-Up SIP: Increasing Wealth by 60% with 10% Annual Boost", duration: "10m", free: false, completed: false },
          { id: "pf-13", slug: "pf-sovereign-gold-bonds-sgb", title: "Sovereign Gold Bonds (SGB) vs. Physical Gold & Digital Gold", duration: "9m", free: false, completed: false },
          { id: "pf-14", slug: "pf-nps-tier-1-retirement-planning", title: "NPS Tier 1 & Tier 2: The Low-Cost Government Retirement Machine", duration: "14m", free: false, completed: false },
          { id: "pf-15", slug: "pf-fire-financial-independence-india", title: "FIRE in India: Calculating Your Freedom Number with 4% Rule", duration: "15m", free: false, completed: false },
        ],
      },
    ],
  },
  "trading-markets": {
    id: "trading-markets",
    slug: "trading-markets",
    title: "Trading & Markets",
    description: "Equities anatomy, order books, derivatives risk management, and structured trading psychology.",
    icon: "📈",
    color: "#3B82F6",
    levelBadge: "Intermediate",
    levels: [
      {
        id: "level-1",
        title: "Level 1: Market Mechanics & Order Execution",
        description: "Understand stock exchanges, order types, and bid-ask market microstructure.",
        lessons: [
          { id: "tm-1", slug: "tm-how-stock-exchanges-work", title: "How NSE & BSE Work: Matching Buyers and Sellers", duration: "7m", free: true, completed: false },
          { id: "tm-2", slug: "tm-market-orders-vs-limit-orders", title: "Market Orders vs. Limit Orders: Avoiding Costly Slippage", duration: "8m", free: true, completed: false },
          { id: "tm-3", slug: "tm-understanding-market-depth", title: "Reading the Order Book & Market Depth (Level 2 Data)", duration: "10m", free: true, completed: false },
          { id: "tm-4", slug: "tm-demat-and-trading-account", title: "How Demat, Trading Accounts, and Depositories (CDSL/NSDL) Connect", duration: "6m", free: true, completed: false },
        ],
      },
      {
        id: "level-2",
        title: "Level 2: Risk-First Trading Architecture",
        description: "Position sizing, stop-loss mathematics, and avoiding catastrophic account blowups.",
        lessons: [
          { id: "tm-5", slug: "tm-the-1-percent-risk-rule", title: "The 1% Rule: Position Sizing That Prevents Account Blowups", duration: "11m", free: true, completed: false },
          { id: "tm-6", slug: "tm-risk-to-reward-mathematics", title: "Risk-to-Reward Ratio: How to Be Profitable with a 45% Win Rate", duration: "12m", free: false, completed: false },
          { id: "tm-7", slug: "tm-stop-loss-trailing-techniques", title: "Trailing Stop Losses: Locking Gains Without Cutting Trends Short", duration: "9m", free: false, completed: false },
          { id: "tm-8", slug: "tm-trading-journal-discipline", title: "The Institutional Trading Journal: Tracking Emotional Execution", duration: "10m", free: false, completed: false },
        ],
      },
      {
        id: "level-3",
        title: "Level 3: Derivatives & F&O Reality",
        description: "SEBI data reality, futures pricing, options anatomy, and theta decay.",
        lessons: [
          { id: "tm-9", slug: "tm-sebi-fo-loss-data-reality", title: "SEBI 89% Loss Data: Why Retail Loses in F&O and How to Survive", duration: "14m", free: false, completed: false },
          { id: "tm-10", slug: "tm-futures-contracts-and-margin", title: "Futures Contracts: Leverage, MTM Settlements & Margin Requirements", duration: "13m", free: false, completed: false },
          { id: "tm-11", slug: "tm-call-put-options-anatomy", title: "Call and Put Options: Payoff Diagrams for Buyers vs. Sellers", duration: "15m", free: false, completed: false },
          { id: "tm-12", slug: "tm-option-greeks-delta-theta", title: "Option Greeks: Delta, Gamma, Theta Decay, and Vega Explained Simply", duration: "16m", free: false, completed: false },
        ],
      },
    ],
  },
  "crypto-defi": {
    id: "crypto-defi",
    slug: "crypto-defi",
    title: "Crypto & DeFi",
    description: "Blockchain fundamentals, private keys, self-custody wallets, decentralized finance, and Indian tax laws.",
    icon: "₿",
    color: "#8B5CF6",
    levelBadge: "Beginner",
    levels: [
      {
        id: "level-1",
        title: "Level 1: Blockchain Fundamentals",
        description: "How cryptographic ledgers solve the double-spend problem without intermediaries.",
        lessons: [
          { id: "cd-1", slug: "cd-bitcoin-whitepaper-breakdown", title: "The Bitcoin Whitepaper: Solving the Double-Spend Problem", duration: "9m", free: true, completed: false },
          { id: "cd-2", slug: "cd-how-blockchains-verify-blocks", title: "How Blocks, Hashes, and Proof-of-Work Reach Consensus", duration: "10m", free: true, completed: false },
          { id: "cd-3", slug: "cd-public-vs-private-keys", title: "Public Keys, Private Keys, and 24-Word Seed Phrases", duration: "8m", free: true, completed: false },
        ],
      },
      {
        id: "level-2",
        title: "Level 2: Wallets, Custody & Smart Contracts",
        description: "Self-custody, hardware security, Ethereum Virtual Machine, and ERC-20 tokens.",
        lessons: [
          { id: "cd-4", slug: "cd-hardware-wallets-cold-storage", title: "Hardware Wallets & Cold Storage: Not Your Keys, Not Your Coins", duration: "11m", free: true, completed: false },
          { id: "cd-5", slug: "cd-smart-contracts-explained", title: "Smart Contracts: Automated Code Execution on Ethereum", duration: "12m", free: false, completed: false },
          { id: "cd-6", slug: "cd-gas-fees-and-layer-2", title: "Gas Fees & Layer-2 Scaling: Arbitrum, Optimism, and Polygon", duration: "10m", free: false, completed: false },
        ],
      },
      {
        id: "level-3",
        title: "Level 3: DeFi Protocols & Indian Crypto Tax",
        description: "Decentralized exchanges, liquidity pools, staking yields, and section 115BBH compliance.",
        lessons: [
          { id: "cd-7", slug: "cd-uniswap-automated-market-makers", title: "Automated Market Makers (AMM): How Uniswap Trades Without Order Books", duration: "13m", free: false, completed: false },
          { id: "cd-8", slug: "cd-impermanent-loss-in-liquidity-pools", title: "Impermanent Loss: The Hidden Risk in Liquidity Pools", duration: "11m", free: false, completed: false },
          { id: "cd-9", slug: "cd-india-crypto-tax-30-percent", title: "Indian Crypto Tax Laws: 30% Flat Tax, 1% TDS, and No Loss Offsetting", duration: "14m", free: false, completed: false },
        ],
      },
    ],
  },
  "corporate-finance": {
    id: "corporate-finance",
    slug: "corporate-finance",
    title: "Corporate Finance",
    description: "Financial statement analysis, DCF business valuation, startup fundraising, burn rate, and ESOPs.",
    icon: "🏢",
    color: "#F59E0B",
    levelBadge: "Advanced",
    levels: [
      {
        id: "level-1",
        title: "Level 1: Financial Statements Mastery",
        description: "Read balance sheets, P&L statements, and cash flows like an institutional auditor.",
        lessons: [
          { id: "cf-1", slug: "cf-the-three-financial-statements", title: "The 3 Financial Statements: How P&L, Balance Sheet & Cash Flow Connect", duration: "12m", free: true, completed: false },
          { id: "cf-2", slug: "cf-ebitda-operating-cash-flow", title: "EBITDA vs. Free Cash Flow: Why Revenue Doesn't Equal Solvency", duration: "10m", free: true, completed: false },
          { id: "cf-3", slug: "cf-working-capital-cycle", title: "The Working Capital Cycle: Days Sales Outstanding & Cash Traps", duration: "11m", free: true, completed: false },
        ],
      },
      {
        id: "level-2",
        title: "Level 2: Business Valuation from First Principles",
        description: "Build Discounted Cash Flow models, calculate WACC, and value private enterprises.",
        lessons: [
          { id: "cf-4", slug: "cf-discounted-cash-flow-model", title: "Discounted Cash Flow (DCF): Modeling Future Cash Flows to Present Value", duration: "16m", free: false, completed: false },
          { id: "cf-5", slug: "cf-wacc-cost-of-capital", title: "Weighted Average Cost of Capital (WACC): Calculating Hurdle Rates", duration: "14m", free: false, completed: false },
          { id: "cf-6", slug: "cf-comparable-company-multiples", title: "Trading Multiples: EV/EBITDA, P/E, and Price-to-Sales Ratios", duration: "12m", free: false, completed: false },
        ],
      },
      {
        id: "level-3",
        title: "Level 3: Startup Finance & Equity Structuring",
        description: "Term sheets, pre/post money valuation, dilution, and ESOP perquisite taxes.",
        lessons: [
          { id: "cf-7", slug: "cf-pre-money-post-money-valuation", title: "Pre-Money vs. Post-Money Valuation & Cap Table Dilution", duration: "13m", free: false, completed: false },
          { id: "cf-8", slug: "cf-burn-rate-runway-metrics", title: "Gross Burn vs. Net Burn: Calculating Months of Runway for Startups", duration: "11m", free: false, completed: false },
          { id: "cf-9", slug: "cf-esop-taxation-in-india", title: "Startup ESOPs in India: Exercise Price, Vesting & Perquisite Tax Traps", duration: "15m", free: false, completed: false },
        ],
      },
    ],
  },
  "behavioral-finance": {
    id: "behavioral-finance",
    slug: "behavioral-finance",
    title: "Behavioral Finance",
    description: "Understand the psychological biases, emotional traps, and cognitive errors that sabotage investor returns.",
    icon: "🧠",
    color: "#EC4899",
    levelBadge: "Intermediate",
    levels: [
      {
        id: "level-1",
        title: "Level 1: The Psychology of Irrational Money",
        description: "Why traditional economics failed and why human brains are wired to panic.",
        lessons: [
          { id: "bf-1", slug: "bf-rational-man-myth", title: "The Myth of Rational Economic Man: Kahneman & Tversky's Discovery", duration: "8m", free: true, completed: false },
          { id: "bf-2", slug: "bf-loss-aversion-asymmetry", title: "Loss Aversion: Why Losing ₹10,000 Hurts Twice as Much as Gaining ₹10,000", duration: "9m", free: true, completed: false },
          { id: "bf-3", slug: "bf-mental-accounting-trap", title: "Mental Accounting: Why People Treat Bonuses Differently Than Salary", duration: "8m", free: true, completed: false },
        ],
      },
      {
        id: "level-2",
        title: "Level 2: Common Investor Traps",
        description: "Sunk costs, FOMO in bull runs, and recency bias in stock selection.",
        lessons: [
          { id: "bf-4", slug: "bf-sunk-cost-fallacy-averaging-down", title: "The Sunk Cost Fallacy: Averaging Down on Broken Companies", duration: "11m", free: false, completed: false },
          { id: "bf-5", slug: "bf-fomo-and-herd-mentality", title: "FOMO & Herd Behavior: Why Crowds Buy Tops and Sell Bottoms", duration: "10m", free: false, completed: false },
          { id: "bf-6", slug: "bf-confirmation-bias-in-research", title: "Confirmation Bias: Searching Only for Positive News on Your Stocks", duration: "9m", free: false, completed: false },
        ],
      },
      {
        id: "level-3",
        title: "Level 3: Building Emotional Armor",
        description: "Structured frameworks to automate discipline and eliminate emotional trade interference.",
        lessons: [
          { id: "bf-7", slug: "bf-investment-policy-statement", title: "Drafting Your Personal Investment Policy Statement (IPS)", duration: "12m", free: false, completed: false },
          { id: "bf-8", slug: "bf-automating-asset-allocation", title: "Automated Rebalancing: Taking Emotion Out of Buying Low and Selling High", duration: "11m", free: false, completed: false },
        ],
      },
    ],
  },
  "forex-currency": {
    id: "forex-currency",
    slug: "forex-currency",
    title: "Forex & Currency",
    description: "Master the global foreign exchange markets, central bank mechanics, exchange rates, and currency hedging.",
    icon: "💱",
    color: "#06B6D4",
    levelBadge: "Advanced",
    levels: [
      {
        id: "level-1",
        title: "Level 1: Foreign Exchange Foundations",
        description: "Currency pairs, bid-ask quotes, pip calculations, and 24-hour interbank trading.",
        lessons: [
          { id: "fx-1", slug: "fx-how-forex-markets-operate", title: "The $7.5 Trillion Market: Central Banks, Interbank Liquidity & Retail", duration: "9m", free: true, completed: false },
          { id: "fx-2", slug: "fx-base-vs-quote-currency", title: "Base vs. Quote Currency: Reading USD/INR and EUR/USD Pairs", duration: "8m", free: true, completed: false },
          { id: "fx-3", slug: "fx-pips-spreads-lot-sizing", title: "Pips, Spreads, and Lots: Calculating Exact Dollar Value per Move", duration: "10m", free: true, completed: false },
        ],
      },
      {
        id: "level-2",
        title: "Level 2: Macroeconomics & Exchange Rate Drivers",
        description: "Interest rate parity, inflation differentials, trade balances, and RBI currency interventions.",
        lessons: [
          { id: "fx-4", slug: "fx-interest-rate-differentials", title: "Central Bank Rates: How RBI & US Fed Policies Drive Currency Flows", duration: "13m", free: false, completed: false },
          { id: "fx-5", slug: "fx-purchasing-power-parity", title: "Purchasing Power Parity (PPP) & The Big Mac Index Explained", duration: "10m", free: false, completed: false },
          { id: "fx-6", slug: "fx-rbi-fx-reserves-and-intervention", title: "RBI's $650B+ FX Reserves: Defending the Rupee from Volatility", duration: "12m", free: false, completed: false },
        ],
      },
      {
        id: "level-3",
        title: "Level 3: Hedging & Corporate Currency Risk",
        description: "Forwards, futures, options, and export-import currency risk management.",
        lessons: [
          { id: "fx-7", slug: "fx-currency-forward-contracts", title: "Currency Forward Contracts: Locking in Exchange Rates for Exporters", duration: "13m", free: false, completed: false },
          { id: "fx-8", slug: "fx-hedging-rupee-volatility", title: "Hedging INR Volatility: Practical Case Studies for Indian Businesses", duration: "14m", free: false, completed: false },
        ],
      },
    ],
  },
  "technical-analysis": {
    id: "technical-analysis",
    slug: "technical-analysis",
    title: "Technical Analysis",
    description: "Read charts, spot patterns, analyze indicators, and execute trades with precision and volume confirmation.",
    icon: "📊",
    color: "#F97316",
    levelBadge: "Intermediate",
    levels: [
      {
        id: "level-1",
        title: "Level 1: Pure Price Action & Candlestick Anatomy",
        description: "Support, resistance, trendlines, and candlestick psychology.",
        lessons: [
          { id: "ta-1", slug: "ta-candlestick-anatomy-psychology", title: "Candlestick Anatomy: The Battle Between Buyers and Sellers", duration: "8m", free: true, completed: false },
          { id: "ta-2", slug: "ta-support-resistance-breakouts", title: "Horizontal Support & Resistance: Finding Institutional Zones", duration: "10m", free: true, completed: false },
          { id: "ta-3", slug: "ta-trendlines-and-channels", title: "Trendlines and Channels: Following the Path of Least Resistance", duration: "9m", free: true, completed: false },
          { id: "ta-4", slug: "ta-volume-confirmation-secrets", title: "Volume: The Only Indicator That Never Lies on Institutional Intent", duration: "11m", free: true, completed: false },
        ],
      },
      {
        id: "level-2",
        title: "Level 2: Moving Averages & Momentum Indicators",
        description: "RSI divergence, MACD crossovers, Bollinger Bands, and Average True Range.",
        lessons: [
          { id: "ta-5", slug: "ta-moving-averages-20-50-200", title: "Moving Averages: 20 EMA for Momentum, 200 SMA for Trend", duration: "11m", free: false, completed: false },
          { id: "ta-6", slug: "ta-rsi-divergence-strategy", title: "RSI Regular & Hidden Divergences: Catching Exhaustion Tops and Bottoms", duration: "13m", free: false, completed: false },
          { id: "ta-7", slug: "ta-macd-histogram-crossovers", title: "MACD: Momentum Shifts and Histogram Acceleration", duration: "10m", free: false, completed: false },
          { id: "ta-8", slug: "ta-bollinger-bands-volatility-squeeze", title: "Bollinger Bands: Spotting Volatility Squeezes Before Explosive Moves", duration: "12m", free: false, completed: false },
        ],
      },
      {
        id: "level-3",
        title: "Level 3: Multi-Timeframe Strategy & Risk Execution",
        description: "Aligning daily trend with 15-minute entry triggers and strict stop-loss execution.",
        lessons: [
          { id: "ta-9", slug: "ta-multi-timeframe-confluence", title: "Multi-Timeframe Analysis: Trading with the Higher-Timeframe Trend", duration: "14m", free: false, completed: false },
          { id: "ta-10", slug: "ta-chart-patterns-head-shoulders", title: "Classic Chart Patterns: Head & Shoulders, Double Bottoms & Flags", duration: "12m", free: false, completed: false },
          { id: "ta-11", slug: "ta-fibonacci-retracements", title: "Fibonacci Retracements: The 50% and 61.8% Institutional Pullbacks", duration: "13m", free: false, completed: false },
          { id: "ta-12", slug: "ta-building-a-complete-trading-system", title: "Building a Rule-Based Trading System: Entry, Stop-Loss & Target Rules", duration: "15m", free: false, completed: false },
        ],
      },
    ],
  },
};

export default function TrackDetailPage({ params }: { params: { trackId: string } }) {
  const rawTrackId = (params?.trackId || "").toLowerCase().trim();

  // Find fallback match first
  const fallback = useMemo(() => {
    return (
      TRACK_FALLBACKS[rawTrackId] ||
      Object.values(TRACK_FALLBACKS).find((t) => t.id === rawTrackId || t.slug === rawTrackId) ||
      TRACK_FALLBACKS["personal-finance"]
    );
  }, [rawTrackId]);

  const [trackData, setTrackData] = useState<TrackDetailData>(fallback);
  const [openLevel, setOpenLevel] = useState<string | null>("level-1");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Load dynamic data from Supabase
  useEffect(() => {
    let mounted = true;

    async function fetchTrack() {
      try {
        setLoading(true);
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (mounted) setUser(currentUser);

        // Fetch completed lesson IDs
        let completedSet = new Set<string>();
        if (currentUser) {
          const { data: prog } = await supabase
            .from("user_progress")
            .select("lesson_id")
            .eq("user_id", currentUser.id)
            .or("completed.eq.true,quiz_score.gt.0");

          if (prog) {
            completedSet = new Set(prog.map((p: any) => p.lesson_id));
          }
        }

        // Fetch track with levels & lessons
        let query = supabase.from("tracks").select(`
          id, slug, title, description, icon, color_hex,
          levels (
            id, track_id, title, slug, description, order_index,
            lessons (
              id, level_id, title, slug, duration_minutes, is_free, is_published, order_index
            )
          )
        `);

        // Check if rawTrackId looks like a UUID or slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawTrackId);
        if (isUUID) {
          query = query.eq("id", rawTrackId);
        } else {
          query = query.or(`slug.eq.${rawTrackId},slug.ilike.%${rawTrackId}%`);
        }

        const { data: dbTracks } = await query.limit(1);

        if (dbTracks && dbTracks.length > 0 && mounted) {
          const t = dbTracks[0];

          const sortedLevels: LevelGroup[] = (t.levels || [])
            .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
            .map((lv: any, idx: number) => {
              const lessons: LessonItem[] = (lv.lessons || [])
                .filter((l: any) => l.is_published !== false)
                .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
                .map((l: any) => ({
                  id: l.id,
                  slug: l.slug,
                  title: l.title || "Lesson",
                  duration: l.duration_minutes ? `${l.duration_minutes}m` : "8m",
                  duration_minutes: l.duration_minutes || 8,
                  free: l.is_free !== false,
                  completed: completedSet.has(l.id),
                }));

              return {
                id: lv.id || `level-${idx + 1}`,
                title: lv.title || `Level ${idx + 1}`,
                description: lv.description || "Master these lessons in order.",
                lessons,
              };
            })
            .filter((lv: LevelGroup) => lv.lessons.length > 0);

          if (sortedLevels.length > 0) {
            setTrackData({
              id: t.slug || t.id,
              slug: t.slug || fallback.slug,
              title: t.title || fallback.title,
              description: t.description || fallback.description,
              icon: fallback.icon || t.icon || "📚",
              color: t.color_hex || fallback.color,
              levelBadge: fallback.levelBadge,
              levels: sortedLevels,
            });

            // Open first level by default
            setOpenLevel(sortedLevels[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching track detail:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchTrack();
    return () => {
      mounted = false;
    };
  }, [rawTrackId, fallback]);

  // Compute total and completed stats
  const { totalLessons, completedCount, percentComplete, firstUncompletedLesson } = useMemo(() => {
    let total = 0;
    let completed = 0;
    let firstUncompleted: LessonItem | null = null;

    trackData.levels.forEach((lv) => {
      lv.lessons.forEach((ls) => {
        total++;
        if (ls.completed) {
          completed++;
        } else if (!firstUncompleted) {
          firstUncompleted = ls;
        }
      });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalLessons: total,
      completedCount: completed,
      percentComplete: percent,
      firstUncompletedLesson: firstUncompleted || trackData.levels[0]?.lessons[0] || null,
    };
  }, [trackData]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#1A1A2E]">
      
      {/* ── Top Header Banner (Detail Page) ─────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1120px] mx-auto px-6 py-10">
          
          {/* Breadcrumb Back Link */}
          <Link 
            href="/explore" 
            className="inline-flex items-center gap-2 text-[13px] font-bold text-gray-500 hover:text-[#0E6163] mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to All Tracks
          </Link>

          {/* Track Banner Info */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="flex items-start gap-6">
              
              {/* Large Track Icon */}
              <div 
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shrink-0 shadow-sm" 
                style={{ 
                  background: `${trackData.color}15`,
                  border: `1.5px solid ${trackData.color}35`
                }}
              >
                {trackData.icon}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-gray-200/60">
                    {trackData.levelBadge}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">
                    Syllabus Overview
                  </span>
                </div>

                <h1 
                  className="text-[34px] md:text-[42px] font-bold text-[#0A1628] leading-[1.15] mb-3 tracking-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {trackData.title}
                </h1>

                <p className="text-[15px] text-gray-500 max-w-2xl leading-relaxed mb-4">
                  {trackData.description}
                </p>

                {/* Badges / Stats */}
                <div className="flex flex-wrap items-center gap-5 text-[13px] font-bold text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#0E6163]" /> {totalLessons} Lessons
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#0E6163]" /> {trackData.levels.length} Levels
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {percentComplete}% Completed ({completedCount}/{totalLessons})
                  </span>
                </div>
              </div>

            </div>

            {/* Quick Action Button */}
            {firstUncompletedLesson && (
              <div className="shrink-0 md:self-center">
                <Link
                  href={`/learn/${firstUncompletedLesson.slug || firstUncompletedLesson.id}`}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#0E6163] hover:bg-[#0A4A4C] text-white rounded-2xl text-[14px] font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {completedCount > 0 ? "Continue Learning" : "Start Level 1"}
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Progressive Disclosure Curriculum Accordion ──────────── */}
      <div className="max-w-[920px] mx-auto px-6 py-12">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[20px] font-bold text-[#0A1628]">Course Syllabus</h2>
            <p className="text-[13px] text-gray-500">Click a level to view its structured lessons.</p>
          </div>
          <button
            onClick={() => {
              if (openLevel) setOpenLevel(null);
              else setOpenLevel(trackData.levels[0]?.id || null);
            }}
            className="text-[13px] font-bold text-[#0E6163] hover:underline"
          >
            {openLevel ? "Collapse All" : "Expand First Level"}
          </button>
        </div>

        {/* Accordion Stack */}
        <div className="space-y-4">
          {trackData.levels.map((level, levelIdx) => {
            const isOpen = openLevel === level.id;
            const levelCompletedCount = level.lessons.filter((l) => l.completed).length;
            const isLevelFinished = level.lessons.length > 0 && levelCompletedCount === level.lessons.length;

            return (
              <div 
                key={level.id} 
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:border-gray-300 transition-all"
              >
                
                {/* Level Header Button */}
                <button 
                  onClick={() => setOpenLevel(isOpen ? null : level.id)}
                  className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50/70 transition-colors text-left"
                >
                  <div className="flex items-start gap-4">
                    
                    {/* Level Number Pill */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0 mt-0.5 ${
                      isLevelFinished 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}>
                      {isLevelFinished ? <Check className="w-5 h-5 text-emerald-700 stroke-[3]" /> : levelIdx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-[18px] font-bold text-[#0A1628] leading-snug">
                          {level.title}
                        </h3>
                        {isLevelFinished && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full uppercase">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                        {level.description}
                      </p>
                      <div className="text-[12px] font-semibold text-gray-400 mt-2">
                        {level.lessons.length} lessons {levelCompletedCount > 0 && `• ${levelCompletedCount}/${level.lessons.length} finished`}
                      </div>
                    </div>

                  </div>

                  <div className="ml-4 shrink-0">
                    <div className={`w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-[#0E6163]/10 border-[#0E6163]/30 text-[#0E6163]" : "text-gray-400"
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* Lessons List (Revealed when open) */}
                {isOpen && (
                  <div className="border-t border-gray-100 p-2.5 bg-[#FAFBFD]/50 divide-y divide-gray-100/80">
                    {level.lessons.map((lesson, lessonIdx) => {
                      const lessonTarget = lesson.slug || lesson.id;

                      return (
                        <Link 
                          key={lesson.id} 
                          href={`/learn/${lessonTarget}`}
                          className="flex items-center justify-between p-4 rounded-xl hover:bg-white hover:shadow-xs border border-transparent hover:border-gray-200 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            
                            {/* Step Indicator */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-colors ${
                              lesson.completed 
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                                : "bg-gray-100 text-gray-500 group-hover:bg-[#0E6163] group-hover:text-white"
                            }`}>
                              {lesson.completed ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                lessonIdx + 1
                              )}
                            </div>

                            <div>
                              <p className="text-[14px] font-semibold text-[#0A1628] group-hover:text-[#0E6163] transition-colors leading-snug">
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[12px] text-gray-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{lesson.duration}</span>
                              </div>
                            </div>
                          </div>

                          {/* Free / Pro Badges & Play Icon */}
                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            {lesson.free ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded uppercase tracking-wider">
                                Free
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Pro
                              </span>
                            )}
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 group-hover:text-[#0E6163] group-hover:bg-[#0E6163]/10 transition-all">
                              <Play className="w-4 h-4" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-8 bg-white border border-gray-200 rounded-3xl text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3">
            🏆
          </div>
          <h3 className="text-lg font-bold text-[#0A1628] mb-1">
            Complete this track to earn the {trackData.title} Certificate
          </h3>
          <p className="text-sm text-gray-500 max-w-lg mx-auto mb-5">
            Every completed lesson and quiz score contributes to your official FinanceHub mastery credentials.
          </p>
          {firstUncompletedLesson && (
            <Link
              href={`/learn/${firstUncompletedLesson.slug || firstUncompletedLesson.id}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0E6163] text-white text-sm font-bold rounded-xl hover:bg-[#0A4A4C] shadow-sm transition-all"
            >
              Continue Track
            </Link>
          )}
        </div>

      </div>

    </div>
  );
}
