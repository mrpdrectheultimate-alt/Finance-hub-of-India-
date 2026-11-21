'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, ArrowRight, Clock, Calculator, 
  TrendingUp, Bitcoin, Target, Zap, BarChart2, 
  PieChart, Landmark, Flame, ShieldAlert, ShieldCheck, 
  Wallet, Percent, Compass, Sparkles, Sliders, ChevronRight,
  Layers, CheckCircle2, Award
} from 'lucide-react';

// ============================================================
// FinanceHub — 10/10 Financial Learning & Interactive Practice Arena
// app/practice/page.tsx
// Rich Domain Visuals · 16 Interactive Simulators · 4 Financial Journeys
// ============================================================

interface Lab {
  id: string;
  title: string;
  description: string;
  icon: any;
  time: string;
  type: 'Calculator' | 'Simulator' | 'Planner' | 'Tracker' | 'Estimator';
  isPopular?: boolean;
  href: string;
  highlight?: string;
  badgeColor?: string;
}

interface Journey {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  themeColor: string;
  accentBg: string;
  borderHover: string;
  labs: Lab[];
}

// ────────────────────────────────────────────────────────────
// Mini Bespoke Vector Visuals for Laboratory Cards
// ────────────────────────────────────────────────────────────

function MiniCandlestick() {
  return (
    <svg className="w-16 h-8" viewBox="0 0 60 30" fill="none">
      <line x1="10" y1="3" x2="10" y2="27" stroke="#10B981" strokeWidth="1" />
      <rect x="7" y="8" width="6" height="12" rx="1" fill="#10B981" />
      <line x1="25" y1="5" x2="25" y2="25" stroke="#EF4444" strokeWidth="1" />
      <rect x="22" y="10" width="6" height="10" rx="1" fill="#EF4444" />
      <line x1="40" y1="2" x2="40" y2="26" stroke="#10B981" strokeWidth="1" />
      <rect x="37" y="6" width="6" height="14" rx="1" fill="#10B981" />
      <line x1="52" y1="6" x2="52" y2="22" stroke="#10B981" strokeWidth="1" />
      <rect x="49" y="9" width="6" height="8" rx="1" fill="#10B981" />
    </svg>
  );
}

function MiniCompounding() {
  return (
    <svg className="w-16 h-8" viewBox="0 0 60 30" fill="none">
      <path d="M0,26 Q20,24 35,16 T58,4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      <circle cx="58" cy="4" r="2.5" fill="#10B981" />
    </svg>
  );
}

function MiniRunway() {
  return (
    <svg className="w-16 h-8" viewBox="0 0 60 30" fill="none">
      <rect x="5" y="15" width="5" height="12" rx="1" fill="#F87171" />
      <rect x="12" y="10" width="5" height="17" rx="1" fill="#34D399" />
      <rect x="22" y="12" width="5" height="15" rx="1" fill="#F87171" />
      <rect x="29" y="6" width="5" height="21" rx="1" fill="#34D399" />
      <rect x="39" y="8" width="5" height="19" rx="1" fill="#F87171" />
      <rect x="46" y="2" width="5" height="25" rx="1" fill="#34D399" />
    </svg>
  );
}

function MiniTaxSlabs() {
  return (
    <div className="flex items-center gap-1 font-mono text-[9px] font-bold">
      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Old</span>
      <span className="text-gray-400">vs</span>
      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">New 87A</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Complete 16 Interactive Labs organized across 4 Financial Journeys
// ────────────────────────────────────────────────────────────

const JOURNEYS: Journey[] = [
  {
    id: 'plan-grow',
    title: '01. Plan & Grow Your Wealth',
    shortTitle: 'Plan & Grow',
    description: 'Build long-term financial independence, calculate retirement corpus runway, and leverage compound interest.',
    themeColor: '#10B981',
    accentBg: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    borderHover: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
    labs: [
      {
        id: 'sip',
        title: 'SIP & Compounding Wealth Calculator',
        description: 'See how monthly investments compound across equities, index mutual funds, and fixed deposits over 30 years.',
        icon: TrendingUp,
        time: '5 min',
        type: 'Calculator',
        isPopular: true,
        href: '/practice/sip',
        highlight: 'Real 12% Indian equity CAGR comparison',
        badgeColor: 'emerald',
      },
      {
        id: 'step-up-sip',
        title: 'Step-Up SIP Compounding Visualizer',
        description: 'Model how increasing your SIP by 10% annually with salary hikes dramatically cuts years off your wealth targets.',
        icon: Percent,
        time: '4 min',
        type: 'Calculator',
        isPopular: true,
        href: '/practice/compound-visualizer',
        highlight: '10% annual salary step-up analysis',
        badgeColor: 'emerald',
      },
      {
        id: 'fire',
        title: 'FIRE Early Retirement Calculator',
        description: 'Model Lean FIRE, Standard FIRE, and Fat FIRE milestones with Indian medical inflation and safe withdrawal rates.',
        icon: Flame,
        time: '5 min',
        type: 'Calculator',
        isPopular: true,
        href: '/practice/fire',
        highlight: '25x - 33x expense milestone models',
        badgeColor: 'emerald',
      },
      {
        id: 'retirement',
        title: 'Retirement Corpus Planner',
        description: 'Determine your post-retirement monthly cash flow needs accounting for healthcare inflation and longevity.',
        icon: Target,
        time: '4 min',
        type: 'Planner',
        isPopular: false,
        href: '/practice/retirement',
        highlight: 'Inflation-adjusted corpus calculator',
        badgeColor: 'emerald',
      },
      {
        id: 'goals',
        title: 'Goal-Based Financial Planner',
        description: 'Plan for home down payments, children education, and emergency funds with time-horizon asset allocation.',
        icon: Compass,
        time: '6 min',
        type: 'Planner',
        isPopular: false,
        href: '/practice/goals',
        highlight: 'Multi-goal prioritization framework',
        badgeColor: 'emerald',
      },
    ],
  },
  {
    id: 'manage-money',
    title: '02. Manage Debt, Cash Flow & Taxes',
    shortTitle: 'Manage & Tax',
    description: 'Optimize everyday financial decisions, loan amortizations, Union Budget tax regimes, and family risk safety nets.',
    themeColor: '#EA580C',
    accentBg: 'from-orange-500/10 via-orange-500/5 to-transparent',
    borderHover: 'hover:border-orange-500 hover:shadow-orange-500/10',
    labs: [
      {
        id: 'emi',
        title: 'Loan & Home EMI Amortizer',
        description: 'Calculate monthly EMIs for home, car, or education loans with prepayment interest savings and tenure reduction.',
        icon: Landmark,
        time: '3 min',
        type: 'Calculator',
        isPopular: true,
        href: '/practice/emi',
        highlight: 'Prepayment interest savings schedule',
        badgeColor: 'orange',
      },
      {
        id: 'tax',
        title: 'Income Tax Calculator FY 2025-26',
        description: 'Compare Old vs New Tax Regime with standard deduction, Section 80C, 80D, Section 87A rebate, and HRA exemptions.',
        icon: Calculator,
        time: '4 min',
        type: 'Calculator',
        isPopular: true,
        href: '/practice/tax',
        highlight: 'Updated FY 2025-26 ₹7.75L nil-tax slabs',
        badgeColor: 'orange',
      },
      {
        id: 'budget',
        title: '50/30/20 Monthly Budget Simulator',
        description: 'Structure your monthly salary into Needs (50%), Wants (30%), and Investments (20%) with expense tracking.',
        icon: PieChart,
        time: '5 min',
        type: 'Simulator',
        isPopular: false,
        href: '/practice/budget',
        highlight: 'Interactive salary allocation sandbox',
        badgeColor: 'orange',
      },
      {
        id: 'insurance',
        title: 'Term & Health Insurance Needs (HLV)',
        description: 'Calculate your Human Life Value (HLV) term insurance cover and family health coverage requirements.',
        icon: ShieldCheck,
        time: '4 min',
        type: 'Estimator',
        isPopular: false,
        href: '/practice/insurance',
        highlight: 'Human Life Value (HLV) formula',
        badgeColor: 'orange',
      },
    ],
  },
  {
    id: 'invest-trade',
    title: '03. Invest, Trade & Navigate Markets',
    shortTitle: 'Invest & Trade',
    description: 'Explore live market microstructure, execute trading setups, and simulate portfolios with virtual capital.',
    themeColor: '#2563EB',
    accentBg: 'from-blue-500/10 via-blue-500/5 to-transparent',
    borderHover: 'hover:border-blue-500 hover:shadow-blue-500/10',
    labs: [
      {
        id: 'paper-trading',
        title: 'Paper Trading Game (NSE/BSE Equities)',
        description: 'Trade Indian blue-chip equities with ₹1,00,000 virtual capital. Practice limit orders, stop-losses, and risk sizing.',
        icon: BarChart2,
        time: '10 min',
        type: 'Simulator',
        isPopular: true,
        href: '/practice/trading',
        highlight: '₹1,00,000 virtual capital sandbox',
        badgeColor: 'blue',
      },
      {
        id: 'crypto',
        title: 'Crypto Paper Trading Terminal',
        description: 'Practice Bitcoin, Ethereum, and major crypto trades with simulated market orders and volatility controls.',
        icon: Bitcoin,
        time: '10 min',
        type: 'Simulator',
        isPopular: true,
        href: '/practice/crypto',
        highlight: 'Live order book & simulated execution',
        badgeColor: 'purple',
      },
      {
        id: 'forex',
        title: 'Forex Currency Trading Simulator',
        description: 'Simulate USD/INR, EUR/USD, and GBP/USD currency pairs with leverage, pip calculations, and margin requirements.',
        icon: Zap,
        time: '8 min',
        type: 'Simulator',
        isPopular: false,
        href: '/practice/forex',
        highlight: 'Leverage and spread simulation',
        badgeColor: 'teal',
      },
      {
        id: 'net-worth',
        title: 'Net Worth & Asset Allocation Tracker',
        description: 'Track assets (real estate, equity, gold, PF) and liabilities over time to monitor your financial freedom ratio.',
        icon: Wallet,
        time: '8 min',
        type: 'Tracker',
        isPopular: false,
        href: '/practice/net-worth',
        highlight: 'Liquid vs illiquid asset distribution',
        badgeColor: 'blue',
      },
      {
        id: 'rebalancer',
        title: 'Portfolio Asset Rebalancer',
        description: 'Calculate exact equity and debt adjustments needed to restore your desired asset allocation during market volatility.',
        icon: PieChart,
        time: '5 min',
        type: 'Calculator',
        isPopular: false,
        href: '/practice/rebalancer',
        highlight: 'Tax-efficient rebalancing model',
        badgeColor: 'blue',
      },
    ],
  },
  {
    id: 'business-risk',
    title: '04. Business, Startup & Stress Scenarios',
    shortTitle: 'Business & Risk',
    description: 'Model corporate cash flows, evaluate startup runway, and stress-test your balance sheet against economic shocks.',
    themeColor: '#F59E0B',
    accentBg: 'from-amber-500/10 via-amber-500/5 to-transparent',
    borderHover: 'hover:border-amber-500 hover:shadow-amber-500/10',
    labs: [
      {
        id: 'startup',
        title: 'Startup Cash Flow & Runway Simulator',
        description: 'Model monthly burn rate, cash runway, customer acquisition cost (CAC), and milestones to break-even profitability.',
        icon: Zap,
        time: '8 min',
        type: 'Simulator',
        isPopular: false,
        href: '/practice/startup-cash-flow',
        highlight: 'Burn rate & runway modeling',
        badgeColor: 'amber',
      },
      {
        id: 'stress',
        title: 'Financial Stress & Liquidity Tester',
        description: 'Simulate 6-month job loss, severe market drawdowns (-40%), and emergency medical shocks on your personal finances.',
        icon: ShieldAlert,
        time: '7 min',
        type: 'Simulator',
        isPopular: false,
        href: '/practice/stress-test',
        highlight: 'Emergency fund survival score',
        badgeColor: 'rose',
      },
    ],
  },
];

export default function FinanceLabsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Featured Lab SIP Preview calculation state
  const [sipMonthly, setSipMonthly] = useState<number>(15000);
  const [sipYears, setSipYears] = useState<number>(15);

  const previewResults = useMemo(() => {
    const rate = 0.12 / 12; // 12% annual
    const months = sipYears * 12;
    const invested = sipMonthly * months;
    const fv = sipMonthly * (((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate));
    const returns = fv - invested;
    return {
      invested: Math.round(invested),
      returns: Math.round(returns),
      total: Math.round(fv),
    };
  }, [sipMonthly, sipYears]);

  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Filter logic across search and category chips
  const filteredJourneys = useMemo(() => {
    return JOURNEYS.map((journey) => {
      if (activeCategory !== 'all' && journey.id !== activeCategory) {
        return null;
      }

      const matchingLabs = journey.labs.filter((lab) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          lab.title.toLowerCase().includes(query) ||
          lab.description.toLowerCase().includes(query) ||
          lab.type.toLowerCase().includes(query) ||
          (lab.highlight && lab.highlight.toLowerCase().includes(query))
        );
      });

      if (matchingLabs.length === 0) return null;

      return {
        ...journey,
        labs: matchingLabs,
      };
    }).filter(Boolean) as Journey[];
  }, [searchQuery, activeCategory]);

  const totalMatchingLabs = filteredJourneys.reduce((sum, j) => sum + j.labs.length, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1A1A2E] overflow-x-hidden">
      
      {/* ── Institutional Hero Header ────────────────────────────── */}
      <div className="bg-[#0A1628] text-white relative overflow-hidden border-b border-gray-800">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-[1280px] mx-auto px-6 py-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-400 border border-white/10 text-[12px] font-bold uppercase tracking-wider mb-6">
            <Compass className="w-3.5 h-3.5" /> 16 Interactive Financial Simulators & Labs
          </div>

          <h1
            className="text-[42px] md:text-[54px] font-bold text-white leading-[1.1] mb-4 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Understand Finance with <span className="text-emerald-400">Real Numbers.</span>
          </h1>
          <p className="text-[17px] text-gray-300 max-w-2xl mb-10 leading-relaxed">
            Move beyond passive reading. Experiment with compound growth, simulate home loan prepayments, analyze FY 2025-26 tax slabs, and trade Indian equities in a virtual sandbox.
          </p>

          {/* Metric Badges Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-white">16</p>
                <p className="text-xs text-gray-400 font-medium">Interactive Labs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-white">4</p>
                <p className="text-xs text-gray-400 font-medium">Financial Journeys</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-white">₹1.0 Lakh</p>
                <p className="text-xs text-gray-400 font-medium">Paper Trading Capital</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-white">100%</p>
                <p className="text-xs text-gray-400 font-medium">Risk-Free Sandbox</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-10">
        
        {/* ══════════════════════════════════════════ */}
        {/* FEATURED LAB SPOTLIGHT HERO (SIP Modeler) */}
        {/* ══════════════════════════════════════════ */}
        <div className="mb-14 bg-white rounded-3xl border border-gray-200 p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left: Featured Lab Details */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-extrabold uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Flagship Laboratory
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider rounded-lg">
                  5 Min Lab
                </span>
              </div>

              <h2 
                className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#0A1628] leading-tight mb-4 tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                SIP & Compounding Wealth Simulator
              </h2>
              
              <p className="text-[15px] text-gray-600 leading-relaxed mb-6">
                Discover how small, disciplined monthly contributions expand into exponential wealth. Compare 12% equity CAGR against inflation, tax brackets, and fixed deposits.
              </p>

              {/* Highlights Checklist */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Real Indian Equity CAGR (12%)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Interactive Year-by-Year Curve</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Section 112A LTCG Estimator</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Export & PDF Plan Summary</span>
                </div>
              </div>

              <div>
                <Link
                  href="/practice/sip"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#0A1628] hover:bg-[#10B981] text-white text-[14px] font-bold shadow-lg shadow-[#0A1628]/10 hover:shadow-emerald-500/20 transition-all w-full sm:w-auto"
                >
                  Launch Full SIP Simulator <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Live Interactive Modeler Preview */}
            <div className="lg:col-span-6 bg-[#F8FAFC] border border-gray-200 rounded-3xl p-7 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Live Mathematical Preview</span>
                </div>
                <span className="text-[11px] text-gray-500 font-mono font-medium">Assumed 12% p.a.</span>
              </div>

              {/* Slider 1: Monthly Investment */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-gray-600">Monthly Contribution</span>
                  <span className="text-[#0A1628] font-bold font-mono text-[15px]">₹{sipMonthly.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="1000"
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                  <span>₹2,000</span>
                  <span>₹50,000</span>
                  <span>₹1,00,000</span>
                </div>
              </div>

              {/* Slider 2: Time Horizon */}
              <div className="mb-7">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-gray-600">Time Horizon</span>
                  <span className="text-[#0A1628] font-bold font-mono text-[15px]">{sipYears} Years</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                  <span>3 Yrs</span>
                  <span>15 Yrs</span>
                  <span>30 Yrs</span>
                </div>
              </div>

              {/* Visual Result Tiles */}
              <div className="grid grid-cols-3 gap-3 pt-5 border-t border-gray-200">
                <div className="bg-white p-3.5 rounded-2xl border border-gray-200">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Total Invested</div>
                  <div className="text-[14px] sm:text-[16px] font-bold font-mono text-gray-900 mt-1">
                    {formatINR(previewResults.invested)}
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/20">
                  <div className="text-[10px] text-emerald-600 font-semibold uppercase">Est. Returns</div>
                  <div className="text-[14px] sm:text-[16px] font-bold font-mono text-[#10B981] mt-1">
                    {formatINR(previewResults.returns)}
                  </div>
                </div>
                <div className="bg-[#0A1628] p-3.5 rounded-2xl text-white">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">Total Corpus</div>
                  <div className="text-[14px] sm:text-[16px] font-black font-mono text-white mt-1">
                    {formatINR(previewResults.total)}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* SEARCH & JOURNEY TABS */}
        {/* ══════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by simulator name (e.g. SIP, Tax FY 2025-26, Loan EMI, Paper Trading, FIRE)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[14px] text-[#0A1628] placeholder:text-gray-400 outline-none focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Journey Filter Chips */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#0A1628] text-white shadow-sm'
                  : 'bg-[#F8FAFC] text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All ({JOURNEYS.reduce((acc, j) => acc + j.labs.length, 0)})
            </button>
            {JOURNEYS.map((journey) => (
              <button
                key={journey.id}
                onClick={() => setActiveCategory(journey.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === journey.id
                    ? 'bg-[#0A1628] text-white shadow-sm'
                    : 'bg-[#F8FAFC] text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {journey.shortTitle} ({journey.labs.length})
              </button>
            ))}
          </div>

        </div>

        {/* ══════════════════════════════════════════ */}
        {/* 4 THEMED FINANCIAL JOURNEYS */}
        {/* ══════════════════════════════════════════ */}
        {filteredJourneys.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No interactive labs match your search</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
              Try searching for terms like "SIP", "Tax", "EMI", "Budget", or reset your category filter.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="px-6 py-2.5 rounded-xl bg-[#0A1628] text-white text-xs font-bold hover:bg-[#1E293B] transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {filteredJourneys.map((journey) => (
              <div key={journey.id} className="scroll-mt-6" id={journey.id}>
                
                {/* Journey Section Header */}
                <div className="mb-6 border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <h2 
                      className="text-2xl sm:text-3xl font-bold text-[#0A1628] tracking-tight mb-1"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {journey.title}
                    </h2>
                    <p className="text-xs sm:text-[14px] text-gray-500">{journey.description}</p>
                  </div>
                  <span 
                    className="text-xs font-bold font-mono px-3 py-1 rounded-full border self-start sm:self-auto"
                    style={{ color: journey.themeColor, borderColor: `${journey.themeColor}30`, backgroundColor: `${journey.themeColor}10` }}
                  >
                    {journey.labs.length} Interactive Simulators
                  </span>
                </div>

                {/* Lab Grid for this Journey */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {journey.labs.map((lab) => {
                    const IconComponent = lab.icon;
                    return (
                      <Link 
                        key={lab.id} 
                        href={lab.href}
                        className={`bg-white rounded-3xl border border-gray-200 overflow-hidden ${journey.borderHover} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col`}
                      >
                        {/* Top Accent Strip */}
                        <div className="h-1.5 w-full" style={{ backgroundColor: journey.themeColor }} />

                        {/* Card Top: Icon & Popular Badge */}
                        <div className="p-6 pb-3 flex items-start justify-between">
                          <div 
                            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                            style={{ backgroundColor: `${journey.themeColor}15`, color: journey.themeColor }}
                          >
                            <IconComponent className="w-6 h-6" />
                          </div>

                          <div className="flex items-center gap-2">
                            {lab.id === 'paper-trading' && <MiniCandlestick />}
                            {lab.id === 'sip' && <MiniCompounding />}
                            {lab.id === 'startup' && <MiniRunway />}
                            {lab.id === 'tax' && <MiniTaxSlabs />}
                            {lab.isPopular && (
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                                Popular
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="px-6 pb-6 flex-1 flex flex-col">
                          <h3 className="text-[18px] font-bold text-[#0A1628] leading-snug mb-2 group-hover:text-[#2563EB] transition-colors">
                            {lab.title}
                          </h3>

                          <p className="text-[13px] text-gray-500 leading-relaxed mb-4 flex-1">
                            {lab.description}
                          </p>

                          {/* Highlight Tag */}
                          {lab.highlight && (
                            <div className="mb-4">
                              <span className="inline-block px-2.5 py-1 bg-[#F8FAFC] border border-gray-200 text-gray-600 text-[11px] font-mono rounded-lg">
                                {lab.highlight}
                              </span>
                            </div>
                          )}

                          {/* Card Footer Strip */}
                          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 mt-auto">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {lab.time}
                            </span>
                            <span 
                              className="flex items-center gap-1 transition-all group-hover:translate-x-1"
                              style={{ color: journey.themeColor }}
                            >
                              Open Lab <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>

                        </div>
                      </Link>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── Bottom Help Banner ───────────────────────────────────── */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <h3 
            className="text-2xl font-bold text-[#0A1628] mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Need Guidance On Which Simulator To Use?
          </h3>
          <p className="text-gray-500 text-sm max-w-xl mx-auto mb-6">
            Ask our AI Finance Mentor to diagnose your current financial situation and recommend the exact tools to model your goals.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/ai-tutor"
              className="px-6 py-3 bg-[#0A1628] text-white rounded-xl text-xs font-bold hover:bg-[#1E293B] transition-all flex items-center gap-2"
            >
              Consult AI Mentor <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/explore"
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:border-[#0A1628] transition-all"
            >
              Explore Structured Courses
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
