"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ForexPaperTrader = dynamic(() => import("@/components/trading/ForexPaperTrader"), { ssr: false });
const CryptoPaperTrader = dynamic(() => import("@/components/trading/CryptoPaperTrader"), { ssr: false });
const SipCalculator = dynamic(() => import("@/components/simulators/SipCalculator"), { ssr: false });
const EmiCalculator = dynamic(() => import("@/components/simulators/EmiCalculator"), { ssr: false });
const RetirementSimulator = dynamic(() => import("@/components/simulators/RetirementSimulator"), { ssr: false });
const TaxCalculator = dynamic(() => import("@/components/simulators/TaxCalculator"), { ssr: false });
const StartupCashFlow = dynamic(() => import("@/components/simulators/StartupCashFlowSimulator"), { ssr: false });

const SIMULATORS = [
  {
    id: "forex",
    icon: "FX",
    title: "Forex Paper Trading",
    desc: "Trade EUR/USD, GBP/USD, USD/INR and more with Rs. 1,00,000 fake money. Practice entries, exits, leverage, and stop-loss in real time.",
    tags: ["Trading", "Forex"],
    color: "#185FA5",
    bg: "#E6F1FB",
    badge: "Live prices",
    component: ForexPaperTrader,
    isNew: true,
  },
  {
    id: "crypto",
    icon: "BTC",
    title: "Crypto Paper Trading",
    desc: "Buy and sell Bitcoin, Ethereum, Solana and more with virtual money. Track portfolio, P&L, and trade history.",
    tags: ["Crypto", "Trading"],
    color: "#F7931A",
    bg: "#FEF7EC",
    badge: "Live prices",
    component: CryptoPaperTrader,
    isNew: true,
  },
  {
    id: "sip",
    icon: "SIP",
    title: "SIP & Investment Calculator",
    desc: "See how monthly SIPs compound over time. Compare returns across investment types with step-up option.",
    tags: ["Personal Finance", "Investing"],
    color: "#1D9E75",
    bg: "#E1F5EE",
    component: SipCalculator,
  },
  {
    id: "emi",
    icon: "EMI",
    title: "Loan & EMI Calculator",
    desc: "Calculate EMI for home, car, or personal loans. See true cost of borrowing and prepayment impact.",
    tags: ["Personal Finance", "Loans"],
    color: "#185FA5",
    bg: "#E6F1FB",
    component: EmiCalculator,
  },
  {
    id: "retirement",
    icon: "RET",
    title: "Retirement Planner",
    desc: "Find out if you have enough to retire. Calculate corpus needed and get a readiness score.",
    tags: ["Personal Finance", "Planning"],
    color: "#534AB7",
    bg: "#EEEDFE",
    component: RetirementSimulator,
  },
  {
    id: "tax",
    icon: "TAX",
    title: "Tax Calculator FY 2024-25",
    desc: "Compare old vs new income tax regime. Find which saves you more in seconds.",
    tags: ["Personal Finance", "Tax"],
    color: "#854F0B",
    bg: "#FAEEDA",
    component: TaxCalculator,
  },
  {
    id: "startup",
    icon: "RUN",
    title: "Startup Cash Flow Simulator",
    desc: "Model your startup runway, hiring plan, and break-even across three scenarios.",
    tags: ["Corporate Finance", "Founder"],
    color: "#993C1D",
    bg: "#FAECE7",
    component: StartupCashFlow,
  },
];

const CATEGORIES = ["All", "Trading", "Crypto", "Forex", "Personal Finance", "Corporate Finance"];

export default function SimulatorsPage() {
  const [active, setActive] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const filtered = SIMULATORS.filter((simulator) => filter === "All" || simulator.tags.includes(filter));
  const activeSimulator = active ? SIMULATORS.find((simulator) => simulator.id === active) : null;

  if (activeSimulator) {
    const ActiveComponent = activeSimulator.component;
    return (
      <div style={s.page}>
        <div style={s.activeHeader}>
          <button onClick={() => setActive(null)} style={s.backBtn} type="button">
            All simulators
          </button>
          <div style={s.activeTitle}>
            <span style={{ ...s.activeIcon, background: activeSimulator.color }}>{activeSimulator.icon}</span>
            {activeSimulator.title}
            {activeSimulator.isNew && <span style={s.newBadge}>LIVE</span>}
          </div>
        </div>

        <div style={s.simWrap}>
          <ActiveComponent />
        </div>

        <div style={s.quickSwitch}>
          <div style={s.quickTitle}>Switch simulator</div>
          <div style={s.quickGrid}>
            {SIMULATORS.filter((simulator) => simulator.id !== active).map((simulator) => (
              <button
                key={simulator.id}
                onClick={() => setActive(simulator.id)}
                style={{ ...s.quickCard, borderColor: `${simulator.color}30` }}
                type="button"
              >
                <span style={{ ...s.quickIcon, background: simulator.bg, color: simulator.color }}>{simulator.icon}</span>
                <span style={s.quickCardTitle}>{simulator.title}</span>
                {simulator.isNew && <span style={{ ...s.liveTag, color: simulator.color }}>LIVE</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <Link href="/dashboard" style={s.back}>
        Dashboard
      </Link>

      <div style={s.hero}>
        <div style={s.heroBadge}>Practice Hub</div>
        <h1 style={s.heroTitle}>Finance Simulators</h1>
        <p style={s.heroSub}>
          Apply what you learn immediately. Trade Forex and Crypto with fake money, plan retirement, compare tax regimes,
          and model startup finances in real time.
        </p>
        <div style={s.heroStats}>
          <HeroStat icon="FX" label="Forex paper trading" sub="Live prices, real mechanics" />
          <HeroStat icon="BTC" label="Crypto portfolio sim" sub="6 assets, live market" />
          <HeroStat icon="CALC" label="Finance calculators" sub="SIP, EMI, Tax, Retirement" />
        </div>
      </div>

      <section style={s.featuredSection}>
        <div style={s.featuredTitle}>Live Trading Practice</div>
        <div style={s.featuredGrid}>
          {SIMULATORS.filter((simulator) => simulator.isNew).map((simulator) => (
            <div key={simulator.id} style={{ ...s.featuredCard, borderColor: simulator.color }}>
              <div style={s.featuredTop}>
                <div style={{ ...s.featuredIcon, color: simulator.color, background: simulator.bg }}>{simulator.icon}</div>
                <div style={s.featuredBadge}>LIVE PRICES</div>
              </div>
              <h3 style={{ ...s.featuredName, color: simulator.color }}>{simulator.title}</h3>
              <p style={s.featuredDesc}>{simulator.desc}</p>
              <div style={s.featuredTags}>
                {simulator.tags.map((tag) => (
                  <span key={tag} style={{ ...s.tag, color: simulator.color, background: simulator.bg }}>
                    {tag}
                  </span>
                ))}
              </div>
              <button onClick={() => setActive(simulator.id)} style={{ ...s.launchBtn, background: simulator.color }} type="button">
                Launch {simulator.title}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={s.filterSection}>
        <div style={s.filterTitle}>Finance Calculators & Labs</div>
        <div style={s.filterRow}>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              style={{ ...s.filterBtn, ...(filter === category ? s.filterBtnActive : {}) }}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <div style={s.grid}>
        {filtered
          .filter((simulator) => !simulator.isNew)
          .map((simulator) => (
            <div key={simulator.id} style={s.card}>
              <div style={{ ...s.cardTop, background: simulator.bg }}>
                <div style={{ ...s.cardIconWrap, color: simulator.color }}>{simulator.icon}</div>
                <div style={s.cardTags}>
                  {simulator.tags.map((tag) => (
                    <span key={tag} style={{ ...s.tag, color: simulator.color, background: `${simulator.color}15` }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div style={s.cardBody}>
                <h3 style={s.cardTitle}>{simulator.title}</h3>
                <p style={s.cardDesc}>{simulator.desc}</p>
                <button onClick={() => setActive(simulator.id)} style={{ ...s.openBtn, background: simulator.color }} type="button">
                  Open lab
                </button>
              </div>
            </div>
          ))}
      </div>

      <div style={s.comingSoon}>
        <div style={s.csTitle}>Coming soon</div>
        <div style={s.csGrid}>
          {[
            { icon: "PORT", title: "Portfolio Allocator", desc: "Build and stress-test a diversified portfolio across equity, debt, gold, and real estate." },
            { icon: "RISK", title: "Risk Tolerance Quiz", desc: "Discover your investor psychology and get a personalised allocation recommendation." },
            { icon: "VAL", title: "Business Valuation Game", desc: "Value a fictional company with DCF and comparable multiples." },
            { icon: "EF", title: "Emergency Fund Simulator", desc: "Test how long you survive income shocks and sudden expenses." },
          ].map((item) => (
            <div key={item.title} style={s.csCard}>
              <div style={s.csIcon}>{item.icon}</div>
              <div style={s.csCardTitle}>{item.title}</div>
              <div style={s.csCardDesc}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroStat({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div style={s.heroStat}>
      <span style={s.heroStatIcon}>{icon}</span>
      <div>
        <div style={s.heroStatLabel}>{label}</div>
        <div style={s.heroStatSub}>{sub}</div>
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui,-apple-system,sans-serif", padding: "20px 22px 60px", maxWidth: 1060, margin: "0 auto" },
  back: { fontSize: 13, color: "#888", textDecoration: "none", display: "block", marginBottom: 14 },
  hero: { background: "linear-gradient(135deg,#0a0a0a,#1a1a2e)", borderRadius: 16, padding: "32px 28px", marginBottom: 24 },
  heroBadge: { fontSize: 11, fontWeight: 700, color: "#1D9E75", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 },
  heroTitle: { fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.6px" },
  heroSub: { fontSize: 14, color: "#aaa", lineHeight: 1.7, margin: "0 0 24px", maxWidth: 620 },
  heroStats: { display: "flex", gap: 20, flexWrap: "wrap" },
  heroStat: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 14px" },
  heroStatIcon: { minWidth: 36, color: "#1D9E75", fontSize: 11, fontWeight: 800 },
  heroStatLabel: { fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 },
  heroStatSub: { fontSize: 11, color: "#777" },
  featuredSection: { marginBottom: 28 },
  featuredTitle: { fontSize: 13, fontWeight: 700, color: "#0a0a0a", marginBottom: 12 },
  featuredGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 },
  featuredCard: { background: "#fff", border: "1.5px solid", borderRadius: 14, padding: 20 },
  featuredTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  featuredIcon: { width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 },
  featuredBadge: { fontSize: 9, fontWeight: 800, color: "#1D9E75", background: "#E1F5EE", padding: "3px 8px", borderRadius: 10, letterSpacing: ".08em" },
  featuredName: { fontSize: 18, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.4px" },
  featuredDesc: { fontSize: 13, color: "#666", lineHeight: 1.6, margin: "0 0 12px" },
  featuredTags: { display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" },
  tag: { fontSize: 10, fontWeight: 600, padding: "2px 9px", borderRadius: 12 },
  launchBtn: { width: "100%", padding: 12, fontSize: 13, fontWeight: 700, border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  filterSection: { marginBottom: 16 },
  filterTitle: { fontSize: 13, fontWeight: 700, color: "#0a0a0a", marginBottom: 10 },
  filterRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  filterBtn: { padding: "6px 14px", fontSize: 12, fontWeight: 500, border: "0.5px solid #ddd", borderRadius: 20, background: "#fff", color: "#666", cursor: "pointer", fontFamily: "system-ui" },
  filterBtnActive: { background: "#0a0a0a", color: "#fff", border: "0.5px solid #0a0a0a" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14, marginBottom: 28 },
  card: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 14, overflow: "hidden" },
  cardTop: { padding: "18px 16px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  cardIconWrap: { fontSize: 18, fontWeight: 800 },
  cardTags: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" },
  cardBody: { padding: "12px 16px 16px" },
  cardTitle: { fontSize: 14, fontWeight: 700, color: "#0a0a0a", margin: "0 0 6px" },
  cardDesc: { fontSize: 12, color: "#666", lineHeight: 1.6, margin: "0 0 14px" },
  openBtn: { width: "100%", padding: 10, fontSize: 12, fontWeight: 600, border: "none", borderRadius: 9, color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  activeHeader: { display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" },
  backBtn: { padding: "8px 14px", fontSize: 12, fontWeight: 500, border: "0.5px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer", fontFamily: "system-ui", color: "#555" },
  activeTitle: { fontWeight: 700, fontSize: 16, color: "#0a0a0a", display: "flex", alignItems: "center", gap: 8 },
  activeIcon: { color: "#fff", borderRadius: 8, padding: "4px 7px", fontSize: 10, fontWeight: 800 },
  newBadge: { fontSize: 9, fontWeight: 800, color: "#1D9E75", background: "#E1F5EE", padding: "2px 7px", borderRadius: 10, letterSpacing: ".08em" },
  simWrap: { marginBottom: 28 },
  quickSwitch: { marginTop: 20 },
  quickTitle: { fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 10 },
  quickGrid: { display: "flex", gap: 8, flexWrap: "wrap" },
  quickCard: { display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", border: "0.5px solid", borderRadius: 9, background: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  quickIcon: { minWidth: 34, textAlign: "center", borderRadius: 7, padding: "4px 6px", fontSize: 10, fontWeight: 800 },
  quickCardTitle: { fontSize: 12, fontWeight: 500, color: "#555" },
  liveTag: { fontSize: 9, fontWeight: 700, letterSpacing: ".06em" },
  comingSoon: { marginTop: 8 },
  csTitle: { fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 12 },
  csGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 },
  csCard: { background: "#fff", border: "0.5px dashed #ddd", borderRadius: 12, padding: "16px 14px", opacity: 0.75 },
  csIcon: { fontSize: 11, fontWeight: 800, color: "#888", marginBottom: 8 },
  csCardTitle: { fontWeight: 600, fontSize: 13, color: "#555", marginBottom: 5 },
  csCardDesc: { fontSize: 11, color: "#aaa", lineHeight: 1.5 },
};
