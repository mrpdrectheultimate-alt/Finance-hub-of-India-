"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const BudgetSimulator = dynamic(() => import("@/components/simulators/BudgetSimulator"), { ssr: false });
const EmiCalculator = dynamic(() => import("@/components/simulators/EmiCalculator"), { ssr: false });
const PaperTradingGame = dynamic(() => import("@/components/simulators/PaperTradingGame"), { ssr: false });
const CryptoPaperTrader = dynamic(() => import("@/components/trading/CryptoPaperTrader"), { ssr: false });
const RetirementSimulator = dynamic(() => import("@/components/simulators/RetirementSimulator"), { ssr: false });
const SipCalculator = dynamic(() => import("@/components/simulators/SipCalculator"), { ssr: false });
const StartupCashFlow = dynamic(() => import("@/components/simulators/StartupCashFlowSimulator"), { ssr: false });
const TaxCalculator = dynamic(() => import("@/components/simulators/TaxCalculator"), { ssr: false });

const LABS = [
  {
    id: "sip",
    icon: "SIP",
    title: "SIP & Investment Calculator",
    desc: "See how monthly SIPs grow with compound interest. Compare returns across investment types.",
    color: "#1D9E75",
    bg: "#E1F5EE",
    tags: ["Personal Finance", "Investing"],
    component: SipCalculator,
  },
  {
    id: "emi",
    icon: "EMI",
    title: "Loan & EMI Calculator",
    desc: "Calculate EMI for home, car, or personal loans. See the true cost of borrowing and prepayment impact.",
    color: "#185FA5",
    bg: "#E6F1FB",
    tags: ["Personal Finance", "Loans"],
    component: EmiCalculator,
  },
  {
    id: "retirement",
    icon: "RET",
    title: "Retirement Planner",
    desc: "Find out if you will have enough to retire. Calculate corpus needed and readiness score.",
    color: "#534AB7",
    bg: "#EEEDFE",
    tags: ["Personal Finance", "Planning"],
    component: RetirementSimulator,
  },
  {
    id: "tax",
    icon: "TAX",
    title: "Tax Calculator",
    desc: "Compare old vs new income tax regime for FY 2024-25. Find which saves you more.",
    color: "#854F0B",
    bg: "#FAEEDA",
    tags: ["Personal Finance", "Tax"],
    component: TaxCalculator,
  },
  {
    id: "startup",
    icon: "RUN",
    title: "Startup Cash Flow Simulator",
    desc: "Model your startup runway, hiring plan, and path to break-even across multiple scenarios.",
    color: "#993C1D",
    bg: "#FAECE7",
    tags: ["Corporate Finance", "Founder"],
    component: StartupCashFlow,
  },
  {
    id: "budget",
    icon: "BUD",
    title: "Budget Simulator",
    desc: "Build your personal budget with the 50/30/20 rule. See where your money actually goes.",
    color: "#1D9E75",
    bg: "#E1F5EE",
    tags: ["Personal Finance", "Budgeting"],
    component: BudgetSimulator,
  },
  {
    id: "trading",
    icon: "TRD",
    title: "Paper Trading Game",
    desc: "Trade Indian stocks with a virtual portfolio. Practise order decisions with zero real money risk.",
    color: "#185FA5",
    bg: "#E6F1FB",
    tags: ["Trading", "Investing"],
    component: PaperTradingGame,
  },
  {
    id: "crypto",
    icon: "CRY",
    title: "Crypto Paper Trading",
    desc: "Practise Bitcoin, Ethereum, and altcoin trades with fake money and simulated live prices.",
    color: "#F7931A",
    bg: "#FFF4E5",
    tags: ["Trading", "Crypto"],
    component: CryptoPaperTrader,
  },
];

const COMING_SOON = [
  {
    icon: "PORT",
    title: "Portfolio Simulator",
    desc: "Allocate across equity, debt, gold, and real estate, then see 10-year projections.",
  },
  {
    icon: "CRYP",
    title: "Crypto Risk Simulator",
    desc: "See what sharp drawdowns do to a portfolio. Risk education at its best.",
  },
  {
    icon: "VAL",
    title: "Business Valuation Game",
    desc: "Value a fictional company using DCF and comparable multiples.",
  },
  {
    icon: "EF",
    title: "Emergency Fund Simulator",
    desc: "Test how long you can survive income shocks, medical bills, and sudden repairs.",
  },
];

export default function PracticePage() {
  const [activeLab, setActiveLab] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const categories = [
    "All",
    "Personal Finance",
    "Investing",
    "Loans",
    "Tax",
    "Trading",
    "Crypto",
    "Corporate Finance",
    "Founder",
  ];

  const filteredLabs = LABS.filter((lab) => filter === "All" || lab.tags.includes(filter));
  const activeLabConfig = activeLab ? LABS.find((lab) => lab.id === activeLab) : null;
  const ActiveComponent = activeLabConfig?.component;

  if (activeLabConfig && ActiveComponent) {
    return (
      <div style={s.page}>
        <div style={s.activeHeader}>
          <button onClick={() => setActiveLab(null)} style={s.backBtn} type="button">
            Back to all labs
          </button>
          <div style={s.activeTitle}>
            <span style={{ ...s.titleMark, background: activeLabConfig.color }}>{activeLabConfig.icon}</span>
            {activeLabConfig.title}
          </div>
        </div>

        <div style={s.labWrap}>
          <ActiveComponent />
        </div>

        <div style={s.otherLabs}>
          <div style={s.otherTitle}>Other finance labs</div>
          <div style={s.otherGrid}>
            {LABS.filter((lab) => lab.id !== activeLab).map((lab) => (
              <button
                key={lab.id}
                onClick={() => setActiveLab(lab.id)}
                style={{ ...s.otherCard, borderColor: `${lab.color}30` }}
                type="button"
              >
                <span style={{ ...s.otherIcon, background: lab.bg, color: lab.color }}>{lab.icon}</span>
                <span style={s.otherCardTitle}>{lab.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <Link href="/dashboard" style={s.back}>
          Back to dashboard
        </Link>
        <h1 style={s.title}>Finance Labs</h1>
        <p style={s.sub}>Interactive simulators to practise real financial decisions, not just read about them.</p>
      </div>

      <div style={s.filterRow}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{ ...s.filterBtn, ...(filter === cat ? s.filterBtnActive : {}) }}
            type="button"
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={s.grid}>
        {filteredLabs.map((lab) => (
          <div key={lab.id} style={s.card}>
            <div style={{ ...s.cardTop, background: lab.bg }}>
              <div style={{ ...s.cardIcon, color: lab.color }}>{lab.icon}</div>
              <div style={s.cardTags}>
                {lab.tags.map((tag) => (
                  <span key={tag} style={{ ...s.tag, color: lab.color, background: `${lab.color}15` }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div style={s.cardBody}>
              <h3 style={s.cardTitle}>{lab.title}</h3>
              <p style={s.cardDesc}>{lab.desc}</p>
              <button onClick={() => setActiveLab(lab.id)} style={{ ...s.openBtn, background: lab.color }} type="button">
                Open lab
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={s.comingSoon}>
        <div style={s.comingSoonTitle}>Coming soon</div>
        <div style={s.comingSoonGrid}>
          {COMING_SOON.map((item) => (
            <div key={item.title} style={s.csCard}>
              <span style={s.csIcon}>{item.icon}</span>
              <div style={s.csTitle}>{item.title}</div>
              <div style={s.csDesc}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-page, #fafafa)",
    fontFamily: "system-ui,-apple-system,sans-serif",
    padding: "24px 24px 60px",
  },
  header: { maxWidth: 980, margin: "0 auto 24px" },
  back: { fontSize: 13, color: "var(--text-muted, #888)", textDecoration: "none", display: "block", marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 750, letterSpacing: "-0.6px", color: "var(--text-primary, #0a0a0a)", margin: "0 0 8px" },
  sub: { fontSize: 14, color: "var(--text-muted, #888)", margin: 0 },
  filterRow: { display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 980, margin: "0 auto 20px" },
  filterBtn: {
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 500,
    border: "0.5px solid var(--border, #ddd)",
    borderRadius: 20,
    background: "var(--bg-card, #fff)",
    color: "var(--text-secondary, #666)",
    cursor: "pointer",
    fontFamily: "system-ui",
  },
  filterBtnActive: { background: "var(--text-primary, #0a0a0a)", color: "var(--bg-card, #fff)", border: "0.5px solid var(--text-primary, #0a0a0a)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, maxWidth: 980, margin: "0 auto 32px" },
  card: { background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-card, none)" },
  cardTop: { minHeight: 92, padding: "20px 18px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  cardIcon: { fontSize: 22, fontWeight: 800, letterSpacing: 0 },
  cardTags: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" },
  tag: { fontSize: 10, fontWeight: 650, padding: "2px 8px", borderRadius: 10 },
  cardBody: { padding: "14px 18px 18px" },
  cardTitle: { fontSize: 15, fontWeight: 750, color: "var(--text-primary, #0a0a0a)", margin: "0 0 8px", letterSpacing: "-0.2px" },
  cardDesc: { fontSize: 13, color: "var(--text-secondary, #666)", lineHeight: 1.6, margin: "0 0 16px" },
  openBtn: { display: "block", width: "100%", padding: "10px", fontSize: 13, fontWeight: 650, border: "none", borderRadius: 9, color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  activeHeader: { display: "flex", alignItems: "center", gap: 14, maxWidth: 1180, margin: "0 auto 20px", flexWrap: "wrap" },
  backBtn: { padding: "8px 14px", fontSize: 13, fontWeight: 550, border: "0.5px solid var(--border, #ddd)", borderRadius: 8, background: "var(--bg-card, #fff)", cursor: "pointer", fontFamily: "system-ui", color: "var(--text-secondary, #555)" },
  activeTitle: { display: "flex", alignItems: "center", gap: 10, fontWeight: 750, fontSize: 16, color: "var(--text-primary, #0a0a0a)" },
  titleMark: { color: "#fff", borderRadius: 8, padding: "5px 7px", fontSize: 11, fontWeight: 800 },
  labWrap: { marginBottom: 32 },
  otherLabs: { maxWidth: 980, margin: "0 auto" },
  otherTitle: { fontSize: 13, fontWeight: 650, color: "var(--text-muted, #888)", marginBottom: 12 },
  otherGrid: { display: "flex", gap: 8, flexWrap: "wrap" },
  otherCard: { display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", border: "0.5px solid", borderRadius: 9, background: "var(--bg-card, #fff)", cursor: "pointer", fontFamily: "system-ui" },
  otherIcon: { minWidth: 32, textAlign: "center", borderRadius: 7, padding: "4px 5px", fontSize: 10, fontWeight: 800 },
  otherCardTitle: { fontSize: 12, fontWeight: 550, color: "var(--text-secondary, #555)" },
  comingSoon: { maxWidth: 980, margin: "0 auto" },
  comingSoonTitle: { fontSize: 12, fontWeight: 700, color: "var(--text-muted, #aaa)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14 },
  comingSoonGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 },
  csCard: { background: "var(--bg-card, #fff)", border: "0.5px dashed var(--border, #ddd)", borderRadius: 12, padding: "16px 14px", opacity: 0.75 },
  csIcon: { display: "inline-block", fontSize: 11, fontWeight: 800, color: "var(--text-muted, #888)", background: "var(--bg-surface, #f5f5f3)", borderRadius: 7, padding: "4px 7px", marginBottom: 8 },
  csTitle: { fontWeight: 650, fontSize: 13, color: "var(--text-secondary, #555)", marginBottom: 5 },
  csDesc: { fontSize: 12, color: "var(--text-muted, #aaa)", lineHeight: 1.5 },
};
