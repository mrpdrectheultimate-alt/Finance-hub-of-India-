'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import {
  ArrowRight, CheckCircle2, ShieldCheck,
  TrendingUp, BookOpen, Brain, GraduationCap,
  Briefcase, Rocket, LineChart, AlertTriangle,
  Calculator, Sparkles, Clock, ChevronDown,
  ChevronRight, Star, Sliders, Compass, Lock,
  PieChart, HelpCircle, Check, ExternalLink,
  Layers, Award, Zap
} from 'lucide-react';

// ============================================================
// FinanceHub of India — 10/10 World-Class Homepage
// app/page.tsx
// Visual Polish · Narrative Structure · Data Integrity & Trust
// ============================================================

// ─── Persona Roadmaps Data ──────────────────────────────────
interface PersonaData {
  id: string;
  title: string;
  badge: string;
  icon: any;
  headline: string;
  description: string;
  frictionPoint: string;
  trackHref: string;
  trackLabel: string;
  starterLessons: { title: string; duration: string; tag: string }[];
}

const PERSONAS: PersonaData[] = [
  {
    id: 'student',
    title: 'College Student',
    badge: 'Starting Early',
    icon: GraduationCap,
    headline: 'College Student: Your Learning Roadmap',
    description: 'You have limited capital, but your greatest superpower is time. Starting early creates staggering compound wealth.',
    frictionPoint: 'Confused by financial jargon, living on a student allowance, and tempted by predatory Buy Now Pay Later (BNPL) credit apps.',
    trackHref: '/explore/personal-finance',
    trackLabel: 'Start Personal Finance Free',
    starterLessons: [
      { title: 'The Unfair Advantage: Starting at Age 20 vs. 30', duration: '5 min', tag: 'Compounding' },
      { title: 'Building a Zero-Stress 50/30/20 Budget on an Allowance', duration: '7 min', tag: 'Budgeting' },
      { title: 'Avoiding the 40% APR Credit Card & BNPL Traps', duration: '6 min', tag: 'Debt' },
    ],
  },
  {
    id: 'professional',
    title: 'Salaried Professional',
    badge: 'Tax & Wealth',
    icon: Briefcase,
    headline: 'Salaried Professional: Your Wealth & Tax Architecture',
    description: 'Optimize your 8-figure career earnings. Eliminate tax drag, automate monthly equity investments, and buy proper risk protection.',
    frictionPoint: 'Paying 30% peak income tax, keeping idle cash in low-yield savings accounts, and relying solely on corporate health insurance.',
    trackHref: '/explore/personal-finance',
    trackLabel: 'Start Tax & Wealth Path',
    starterLessons: [
      { title: 'Old vs. New Tax Regime: The Exact Mathematical Break-Even', duration: '8 min', tag: 'Taxes' },
      { title: 'Step-Up SIP Blueprint: Aligning Annual Raises with Wealth', duration: '6 min', tag: 'Investing' },
      { title: 'The ₹1 Crore Term Insurance & Super Top-Up Health Shield', duration: '9 min', tag: 'Insurance' },
    ],
  },
  {
    id: 'trader',
    title: 'Aspiring Trader',
    badge: 'Risk & Execution',
    icon: LineChart,
    headline: 'Aspiring Trader: Risk-First Market Competence',
    description: 'Master technical analysis, volume confirmation, and options Greeks before committing a single real rupee to the markets.',
    frictionPoint: 'Trading based on Telegram/WhatsApp tips, revenge-trading after losses, and getting wiped out by overnight theta decay.',
    trackHref: '/explore/trading-and-markets',
    trackLabel: 'Start Trading Track',
    starterLessons: [
      { title: 'Anatomy of the Indian Derivatives Trap: Why 93% Lose Money', duration: '10 min', tag: 'F&O' },
      { title: 'Support, Resistance, and Volume-Confirmed Price Action', duration: '8 min', tag: 'Technical' },
      { title: 'The 1% Position Sizing & Stop-Loss Discipline', duration: '7 min', tag: 'Risk' },
    ],
  },
  {
    id: 'founder',
    title: 'Founder / Executive',
    badge: 'Corporate & Capital',
    icon: Rocket,
    headline: 'Founder / Executive: Corporate & Capital Strategy',
    description: 'Master working capital cycles, venture capital term sheets, ESOP taxation, and strategic financial statement analysis.',
    frictionPoint: 'Mismanaging cash runway, confusion over Section 56(2) Angel Tax & ESOP perquisite taxes, and diluting equity too early.',
    trackHref: '/explore/corporate-finance',
    trackLabel: 'Start Corporate Finance',
    starterLessons: [
      { title: 'Working Capital Mastery: Days Sales Outstanding (DSO) & Runway', duration: '9 min', tag: 'Cash Flow' },
      { title: 'ESOP Exercise & Dual Tax Events: Avoid the Big Liquidity Trap', duration: '8 min', tag: 'ESOPs' },
      { title: 'Reading Corporate Financial Statements Like a Seasoned CFO', duration: '12 min', tag: 'Accounting' },
    ],
  },
];

// ─── The 8 Master Disciplines ───────────────────────────────
const DISCIPLINES = [
  {
    id: 'personal-finance',
    title: 'Personal Finance',
    tagline: 'Master budgeting, debt freedom, and inflation-beating savings.',
    lessons: 100,
    levels: 'Level 1–3',
    color: '#10B981',
    href: '/explore/personal-finance',
  },
  {
    id: 'stock-market',
    title: 'Stock Market Fundamentals',
    tagline: 'Understand how Indian businesses create value on NSE and BSE.',
    lessons: 45,
    levels: 'Level 1–3',
    color: '#0E6163',
    href: '/explore/trading-and-markets',
  },
  {
    id: 'fo-trading',
    title: 'F&O Derivatives Trading',
    tagline: 'Demystify futures, options Greeks, and risk mitigation strategies.',
    lessons: 40,
    levels: 'Level 1–3',
    color: '#EF4444',
    href: '/explore/trading-and-markets',
  },
  {
    id: 'technical-analysis',
    title: 'Technical Analysis',
    tagline: 'Read price action, volume confirmation, and chart patterns.',
    lessons: 35,
    levels: 'Level 1–3',
    color: '#6366F1',
    href: '/explore/trading-and-markets',
  },
  {
    id: 'mutual-funds',
    title: 'Mutual Funds & ETFs',
    tagline: 'Direct vs regular plans, expense ratios, and asset allocation.',
    lessons: 30,
    levels: 'Level 1–2',
    color: '#F59E0B',
    href: '/explore/personal-finance',
  },
  {
    id: 'tax-planning',
    title: 'Income Tax & Optimization',
    tagline: 'Old vs New Regime, 80C, 80D, capital gains, and ITR filing.',
    lessons: 25,
    levels: 'Level 1–2',
    color: '#06B6D4',
    href: '/explore/personal-finance',
  },
  {
    id: 'crypto-web3',
    title: 'Crypto & Digital Assets',
    tagline: 'Blockchain mechanics, 30% Indian VDA tax, and wallet custody.',
    lessons: 40,
    levels: 'Level 1–3',
    color: '#8B5CF6',
    href: '/explore/trading-and-markets',
  },
  {
    id: 'corporate-finance',
    title: 'Corporate Finance',
    tagline: 'DCF valuation, working capital, ESOPs, and M&A deals.',
    lessons: 60,
    levels: 'Level 1–3',
    color: '#0A1628',
    href: '/explore/corporate-finance',
  },
];

export default function HomePage() {
  // Hero Interactive Simulator State
  const [monthly, setMonthly] = useState<number>(10000);
  const [years, setYears] = useState<number>(15);
  const [rate, setRate] = useState<number>(12);

  // Persona State
  const [activePersonaId, setActivePersonaId] = useState<string>('student');
  const activePersona = useMemo(() => {
    return PERSONAS.find((p) => p.id === activePersonaId) || PERSONAS[0];
  }, [activePersonaId]);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Hero Simulator Math
  const simulatorResult = useMemo(() => {
    const r = rate / 100 / 12;
    const n = years * 12;
    const invested = monthly * n;
    const fv = monthly * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const gains = fv - invested;
    return {
      invested: Math.round(invested),
      gains: Math.round(gains),
      total: Math.round(fv),
    };
  }, [monthly, years, rate]);

  const formatLakhCr = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const faqs = [
    {
      q: 'Is FinanceHub really 100% free to start?',
      a: 'Yes. All foundational lessons across all 8 tracks, essential calculators (SIP, EMI, Budget), and daily practice questions are completely free forever. We do not require a credit card or payment info to sign up.',
    },
    {
      q: 'How is FinanceHub different from YouTube finance videos or finfluencers?',
      a: 'YouTube content is scattered, unverified, and optimized for sensational views without structured progression or checkpoints. FinanceHub provides a sequenced curriculum designed by CA/CFA charterholders, verified against SEBI and RBI regulations, paired with risk-free simulators and a 24/7 AI tutor.',
    },
    {
      q: 'Is FinanceHub considered SEBI-registered investment advice?',
      a: 'No. FinanceHub is strictly an educational platform. None of our content, tools, or AI responses constitute personalized investment, legal, or tax advisory services. All simulators are mathematical models for learning purposes.',
    },
    {
      q: 'Can I use FinanceHub on my mobile phone?',
      a: 'Yes! FinanceHub is fully responsive and installable as a Progressive Web App (PWA) on iOS and Android. You can study lessons, run simulations, and practice paper trading seamlessly on mobile.',
    },
    {
      q: 'Do I get certificates when I finish a curriculum track?',
      a: 'Yes. Completing all lessons, checkpoint quizzes, and capstone exams within a track awards you a verifiable, tamper-proof Certificate of Mastery that you can add to your LinkedIn profile and resume.',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A2E] selection:bg-emerald-100 selection:text-emerald-900">

      {/* ══════════════════════════════════════════ */}
      {/* 0. STICKY INSTITUTIONAL HEADER */}
      {/* ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo size="sm" href="/" />
            <nav className="hidden md:flex items-center gap-6 text-[13.5px] font-semibold text-gray-600">
              <Link href="/explore" className="hover:text-[#0E6163] transition-colors">Curriculum</Link>
              <Link href="/simulators" className="hover:text-[#0E6163] transition-colors">Simulators</Link>
              <Link href="/case-studies" className="hover:text-[#0E6163] transition-colors">Case Studies</Link>
              <Link href="/ai-tutor" className="hover:text-[#0E6163] transition-colors flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Mentor
              </Link>
              <Link href="/pricing" className="hover:text-[#0E6163] transition-colors">Pricing</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[13px] font-bold text-gray-700 hover:text-[#0A1628] px-3 py-1.5 rounded-lg transition-colors hidden sm:inline-block"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="text-[13px] font-bold bg-[#0A1628] hover:bg-[#0E6163] text-white px-4 py-2 rounded-xl transition-all shadow-2xs hover:shadow"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════ */}
      {/* 1. HERO SECTION */}
      {/* ══════════════════════════════════════════ */}
      <section className="relative pt-12 sm:pt-20 pb-20 sm:pb-28 bg-[#F9FAFB] border-b border-gray-200/80 overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left: Headline & Pitch */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold tracking-widest uppercase mb-6 border border-emerald-200/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Built for India&apos;s Financial Future
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black leading-[1.08] tracking-tight mb-6 text-[#0A1628]">
                Master the Language<br />
                of Money. <span className="text-[#0E6163]">Built for India.</span>
              </h1>

              <p className="text-[16px] sm:text-[17.5px] text-[#4A5568] leading-relaxed mb-8 max-w-xl">
                From your first ₹500 SIP to reading corporate balance sheets and trading options risk-free. Learn through 375+ structured lessons, 15 interactive simulators, and 24/7 AI tutoring.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8">
                <Link
                  href="/auth/signup"
                  className="px-6 sm:px-8 py-3.5 sm:py-4 bg-[#0A1628] hover:bg-[#0E6163] text-white rounded-xl text-[15px] font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  Start Learning Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/explore"
                  className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-[#0A1628] border-2 border-gray-200 hover:border-[#0A1628] rounded-xl text-[15px] font-bold transition-all"
                >
                  Explore Curriculum
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-gray-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> 100% Free Core Access
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> English & Hindi
                </span>
              </div>
            </div>

            {/* Right: Interactive SIP Simulator Card (Plan 1 & 3) */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-7 relative">

                {/* Micro-Lab Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#10B981]">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[13px] font-extrabold text-[#0A1628] block leading-tight">
                        Wealth Modeler / SIP Calculator
                      </span>
                      <span className="text-[11px] text-gray-400">Compounding in Indian Markets</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                    Live Preview
                  </span>
                </div>

                {/* Sliders */}
                <div className="space-y-4 mb-6">
                  {/* Slider 1: Monthly Investment */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                      <span className="text-gray-600">Monthly Investment</span>
                      <span className="text-[#0A1628] font-bold font-mono text-[13.5px]">
                        ₹{monthly.toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={100000}
                      step={1000}
                      value={monthly}
                      onChange={(e) => setMonthly(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0E6163]"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                      <span>₹1,000</span>
                      <span>₹50,000</span>
                      <span>₹1,00,000</span>
                    </div>
                  </div>

                  {/* Slider 2: Time Horizon */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                      <span className="text-gray-600">Time Horizon</span>
                      <span className="text-[#0A1628] font-bold font-mono text-[13.5px]">
                        {years} Years ({years * 12} mo)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={30}
                      step={1}
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0E6163]"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                      <span>3 Yrs</span>
                      <span>15 Yrs</span>
                      <span>30 Yrs</span>
                    </div>
                  </div>

                  {/* Slider 3: Expected Return */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                      <span className="text-gray-600">Expected Return (CAGR)</span>
                      <span className="text-[#0E6163] font-bold font-mono text-[13.5px]">
                        {rate}% p.a. {rate === 12 ? '(Nifty 50 Avg)' : ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={18}
                      step={1}
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0E6163]"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                      <span>6% (FD)</span>
                      <span>12% (Balanced)</span>
                      <span>18% (Aggressive)</span>
                    </div>
                  </div>
                </div>

                {/* Sub-Metric Cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Invested Amount</p>
                    <p className="text-[15px] font-bold text-gray-900 font-mono mt-0.5">
                      {formatLakhCr(simulatorResult.invested)}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Est. Wealth Gain</p>
                    <p className="text-[15px] font-bold text-emerald-600 font-mono mt-0.5">
                      +{formatLakhCr(simulatorResult.gains)}
                    </p>
                  </div>
                </div>

                {/* Dark Result Box */}
                <div className="p-4 bg-[#0A1628] rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Total Estimated Corpus
                    </p>
                    <p className="text-2xl sm:text-[26px] font-black text-white font-mono leading-none">
                      {formatLakhCr(simulatorResult.total)}
                    </p>
                  </div>
                  <Link
                    href="/practice/sip"
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    Open Lab <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Data Integrity Disclaimer (Plan 3) */}
                <p className="text-[10.5px] text-gray-400 text-center mt-3 leading-relaxed">
                  *Calculations assume annual compounding at {rate}% CAGR. Illustrative mathematical model, not a guaranteed return.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 2. STATS BAR (Data Integrity & Trust) */}
      {/* ══════════════════════════════════════════ */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200 text-center">
            <div className="pt-2 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-[#0A1628] font-mono">375+</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Curated Lessons</p>
              <p className="text-[11px] text-gray-400 mt-0.5">From zero to valuation</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-[#0A1628] font-mono">8</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Master Disciplines</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Personal finance to F&O</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-[#0A1628] font-mono">15</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Interactive Labs</p>
              <p className="text-[11px] text-gray-400 mt-0.5">100% risk-free practice</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-[#0A1628] font-mono">100%</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Free Core Access</p>
              <p className="text-[11px] text-gray-400 mt-0.5">No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 3. THE "FINANCE IS HARD" SECTION (Pain Points) */}
      {/* ══════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-[#F9FAFB] border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">

          <div className="text-center mb-14">
            <span className="text-[11px] font-bold text-[#0E6163] tracking-widest uppercase block mb-2">
              The Indian Reality
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A1628] tracking-tight">
              Finance is hard. <span className="text-[#0E6163]">It doesn't have to be.</span>
            </h2>
            <p className="text-[15px] sm:text-[16px] text-gray-500 mt-2.5 max-w-xl mx-auto leading-relaxed">
              These are the four real reasons why millions of hardworking Indians stay broke or lose capital. FinanceHub solves all four.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[
              {
                icon: GraduationCap,
                tag: 'THE CURRICULUM GAP',
                title: 'School taught quadratics. Never money.',
                desc: '12 to 16 years of formal education, but not a single lesson on SIPs, salary deductions, inflation, or how compound interest defines your retirement.'
              },
              {
                icon: AlertTriangle,
                tag: 'THE TIP TRAP',
                title: '₹3 Lakh wiped out on a WhatsApp stock tip.',
                desc: 'An IT engineer in Pune trusts an unverified group recommendation. Within 4 months, hard-earned capital is decimated. This reality repeats across India daily.'
              },
              {
                icon: Brain,
                tag: 'THE INTIMIDATION WALL',
                title: 'Financial jargon stops beginners cold.',
                desc: 'P/E ratio, LTCG, Delta & Theta, XIRR, FEMA. By the time you search for the second term, you have forgotten the first. Finance has too many gatekeeping walls.'
              },
              {
                icon: ShieldCheck,
                tag: 'CONFLICTED ADVICE',
                title: 'The financial advice you get isn\'t for you.',
                desc: 'Banks push funds with high distributor commissions. Traditional agents earn hefty commissions on low-yielding insurance policies. The system wasn\'t built for your growth.'
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white p-7 sm:p-8 rounded-3xl border border-gray-200/90 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                      <card.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full tracking-wider">
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-[19px] font-bold text-[#0A1628] mb-2 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-[13.5px] text-gray-500 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Solution Banner */}
          <div className="p-6 sm:p-8 bg-[#0A1628] rounded-3xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
            <div>
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest block mb-1">
                Zero Conflicts of Interest
              </span>
              <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                FinanceHub solves all four — for free.
              </h3>
              <p className="text-xs sm:text-[13.5px] text-gray-300 mt-1 max-w-xl leading-relaxed">
                No distributor commissions, zero sales pitches, and no hidden agendas. Just clear, structured financial education built for Indian learners.
              </p>
            </div>
            <Link
              href="/auth/signup"
              className="px-6 py-3 bg-[#0E6163] hover:bg-[#0A4A4C] text-white rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shadow-sm"
            >
              Start Learning Free →
            </Link>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 4. THE 3-STEP LEARNING LOOP */}
      {/* ══════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">

          <div className="text-center mb-16">
            <span className="text-[11px] font-bold text-[#0E6163] tracking-widest uppercase block mb-2">
              The Learning Loop
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A1628] tracking-tight">
              From confusion to mastery in three steps.
            </h2>
            <p className="text-[15px] sm:text-[16px] text-gray-500 mt-2 max-w-xl mx-auto leading-relaxed">
              Most platforms just dump video lectures. FinanceHub uses a closed-loop system: concept first, hands-on simulation second, instant AI reinforcement third.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                step: '01',
                badge: 'STRUCTURED CURRICULUM',
                title: 'Understand the First Principles',
                desc: 'Bite-sized, jargon-free lessons. Each lesson breaks down complex finance into plain English and Hindi: concept first, real Indian company examples, and key takeaways.'
              },
              {
                icon: Calculator,
                step: '02',
                badge: 'FINANCE LABS',
                title: 'Model It with Real Numbers',
                desc: 'Don\'t just read about wealth creation. Use our 15 interactive simulators to compare Old vs New tax regimes, plan your retirement, and paper-trade risk-free.'
              },
              {
                icon: Brain,
                step: '03',
                badge: 'FRONTIER AI MENTOR',
                title: 'Clarify Any Doubt 24/7',
                desc: 'Stuck on a tricky concept like indexation, ELSS lock-in, or option Greeks? Ask our frontier AI Mentor. Receive plain-language, source-cited explanations in seconds.'
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-gray-200 p-8 relative overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Massive Faint Background Number (Plan 1 & 2) */}
                <div className="absolute top-2 right-4 text-[80px] font-black text-gray-100 select-none pointer-events-none leading-none">
                  {item.step}
                </div>

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 text-[#0E6163]">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold text-[#0E6163] uppercase tracking-wider block mb-2">
                    {item.badge}
                  </span>
                  <h3 className="text-xl font-bold text-[#0A1628] mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[13.5px] text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 5. PERSONA SELECTOR (Roadmaps) */}
      {/* ══════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-[#F9FAFB] border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">

          <div className="text-center mb-12">
            <span className="text-[11px] font-bold text-[#0E6163] tracking-widest uppercase block mb-2">
              Personalized Starting Point
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A1628] tracking-tight">
              Where are you starting from?
            </h2>
            <p className="text-[15px] sm:text-[16px] text-gray-500 mt-2 max-w-xl mx-auto">
              Select your background to get your curated curriculum pathway. No account required.
            </p>
          </div>

          {/* Persona Tab Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {PERSONAS.map((persona) => {
              const Icon = persona.icon;
              const isSelected = activePersonaId === persona.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => setActivePersonaId(persona.id)}
                  className={`flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer ${isSelected
                      ? 'border-[#0E6163] bg-white shadow-md ring-2 ring-[#0E6163]/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${isSelected ? 'bg-emerald-50 text-[#0E6163]' : 'bg-gray-50 text-gray-400'
                    }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[14px] font-bold block ${isSelected ? 'text-[#0A1628]' : 'text-gray-700'}`}>
                    {persona.title}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {persona.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Persona Content Area */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-2xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

              {/* Left Column: Context & CTA */}
              <div className="lg:col-span-6">
                <span className="text-[11px] font-bold text-[#0E6163] uppercase tracking-wider block mb-2">
                  Curated Pathway
                </span>
                <h3 className="text-2xl font-bold text-[#0A1628] mb-3 leading-tight">
                  {activePersona.headline}
                </h3>
                <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
                  {activePersona.description}
                </p>

                {/* Common Friction Point Callout Box */}
                <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 mb-6">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-amber-900 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Common Friction Point</span>
                  </div>
                  <p className="text-[13px] text-amber-800 leading-relaxed">
                    {activePersona.frictionPoint}
                  </p>
                </div>

                <Link
                  href={activePersona.trackHref}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0A1628] hover:bg-[#0E6163] text-white rounded-xl text-[14px] font-bold transition-all shadow-sm w-full sm:w-auto"
                >
                  {activePersona.trackLabel} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Right Column: Recommended Starter Lessons */}
              <div className="lg:col-span-6 bg-gray-50 border border-gray-200/80 rounded-2xl p-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200/80 mb-4">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Recommended Starter Lessons
                  </span>
                  <span className="text-[11px] text-gray-400 font-semibold">3-Step Path</span>
                </div>

                <div className="space-y-3">
                  {activePersona.starterLessons.map((lesson, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-gray-200/70 shadow-2xs hover:border-[#0E6163] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[12px] font-bold text-[#0E6163] font-mono shrink-0">
                          {idx + 1}
                        </div>
                        <span className="text-[13.5px] font-semibold text-[#0A1628] leading-snug">
                          {lesson.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-gray-400 shrink-0 whitespace-nowrap">
                        {lesson.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 6. THE 8 MASTER DISCIPLINES PREVIEW */}
      {/* ══════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
            <div>
              <span className="text-[11px] font-bold text-[#0E6163] tracking-widest uppercase block mb-2">
                Comprehensive Curriculum
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0A1628] tracking-tight">
                Eight Master Disciplines. Zero Blindspots.
              </h2>
              <p className="text-[15px] text-gray-500 mt-2 max-w-xl">
                A progressive learning path from everyday personal finance to institutional corporate valuation.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0E6163] hover:underline"
            >
              Explore All 8 Tracks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DISCIPLINES.map((discipline) => (
              <Link
                key={discipline.id}
                href={discipline.href}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-[#0E6163] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-1 w-8 rounded-full mb-4" style={{ backgroundColor: discipline.color }} />
                  <h3 className="text-[16.5px] font-bold text-[#0A1628] mb-2 group-hover:text-[#0E6163] transition-colors leading-snug">
                    {discipline.title}
                  </h3>
                  <p className="text-[12.5px] text-gray-500 leading-relaxed mb-4 line-clamp-2">
                    {discipline.tagline}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-[11px] font-semibold text-gray-400">
                  <span>{discipline.lessons} Lessons</span>
                  <span>{discipline.levels}</span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 7. REAL INDIAN CASE STUDIES SPOTLIGHT */}
      {/* ══════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-[#F9FAFB] border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-[11px] font-bold text-[#0E6163] tracking-widest uppercase block mb-2">
                Outcome-First Learning
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0A1628] tracking-tight">
                Learn from real mistakes and wins.
              </h2>
              <p className="text-[15px] text-gray-500 mt-2 max-w-xl">
                We dissect true Indian financial case studies with transparent math, regulatory insights, and preventative rules.
              </p>
            </div>
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0E6163] hover:underline"
            >
              View All Case Studies <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Zara\'s Health Insurance Claim Denial',
                slug: 'zara-health-insurance-rejection',
                stake: '-₹12 Lakh',
                badge: 'Health Insurance Claim',
                lesson: 'Hidden sub-limits and room-rent co-payments led to massive out-of-pocket expenses.',
                border: 'border-l-rose-500',
              },
              {
                title: 'The ₹50 Lakh F&O Disaster',
                slug: '50-lakh-fo-trap',
                stake: '-₹50 Lakh',
                badge: 'Hero-Zero Derivatives Trap',
                lesson: 'Revenge-trading out-of-the-money weekly call options decimated a 7-year savings corpus in 90 days.',
                border: 'border-l-rose-500',
              },
              {
                title: 'Step-Up SIP vs. Fixed SIP',
                slug: 'step-up-sip-compounding',
                stake: '+₹1.48 Cr',
                badge: 'Compounding Acceleration',
                lesson: 'Increasing monthly SIP by just 10% annually with salary raises generated ₹1.48 Cr more than a fixed SIP.',
                border: 'border-l-emerald-500',
              },
            ].map((cs, i) => (
              <Link
                key={i}
                href={`/case-studies`}
                className={`bg-white rounded-2xl border border-gray-200 border-l-4 ${cs.border} p-6 hover:shadow-md transition-all flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {cs.badge}
                    </span>
                    <span className="text-sm font-black font-mono text-[#0A1628]">
                      {cs.stake}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-bold text-[#0A1628] mb-2 group-hover:text-[#0E6163] transition-colors leading-snug">
                    {cs.title}
                  </h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    {cs.lesson}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#0E6163]">
                  <span>Read Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 8. AI MENTOR SPOTLIGHT */}
      {/* ══════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="bg-[#0A1628] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

              <div className="lg:col-span-6">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest block mb-2">
                  Frontier AI Financial Tutor
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
                  Never get stuck on a financial concept again.
                </h2>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6">
                  Stuck comparing Section 80C deductions, calculating XIRR on mutual funds, or understanding option Greeks? Our AI mentor provides source-cited explanations grounded in SEBI, RBI, and Income Tax regulations.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/ai-tutor"
                    className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    Chat with AI Mentor <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/simulators"
                    className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all text-center"
                  >
                    Open Simulators
                  </Link>
                </div>
              </div>

              {/* Mock AI Conversation Card */}
              <div className="lg:col-span-6 bg-[#0F1E36] border border-white/10 rounded-2xl p-5 sm:p-6 text-xs sm:text-[13px] space-y-4 font-sans">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    Q
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl rounded-tl-none text-gray-200">
                    "My CTC is ₹15 Lakh. Should I choose the Old or New Tax Regime for FY 2025-26?"
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white/10 p-3.5 rounded-xl rounded-tl-none text-gray-100 space-y-2 leading-relaxed">
                    <p className="font-semibold text-white">
                      💡 Mathematical Break-Even Analysis:
                    </p>
                    <p>
                      At ₹15 Lakh CTC, the <strong>New Tax Regime</strong> (with ₹75,000 standard deduction) results in tax of approx <strong>₹1,40,400</strong>.
                    </p>
                    <p>
                      To beat this under the <strong>Old Regime</strong>, you need total deductions exceeding <strong>₹4.25 Lakh</strong> (e.g. 80C ₹1.5L + 80D ₹25k + HRA/Home Loan interest ₹2.5L).
                    </p>
                    <div className="pt-2 border-t border-white/10 text-[11px] text-emerald-400 font-medium">
                      ✓ Grounded in Finance Act FY 2025-26 Tax Slabs
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      {/* ══════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-[#F9FAFB] border-b border-gray-200">
        <div className="max-w-[840px] mx-auto px-4 sm:px-6">

          <div className="text-center mb-12">
            <span className="text-[11px] font-bold text-[#0E6163] tracking-widest uppercase block mb-2">
              Common Inquiries
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A1628] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-[14px] text-gray-500 mt-2">
              Everything you need to know about the platform, pricing, and compliance.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-[#0A1628] text-[15px] cursor-pointer hover:bg-gray-50/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-[13.5px] text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 10. FINAL CALL TO ACTION */}
      {/* ══════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-[#0A1628] to-[#0A2628] rounded-3xl p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-xl">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              The best time to understand money<br />
              <span className="text-emerald-400">was 10 years ago.</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto mb-8 leading-relaxed">
              The second best time is right now. 375+ structured lessons, 15 risk-free simulators, and 24/7 AI tutoring. Free forever. No jargon. True clarity.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-base font-bold transition-all shadow-md flex items-center gap-2"
              >
                Start Learning Free Today <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/explore"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-base font-bold transition-all"
              >
                Browse All 8 Tracks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 11. INSTITUTIONAL FOOTER */}
      {/* ══════════════════════════════════════════ */}
      <footer className="bg-[#090D16] text-white pt-16 pb-12 border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/10">

            {/* Brand Column */}
            <div className="md:col-span-4">
              <Logo size="md" href="/" dark />
              <p className="text-xs sm:text-[13px] text-gray-400 mt-4 leading-relaxed max-w-sm">
                India's premier national financial education academy. 375+ lessons, 15 simulators, and AI tutoring. Free forever.
              </p>
              <div className="mt-4 text-xs font-semibold text-emerald-400">
                🇮🇳 Built for Indian Investors & Learners
              </div>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-4">
                  Curriculum
                </p>
                <div className="space-y-2.5 text-xs text-gray-300">
                  <Link href="/explore/personal-finance" className="block hover:text-white transition-colors">Personal Finance</Link>
                  <Link href="/explore/trading-and-markets" className="block hover:text-white transition-colors">Stock Market Basics</Link>
                  <Link href="/explore/trading-and-markets" className="block hover:text-white transition-colors">F&O Trading</Link>
                  <Link href="/explore/corporate-finance" className="block hover:text-white transition-colors">Corporate Finance</Link>
                  <Link href="/case-studies" className="block hover:text-white transition-colors">Case Studies</Link>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-4">
                  Practice Labs
                </p>
                <div className="space-y-2.5 text-xs text-gray-300">
                  <Link href="/practice/sip" className="block hover:text-white transition-colors">SIP Calculator</Link>
                  <Link href="/practice/emi" className="block hover:text-white transition-colors">Loan & EMI Calculator</Link>
                  <Link href="/practice/tax" className="block hover:text-white transition-colors">Tax Calculator FY 2025-26</Link>
                  <Link href="/practice/trading" className="block hover:text-white transition-colors">Paper Trading Terminal</Link>
                  <Link href="/simulators" className="block hover:text-white transition-colors">All 15 Simulators</Link>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-4">
                  Institutional
                </p>
                <div className="space-y-2.5 text-xs text-gray-300">
                  <Link href="/pricing" className="block hover:text-white transition-colors">Pricing & Plans</Link>
                  <Link href="/legal/privacy" className="block hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="/legal/terms" className="block hover:text-white transition-colors">Terms of Service</Link>
                  <Link href="/legal/disclaimer" className="block hover:text-white transition-colors">SEBI Compliance</Link>
                  <Link href="/contact" className="block hover:text-white transition-colors">Contact Support</Link>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11.5px] text-gray-500">
            <p>© 2026 FinanceHub of India. All rights reserved. Strictly for educational purposes. Not SEBI-registered investment advice.</p>
            <p>support@financehub.in</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
