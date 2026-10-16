"use client";

import { useState, useMemo, type CSSProperties } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// ============================================================
// FinanceHub — 15 Finance Labs & Interactive Simulators
// app/practice/page.tsx
// High-Contrast · Unified White Card Architecture · Discovery Bar
// Live Search · Filter Pills · Sort · In-Place Mounting · Full Suite
// ============================================================

// Lazy-loaded simulator components for in-place mounting
const BudgetSimulator = dynamic(() => import("@/components/simulators/BudgetSimulator"), { ssr: false });
const EmiCalculator = dynamic(() => import("@/components/simulators/EmiCalculator"), { ssr: false });
const PaperTradingGame = dynamic(() => import("@/components/simulators/PaperTradingGame"), { ssr: false });
const CryptoPaperTrader = dynamic(() => import("@/components/trading/CryptoPaperTrader"), { ssr: false });
const RetirementSimulator = dynamic(() => import("@/components/simulators/RetirementSimulator"), { ssr: false });
const SipCalculator = dynamic(() => import("@/components/simulators/SipCalculator"), { ssr: false });
const StartupCashFlow = dynamic(() => import("@/components/simulators/StartupCashFlowSimulator"), { ssr: false });
const TaxCalculator = dynamic(() => import("@/components/simulators/TaxCalculator"), { ssr: false });

type LabItem = {
  id: string;
  code: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
  tags: string[];
  href: string;
  duration: number;
  isPopular?: boolean;
  isNew?: boolean;
  component?: any;
};

const LABS: LabItem[] = [
  {
    id: "sip",
    code: "SIP",
    icon: "📈",
    title: "SIP & Investment Calculator",
    desc: "See how monthly SIPs grow with compound interest. Compare expected returns across equities, mutual funds, and fixed deposits.",
    color: "#059669",
    tags: ["Personal Finance", "Investing"],
    href: "/practice/sip",
    duration: 5,
    isPopular: true,
    component: SipCalculator,
  },
  {
    id: "emi",
    code: "EMI",
    icon: "🏠",
    title: "Loan & EMI Calculator",
    desc: "Calculate monthly EMI for home, car, or personal loans. Model principal amortization schedules and prepayment savings impact.",
    color: "#2563EB",
    tags: ["Personal Finance", "Loans"],
    href: "/practice/emi",
    duration: 3,
    isPopular: true,
    component: EmiCalculator,
  },
  {
    id: "retirement",
    code: "RET",
    icon: "🏖",
    title: "Retirement Planner",
    desc: "Find out if you will have enough corpus to retire comfortably. Calculate monthly retirement needs and your financial readiness score.",
    color: "#7C3AED",
    tags: ["Personal Finance", "Planning"],
    href: "/practice/retirement",
    duration: 4,
    component: RetirementSimulator,
  },
  {
    id: "tax",
    code: "TAX",
    icon: "💰",
    title: "Tax Calculator FY 2024-25",
    desc: "Compare old vs new income tax regime for FY 2024-25 with Section 80C, 80D, HRA deductions, and standard deduction benefits.",
    color: "#D97706",
    tags: ["Personal Finance", "Tax"],
    href: "/practice/tax",
    duration: 3,
    isPopular: true,
    component: TaxCalculator,
  },
  {
    id: "startup",
    code: "RUN",
    icon: "🚀",
    title: "Startup Cash Flow Simulator",
    desc: "Model your startup cash runway, monthly burn rate, hiring plans, and path to break-even across optimistic and conservative scenarios.",
    color: "#DC2626",
    tags: ["Corporate Finance", "Founder"],
    href: "/practice/startup-cash-flow",
    duration: 8,
    component: StartupCashFlow,
  },
  {
    id: "budget",
    code: "BUD",
    icon: "📊",
    title: "Budget Simulator",
    desc: "Build your personal monthly budget with the proven 50/30/20 rule (Needs, Wants, Savings). See where your money actually goes.",
    color: "#059669",
    tags: ["Personal Finance", "Budgeting"],
    href: "/practice/budget",
    duration: 5,
    isNew: true,
    component: BudgetSimulator,
  },
  {
    id: "trading",
    code: "TRD",
    icon: "📉",
    title: "Paper Trading Game",
    desc: "Trade Indian equities with a virtual portfolio. Practice order timing, risk management, and stop-loss execution with zero real capital risk.",
    color: "#2563EB",
    tags: ["Trading", "Investing"],
    href: "/practice/trading",
    duration: 10,
    isPopular: true,
    component: PaperTradingGame,
  },
  {
    id: "crypto",
    code: "CRY",
    icon: "₿",
    title: "Crypto Paper Trading",
    desc: "Practise Bitcoin, Ethereum, and altcoin trades with simulated market orders and live virtual prices in a risk-free digital environment.",
    color: "#EA580C",
    tags: ["Trading", "Crypto"],
    href: "/practice/crypto",
    duration: 10,
    isPopular: true,
    component: CryptoPaperTrader,
  },
  {
    id: "net-worth",
    code: "NW",
    icon: "💎",
    title: "Net Worth Tracker",
    desc: "Track all assets and liabilities over time. Calculate your liquid emergency cushion and debt-to-asset financial health ratio.",
    color: "#059669",
    tags: ["Personal Finance", "Planning"],
    href: "/practice/net-worth",
    duration: 6,
  },
  {
    id: "goals",
    code: "GOL",
    icon: "🎯",
    title: "Goal-Based Financial Planner",
    desc: "Plan multiple life goals (Home, Child Education, Wealth Target) with inflation adjustment and targeted monthly SIP requirements.",
    color: "#0284C7",
    tags: ["Personal Finance", "Planning"],
    href: "/practice/goals",
    duration: 7,
    isNew: true,
  },
  {
    id: "insurance",
    code: "INS",
    icon: "🛡",
    title: "Insurance Needs & HLV Calculator",
    desc: "Calculate Human Life Value (HLV), identify term life insurance gaps, and evaluate health cover requirements for family security.",
    color: "#DC2626",
    tags: ["Personal Finance", "Insurance"],
    href: "/practice/insurance",
    duration: 6,
  },
  {
    id: "fire",
    code: "FIRE",
    icon: "🔥",
    title: "FIRE Early Retirement Calculator",
    desc: "Model Lean FIRE, Standard FIRE, and Fat FIRE milestones with inflation, expected corpus, and safe 4% annual withdrawal rule.",
    color: "#EA580C",
    tags: ["Personal Finance", "Investing"],
    href: "/practice/fire",
    duration: 5,
    isPopular: true,
  },
  {
    id: "rebalancer",
    code: "BAL",
    icon: "⚖",
    title: "Asset Allocation Rebalancer",
    desc: "Detect portfolio drift across equity, debt, and gold asset classes, and generate step-by-step rebalancing buy/sell plans.",
    color: "#7C3AED",
    tags: ["Investing", "Planning"],
    href: "/practice/rebalancer",
    duration: 6,
    isNew: true,
  },
  {
    id: "compound-visualizer",
    code: "CMP",
    icon: "📈",
    title: "Step-Up Compounding Visualizer",
    desc: "See how stepping up your SIP contributions by 10% each year dramatically accelerates wealth creation and the real cost of delaying.",
    color: "#0D9488",
    tags: ["Investing", "Personal Finance"],
    href: "/practice/compound-visualizer",
    duration: 4,
  },
  {
    id: "stress-test",
    code: "STR",
    icon: "⚡",
    title: "Financial Stress & Shock Tester",
    desc: "Simulate income loss, sudden job disruption, and emergency medical shocks to stress-test how many months your liquid assets survive.",
    color: "#B91C1C",
    tags: ["Personal Finance", "Planning"],
    href: "/practice/stress-test",
    duration: 7,
    isNew: true,
  },
];

const CATEGORIES = [
  "All",
  "Personal Finance",
  "Investing",
  "Loans",
  "Tax",
  "Trading",
  "Crypto",
  "Planning",
  "Insurance",
  "Corporate Finance",
];

export default function PracticePage() {
  const [activeLab, setActiveLab] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  // Filtered & sorted lab list
  const filteredLabs = useMemo(() => {
    let result = LABS.filter((lab) => {
      // Category filter
      if (filter !== "All" && !lab.tags.includes(filter)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = lab.title.toLowerCase().includes(q);
        const matchDesc = lab.desc.toLowerCase().includes(q);
        const matchCode = lab.code.toLowerCase().includes(q);
        const matchTags = lab.tags.some((t) => t.toLowerCase().includes(q));
        return matchTitle || matchDesc || matchCode || matchTags;
      }
      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === "popular") {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return 0;
      }
      if (sortBy === "new") {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
      }
      if (sortBy === "az") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [filter, searchQuery, sortBy]);

  const activeLabConfig = activeLab ? LABS.find((lab) => lab.id === activeLab) : null;
  const ActiveComponent = activeLabConfig?.component;

  // ══════════════════════════════════════════════════════════════
  // IN-PLACE MOUNTING VIEW (WHEN A SIMULATOR IS OPEN)
  // ══════════════════════════════════════════════════════════════
  if (activeLabConfig && ActiveComponent) {
    return (
      <div style={s.page}>
        <div style={s.container}>
          {/* Active Navigation Header */}
          <div style={s.activeHeader}>
            <button
              onClick={() => setActiveLab(null)}
              style={s.backToLabsBtn}
              type="button"
            >
              ← Back to all labs
            </button>
            <div style={s.activeBreadcrumb}>
              <span style={s.breadcrumbMuted}>Practice Labs</span>
              <span style={s.breadcrumbSep}>/</span>
              <span style={{ ...s.iconPill, background: `${activeLabConfig.color}15`, color: activeLabConfig.color }}>
                {activeLabConfig.icon} {activeLabConfig.code}
              </span>
              <span style={s.breadcrumbCurrent}>{activeLabConfig.title}</span>
            </div>
            {activeLabConfig.href && (
              <Link href={activeLabConfig.href} style={s.standaloneLink}>
                Open standalone page ↗
              </Link>
            )}
          </div>

          {/* Mounted Simulator Wrapper */}
          <div style={s.labCardWrapper}>
            <ActiveComponent />
          </div>

          {/* Sibling Labs Drawer */}
          <div style={s.otherLabsSection}>
            <div style={s.otherHeader}>
              <h3 style={s.otherTitle}>Explore Other Finance Labs</h3>
              <p style={s.otherSub}>Switch between interactive tools to model taxes, loans, trading, and retirement.</p>
            </div>
            <div style={s.otherGrid}>
              {LABS.filter((lab) => lab.id !== activeLab).slice(0, 6).map((lab) => (
                <button
                  key={lab.id}
                  onClick={() => {
                    if (lab.component) {
                      setActiveLab(lab.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else if (lab.href) {
                      window.location.href = lab.href;
                    }
                  }}
                  style={s.otherCard}
                  type="button"
                >
                  <div style={{ ...s.otherIcon, background: `${lab.color}15`, color: lab.color }}>
                    {lab.icon}
                  </div>
                  <div style={s.otherCardTextWrap}>
                    <div style={s.otherCardTitle}>{lab.title}</div>
                    <div style={s.otherCardTag}>{lab.tags[0]} · ⏱ {lab.duration}m</div>
                  </div>
                  <span style={s.otherCardArrow}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // DEFAULT DIRECTORY GALLERY VIEW
  // ══════════════════════════════════════════════════════════════
  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Navigation Breadcrumb */}
        <Link href="/dashboard" style={s.backLink}>
          ← Back to dashboard
        </Link>

        {/* Hero Section */}
        <div style={s.hero}>
          <div style={s.heroBadge}>
            <span>🧮</span>
            <span>FinanceHub Interactive Practice</span>
          </div>
          <h1 style={s.heroTitle}>
            15 Finance Labs &amp; Interactive Simulators
          </h1>
          <p style={s.heroSub}>
            Interactive simulators to practise real financial decisions, model wealth growth,
            and stress-test your portfolio — all without risking real capital.
          </p>
        </div>

        {/* Discovery Toolbar */}
        <div style={s.discoveryToolbar}>
          {/* Top Search + Sort Bar */}
          <div style={s.searchRow}>
            {/* Search Input */}
            <div style={s.searchWrapper}>
              <span style={s.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search labs by name, topic, or keyword (e.g. SIP, EMI, Tax, FIRE)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={s.searchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={s.clearBtn}
                  type="button"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={s.sortSelect}
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="new">Sort: Newest First</option>
              <option value="az">Sort: Alphabetical (A-Z)</option>
            </select>

            {/* Total Labs Badge */}
            <div style={s.countBadge}>
              <span style={s.countNumber}>{filteredLabs.length}</span>
              <span style={s.countLabel}>of 15 Labs</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={s.filterRow}>
            {CATEGORIES.map((cat) => {
              const isActive = filter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  style={{
                    ...s.filterPill,
                    ...(isActive ? s.filterPillActive : {}),
                  }}
                  type="button"
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* 15 LABS GRID                                            */}
        {/* ═══════════════════════════════════════════════════════ */}
        {filteredLabs.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>🔍</div>
            <h3 style={s.emptyTitle}>No matching labs found</h3>
            <p style={s.emptyText}>
              We couldn&apos;t find any simulator matching &ldquo;{searchQuery}&rdquo;. Try another search term or reset your category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilter("All");
              }}
              style={s.resetBtn}
              type="button"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={s.grid}>
            {filteredLabs.map((lab) => (
              <div key={lab.id} style={s.card}>
                {/* Top Section: Icon Tile + Badges */}
                <div style={s.cardHeader}>
                  <div style={{ ...s.iconTile, background: `${lab.color}14`, color: lab.color }}>
                    <span style={s.iconEmoji}>{lab.icon}</span>
                  </div>

                  <div style={s.cardBadgeGroup}>
                    {lab.isPopular && (
                      <span style={s.popularBadge}>
                        ⭐ POPULAR
                      </span>
                    )}
                    {lab.isNew && (
                      <span style={s.newBadge}>
                        ✨ NEW
                      </span>
                    )}
                    <span
                      style={{
                        ...s.codeBadge,
                        background: `${lab.color}15`,
                        color: lab.color,
                      }}
                    >
                      {lab.code}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div style={s.cardBody}>
                  <h3 style={s.cardTitle}>{lab.title}</h3>
                  <p style={s.cardDesc}>{lab.desc}</p>
                </div>

                {/* Metadata Row: Tags + Duration */}
                <div style={s.cardMetaRow}>
                  <div style={s.tagList}>
                    {lab.tags.map((tag) => (
                      <span key={tag} style={s.metaTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span style={s.durationPill}>
                    ⏱ {lab.duration} min
                  </span>
                </div>

                {/* Action CTA Button */}
                <div style={s.cardFooter}>
                  {lab.component ? (
                    <button
                      onClick={() => {
                        setActiveLab(lab.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      style={{ ...s.openBtn, background: lab.color }}
                      type="button"
                    >
                      <span>Open Lab</span>
                      <span style={s.btnArrow}>→</span>
                    </button>
                  ) : (
                    <Link
                      href={lab.href}
                      style={{ ...s.openBtnLink, background: lab.color }}
                    >
                      <span>Open Lab</span>
                      <span style={s.btnArrow}>→</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* HOW IT WORKS ONBOARDING GUIDE                           */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section style={s.howItWorksSection}>
          <div style={s.howHeader}>
            <div style={s.howBadge}>🎓 Practical Learning</div>
            <h2 style={s.howTitle}>How to Get the Most from Finance Labs</h2>
            <p style={s.howSub}>
              Move beyond passive reading. Use our interactive simulators to master Indian financial concepts hands-on.
            </p>
          </div>

          <div style={s.stepsGrid}>
            <div style={s.stepCard}>
              <div style={s.stepNumberBadge}>1</div>
              <h3 style={s.stepCardTitle}>Pick Your Focus</h3>
              <p style={s.stepCardText}>
                Choose from 15+ specialized simulators spanning mutual fund SIPs, home loan EMI prepayments, tax regimes, and FIRE milestones.
              </p>
            </div>

            <div style={s.stepCard}>
              <div style={s.stepNumberBadge}>2</div>
              <h3 style={s.stepCardTitle}>Model Real Scenarios</h3>
              <p style={s.stepCardText}>
                Adjust interactive sliders, test inflation scenarios, and simulate life shocks without risking actual money.
              </p>
            </div>

            <div style={s.stepCard}>
              <div style={s.stepNumberBadge}>3</div>
              <h3 style={s.stepCardTitle}>Build Confident Habits</h3>
              <p style={s.stepCardText}>
                Identify your optimal asset allocation, term insurance coverage, and wealth targets backed by clear mathematics.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* REGULATORY & EDUCATIONAL FOOTER                         */}
        {/* ═══════════════════════════════════════════════════════ */}
        <footer style={s.footer}>
          <p style={s.footerText}>
            © 2026 FinanceHub of India · All calculators and simulators are strictly for financial education and planning purposes ·
            Calculations are mathematical models and do not constitute SEBI-registered investment advice.
          </p>
        </footer>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DESIGN SYSTEM TOKENS & STYLES (WCAG AAA EYE-COMFORT)
// ══════════════════════════════════════════════════════════════

const s: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC", // Soft slate-50 daylight background
    color: "#0F172A", // Deep slate text
    fontFamily: "var(--font-ui, system-ui, -apple-system, sans-serif)",
    padding: "32px 20px 80px",
  },
  container: {
    maxWidth: 1240,
    margin: "0 auto",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: "#64748B",
    textDecoration: "none",
    marginBottom: 20,
    transition: "color 0.15s ease",
  },
  hero: {
    marginBottom: 32,
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 12px",
    borderRadius: 20,
    background: "rgba(14, 97, 99, 0.08)",
    color: "#0E6163",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "#0F172A", // Crisp slate-900 (High contrast)
    margin: "0 0 10px",
    lineHeight: 1.2,
  },
  heroSub: {
    fontSize: 16,
    color: "#475569", // Slate-600 readable body
    maxWidth: 760,
    margin: 0,
    lineHeight: 1.6,
  },
  discoveryToolbar: {
    background: "#FFFFFF",
    borderRadius: 20,
    padding: "20px 24px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
    marginBottom: 32,
  },
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  searchWrapper: {
    flex: "1 1 360px",
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 14,
    fontSize: 14,
    color: "#94A3B8",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    height: 44,
    padding: "0 40px 0 38px",
    fontSize: 14,
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    background: "#F8FAFC",
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s ease, background 0.15s ease",
  },
  clearBtn: {
    position: "absolute",
    right: 12,
    background: "none",
    border: "none",
    color: "#94A3B8",
    fontSize: 14,
    cursor: "pointer",
    padding: 4,
  },
  sortSelect: {
    height: 44,
    padding: "0 16px",
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    background: "#FFFFFF",
    color: "#334155",
    cursor: "pointer",
    outline: "none",
    fontFamily: "inherit",
  },
  countBadge: {
    height: 44,
    padding: "0 16px",
    borderRadius: 12,
    background: "#F1F5F9",
    border: "1px solid #E2E8F0",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  countNumber: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0E6163",
  },
  countLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748B",
  },
  filterRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  filterPill: {
    padding: "7px 16px",
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 20,
    border: "1px solid #E2E8F0",
    background: "#FFFFFF",
    color: "#475569",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },
  filterPillActive: {
    background: "#0E6163",
    color: "#FFFFFF",
    borderColor: "#0E6163",
    boxShadow: "0 2px 6px rgba(14, 97, 99, 0.25)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: 22,
    marginBottom: 48,
  },
  card: {
    background: "#FFFFFF", // Pure white elevated surface
    border: "1px solid #E2E8F0",
    borderRadius: 20,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 24,
  },
  cardBadgeGroup: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  popularBadge: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.05em",
    padding: "3px 8px",
    borderRadius: 6,
    background: "#FEF3C7",
    color: "#B45309",
  },
  newBadge: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.05em",
    padding: "3px 8px",
    borderRadius: 6,
    background: "#D1FAE5",
    color: "#065F46",
  },
  codeBadge: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.08em",
    padding: "3px 8px",
    borderRadius: 6,
  },
  cardBody: {
    flex: "1 1 auto",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 750,
    color: "#0F172A",
    margin: "0 0 8px",
    lineHeight: 1.3,
  },
  cardDesc: {
    fontSize: 13.5,
    color: "#475569",
    lineHeight: 1.6,
    margin: 0,
  },
  cardMetaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTop: "1px solid #F1F5F9",
    marginBottom: 16,
    gap: 8,
  },
  tagList: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  metaTag: {
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 6,
    background: "#F1F5F9",
    color: "#475569",
  },
  durationPill: {
    fontSize: 11,
    fontWeight: 600,
    color: "#64748B",
    whiteSpace: "nowrap",
  },
  cardFooter: {
    marginTop: "auto",
  },
  openBtn: {
    width: "100%",
    padding: "11px 18px",
    fontSize: 13.5,
    fontWeight: 700,
    border: "none",
    borderRadius: 12,
    color: "#FFFFFF",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "inherit",
    transition: "opacity 0.15s ease, transform 0.15s ease",
  },
  openBtnLink: {
    width: "100%",
    padding: "11px 18px",
    fontSize: 13.5,
    fontWeight: 700,
    border: "none",
    borderRadius: 12,
    color: "#FFFFFF",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "inherit",
    textDecoration: "none",
    boxSizing: "border-box",
    transition: "opacity 0.15s ease, transform 0.15s ease",
  },
  btnArrow: {
    fontSize: 15,
    transition: "transform 0.15s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#FFFFFF",
    borderRadius: 20,
    border: "1px solid #E2E8F0",
    marginBottom: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 750,
    color: "#0F172A",
    margin: "0 0 8px",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
    maxWidth: 480,
    margin: "0 auto 20px",
    lineHeight: 1.6,
  },
  resetBtn: {
    padding: "10px 22px",
    fontSize: 13,
    fontWeight: 700,
    borderRadius: 10,
    background: "#0E6163",
    color: "#FFFFFF",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  howItWorksSection: {
    background: "#FFFFFF",
    borderRadius: 24,
    padding: "36px 32px",
    border: "1px solid #E2E8F0",
    marginBottom: 48,
  },
  howHeader: {
    textAlign: "center",
    marginBottom: 32,
  },
  howBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "4px 12px",
    borderRadius: 16,
    background: "rgba(14, 97, 99, 0.08)",
    color: "#0E6163",
    marginBottom: 8,
  },
  howTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#0F172A",
    margin: "0 0 8px",
  },
  howSub: {
    fontSize: 14,
    color: "#64748B",
    maxWidth: 620,
    margin: "0 auto",
    lineHeight: 1.6,
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
  },
  stepCard: {
    padding: 24,
    borderRadius: 16,
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
  },
  stepNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#0E6163",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 14,
  },
  stepCardTitle: {
    fontSize: 16,
    fontWeight: 750,
    color: "#0F172A",
    margin: "0 0 8px",
  },
  stepCardText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.6,
    margin: 0,
  },
  footer: {
    textAlign: "center",
    paddingTop: 24,
    borderTop: "1px solid #E2E8F0",
  },
  footerText: {
    fontSize: 12,
    color: "#94A3B8",
    maxWidth: 720,
    margin: "0 auto",
    lineHeight: 1.6,
  },
  // In-place active simulator mounting styles
  activeHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 16,
    borderBottom: "1px solid #E2E8F0",
  },
  backToLabsBtn: {
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 650,
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    background: "#FFFFFF",
    color: "#0F172A",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  activeBreadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    flexWrap: "wrap",
  },
  breadcrumbMuted: {
    color: "#64748B",
  },
  breadcrumbSep: {
    color: "#CBD5E1",
  },
  iconPill: {
    padding: "3px 10px",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 800,
  },
  breadcrumbCurrent: {
    fontWeight: 750,
    color: "#0F172A",
  },
  standaloneLink: {
    fontSize: 12,
    fontWeight: 600,
    color: "#0E6163",
    textDecoration: "none",
  },
  labCardWrapper: {
    background: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
    marginBottom: 40,
  },
  otherLabsSection: {
    marginTop: 40,
  },
  otherHeader: {
    marginBottom: 20,
  },
  otherTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0F172A",
    margin: "0 0 6px",
  },
  otherSub: {
    fontSize: 13.5,
    color: "#64748B",
    margin: 0,
  },
  otherGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 14,
  },
  otherCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 14,
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  },
  otherIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  otherCardTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  otherCardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0F172A",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  otherCardTag: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  otherCardArrow: {
    fontSize: 16,
    color: "#94A3B8",
  },
};
