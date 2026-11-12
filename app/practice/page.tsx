'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, ArrowRight, Clock, Calculator, 
  TrendingUp, Bitcoin, Target, Zap, BarChart2, 
  PieChart, Landmark, Flame, ShieldAlert, ShieldCheck, 
  Wallet, Percent, Compass, Sparkles, Sliders, ChevronRight
} from 'lucide-react';

// ============================================================
// FinanceHub — 10/10 Financial Learning & Interactive Practice Arena
// app/simulators/page.tsx
// Visual Discipline · Featured Hierarchy · 4 Financial Journeys
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
}

interface Journey {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  labs: Lab[];
}

// Complete 16 Interactive Labs organized across 4 Structured Financial Journeys
const JOURNEYS: Journey[] = [
  {
    id: 'plan-grow',
    title: '01. Plan & Grow Your Wealth',
    shortTitle: 'Plan & Grow',
    description: 'Build long-term financial plans, calculate retirement runway, and harness the mathematics of compounding.',
    labs: [
      {
        id: 'sip',
        title: 'SIP & Investment Calculator',
        description: 'See how monthly SIPs grow with compound interest across equities, index mutual funds, and fixed deposits.',
        icon: TrendingUp,
        time: '5 min',
        type: 'Calculator',
        isPopular: true,
        href: '/practice/sip',
        highlight: 'Model up to 30 years with CAGR comparison',
      },
      {
        id: 'step-up-sip',
        title: 'Step-Up SIP & Compounding Visualizer',
        description: 'Visualize how increasing your SIP by 10% each year with salary hikes dramatically accelerates your corpus.',
        icon: Percent,
        time: '4 min',
        type: 'Calculator',
        isPopular: true,
        href: '/practice/compound-visualizer',
        highlight: 'Step-up compounding analysis',
      },
      {
        id: 'fire',
        title: 'FIRE Early Retirement Calculator',
        description: 'Model Lean FIRE, Standard FIRE, and Fat FIRE milestones with Indian inflation and safe withdrawal rates.',
        icon: Flame,
        time: '5 min',
        type: 'Calculator',
        isPopular: true,
        href: '/practice/fire',
        highlight: '25x - 33x expense milestone models',
      },
      {
        id: 'retirement',
        title: 'Retirement Corpus Planner',
        description: 'Determine your post-retirement monthly cash flow needs accounting for medical inflation and longevity.',
        icon: Target,
        time: '4 min',
        type: 'Planner',
        isPopular: false,
        href: '/practice/retirement',
        highlight: 'Inflation-adjusted corpus calculator',
      },
      {
        id: 'goals',
        title: 'Goal-Based Wealth Planner',
        description: 'Plan for home down payments, child education, and emergency funds with time-horizon asset allocation.',
        icon: Compass,
        time: '6 min',
        type: 'Planner',
        isPopular: false,
        href: '/practice/goals',
        highlight: 'Multi-goal prioritization framework',
      },
    ],
  },
  {
    id: 'manage-money',
    title: '02. Manage Your Money',
    shortTitle: 'Manage Money',
    description: 'Understand everyday financial decisions, debt amortization, tax optimization, and family risk management.',
    labs: [
      {
        id: 'emi',
        title: 'Loan & EMI Calculator',
        description: 'Calculate monthly EMIs for home, car, or education loans with prepayment savings and tenure reduction.',
        icon: Landmark,
        time: '3 min',
        type: 'Calculator',
        isPopular: true,
        href: '/practice/emi',
        highlight: 'Prepayment interest savings breakdown',
      },
      {
        id: 'tax',
        title: 'Tax Calculator FY 2025-26', // Updated for Indian Tax Parity
        description: 'Compare Old vs New Tax Regime with standard deduction, Section 80C, 80D, NPS (80CCD), and HRA exemptions.',
        icon: Calculator,
        time: '4 min',
        type: 'Calculator',
        isPopular: true,
        href: '/practice/tax',
        highlight: 'Updated FY 2025-26 slab comparison',
      },
      {
        id: 'budget',
        title: '50/30/20 Budget Simulator',
        description: 'Structure your monthly income into Needs (50%), Wants (30%), and Investments (20%) with expense tracking.',
        icon: PieChart,
        time: '5 min',
        type: 'Simulator',
        isPopular: false,
        href: '/practice/budget',
        highlight: 'Interactive salary allocation tool',
      },
      {
        id: 'insurance',
        title: 'Term & Health Insurance Needs (HLV)',
        description: 'Calculate your true Human Life Value (HLV) term insurance cover and family health coverage requirements.',
        icon: ShieldCheck,
        time: '4 min',
        type: 'Estimator',
        isPopular: false,
        href: '/practice/insurance',
        highlight: 'Human Life Value (HLV) formula',
      },
    ],
  },
  {
    id: 'invest-trade',
    title: '03. Invest & Practice Trading',
    shortTitle: 'Invest & Trade',
    description: 'Explore live market mechanics, test trading strategies, and simulate portfolios with virtual capital.',
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
      },
      {
        id: 'rebalancer',
        title: 'Portfolio Asset Rebalancer',
        description: 'Calculate exact equity and debt adjustments needed to restore your desired asset allocation during bull and bear cycles.',
        icon: PieChart,
        time: '5 min',
        type: 'Calculator',
        isPopular: false,
        href: '/practice/rebalancer',
        highlight: 'Tax-efficient rebalancing model',
      },
    ],
  },
  {
    id: 'business-risk',
    title: '04. Business & Financial Risk',
    shortTitle: 'Business & Risk',
    description: 'Model corporate cash flows, estimate startup runway, and stress-test your household against macroeconomic shocks.',
    labs: [
      {
        id: 'startup',
        title: 'Startup Cash Flow & Runway Simulator',
        description: 'Model monthly burn rate, cash runway, customer acquisition cost (CAC), and path to profitability.',
        icon: Zap,
        time: '8 min',
        type: 'Simulator',
        isPopular: false,
        href: '/practice/startup-cash-flow',
        highlight: 'Burn rate & runway modeling',
      },
      {
        id: 'stress',
        title: 'Financial Stress & Liquidity Tester',
        description: 'Simulate 6-month job loss, severe market drawdowns (-40%), and emergency medical shocks on your personal balance sheet.',
        icon: ShieldAlert,
        time: '7 min',
        type: 'Simulator',
        isPopular: false,
        href: '/practice/stress-test',
        highlight: 'Emergency fund survival score',
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
      // Category filter
      if (activeCategory !== 'all' && journey.id !== activeCategory) {
        return null;
      }

      // Search filter
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
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#1A1A2E]">
      
      {/* ─── Breadcrumb Navigation ─── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-[#0E6163] transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Dashboard
        </Link>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* ══════════════════════════════════════════ */}
        {/* 1. HERO HEADER */}
        {/* ══════════════════════════════════════════ */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold tracking-widest uppercase mb-4">
            <Compass className="w-3.5 h-3.5" /> FinanceHub Interactive Practice
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#0A1628] tracking-tight leading-[1.2] mb-3">
            Understand Money. Experiment With Decisions.
          </h1>
          <p className="text-[15px] sm:text-[16px] text-gray-600 max-w-3xl leading-relaxed">
            Explore 16 interactive financial labs to model investments, home loans, tax regimes, budgeting, and risk scenarios — without putting real capital on the line.
          </p>
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* 2. FEATURED LAB HERO (Hierarchy & Split View) */}
        {/* ══════════════════════════════════════════ */}
        <div className="mb-12 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Featured Lab Details */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider rounded-md flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" /> Featured Practice Lab
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded">
                  5 Min Lab
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-[#0A1628] leading-tight mb-3">
                SIP & Compounding Wealth Simulator
              </h2>
              
              <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
                Discover the mathematical advantage of long-term investing in India. Adjust your monthly contribution and time horizon to compare expected equity returns against inflation and fixed deposits.
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>Real Indian Equity CAGR (12%)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>Interactive Year-by-Year Growth</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>LTCG Tax Impact Estimator</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>Export & PDF Plan Summary</span>
                </div>
              </div>

              <div>
                <Link
                  href="/practice/sip"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0A1628] hover:bg-[#0E6163] text-white text-[13.5px] font-bold shadow-sm hover:shadow transition-all w-full sm:w-auto"
                >
                  Launch Featured Lab <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Interactive Interactive Preview Card */}
            <div className="lg:col-span-6 bg-gray-50 border border-gray-200/80 rounded-2xl p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200/80 mb-5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0E6163]" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quick Calculation Preview</span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono">Assumed 12% p.a.</span>
              </div>

              {/* Slider 1: Monthly Investment */}
              <div className="mb-5">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-gray-600">Monthly SIP Contribution</span>
                  <span className="text-[#0A1628] font-bold font-mono text-[14px]">₹{sipMonthly.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="1000"
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0E6163]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                  <span>₹2,000</span>
                  <span>₹50,000</span>
                  <span>₹1,00,000</span>
                </div>
              </div>

              {/* Slider 2: Horizon */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-gray-600">Time Horizon</span>
                  <span className="text-[#0A1628] font-bold font-mono text-[14px]">{sipYears} Years</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0E6163]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                  <span>3 Yrs</span>
                  <span>15 Yrs</span>
                  <span>30 Yrs</span>
                </div>
              </div>

              {/* Visual Result Tiles */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200/80">
                <div className="bg-white p-3 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Total Invested</div>
                  <div className="text-[13px] sm:text-[15px] font-bold font-mono text-gray-900 mt-1">
                    {formatINR(previewResults.invested)}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Est. Returns</div>
                  <div className="text-[13px] sm:text-[15px] font-bold font-mono text-[#10B981] mt-1">
                    {formatINR(previewResults.returns)}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-200 bg-emerald-50/30">
                  <div className="text-[10px] text-emerald-800 font-bold uppercase">Total Corpus</div>
                  <div className="text-[13px] sm:text-[15px] font-black font-mono text-[#0A1628] mt-1">
                    {formatINR(previewResults.total)}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* 3. DISCOVERY CONTROLS: SEARCH & CATEGORY CHIPS */}
        {/* ══════════════════════════════════════════ */}
        <div className="mb-10 space-y-4">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search calculators, simulators, planners (e.g. SIP, Tax, EMI, Paper Trading)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border border-gray-200 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#0E6163] focus:ring-4 focus:ring-[#0E6163]/10 transition-all shadow-2xs"
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

            {/* Total Results Count */}
            <div className="text-xs font-semibold text-gray-500 whitespace-nowrap self-center">
              Showing <span className="text-[#0A1628] font-bold">{totalMatchingLabs}</span> interactive labs
            </div>
          </div>

          {/* Quick-Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#0A1628] text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All Labs ({JOURNEYS.reduce((acc, j) => acc + j.labs.length, 0)})
            </button>
            {JOURNEYS.map((journey) => (
              <button
                key={journey.id}
                onClick={() => setActiveCategory(journey.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === journey.id
                    ? 'bg-[#0A1628] text-white shadow-2xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {journey.shortTitle} ({journey.labs.length})
              </button>
            ))}
          </div>

        </div>

        {/* ══════════════════════════════════════════ */}
        {/* 4. THE 4 FINANCIAL JOURNEYS */}
        {/* ══════════════════════════════════════════ */}
        {filteredJourneys.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No interactive labs match your search</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
              Try searching for terms like "SIP", "Tax", "EMI", "Budget", "Crypto", or reset your category filter.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="px-4 py-2 rounded-lg bg-[#0A1628] text-white text-xs font-bold hover:bg-[#0E6163] transition-colors"
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
                    <h2 className="text-xl sm:text-2xl font-bold text-[#0A1628] tracking-tight mb-1">
                      {journey.title}
                    </h2>
                    <p className="text-xs sm:text-[13.5px] text-gray-500">{journey.description}</p>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {journey.labs.length} {journey.labs.length === 1 ? 'Tool' : 'Tools'}
                  </span>
                </div>

                {/* Lab Grid for this Journey */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {journey.labs.map((lab) => (
                    <div 
                      key={lab.id} 
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#10B981] transition-all group flex flex-col"
                    >
                      {/* Card Top: Icon & Popular Badge */}
                      <div className="p-6 pb-4 flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <lab.icon className="w-5 h-5 text-[#0E6163]" />
                        </div>
                        {lab.isPopular && (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                            Popular
                          </span>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="px-6 pb-6 flex-1 flex flex-col">
                        <h3 className="text-[17px] font-bold text-[#0A1628] leading-snug mb-2 group-hover:text-[#0E6163] transition-colors">
                          {lab.title}
                        </h3>
                        <p className="text-[13px] text-gray-500 leading-relaxed mb-4 flex-1 line-clamp-3">
                          {lab.description}
                        </p>

                        {/* Subtle highlight pill */}
                        {lab.highlight && (
                          <div className="mb-5 text-[11px] font-medium text-emerald-800 bg-emerald-50/70 border border-emerald-100 px-2.5 py-1 rounded-md">
                            💡 {lab.highlight}
                          </div>
                        )}

                        {/* Metadata Tag Row */}
                        <div className="flex items-center gap-2 mb-5 pt-3 border-t border-gray-100">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded">
                            {lab.type}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400 ml-auto">
                            <Clock className="w-3.5 h-3.5" /> {lab.time}
                          </span>
                        </div>

                        {/* Strict Discipline One-Color CTA */}
                        <Link 
                          href={lab.href}
                          className="w-full py-3 rounded-xl bg-[#0A1628] hover:bg-[#0E6163] text-white text-[13px] font-bold text-center transition-all flex items-center justify-center gap-2 shadow-2xs group-hover:shadow"
                        >
                          Open Lab <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* 5. PRACTICAL GUIDE: HOW TO USE SIMULATORS */}
        {/* ══════════════════════════════════════════ */}
        <div className="mt-20 bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 lg:p-12 shadow-2xs">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200 text-[11px] font-bold tracking-widest uppercase mb-3">
              Practical Learning Framework
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0A1628] mb-2">
              How to Get the Most from Finance Labs
            </h2>
            <p className="text-[14px] sm:text-[15px] text-gray-500 max-w-xl mx-auto">
              Move beyond passive reading. Use our interactive simulators to master Indian financial decisions with mathematical confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                step: '01', 
                title: 'Pick Your Focus Area', 
                desc: 'Begin with foundational calculators like SIP and Loan EMI to understand interest drag vs compounding, then progress to live paper trading.' 
              },
              { 
                step: '02', 
                title: 'Model Extreme Scenarios', 
                desc: 'Stress-test your finances against 6-month job losses, unexpected medical bills, and sudden market drawdowns without risking real rupees.' 
              },
              { 
                step: '03', 
                title: 'Build Confident Plans', 
                desc: 'Translate simulation findings into actionable investment routines: set automatic monthly SIP dates, review tax regimes, and adjust term cover.' 
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
                  <span className="text-[15px] font-black text-[#10B981] font-mono">{item.step}</span>
                </div>
                <h3 className="text-[16px] font-bold text-[#0A1628] mb-2">{item.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* 6. STATUTORY DISCLAIMER */}
        {/* ══════════════════════════════════════════ */}
        <div className="mt-12 text-center pb-8 border-t border-gray-200/80 pt-8">
          <p className="text-[11.5px] text-gray-400 leading-relaxed max-w-2xl mx-auto">
            © 2026 FinanceHub of India. All calculators and simulators are strictly for financial education and planning purposes. Calculations are mathematical models and do not constitute SEBI-registered investment advice or personalized tax guidance.
          </p>
        </div>

      </div>
    </div>
  );
}
