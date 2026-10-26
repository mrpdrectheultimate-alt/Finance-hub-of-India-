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
  BarChart3,
  Award,
  Zap,
  Layers,
  HelpCircle,
  Clock,
  ChevronRight,
  Star,
  Check,
} from "lucide-react";

// ============================================================
// FinanceHub — World-Class Homepage
// app/page.tsx
//
// Clean 6-Color Palette:
//   White:  #FFFFFF — Canvas, breathing room, crisp cards
//   Black:  #090D16 — Sovereign authority, typography, dark sections
//   Blue:   #2563EB — Primary brand action, intelligence, core learning
//   Yellow: #EAB308 — Energy, ratings, XP, milestones, badges
//   Orange: #F97316 — Practice, simulators, momentum, active pathways
//   Red:    #EF4444 — Risk awareness, Indian case studies, Hindi track
//
// 7-Step Narrative Flow:
//   1. Navbar
//   2. Sovereign Hero + Interactive Rule-of-72 Micro-Lab
//   3. Authority Proof Strip (Monumental Numbers)
//   4. The 3 Pillars: Learn · Practice · Ask
//   5. "Where Should I Begin?" (Guided Personalization)
//   6. 8 Sovereign Tracks (The Complete Curriculum)
//   7. AI Finance Mentor in Action (Midnight Spotlight)
//   8. Transparent Access & Final Call to Action
//   9. Footer
// ============================================================

// ─── DATA DEFINITIONS ────────────────────────────────────────

const STATS_DATA = [
  { val: "375+", label: "Structured Lessons", sub: "Beginner to advanced", color: "#2563EB" },
  { val: "8", label: "Master Disciplines", sub: "Complete financial coverage", color: "#F97316" },
  { val: "15", label: "Interactive Simulators", sub: "100% risk-free modeling", color: "#EAB308" },
  { val: "30+", label: "Indian Case Studies", sub: "Paytm, Hindenburg, LIC", color: "#EF4444" },
  { val: "100%", label: "Free Open-Access Core", sub: "No credit card needed", color: "#090D16" },
];

const PERSONAS = [
  {
    id: "student",
    title: "College Student",
    badge: "Starting From Zero",
    accent: "#2563EB",
    bgSoft: "#EFF6FF",
    icon: GraduationCap,
    dilemma: "Confused by financial jargon, living on a limited allowance, and tempted by predatory 'buy now, pay later' credit traps.",
    outcome: "Master the mathematics of early compounding, build a zero-stress 3-bucket budget, and start your first ₹500 monthly SIP with total confidence.",
    modules: [
      "The Unfair Advantage of Starting at Age 20",
      "Building a Zero-Stress 50/30/20 Budget",
      "Spotting & Avoiding 40% APR Credit Card Traps",
    ],
    targetTrack: "Personal Finance",
    trackHref: "/tracks/personal-finance",
  },
  {
    id: "salaried",
    title: "Salaried Professional",
    badge: "Tax & Wealth Optimization",
    accent: "#F97316",
    bgSoft: "#FFF7ED",
    icon: Briefcase,
    dilemma: "Shocked by monthly TDS deductions, overwhelmed by Old vs. New tax regime decisions, and lacking an automated index investing system.",
    outcome: "Decode every deduction on your salary slip, mathematically calculate your tax break-even, and build an automated low-cost wealth machine.",
    modules: [
      "Decoding Every Line of Your Salary Slip (CTC vs Take-Home)",
      "Old vs New Tax Regime: The Exact Mathematical Break-Even",
      "Term Insurance vs ULIPs: Pure Protection Explained",
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
    dilemma: "Losing money following Telegram/WhatsApp tipsters, lacking a structured risk-management framework, and gambling on F&O options.",
    outcome: "Understand why 89% of intraday traders lose capital, master candlestick structure, risk-reward ratios, and paper-trade before risking real cash.",
    modules: [
      "SEBI Data Reality: Why 89% Lose in F&O and How to Survive",
      "Candlestick Anatomy: Support, Resistance & Volume Confirmation",
      "The 1% Risk Rule: Position Sizing That Prevents Account Blowups",
    ],
    targetTrack: "Trading & Markets",
    trackHref: "/tracks/trading-and-markets",
  },
  {
    id: "founder",
    title: "Founder / Business Mind",
    badge: "Corporate Valuation",
    accent: "#EF4444",
    bgSoft: "#FEF2F2",
    icon: Rocket,
    dilemma: "Unsure how to read a balance sheet, calculate burn rate, value an early-stage startup, or structure ESOPs without huge tax penalties.",
    outcome: "Read financial statements like a private equity analyst, understand discounted cash flows (DCF), and structure equity pools with ease.",
    modules: [
      "Reading the 3 Financial Statements (P&L, Balance Sheet, Cash Flow)",
      "Discounted Cash Flow (DCF): Valuing a Business from First Principles",
      "ESOP Taxation in India: The Perquisite Tax Shock Explained",
    ],
    targetTrack: "Corporate Finance",
    trackHref: "/tracks/corporate-finance",
  },
];

const TRACKS = [
  {
    code: "PF",
    title: "Personal Finance",
    tagline: "Budgeting, SIPs, Old vs New Tax, Insurance & Retirement",
    lessons: 45,
    level: "Beginner",
    badgeColor: "#2563EB",
    lightBg: "#EFF6FF",
    borderColor: "#BFDBFE",
    icon: "💰",
    href: "/tracks/personal-finance",
  },
  {
    code: "TM",
    title: "Trading & Markets",
    tagline: "Equities, Order Types, Market Mechanics & F&O Risk",
    lessons: 52,
    level: "Beginner → Advanced",
    badgeColor: "#F97316",
    lightBg: "#FFF7ED",
    borderColor: "#FED7AA",
    icon: "📈",
    href: "/tracks/trading-and-markets",
  },
  {
    code: "TA",
    title: "Technical Analysis",
    tagline: "Price Action, Candlestick Anatomy, RSI, MACD & Trends",
    lessons: 36,
    level: "Intermediate",
    badgeColor: "#EAB308",
    lightBg: "#FEFCE8",
    borderColor: "#FEF08A",
    icon: "📊",
    href: "/tracks/technical-analysis",
  },
  {
    code: "CF",
    title: "Corporate Finance",
    tagline: "DCF Valuation, Financial Statement Analysis & M&A",
    lessons: 38,
    level: "Advanced",
    badgeColor: "#090D16",
    lightBg: "#F1F5F9",
    borderColor: "#CBD5E1",
    icon: "🏢",
    href: "/tracks/corporate-finance",
  },
  {
    code: "BF",
    title: "Behavioral Finance",
    tagline: "Loss Aversion, FOMO, Sunk Cost Bias & Trading Psychology",
    lessons: 24,
    level: "All Levels",
    badgeColor: "#EF4444",
    lightBg: "#FEF2F2",
    borderColor: "#FECACA",
    icon: "🧠",
    href: "/tracks/behavioral-finance",
  },
  {
    code: "CR",
    title: "Crypto & Digital Assets",
    tagline: "Blockchain Architecture, Bitcoin, DeFi & India 30% Tax",
    lessons: 28,
    level: "Intermediate",
    badgeColor: "#2563EB",
    lightBg: "#EFF6FF",
    borderColor: "#BFDBFE",
    icon: "₿",
    href: "/tracks/crypto-and-defi",
  },
  {
    code: "FX",
    title: "Forex & Global Macro",
    tagline: "Currency Pairs, RBI Reserves, FEMA Rules & Hedging",
    lessons: 22,
    level: "Advanced",
    badgeColor: "#F97316",
    lightBg: "#FFF7ED",
    borderColor: "#FED7AA",
    icon: "💱",
    href: "/tracks/forex-and-currencies",
  },
  {
    code: "HI",
    title: "हिंदी Finance (Hindi Track)",
    tagline: "SIP, Mutual Funds, Tax aur Share Bazaar — Aasan Hindi mein",
    lessons: 23,
    level: "Beginner",
    badgeColor: "#EF4444",
    lightBg: "#FEF2F2",
    borderColor: "#FECACA",
    icon: "🇮🇳",
    href: "/tracks/hindi-finance",
  },
];

const PRICING_TIERS = [
  {
    name: "Free Core",
    price: "₹0",
    period: "forever",
    description: "Open-access foundational finance education for every Indian citizen.",
    badge: null,
    highlight: false,
    ctaText: "Start Learning Free",
    ctaHref: "/signup",
    features: [
      "100+ foundational lessons across tracks",
      "Core calculators: SIP, EMI, Tax Break-Even",
      "5 AI Mentor queries every day",
      "Complete Glossary with 200+ Indian terms",
      "Community discussion and peer study",
    ],
  },
  {
    name: "Pro Academy",
    price: "₹499",
    period: "/month",
    description: "The complete system for serious investors, traders, and career builders.",
    badge: "Most Popular",
    highlight: true,
    ctaText: "Start 7-Day Free Trial",
    ctaHref: "/signup?plan=pro",
    features: [
      "All 375+ lessons across all 8 tracks",
      "Unlimited 24/7 AI Mentor assistance",
      "All 15 interactive financial simulators",
      "30+ Indian case studies (Adani, Paytm, Yes Bank)",
      "Trading Theater risk simulator",
      "Verified LinkedIn completion certificates",
      "Downloadable cheat sheets & PDF study guides",
    ],
  },
  {
    name: "Expert Masterclass",
    price: "₹999",
    period: "/month",
    description: "Advanced institutional analysis, corporate valuation, and career mentorship.",
    badge: "Career Ready",
    highlight: false,
    ctaText: "Get Expert Access",
    ctaHref: "/signup?plan=expert",
    features: [
      "Everything included in Pro",
      "Advanced Corporate Finance & DCF models",
      "Institutional F&O options Greeks analysis",
      "Priority response speed on AI Mentor",
      "Direct monthly Q&A sessions with CAs & CFA charterholders",
      "Personalized financial career roadmaps",
    ],
  },
];

// ─── HERO INTERACTIVE SNEAK PEEK (Rule of 72 & Compound Time) ──
function HeroInteractiveLab() {
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(15);
  const rate = 12; // 12% standard equity index CAGR assumption

  const totalInvested = monthly * years * 12;
  const totalCorpus = Math.round(
    monthly *
      ((Math.pow(1 + rate / 1200, years * 12) - 1) / (rate / 1200)) *
      (1 + rate / 1200)
  );
  const wealthGained = totalCorpus - totalInvested;
  const multiplier = (totalCorpus / totalInvested).toFixed(1);

  const formatLakhs = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "2px solid #E2E8F0",
        borderRadius: 20,
        padding: "24px",
        boxShadow: "0 12px 40px -10px rgba(15, 23, 42, 0.12)",
        position: "relative",
      }}
    >
      {/* Top Header Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#090D16" }}>
              Live Concept Preview
            </div>
            <div style={{ fontSize: 11, color: "#64748B" }}>
              How Compounding Math Actually Works
            </div>
          </div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 8px",
            borderRadius: 6,
            background: "#FEFCE8",
            color: "#A16207",
            border: "1px solid #FEF08A",
          }}
        >
          {multiplier}x Wealth Multiplier
        </span>
      </div>

      {/* Sliders */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              fontWeight: 600,
              color: "#334155",
              marginBottom: 4,
            }}
          >
            <span>Monthly SIP:</span>
            <span style={{ color: "#2563EB", fontWeight: 800 }}>
              ₹{monthly.toLocaleString("en-IN")}
            </span>
          </div>
          <input
            type="range"
            min={1000}
            max={30000}
            step={1000}
            value={monthly}
            onChange={(e) => setMonthly(+e.target.value)}
            style={{ width: "100%", accentColor: "#2563EB", cursor: "pointer" }}
          />
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              fontWeight: 600,
              color: "#334155",
              marginBottom: 4,
            }}
          >
            <span>Investment Timeline:</span>
            <span style={{ color: "#F97316", fontWeight: 800 }}>{years} Years</span>
          </div>
          <input
            type="range"
            min={3}
            max={30}
            step={1}
            value={years}
            onChange={(e) => setYears(+e.target.value)}
            style={{ width: "100%", accentColor: "#F97316", cursor: "pointer" }}
          />
        </div>
      </div>

      {/* 2-Column Result Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            background: "#F8FAFC",
            borderRadius: 12,
            padding: "12px",
            border: "1px solid #E2E8F0",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 2 }}>You Deposit</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#090D16" }}>
            {formatLakhs(totalInvested)}
          </div>
        </div>

        <div
          style={{
            background: "#EFF6FF",
            borderRadius: 12,
            padding: "12px",
            border: "1px solid #BFDBFE",
          }}
        >
          <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 600, marginBottom: 2 }}>
            Compounded Gains
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#2563EB" }}>
            +{formatLakhs(wealthGained)}
          </div>
        </div>
      </div>

      {/* Total Callout Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #090D16 0%, #1E293B 100%)",
          color: "#FFFFFF",
          borderRadius: 14,
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase" }}>
            Projected Corpus (@ 12% CAGR)
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#FACC15" }}>
            {formatLakhs(totalCorpus)}
          </div>
        </div>
        <Link
          href="/practice/sip"
          style={{
            fontSize: 12,
            fontWeight: 700,
            background: "#2563EB",
            color: "#FFFFFF",
            padding: "8px 14px",
            borderRadius: 8,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          Explore Lab <ArrowRight size={14} />
        </Link>
      </div>

      <div
        style={{
          fontSize: 11,
          color: "#64748B",
          textAlign: "center",
          marginTop: 10,
          lineHeight: 1.4,
        }}
      >
        💡 <em>Lesson 1 takeaway:</em> Time in the market creates 3x more wealth than timing the market.
      </div>
    </div>
  );
}

// ─── MAIN HOMEPAGE COMPONENT ─────────────────────────────────
export default function HomePage() {
  const [activePersona, setActivePersona] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const p = PERSONAS[activePersona];

  return (
    <div
      style={{
        background: "#FFFFFF",
        color: "#090D16",
        minHeight: "100vh",
        fontFamily: "var(--font-ui, system-ui, -apple-system, sans-serif)",
        overflowX: "hidden",
      }}
    >
      {/* ══════════════════════════════════════════════════════
          1. STICKY BLUR NAVBAR
      ══════════════════════════════════════════════════════ */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: scrolled ? "rgba(255, 255, 255, 0.95)" : "#FFFFFF",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: `1px solid ${scrolled ? "#E2E8F0" : "#F1F5F9"}`,
          transition: "all 0.2s ease",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Branded Logo */}
          <Logo size="md" href="/" />

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
            }}
            className="hidden md:flex"
          >
            {[
              { label: "Curriculum", href: "/explore" },
              { label: "Simulators", href: "/practice" },
              { label: "Case Studies", href: "/case-studies" },
              { label: "Library", href: "/library" },
              { label: "AI Mentor", href: "/ai-tutor" },
              { label: "Pricing", href: "/pricing" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#334155",
                  textDecoration: "none",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#2563EB")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/login"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#090D16",
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: 9,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
                textDecoration: "none",
                padding: "10px 20px",
                borderRadius: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1D4ED8";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#2563EB";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Start Free <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          2. SOVEREIGN HERO SECTION
      ══════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          padding: "64px 24px 80px",
          background: "radial-gradient(ellipse at 50% 0%, #EFF6FF 0%, #FFFFFF 70%)",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 56,
              alignItems: "center",
            }}
            className="grid-cols-1 lg:grid-cols-2"
          >
            {/* Left Copy Column */}
            <div>
              {/* Sovereign Pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 24,
                  background: "#FFFFFF",
                  border: "1.5px solid #BFDBFE",
                  marginBottom: 20,
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.08)",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#2563EB",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    color: "#1D4ED8",
                    textTransform: "uppercase",
                  }}
                >
                  India's National Financial Academy · 100% Free Core
                </span>
              </div>

              {/* Main Headline */}
              <h1
                style={{
                  fontSize: "clamp(38px, 5vw, 62px)",
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: "-0.03em",
                  color: "#090D16",
                  marginBottom: 20,
                }}
              >
                Master the Language <br />
                <span style={{ color: "#2563EB" }}>of Money.</span> Built for India.
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.65,
                  color: "#475569",
                  marginBottom: 32,
                  maxWidth: 540,
                }}
              >
                From your first ₹500 SIP to reading corporate balance sheets and trading options risk—learn through 375+ structured lessons, 15 risk-free simulators, and 24/7 AI mentoring. In English and Hindi.
              </p>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: 32,
                }}
              >
                <Link
                  href="/signup"
                  style={{
                    padding: "15px 32px",
                    borderRadius: 12,
                    background: "#2563EB",
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: 800,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 6px 20px rgba(37, 99, 235, 0.35)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1D4ED8";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#2563EB";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Start Learning Free <ArrowRight size={18} />
                </Link>

                <Link
                  href="/explore"
                  style={{
                    padding: "15px 28px",
                    borderRadius: 12,
                    background: "#FFFFFF",
                    color: "#090D16",
                    fontSize: 16,
                    fontWeight: 700,
                    textDecoration: "none",
                    border: "2px solid #E2E8F0",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#090D16";
                    e.currentTarget.style.background = "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.background = "#FFFFFF";
                  }}
                >
                  Explore Curriculum
                </Link>
              </div>

              {/* Trust Signal Pills */}
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  flexWrap: "wrap",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#64748B",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={16} color="#2563EB" /> No credit card required
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={16} color="#F97316" /> SEBI & RBI aligned curriculum
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={16} color="#EAB308" /> 100% Free Core
                </span>
              </div>
            </div>

            {/* Right Live Micro-Lab Column */}
            <div>
              <HeroInteractiveLab />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. MONUMENTAL CREDIBILITY PROOF STRIP
      ══════════════════════════════════════════════════════ */}
      <section
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          padding: "32px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 24,
            }}
            className="grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          >
            {STATS_DATA.map((item, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: "center",
                  borderRight: idx < STATS_DATA.length - 1 ? "1px solid #F1F5F9" : "none",
                  padding: "0 12px",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(28px, 3.5vw, 36px)",
                    fontWeight: 900,
                    color: item.color,
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {item.val}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#090D16",
                    marginBottom: 2,
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. THE THREE PILLARS (HOW IT WORKS)
      ══════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "96px 24px",
          background: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64, maxWidth: 680, margin: "0 auto 64px" }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#2563EB",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 8,
              }}
            >
              The Mastery Engine
            </span>
            <h2
              style={{
                fontSize: "clamp(30px, 4vw, 44px)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#090D16",
                marginBottom: 14,
              }}
            >
              Three Pillars. One Complete Education.
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.6 }}>
              We removed textbook fluff, incomprehensible jargon, and WhatsApp tip-scams. Here is how genuine financial confidence is built.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 28,
            }}
            className="grid-cols-1 md:grid-cols-3"
          >
            {/* Pillar 1: Learn */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                padding: "36px 30px",
                border: "2px solid #E2E8F0",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: "#EFF6FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 24,
                    color: "#2563EB",
                  }}
                >
                  <BookOpen size={28} />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#2563EB",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  01 · Systematic Theory
                </div>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#090D16",
                    marginBottom: 12,
                  }}
                >
                  Structured Curriculum
                </h3>
                <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.65, marginBottom: 20 }}>
                  375+ lessons sequenced from zero to advanced. Clear formulas, Indian context (EPFO, SIP, Nifty 50, LTCG), and mini comprehension quizzes at every step.
                </p>
              </div>

              <div
                style={{
                  paddingTop: 16,
                  borderTop: "1px solid #F1F5F9",
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: "#EFF6FF",
                    color: "#1D4ED8",
                    padding: "4px 8px",
                    borderRadius: 6,
                  }}
                >
                  8 Complete Tracks
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: "#F1F5F9",
                    color: "#475569",
                    padding: "4px 8px",
                    borderRadius: 6,
                  }}
                >
                  English + Hindi
                </span>
              </div>
            </div>

            {/* Pillar 2: Practice */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                padding: "36px 30px",
                border: "2px solid #FED7AA",
                boxShadow: "0 8px 30px rgba(249, 115, 22, 0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: "#FFF7ED",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 24,
                    color: "#F97316",
                  }}
                >
                  <Calculator size={28} />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#EA580C",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  02 · Risk-Free Modeling
                </div>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#090D16",
                    marginBottom: 12,
                  }}
                >
                  Finance Labs
                </h3>
                <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.65, marginBottom: 20 }}>
                  Don't just read about money. Test your hypotheses with 15 interactive simulators: Paper Trading, Old vs. New Tax Regimes, Options Payoffs, and Net Worth Modeling.
                </p>
              </div>

              <div
                style={{
                  paddingTop: 16,
                  borderTop: "1px solid #F1F5F9",
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: "#FFF7ED",
                    color: "#C2410C",
                    padding: "4px 8px",
                    borderRadius: 6,
                  }}
                >
                  15 Simulators
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: "#F1F5F9",
                    color: "#475569",
                    padding: "4px 8px",
                    borderRadius: 6,
                  }}
                >
                  Zero Financial Risk
                </span>
              </div>
            </div>

            {/* Pillar 3: Ask */}
            <div
              style={{
                background: "#090D16",
                borderRadius: 20,
                padding: "36px 30px",
                border: "2px solid #1E293B",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.25)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                color: "#FFFFFF",
              }}
            >
              <div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: "rgba(250, 204, 21, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 24,
                    color: "#FACC15",
                  }}
                >
                  <Brain size={28} />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#FACC15",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  03 · 24/7 Intelligence
                </div>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    marginBottom: 12,
                  }}
                >
                  AI Finance Mentor
                </h3>
                <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.65, marginBottom: 20 }}>
                  Stuck on a complex SEBI circular, a P/E multiple formula, or an options Greek? Ask your dedicated AI tutor for an instant, plain-English breakdown with verified citations.
                </p>
              </div>

              <div
                style={{
                  paddingTop: 16,
                  borderTop: "1px solid #1E293B",
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: "rgba(250, 204, 21, 0.15)",
                    color: "#FACC15",
                    padding: "4px 8px",
                    borderRadius: 6,
                  }}
                >
                  Instant Answers
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#E2E8F0",
                    padding: "4px 8px",
                    borderRadius: 6,
                  }}
                >
                  Source-Cited
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. GUIDED PATHWAYS: "WHERE SHOULD I BEGIN?"
      ══════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "96px 24px",
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52, maxWidth: 640, margin: "0 auto 52px" }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#F97316",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 8,
              }}
            >
              Personalized Starting Point
            </span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#090D16",
                marginBottom: 12,
              }}
            >
              Choose Who You Are.
            </h2>
            <p style={{ fontSize: 16, color: "#64748B" }}>
              Finance is not one-size-fits-all. Select your current life stage to view your exact learning roadmap.
            </p>
          </div>

          {/* Horizontal Tab Buttons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginBottom: 32,
            }}
            className="grid-cols-2 md:grid-cols-4"
          >
            {PERSONAS.map((item, idx) => {
              const IconComp = item.icon;
              const isSelected = activePersona === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePersona(idx)}
                  style={{
                    padding: "16px 14px",
                    borderRadius: 14,
                    background: isSelected ? item.bgSoft : "#F8FAFC",
                    border: isSelected ? `2px solid ${item.accent}` : "2px solid #E2E8F0",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: isSelected ? "#FFFFFF" : "#E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: item.accent,
                    }}
                  >
                    <IconComp size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#090D16" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11, color: isSelected ? item.accent : "#64748B", fontWeight: 600 }}>
                      {item.badge}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Persona Spotlight Card */}
          <div
            style={{
              background: "#FFFFFF",
              border: `2px solid ${p.accent}`,
              borderRadius: 20,
              padding: "36px 40px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.8fr",
                gap: 40,
                alignItems: "center",
              }}
              className="grid-cols-1 md:grid-cols-2"
            >
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: p.bgSoft,
                    color: p.accent,
                    marginBottom: 12,
                    display: "inline-block",
                  }}
                >
                  Your Path Forward
                </span>
                <h3
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: "#090D16",
                    lineHeight: 1.25,
                    marginBottom: 14,
                  }}
                >
                  {p.title}: Overcoming the Friction
                </h3>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 4 }}>
                    The Dilemma:
                  </div>
                  <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.6 }}>
                    {p.dilemma}
                  </p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: p.accent, textTransform: "uppercase", marginBottom: 4 }}>
                    The Solution:
                  </div>
                  <p style={{ fontSize: 15, color: "#090D16", fontWeight: 600, lineHeight: 1.6 }}>
                    {p.outcome}
                  </p>
                </div>

                <Link
                  href={p.trackHref}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 10,
                    background: p.accent,
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: 800,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Start This Path in {p.targetTrack} <ArrowRight size={16} />
                </Link>
              </div>

              {/* Modules list */}
              <div
                style={{
                  background: "#F8FAFC",
                  borderRadius: 16,
                  padding: "24px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: "#090D16", marginBottom: 14 }}>
                  Recommended First 3 Lessons:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {p.modules.map((mod, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: 10,
                        padding: "12px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: p.bgSoft,
                          color: p.accent,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>
                        {mod}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6. THE 8 MASTER DISCIPLINES (CURRICULUM SHOWCASE)
      ══════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "96px 24px",
          background: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 48,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#2563EB",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Comprehensive Syllabus
              </span>
              <h2
                style={{
                  fontSize: "clamp(30px, 4vw, 44px)",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: "#090D16",
                }}
              >
                Eight Disciplines. Zero Blindspots.
              </h2>
            </div>
            <Link
              href="/explore"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#2563EB",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Explore Full Curriculum <ArrowRight size={16} />
            </Link>
          </div>

          {/* 4x2 Grid of Tracks */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 18,
            }}
            className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          >
            {TRACKS.map((t) => (
              <Link
                key={t.code}
                href={t.href}
                style={{
                  background: "#FFFFFF",
                  border: "2px solid #E2E8F0",
                  borderRadius: 16,
                  padding: "24px 20px",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = t.badgeColor;
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 12px 30px ${t.badgeColor}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)";
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 28,
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: t.lightBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {t.icon}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: t.badgeColor,
                        background: t.lightBg,
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: `1px solid ${t.borderColor}`,
                      }}
                    >
                      {t.level}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: "#090D16",
                      marginBottom: 8,
                      lineHeight: 1.3,
                    }}
                  >
                    {t.title}
                  </h3>

                  <p
                    style={{
                      fontSize: 13,
                      color: "#64748B",
                      lineHeight: 1.5,
                      marginBottom: 18,
                    }}
                  >
                    {t.tagline}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTop: "1px solid #F1F5F9",
                    fontSize: 12,
                    fontWeight: 700,
                    color: t.badgeColor,
                  }}
                >
                  <span>{t.lessons} Lessons</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                    Start <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          7. AI FINANCE MENTOR (MIDNIGHT BLACK SPOTLIGHT)
      ══════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "96px 24px",
          background: "#090D16",
          color: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 56,
              alignItems: "center",
            }}
            className="grid-cols-1 lg:grid-cols-2"
          >
            {/* Left Narrative Column */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 20,
                  background: "rgba(250, 204, 21, 0.12)",
                  border: "1px solid rgba(250, 204, 21, 0.3)",
                  color: "#FACC15",
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 20,
                }}
              >
                <Sparkles size={14} /> 24/7 Frontier AI Mentor
              </div>

              <h2
                style={{
                  fontSize: "clamp(32px, 4.5vw, 48px)",
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  color: "#FFFFFF",
                  marginBottom: 20,
                }}
              >
                Never Get Stuck on a Financial Concept Again.
              </h2>

              <p
                style={{
                  fontSize: 17,
                  color: "#94A3B8",
                  lineHeight: 1.65,
                  marginBottom: 32,
                }}
              >
                Trained on Indian tax law, SEBI regulations, RBI circulars, and global valuation frameworks. Ask anything in plain language and receive step-by-step clarity with verified citations.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
                {[
                  "Plain-English translations of 100-page company annual reports",
                  "Old vs. New tax regime mathematical calculation for your exact salary",
                  "Clear options Greeks and risk-reward position breakdown",
                ].map((point, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#2563EB",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 900,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      ✓
                    </div>
                    <span style={{ fontSize: 14, color: "#CBD5E1" }}>{point}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/ai-tutor"
                style={{
                  padding: "14px 28px",
                  borderRadius: 12,
                  background: "#FACC15",
                  color: "#090D16",
                  fontSize: 15,
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Try AI Mentor Free <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right Interactive Chat Simulation Card */}
            <div
              style={{
                background: "#1E293B",
                borderRadius: 20,
                border: "1.5px solid #334155",
                padding: "24px",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* User Prompt */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#2563EB",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  U
                </div>
                <div
                  style={{
                    background: "#090D16",
                    borderRadius: 14,
                    padding: "12px 16px",
                    border: "1px solid #334155",
                    fontSize: 14,
                    color: "#F8FAFC",
                    lineHeight: 1.5,
                  }}
                >
                  "Why do 10-year Indian Government Bond (G-Sec) prices fall when RBI hikes the repo rate? Explain simply."
                </div>
              </div>

              {/* AI Response */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#FACC15",
                    color: "#090D16",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  AI
                </div>
                <div
                  style={{
                    background: "#0F172A",
                    borderRadius: 14,
                    padding: "16px",
                    border: "1px solid #334155",
                    fontSize: 14,
                    color: "#E2E8F0",
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ color: "#FACC15", fontWeight: 700, marginBottom: 6 }}>
                    Think of it like a seesaw: Yields up = Bond prices down.
                  </div>
                  <p style={{ marginBottom: 10, fontSize: 13, color: "#CBD5E1" }}>
                    1. When RBI hikes repo rate, newly issued government bonds offer a higher interest rate (say 7.5% instead of 7.0%).
                  </p>
                  <p style={{ marginBottom: 10, fontSize: 13, color: "#CBD5E1" }}>
                    2. Your old bond paying only 7.0% becomes less attractive. Nobody will buy it at full face value (₹100).
                  </p>
                  <p style={{ marginBottom: 12, fontSize: 13, color: "#CBD5E1" }}>
                    3. Its price must drop (e.g. to ₹96.5) so that its effective return matches the new 7.5% market rate.
                  </p>
                  <div
                    style={{
                      paddingTop: 8,
                      borderTop: "1px solid #334155",
                      fontSize: 11,
                      color: "#94A3B8",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Source: RBI Monetary Policy Framework</span>
                    <span style={{ color: "#2563EB", fontWeight: 700 }}>Lesson: Macro 101</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          8. TRANSPARENT PRICING & FINAL CALL TO ACTION
      ══════════════════════════════════════════════════════ */}
      <section
        id="pricing"
        style={{
          padding: "96px 24px",
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56, maxWidth: 640, margin: "0 auto 56px" }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#2563EB",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 8,
              }}
            >
              Clear & Honest Access
            </span>
            <h2
              style={{
                fontSize: "clamp(30px, 4vw, 44px)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#090D16",
                marginBottom: 12,
              }}
            >
              Free to Start. Upgrade When Ready.
            </h2>
            <p style={{ fontSize: 16, color: "#64748B" }}>
              No hidden traps, no forced subscriptions. Cancel anytime from your account dashboard.
            </p>
          </div>

          {/* 3 Pricing Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 28,
              alignItems: "stretch",
              marginBottom: 48,
            }}
            className="grid-cols-1 md:grid-cols-3"
          >
            {PRICING_TIERS.map((tier, idx) => (
              <div
                key={idx}
                style={{
                  background: tier.highlight ? "#090D16" : "#FFFFFF",
                  color: tier.highlight ? "#FFFFFF" : "#090D16",
                  border: tier.highlight ? "2px solid #2563EB" : "2px solid #E2E8F0",
                  borderRadius: 20,
                  padding: "36px 30px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: tier.highlight
                    ? "0 20px 50px rgba(37, 99, 235, 0.25)"
                    : "0 4px 20px rgba(0,0,0,0.03)",
                  transform: tier.highlight ? "scale(1.03)" : "none",
                }}
              >
                {tier.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: 18,
                      right: 18,
                      background: "#FACC15",
                      color: "#090D16",
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 20,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: tier.highlight ? "#60A5FA" : "#64748B",
                      marginBottom: 8,
                    }}
                  >
                    {tier.name}
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>
                      {tier.price}
                    </span>
                    <span style={{ fontSize: 14, color: tier.highlight ? "#94A3B8" : "#64748B" }}>
                      {tier.period}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 14,
                      color: tier.highlight ? "#CBD5E1" : "#64748B",
                      lineHeight: 1.5,
                      marginBottom: 24,
                    }}
                  >
                    {tier.description}
                  </p>

                  <div
                    style={{
                      height: 1,
                      background: tier.highlight ? "#1E293B" : "#F1F5F9",
                      marginBottom: 24,
                    }}
                  />

                  {/* Feature Checklist */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <Check
                          size={16}
                          color={tier.highlight ? "#FACC15" : "#2563EB"}
                          style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            color: tier.highlight ? "#E2E8F0" : "#334155",
                            lineHeight: 1.4,
                          }}
                        >
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={tier.ctaHref}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "14px",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 800,
                    textDecoration: "none",
                    background: tier.highlight ? "#2563EB" : "#F8FAFC",
                    color: tier.highlight ? "#FFFFFF" : "#090D16",
                    border: tier.highlight ? "none" : "1.5px solid #CBD5E1",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (tier.highlight) e.currentTarget.style.background = "#1D4ED8";
                    else e.currentTarget.style.background = "#E2E8F0";
                  }}
                  onMouseLeave={(e) => {
                    if (tier.highlight) e.currentTarget.style.background = "#2563EB";
                    else e.currentTarget.style.background = "#F8FAFC";
                  }}
                >
                  {tier.ctaText} →
                </Link>
              </div>
            ))}
          </div>

          {/* Final Sovereign Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #090D16 0%, #1E293B 100%)",
              borderRadius: 24,
              padding: "64px 32px",
              textAlign: "center",
              color: "#FFFFFF",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#FACC15",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 12,
                }}
              >
                Start Your Financial Awakening
              </span>
              <h2
                style={{
                  fontSize: "clamp(30px, 4vw, 42px)",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  marginBottom: 16,
                  lineHeight: 1.2,
                }}
              >
                The best time to understand money was 10 years ago. The second best time is right now.
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: "#94A3B8",
                  lineHeight: 1.6,
                  marginBottom: 32,
                }}
              >
                Join thousands of Indian learners mastering the rules of capital, market risk, and wealth creation. Free forever.
              </p>
              <Link
                href="/signup"
                style={{
                  padding: "16px 36px",
                  borderRadius: 12,
                  background: "#2563EB",
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 8px 24px rgba(37, 99, 235, 0.4)",
                }}
              >
                Start Learning Free <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          9. SOVEREIGN FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer
        style={{
          background: "#090D16",
          color: "#94A3B8",
          padding: "64px 24px 32px",
          borderTop: "1px solid #1E293B",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 48,
              marginBottom: 48,
            }}
            className="grid-cols-1 md:grid-cols-4"
          >
            <div>
              <Logo size="md" href="/" dark={true} />
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: "#64748B",
                  marginTop: 14,
                  maxWidth: 280,
                }}
              >
                India's most rigorous, open-access financial education academy. Dedicated to investor literacy, wealth preservation, and market clarity.
              </p>
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#FFFFFF",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Learn
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["Explore Courses", "/explore"],
                  ["8 Disciplines", "/explore"],
                  ["Case Studies", "/case-studies"],
                  ["Glossary", "/glossary"],
                  ["Book Vault", "/library"],
                ].map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#2563EB")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#FFFFFF",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Practice
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["Finance Lab", "/practice"],
                  ["SIP Simulator", "/practice/sip"],
                  ["Tax Regime Tool", "/practice/tax"],
                  ["Trading Theater", "/trading-theater"],
                  ["AI Mentor", "/ai-tutor"],
                ].map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#F97316")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#FFFFFF",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Legal & Trust
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["Terms of Service", "/legal/terms"],
                  ["Privacy Policy", "/legal/privacy"],
                  ["Refund Policy", "/legal/refund"],
                  ["Pricing", "/pricing"],
                ].map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#EAB308")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: 24,
              borderTop: "1px solid #1E293B",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
              color: "#475569",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              © 2026 FinanceHub of India. All rights reserved. Strictly educational. Not SEBI-registered financial advice.
            </div>
            <div>
              Built for India 🇮🇳 · support@financehub.in
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
