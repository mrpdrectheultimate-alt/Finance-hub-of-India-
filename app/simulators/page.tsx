"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// ============================================================
// FinanceHub — World-Class Finance Simulators & Practice Hub
// app/simulators/page.tsx
// Live Trading Terminals · 15 Financial Labs · In-Place Mounting · Full Suite
// ============================================================

// Dynamic Simulator & Trader Component Imports (lazy loaded)
const ForexPaperTrader = dynamic(() => import("@/components/trading/ForexPaperTrader"), { ssr: false });
const CryptoPaperTrader = dynamic(() => import("@/components/trading/CryptoPaperTrader"), { ssr: false });
const PaperTradingGame = dynamic(() => import("@/components/simulators/PaperTradingGame"), { ssr: false });
const SipCalculator = dynamic(() => import("@/components/simulators/SipCalculator"), { ssr: false });
const EmiCalculator = dynamic(() => import("@/components/simulators/EmiCalculator"), { ssr: false });
const RetirementSimulator = dynamic(() => import("@/components/simulators/RetirementSimulator"), { ssr: false });
const TaxCalculator = dynamic(() => import("@/components/simulators/TaxCalculator"), { ssr: false });
const StartupCashFlow = dynamic(() => import("@/components/simulators/StartupCashFlowSimulator"), { ssr: false });
const BudgetSimulator = dynamic(() => import("@/components/simulators/BudgetSimulator"), { ssr: false });

type ToolCategory =
  | "All"
  | "Live Trading"
  | "Personal Finance"
  | "Investing & Wealth"
  | "Loans & Debt"
  | "Tax & Planning"
  | "Corporate Finance";

type SimulatorItem = {
  id: string;
  code: string;
  icon: string;
  title: string;
  desc: string;
  category: ToolCategory;
  tags: string[];
  color: string;
  bg: string;
  isLiveTrading?: boolean;
  liveBadge?: string;
  ticker?: string;
  tickerPrice?: string;
  sparkline?: string;
  features?: string[];
  virtualCapital?: string;
  component?: any;
  href?: string;
};

// ─── Complete 15-Simulator Directory ─────────────────────────

const SIMULATORS: SimulatorItem[] = [
  // ── 1. Featured Live Trading Terminals ──
  {
    id: "forex",
    code: "FX",
    icon: "💱",
    title: "Forex Paper Trading Terminal",
    desc: "Trade EUR/USD, GBP/USD, USD/INR and major currency pairs with virtual funds. Practice entries, exits, leverage (up to 1:50), and stop-loss execution.",
    category: "Live Trading",
    tags: ["Trading", "Forex", "Live Feed"],
    color: "#0284C7",
    bg: "#E0F2FE",
    isLiveTrading: true,
    liveBadge: "LIVE MARKET PRICES",
    ticker: "USD / INR",
    tickerPrice: "₹83.48  +0.18%",
    sparkline: "0,28 15,24 30,26 45,18 60,22 75,14 90,19 105,10 120,12 135,7 150,11",
    features: [
      "Real-time USD/INR & EUR/USD rates",
      "Stop-loss, take-profit & margin leverage",
      "Comprehensive P&L trade history analytics",
    ],
    virtualCapital: "₹1,00,000 Virtual Capital",
    component: ForexPaperTrader,
    href: "/practice/forex",
  },
  {
    id: "crypto",
    code: "BTC",
    icon: "₿",
    title: "Crypto Paper Trading Terminal",
    desc: "Buy and sell Bitcoin, Ethereum, Solana, and top altcoins with simulated market orders. Track digital asset portfolio valuation, unrealized P&L, and trade orders.",
    category: "Live Trading",
    tags: ["Crypto", "Trading", "DeFi"],
    color: "#F7931A",
    bg: "#FFF4E5",
    isLiveTrading: true,
    liveBadge: "LIVE 24/7 MARKET",
    ticker: "BTC / INR",
    tickerPrice: "₹58,42,100  +2.45%",
    sparkline: "0,32 15,28 30,22 45,25 60,18 75,20 90,12 105,16 120,9 135,11 150,5",
    features: [
      "Live Bitcoin, Ethereum & Solana pairs",
      "Real-time portfolio valuation & P&L tracker",
      "Instant limit & market order execution",
    ],
    virtualCapital: "₹1,00,000 Virtual Capital",
    component: CryptoPaperTrader,
    href: "/practice/crypto",
  },
  {
    id: "stocks",
    code: "NSE",
    icon: "📈",
    title: "Stock Market Paper Trading (NSE/BSE)",
    desc: "Simulate Indian equity trading with real NIFTY 50 and Sensex stocks. Experience intraday and delivery orders with zero real money risk.",
    category: "Live Trading",
    tags: ["Trading", "Investing", "Equities"],
    color: "#185FA5",
    bg: "#E6F1FB",
    isLiveTrading: true,
    liveBadge: "NSE / BSE SIMULATOR",
    ticker: "NIFTY 50",
    tickerPrice: "24,850.30  +0.62%",
    sparkline: "0,25 15,22 30,19 45,21 60,15 75,12 90,16 105,11 120,8 135,10 150,4",
    features: [
      "Top Indian bluechip stocks (Reliance, TCS, HDFC)",
      "Portfolio diversification metrics & sectoral split",
      "Simulated brokerage & STT tax deduction",
    ],
    virtualCapital: "₹5,00,000 Virtual Capital",
    component: PaperTradingGame,
    href: "/practice/trading",
  },

  // ── 2. Interactive Finance Calculators & Labs ──
  {
    id: "sip",
    code: "SIP",
    icon: "🌱",
    title: "SIP & Compound Interest Lab",
    desc: "Visualize wealth accumulation through monthly SIPs. Model 10% annual step-ups, inflation adjustments, and cost of delay.",
    category: "Investing & Wealth",
    tags: ["Investing", "Wealth", "Compounding"],
    color: "#10B981",
    bg: "#ECFDF5",
    features: ["Step-up SIP", "Inflation-adjusted corpus", "Cost of delay analysis"],
    component: SipCalculator,
    href: "/practice/sip",
  },
  {
    id: "emi",
    code: "EMI",
    icon: "🏠",
    title: "Loan & EMI Calculator",
    desc: "Bank-grade reducing balance loan calculator with SVG Donut chart, prepayment accelerator, and full amortization schedule.",
    category: "Loans & Debt",
    tags: ["Loans", "Debt", "Personal Finance"],
    color: "#0F3D3E",
    bg: "#E6F3F3",
    features: ["SVG Donut split", "Prepayment savings engine", "Yearly amortization table"],
    component: EmiCalculator,
    href: "/practice/emi",
  },
  {
    id: "retirement",
    code: "RET",
    icon: "🏖️",
    title: "Retirement Readiness Planner",
    desc: "Calculate your retirement corpus required based on life expectancy, post-retirement monthly expenses, and inflation.",
    category: "Personal Finance",
    tags: ["Planning", "Retirement", "Personal Finance"],
    color: "#534AB7",
    bg: "#EEEDFE",
    features: ["Corpus needed calculator", "Readiness score (0-100%)", "Monthly shortfall target"],
    component: RetirementSimulator,
    href: "/practice/retirement",
  },
  {
    id: "tax",
    code: "TAX",
    icon: "💰",
    title: "Income Tax Calculator FY 2024-25",
    desc: "Compare the Old vs New Tax Regime side-by-side with Section 80C, 80D, and standard deduction optimizations.",
    category: "Tax & Planning",
    tags: ["Tax", "Planning", "Budgeting"],
    color: "#D97706",
    bg: "#FEF3C7",
    features: ["Old vs New comparison", "80C, 80D & HRA exemptions", "Net tax savings readout"],
    component: TaxCalculator,
    href: "/practice/tax",
  },
  {
    id: "startup",
    code: "RUN",
    icon: "🚀",
    title: "Startup Cash Flow & Runway Simulator",
    desc: "Model startup burn rate, hiring plans, revenue break-even timelines, and runway survival months across scenarios.",
    category: "Corporate Finance",
    tags: ["Corporate", "Founder", "Cash Flow"],
    color: "#DC2626",
    bg: "#FEE2E2",
    features: ["Runway survival months", "Headcount cost simulator", "Break-even sensitivity curve"],
    component: StartupCashFlow,
    href: "/practice/startup-cash-flow",
  },
  {
    id: "budget",
    code: "BUD",
    icon: "⚖️",
    title: "50/30/20 Budgeting Lab",
    desc: "Build an optimized personal budget allocating income across Needs (50%), Wants (30%), and Investments/Savings (20%).",
    category: "Personal Finance",
    tags: ["Budgeting", "Personal Finance"],
    color: "#0D9488",
    bg: "#CCFBF1",
    features: ["Dynamic category sliders", "50/30/20 rule diagnostics", "Actionable savings tips"],
    component: BudgetSimulator,
    href: "/practice/budget",
  },
  {
    id: "net-worth",
    code: "NW",
    icon: "📊",
    title: "Net Worth & Balance Sheet Tracker",
    desc: "Calculate total assets vs liabilities over time. Examine liquid cushion and debt-to-asset financial health ratios.",
    category: "Personal Finance",
    tags: ["Wealth", "Planning"],
    color: "#059669",
    bg: "#D1FAE5",
    features: ["Asset allocation breakdown", "Debt-to-asset ratio", "Emergency liquidity health"],
    href: "/practice/net-worth",
  },
  {
    id: "fire",
    code: "FIRE",
    icon: "🔥",
    title: "FIRE Early Retirement Calculator",
    desc: "Model Lean FIRE (20x), Standard FIRE (25x), and Fat FIRE (30x) targets with 4% safe withdrawal rules.",
    category: "Investing & Wealth",
    tags: ["FIRE", "Investing", "Wealth"],
    color: "#EA580C",
    bg: "#FFEDD5",
    features: ["Lean vs Fat FIRE targets", "Inflation-adjusted expenses", "Target retirement age"],
    href: "/practice/fire",
  },
  {
    id: "rebalancer",
    code: "BAL",
    icon: "⚖️",
    title: "Portfolio Asset Rebalancer",
    desc: "Detect portfolio drift across equity, debt, and gold. Generate concrete buy/sell plans to maintain target risk tolerance.",
    category: "Investing & Wealth",
    tags: ["Investing", "Asset Allocation"],
    color: "#7C3AED",
    bg: "#EDE9FE",
    features: ["Asset drift percentage", "Step-by-step rebalance plan", "Tax-efficient rebalancing"],
    href: "/practice/rebalancer",
  },
  {
    id: "goals",
    code: "GOL",
    icon: "🎯",
    title: "Goal-Based Wealth Planner",
    desc: "Map multi-decade milestones (Home purchase, Child higher education, Dream vacation) with inflation and exact SIP targets.",
    category: "Personal Finance",
    tags: ["Planning", "Goals"],
    color: "#0284C7",
    bg: "#E0F2FE",
    features: ["Inflation-adjusted target", "Exact monthly SIP required", "Multi-goal timeline chart"],
    href: "/practice/goals",
  },
  {
    id: "insurance",
    code: "INS",
    icon: "🛡️",
    title: "Human Life Value & Insurance Needs",
    desc: "Calculate your economic Human Life Value (HLV) to assess life insurance coverage gaps and evaluate family cover.",
    category: "Personal Finance",
    tags: ["Insurance", "Protection"],
    color: "#E11D48",
    bg: "#FFE4E6",
    features: ["HLV income multiplier", "Existing cover gap detector", "Family security score"],
    href: "/practice/insurance",
  },
  {
    id: "stress-test",
    code: "STR",
    icon: "⚡",
    title: "Financial Stress & Shock Tester",
    desc: "Simulate income loss, recession, job transition, and medical emergencies to test your liquidity survival runway.",
    category: "Personal Finance",
    tags: ["Planning", "Stress Test"],
    color: "#B91C1C",
    bg: "#FEE2E2",
    features: ["Survival runway months", "Emergency cash liquidity audit", "Discretionary cuts simulator"],
    href: "/practice/stress-test",
  },
];

const CATEGORIES: ToolCategory[] = [
  "All",
  "Live Trading",
  "Personal Finance",
  "Investing & Wealth",
  "Loans & Debt",
  "Tax & Planning",
  "Corporate Finance",
];

const UPCOMING_LABS = [
  {
    code: "PORT",
    icon: "👤",
    title: "Markowitz Portfolio Allocator",
    desc: "Efficient frontier optimizer generating maximum Sharpe ratio portfolios with historical covariance matrices.",
    eta: "Q4 2026",
  },
  {
    code: "RISK",
    icon: "🧠",
    title: "Risk Tolerance & Behavioral Profiler",
    desc: "Psychometric assessment discovering cognitive loss aversion biases and personalized asset risk appetite.",
    eta: "Q4 2026",
  },
  {
    code: "VAL",
    icon: "💎",
    title: "DCF & Multiples Valuation Lab",
    desc: "Interactive Discounted Cash Flow model with WACC sensitivity tables and EV/EBITDA peer comps.",
    eta: "Q1 2027",
  },
  {
    code: "DERIV",
    icon: "📊",
    title: "Options Payoff & Greek Visualizer",
    desc: "Real-time Black-Scholes options pricing calculator with Delta, Gamma, Theta, and Vega payoff charts.",
    eta: "Q1 2027",
  },
];

export default function SimulatorsPage() {
  const [active, setActive] = useState<string | null>(null);
  const [filter, setFilter] = useState<ToolCategory>("All");
  const [notifiedLabs, setNotifiedLabs] = useState<Record<string, boolean>>({});

  const toggleNotify = (code: string) => {
    setNotifiedLabs((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  // Filtered calculators
  const filteredCalculators = SIMULATORS.filter((sim) => {
    if (sim.isLiveTrading) return false;
    if (filter === "All") return true;
    return sim.category === filter;
  });

  const activeSimulator = active ? SIMULATORS.find((s) => s.id === active) : null;

  // ══════════════════════════════════════════════════════════════
  // IN-PLACE MOUNTED SIMULATOR VIEW (Zero Page Reload)
  // ══════════════════════════════════════════════════════════════
  if (activeSimulator && activeSimulator.component) {
    const ActiveComponent = activeSimulator.component;

    return (
      <div style={s.pageWrapper}>
        <div style={s.container}>
          {/* Breadcrumb Navigation Header */}
          <div style={s.activeHeader}>
            <button
              onClick={() => {
                setActive(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={s.backBtn}
              type="button"
            >
              ← Back to all simulators
            </button>
            <div style={s.activeBreadcrumb}>
              <span style={s.breadcrumbMuted}>Practice Hub</span>
              <span style={s.breadcrumbSep}>/</span>
              <span style={{ ...s.activeIconPill, background: `${activeSimulator.color}15`, color: activeSimulator.color }}>
                {activeSimulator.icon} {activeSimulator.code}
              </span>
              <span style={s.activeTitleText}>{activeSimulator.title}</span>
              {activeSimulator.isLiveTrading && (
                <span style={s.liveTagHeader}>● LIVE SIMULATION</span>
              )}
            </div>
          </div>

          {/* Mounted Component */}
          <div style={s.simWrap}>
            <ActiveComponent />
          </div>

          {/* Quick Switch Drawer */}
          <div style={s.quickSwitch}>
            <div style={s.quickSwitchHeader}>
              <div>
                <h3 style={s.quickTitle}>Switch to another simulator</h3>
                <p style={s.quickSub}>Test different scenarios without losing your place</p>
              </div>
              <span style={s.quickCountBadge}>{SIMULATORS.length - 1} other tools available</span>
            </div>

            <div style={s.quickGrid}>
              {SIMULATORS.filter((s) => s.id !== active).map((sItem) => (
                <button
                  key={sItem.id}
                  onClick={() => {
                    if (sItem.component) {
                      setActive(sItem.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else if (sItem.href) {
                      window.location.href = sItem.href;
                    }
                  }}
                  style={s.quickCard}
                  type="button"
                >
                  <span style={{ ...s.quickIcon, background: `${sItem.color}15`, color: sItem.color }}>
                    {sItem.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                    <div style={s.quickCardTitle}>{sItem.title}</div>
                    <div style={s.quickCardSub}>{sItem.category}</div>
                  </div>
                  {sItem.isLiveTrading ? (
                    <span style={{ ...s.liveTagSmall, color: sItem.color }}>LIVE</span>
                  ) : (
                    <span style={s.quickArrow}>→</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // MAIN PRACTICE HUB & SIMULATORS CATALOG
  // ══════════════════════════════════════════════════════════════
  const liveTradingSimulators = SIMULATORS.filter((s) => s.isLiveTrading);

  return (
    <div style={s.pageWrapper}>
      <div style={s.container}>

        {/* ── Top Breadcrumb Nav ── */}
        <div style={s.topNav}>
          <Link href="/dashboard" style={s.breadcrumbLink}>
            ← Back to Dashboard
          </Link>
          <span style={s.breadcrumbSep}>/</span>
          <span style={s.breadcrumbCurrent}>Practice Hub &amp; Interactive Simulators</span>
        </div>

        {/* ── 1. Elevated Hero Terminal Header ── */}
        <div style={s.hero}>
          <div style={s.heroGlow} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={s.heroBadgeRow}>
              <span style={s.heroBadge}>🎯 PRACTICE HUB &amp; SIMULATION TERMINAL</span>
            </div>
            <h1 style={s.heroTitle}>Finance Simulators &amp; Trading Labs</h1>
            <p style={s.heroSub}>
              Apply financial concepts immediately in realistic sandbox environments. Trade Forex, Crypto, and Indian stocks with live orderbook simulation, stress-test your retirement, analyze tax regimes, and calculate loan prepayments with ₹0 real money risk.
            </p>

            {/* Hero Quick Stat Cards */}
            <div style={s.heroStats}>
              <div style={s.heroStatCard}>
                <div style={s.heroStatIcon}>⚡</div>
                <div>
                  <div style={s.heroStatLabel}>Real-Time Paper Trading</div>
                  <div style={s.heroStatSub}>Forex, Crypto &amp; NSE Stocks with simulated orderbooks</div>
                </div>
              </div>

              <div style={s.heroStatCard}>
                <div style={s.heroStatIcon}>🧮</div>
                <div>
                  <div style={s.heroStatLabel}>15 Interactive Finance Labs</div>
                  <div style={s.heroStatSub}>SIP, EMI, Tax, Cash Flow, FIRE &amp; Asset Rebalancing</div>
                </div>
              </div>

              <div style={s.heroStatCard}>
                <div style={s.heroStatIcon}>🛡️</div>
                <div>
                  <div style={s.heroStatLabel}>Zero Financial Risk</div>
                  <div style={s.heroStatSub}>₹1,00,000 to ₹5,00,000 virtual balance provided</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Featured Live Trading Practice Section ── */}
        <section style={s.section}>
          <div style={s.sectionHeaderRow}>
            <div style={s.sectionTitleGroup}>
              <span style={{ fontSize: 22 }}>⚡</span>
              <div>
                <h2 style={s.sectionTitle}>Live Trading Terminals</h2>
                <p style={s.sectionSub}>Execute simulated market and limit orders with real price movements</p>
              </div>
            </div>
            <div style={s.liveStatusBadge}>
              <span style={s.pulseDot} />
              <span>LIVE SIMULATION ENGINE</span>
            </div>
          </div>

          <div style={s.tradingGrid}>
            {liveTradingSimulators.map((sim) => (
              <div
                key={sim.id}
                style={{
                  ...s.tradingCard,
                  borderColor: `${sim.color}40`,
                }}
              >
                {/* Top accent bar */}
                <div style={{ height: 4, background: sim.color }} />

                <div style={s.tradingCardBody}>
                  {/* Header Row */}
                  <div style={s.tradingCardHeader}>
                    <div
                      style={{
                        ...s.tradingIconBubble,
                        background: `${sim.color}15`,
                        borderColor: `${sim.color}30`,
                      }}
                    >
                      <span style={{ fontSize: 26 }}>{sim.icon}</span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          ...s.tradingLivePill,
                          background: "#ECFDF5",
                          color: "#059669",
                          borderColor: "#A7F3D0",
                        }}
                      >
                        <span style={s.greenPulseDot} />
                        {sim.liveBadge}
                      </span>
                      <div style={s.tradingCapitalPill}>{sim.virtualCapital}</div>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 style={s.tradingCardTitle}>{sim.title}</h3>
                  <p style={s.tradingCardDesc}>{sim.desc}</p>

                  {/* Real-time Ticker & Sparkline Preview */}
                  {sim.ticker && sim.sparkline && (
                    <div style={s.sparklineBox}>
                      <div style={s.sparklineHeader}>
                        <span style={s.tickerName}>{sim.ticker}</span>
                        <span style={s.tickerPrice}>{sim.tickerPrice}</span>
                      </div>
                      <svg viewBox="0 0 150 36" style={s.sparklineSvg}>
                        <polyline
                          points={sim.sparkline}
                          fill="none"
                          stroke={sim.color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Features List */}
                  {sim.features && (
                    <div style={s.tradingFeaturesList}>
                      {sim.features.map((feat) => (
                        <div key={feat} style={s.tradingFeatureItem}>
                          <span style={{ ...s.checkDot, background: `${sim.color}20`, color: sim.color }}>
                            ✓
                          </span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  {sim.component ? (
                    <button
                      onClick={() => {
                        setActive(sim.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      style={{ ...s.tradingLaunchBtn, background: sim.color }}
                      type="button"
                    >
                      ▶ Launch {sim.title}
                    </button>
                  ) : (
                    <Link
                      href={sim.href || "/practice"}
                      style={{ ...s.tradingLaunchLink, background: sim.color }}
                    >
                      ▶ Launch {sim.title}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Complete Calculators & Labs Section ── */}
        <section style={s.section}>
          <div style={s.sectionHeaderRow}>
            <div style={s.sectionTitleGroup}>
              <span style={{ fontSize: 22 }}>🧮</span>
              <div>
                <h2 style={s.sectionTitle}>Finance Calculators &amp; Labs</h2>
                <p style={s.sectionSub}>Comprehensive sandbox tools for wealth modeling, tax planning, and debt reduction</p>
              </div>
            </div>
            <span style={s.toolCountBadge}>{filteredCalculators.length} Tools Available</span>
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
                    ...s.filterBtn,
                    background: isActive ? "#0F3D3E" : "#FFFFFF",
                    color: isActive ? "#FFFFFF" : "#475569",
                    borderColor: isActive ? "#0F3D3E" : "#CBD5E1",
                    boxShadow: isActive ? "0 2px 6px rgba(15, 61, 62, 0.2)" : "none",
                  }}
                  type="button"
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Unified Calculator Grid (Equal Heights, No Empty Holes) */}
          <div style={s.calcGrid}>
            {filteredCalculators.map((sim) => (
              <div
                key={sim.id}
                style={{
                  ...s.calcCard,
                  borderColor: "#E2E8F0",
                }}
              >
                {/* Top Accent Strip */}
                <div style={{ height: 4, background: sim.color }} />

                <div style={s.calcCardBody}>
                  {/* Top Row: Icon + Code */}
                  <div style={s.calcCardTop}>
                    <div
                      style={{
                        ...s.calcIconWrap,
                        background: `${sim.color}15`,
                        color: sim.color,
                        borderColor: `${sim.color}30`,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{sim.icon}</span>
                    </div>
                    <span
                      style={{
                        ...s.calcCodeBadge,
                        background: `${sim.color}12`,
                        color: sim.color,
                        borderColor: `${sim.color}25`,
                      }}
                    >
                      {sim.code}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 style={s.calcCardTitle}>{sim.title}</h3>
                  <p style={s.calcCardDesc}>{sim.desc}</p>

                  {/* Key Highlights / Features */}
                  {sim.features && (
                    <div style={s.calcFeaturesRow}>
                      {sim.features.slice(0, 2).map((f) => (
                        <span key={f} style={s.calcFeatureChip}>
                          • {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom Action */}
                  <div style={s.calcCardActionWrap}>
                    {sim.component ? (
                      <button
                        onClick={() => {
                          setActive(sim.id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        style={{ ...s.openLabBtn, background: sim.color }}
                        type="button"
                      >
                        Launch Lab →
                      </button>
                    ) : (
                      <Link
                        href={sim.href || "/practice"}
                        style={{ ...s.openLabLink, background: sim.color }}
                      >
                        Open Lab →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Upcoming Labs & Roadmap Section ── */}
        <section style={s.section}>
          <div style={s.sectionHeaderRow}>
            <div style={s.sectionTitleGroup}>
              <span style={{ fontSize: 20 }}>🔜</span>
              <div>
                <h3 style={s.upcomingTitle}>Upcoming Experimental Labs</h3>
                <p style={s.upcomingSub}>Currently in research and quant development. Get notified when they go live.</p>
              </div>
            </div>
            <span style={s.roadmapBadge}>Roadmap 2026-27</span>
          </div>

          <div style={s.upcomingGrid}>
            {UPCOMING_LABS.map((item) => {
              const isNotified = notifiedLabs[item.code];
              return (
                <div key={item.code} style={s.upcomingCard}>
                  <div style={s.upcomingCardTop}>
                    <div style={s.upcomingIconBubble}>{item.icon}</div>
                    <span style={s.upcomingEtaBadge}>{item.eta}</span>
                  </div>

                  <span style={s.upcomingCodeTag}>{item.code}</span>
                  <h4 style={s.upcomingCardTitle}>{item.title}</h4>
                  <p style={s.upcomingCardDesc}>{item.desc}</p>

                  <button
                    type="button"
                    onClick={() => toggleNotify(item.code)}
                    style={{
                      ...s.notifyBtn,
                      background: isNotified ? "#ECFDF5" : "#F8FAFC",
                      color: isNotified ? "#059669" : "#475569",
                      borderColor: isNotified ? "#A7F3D0" : "#CBD5E1",
                    }}
                  >
                    {isNotified ? "✓ You will be notified" : "🔔 Notify Me When Live"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 5. How It Works 3-Step Educational Onboarding ── */}
        <section style={s.howItWorksCard}>
          <div style={s.howHeader}>
            <span style={s.howBadge}>LEARN BY DOING</span>
            <h3 style={s.howTitle}>How FinanceHub Simulators Work</h3>
            <p style={s.howSubtitle}>Three simple steps from financial confusion to confident execution</p>
          </div>

          <div style={s.howStepsGrid}>
            <div style={s.howStepCard}>
              <div style={s.stepNumberBubble}>1</div>
              <h4 style={s.stepTitle}>Choose Your Scenario</h4>
              <p style={s.stepDesc}>
                Select from real-time paper trading, debt prepayment simulations, tax optimization, or retirement models.
              </p>
            </div>

            <div style={s.howStepCard}>
              <div style={s.stepNumberBubble}>2</div>
              <h4 style={s.stepTitle}>Test with Virtual Capital</h4>
              <p style={s.stepDesc}>
                Experiment freely with ₹1,00,000+ virtual money. Adjust leverage, model prepayment amounts, or test emergency shocks.
              </p>
            </div>

            <div style={s.howStepCard}>
              <div style={s.stepNumberBubble}>3</div>
              <h4 style={s.stepTitle}>Master the Principles</h4>
              <p style={s.stepDesc}>
                Inspect reducing balance charts, understand compound step-up math, and transfer newfound confidence to real life.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// DESIGN TOKENS & STYLES
// Built for visual calmness, clear framing, and eye comfort
// ────────────────────────────────────────────────────────────

const s: Record<string, CSSProperties> = {
  pageWrapper: {
    minHeight: "100vh",
    background: "#F8FAFC",
    fontFamily: "var(--font-ui, system-ui, -apple-system, sans-serif)",
    color: "#0F172A",
  },
  container: {
    maxWidth: 1240,
    margin: "0 auto",
    padding: "24px 20px 80px",
  },

  /* TOP NAVIGATION */
  topNav: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  breadcrumbLink: {
    color: "#64748B",
    textDecoration: "none",
    fontWeight: 500,
  },
  breadcrumbSep: {
    color: "#CBD5E1",
  },
  breadcrumbCurrent: {
    color: "#0F172A",
    fontWeight: 700,
  },

  /* HERO TERMINAL */
  hero: {
    position: "relative",
    borderRadius: 18,
    background: "linear-gradient(135deg, #0A1628 0%, #0D282F 60%, #0F3D3E 100%)",
    padding: "36px 36px 32px",
    color: "#FFFFFF",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(10, 22, 40, 0.25)",
    marginBottom: 36,
  },
  heroGlow: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(0,0,0,0) 70%)",
    pointerEvents: "none",
  },
  heroBadgeRow: {
    marginBottom: 12,
  },
  heroBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 800,
    color: "#34D399",
    background: "rgba(52, 211, 153, 0.12)",
    border: "1px solid rgba(52, 211, 153, 0.3)",
    padding: "4px 12px",
    borderRadius: 9999,
    letterSpacing: "0.08em",
  },
  heroTitle: {
    fontSize: "clamp(1.9rem, 3.2vw, 2.5rem)",
    fontWeight: 800,
    color: "#FFFFFF",
    margin: "0 0 10px",
    letterSpacing: "-0.025em",
    lineHeight: 1.2,
  },
  heroSub: {
    fontSize: 14.5,
    color: "#CBD5E1",
    lineHeight: 1.65,
    maxWidth: 780,
    margin: "0 0 24px",
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  },
  heroStatCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255, 255, 255, 0.07)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    padding: "12px 16px",
    backdropFilter: "blur(6px)",
  },
  heroStatIcon: {
    fontSize: 22,
    flexShrink: 0,
  },
  heroStatLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  heroStatSub: {
    fontSize: 11.5,
    color: "#94A3B8",
    lineHeight: 1.4,
  },

  /* SECTION HEADERS */
  section: {
    marginBottom: 40,
  },
  sectionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 18,
    flexWrap: "wrap",
    gap: 12,
  },
  sectionTitleGroup: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0F172A",
    margin: "0 0 3px",
    letterSpacing: "-0.015em",
  },
  sectionSub: {
    fontSize: 13,
    color: "#64748B",
    margin: 0,
  },
  liveStatusBadge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    borderRadius: 9999,
    padding: "4px 12px",
    fontSize: 11,
    fontWeight: 800,
    color: "#059669",
    letterSpacing: "0.05em",
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#10B981",
  },
  toolCountBadge: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748B",
    background: "#E2E8F0",
    padding: "3px 10px",
    borderRadius: 9999,
  },

  /* ── LIVE TRADING CARDS GRID ── */
  tradingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: 20,
  },
  tradingCard: {
    background: "#FFFFFF",
    border: "1px solid",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  tradingCardBody: {
    padding: "22px 24px 24px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  tradingCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  tradingIconBubble: {
    width: 52,
    height: 52,
    borderRadius: 14,
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tradingLivePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid",
    borderRadius: 9999,
    padding: "3px 9px",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.06em",
    marginBottom: 4,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#10B981",
  },
  tradingCapitalPill: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "#475569",
  },
  tradingCardTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0F172A",
    margin: "0 0 6px",
    letterSpacing: "-0.015em",
  },
  tradingCardDesc: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.55,
    margin: "0 0 16px",
  },
  sparklineBox: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 16,
  },
  sparklineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  tickerName: {
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
    fontFamily: "monospace",
  },
  tickerPrice: {
    fontSize: 12.5,
    fontWeight: 800,
    color: "#059669",
    fontFamily: "monospace",
  },
  sparklineSvg: {
    width: "100%",
    height: 36,
  },
  tradingFeaturesList: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    marginBottom: 20,
    flex: 1,
  },
  tradingFeatureItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12.5,
    color: "#334155",
  },
  checkDot: {
    width: 17,
    height: 17,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 800,
    flexShrink: 0,
  },
  tradingLaunchBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: 10,
    border: "none",
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: 750,
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    transition: "opacity 0.15s ease",
  },
  tradingLaunchLink: {
    display: "block",
    width: "100%",
    padding: "12px",
    borderRadius: 10,
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: 750,
    textDecoration: "none",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    boxSizing: "border-box",
  },

  /* ── CALCULATOR FILTER PILLS ── */
  filterRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  filterBtn: {
    padding: "7px 15px",
    fontSize: 12.5,
    fontWeight: 600,
    border: "1px solid",
    borderRadius: 9999,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },

  /* ── CALCULATOR GRID ── */
  calcGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 18,
  },
  calcCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.15s ease",
  },
  calcCardBody: {
    padding: "16px 18px 18px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  calcCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  calcIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 11,
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  calcCodeBadge: {
    fontSize: 10.5,
    fontWeight: 800,
    padding: "3px 8px",
    borderRadius: 6,
    border: "1px solid",
    letterSpacing: "0.04em",
  },
  calcCardTitle: {
    fontSize: 15.5,
    fontWeight: 750,
    color: "#0F172A",
    margin: "0 0 6px",
    letterSpacing: "-0.01em",
  },
  calcCardDesc: {
    fontSize: 12.5,
    color: "#64748B",
    lineHeight: 1.5,
    margin: "0 0 12px",
    flex: 1,
  },
  calcFeaturesRow: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginBottom: 16,
  },
  calcFeatureChip: {
    fontSize: 11,
    color: "#475569",
    fontWeight: 500,
  },
  calcCardActionWrap: {
    marginTop: "auto",
    paddingTop: 10,
    borderTop: "1px solid #F1F5F9",
  },
  openLabBtn: {
    width: "100%",
    padding: "9px",
    borderRadius: 8,
    border: "none",
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "center",
  },
  openLabLink: {
    display: "block",
    width: "100%",
    padding: "9px",
    borderRadius: 8,
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: 700,
    textDecoration: "none",
    textAlign: "center",
    boxSizing: "border-box",
  },

  /* ── UPCOMING LABS ── */
  upcomingTitle: {
    fontSize: 17,
    fontWeight: 750,
    color: "#0F172A",
    margin: "0 0 3px",
  },
  upcomingSub: {
    fontSize: 12.5,
    color: "#64748B",
    margin: 0,
  },
  roadmapBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: "#475569",
    background: "#E2E8F0",
    padding: "3px 9px",
    borderRadius: 6,
  },
  upcomingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
  },
  upcomingCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 14,
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
  },
  upcomingCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  upcomingIconBubble: {
    fontSize: 22,
  },
  upcomingEtaBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: "#64748B",
    background: "#F1F5F9",
    padding: "2px 7px",
    borderRadius: 4,
  },
  upcomingCodeTag: {
    fontSize: 10,
    fontWeight: 800,
    color: "#94A3B8",
    letterSpacing: "0.06em",
    marginBottom: 2,
  },
  upcomingCardTitle: {
    fontSize: 14.5,
    fontWeight: 700,
    color: "#0F172A",
    margin: "0 0 6px",
  },
  upcomingCardDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 1.5,
    margin: "0 0 16px",
    flex: 1,
  },
  notifyBtn: {
    width: "100%",
    padding: "8px",
    borderRadius: 8,
    border: "1px solid",
    fontSize: 12,
    fontWeight: 650,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },

  /* ── HOW IT WORKS ── */
  howItWorksCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 18,
    padding: "36px 32px",
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.02)",
    marginTop: 20,
  },
  howHeader: {
    textAlign: "center",
    marginBottom: 28,
  },
  howBadge: {
    display: "inline-block",
    fontSize: 10.5,
    fontWeight: 800,
    color: "#0E6163",
    background: "#E6F3F3",
    padding: "3px 10px",
    borderRadius: 9999,
    letterSpacing: "0.08em",
    marginBottom: 8,
  },
  howTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0F172A",
    margin: "0 0 6px",
    letterSpacing: "-0.015em",
  },
  howSubtitle: {
    fontSize: 14,
    color: "#64748B",
    margin: 0,
  },
  howStepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 24,
  },
  howStepCard: {
    textAlign: "center",
    padding: "12px",
  },
  stepNumberBubble: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#0F3D3E",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 800,
    margin: "0 auto 14px",
    boxShadow: "0 4px 10px rgba(15, 61, 62, 0.2)",
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 750,
    color: "#0F172A",
    margin: "0 0 6px",
  },
  stepDesc: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 1.55,
    margin: 0,
  },

  /* ── IN-PLACE MOUNTED COMPONENT STYLES ── */
  activeHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },
  backBtn: {
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    border: "1px solid #CBD5E1",
    borderRadius: 8,
    background: "#FFFFFF",
    cursor: "pointer",
    fontFamily: "inherit",
    color: "#334155",
  },
  activeBreadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
  },
  breadcrumbMuted: {
    color: "#64748B",
  },
  activeCategoryTag: {
    fontSize: 11,
    fontWeight: 700,
    color: "#64748B",
    background: "#F1F5F9",
    padding: "2px 7px",
    borderRadius: 4,
  },
  activeIconPill: {
    padding: "3px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 800,
  },
  activeTitleText: {
    fontWeight: 750,
    color: "#0F172A",
  },
  liveTagHeader: {
    fontSize: 10,
    fontWeight: 800,
    color: "#059669",
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    padding: "2px 8px",
    borderRadius: 9999,
  },
  simWrap: {
    marginBottom: 40,
  },
  quickSwitch: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    padding: "20px 24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  quickSwitchHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: 750,
    color: "#0F172A",
    margin: "0 0 2px",
  },
  quickSub: {
    fontSize: 12.5,
    color: "#64748B",
    margin: 0,
  },
  quickCountBadge: {
    fontSize: 11.5,
    color: "#64748B",
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 10,
  },
  quickCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    border: "1px solid #E2E8F0",
    borderRadius: 9,
    background: "#FFFFFF",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },
  quickIcon: {
    minWidth: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    fontSize: 13,
    flexShrink: 0,
  },
  quickCardTitle: {
    fontSize: 12.5,
    fontWeight: 650,
    color: "#0F172A",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  quickCardSub: {
    fontSize: 10.5,
    color: "#64748B",
  },
  liveTagSmall: {
    fontSize: 9,
    fontWeight: 800,
    padding: "2px 5px",
    background: "#F1F5F9",
    borderRadius: 4,
  },
  quickArrow: {
    fontSize: 12,
    color: "#94A3B8",
  },
};
