'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, ArrowRight, BookOpen, Clock, CheckCircle2, 
  Sparkles, Filter, X, TrendingUp, CandlestickChart, 
  Bitcoin, Briefcase, LineChart, Brain, Globe, Landmark,
  ShieldCheck, Layers, Award
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ============================================================
// FinanceHub — Explore Courses & 8 Master Disciplines (10/10)
// app/explore/page.tsx
// Rich Domain Visuals · 8 Sovereign Tracks · Zero-Latency Vector Graphics
// ============================================================

export interface ExploreTrack {
  id: string;
  slug: string;
  title: string;
  categoryName: string;
  icon: any;
  visualType: 'compounding' | 'candlestick' | 'crypto' | 'runway' | 'wave' | 'synapse' | 'forex' | 'tax';
  lessons: number;
  completedLessons?: number;
  color: string;
  accentBg: string;
  borderHover: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  topics: string[];
}

// ────────────────────────────────────────────────────────────
// Bespoke Zero-Latency Financial Vector Visuals
// ────────────────────────────────────────────────────────────

function CompoundingVisual() {
  return (
    <div className="w-full h-24 relative overflow-hidden flex items-end">
      <svg className="w-full h-20" viewBox="0 0 200 80" fill="none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="comp-grad-exp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d="M0,75 Q60,72 100,55 T180,10 L200,8 L200,80 L0,80 Z" fill="url(#comp-grad-exp)" />
        <path d="M0,75 Q60,72 100,55 T180,10 L200,8" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="180" cy="10" r="4" fill="#10B981" className="animate-ping" style={{ transformOrigin: '180px 10px' }} />
        <circle cx="180" cy="10" r="3.5" fill="#0A1628" stroke="#10B981" strokeWidth="2" />
      </svg>
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-mono font-bold text-emerald-600">
        12% CAGR
      </div>
    </div>
  );
}

function CandlestickVisual() {
  return (
    <div className="w-full h-24 relative flex items-center justify-between px-3">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:10px_10px]" />
      <svg className="w-full h-18" viewBox="0 0 180 60" fill="none">
        {/* Candle 1: Bullish */}
        <line x1="20" y1="10" x2="20" y2="50" stroke="#10B981" strokeWidth="1.5" />
        <rect x="15" y="22" width="10" height="18" rx="1.5" fill="#10B981" />
        {/* Candle 2: Bullish */}
        <line x1="45" y1="8" x2="45" y2="45" stroke="#10B981" strokeWidth="1.5" />
        <rect x="40" y="15" width="10" height="20" rx="1.5" fill="#10B981" />
        {/* Candle 3: Bearish */}
        <line x1="70" y1="15" x2="70" y2="52" stroke="#EF4444" strokeWidth="1.5" />
        <rect x="65" y="20" width="10" height="16" rx="1.5" fill="#EF4444" />
        {/* Candle 4: Bullish */}
        <line x1="95" y1="6" x2="95" y2="40" stroke="#10B981" strokeWidth="1.5" />
        <rect x="90" y="12" width="10" height="18" rx="1.5" fill="#10B981" />
        {/* Candle 5: Bearish */}
        <line x1="120" y1="12" x2="120" y2="48" stroke="#EF4444" strokeWidth="1.5" />
        <rect x="115" y="18" width="10" height="14" rx="1.5" fill="#EF4444" />
        {/* Candle 6: Bullish Breakout */}
        <line x1="145" y1="4" x2="145" y2="35" stroke="#10B981" strokeWidth="1.5" />
        <rect x="140" y="8" width="10" height="20" rx="1.5" fill="#10B981" />
        {/* 20-MA Trendline */}
        <path d="M10,40 Q60,32 100,24 T160,10" stroke="#2563EB" strokeWidth="2" strokeDasharray="3 3" fill="none" />
      </svg>
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-mono font-bold text-blue-600">
        NIFTY +1.4%
      </div>
    </div>
  );
}

function CryptoMeshVisual() {
  return (
    <div className="w-full h-24 relative flex items-center justify-center overflow-hidden">
      <svg className="w-full h-20" viewBox="0 0 200 70" fill="none">
        <line x1="40" y1="35" x2="100" y2="20" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="100" y1="20" x2="160" y2="35" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="40" y1="35" x2="100" y2="55" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="100" y1="55" x2="160" y2="35" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="100" y1="20" x2="100" y2="55" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.4" />
        
        {/* Node 1: BTC */}
        <circle cx="40" cy="35" r="14" fill="#0A1628" stroke="#F59E0B" strokeWidth="2" />
        <text x="40" y="39" textAnchor="middle" fill="#F59E0B" fontSize="11" fontWeight="bold">₿</text>
        
        {/* Node 2: Core Network */}
        <circle cx="100" cy="20" r="12" fill="#0A1628" stroke="#8B5CF6" strokeWidth="2" />
        <text x="100" y="24" textAnchor="middle" fill="#C4B5FD" fontSize="10" fontWeight="bold">Ξ</text>

        {/* Node 3: Solana / Token */}
        <circle cx="160" cy="35" r="14" fill="#0A1628" stroke="#10B981" strokeWidth="2" />
        <text x="160" y="39" textAnchor="middle" fill="#34D399" fontSize="10" fontWeight="bold">SOL</text>

        {/* Node 4: Validator */}
        <circle cx="100" cy="55" r="9" fill="#0A1628" stroke="#8B5CF6" strokeWidth="1.5" />
        <circle cx="100" cy="55" r="3" fill="#A78BFA" />
      </svg>
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] font-mono font-bold text-purple-600">
        PoS Consensus
      </div>
    </div>
  );
}

function CorporateRunwayVisual() {
  return (
    <div className="w-full h-24 relative flex items-end justify-between px-4 pb-2">
      <svg className="w-full h-18" viewBox="0 0 180 60" fill="none">
        {/* Month 1 */}
        <rect x="15" y="35" width="12" height="22" rx="2" fill="#F87171" />
        <rect x="30" y="25" width="12" height="32" rx="2" fill="#34D399" />
        {/* Month 2 */}
        <rect x="60" y="30" width="12" height="27" rx="2" fill="#F87171" />
        <rect x="75" y="18" width="12" height="39" rx="2" fill="#34D399" />
        {/* Month 3: Cashflow Positive */}
        <rect x="105" y="25" width="12" height="32" rx="2" fill="#F87171" />
        <rect x="120" y="10" width="12" height="47" rx="2" fill="#34D399" />
        {/* Break-even line */}
        <line x1="5" y1="28" x2="175" y2="28" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-mono font-bold text-amber-600">
        Runway: 18 Mo
      </div>
    </div>
  );
}

function TechnicalWaveVisual() {
  return (
    <div className="w-full h-24 relative flex items-center justify-center overflow-hidden">
      <svg className="w-full h-18" viewBox="0 0 180 60" fill="none">
        {/* Upper Bollinger Band */}
        <path d="M0,15 Q45,8 90,16 T180,12" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="2 2" />
        {/* Middle Band / SMA */}
        <path d="M0,30 Q45,22 90,32 T180,26" stroke="#0891B2" strokeWidth="1.5" />
        {/* Lower Bollinger Band */}
        <path d="M0,45 Q45,38 90,48 T180,42" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="2 2" />
        {/* Oscillating Price */}
        <path d="M0,35 Q25,12 50,28 T100,16 T150,38 T180,22" stroke="#0284C7" strokeWidth="2.5" fill="none" />
      </svg>
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] font-mono font-bold text-cyan-600">
        RSI: 64 Bullish
      </div>
    </div>
  );
}

function BehavioralSynapseVisual() {
  return (
    <div className="w-full h-24 relative flex items-center justify-center overflow-hidden">
      <svg className="w-full h-18" viewBox="0 0 180 60" fill="none">
        <path d="M30,30 C60,10 80,50 110,25 S140,40 165,20" stroke="#F43F5E" strokeWidth="2" strokeOpacity="0.5" fill="none" />
        <circle cx="30" cy="30" r="7" fill="#0A1628" stroke="#F43F5E" strokeWidth="2" />
        <circle cx="70" cy="22" r="5" fill="#0A1628" stroke="#FB7185" strokeWidth="1.5" />
        <circle cx="110" cy="25" r="8" fill="#0A1628" stroke="#F43F5E" strokeWidth="2" />
        <circle cx="140" cy="35" r="5" fill="#0A1628" stroke="#FB7185" strokeWidth="1.5" />
        <circle cx="165" cy="20" r="7" fill="#0A1628" stroke="#10B981" strokeWidth="2" />
      </svg>
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] font-mono font-bold text-rose-600">
        FOMO Guard
      </div>
    </div>
  );
}

function ForexOrbitVisual() {
  return (
    <div className="w-full h-24 relative flex items-center justify-center overflow-hidden">
      <svg className="w-full h-20" viewBox="0 0 180 70" fill="none">
        <ellipse cx="90" cy="35" rx="70" ry="22" stroke="#0D9488" strokeWidth="1.5" strokeOpacity="0.35" strokeDasharray="3 3" />
        {/* Currency Nodes */}
        <circle cx="35" cy="35" r="11" fill="#0A1628" stroke="#0D9488" strokeWidth="2" />
        <text x="35" y="39" textAnchor="middle" fill="#2DD4BF" fontSize="10" fontWeight="bold">₹</text>

        <circle cx="90" cy="15" r="11" fill="#0A1628" stroke="#0D9488" strokeWidth="2" />
        <text x="90" y="19" textAnchor="middle" fill="#2DD4BF" fontSize="10" fontWeight="bold">$</text>

        <circle cx="145" cy="35" r="11" fill="#0A1628" stroke="#0D9488" strokeWidth="2" />
        <text x="145" y="39" textAnchor="middle" fill="#2DD4BF" fontSize="10" fontWeight="bold">€</text>
      </svg>
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded text-[10px] font-mono font-bold text-teal-600">
        USD/INR 86.82
      </div>
    </div>
  );
}

function TaxRegimeVisual() {
  return (
    <div className="w-full h-24 relative flex items-center justify-between px-4 pb-1">
      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2 mr-2">
        <p className="text-[9px] font-bold text-gray-500 uppercase">Old Regime</p>
        <p className="text-[12px] font-mono font-bold text-[#0A1628]">80C + HRA</p>
      </div>
      <div className="flex-1 bg-amber-50/60 border border-amber-200 rounded-xl p-2">
        <p className="text-[9px] font-bold text-amber-700 uppercase">New FY25-26</p>
        <p className="text-[12px] font-mono font-bold text-[#D97706]">₹7.75L Nil Tax</p>
      </div>
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded text-[10px] font-mono font-bold text-orange-600">
        Sec 87A
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// The 8 Sovereign Master Tracks Definition
// ────────────────────────────────────────────────────────────

const DEFAULT_TRACKS: ExploreTrack[] = [
  {
    id: "personal-finance",
    slug: "personal-finance",
    title: "Personal Finance & Wealth",
    categoryName: "Wealth & Compounding",
    icon: TrendingUp,
    visualType: "compounding",
    lessons: 73,
    color: "#10B981",
    accentBg: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    borderHover: "hover:border-emerald-500 hover:shadow-emerald-500/10",
    level: "Beginner",
    description: "Budgeting, 6-month emergency reserves, disciplined SIP index investing, debt elimination, and insurance safety nets.",
    topics: ["50/30/20 Rule", "SIP & Step-Up Compounding", "Index Funds vs Active", "Emergency Reserves", "Term Insurance"],
  },
  {
    id: "trading-markets",
    slug: "trading-markets",
    title: "Indian Equities & F&O Trading",
    categoryName: "Market Execution",
    icon: CandlestickChart,
    visualType: "candlestick",
    lessons: 51,
    color: "#2563EB",
    accentBg: "from-blue-500/10 via-blue-500/5 to-transparent",
    borderHover: "hover:border-blue-500 hover:shadow-blue-500/10",
    level: "Intermediate",
    description: "Master candlestick price action, market microstructure, Nifty/BankNifty options hedging, and SEBI-aligned risk management.",
    topics: ["Candlestick Geometry", "Support & Resistance", "Options Greeks & Delta", "Risk-to-Reward Ratio", "Stop Loss Discipline"],
  },
  {
    id: "crypto-defi",
    slug: "crypto-defi",
    title: "Crypto Assets & Web3 Architecture",
    categoryName: "Decentralized Finance",
    icon: Bitcoin,
    visualType: "crypto",
    lessons: 36,
    color: "#8B5CF6",
    accentBg: "from-purple-500/10 via-purple-500/5 to-transparent",
    borderHover: "hover:border-purple-500 hover:shadow-purple-500/10",
    level: "Beginner",
    description: "Bitcoin proof-of-work, Ethereum smart contracts, self-custody hardware security, AMM liquidity pools, and Indian 30% crypto tax.",
    topics: ["Blockchain Architecture", "Hardware Self-Custody", "Smart Contract Logic", "DeFi Yield Protocols", "Section 115BBH VDA Tax"],
  },
  {
    id: "corporate-finance",
    slug: "corporate-finance",
    title: "Corporate Finance & Startup Valuation",
    categoryName: "Business & Venture",
    icon: Briefcase,
    visualType: "runway",
    lessons: 43,
    color: "#F59E0B",
    accentBg: "from-amber-500/10 via-amber-500/5 to-transparent",
    borderHover: "hover:border-amber-500 hover:shadow-amber-500/10",
    level: "Advanced",
    description: "Read 3-statement financial models, execute DCF business valuations, calculate startup burn runway, cap tables, and ESOP dilution.",
    topics: ["Balance Sheet Auditing", "DCF & Enterprise Value", "Burn Rate & Runway", "Cap Tables & Dilution", "EBITDA vs Free Cash Flow"],
  },
  {
    id: "technical-analysis",
    slug: "technical-analysis",
    title: "Technical Analysis & Chart Geometry",
    categoryName: "Quantitative Timing",
    icon: LineChart,
    visualType: "wave",
    lessons: 44,
    color: "#06B6D4",
    accentBg: "from-cyan-500/10 via-cyan-500/5 to-transparent",
    borderHover: "hover:border-cyan-500 hover:shadow-cyan-500/10",
    level: "Intermediate",
    description: "Volume-weighted confirmation, Moving Average crossovers, RSI divergences, Fibonacci retracements, and multi-timeframe trade entries.",
    topics: ["RSI Divergence Setup", "Volume Spread Analysis", "Fibonacci Retracements", "Bollinger Band Squeeze", "Multi-Timeframe Confluence"],
  },
  {
    id: "behavioral-finance",
    slug: "behavioral-finance",
    title: "Behavioral Finance & Investor Psychology",
    categoryName: "Mindset & Execution",
    icon: Brain,
    visualType: "synapse",
    lessons: 23,
    color: "#F43F5E",
    accentBg: "from-rose-500/10 via-rose-500/5 to-transparent",
    borderHover: "hover:border-rose-500 hover:shadow-rose-500/10",
    level: "Intermediate",
    description: "Conquer the neurological biases that destroy wealth: FOMO panic buying, sunk-cost entrapment, disposition effects, and overconfidence.",
    topics: ["FOMO Neutralization", "Loss Aversion Asymmetry", "Sunk Cost Eradication", "Gambler's Fallacy", "Automated Trading Rules"],
  },
  {
    id: "forex-currency",
    slug: "forex-currency",
    title: "Forex & Global Macroeconomics",
    categoryName: "Global Capital",
    icon: Globe,
    visualType: "forex",
    lessons: 26,
    color: "#0D9488",
    accentBg: "from-teal-500/10 via-teal-500/5 to-transparent",
    borderHover: "hover:border-teal-500 hover:shadow-teal-500/10",
    level: "Advanced",
    description: "Understand the $7.5 trillion daily global forex market, central bank interest rate differentials, currency swaps, and RBI LRS limits.",
    topics: ["USD/INR Microstructure", "RBI Forex Reserve Dynamics", "Interest Rate Parity", "Currency Pegs & Devaluation", "Liberalised Remittance Scheme"],
  },
  {
    id: "tax-law",
    slug: "tax-law",
    title: "Indian Taxation FY 2025-26 & Regulations",
    categoryName: "Tax Optimization & Legal",
    icon: Landmark,
    visualType: "tax",
    lessons: 38,
    color: "#EA580C",
    accentBg: "from-orange-500/10 via-orange-500/5 to-transparent",
    borderHover: "hover:border-orange-500 hover:shadow-orange-500/10",
    level: "Beginner",
    description: "Navigate the Union Budget FY 2025-26 updates: New vs. Old Tax Regime mathematical breakdown, Section 87A rebate, LTCG/STCG, and corporate tax.",
    topics: ["New vs Old Slab Comparison", "80C, 80D & HRA Rules", "Equity LTCG (12.5%) & STCG", "Section 87A ₹7.75L Rebate", "Advance Tax Calendar"],
  },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");
  const [tracks, setTracks] = useState<ExploreTrack[]>(DEFAULT_TRACKS);
  const [user, setUser] = useState<any>(null);

  // Fetch live stats & user progress from Supabase
  useEffect(() => {
    let mounted = true;

    async function loadLiveData() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (mounted) setUser(currentUser);

        // Fetch tracks with their actual lessons count
        const { data: dbTracks } = await supabase
          .from("tracks")
          .select(`
            id, slug, title, description, icon, color_hex,
            levels (
              id,
              lessons ( id, is_published )
            )
          `);

        // Fetch user progress if logged in
        let completedLessonIds = new Set<string>();
        if (currentUser) {
          const { data: prog } = await supabase
            .from("user_progress")
            .select("lesson_id")
            .eq("user_id", currentUser.id)
            .or("completed.eq.true,quiz_score.gt.0");
          if (prog) {
            completedLessonIds = new Set(prog.map((p: any) => p.lesson_id));
          }
        }

        if (dbTracks && dbTracks.length > 0 && mounted) {
          const merged = DEFAULT_TRACKS.map((defTrack) => {
            const match = dbTracks.find(
              (dt: any) => dt.slug === defTrack.slug || dt.id === defTrack.id || dt.title?.toLowerCase() === defTrack.title.toLowerCase()
            );

            if (!match) return defTrack;

            let liveLessonCount = 0;
            let liveCompleted = 0;

            if (match.levels) {
              match.levels.forEach((lv: any) => {
                const publishedLessons = (lv.lessons || []).filter((l: any) => l.is_published !== false);
                liveLessonCount += publishedLessons.length;
                publishedLessons.forEach((l: any) => {
                  if (completedLessonIds.has(l.id)) liveCompleted++;
                });
              });
            }

            return {
              ...defTrack,
              id: match.slug || defTrack.id,
              lessons: liveLessonCount > 0 ? liveLessonCount : defTrack.lessons,
              completedLessons: liveCompleted,
            };
          });

          setTracks(merged);
        }
      } catch (err) {
        console.error("Failed to load live tracks:", err);
      }
    }

    loadLiveData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filtered tracks based on search & level
  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.topics.some((top) => top.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchLevel = levelFilter === "All" || t.level === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [tracks, searchQuery, levelFilter]);

  const totalLessons = useMemo(() => {
    return tracks.reduce((sum, t) => sum + t.lessons, 0);
  }, [tracks]);

  // Render appropriate vector component
  const renderVisual = (type: ExploreTrack['visualType']) => {
    switch (type) {
      case 'compounding': return <CompoundingVisual />;
      case 'candlestick': return <CandlestickVisual />;
      case 'crypto': return <CryptoMeshVisual />;
      case 'runway': return <CorporateRunwayVisual />;
      case 'wave': return <TechnicalWaveVisual />;
      case 'synapse': return <BehavioralSynapseVisual />;
      case 'forex': return <ForexOrbitVisual />;
      case 'tax': return <TaxRegimeVisual />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1A1A2E] overflow-x-hidden">
      
      {/* ── Institutional Hero Header ────────────────────────────── */}
      <div className="bg-[#0A1628] text-white relative overflow-hidden border-b border-gray-800">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-[1280px] mx-auto px-6 py-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-400 border border-white/10 text-[12px] font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Eight Sovereign Financial Academies
          </div>

          <h1
            className="text-[42px] md:text-[54px] font-bold text-white leading-[1.1] mb-4 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Explore Curriculum & <span className="text-emerald-400">Master Disciplines.</span>
          </h1>
          <p className="text-[17px] text-gray-300 max-w-2xl mb-10 leading-relaxed">
            Step directly into the financial world. Every discipline is structured with first-principles theory, interactive laboratory calculators, and verified Indian regulatory context.
          </p>

          {/* Metric Badges Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-white">{totalLessons}+</p>
                <p className="text-xs text-gray-400 font-medium">Curated Lessons</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-white">8</p>
                <p className="text-xs text-gray-400 font-medium">Master Tracks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-white">15</p>
                <p className="text-xs text-gray-400 font-medium">Interactive Labs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-white">100%</p>
                <p className="text-xs text-gray-400 font-medium">Conflict-Free</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Discovery Content ───────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        
        {/* Search & Level Filter Control Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by track, topic, or concept (e.g. SIP, Candlesticks, Section 80C, DCF Valuation)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-10 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[14px] text-[#0A1628] outline-none focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Level Filter Switcher */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 hidden lg:inline">
              Difficulty:
            </span>
            {(["All", "Beginner", "Intermediate", "Advanced"] as const).map((lvl) => {
              const active = levelFilter === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap ${
                    active
                      ? "bg-[#0A1628] text-white shadow-md shadow-[#0A1628]/10"
                      : "bg-[#F8FAFC] text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

        </div>

        {/* Empty State */}
        {filteredTracks.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center text-2xl mx-auto mb-4">
              🔍
            </div>
            <h3 className="text-lg font-bold text-[#0A1628] mb-1">No courses match your criteria</h3>
            <p className="text-sm text-gray-500 mb-6">Try searching for broader financial terms or resetting the difficulty filter.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setLevelFilter("All");
              }}
              className="px-6 py-2.5 bg-[#0A1628] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#1E293B] transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ── 8 Master Disciplines Grid (Visual Richness Standard) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTracks.map((track) => {
            const hasProgress = track.completedLessons !== undefined && track.completedLessons > 0;
            const progressPercent = hasProgress
              ? Math.min(100, Math.round((track.completedLessons! / track.lessons) * 100))
              : 0;

            const IconComponent = track.icon;

            return (
              <Link 
                key={track.id} 
                href={`/explore/${track.id}`}
                className={`group bg-white rounded-3xl border border-gray-200 ${track.borderHover} hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden relative`}
              >
                {/* Gradient Accent Header Area with Embedded Vector Visual */}
                <div className={`w-full bg-gradient-to-b ${track.accentBg} border-b border-gray-100 relative`}>
                  <div className="p-5 pb-0 flex items-center justify-between">
                    <div 
                      className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center border border-gray-200/60"
                      style={{ color: track.color }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 bg-white/80 backdrop-blur-xs text-gray-700 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg border border-gray-200">
                      {track.level}
                    </span>
                  </div>

                  {/* Bespoke Financial SVG Visual */}
                  <div className="pt-1">
                    {renderVisual(track.visualType)}
                  </div>
                </div>
                
                {/* Content Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    {track.categoryName}
                  </span>
                  
                  <h3 className="text-[19px] font-bold text-[#0A1628] mb-2 group-hover:text-[#2563EB] transition-colors leading-snug">
                    {track.title}
                  </h3>

                  <p className="text-[13px] text-gray-500 leading-relaxed mb-5 flex-1 line-clamp-3">
                    {track.description}
                  </p>

                  {/* Core Syllabus Highlight Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {track.topics.slice(0, 3).map((topic, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-600 rounded text-[11px] font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  {/* Progress Bar (if user has progress) */}
                  {hasProgress && (
                    <div className="mb-4 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-1.5">
                        <span>Progress</span>
                        <span className="font-mono" style={{ color: track.color }}>{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%`, backgroundColor: track.color }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Card Bottom CTA Strip */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <span className="text-[13px] font-bold font-mono text-gray-700">
                      {track.lessons} Lessons
                    </span>
                    <span 
                      className="flex items-center gap-1.5 text-[13px] font-bold transition-all group-hover:translate-x-1"
                      style={{ color: track.color }}
                    >
                      Inspect Syllabus <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>

      </div>

      {/* ── Bottom Institutional Trust Strip ──────────────────────── */}
      <div className="bg-white border-t border-gray-200 py-10">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h4 className="text-[16px] font-bold text-[#0A1628]">Can't decide which track to begin with?</h4>
            <p className="text-[13px] text-gray-500 mt-0.5">Take our 2-minute diagnostic or consult the AI Finance Mentor 24/7.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/ai-tutor"
              className="px-5 py-2.5 bg-[#0A1628] text-white rounded-xl text-xs font-bold hover:bg-[#1E293B] transition-all flex items-center gap-2"
            >
              Ask AI Mentor <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link 
              href="/practice"
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:border-[#0A1628] transition-all"
            >
              Test Financial Simulators
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
