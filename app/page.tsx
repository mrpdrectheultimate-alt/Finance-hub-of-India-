"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Calculator,
  Brain,
  Award,
  ArrowRight,
  Check,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Zap,
  GraduationCap,
  Briefcase,
  LineChart,
  Rocket,
  Compass,
} from "lucide-react";

// ============================================================
// FinanceHub — World-Class Homepage
// app/page.tsx
// 10-Stage Storytelling Flow · Dynamic Hero Mockup · 5 Personas
// 4 Pillars · 8 Tracks · 15 Labs Showcase · AI Terminal · Pricing Toggle
// ============================================================

// ─── Data Definitions ────────────────────────────────────────

const TRUST_STATS = [
  { val: "320+", label: "Published Lessons", sub: "Curated modules" },
  { val: "8", label: "Learning Tracks", sub: "Beginner to advanced" },
  { val: "15", label: "Interactive Labs", sub: "Zero-risk simulators" },
  { val: "100%", label: "Free Core Content", sub: "No credit card needed" },
];

const PERSONAS = [
  {
    icon: GraduationCap,
    label: "Student",
    title: "Money Basics & First Habits",
    desc: "Budgeting, avoiding consumer debt, student bank accounts, and starting your first ₹500 SIP early.",
    track: "Personal Finance",
    trackSlug: "personal-finance",
    badge: "Absolute Beginner",
    color: "#059669",
  },
  {
    icon: Briefcase,
    label: "Working Adult",
    title: "Salary, Taxes & Wealth Growth",
    desc: "Master Old vs New tax regimes, 80C/80D deductions, health insurance, emergency funds, and long-term index SIPs.",
    track: "Personal Finance",
    trackSlug: "personal-finance",
    badge: "Practical Life",
    color: "#2563EB",
  },
  {
    icon: LineChart,
    label: "Investor",
    title: "Equities & Long-Term Compounding",
    desc: "Understand P/E ratios, mutual fund selection, asset allocation rebalancing, and avoiding behavioral traps.",
    track: "Trading & Markets",
    trackSlug: "trading-markets",
    badge: "Wealth Building",
    color: "#7C3AED",
  },
  {
    icon: TrendingUp,
    label: "Trader",
    title: "Technical Analysis & Risk Control",
    desc: "Chart reading, candlestick patterns, support/resistance, RSI/MACD, and virtual paper trading with zero capital risk.",
    track: "Technical Analysis",
    trackSlug: "technical-analysis",
    badge: "Market Skills",
    color: "#EA580C",
  },
  {
    icon: Rocket,
    label: "Founder",
    title: "Startup Finance & Unit Economics",
    desc: "Cash runway modeling, customer acquisition cost, gross margins, valuation, cap tables, and fundraising mechanics.",
    track: "Corporate Finance",
    trackSlug: "corporate-finance",
    badge: "Business Mastery",
    color: "#DC2626",
  },
];

const PILLARS = [
  {
    icon: BookOpen,
    title: "Structured Curriculum",
    desc: "320+ bite-sized lessons across 8 comprehensive tracks. Each lesson features real Indian market examples, cited sources, and clear takeaways.",
    badge: "320+ Lessons",
    color: "#0E6163",
  },
  {
    icon: Calculator,
    title: "15 Interactive Simulators",
    desc: "Test financial decisions hands-on. Model SIP compounding, calculate loan EMI amortizations, compare tax regimes, and practice paper trading.",
    badge: "15 Finance Labs",
    color: "#2563EB",
  },
  {
    icon: Brain,
    title: "Frontier AI Mentor",
    desc: "Ask any financial question 24/7. Get clear, step-by-step breakdowns citing official RBI, SEBI, and AMFI guidelines with zero commercial bias.",
    badge: "24/7 Intelligent Tutor",
    color: "#7C3AED",
  },
  {
    icon: Award,
    title: "XP, Streaks & Verified Certificates",
    desc: "Stay consistent with daily streaks, earn XP for lessons, compete in weekly leagues, and earn shareable certificates with unique credential IDs.",
    badge: "Verifiable Credentials",
    color: "#D97706",
  },
];

const TRACKS = [
  {
    slug: "personal-finance",
    name: "Personal Finance",
    icon: "💰",
    code: "PF",
    color: "#059669",
    lessons: 73,
    quizzes: 18,
    level: "Beginner → Advanced",
    desc: "Budgeting, savings, emergency cushion, insurance, tax planning, and retirement corpus building.",
  },
  {
    slug: "trading-markets",
    name: "Trading & Markets",
    icon: "📈",
    code: "TM",
    color: "#2563EB",
    lessons: 51,
    quizzes: 14,
    level: "Beginner → Advanced",
    desc: "How stock exchanges operate, equities vs bonds, market orders, order books, and risk management.",
  },
  {
    slug: "corporate-finance",
    name: "Corporate Finance",
    icon: "🏢",
    code: "CF",
    color: "#7C3AED",
    lessons: 43,
    quizzes: 11,
    level: "Intermediate → Advanced",
    desc: "Discounted cash flow, company valuation, capital structure, M&A, and financial statement analysis.",
  },
  {
    slug: "crypto-defi",
    name: "Crypto & DeFi",
    icon: "₿",
    code: "CR",
    color: "#0891B2",
    lessons: 36,
    quizzes: 9,
    level: "Beginner → Advanced",
    desc: "Blockchain architecture, smart contracts, decentralized finance protocols, and digital asset custody.",
  },
  {
    slug: "behavioral-finance",
    name: "Behavioral Finance",
    icon: "🧠",
    code: "BF",
    color: "#B45309",
    lessons: 23,
    quizzes: 6,
    level: "Beginner → Intermediate",
    desc: "Loss aversion, FOMO, sunk cost fallacy, mental accounting, and cognitive biases that cost money.",
  },
  {
    slug: "technical-analysis",
    name: "Technical Analysis",
    icon: "📊",
    code: "TA",
    color: "#0F766E",
    lessons: 44,
    quizzes: 12,
    level: "Intermediate → Advanced",
    desc: "Candlestick patterns, trendlines, support & resistance, moving averages, RSI, and chart patterns.",
  },
  {
    slug: "forex-currency",
    name: "Forex & Currencies",
    icon: "💱",
    code: "FX",
    color: "#1D4ED8",
    lessons: 26,
    quizzes: 7,
    level: "Intermediate → Advanced",
    desc: "Global foreign exchange mechanics, currency pairs, central bank interest rates, FEMA, and hedging.",
  },
  {
    slug: "hindi",
    name: "हिंदी Finance",
    icon: "🇮🇳",
    code: "HI",
    color: "#B91C1C",
    lessons: 21,
    quizzes: 5,
    level: "Beginner",
    desc: "Personal finance, mutual funds, aur share market ke buniyadi siddhant saral Hindi bhasha mein.",
  },
];

const HERO_LABS = [
  {
    title: "SIP & Investment Calculator",
    code: "SIP",
    icon: "📈",
    desc: "Model how monthly investments compound over 10 to 30 years at custom CAGR growth rates.",
    color: "#059669",
    href: "/practice/sip",
    tag: "Investing",
    duration: "5 min",
  },
  {
    title: "Loan & EMI Calculator",
    code: "EMI",
    icon: "🏠",
    desc: "Calculate monthly repayments for home and auto loans, and measure the impact of annual prepayments.",
    color: "#2563EB",
    href: "/practice/emi",
    tag: "Loans",
    duration: "3 min",
  },
  {
    title: "Tax Calculator FY 2024-25",
    code: "TAX",
    icon: "💰",
    desc: "Compare Old vs New income tax slabs side-by-side with 80C, 80D, HRA, and standard deduction calculations.",
    color: "#D97706",
    href: "/practice/tax",
    tag: "Tax Planning",
    duration: "3 min",
  },
  {
    title: "Budget Simulator (50/30/20)",
    code: "BUD",
    icon: "📊",
    desc: "Split your monthly take-home salary into Needs, Wants, and Wealth Investments with instant visual breakdowns.",
    color: "#0D9488",
    href: "/practice/budget",
    tag: "Budgeting",
    duration: "5 min",
  },
];

const QUIZ_STEPS = [
  {
    q: "What best describes your current stage?",
    key: "who",
    opts: [
      { label: "🎓 College Student / Fresh Graduate", val: "student" },
      { label: "💼 Salaried Working Professional", val: "adult" },
      { label: "📈 Active Long-Term Investor", val: "investor" },
      { label: "📊 Active Trader / Technical Analyst", val: "trader" },
      { label: "🚀 Business Founder / Entrepreneur", val: "founder" },
    ],
  },
  {
    q: "What is your primary financial goal right now?",
    key: "goal",
    opts: [
      { label: "Master budgeting & start my first SIP", val: "basics" },
      { label: "Save tax & optimize salary deductions", val: "tax" },
      { label: "Learn stock analysis & portfolio building", val: "invest" },
      { label: "Master chart patterns & paper trading", val: "trade" },
      { label: "Understand startup valuation & cash flow", val: "business" },
    ],
  },
  {
    q: "What is your existing finance knowledge level?",
    key: "level",
    opts: [
      { label: "Absolute beginner — starting from zero", val: "zero" },
      { label: "I know basic terms but lack a structured system", val: "basic" },
      { label: "Intermediate — already investing or trading", val: "mid" },
      { label: "Advanced — looking for professional depth", val: "adv" },
    ],
  },
];

const PATH_RECOMMENDATIONS: Record<
  string,
  { track: string; trackSlug: string; level: string; desc: string; icon: string }
> = {
  student: {
    track: "Personal Finance",
    trackSlug: "personal-finance",
    level: "Level 1: Absolute Beginner",
    desc: "Start with budgeting essentials, understanding inflation, and the power of starting small monthly SIPs.",
    icon: "💰",
  },
  adult: {
    track: "Personal Finance",
    trackSlug: "personal-finance",
    level: "Level 2: Wealth & Tax Optimization",
    desc: "Optimize your salary breakdown, compare Old vs New tax regimes, build an emergency buffer, and set up index funds.",
    icon: "💼",
  },
  investor: {
    track: "Trading & Markets",
    trackSlug: "trading-markets",
    level: "Level 1: Equity & Market Structure",
    desc: "Learn fundamental equity analysis, financial ratios (P/E, ROE, Debt/Equity), and asset allocation strategies.",
    icon: "📈",
  },
  trader: {
    track: "Technical Analysis",
    trackSlug: "technical-analysis",
    level: "Level 1: Chart Reading Fundamentals",
    desc: "Master candlesticks, support/resistance levels, trendlines, and risk-reward ratios with simulated paper trading.",
    icon: "📊",
  },
  founder: {
    track: "Corporate Finance",
    trackSlug: "corporate-finance",
    level: "Level 1: Business Finance & Runway",
    desc: "Model cash burn rates, gross margins, valuation multiples, and fundraising mechanics for growing ventures.",
    icon: "🚀",
  },
};

const FAQS = [
  {
    q: "Is FinanceHub really 100% free to start?",
    a: "Yes. You can access over 100+ beginner lessons across all 8 tracks, practice with all 15 interactive simulators, and ask up to 5 AI Mentor questions every day completely free of charge. No credit card or payment information is required.",
  },
  {
    q: "Do I need any prior finance or math background?",
    a: "None whatsoever. Our curriculum is engineered from the ground up for complete beginners. Every concept is broken down into plain language using intuitive Indian market examples, step-by-step graphics, and zero unnecessary jargon.",
  },
  {
    q: "How does the Frontier AI Mentor work?",
    a: "The AI Mentor is trained on structured finance educational frameworks. It tailors explanations to your current lesson, breaks down complex formulas, and references official Indian regulatory guidelines (RBI, SEBI, AMFI, Income Tax India). It never offers personalized financial advice.",
  },
  {
    q: "Are the trading and investment simulators using real money?",
    a: "No. All simulators and paper trading terminals operate exclusively with virtual, simulated currency. They exist so you can master order timing, risk management, and portfolio compounding without risking actual hard-earned capital.",
  },
  {
    q: "How do I earn verified certificates?",
    a: "When you finish all lessons in a track and pass the associated module quizzes with a score of 70% or higher, a verified digital certificate is generated with a unique verification ID that you can display on LinkedIn or your resume.",
  },
  {
    q: "Is content available in Hindi?",
    a: "Yes. We maintain a dedicated 'हिंदी Finance' curriculum featuring 21+ lessons covering personal budgeting, mutual fund SIPs, tax planning, and stock market fundamentals explained clearly in simple Hindi.",
  },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPersona, setSelectedPersona] = useState(0);

  // Onboarding Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizComplete, setQuizComplete] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Scroll detection for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleQuizAnswer = (key: string, val: string) => {
    const nextAnswers = { ...quizAnswers, [key]: val };
    setQuizAnswers(nextAnswers);
    if (quizStep < QUIZ_STEPS.length - 1) {
      setQuizStep((s) => s + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const recommendedPath =
    PATH_RECOMMENDATIONS[quizAnswers.who] || PATH_RECOMMENDATIONS.adult;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#0E6163] selection:text-white">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 1. STICKY NAVIGATION BAR                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200"
            : "bg-white border-b border-slate-100"
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-horizontal.png"
              alt="FinanceHub"
              width={160}
              height={36}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <Link href="/explore" className="hover:text-[#0E6163] transition-colors">
              Curriculum Tracks
            </Link>
            <Link href="/practice" className="hover:text-[#0E6163] transition-colors">
              Finance Labs
            </Link>
            <Link href="/ai-tutor" className="hover:text-[#0E6163] transition-colors">
              AI Mentor
            </Link>
            <Link href="/library" className="hover:text-[#0E6163] transition-colors">
              Library
            </Link>
            <a href="#pricing" className="hover:text-[#0E6163] transition-colors">
              Pricing
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-block px-4 py-2 text-xs font-bold text-slate-700 hover:text-[#0E6163] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 sm:px-5 py-2.5 bg-[#0E6163] hover:bg-[#0A4A4C] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all"
            >
              Start Free →
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-2 text-sm font-semibold">
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0E6163]"
            >
              Curriculum Tracks
            </Link>
            <Link
              href="/practice"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0E6163]"
            >
              Finance Labs
            </Link>
            <Link
              href="/ai-tutor"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0E6163]"
            >
              AI Mentor
            </Link>
            <Link
              href="/library"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0E6163]"
            >
              Library &amp; Resources
            </Link>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0E6163]"
            >
              Pricing
            </a>
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-lg border border-slate-200 text-xs font-bold"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-lg bg-[#0E6163] text-white text-xs font-bold"
              >
                Start Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 2. HERO SECTION WITH DYNAMIC PLATFORM PREVIEW MOCKUP        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-white border-b border-slate-200/60">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Built for India · 100% Free Core Access · RBI &amp; SEBI Aligned</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-[#0F172A]">
                Master Finance.
                <br />
                <span className="text-[#0E6163]">Shape Your Future.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Learn personal finance, investing, taxation, trading, and business valuation through structured lessons, frontier AI guidance, and 15 interactive simulators. In Hindi &amp; English.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/signup"
                  className="px-6 py-3.5 bg-[#0E6163] hover:bg-[#0A4A4C] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Start Learning Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/explore"
                  className="px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 transition-colors"
                >
                  Explore 8 Tracks
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>320+ Modular lessons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>LinkedIn verifiable certificates</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Product Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Background Ambient Glow */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-100/70 via-teal-50 to-blue-100/70 rounded-3xl blur-xl opacity-70 -z-10" />

                {/* Main Glass Workspace Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 space-y-4">
                  {/* Browser-style Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Image
                        src="/logo-icon.png"
                        alt="Emblem"
                        width={16}
                        height={16}
                        className="w-3.5 h-3.5 object-contain"
                      />
                      <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                        FinanceHub Workspace
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      LIVE
                    </span>
                  </div>

                  {/* Active Track Progress Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0E6163] uppercase tracking-wider text-[10px]">
                        Active Curriculum
                      </span>
                      <span className="font-bold text-slate-700">73 Lessons</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-extrabold text-[#0F172A]">
                          Personal Finance Mastery
                        </h4>
                        <p className="text-xs text-slate-500">Level 1: Money Fundamentals</p>
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-600 bg-white">
                        24%
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[24%]" />
                    </div>
                  </div>

                  {/* Mini SIP Compounding Interactive Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-100/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-800 text-[11px] flex items-center gap-1">
                        <span>📈</span> SIP Compounding Visualizer
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700">₹5,000 / mo</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          Expected 20-Yr Corpus
                        </div>
                        <div className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                          ₹49.95 Lakhs
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          Total Invested
                        </div>
                        <div className="text-xs font-bold text-slate-700">₹12.00 Lakhs</div>
                      </div>
                    </div>
                    {/* Sparkline curve */}
                    <div className="h-6 w-full pt-1 flex items-end gap-1">
                      {[15, 20, 24, 32, 45, 60, 80, 100].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className="flex-1 bg-emerald-400/80 rounded-t"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Gamification Strip: Streak & Verified Badge */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-center gap-2">
                      <span className="text-base">🔥</span>
                      <div>
                        <div className="text-xs font-extrabold text-amber-900">7-Day Streak</div>
                        <div className="text-[10px] font-semibold text-amber-700">+350 XP Gained</div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/60 flex items-center gap-2">
                      <Image
                        src="/brand-badge.png"
                        alt="FinanceHub Certified"
                        width={28}
                        height={28}
                        className="w-7 h-7 object-contain"
                      />
                      <div>
                        <div className="text-xs font-extrabold text-indigo-900">Certified</div>
                        <div className="text-[10px] font-semibold text-indigo-700">Unique Credential ID</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 3. TRUST & STATS STRIP                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-10 border-b border-slate-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_STATS.map((s, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-center space-y-1"
              >
                <div className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                  {s.val}
                </div>
                <div className="text-xs font-bold text-slate-800">{s.label}</div>
                <div className="text-[11px] text-slate-500 font-medium">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 4. CHOOSE YOUR STAGE (5 PERSONAS SHOWCASE)                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-[#F8FAFC]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0E6163]">
              Personalized Learning Paths
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A]">
              Finance Knowledge for Every Stage of Life
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Whether you are managing your first salary, analyzing equity balance sheets, or launching a startup—select your profile to begin.
            </p>
          </div>

          {/* 5-Column Responsive Persona Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {PERSONAS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#0E6163] hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ backgroundColor: `${p.color}15`, color: p.color }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {p.badge}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {p.label}
                      </div>
                      <h3 className="text-base font-bold text-[#0F172A] mt-1 leading-snug">
                        {p.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <Link
                      href={`/tracks/${p.trackSlug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
                      style={{ color: p.color }}
                    >
                      <span>Start Track ({p.track})</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 5. THE 4 PILLARS OF FINANCEHUB                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-white border-y border-slate-200/70">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0E6163]">
              The Core Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A]">
              One Platform. The Complete Finance Learning System.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Engineered around how individuals actually absorb, test, and retain financial wisdom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PILLARS.map((pil, idx) => {
              const Icon = pil.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-3xl border border-slate-200 bg-[#F8FAFC] hover:bg-white hover:border-[#0E6163] hover:shadow-md transition-all flex flex-col sm:flex-row items-start gap-6"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: `${pil.color}15`, color: pil.color }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ backgroundColor: `${pil.color}15`, color: pil.color }}
                      >
                        {pil.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#0F172A]">{pil.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{pil.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 6. EIGHT LEARNING TRACKS                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="tracks" className="py-20 sm:py-28 bg-[#F8FAFC]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0E6163]">
                Comprehensive Curriculum
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A]">
                Eight Tracks. One Complete Finance Education.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl">
                Start at your own pace and progress from core concepts to advanced financial modeling.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:border-[#0E6163] hover:text-[#0E6163] shadow-sm transition-all"
            >
              <span>Explore All 320+ Lessons</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRACKS.map((t) => (
              <Link
                key={t.slug}
                href={`/tracks/${t.slug}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-[#0E6163] hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Color Accent Bar */}
                <div className="h-1.5 w-full" style={{ backgroundColor: t.color }} />

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{t.icon}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                      style={{ backgroundColor: `${t.color}15`, color: t.color }}
                    >
                      {t.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#0E6163] transition-colors">
                      {t.name}
                    </h3>
                    <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      {t.level}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {t.desc}
                  </p>
                </div>

                <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>📖 {t.lessons} Lessons</span>
                  <span>🎯 {t.quizzes} Quizzes</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 7. INTERACTIVE FINANCE LABS SHOWCASE                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-white border-t border-slate-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0E6163]">
                Practical Simulation
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A]">
                Don&apos;t Just Read Finance. Model It.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl">
                15 interactive financial calculators and simulated trading environments designed for Indian tax codes and market conditions.
              </p>
            </div>
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E6163] text-white text-xs font-bold hover:bg-[#0A4A4C] shadow-sm transition-all"
            >
              <span>Explore All 15 Labs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HERO_LABS.map((lab) => (
              <div
                key={lab.code}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-[#0E6163] hover:shadow-md transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${lab.color}15` }}
                    >
                      {lab.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      ⏱ {lab.duration}
                    </span>
                  </div>

                  <div>
                    <span
                      className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${lab.color}15`, color: lab.color }}
                    >
                      {lab.tag}
                    </span>
                    <h3 className="text-base font-bold text-[#0F172A] mt-2 group-hover:text-[#0E6163] transition-colors leading-snug">
                      {lab.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{lab.desc}</p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100">
                  <Link
                    href={lab.href}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-opacity group-hover:opacity-90"
                    style={{ backgroundColor: lab.color }}
                  >
                    <span>Launch Calculator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Banner for all 15 labs */}
          <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-[#F8FAFC] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h4 className="text-base font-bold text-[#0F172A]">
                Looking for Retirement, Net Worth, FIRE, or Paper Trading?
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Browse our complete suite of 15 tools with live search, category filtering, and instant scenario modeling.
              </p>
            </div>
            <Link
              href="/practice"
              className="px-6 py-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-sm transition-colors"
            >
              Open Complete Labs Suite →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 8. FRONTIER AI MENTOR TERMINAL (THE DARK SHOWCASE)          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="ai" className="py-20 sm:py-28 bg-[#0A1628] text-white overflow-hidden relative">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Prompt Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Frontier AI Finance Mentor</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Your Finance Doubts
                <br />
                <span className="text-emerald-400">Answered Instantly.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
                Ask anything about compounding, income tax regimes, mutual funds, or derivatives. Get clear, step-by-step breakdowns citing official Indian regulatory sources.
              </p>

              {/* Sample Prompts */}
              <div className="space-y-2.5 pt-2">
                {[
                  "Explain compound interest with a ₹5,000 monthly SIP example",
                  "Old vs New Tax Regime: Which saves more for ₹12 Lakh salary?",
                  "What is the difference between ELSS mutual funds and PPF?",
                ].map((prompt, i) => (
                  <Link
                    key={i}
                    href={`/ai-tutor?prompt=${encodeURIComponent(prompt)}`}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500 hover:bg-white/10 transition-all flex items-center justify-between text-xs text-slate-300 group"
                  >
                    <span>💡 &ldquo;{prompt}&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
                  </Link>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/ai-tutor"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Brain className="w-4 h-4" />
                  <span>Launch AI Mentor Full Screen</span>
                </Link>
                <div className="text-[11px] text-slate-400 mt-2">
                  5 free questions daily · No sign-in required to try
                </div>
              </div>
            </div>

            {/* Right Chat Terminal Preview */}
            <div className="lg:col-span-6">
              <div className="bg-[#131B2E] rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                      <Image
                        src="/brand-badge.png"
                        alt="FinanceHub AI"
                        width={36}
                        height={36}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">FinanceHub AI Mentor</div>
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Online · Verified RBI / SEBI Sources</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    5/5 FREE
                  </span>
                </div>

                {/* Dialog Bubble 1 */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] p-3.5 rounded-2xl rounded-tr-sm bg-[#0E6163] text-white text-xs leading-relaxed">
                    How does a ₹5,000 monthly SIP grow over 20 years at 12% CAGR?
                  </div>
                </div>

                {/* Dialog Bubble 2 */}
                <div className="flex justify-start">
                  <div className="max-w-[90%] p-4 rounded-2xl rounded-tl-sm bg-slate-800/80 border border-slate-700 text-slate-200 text-xs leading-relaxed space-y-2">
                    <p>
                      Here is the exact mathematical breakdown of compound interest over 20 years:
                    </p>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-[11px] space-y-1">
                      <div className="text-slate-400">Total Invested: <span className="text-white font-bold">₹12,00,000</span></div>
                      <div className="text-slate-400">Estimated Wealth Gain: <span className="text-emerald-400 font-bold">₹37,95,740</span></div>
                      <div className="text-slate-400">Total Expected Corpus: <span className="text-emerald-300 font-black">₹49,95,740</span></div>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1">
                      The magic occurs because your investment returns generate their own returns in the final decade.
                    </p>
                    <div className="pt-1 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span>📎 Source: AMFI India &amp; Compound Interest Theorem</span>
                    </div>
                  </div>
                </div>

                {/* Input simulator bar */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-400">
                    <span className="flex-1 pl-2">Ask any question on taxes, SIPs, or stocks…</span>
                    <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 9. ONBOARDING QUIZ (PERSONALIZED STARTING PATH)             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-[#F8FAFC]">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0E6163]">
            Guided Onboarding
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A] mt-2 mb-3">
            Not Sure Where to Start?
          </h2>
          <p className="text-sm text-slate-600 mb-10">
            Answer 3 quick questions. FinanceHub will build your tailored starting path.
          </p>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-left">
            {!quizComplete ? (
              <div className="space-y-6">
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>STEP {quizStep + 1} OF {QUIZ_STEPS.length}</span>
                    <span>{Math.round(((quizStep + 1) / QUIZ_STEPS.length) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0E6163] transition-all duration-200"
                      style={{ width: `${((quizStep + 1) / QUIZ_STEPS.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A]">
                  {QUIZ_STEPS[quizStep].q}
                </h3>

                <div className="space-y-2.5">
                  {QUIZ_STEPS[quizStep].opts.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(QUIZ_STEPS[quizStep].key, opt.val)}
                      className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-[#0E6163] hover:bg-emerald-50/40 text-xs sm:text-sm font-semibold text-slate-800 transition-all flex items-center justify-between group"
                    >
                      <span>{opt.label}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0E6163] group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center sm:text-left">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                  🎯 Tailored Learning Recommendation
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-2xl flex items-center justify-center flex-shrink-0">
                    {recommendedPath.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0F172A]">
                      {recommendedPath.track}
                    </h3>
                    <p className="text-xs font-semibold text-[#0E6163]">
                      Recommended Starting Point: {recommendedPath.level}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {recommendedPath.desc}
                </p>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/tracks/${recommendedPath.trackSlug}`}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-[#0E6163] text-white text-center text-xs font-bold shadow-md hover:bg-[#0A4A4C] transition-colors"
                  >
                    Start This Path (Free) →
                  </Link>
                  <button
                    onClick={() => {
                      setQuizStep(0);
                      setQuizAnswers({});
                      setQuizComplete(false);
                    }}
                    className="py-3.5 px-5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Retake Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 10. PRICING SECTION (MONTHLY / YEARLY TOGGLE)               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-20 sm:py-28 bg-white border-t border-slate-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0E6163]">
              Simple &amp; Transparent
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A]">
              Start Free. Upgrade When Ready.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Core education is always 100% free. Premium plans unlock complete career depth and unrestricted AI access.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 mt-4">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span>Yearly</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  SAVE 17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl border border-slate-200 bg-white flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A]">Free Tier</h3>
                  <p className="text-xs text-slate-500 mt-1">Perfect for getting started</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#0F172A]">₹0</span>
                  <span className="text-xs text-slate-400 font-bold">/ forever</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600 font-medium">
                  {[
                    "100+ beginner lessons across all tracks",
                    "5 AI Mentor queries daily",
                    "Basic simulators (SIP, EMI, Tax)",
                    "Quiz practice with instant scoring",
                    "Streaks & weekly league leaderboard",
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/signup"
                  className="block w-full py-3 text-center rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Start Free
                </Link>
              </div>
            </div>

            {/* Pro Plan (Most Popular Elevated) */}
            <div className="p-8 rounded-3xl border-2 border-[#0E6163] bg-white shadow-xl flex flex-col justify-between relative transform md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#0E6163] text-white text-[10px] font-black uppercase tracking-wider shadow">
                MOST POPULAR
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A]">Pro Plan</h3>
                  <p className="text-xs text-slate-500 mt-1">For serious learners and investors</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#0F172A]">
                    {billingCycle === "monthly" ? "₹499" : "₹4,990"}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    {billingCycle === "monthly" ? "/ month" : "/ year"}
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-slate-700 font-medium">
                  {[
                    "All 320+ lessons across 8 tracks",
                    "Unlimited AI Mentor queries",
                    "All 15 interactive simulators & labs",
                    "Downloadable lesson PDF study notes",
                    "Verified certificates on completion",
                    "Curated video library (82 playlists)",
                    "Priority community support",
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/signup?plan=pro"
                  className="block w-full py-3.5 text-center rounded-xl bg-[#0E6163] hover:bg-[#0A4A4C] text-white text-xs font-bold shadow-md transition-all"
                >
                  Start 7-Day Free Trial
                </Link>
              </div>
            </div>

            {/* Expert Plan */}
            <div className="p-8 rounded-3xl border border-slate-200 bg-white flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A]">Expert Tier</h3>
                  <p className="text-xs text-slate-500 mt-1">For traders, analysts &amp; founders</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#0F172A]">
                    {billingCycle === "monthly" ? "₹999" : "₹9,990"}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    {billingCycle === "monthly" ? "/ month" : "/ year"}
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600 font-medium">
                  {[
                    "Everything included in Pro",
                    "Advanced paper trading terminals",
                    "Startup valuation & cap table models",
                    "Career roadmap & resume guidance",
                    "Priority 1-on-1 AI study sessions",
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/signup?plan=expert"
                  className="block w-full py-3 text-center rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Start Expert Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 11. FAQ ACCORDION                                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-[#F8FAFC]">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0E6163]">
              Got Questions?
            </span>
            <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-[#0F172A]"
                  >
                    <span>{faq.q}</span>
                    <span
                      className={`text-lg text-[#0E6163] transition-transform duration-200 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 12. FINAL CONVERSION CTA BANNER                             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-[#0A1628] text-white text-center">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex justify-center mb-1">
            <Image
              src="/brand-badge.png"
              alt="FinanceHub Quality Seal"
              width={72}
              height={72}
              className="w-16 h-16 object-contain drop-shadow-lg"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            <span>🚀 Start Your Journey Today</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mx-auto leading-tight">
            Your Financial Education Starts With One Step.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto">
            Build true compounding confidence. Master money, investing, and markets without financial risk.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <span>Start Learning Free Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/explore"
              className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-xl border border-white/20 transition-colors"
            >
              Browse All Courses
            </Link>
          </div>

          {/* Social Follow Links */}
          <div className="pt-8 flex items-center justify-center gap-4 text-xs text-slate-400">
            <span>Connect with us:</span>
            <a
              href="https://x.com/polymerhub_"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              @polymerhub_ on X
            </a>
            <a
              href="https://www.linkedin.com/in/lpk-naidu-3414153b2"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 13. MASSIVE WORLD-CLASS FOOTER                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-[#060E18] text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="inline-block">
                <Image
                  src="/logo-horizontal-white.png"
                  alt="FinanceHub"
                  width={175}
                  height={38}
                  className="h-9 w-auto object-contain"
                />
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                India&apos;s financial education platform. Dedicated to building economic literacy across personal finance, investing, taxation, and markets.
              </p>
              <div className="text-[11px] text-slate-500">
                🇮🇳 Designed &amp; engineered in India for global learners.
              </div>
            </div>

            {/* Curriculum Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Curriculum
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/tracks/personal-finance" className="hover:text-white">
                    Personal Finance
                  </Link>
                </li>
                <li>
                  <Link href="/tracks/trading-markets" className="hover:text-white">
                    Trading &amp; Markets
                  </Link>
                </li>
                <li>
                  <Link href="/tracks/corporate-finance" className="hover:text-white">
                    Corporate Finance
                  </Link>
                </li>
                <li>
                  <Link href="/tracks/technical-analysis" className="hover:text-white">
                    Technical Analysis
                  </Link>
                </li>
                <li>
                  <Link href="/tracks/hindi" className="hover:text-white">
                    हिंदी Finance
                  </Link>
                </li>
              </ul>
            </div>

            {/* Tools & Labs */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Tools &amp; Labs
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/practice" className="hover:text-white">
                    15 Finance Labs
                  </Link>
                </li>
                <li>
                  <Link href="/practice/sip" className="hover:text-white">
                    SIP Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/practice/emi" className="hover:text-white">
                    Loan EMI Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/practice/tax" className="hover:text-white">
                    Tax Comparison FY 24-25
                  </Link>
                </li>
                <li>
                  <Link href="/practice/trading" className="hover:text-white">
                    Paper Trading Game
                  </Link>
                </li>
              </ul>
            </div>

            {/* Platform & Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Legal &amp; Info
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/legal/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/legal/disclaimer" className="hover:text-white">
                    SEBI Disclaimer
                  </Link>
                </li>
                <li>
                  <Link href="/legal/refund" className="hover:text-white">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Team
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Disclaimers */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 FinanceHub of India. All rights reserved.
            </div>
            <div>
              Educational content only · Not SEBI-registered financial advice.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
