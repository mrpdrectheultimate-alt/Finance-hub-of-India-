"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getBrowserClient } from "@/lib/supabase";
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
  CheckCircle2,
  Lock,
  Star,
  Flame,
  Layers,
  Scale,
  Shield,
  BarChart3,
  PieChart,
  Landmark,
  ArrowUpRight,
  Clock,
  HelpCircle,
} from "lucide-react";

// ============================================================
// FinanceHub — World-Class National Financial Academy Homepage
// app/page.tsx
// 12-Stage Storytelling Flow · Sovereign Typography · Interactive Hero Lab
// Tabbed Life Stages · 4-Step Mastery Engine · In-Page Dual Simulator
// 8 Tracks · 60-Book Vault Showcase · AI Terminal · Transparent Pricing
// ============================================================

// ─── Data Definitions ────────────────────────────────────────

const STATS_DATA = [
  { val: "320+", label: "Published Lessons", sub: "8 comprehensive tracks" },
  { val: "60", label: "World-Class Books", sub: "Curated library vault" },
  { val: "15", label: "Risk-Free Labs", sub: "Virtual simulation engines" },
  { val: "100%", label: "Free Core Access", sub: "No credit card needed" },
];

const LIFE_STAGE_PERSONAS = [
  {
    id: "student",
    icon: GraduationCap,
    label: "College Student",
    badge: "Starting From Zero",
    color: "#059669",
    headline: "First Habits, Budgeting & Your First ₹500 SIP",
    dilemma:
      "Confused by finance jargon, living on a student allowance, and tempted by easy 'buy now, pay later' credit traps.",
    outcome:
      "You'll learn how compounding turns small ₹500 monthly SIPs into significant capital, how student bank accounts work, and how to stay 100% debt-free.",
    modules: [
      "The Power of Starting at Age 20",
      "Building a Zero-Stress 3-Bucket Budget",
      "Avoiding 40% APR Credit Traps",
    ],
    labName: "SIP & Compound Growth Visualizer",
    labHref: "/practice/sip",
    trackName: "Personal Finance Track",
    trackHref: "/tracks/personal-finance",
  },
  {
    id: "adult",
    icon: Briefcase,
    label: "Salaried Adult",
    badge: "Tax & Wealth Optimization",
    color: "#2563EB",
    headline: "Salary Slips, Old vs New Tax Slabs & Index Funds",
    dilemma:
      "Dismayed by heavy monthly TDS deductions, unsure whether to pick the Old or New Tax Regime, and missing an emergency cushion.",
    outcome:
      "Master Section 80C, 80D, and HRA optimization, calculate term insurance coverage, and build an automated index fund wealth engine.",
    modules: [
      "Decoding Every Line of Your Salary Slip",
      "Old vs New Tax Regime: The Exact Mathematical Break-Even",
      "Term & Health Insurance: Pure Protection vs ULIP Traps",
    ],
    labName: "Tax Regime Comparator (Old vs New)",
    labHref: "/practice/tax",
    trackName: "Personal Finance Track",
    trackHref: "/tracks/personal-finance",
  },
  {
    id: "investor",
    icon: LineChart,
    label: "Equity Investor",
    badge: "Long-Term Compounding",
    color: "#7C3AED",
    headline: "Fundamental Analysis, Valuation & Asset Allocation",
    dilemma:
      "Buying stocks based on Telegram tips, panic-selling during market corrections, and lacking a systematic portfolio allocation strategy.",
    outcome:
      "Learn to read balance sheets, compute P/E, ROCE, and Debt/Equity ratios, rebalance asset classes, and compound capital with disciplined equanimity.",
    modules: [
      "Reading 10-K & Annual Reports in 30 Minutes",
      "Valuation Models: DCF & Price-to-Earnings Multiples",
      "Asset Allocation: Equity, Debt, Gold & Liquid Funds",
    ],
    labName: "Portfolio Asset Rebalancer",
    labHref: "/practice/rebalancer",
    trackName: "Trading & Markets Track",
    trackHref: "/tracks/trading-markets",
  },
  {
    id: "trader",
    icon: TrendingUp,
    label: "Active Trader",
    badge: "Market Skills & Risk Control",
    color: "#EA580C",
    headline: "Technical Charts, Order Books & Virtual Paper Trading",
    dilemma:
      "Suffering quick losses in Futures & Options without understanding position sizing, stop-loss mathematics, or risk-to-reward discipline.",
    outcome:
      "Master candlestick formations, support/resistance zones, moving averages, RSI, and execute paper trades with zero real-capital risk.",
    modules: [
      "Candlestick Patterns & Price Action Dynamics",
      "Support, Resistance & Volume Profile Confirmation",
      "The 1% Risk Rule: Position Sizing & Stop-Loss Discipline",
    ],
    labName: "Virtual Paper Trading Terminal",
    labHref: "/practice/trading",
    trackName: "Technical Analysis Track",
    trackHref: "/tracks/technical-analysis",
  },
  {
    id: "founder",
    icon: Rocket,
    label: "Startup Founder",
    badge: "Corporate Finance & Capital",
    color: "#DC2626",
    headline: "Cash Runway, Unit Economics & Enterprise Valuation",
    dilemma:
      "Burning cash without understanding gross margins, confusing accounting profit with operating cash flow, and giving away excessive cap table equity.",
    outcome:
      "Model monthly burn rates, calculate CAC/LTV payback periods, master cap tables, and prepare for investor due diligence with institutional confidence.",
    modules: [
      "Cash Flow Statement vs P&L: Why Profitable Startups Go Bust",
      "Unit Economics: CAC, LTV & Payback Period Modeling",
      "Cap Table Mathematics, Convertible Notes & SAFE Agreements",
    ],
    labName: "Startup Cash Runway Simulator",
    labHref: "/practice/startup-cash-flow",
    trackName: "Corporate Finance Track",
    trackHref: "/tracks/corporate-finance",
  },
];

const MASTERY_STEPS = [
  {
    step: "01",
    title: "Bite-Sized Conceptual Truth",
    desc: "5-minute micro-lessons explaining one financial concept at a time. Packed with real Indian company examples (TCS, Reliance, HDFC, Zomato) and zero fluff.",
    icon: BookOpen,
    tag: "Structured Theory",
  },
  {
    step: "02",
    title: "Risk-Free Laboratory Testing",
    desc: "Immediately test what you learned in 15 interactive simulators. Tweak interest rates, inflation assumptions, and salary numbers with zero real-money risk.",
    icon: Calculator,
    tag: "Applied Practice",
  },
  {
    step: "03",
    title: "Socratic AI Reinforcement",
    desc: "Have doubts? Ask our 24/7 AI Mentor. It provides step-by-step statutory breakdowns citing official RBI, SEBI, AMFI, and Income Tax Department rules.",
    icon: Brain,
    tag: "Frontier Mentorship",
  },
  {
    step: "04",
    title: "Verifiable Credentialing",
    desc: "Score 70%+ on end-of-track comprehensive exams to earn cryptographically verifiable digital certificates with unique credential IDs for LinkedIn.",
    icon: Award,
    tag: "Credential Proof",
  },
];

const CURRICULUM_TRACKS = [
  {
    slug: "personal-finance",
    name: "Personal Finance",
    code: "PF",
    color: "#059669",
    lessons: 73,
    quizzes: 18,
    level: "Beginner → Advanced",
    desc: "Budgeting, savings, emergency buffer, term insurance, tax planning, and retirement corpus compounding.",
    highlight: "Essential for 100% of citizens",
  },
  {
    slug: "trading-markets",
    name: "Trading & Markets",
    code: "TM",
    color: "#2563EB",
    lessons: 51,
    quizzes: 14,
    level: "Beginner → Advanced",
    desc: "How stock exchanges operate, equities vs debt, market orders, order books, fundamental analysis, and risk management.",
    highlight: "NSE, BSE & Capital Markets",
  },
  {
    slug: "corporate-finance",
    name: "Corporate Finance",
    code: "CF",
    color: "#7C3AED",
    lessons: 43,
    quizzes: 11,
    level: "Intermediate → Advanced",
    desc: "Discounted cash flow (DCF), enterprise valuation, capital structure, M&A, and financial statement forensics.",
    highlight: "Founders, Analysts & CFOs",
  },
  {
    slug: "crypto-defi",
    name: "Crypto & DeFi",
    code: "CR",
    color: "#0891B2",
    lessons: 36,
    quizzes: 9,
    level: "Beginner → Advanced",
    desc: "Blockchain architecture, smart contracts, decentralized finance protocols, cold storage custody, and Indian crypto tax law.",
    highlight: "Digital Assets & Web3",
  },
  {
    slug: "behavioral-finance",
    name: "Behavioral Finance",
    code: "BF",
    color: "#B45309",
    lessons: 23,
    quizzes: 6,
    level: "All Levels",
    desc: "Loss aversion, FOMO, sunk cost fallacy, mental accounting, and cognitive biases that sabotage financial returns.",
    highlight: "Psychology & Discipline",
  },
  {
    slug: "technical-analysis",
    name: "Technical Analysis",
    code: "TA",
    color: "#0F766E",
    lessons: 44,
    quizzes: 12,
    level: "Intermediate → Advanced",
    desc: "Candlestick patterns, trendlines, support & resistance, moving averages, RSI, and risk-reward charting.",
    highlight: "Chart Mastery & Timing",
  },
  {
    slug: "forex-currency",
    name: "Forex & Currencies",
    code: "FX",
    color: "#1D4ED8",
    lessons: 26,
    quizzes: 7,
    level: "Intermediate → Advanced",
    desc: "Global foreign exchange mechanics, USD/INR dynamics, central bank interest rates, FEMA regulations, and currency hedging.",
    highlight: "Macroeconomics & Trade",
  },
  {
    slug: "hindi",
    name: "हिंदी Finance",
    code: "HI",
    color: "#B91C1C",
    lessons: 21,
    quizzes: 5,
    level: "Beginner",
    desc: "Personal finance, mutual fund SIP, income tax, aur share market ke buniyadi siddhant saral Hindi bhasha mein.",
    highlight: "100% शुद्ध हिंदी में",
  },
];

const VAULT_FEATURED_BOOKS = [
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    badge: "Must Read",
    category: "Behavioral Finance",
    cover: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
    takeaway: "Wealth is what you do not spend — it is invisible freedom, optionality, and calm.",
  },
  {
    title: "The Intelligent Investor",
    author: "Benjamin Graham",
    badge: "Value Classic",
    category: "Stock Investing",
    cover: "https://covers.openlibrary.org/b/isbn/9780060555665-L.jpg",
    takeaway: "The three most important words in investing: Margin of Safety.",
  },
  {
    title: "Let's Talk Money",
    author: "Monika Halan",
    badge: "Indian Context",
    category: "Personal Finance",
    cover: "https://covers.openlibrary.org/b/isbn/9789352779390-L.jpg",
    takeaway: "The 3-bank-account system: Income, Spend, and Invest accounts keep financial life leak-proof.",
  },
  {
    title: "One Up on Wall Street",
    author: "Peter Lynch",
    badge: "Stock Picking",
    category: "Stock Investing",
    cover: "https://covers.openlibrary.org/b/isbn/9780743200400-L.jpg",
    takeaway: "Everyday consumers notice winning business trends long before Wall Street analysts do.",
  },
  {
    title: "Zero to One",
    author: "Peter Thiel",
    badge: "Founders",
    category: "Corporate Finance",
    cover: "https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg",
    takeaway: "Monopolies drive sustainable profits; perfect competition destroys corporate capital.",
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    badge: "Nobel Classic",
    category: "Behavioral Finance",
    cover: "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg",
    takeaway: "System 1 emotional intuition makes financial mistakes; System 2 deliberate logic avoids them.",
  },
];

const CASE_STUDIES = [
  {
    title: "The 1992 Securities Scam",
    tag: "Banking & Regulation",
    lesson: "How fake Bank Receipts (BRs) exploited settlement delays and created modern SEBI regulations.",
    color: "#B91C1C",
  },
  {
    title: "Satyam Computer Services",
    tag: "Corporate Governance",
    lesson: "Forensic accounting breakdown: How ₹5,000 Crores of non-existent fixed deposits went undetected.",
    color: "#B45309",
  },
  {
    title: "Paytm & Zomato IPO Reality",
    tag: "Valuation & Unit Economics",
    lesson: "From private hype to public market reality: Why cash flows always matter more than GMV.",
    color: "#0E6163",
  },
];

const FAQS = [
  {
    q: "Is FinanceHub truly 100% free to access?",
    a: "Yes. Over 100+ foundational lessons across all 8 tracks, all 15 interactive simulators, book summaries from our library vault, and 5 daily AI Mentor questions are completely free forever. No credit card is ever requested to learn.",
  },
  {
    q: "Do I need any mathematical or commerce background?",
    a: "None at all. Our lessons are deliberately engineered from first principles for beginners. We replace dry formulas with intuitive real-world Indian examples (like tea stalls, salary slips, and consumer tech) and visual interactive sliders.",
  },
  {
    q: "Are the financial simulators using real money?",
    a: "No. All simulators and trading terminals operate strictly with virtual simulation currency. They are safe educational sandboxes so you can experience market volatility and compounding without risking actual hard-earned capital.",
  },
  {
    q: "How does the Frontier AI Mentor work?",
    a: "The AI Mentor is an interactive educational tutor. It breaks down complex concepts, explains tax slabs, and references official Indian guidelines from RBI, SEBI, AMFI, and the Income Tax Department. It is strictly non-advisory and does not provide personal financial or investment advice.",
  },
  {
    q: "How do I earn verified completion certificates?",
    a: "When you finish all lessons in a track and pass the comprehensive module exams with a score of 70% or higher, a verified digital certificate is generated with a unique credential ID that you can display on LinkedIn or your CV.",
  },
  {
    q: "Is content available in Hindi?",
    a: "Yes! We maintain an entire dedicated 'हिंदी Finance' curriculum featuring 21+ lessons covering budgeting, mutual fund SIPs, income tax, and stock market basics explained in clear, accessible Hindi.",
  },
];

// ─── Currency & Formatting Helpers ───────────────────────────

function formatIndianCurrency(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakhs`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePersona, setActivePersona] = useState(0);

  // Hero SIP Slider State
  const [heroMonthly, setHeroMonthly] = useState(10000);
  const [heroYears, setHeroYears] = useState(15);
  const [heroRate] = useState(12); // Standard 12% equity CAGR

  // Flagship Sandbox State
  const [sandboxTab, setSandboxTab] = useState<"sip" | "tax">("sip");
  const [sandboxMonthly, setSandboxMonthly] = useState(15000);
  const [sandboxYears, setSandboxYears] = useState(20);
  const [sandboxRate, setSandboxRate] = useState(12);

  // Tax Simulator State (FY 2025-26)
  const [taxIncome, setTaxIncome] = useState(1200000); // ₹12L Default

  // AI Prompt State
  const [activeAiPrompt, setActiveAiPrompt] = useState(0);

  // Pricing State
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const client = getBrowserClient();
    client.auth.getUser().then(({ data: { user } }: any) => {
      if (user) {
        setCurrentUser(user);
        client
          .from("profiles")
          .select("full_name, avatar_url, subscription_tier")
          .eq("id", user.id)
          .single()
          .then(({ data }: any) => {
            if (data) setUserProfile(data);
          });
      }
    });

    const { data: listener } = client.auth.onAuthStateChange((_event: any, session: any) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSignOut = async () => {
    const client = getBrowserClient();
    await client.auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
    window.location.reload();
  };

  // Scroll detection for sticky header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hero SIP Calculation
  const heroSipResult = useMemo(() => {
    const months = heroYears * 12;
    const i = heroRate / 12 / 100;
    const fv = heroMonthly * (((Math.pow(1 + i, months) - 1) / i) * (1 + i));
    const invested = heroMonthly * months;
    return {
      invested: Math.round(invested),
      corpus: Math.round(fv),
      wealthGain: Math.round(fv - invested),
    };
  }, [heroMonthly, heroYears, heroRate]);

  // Sandbox SIP Calculation
  const sandboxSipResult = useMemo(() => {
    const months = sandboxYears * 12;
    const i = sandboxRate / 12 / 100;
    const fv = sandboxMonthly * (((Math.pow(1 + i, months) - 1) / i) * (1 + i));
    const invested = sandboxMonthly * months;
    return {
      invested: Math.round(invested),
      corpus: Math.round(fv),
      wealthGain: Math.round(fv - invested),
    };
  }, [sandboxMonthly, sandboxYears, sandboxRate]);

  // Tax Comparison Calculation (FY 2025-26)
  const taxComparison = useMemo(() => {
    // New Regime (FY 2025-26: Std ded ₹75,000 + Section 87A rebate up to ₹7L taxable)
    const stdNew = 75000;
    const taxableNew = Math.max(0, taxIncome - stdNew);
    let taxNew = 0;
    if (taxableNew > 700000) {
      const slabs = [
        { limit: 300000, rate: 0 },
        { limit: 400000, rate: 0.05 },
        { limit: 300000, rate: 0.1 },
        { limit: 200000, rate: 0.15 },
        { limit: 300000, rate: 0.2 },
        { limit: Infinity, rate: 0.3 },
      ];
      let rem = taxableNew;
      for (const { limit, rate } of slabs) {
        const chunk = Math.min(rem, limit);
        taxNew += chunk * rate;
        rem -= chunk;
        if (rem <= 0) break;
      }
      taxNew += taxNew * 0.04; // 4% Health & Ed Cess
    }

    // Old Regime (Std ded ₹50,000 + 80C ₹1.5L + 80D ₹25K = ₹2.25L deductions)
    const dedOld = 50000 + 150000 + 25000;
    const taxableOld = Math.max(0, taxIncome - dedOld);
    let taxOld = 0;
    if (taxableOld > 500000) {
      const slabsOld = [
        { limit: 250000, rate: 0 },
        { limit: 250000, rate: 0.05 },
        { limit: 500000, rate: 0.2 },
        { limit: Infinity, rate: 0.3 },
      ];
      let rem = taxableOld;
      for (const { limit, rate } of slabsOld) {
        const chunk = Math.min(rem, limit);
        taxOld += chunk * rate;
        rem -= chunk;
        if (rem <= 0) break;
      }
      taxOld += taxOld * 0.04;
    }

    const difference = Math.abs(Math.round(taxOld - taxNew));
    const recommended = taxNew <= taxOld ? "New Tax Regime" : "Old Tax Regime";

    return {
      taxNew: Math.round(taxNew),
      taxOld: Math.round(taxOld),
      difference,
      recommended,
    };
  }, [taxIncome]);

  const currentPersona = LIFE_STAGE_PERSONAS[activePersona];

  const AI_SAMPLE_PROMPTS = [
    {
      q: "Can I claim HRA if I pay rent to my parents?",
      a: "Yes, under Section 10(13A) of the Income Tax Act, provided: (1) You do not own or co-own the property, (2) You maintain bank transfer records and signed rent receipts, and (3) Your parents declare this rental income in their annual ITR filings.",
      source: "Income Tax Act, 1961 · Sec 10(13A) & Rule 2A",
    },
    {
      q: "How does an RBI Repo Rate hike affect my Home Loan EMI?",
      a: "Commercial banks benchmark floating rate home loans to the RBI Repo Rate (EBR). When RBI hikes repo rate by 25 bps, banks typically pass on the rate hike, which either extends your loan tenure (standard) or raises your monthly EMI.",
      source: "RBI Master Direction on External Benchmark Lending (EBR)",
    },
    {
      q: "What is the difference between P/E and PEG Ratio?",
      a: "The P/E ratio measures stock price relative to current EPS. The PEG ratio divides P/E by the company's annual earnings growth rate. Peter Lynch popularized PEG < 1.0 as a hallmark of value, showing you aren't overpaying for growth.",
      source: "Fundamental Equity Valuation Principles · Peter Lynch Method",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#0F172A] font-sans antialiased selection:bg-[#0E6163] selection:text-white">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STAGE 1: GLOBAL MASTER GLASS NAVIGATION                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80"
            : "bg-white border-b border-slate-100"
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Official Brand Logo */}
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

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <Link href="/explore" className="hover:text-[#0E6163] transition-colors">
              Curriculum Tracks
            </Link>
            <Link href="/practice" className="hover:text-[#0E6163] transition-colors">
              Finance Labs
            </Link>
            <Link href="/library" className="hover:text-[#0E6163] transition-colors flex items-center gap-1">
              <span>60-Book Vault</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                New
              </span>
            </Link>
            <Link href="/ai-tutor" className="hover:text-[#0E6163] transition-colors">
              AI Mentor
            </Link>
            <a href="#pricing" className="hover:text-[#0E6163] transition-colors">
              Pricing
            </a>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 text-[11px] font-semibold text-slate-600 border border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Simulators Active</span>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-[#0E6163] hover:bg-[#0A4A4C] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:inline-block px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-block px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-[#0E6163] transition-colors"
                >
                  Log in
                </Link>

                <Link
                  href="/signup"
                  className="px-4 sm:px-5 py-2.5 bg-[#0E6163] hover:bg-[#0A4A4C] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200"
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
          <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-2 text-sm font-semibold shadow-lg">
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0E6163]"
            >
              Curriculum Tracks (8 Tracks)
            </Link>
            <Link
              href="/practice"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0E6163]"
            >
              15 Interactive Simulators
            </Link>
            <Link
              href="/library"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0E6163]"
            >
              60 Master Books Library Vault
            </Link>
            <Link
              href="/ai-tutor"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0E6163]"
            >
              Frontier AI Mentor
            </Link>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-[#0E6163]"
            >
              Tuition &amp; Plans
            </a>
            {currentUser ? (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-[#0E6163] text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-center py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:text-red-600"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex gap-2">
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
            )}
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STAGE 2: THE SOVEREIGN HERO STAGE & LIVE SIP EXPLORER       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-24 overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-white via-[#FCFBF9] to-[#F8F7F4]">
        {/* Subtle decorative background watermark */}
        <div className="absolute inset-0 bg-[radial-gradient(#0E6163_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Sovereign Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {currentUser
                    ? `Welcome back, ${userProfile?.full_name?.split(" ")[0] || currentUser.email?.split("@")[0] || "Learner"} · Account Active`
                    : "National Financial Literacy Initiative · 100% Free Core · SEBI Compliant"}
                </span>
              </div>

              {/* Main Headline: Editorial Serif + Emerald Modern Sans */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-[#0A1628]">
                <span style={{ fontFamily: "var(--font-reading, Georgia, serif)" }} className="italic font-normal block mb-1 text-slate-800">
                  Master the Rules of Money.
                </span>
                <span className="text-[#0E6163]">Build Unshakable Freedom.</span>
              </h1>

              {/* Dignified Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                From your first ₹500 SIP to enterprise valuation—master personal finance, taxation, stock markets, and economics through 320+ lessons, 15 risk-free simulators, 60 world-class books, and frontier AI guidance.
              </p>

              {/* Primary Call-to-Actions */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                {currentUser ? (
                  <Link
                    href="/dashboard"
                    className="px-6 py-3.5 bg-[#0E6163] hover:bg-[#0A4A4C] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <span>Continue to My Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="px-6 py-3.5 bg-[#0E6163] hover:bg-[#0A4A4C] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <span>Start Learning Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  href="/explore"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 shadow-xs transition-colors"
                >
                  Explore 8 Tracks
                </Link>
              </div>

              {/* Trust Checkmarks */}
              <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-semibold text-slate-500">
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
                  <span>LinkedIn verifiable credentials</span>
                </div>
              </div>
            </div>

            {/* Right: Live Interactive Hero Compounding Explorer */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Ambient Glow */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-100/60 via-teal-50 to-blue-100/60 rounded-3xl blur-xl opacity-75 -z-10" />

                {/* Main Interactive Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5">
                  {/* Browser Chrome Bar */}
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
                        Live Compounding Explorer
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                      INTERACTIVE
                    </span>
                  </div>

                  {/* Monthly Investment Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600">Monthly SIP Contribution</span>
                      <span className="font-black text-sm text-[#0E6163]">
                        ₹{heroMonthly.toLocaleString("en-IN")} / mo
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={50000}
                      step={1000}
                      value={heroMonthly}
                      onChange={(e) => setHeroMonthly(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0E6163]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>₹1,000</span>
                      <span>₹25,000</span>
                      <span>₹50,000</span>
                    </div>
                  </div>

                  {/* Time Horizon Selection Pills */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-600 block">Investment Horizon</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 15, 20].map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => setHeroYears(y)}
                          className={`py-1.5 text-xs font-bold rounded-xl transition-all border ${
                            heroYears === y
                              ? "bg-[#0E6163] text-white border-[#0E6163] shadow-xs"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {y} Years
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Results Display Box */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200/80 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] text-emerald-800 uppercase tracking-wider font-extrabold">
                          Projected Corpus (12% CAGR)
                        </div>
                        <div className="text-2xl font-black text-[#0A1628] tracking-tight">
                          {formatIndianCurrency(heroSipResult.corpus)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          Total Invested
                        </div>
                        <div className="text-xs font-bold text-slate-700">
                          {formatIndianCurrency(heroSipResult.invested)}
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Compounding Sparkline Curve */}
                    <div className="h-8 w-full pt-1 flex items-end gap-1.5">
                      {[15, 22, 30, 42, 56, 70, 85, 100].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all duration-300"
                        />
                      ))}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-between pt-1 border-t border-emerald-200/60">
                      <span>Pure Compound Growth:</span>
                      <span className="font-extrabold">+{formatIndianCurrency(heroSipResult.wealthGain)}</span>
                    </div>
                  </div>

                  {/* Gamification Strip: Streak & Verified Badge */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-center gap-2">
                      <span className="text-base">🔥</span>
                      <div>
                        <div className="text-xs font-black text-amber-950">7-Day Streak</div>
                        <div className="text-[10px] font-semibold text-amber-700">+350 XP Gained</div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200/70 flex items-center gap-2">
                      <Image
                        src="/brand-badge.png"
                        alt="FinanceHub Certified"
                        width={28}
                        height={28}
                        className="w-7 h-7 object-contain"
                      />
                      <div>
                        <div className="text-xs font-black text-indigo-950">Certified</div>
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
      {/* STAGE 3: MONUMENTAL PROOF & INSTITUTIONAL ASSURANCE BAR    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF9F6] py-12 border-b border-slate-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200/80">
            {STATS_DATA.map((item, idx) => (
              <div key={idx} className="text-center px-4 pt-4 md:pt-0">
                <div
                  style={{ fontFamily: "var(--font-reading, Georgia, serif)" }}
                  className="text-4xl sm:text-5xl font-extrabold text-[#0A1628] mb-1 tracking-tight"
                >
                  {item.val}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {item.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Institutional Integrity Note */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 text-center text-xs text-slate-500 font-medium max-w-2xl mx-auto flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              FinanceHub operates strictly as an educational platform. All simulations use virtual paper currency. Zero sponsored stock tips or commercial product placement.
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STAGE 4: "FIND YOUR LIFE STAGE" INTERACTIVE PATHWAY MATRIX   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0E6163]">
              Personalized Learning Matrix
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1628] tracking-tight">
              Finance Knowledge for Every Stage of Life
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Select your profile to discover your tailored starting pathway, curriculum modules, and interactive practice sandbox.
            </p>
          </div>

          {/* 5-Tab Selector Strip */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {LIFE_STAGE_PERSONAS.map((p, idx) => {
              const IconComp = p.icon;
              const isActive = activePersona === idx;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePersona(idx)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isActive
                      ? "bg-[#0E6163] text-white border-[#0E6163] shadow-md shadow-emerald-950/10 scale-102"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Persona Card Showcase */}
          <div className="bg-[#FAF9F6] rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Real-World Dilemma & Outcome */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentPersona.color }} />
                  <span>{currentPersona.badge}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0A1628] tracking-tight">
                  {currentPersona.headline}
                </h3>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/70 space-y-2">
                  <div className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚠️ The Dilemma You Face:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {currentPersona.dilemma}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💡 The Financial Competence You Will Build:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                    {currentPersona.outcome}
                  </p>
                </div>
              </div>

              {/* Right Column: Tailored Curriculum & Free Lab Action */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Recommended Curriculum Modules
                </div>

                <ul className="space-y-2.5">
                  {currentPersona.modules.map((mod, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{mod}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
                    <span>Hands-On Simulation Lab:</span>
                    <span className="font-bold text-[#0E6163]">{currentPersona.labName}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <Link
                      href={currentPersona.trackHref}
                      className="py-2.5 text-center bg-[#0E6163] hover:bg-[#0A4A4C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Start Pathway</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={currentPersona.labHref}
                      className="py-2.5 text-center bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
                    >
                      Launch Lab
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STAGE 5: THE 4-STEP MASTERY ENGINE                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#FAF9F6] border-b border-slate-200/70">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0E6163]">
              The Core Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1628] tracking-tight">
              How Mastery Happens on FinanceHub
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              A structured 4-step pedagogical system designed to eliminate financial confusion through bite-sized theory, risk-free laboratory tests, and continuous AI feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MASTERY_STEPS.map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 hover:border-[#0E6163] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0E6163] flex items-center justify-center font-bold">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-black text-slate-200">
                        {step.step}
                      </span>
                    </div>

                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200/60">
                      {step.tag}
                    </span>

                    <h3 className="text-base font-extrabold text-[#0A1628]">
                      {step.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STAGE 6: FLAGSHIP IN-PAGE SIMULATOR SANDBOX                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0E6163]">
              Hands-On Laboratory
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1628] tracking-tight">
              Don&apos;t Just Read Finance. Model It.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Experience the math yourself before you ever risk a rupee. Toggle between our Compounding Engine and the Old vs. New Tax Comparator below.
            </p>
          </div>

          {/* Sandbox Tab Switcher */}
          <div className="flex justify-center mb-8">
            <div className="p-1 bg-slate-100 rounded-2xl flex gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setSandboxTab("sip")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  sandboxTab === "sip"
                    ? "bg-[#0E6163] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>SIP Wealth Compounding</span>
              </button>
              <button
                type="button"
                onClick={() => setSandboxTab("tax")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  sandboxTab === "tax"
                    ? "bg-[#0E6163] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Old vs New Tax Comparator (FY 25-26)</span>
              </button>
            </div>
          </div>

          {/* Tab 1: SIP Compounding Visualizer */}
          {sandboxTab === "sip" && (
            <div className="bg-[#FAF9F6] rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#0A1628]">
                      Model Long-Term Compounding Capital
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      See how consistent monthly equity SIP investments snowball at historical 12% CAGR.
                    </p>
                  </div>

                  {/* Monthly Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Monthly Investment:</span>
                      <span className="text-[#0E6163] font-black text-sm">₹{sandboxMonthly.toLocaleString("en-IN")}</span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={100000}
                      step={1000}
                      value={sandboxMonthly}
                      onChange={(e) => setSandboxMonthly(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0E6163]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>₹1,000</span>
                      <span>₹50,000</span>
                      <span>₹1,00,000</span>
                    </div>
                  </div>

                  {/* Duration Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Investment Horizon:</span>
                      <span className="text-[#0E6163] font-black text-sm">{sandboxYears} Years</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={35}
                      step={1}
                      value={sandboxYears}
                      onChange={(e) => setSandboxYears(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0E6163]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>1 Year</span>
                      <span>20 Years</span>
                      <span>35 Years</span>
                    </div>
                  </div>

                  {/* Return Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Expected Annual CAGR:</span>
                      <span className="text-[#0E6163] font-black text-sm">{sandboxRate}% p.a.</span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={18}
                      step={0.5}
                      value={sandboxRate}
                      onChange={(e) => setSandboxRate(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0E6163]"
                    />
                  </div>
                </div>

                {/* Right Result Card */}
                <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Projected Corpus Breakdown
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <div className="text-3xl sm:text-4xl font-black text-[#0A1628] tracking-tight">
                        {formatIndianCurrency(sandboxSipResult.corpus)}
                      </div>
                      <div className="text-xs text-emerald-700 font-bold mt-1">
                        Wealth Multiplier: {(sandboxSipResult.corpus / sandboxSipResult.invested).toFixed(1)}x Capital
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Total Invested</div>
                      <div className="text-base font-bold text-slate-800">
                        {formatIndianCurrency(sandboxSipResult.invested)}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="text-[10px] uppercase font-bold text-emerald-800">Estimated Returns</div>
                      <div className="text-base font-bold text-emerald-900">
                        {formatIndianCurrency(sandboxSipResult.wealthGain)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/practice/sip"
                      className="w-full py-3 bg-[#0E6163] hover:bg-[#0A4A4C] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Open Full Advanced SIP Lab</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Tax Regime Comparator (FY 25-26) */}
          {sandboxTab === "tax" && (
            <div className="bg-[#FAF9F6] rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#0A1628]">
                      Old vs New Tax Regime Comparator
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Updated for FY 2025-26 with Standard Deduction (₹75k New / ₹50k Old) and 80C/80D estimates.
                    </p>
                  </div>

                  {/* Annual Income Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Annual Gross Salary:</span>
                      <span className="text-[#0E6163] font-black text-sm">
                        ₹{(taxIncome / 100000).toFixed(1)} Lakhs
                      </span>
                    </div>
                    <input
                      type="range"
                      min={500000}
                      max={3500000}
                      step={50000}
                      value={taxIncome}
                      onChange={(e) => setTaxIncome(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0E6163]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>₹5 Lakhs</span>
                      <span>₹20 Lakhs</span>
                      <span>₹35 Lakhs</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                    <div className="font-bold text-slate-700">Standard Assumptions Applied:</div>
                    <ul className="text-slate-500 space-y-1">
                      <li>• <strong>New Regime:</strong> Flat ₹75,000 Standard Deduction + Rebate up to ₹7L.</li>
                      <li>• <strong>Old Regime:</strong> ₹50,000 Std Ded + ₹1.5L Sec 80C + ₹25k Sec 80D.</li>
                    </ul>
                  </div>
                </div>

                {/* Right Result Card */}
                <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Recommendation: {taxComparison.recommended} saves ₹{taxComparison.difference.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className={`p-4 rounded-2xl border ${taxComparison.taxNew <= taxComparison.taxOld ? "bg-emerald-50/70 border-emerald-300" : "bg-slate-50 border-slate-200"}`}>
                      <div className="text-[10px] uppercase font-bold text-slate-500">New Tax Regime</div>
                      <div className="text-2xl font-black text-[#0A1628] mt-1">
                        ₹{taxComparison.taxNew.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Includes 4% cess</div>
                    </div>

                    <div className={`p-4 rounded-2xl border ${taxComparison.taxOld < taxComparison.taxNew ? "bg-emerald-50/70 border-emerald-300" : "bg-slate-50 border-slate-200"}`}>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Old Tax Regime</div>
                      <div className="text-2xl font-black text-[#0A1628] mt-1">
                        ₹{taxComparison.taxOld.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">With 80C &amp; 80D deductions</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/practice/tax"
                      className="w-full py-3 bg-[#0E6163] hover:bg-[#0A4A4C] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Explore Detailed Slab Breakdown</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STAGE 7: THE 8 CURRICULUM TRACKS GRID                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#FAF9F6] border-b border-slate-200/70">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0E6163]">
                Structured Syllabi
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1628] tracking-tight mt-1">
                Eight Tracks. One Complete Education.
              </h2>
            </div>
            <Link
              href="/explore"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-slate-400 transition-all shadow-xs"
            >
              <span>Explore All Tracks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CURRICULUM_TRACKS.map((track) => (
              <Link
                key={track.slug}
                href={`/tracks/${track.slug}`}
                className="group bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-[#0E6163] hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      style={{ backgroundColor: `${track.color}15`, color: track.color }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black"
                    >
                      {track.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {track.level}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#0A1628] group-hover:text-[#0E6163] transition-colors">
                      {track.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                      {track.highlight}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {track.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold mt-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#0E6163]" />
                    <span>{track.lessons} Lessons</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-600" />
                    <span>{track.quizzes} Quizzes</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STAGE 8: THE 60-BOOK VAULT & INDIAN CASE STUDIES            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0E6163]">
                Authoritative Wisdom
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1628] tracking-tight mt-1">
                The 60-Book Master Library Vault
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Synthesized key takeaways, reading levels, and actionable frameworks from the world&apos;s most influential finance authors.
              </p>
            </div>
            <Link
              href="/library"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0E6163] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#0A4A4C] transition-all"
            >
              <span>Explore All 60 Books</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 6 Featured Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
            {VAULT_FEATURED_BOOKS.map((b, i) => (
              <div
                key={i}
                className="bg-[#FAF9F6] rounded-2xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between hover:border-[#0E6163] transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {b.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {b.category}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#0A1628]">
                    {b.title}
                  </h3>
                  <div className="text-xs font-bold text-slate-500">
                    By {b.author}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-emerald-600 pl-2.5">
                    &ldquo;{b.takeaway}&rdquo;
                  </p>
                </div>

                <Link
                  href="/library"
                  className="text-xs font-bold text-[#0E6163] hover:underline inline-flex items-center gap-1 pt-2"
                >
                  <span>Read Full Synthesis &amp; Takeaways</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>

          {/* Real Indian Market Case Studies Banner */}
          <div className="bg-[#0A1628] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Real Indian Scenarios
                </span>
                <h3 className="text-2xl font-black tracking-tight">
                  25 Real Indian Market Case Studies
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Learn from actual corporate scandals, regulatory milestones, and unicorn valuations across Indian economic history.
                </p>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all"
                >
                  <span>View All Case Studies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {CASE_STUDIES.map((c, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {c.tag}
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {c.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {c.lesson}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STAGE 9: FRONTIER AI MENTOR LIVE TERMINAL PREVIEW           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#0B1528] text-white border-b border-slate-800">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
                <Brain className="w-4 h-4 text-emerald-400" />
                <span>24/7 Intelligent Financial Mentorship</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Your Finance Doubts Answered Instantly.
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Stuck on a tricky tax regulation, loan amortisation formula, or P/E ratio? Ask FinGPT. Trained on Indian educational finance frameworks, it provides step-by-step statutory breakdowns.
              </p>

              {/* Sample Prompt Selector Chips */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Click a Sample Question to Preview Response:
                </span>
                <div className="space-y-2">
                  {AI_SAMPLE_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveAiPrompt(idx)}
                      className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all border ${
                        activeAiPrompt === idx
                          ? "bg-[#0E6163] text-white border-emerald-400"
                          : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {p.q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/ai-tutor"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all"
                >
                  <span>Launch Full AI Mentor Session</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Chat Terminal Preview */}
            <div className="lg:col-span-6">
              <div className="bg-[#131B2E] rounded-3xl border border-slate-700 shadow-2xl p-6 space-y-4">
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
                    5/5 FREE TODAY
                  </span>
                </div>

                {/* User Bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] p-3.5 rounded-2xl rounded-tr-sm bg-[#0E6163] text-white text-xs leading-relaxed">
                    {AI_SAMPLE_PROMPTS[activeAiPrompt].q}
                  </div>
                </div>

                {/* AI Response Bubble */}
                <div className="flex justify-start">
                  <div className="max-w-[90%] p-4 rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 text-slate-200 text-xs leading-relaxed space-y-2">
                    <p>{AI_SAMPLE_PROMPTS[activeAiPrompt].a}</p>
                    <div className="pt-2 border-t border-white/10 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Source: {AI_SAMPLE_PROMPTS[activeAiPrompt].source}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STAGE 10: TRANSPARENT PRICING MATRIX                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0E6163]">
              Transparent Tuition
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1628] tracking-tight">
              Start Free. Upgrade When Ready.
            </h2>
            <p className="text-sm text-slate-600">
              100% free core lessons, book summaries, and simulators for everyone. Upgrade to Pro for unlimited AI and advanced valuation spreadsheets.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-xs font-bold ${billingCycle === "monthly" ? "text-slate-900" : "text-slate-400"}`}>
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle((b) => (b === "monthly" ? "yearly" : "monthly"))}
                className="w-12 h-6 rounded-full bg-[#0E6163] p-1 flex items-center transition-colors"
                aria-label="Toggle annual billing"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-xs font-bold flex items-center gap-1 ${billingCycle === "yearly" ? "text-slate-900" : "text-slate-400"}`}>
                <span>Annual Billing</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="p-6 rounded-3xl bg-[#FAF9F6] border border-slate-200 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Free Tier</span>
                <div className="text-3xl font-black text-[#0A1628]">₹0</div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Access core education, all simulators, and book library summaries at zero cost forever.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>100+ Foundational lessons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>All 15 Interactive Simulators</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>60 Master Books Directory</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>5 AI Mentor questions / day</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl text-center transition-colors"
              >
                Start Free Forever
              </Link>
            </div>

            {/* Pro Tier (Featured) */}
            <div className="p-6 rounded-3xl bg-white border-2 border-[#0E6163] shadow-xl space-y-5 flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#0E6163] text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm">
                Most Popular
              </div>

              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0E6163]">Pro Tier</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#0A1628]">
                    {billingCycle === "yearly" ? "₹399" : "₹499"}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">/ month</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  For serious wealth builders wanting complete curriculum depth and unlimited AI coaching.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span><strong>All 320+</strong> Lessons in 8 Tracks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span><strong>Unlimited</strong> AI Mentor Questions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Verified LinkedIn Credentials</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Downloadable Financial Model Templates</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup?plan=pro"
                className="w-full py-3 bg-[#0E6163] hover:bg-[#0A4A4C] text-white font-bold text-xs rounded-xl text-center shadow-md transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Expert Tier */}
            <div className="p-6 rounded-3xl bg-[#FAF9F6] border border-slate-200 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Expert Tier</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#0A1628]">₹999</span>
                  <span className="text-xs text-slate-500 font-semibold">/ month</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Advanced corporate valuation models, private AMA cohorts, and portfolio stress tests.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Everything in Pro Included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>DCF &amp; M&amp;A Financial Modeling Packs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Private Analyst AMA Cohorts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Priority AI Response Speed</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup?plan=expert"
                className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl text-center transition-colors"
              >
                Join Expert Cohort
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STAGE 11: FREQUENTLY ASKED QUESTIONS ACCORDION              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#FAF9F6] border-b border-slate-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0E6163]">
              Clear Answers
            </span>
            <h2 className="text-3xl font-extrabold text-[#0A1628] tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#0A1628] hover:text-[#0E6163] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180 text-[#0E6163]" : ""
                      }`}
                    />
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
      {/* STAGE 12: FINAL CONVERSION CTA BANNER                       */}
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
      {/* STAGE 13: STATUTORY 5-COLUMN MASTER FOOTER                  */}
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
                    Tax Comparison FY 25-26
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
