"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  GraduationCap,
  Briefcase,
  Rocket,
  LineChart,
  Award,
  Zap,
  Layers,
  HelpCircle,
  Clock,
  ChevronRight,
  Star,
  Check,
  Compass,
  AlertTriangle,
  PlayCircle,
  FileText,
} from "lucide-react";

// ============================================================
// FinanceHub of India — World-Class National Learning Academy
// app/page.tsx
//
// 10-Section Educational Architecture:
//   1. Sticky Institutional Navigation
//   2. Sovereign Hero with 60-Second Experiential Micro-Lab
//   3. Verified Institutional Proof Band (4 Core Metrics)
//   4. The Indian Reality: 4 Financial Traps We Solve
//   5. The 3-Step Mastery Engine: Understand → Simulate → Ask
//   6. Choose Your Starting Path: 4 Interactive Goal Pathways
//   7. The 8 Sovereign Disciplines: Complete Subject Directory
//   8. Real Indian Case Studies: Real Mistakes & True Wins
//   9. AI Mentor Spotlight: Single Contained Midnight Feature
//   10. Transparent Pricing, FAQ Accordion & Sovereign Final CTA
//   11. Institutional Footer
//
// Strict 6-Color Palette (0% Green):
//   White:         #FFFFFF (Canvas, clarity, breathing room)
//   Midnight Navy: #090D16 & #0A1628 (Authority, headlines, dark spotlight)
//   Electric Blue: #2563EB (Primary action, intelligence, core learning)
//   Amber Gold:    #EAB308 (Badges, ratings, milestones)
//   Vibrant Orange:#F97316 (Simulators, interactive momentum)
//   Signal Red:    #EF4444 (Risk warnings, real case studies, Hindi track)
// ============================================================

// ─── DATA DEFINITIONS ────────────────────────────────────────

const STATS = [
  { num: "375+", label: "Structured Lessons", sub: "From zero to valuation", color: "#2563EB" },
  { num: "8", label: "Master Disciplines", sub: "Personal finance to F&O", color: "#F97316" },
  { num: "15", label: "Interactive Simulators", sub: "100% risk-free practice", color: "#EAB308" },
  { num: "100%", label: "Free Open-Access Core", sub: "No credit card required", color: "#090D16" },
];

const PROBLEMS = [
  {
    emoji: "🎓",
    badge: "The Curriculum Gap",
    badgeColor: "#2563EB",
    badgeBg: "#EFF6FF",
    title: "School taught quadratics. Never money.",
    desc: "12 to 16 years of formal education, but not a single lesson on SIPs, salary deductions, inflation, or how compound interest defines your retirement.",
  },
  {
    emoji: "📉",
    badge: "The Tip Trap",
    badgeColor: "#EF4444",
    badgeBg: "#FEF2F2",
    title: "₹3 lakh wiped out on a WhatsApp stock tip.",
    desc: "An IT engineer in Pune trusts an unverified group recommendation. Within 4 months, hard-earned capital is decimated. This reality repeats across India daily.",
  },
  {
    emoji: "😵",
    badge: "The Intimidation Wall",
    badgeColor: "#F97316",
    badgeBg: "#FFF7ED",
    title: "Financial jargon stops beginners cold.",
    desc: "P/E ratio. LTCG. Delta and Theta. XIRR. FEMA. By the time you search for the second term, you've forgotten the first. Finance has too many gatekeeping walls.",
  },
  {
    emoji: "🏦",
    badge: "Conflicted Advice",
    badgeColor: "#EAB308",
    badgeBg: "#FEFCE8",
    title: "The financial advice you get isn't for you.",
    desc: "Banks push funds with high distributor commissions. Traditional agents earn hefty commissions on poor-yielding insurance policies. The system wasn't built for your growth.",
  },
];

const MASTERY_STEPS = [
  {
    step: "01",
    title: "Understand the First Principles",
    tagline: "Bite-sized, jargon-free lessons",
    desc: "Each lesson breaks down complex finance into plain English and Hindi: concept first, real Indian company examples, interactive checkpoint quizzes, and key takeaways.",
    badge: "Structured Curriculum",
    color: "#2563EB",
    bg: "#EFF6FF",
    icon: BookOpen,
  },
  {
    step: "02",
    title: "Model It with Real Numbers",
    tagline: "15 zero-risk interactive labs",
    desc: "Don't just read about wealth creation. Use our interactive simulators to compare Old vs. New tax regimes, plan your retirement corpus, and paper-trade without risking real rupees.",
    badge: "Finance Lab",
    color: "#F97316",
    bg: "#FFF7ED",
    icon: Calculator,
  },
  {
    step: "03",
    title: "Clarify Any Doubt 24/7",
    tagline: "AI Mentor with source citations",
    desc: "Stuck on a tricky concept like indexation, ELSS lock-in, or option Greeks? Ask our frontier AI Mentor. Receive plain-language, source-cited explanations in seconds.",
    badge: "Frontier AI Mentor",
    color: "#EAB308",
    bg: "#FEFCE8",
    icon: Sparkles,
  },
];

const PERSONAS = [
  {
    id: "student",
    title: "College Student",
    badge: "Starting Early",
    accent: "#2563EB",
    bgSoft: "#EFF6FF",
    icon: GraduationCap,
    hook: "You have limited income, but your greatest superpower is time. Starting early creates staggering compound wealth.",
    dilemma: "Confused by financial jargon, living on a student allowance, and tempted by predatory Buy Now Pay Later (BNPL) traps.",
    outcome: "Master early compounding, build a 50/30/20 student budget, and start your first ₹500 monthly SIP with total confidence.",
    modules: [
      "The Unfair Advantage: Starting at Age 20 vs. 30",
      "Building a Zero-Stress 50/30/20 Budget on an Allowance",
      "Avoiding the 40% APR Credit Card & BNPL Traps",
    ],
    targetTrack: "Personal Finance",
    trackHref: "/tracks/personal-finance",
  },
  {
    id: "salaried",
    title: "Salaried Professional",
    badge: "Tax & Wealth Engine",
    accent: "#F97316",
    bgSoft: "#FFF7ED",
    icon: Briefcase,
    hook: "Maximize your take-home pay, eliminate tax guesswork, and put your monthly savings on auto-pilot.",
    dilemma: "Shocked by monthly TDS deductions, paralyzed by Old vs. New tax regime decisions, and lacking an automated index investing framework.",
    outcome: "Decode every line on your salary slip, mathematically calculate your tax regime break-even, and build an automated low-cost wealth machine.",
    modules: [
      "Decoding Your Salary Slip: CTC vs. True Take-Home",
      "Old vs. New Tax Regime: The Exact Mathematical Break-Even",
      "Pure Term Insurance vs. ULIPs: The Hidden Cost Trap",
    ],
    targetTrack: "Personal Finance",
    trackHref: "/tracks/personal-finance",
  },
  {
    id: "trader",
    title: "Aspiring Trader",
    badge: "Risk-First Execution",
    accent: "#EAB308",
    bgSoft: "#FEFCE8",
    icon: LineChart,
    hook: "89% of individual traders lose money in F&O. Learn why, master mathematical risk management, and survive.",
    dilemma: "Losing capital on unverified Telegram tips, gambling without a trading plan, and lacking position-sizing discipline.",
    outcome: "Understand derivatives anatomy, master support/resistance with volume confirmation, and practice in risk-free paper trading first.",
    modules: [
      "SEBI Data Reality: Why 89% Lose in F&O and How to Survive",
      "Candlestick Anatomy: Support, Resistance & Volume Confirmation",
      "The 1% Rule: Position Sizing That Prevents Account Blowups",
    ],
    targetTrack: "Trading & Markets",
    trackHref: "/tracks/trading-and-markets",
  },
  {
    id: "founder",
    title: "Founder / Executive",
    badge: "Corporate Valuation",
    accent: "#090D16",
    bgSoft: "#F8FAFC",
    icon: Rocket,
    hook: "Read financial statements like an institutional investor and value companies from first principles.",
    dilemma: "Unsure how to read a balance sheet, calculate burn rate, value a startup, or structure ESOPs without massive personal tax bills.",
    outcome: "Analyze P&L, balance sheets, and cash flows with ease, run Discounted Cash Flow (DCF) models, and structure equity smartly.",
    modules: [
      "Reading the 3 Financial Statements (P&L, Balance Sheet, Cash Flow)",
      "Discounted Cash Flow (DCF): Valuing a Business from First Principles",
      "Startup ESOP Taxation: Avoiding the Perquisite Tax Shock",
    ],
    targetTrack: "Corporate Finance",
    trackHref: "/tracks/corporate-finance",
  },
];

const TRACKS = [
  {
    code: "personal-finance",
    title: "Personal Finance",
    emoji: "💰",
    lessons: 45,
    tagline: "SIPs · Old vs New Tax · Term Insurance · Gold · Emergency Fund",
    level: "Beginner → Advanced",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#DBEAFE",
  },
  {
    code: "trading-and-markets",
    title: "Trading & Markets",
    emoji: "📈",
    lessons: 52,
    tagline: "Equities · F&O Reality · IPOs · Value Investing · Market Ratios",
    level: "Beginner → Advanced",
    color: "#F97316",
    bg: "#FFF7ED",
    border: "#FFEDD5",
  },
  {
    code: "technical-analysis",
    title: "Technical Analysis",
    emoji: "📊",
    lessons: 36,
    tagline: "Candlestick Charts · RSI · MACD · Fibonacci · Price Action",
    level: "Intermediate",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#DBEAFE",
  },
  {
    code: "corporate-finance",
    title: "Corporate Finance",
    emoji: "🏢",
    lessons: 38,
    tagline: "DCF Valuation · Financial Statements · M&A · Burn Rate · ESOPs",
    level: "Advanced",
    color: "#090D16",
    bg: "#F8FAFC",
    border: "#E2E8F0",
  },
  {
    code: "crypto-and-defi",
    title: "Crypto & Web3",
    emoji: "₿",
    lessons: 28,
    tagline: "Bitcoin Mechanics · Ethereum · India VDA Tax · Self-Custody · e-Rupee",
    level: "Beginner → Advanced",
    color: "#EAB308",
    bg: "#FEFCE8",
    border: "#FEF08A",
  },
  {
    code: "behavioral-finance",
    title: "Behavioral Finance",
    emoji: "🧠",
    lessons: 24,
    tagline: "Loss Aversion · FOMO Cycles · Anchoring Bias · Herd Mentality",
    level: "Beginner",
    color: "#F97316",
    bg: "#FFF7ED",
    border: "#FFEDD5",
  },
  {
    code: "forex-and-currencies",
    title: "Forex & Macroeconomics",
    emoji: "💱",
    lessons: 22,
    tagline: "Exchange Rates · RBI Interventions · FEMA Regulations · Inflation",
    level: "Intermediate",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#DBEAFE",
  },
  {
    code: "hindi-finance",
    title: "हिंदी Finance",
    emoji: "🇮🇳",
    lessons: 23,
    tagline: "SIP · Share Market · Budgeting · Income Tax — Seedhi Hindi Mein",
    level: "Beginner",
    color: "#EF4444",
    bg: "#FEF2F2",
    border: "#FEE2E2",
  },
];

const CASE_STUDIES = [
  {
    emoji: "😰",
    category: "Trading Reality",
    badgeColor: "#EF4444",
    badgeBg: "#FEF2F2",
    title: "Rahul lost ₹2 lakh in F&O in 3 months",
    subtitle: "A software engineer from Hyderabad discovered why SEBI reports 89% of intraday derivatives traders lose money — the hard way.",
    slug: "rahul-fo-disaster",
    stat: "-₹2,00,000",
    statLabel: "Capital Lost to Leverage",
  },
  {
    emoji: "💡",
    category: "The Compounding Win",
    badgeColor: "#2563EB",
    badgeBg: "#EFF6FF",
    title: "Priya's ₹3,000 monthly SIP grew to ₹46 lakh",
    subtitle: "A school teacher from Pune stayed disciplined through three market crashes over 14 years. Here is the mathematical blueprint.",
    slug: "priya-sip-journey",
    stat: "₹46.2 Lakh",
    statLabel: "Total Wealth Built",
  },
  {
    emoji: "⚠️",
    category: "Corporate Tax Shock",
    badgeColor: "#F97316",
    badgeBg: "#FFF7ED",
    title: "Neha owed ₹28 lakh tax on ESOPs she couldn't sell",
    subtitle: "How exercising startup ESOPs triggered an immediate illiquid tax liability with zero market exit route available.",
    slug: "neha-esop-tax-shock",
    stat: "₹28 Lakh",
    statLabel: "Unforeseen Tax Liability",
  },
];

const FAQS = [
  {
    q: "Is FinanceHub truly free to start? What is the catch?",
    a: "The core platform is genuinely free forever: 100+ fundamental lessons, our interactive financial calculators, 5 AI Mentor questions every day, and full access to the video library. No credit card is ever required. We fund our platform through optional Pro and Expert subscriptions for learners who want unlimited AI queries, certificates, advanced corporate valuation tracks, and paper-trading suites.",
  },
  {
    q: "Is any content on FinanceHub considered financial or investment advice?",
    a: "No. FinanceHub is strictly a financial education and simulation academy. We teach how money, markets, balance sheets, and compounding work from first principles. We never recommend buying or selling specific stocks, mutual funds, or derivatives. All content cites SEBI, RBI, and AMFI educational standards.",
  },
  {
    q: "How is this different from watching finance creators on YouTube?",
    a: "YouTube gives you scattered, unverified videos designed for sensational views with no progressive learning order, zero retention quizzes, and no practice tools. FinanceHub gives you an accredited, sequenced curriculum across 8 disciplines with risk-free simulators, spaced-repetition testing, and a 24/7 AI tutor that remembers your learning history.",
  },
  {
    q: "I am a complete beginner with zero math background. Where do I start?",
    a: "Begin with our Personal Finance track or the Hindi Finance track. Both assume zero prior knowledge and start with everyday concepts like building an emergency buffer, setting up a ₹500 SIP, and understanding your salary deductions in plain, conversational language.",
  },
  {
    q: "Are the course certificates verified and shareable?",
    a: "Yes. Every verified certificate issued upon track completion includes a unique cryptographic verification URL (e.g., financehub.in/verify/[id]) that recruiters, universities, and LinkedIn connections can independently verify.",
  },
];

// ─── INTERACTIVE EXPERIENTIAL MICRO-LAB ──────────────────────

function CompoundMicroLab() {
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(12);

  const months = years * 12;
  const monthlyRate = rate / 1200;
  const invested = monthly * months;
  const corpus = Math.round(
    monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
  );
  const gains = corpus - invested;

  const fmtCurrency = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} Lakh`;
    return `₹${n.toLocaleString("en-IN")}`;
  };

  const gainPercentage = invested > 0 ? Math.round((gains / invested) * 100) : 0;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1.5px solid #E2E8F0",
        borderRadius: 20,
        padding: "26px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        fontFamily: "var(--font-ui, system-ui, sans-serif)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563EB",
            }}
          >
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#090D16", letterSpacing: "-0.2px" }}>
              Interactive Wealth Simulator
            </div>
            <div style={{ fontSize: 11, color: "#64748B" }}>Understand compounding in 60 seconds</div>
          </div>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "#2563EB",
            background: "#EFF6FF",
            padding: "3px 8px",
            borderRadius: 6,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Live Preview
        </span>
      </div>

      {/* Sliders */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Monthly SIP */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
            <span style={{ color: "#475569", fontWeight: 600 }}>Monthly Investment</span>
            <span style={{ fontWeight: 800, color: "#090D16" }}>₹{monthly.toLocaleString("en-IN")}/mo</span>
          </div>
          <input
            type="range"
            min={500}
            max={50000}
            step={500}
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#2563EB", height: 5, cursor: "pointer" }}
          />
        </div>

        {/* Time Horizon */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
            <span style={{ color: "#475569", fontWeight: 600 }}>Time Horizon</span>
            <span style={{ fontWeight: 800, color: "#090D16" }}>{years} Years ({years * 12} months)</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#2563EB", height: 5, cursor: "pointer" }}
          />
        </div>

        {/* Expected Return */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
            <span style={{ color: "#475569", fontWeight: 600 }}>Expected Return (CAGR)</span>
            <span style={{ fontWeight: 800, color: "#2563EB" }}>{rate}% p.a. (Nifty 50 Avg)</span>
          </div>
          <input
            type="range"
            min={6}
            max={18}
            step={0.5}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#2563EB", height: 5, cursor: "pointer" }}
          />
        </div>
      </div>

      {/* Progress Breakdown Bar */}
      <div style={{ marginTop: 18, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
          <span style={{ color: "#64748B" }}>Your Capital ({Math.round((invested / corpus) * 100)}%)</span>
          <span style={{ color: "#2563EB", fontWeight: 700 }}>Compound Growth ({Math.round((gains / corpus) * 100)}%)</span>
        </div>
        <div style={{ width: "100%", height: 8, background: "#E2E8F0", borderRadius: 4, overflow: "hidden", display: "flex" }}>
          <div style={{ width: `${(invested / corpus) * 100}%`, background: "#94A3B8" }} />
          <div style={{ width: `${(gains / corpus) * 100}%`, background: "#2563EB" }} />
        </div>
      </div>

      {/* Numerical Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "12px", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>Total Money Invested</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#090D16", marginTop: 2 }}>{fmtCurrency(invested)}</div>
        </div>
        <div style={{ background: "#EFF6FF", borderRadius: 12, padding: "12px", border: "1px solid #DBEAFE" }}>
          <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 600 }}>Pure Wealth Created</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#2563EB", marginTop: 2 }}>+{fmtCurrency(gains)}</div>
        </div>
      </div>

      {/* Total Result Container */}
      <div
        style={{
          background: "linear-gradient(135deg, #090D16 0%, #1E3A8A 100%)",
          borderRadius: 14,
          padding: "16px 20px",
          color: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
            Estimated Future Corpus in {years} Years
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
            {fmtCurrency(corpus)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              background: "#F59E0B",
              color: "#090D16",
              padding: "4px 8px",
              borderRadius: 6,
            }}
          >
            +{gainPercentage}% Growth
          </span>
        </div>
      </div>

      {/* Direct Educational Hook */}
      <Link
        href="/tracks/personal-finance"
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 700,
          color: "#2563EB",
          textDecoration: "none",
        }}
      >
        See the 4-minute lesson on Compound Interest & SIPs <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// ─── FAQ ITEM COMPONENT ──────────────────────────────────────

function FAQAccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1.5px solid #E2E8F0" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "20px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: "#090D16", lineHeight: 1.4 }}>{q}</span>
        <span
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: "#2563EB",
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(45deg)" : "none",
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div style={{ paddingBottom: 20, fontSize: 14, color: "#475569", lineHeight: 1.8, paddingRight: 24 }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ─── MAIN HOMEPAGE COMPONENT ─────────────────────────────────

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(0);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [activeTrackCode, setActiveTrackCode] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const proPrice = billingCycle === "annual" ? 399 : 499;
  const expertPrice = billingCycle === "annual" ? 799 : 999;
  const activePersonaData = PERSONAS[selectedPersona];

  return (
    <div style={{ fontFamily: "var(--font-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif)", color: "#090D16", background: "#FFFFFF" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        .lift-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .lift-card:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(37,99,235,0.08); }
        .tab-btn { transition: all 0.18s ease; }
        .nav-link { transition: color 0.15s ease; }
        .nav-link:hover { color: #2563EB !important; }
        @media (max-width: 900px) {
          .grid-hero { grid-template-columns: 1fr !important; gap: 40px !important; }
          .grid-proof { grid-template-columns: 1fr 1fr !important; }
          .grid-2col { grid-template-columns: 1fr !important; }
          .grid-3col { grid-template-columns: 1fr !important; }
          .grid-4col { grid-template-columns: 1fr 1fr !important; }
          .hide-mobile { display: none !important; }
        }
        @media (max-width: 540px) {
          .grid-proof { grid-template-columns: 1fr !important; }
          .grid-4col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 1. STICKY INSTITUTIONAL NAVIGATION                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: scrolled ? "rgba(255,255,255,0.98)" : "#FFFFFF",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: `1.5px solid ${scrolled ? "#E2E8F0" : "transparent"}`,
          transition: "all 0.2s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Logo size="md" href="/" />

          {/* Navigation Links */}
          <div className="hide-mobile" style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {[
              ["Curriculum", "/explore"],
              ["Finance Labs", "/practice"],
              ["Case Studies", "/case-studies"],
              ["Pricing", "/pricing"],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="nav-link"
                style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Auth Actions */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link
              href="/login"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#475569",
                padding: "8px 14px",
                borderRadius: 8,
              }}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#FFFFFF",
                background: "#2563EB",
                padding: "9px 20px",
                borderRadius: 10,
                boxShadow: "0 2px 10px rgba(37,99,235,0.28)",
                transition: "background 0.15s ease",
              }}
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 2. SOVEREIGN HERO + 60-SECOND LEARNING EXPERIENTIAL LAB   */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", paddingTop: 56, paddingBottom: 68 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div
            className="grid-hero"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 56,
              alignItems: "center",
            }}
          >
            {/* Left Content Column */}
            <div>
              {/* Trust Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  borderRadius: 20,
                  padding: "6px 14px",
                  marginBottom: 20,
                }}
              >
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  India's Premier National Financial Academy
                </span>
              </div>

              {/* Dominant Headline */}
              <h1
                style={{
                  fontSize: "clamp(38px, 5.2vw, 62px)",
                  fontWeight: 900,
                  lineHeight: 1.06,
                  letterSpacing: "-0.035em",
                  color: "#090D16",
                  marginBottom: 20,
                }}
              >
                Master the Language <br />
                of Money.{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Built for India.
                </span>
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: 17,
                  color: "#475569",
                  lineHeight: 1.7,
                  marginBottom: 32,
                  maxWidth: 540,
                }}
              >
                From your first ₹500 SIP to reading corporate balance sheets and trading options risk-free.
                Learn through <strong>375+ structured lessons</strong>, 15 interactive simulators, and 24/7 AI tutoring.
                Available in <strong>English and Hindi</strong>.
              </p>

              {/* CTAs */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
                <Link
                  href="/signup"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 28px",
                    borderRadius: 12,
                    background: "#2563EB",
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontWeight: 700,
                    boxShadow: "0 4px 18px rgba(37,99,235,0.32)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  Start Learning Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/explore"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 24px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    background: "#FFFFFF",
                    color: "#090D16",
                    fontSize: 15,
                    fontWeight: 700,
                    transition: "border-color 0.15s ease",
                  }}
                >
                  Explore Curriculum
                </Link>
              </div>

              {/* Trust Indicators */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Check className="w-4 h-4 text-[#2563EB]" /> No credit card required
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Check className="w-4 h-4 text-[#2563EB]" /> 100% Free Core access
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Check className="w-4 h-4 text-[#2563EB]" /> Works on mobile & desktop
                </span>
              </div>
            </div>

            {/* Right Experiential Column */}
            <div>
              <CompoundMicroLab />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 3. VERIFIED INSTITUTIONAL PROOF BAND                      */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#F8FAFC", borderTop: "1.5px solid #E2E8F0", borderBottom: "1.5px solid #E2E8F0", padding: "36px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="grid-proof" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {STATS.map((s, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: "center",
                  padding: "8px 16px",
                  borderRight: idx < 3 ? "1.5px solid #E2E8F0" : "none",
                }}
              >
                <div style={{ fontSize: 36, fontWeight: 900, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#090D16", marginTop: 6 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 4. THE INDIAN REALITY: 4 FINANCIAL TRAPS WE SOLVE         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", padding: "88px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#F97316", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              The Indian Reality
            </span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#090D16", letterSpacing: "-0.03em", marginTop: 8 }}>
              Finance is hard. <span style={{ color: "#2563EB" }}>It doesn't have to be.</span>
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", maxWidth: 560, margin: "12px auto 0", lineHeight: 1.7 }}>
              These are the four real reasons why millions of hardworking Indians stay broke or lose capital. FinanceHub eliminates all four.
            </p>
          </div>

          <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 36 }}>
            {PROBLEMS.map((prob, i) => (
              <div
                key={i}
                className="lift-card"
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 16,
                  padding: "26px",
                  display: "flex",
                  gap: 18,
                }}
              >
                <div style={{ fontSize: 32, flexShrink: 0 }}>{prob.emoji}</div>
                <div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: prob.badgeColor,
                      background: prob.badgeBg,
                      padding: "3px 8px",
                      borderRadius: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      display: "inline-block",
                      marginBottom: 8,
                    }}
                  >
                    {prob.badge}
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#090D16", marginBottom: 6, lineHeight: 1.3 }}>
                    {prob.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.7 }}>
                    {prob.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Institutional Solution Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #090D16 0%, #1E3A8A 100%)",
              borderRadius: 18,
              padding: "28px 36px",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <div style={{ maxWidth: 700 }}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
                FinanceHub solves all four — for free.
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                Structured like a university course, explained like a mentor who happens to be a Chartered Accountant and a seasoned trader.
                India-specific, SEBI-cited, and plain language.
              </div>
            </div>
            <Link
              href="/signup"
              style={{
                padding: "12px 24px",
                borderRadius: 10,
                background: "#2563EB",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 700,
                whiteSpace: "nowrap",
                boxShadow: "0 2px 10px rgba(37,99,235,0.3)",
              }}
            >
              Start Free Today →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 5. THE 3-STEP MASTERY ENGINE: UNDERSTAND → SIMULATE → ASK */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#F8FAFC", padding: "88px 24px", borderTop: "1.5px solid #E2E8F0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#2563EB", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              The Learning Loop
            </span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#090D16", letterSpacing: "-0.03em", marginTop: 8 }}>
              From confusion to mastery <span style={{ color: "#2563EB" }}>in three steps.</span>
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", maxWidth: 540, margin: "12px auto 0", lineHeight: 1.7 }}>
              Most websites just dump articles. FinanceHub pairs concept, calculation, and 24/7 clarification into one seamless system.
            </p>
          </div>

          <div className="grid-3col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {MASTERY_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="lift-card"
                  style={{
                    background: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: 18,
                    padding: "32px 26px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: step.bg,
                          color: step.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span style={{ fontSize: 32, fontWeight: 900, color: "#E2E8F0", letterSpacing: "-0.03em" }}>
                        {step.step}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: step.color,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        display: "inline-block",
                        marginBottom: 6,
                      }}
                    >
                      {step.badge}
                    </span>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#090D16", marginBottom: 6, lineHeight: 1.3 }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 14 }}>
                      {step.tagline}
                    </p>
                    <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 6. CHOOSE YOUR STARTING PATH: 4 INTERACTIVE GOAL TILES    */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", padding: "88px 24px", borderTop: "1.5px solid #E2E8F0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#F97316", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Personalized Starting Point
            </span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#090D16", letterSpacing: "-0.03em", marginTop: 8 }}>
              Where are you <span style={{ color: "#2563EB" }}>starting from?</span>
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", maxWidth: 540, margin: "12px auto 0", lineHeight: 1.7 }}>
              Select your current background to get your curated curriculum pathway. No account required.
            </p>
          </div>

          {/* Interactive Selector Tabs */}
          <div
            className="grid-4col"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {PERSONAS.map((p, idx) => {
              const Icon = p.icon;
              const isActive = selectedPersona === idx;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersona(idx)}
                  className="tab-btn"
                  style={{
                    background: isActive ? "#EFF6FF" : "#F8FAFC",
                    border: `2px solid ${isActive ? "#2563EB" : "#E2E8F0"}`,
                    borderRadius: 14,
                    padding: "16px 14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    boxShadow: isActive ? "0 4px 14px rgba(37,99,235,0.12)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: isActive ? "#2563EB" : "#E2E8F0",
                      color: isActive ? "#FFFFFF" : "#64748B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? "#2563EB" : "#090D16" }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{p.badge}</div>
                </button>
              );
            })}
          </div>

          {/* Selected Pathway Details Display */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: 18,
              padding: "36px",
            }}
          >
            <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 36, alignItems: "center" }}>
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: activePersonaData.accent,
                    background: activePersonaData.bgSoft,
                    padding: "4px 10px",
                    borderRadius: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    display: "inline-block",
                    marginBottom: 10,
                  }}
                >
                  {activePersonaData.badge}
                </span>
                <h3 style={{ fontSize: 24, fontWeight: 900, color: "#090D16", marginBottom: 12, letterSpacing: "-0.02em" }}>
                  {activePersonaData.title}: Your Learning Roadmap
                </h3>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 16 }}>
                  {activePersonaData.hook}
                </p>
                <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#EF4444", textTransform: "uppercase", marginBottom: 4 }}>
                    Common Friction Point
                  </div>
                  <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>
                    {activePersonaData.dilemma}
                  </div>
                </div>
                <Link
                  href={activePersonaData.trackHref}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 24px",
                    borderRadius: 10,
                    background: "#2563EB",
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: 700,
                    boxShadow: "0 2px 10px rgba(37,99,235,0.25)",
                  }}
                >
                  Start This Path Free ({activePersonaData.targetTrack}) <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Recommended Core Lessons */}
              <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: 14, padding: "24px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#090D16", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles className="w-4 h-4 text-[#2563EB]" /> Recommended Starter Lessons
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {activePersonaData.modules.map((mod, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "12px 14px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "#EFF6FF",
                          color: "#2563EB",
                          fontSize: 11,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#090D16", lineHeight: 1.4 }}>
                        {mod}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 7. THE 8 SOVEREIGN DISCIPLINES: COMPLETE SUBJECT MAP       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", padding: "88px 24px", borderTop: "1.5px solid #E2E8F0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 44, flexWrap: "wrap", gap: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#2563EB", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Structured Curriculum
              </span>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#090D16", letterSpacing: "-0.03em", marginTop: 8 }}>
                Eight Disciplines. <span style={{ color: "#2563EB" }}>Zero Blindspots.</span>
              </h2>
            </div>
            <Link
              href="/explore"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#2563EB",
                padding: "9px 18px",
                border: "1.5px solid #2563EB",
                borderRadius: 9,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Browse All 375+ Lessons →
            </Link>
          </div>

          {/* 8 Track Cards Grid */}
          <div className="grid-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {TRACKS.map((t) => (
              <Link
                key={t.code}
                href={`/tracks/${t.code}`}
                className="lift-card"
                style={{
                  background: "#FFFFFF",
                  border: `1.5px solid #E2E8F0`,
                  borderRadius: 16,
                  padding: "22px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 180,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{t.emoji}</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: t.color,
                        background: t.bg,
                        padding: "3px 8px",
                        borderRadius: 6,
                        textTransform: "uppercase",
                      }}
                    >
                      {t.level}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#090D16", marginBottom: 6 }}>
                    {t.title}
                  </h3>
                  <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6, marginBottom: 12 }}>
                    {t.tagline}
                  </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F1F5F9", paddingTop: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#090D16" }}>
                    {t.lessons} Lessons
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB", display: "flex", alignItems: "center", gap: 3 }}>
                    Start <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 8. REAL INDIAN CASE STUDIES: TRUE MISTAKES & WINS         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#F8FAFC", padding: "88px 24px", borderTop: "1.5px solid #E2E8F0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 44, flexWrap: "wrap", gap: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#EF4444", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                30 Real Indian Stories
              </span>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#090D16", letterSpacing: "-0.03em", marginTop: 8 }}>
                Learn from <span style={{ color: "#2563EB" }}>real mistakes and wins.</span>
              </h2>
            </div>
            <Link
              href="/case-studies"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#2563EB",
                padding: "9px 18px",
                border: "1.5px solid #2563EB",
                borderRadius: 9,
              }}
            >
              Read All 30 Indian Cases →
            </Link>
          </div>

          <div className="grid-3col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {CASE_STUDIES.map((cs, idx) => (
              <Link
                key={idx}
                href={`/case-studies/${cs.slug}`}
                className="lift-card"
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 16,
                  padding: "26px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontSize: 26 }}>{cs.emoji}</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: cs.badgeColor,
                        background: cs.badgeBg,
                        padding: "3px 8px",
                        borderRadius: 6,
                        textTransform: "uppercase",
                      }}
                    >
                      {cs.category}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#090D16", marginBottom: 8, lineHeight: 1.4 }}>
                    {cs.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.7, marginBottom: 18 }}>
                    {cs.subtitle}
                  </p>
                </div>
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>{cs.statLabel}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: cs.badgeColor }}>{cs.stat}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>Read case →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 9. AI MENTOR SPOTLIGHT (SINGLE CONTAINED MIDNIGHT FEATURE) */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#090D16", padding: "88px 24px", color: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#EAB308",
                  background: "rgba(234, 179, 8, 0.15)",
                  padding: "4px 10px",
                  borderRadius: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  display: "inline-block",
                  marginBottom: 14,
                }}
              >
                Frontier Financial Intelligence
              </span>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 18 }}>
                Never get stuck on a financial concept again.
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 28 }}>
                Whether it is calculating Section 80C vs. New Regime slab exemptions, reading debt-to-equity in a quarterly filing, or understanding option Greeks—our 24/7 AI Mentor breaks it down with plain-English clarity and source citations.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {[
                  "Context-aware: Remembers the lesson you are currently studying",
                  "Source-verified against SEBI, RBI, and Income Tax Department rules",
                  "Provides instant step-by-step mathematical breakdowns",
                ].map((pt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/ai-tutor"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 26px",
                  borderRadius: 10,
                  background: "#2563EB",
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
                }}
              >
                Try AI Finance Mentor Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Interactive Chat Mockup */}
            <div
              style={{
                background: "#0A1628",
                border: "1.5px solid rgba(255,255,255,0.12)",
                borderRadius: 20,
                padding: "26px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 18 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>AI Finance Mentor</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Live Academic Assistant · Source: IT Act 1961</div>
                </div>
              </div>

              {/* User Query */}
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 16px", marginBottom: 14, fontSize: 13, color: "#FFFFFF" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 3 }}>YOU ASKED</span>
                "I earn ₹15 LPA. Between the Old and New tax regimes, which one mathematically saves me more tax?"
              </div>

              {/* AI Response */}
              <div style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 14, padding: "16px", fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.9)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#60A5FA", marginBottom: 6 }}>
                  MATHEMATICAL BREAKDOWN (FY 2024-25)
                </div>
                <p style={{ marginBottom: 8 }}>
                  For a gross income of ₹15,00,000:
                </p>
                <ul style={{ paddingLeft: 16, marginBottom: 8 }}>
                  <li><strong>New Tax Regime:</strong> Tax is ₹1,40,400 (Standard deduction ₹75,000 applied automatically).</li>
                  <li><strong>Old Tax Regime:</strong> To beat the New Regime, your total deductions (80C, 80D, HRA) must exceed <strong>₹3,75,000</strong>.</li>
                </ul>
                <div style={{ fontSize: 12, color: "#EAB308", fontWeight: 700 }}>
                  Verdict: Unless you pay significant HRA or home loan interest, the New Tax Regime saves you ₹24,000+ net.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 10. TRANSPARENT PRICING & GENEROUS FREE CORE              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", padding: "88px 24px", borderTop: "1.5px solid #E2E8F0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#2563EB", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Transparent Enrollment
            </span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#090D16", letterSpacing: "-0.03em", marginTop: 8 }}>
              Free forever. <span style={{ color: "#2563EB" }}>Upgrade when you're ready.</span>
            </h2>

            {/* Monthly / Annual Toggle */}
            <div style={{ display: "inline-flex", background: "#F1F5F9", borderRadius: 30, padding: 4, marginTop: 20 }}>
              <button
                onClick={() => setBillingCycle("monthly")}
                style={{
                  padding: "8px 20px",
                  borderRadius: 24,
                  border: "none",
                  background: billingCycle === "monthly" ? "#FFFFFF" : "transparent",
                  color: billingCycle === "monthly" ? "#090D16" : "#64748B",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: billingCycle === "monthly" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                style={{
                  padding: "8px 20px",
                  borderRadius: 24,
                  border: "none",
                  background: billingCycle === "annual" ? "#FFFFFF" : "transparent",
                  color: billingCycle === "annual" ? "#090D16" : "#64748B",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: billingCycle === "annual" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                Annual Billing{" "}
                <span style={{ background: "#2563EB", color: "#FFFFFF", fontSize: 10, padding: "2px 6px", borderRadius: 8, fontWeight: 800 }}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid-3col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 36 }}>
            {/* Free Plan */}
            <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 18, padding: "32px 26px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase" }}>Free Core</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: "#090D16" }}>₹0</span>
                <span style={{ fontSize: 14, color: "#64748B" }}>forever</span>
              </div>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 20 }}>
                Essential education for every Indian starting their financial journey.
              </p>
              <div style={{ height: 1, background: "#E2E8F0", marginBottom: 20 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26, fontSize: 13, color: "#475569" }}>
                {[
                  "100+ foundational structured lessons",
                  "SIP, EMI, Tax & Net Worth simulators",
                  "5 AI Finance Mentor questions/day",
                  "Video library & glossary access",
                  "Community discussion forums",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Check className="w-4 h-4 text-[#2563EB] flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <Link
                href="/signup"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px",
                  borderRadius: 10,
                  border: "1.5px solid #E2E8F0",
                  background: "#FFFFFF",
                  color: "#090D16",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Start Free Core →
              </Link>
            </div>

            {/* Pro Academy Plan */}
            <div
              style={{
                background: "#FFFFFF",
                border: "2px solid #2563EB",
                borderRadius: 18,
                padding: "32px 26px",
                position: "relative",
                boxShadow: "0 16px 40px rgba(37,99,235,0.12)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#2563EB",
                  color: "#FFFFFF",
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "4px 12px",
                  borderRadius: 12,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                MOST POPULAR
              </span>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#2563EB", letterSpacing: "0.08em", textTransform: "uppercase" }}>Pro Academy</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: "#090D16" }}>₹{proPrice}</span>
                <span style={{ fontSize: 14, color: "#64748B" }}>/month</span>
              </div>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>
                {billingCycle === "annual" ? `Billed ₹${proPrice * 12}/year (Save ₹1,200)` : "Cancel anytime with one click"}
              </div>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 20 }}>
                Complete curriculum, unlimited AI mentoring, and verified certificates.
              </p>
              <div style={{ height: 1, background: "#E2E8F0", marginBottom: 20 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26, fontSize: 13, color: "#090D16" }}>
                {[
                  "Everything in Free Core +",
                  "All 8 master disciplines (375+ lessons)",
                  "Unlimited 24/7 AI Mentor queries",
                  "All 15 interactive simulators & labs",
                  "20 Trading Theater animated case videos",
                  "Verified, shareable track certificates",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: f.includes("+") ? 600 : 500 }}>
                    <Check className="w-4 h-4 text-[#2563EB] flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <Link
                href="/signup?plan=pro"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "13px",
                  borderRadius: 10,
                  background: "#2563EB",
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: 800,
                  boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                }}
              >
                Start 7-Day Free Trial →
              </Link>
            </div>

            {/* Expert Masterclass */}
            <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 18, padding: "32px 26px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase" }}>Expert Masterclass</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: "#090D16" }}>₹{expertPrice}</span>
                <span style={{ fontSize: 14, color: "#64748B" }}>/month</span>
              </div>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>
                {billingCycle === "annual" ? `Billed ₹${expertPrice * 12}/year` : "Cancel anytime"}
              </div>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 20 }}>
                Institutional valuation, advanced derivatives, and career coaching.
              </p>
              <div style={{ height: 1, background: "#E2E8F0", marginBottom: 20 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26, fontSize: 13, color: "#475569" }}>
                {[
                  "Everything in Pro Academy +",
                  "Advanced Corporate Valuation & DCF models",
                  "F&O Options Greeks deep-dive modules",
                  "Priority AI Mentor response speed",
                  "Monthly private AMA sessions with mentors",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Check className="w-4 h-4 text-[#2563EB] flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <Link
                href="/signup?plan=expert"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px",
                  borderRadius: 10,
                  border: "1.5px solid #E2E8F0",
                  background: "#FFFFFF",
                  color: "#090D16",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Enroll in Expert →
              </Link>
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: 12, color: "#64748B" }}>
            🔒 7-day free trial on Pro and Expert · Cancel anytime directly from your dashboard · Razorpay & UPI accepted
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 11. FAQ ACCORDION & SOVEREIGN CLOSING CALL TO ACTION      */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#F8FAFC", padding: "88px 24px", borderTop: "1.5px solid #E2E8F0" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#2563EB", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Frequently Asked Questions
            </span>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900, color: "#090D16", letterSpacing: "-0.03em", marginTop: 8 }}>
              Everything you need to know <span style={{ color: "#2563EB" }}>before you start.</span>
            </h2>
          </div>

          <div style={{ marginBottom: 68 }}>
            {FAQS.map((faq, i) => (
              <FAQAccordionItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>

          {/* Sovereign Final Call to Action Box */}
          <div
            style={{
              background: "#090D16",
              borderRadius: 22,
              padding: "48px 36px",
              textAlign: "center",
              color: "#FFFFFF",
              boxShadow: "0 20px 50px rgba(9,13,22,0.18)",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(26px, 3.8vw, 40px)",
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                marginBottom: 16,
              }}
            >
              The best time to understand money <br />
              <span style={{ color: "#60A5FA" }}>was 10 years ago.</span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", maxWidth: 540, margin: "0 auto 28px", lineHeight: 1.7 }}>
              The second best time is right now. 375+ structured lessons, risk-free simulators, and 24/7 AI tutoring. Free forever. No jargon. True clarity.
            </p>
            <Link
              href="/signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "15px 36px",
                borderRadius: 12,
                background: "#2563EB",
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: 800,
                boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
              }}
            >
              Start Learning Free Today <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 12. INSTITUTIONAL FOOTER                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <footer style={{ background: "#090D16", padding: "64px 24px 32px", color: "#FFFFFF", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1.5fr 2.5fr", gap: 48, marginBottom: 48 }}>
            <div>
              <Logo size="md" href="/" dark />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, maxWidth: 300, marginTop: 16 }}>
                India's premier national financial education academy. 375+ lessons, 15 simulators, and AI tutoring. Free forever.
              </p>
              <div style={{ marginTop: 16, fontSize: 12, color: "#60A5FA", fontWeight: 600 }}>
                🇮🇳 Built for Indian Investors & Learners
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
                  Curriculum
                </div>
                {[
                  ["Personal Finance", "/tracks/personal-finance"],
                  ["Trading & Markets", "/tracks/trading-and-markets"],
                  ["Corporate Finance", "/tracks/corporate-finance"],
                  ["हिंदी Finance", "/tracks/hindi-finance"],
                  ["Case Studies", "/case-studies"],
                ].map(([label, href]) => (
                  <Link key={label} href={href} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8, transition: "color 0.15s" }}>
                    {label}
                  </Link>
                ))}
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
                  Practice & Tools
                </div>
                {[
                  ["Finance Labs", "/practice"],
                  ["SIP Calculator", "/practice/sip"],
                  ["AI Finance Mentor", "/ai-tutor"],
                  ["Glossary", "/glossary"],
                  ["Pricing", "/pricing"],
                ].map(([label, href]) => (
                  <Link key={label} href={href} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8, transition: "color 0.15s" }}>
                    {label}
                  </Link>
                ))}
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
                  Institutional
                </div>
                {[
                  ["Privacy Policy", "/legal/privacy"],
                  ["Terms of Service", "/legal/terms"],
                  ["Refund Policy", "/legal/refund"],
                  ["SEBI Disclaimer", "/legal/disclaimer"],
                  ["Contact Support", "/contact"],
                ].map(([label, href]) => (
                  <Link key={label} href={href} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8, transition: "color 0.15s" }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            <span>© 2026 FinanceHub of India. All rights reserved. Strictly for educational purposes. Not SEBI-registered investment advice.</span>
            <span>support@financehub.in</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
