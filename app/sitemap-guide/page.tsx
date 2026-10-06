"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Site Map Page
// app/sitemap-guide/page.tsx
// The complete visual guide to everything on FinanceHub
// Helps new students navigate without confusion
// ============================================================

type Badge = "free" | "pro" | "login";

interface SiteItem {
  name: string;
  desc: string;
  path?: string;
  badge: Badge;
  tags?: string[];
}

interface SiteSection {
  id: string;
  icon: string;
  color: string;
  name: string;
  tagline: string;
  intro: string;
  badge: Badge;
  cats: string[];
  items: SiteItem[];
}

const SECTIONS: SiteSection[] = [
  {
    id: "learn",
    icon: "📖",
    color: "#E1F5EE",
    name: "Learn — Structured Courses",
    tagline: "375+ lessons across 8 tracks, quizzes, case studies",
    intro: "The core of FinanceHub. Every lesson: concept → India-specific examples → quiz → key takeaways. Start any track free, upgrade for advanced content.",
    badge: "free",
    cats: ["all","learn","free","noauth"],
    items: [
      { name:"Explore all courses", desc:"Browse all 8 tracks. Filter by language, topic, level. See progress.", path:"/explore", badge:"free" },
      { name:"💰 Personal Finance", desc:"Budgeting, SIP, tax, insurance, home loan, retirement. 45+ lessons.", path:"/tracks/personal-finance", badge:"free", tags:["Beginner","Advanced"] },
      { name:"📈 Trading & Markets", desc:"Equity, F&O basics, IPOs, ratio analysis, value investing. 52+ lessons.", path:"/tracks/trading-markets", badge:"pro", tags:["Intermediate"] },
      { name:"📊 Technical Analysis", desc:"Charts, RSI, MACD, chart patterns, Fibonacci. 36+ lessons.", path:"/tracks/technical-analysis", badge:"pro", tags:["Intermediate"] },
      { name:"₿ Crypto & DeFi", desc:"Bitcoin, Ethereum, DeFi, India crypto tax. 28+ lessons.", path:"/tracks/crypto-defi", badge:"free", tags:["All levels"] },
      { name:"🏢 Corporate Finance", desc:"DCF, statements, M&A, ESOPs, Porter's 5 Forces. 38+ lessons.", path:"/tracks/corporate-finance", badge:"pro", tags:["Advanced"] },
      { name:"💱 Forex & Currencies", desc:"Exchange rates, RBI, FEMA, carry trade, hedging. 22+ lessons.", path:"/tracks/forex-currency", badge:"pro", tags:["Intermediate"] },
      { name:"🧠 Behavioral Finance", desc:"Biases, FOMO, herding, loss aversion, anchoring. 24+ lessons.", path:"/tracks/behavioral-finance", badge:"free", tags:["All levels"] },
      { name:"🇮🇳 हिंदी Finance", desc:"SIP, mutual funds, tax, share market, gold — all in Hindi. 23 lessons.", path:"/tracks/hindi-finance", badge:"free", tags:["Beginner"] },
      { name:"📋 Case Studies", desc:"25 real Indian financial stories — mistakes, wins, lessons.", path:"/case-studies", badge:"free" },
      { name:"📚 Finance Glossary", desc:"A–Z definitions for 200+ finance terms, simply explained.", path:"/glossary", badge:"free" },
      { name:"🗺️ Knowledge Map", desc:"Visual graph of how 100+ finance concepts connect.", path:"/knowledge-map", badge:"login" },
    ],
  },
  {
    id: "practice",
    icon: "🧮",
    color: "#EEF4FB",
    name: "Practice — Finance Lab",
    tagline: "9 interactive simulators. Simulated money, zero real risk.",
    intro: "Every simulator uses fictional amounts. Safe to experiment, learn by doing. Simulated trading is not real trading — no real money is ever involved.",
    badge: "free",
    cats: ["all","practice","free","noauth"],
    items: [
      { name:"📈 SIP Calculator", desc:"See compound interest work. Compare start ages and rates.", path:"/practice/sip", badge:"free" },
      { name:"🏠 EMI Calculator", desc:"Home, car, personal loan. See total interest paid over tenure.", path:"/practice/emi", badge:"free" },
      { name:"💰 Tax Calculator", desc:"Old vs new regime. Find which saves you more tax this year.", path:"/practice/tax", badge:"free" },
      { name:"📊 Compound Visualiser", desc:"Watch ₹5,000/month grow over 30 years interactively.", path:"/practice", badge:"free" },
      { name:"💎 Net Worth Tracker", desc:"Assets minus liabilities. Your real financial score over time.", path:"/practice/net-worth", badge:"login" },
      { name:"🎯 Goal Planner", desc:"Home, education, FIRE, retirement — inflation-adjusted SIP needed.", path:"/practice/goals", badge:"login" },
      { name:"🌅 Retirement Planner", desc:"Calculate corpus needed. See monthly SIP required.", path:"/practice", badge:"free" },
      { name:"₿ Crypto Paper Trade", desc:"Build a crypto portfolio with simulated money. Zero risk.", path:"/practice/crypto", badge:"pro" },
      { name:"💱 Forex Paper Trade", desc:"Trade currency pairs with simulated capital before going real.", path:"/practice/forex", badge:"pro" },
    ],
  },
  {
    id: "ai",
    icon: "🤖",
    color: "#F4F0FE",
    name: "AI Mentor — Ask Anything",
    tagline: "India-specific, source-cited, personalised to your learning",
    intro: "The AI knows your completed lessons and answers at your level. Every answer cites RBI, SEBI or AMFI. Never gives investment advice — only education.",
    badge: "free",
    cats: ["all","tools","free","noauth"],
    items: [
      { name:"Ask AI Mentor", desc:"5 questions/day free. 50/day on Pro. 200/day on Expert. Instant answers.", path:"/ai-tutor", badge:"free" },
      { name:"In-lesson AI tab", desc:"Ask AI about the exact lesson you're reading, right inside the lesson.", path:"/learn", badge:"free" },
      { name:"AI Exam Generator", desc:"AI creates custom quiz questions on any topic you choose.", badge:"pro" },
      { name:"AI Roadmap Planner", desc:"Tell AI your goal. It builds your personalised learning path.", badge:"pro" },
      { name:"AI Weakness Detector", desc:"AI finds your knowledge gaps and recommends what to study next.", badge:"pro" },
    ],
  },
  {
    id: "library",
    icon: "📚",
    color: "#FAEEDA",
    name: "Library — Videos, Books & Resources",
    tagline: "157+ curated videos, books, PDFs, research",
    intro: "All resources curated and organised by track. No ads, no affiliate links — only the best finance learning material from trusted sources.",
    badge: "free",
    cats: ["all","learn","free","noauth"],
    items: [
      { name:"▶️ Video Library", desc:"157+ YouTube playlists from CA Rachana Ranade, Zerodha Varsity, ET Money and more.", path:"/library", badge:"free" },
      { name:"📗 Book Library", desc:"30+ finance classics with summaries and key takeaways.", path:"/library", badge:"pro" },
      { name:"📄 PDFs & Guides", desc:"FinanceHub cheat sheets, formula cards, downloadable study notes.", path:"/library", badge:"pro" },
      { name:"🗞️ Research & Reports", desc:"RBI circulars, SEBI guidelines, AMFI data — organised by topic.", path:"/library", badge:"free" },
    ],
  },
  {
    id: "community",
    icon: "🏆",
    color: "#E1F5EE",
    name: "Community & Progress",
    tagline: "XP, leagues, streaks, certificates, Q&A",
    intro: "Every action earns XP. Weekly leagues reset every Monday. Certificates are verified with a unique ID and shareable directly to LinkedIn.",
    badge: "login",
    cats: ["all","tools"],
    items: [
      { name:"📊 Dashboard", desc:"Your learning home. Streak, XP, next lesson, recent completions.", path:"/dashboard", badge:"login" },
      { name:"🏆 Leaderboard", desc:"Weekly XP competition. Bronze → Silver → Gold → Diamond → Master.", path:"/leaderboard", badge:"login" },
      { name:"🎓 Certificates", desc:"Complete a track → earn verified certificate → share on LinkedIn.", path:"/certificates", badge:"pro" },
      { name:"🔄 Daily Review", desc:"Spaced repetition (SM-2 algorithm). 5 min/day keeps knowledge sharp.", path:"/review", badge:"login" },
      { name:"📝 My Notes", desc:"Write notes while learning. Cloud-synced across all devices.", path:"/notes", badge:"login" },
      { name:"💬 Lesson Q&A", desc:"Ask questions on any lesson. Community + staff answers.", badge:"login" },
      { name:"🎯 Badges", desc:"20 achievement badges — streaks, quiz scores, track completions.", badge:"login" },
    ],
  },
  {
    id: "account",
    icon: "⚙️",
    color: "#F1EFE8",
    name: "Your Account",
    tagline: "Profile, settings, subscription, notifications, privacy",
    intro: "Sign up in 30 seconds with Google or email. No credit card for the free plan. Cancel any paid plan anytime from Settings.",
    badge: "free",
    cats: ["all","tools"],
    items: [
      { name:"Sign Up Free", desc:"Google or email. No credit card. Immediate access to 100+ lessons.", path:"/signup", badge:"free" },
      { name:"Personalised Onboarding", desc:"3 questions → recommended track matched to your goal and level.", path:"/onboarding", badge:"free" },
      { name:"Settings", desc:"Theme (light/dark/sepia), font size, language, notifications, privacy.", path:"/settings", badge:"login" },
      { name:"Profile", desc:"Your stats, XP history, badges earned, completed lessons.", path:"/profile", badge:"login" },
      { name:"Pricing Plans", desc:"Free · Pro ₹499/month · Expert ₹999/month · 7-day trial · Cancel anytime.", path:"/pricing", badge:"free" },
      { name:"Certificate Verifier", desc:"Public page anyone can use to verify a FinanceHub certificate.", path:"/verify", badge:"free" },
    ],
  },
  {
    id: "careers",
    icon: "💼",
    color: "#EEF2FF",
    name: "Career Paths",
    tagline: "15 finance career roadmaps with tracks, skills and salary ranges",
    intro: "Each career path shows which FinanceHub tracks to complete, skills you'll gain, typical salary range in India, and market demand.",
    badge: "free",
    cats: ["all","learn","free","noauth"],
    items: [
      { name:"Financial Analyst", desc:"Financial modelling, DCF valuation, ratio analysis.", badge:"free" },
      { name:"Investment Advisor / MFD", desc:"Mutual funds, client advisory, AMFI regulations.", badge:"free" },
      { name:"Equity Research Analyst", desc:"Company analysis, sector reports, buy/sell thesis.", badge:"free" },
      { name:"Startup CFO / Finance Lead", desc:"Cash flow, fundraising, cap tables, unit economics.", badge:"free" },
      { name:"Forex / Currency Trader", desc:"Technical analysis, currency markets, FEMA.", badge:"free" },
      { name:"Crypto / Web3 Analyst", desc:"Blockchain, DeFi protocols, on-chain analysis.", badge:"free" },
      { name:"Finance Educator / Creator", desc:"Content creation, curriculum design, social media.", badge:"free" },
      { name:"CA / CFA / FRM Aspirant", desc:"Structured exam preparation across all tracks.", badge:"free" },
      { name:"Risk Analyst", desc:"Credit risk, market VaR, Basel III, stress testing.", badge:"free" },
      { name:"Compliance Officer", desc:"SEBI, RBI regulations, AML/KYC, PMLA.", badge:"free" },
      { name:"Wealth Manager / PMS", desc:"Portfolio construction, tax planning, HNI advisory.", badge:"free" },
      { name:"Insurance Advisor", desc:"Life, health insurance products, IRDAI regulations.", badge:"free" },
      { name:"Banking Relationship Manager", desc:"Credit analysis, loan structuring, KYC norms.", badge:"free" },
      { name:"Fintech Product Manager", desc:"Financial product design, regtech, payments infrastructure.", badge:"free" },
      { name:"Portfolio Manager (MF/PMS)", desc:"Fund management, performance attribution, investor reporting.", badge:"free" },
    ],
  },
];

const PERSONA_PATHS: Record<string, { title: string; steps: string[] }> = {
  beginner: {
    title: "Complete Beginner",
    steps: [
      "1. Take the onboarding quiz at /onboarding → get your recommended track",
      "2. Start the Personal Finance track → budgeting, savings, SIP, insurance",
      "3. Try the SIP and EMI calculators in Finance Lab",
      "4. Ask AI Mentor: \"What should I learn first about money?\"",
      "5. Earn your first badge and start a daily streak",
    ],
  },
  investor: {
    title: "Aspiring Investor",
    steps: [
      "1. Start with Personal Finance (mutual funds, SIP, tax) if not done",
      "2. Move to Trading & Markets → equity analysis, ratio analysis",
      "3. Study Behavioral Finance → understand the biases that cost investors money",
      "4. Practice with the Net Worth Tracker and Goal Planner",
      "5. Read case study: Priya's 10-year SIP journey",
    ],
  },
  trader: {
    title: "Active Trader",
    steps: [
      "1. Technical Analysis track → charts, RSI, MACD, Fibonacci, patterns",
      "2. Trading & Markets → F&O basics, options Greeks, futures",
      "3. Behavioral Finance → biases that hurt traders: FOMO, overconfidence",
      "4. Forex Paper Trading simulator → practice before real capital",
      "5. Study case study: Rahul's F&O disaster (avoid the same mistakes)",
    ],
  },
  founder: {
    title: "Startup Founder",
    steps: [
      "1. Corporate Finance track → financial statements, DCF, ESOPs",
      "2. Porter's Five Forces lesson → how to analyse your industry",
      "3. Case study: Arjun's startup cash flow crisis (avoid this)",
      "4. Case study: Karan's startup valuation mistake (raise at the right valuation)",
      "5. AI Mentor for startup-specific questions: \"What is a good LTV/CAC ratio?\"",
    ],
  },
  hindi: {
    title: "Hindi Learner",
    steps: [
      "1. हिंदी Finance track → /tracks/hindi-finance → 23 lessons in Hindi",
      "2. SIP क्या है? → Mutual Fund क्या है? → Compound Interest का जादू",
      "3. Income Tax lesson हिंदी में → F&O क्या है? → Gold investment",
      "4. Video Library → CA Rachana Ranade, Pranjal Kamra की Hindi videos",
      "5. AI Mentor से हिंदी में पूछें — answers in Hindi supported",
    ],
  },
  exam: {
    title: "Exam Aspirant (CA/CFA/FRM)",
    steps: [
      "1. Personal Finance + Trading & Markets tracks for broad coverage",
      "2. Corporate Finance track → DCF, financial statements, ratio analysis",
      "3. Technical Analysis track for market knowledge",
      "4. Daily Review (spaced repetition) → 5 min/day to retain concepts",
      "5. AI Exam Generator → custom quiz questions on any topic",
    ],
  },
};

const BADGE_CONFIG: Record<Badge, { label: string; bg: string; color: string }> = {
  free:  { label: "Free",  bg: "#E1F5EE", color: "#0F6E56" },
  pro:   { label: "Pro",   bg: "#F4F0FE", color: "#534AB7" },
  login: { label: "Login", bg: "#EEF4FB", color: "#185FA5" },
};

export default function SiteMapPage() {
  const [filter,     setFilter]     = useState("all");
  const [search,     setSearch]     = useState("");
  const [expanded,   setExpanded]   = useState<Set<string>>(new Set(["learn"]));
  const [persona,    setPersona]    = useState<string | null>(null);
  const [userTier,   setUserTier]   = useState<string>("free");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("profiles").select("subscription_tier").eq("id", user.id).single()
          .then(({ data }) => { if (data) setUserTier(data.subscription_tier); });
      }
    });
  }, []);

  const toggleSection = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sectionVisible = (s: SiteSection) => {
    if (filter !== "all" && !s.cats.includes(filter)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
           s.tagline.toLowerCase().includes(q) ||
           s.items.some(i => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
  };

  const itemVisible = (item: SiteItem) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
  };

  const FILTERS = [
    { id:"all",      label:"All sections" },
    { id:"free",     label:"Free only" },
    { id:"noauth",   label:"No login needed" },
    { id:"learn",    label:"Learn" },
    { id:"practice", label:"Practice" },
    { id:"tools",    label:"Tools" },
  ];

  const PERSONAS = [
    { id:"beginner", label:"🎓 Complete beginner" },
    { id:"investor", label:"📈 Aspiring investor" },
    { id:"trader",   label:"📊 Active trader" },
    { id:"founder",  label:"🚀 Startup founder" },
    { id:"hindi",    label:"🇮🇳 Hindi learner" },
    { id:"exam",     label:"📝 Exam aspirant" },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px 80px", fontFamily: "var(--font-ui,system-ui)" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1c2b3a", margin: "0 0 6px", letterSpacing: "-0.4px" }}>
          🗺️ FinanceHub Site Map
        </h1>
        <p style={{ fontSize: 15, color: "#718096", margin: 0 }}>
          Everything on FinanceHub — every page, every feature, what you can learn. Your guide to getting started without any confusion.
        </p>
      </div>

      {/* Persona quick-start */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          I am a…
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PERSONAS.map(p => (
            <button key={p.id}
              onClick={() => setPersona(persona === p.id ? null : p.id)}
              style={{
                padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                border: persona === p.id ? "1.5px solid #0E6163" : "1px solid #e2e8f0",
                background: persona === p.id ? "#F0F9F7" : "#fff",
                color: persona === p.id ? "#0E6163" : "#718096",
                cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Persona path card */}
      {persona && PERSONA_PATHS[persona] && (
        <div style={{
          background: "#F0F9F7", border: "1px solid #B7E4D8",
          borderRadius: 14, padding: "18px 22px", marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0E6163", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            📍 Your recommended path — {PERSONA_PATHS[persona].title}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PERSONA_PATHS[persona].steps.map((step, i) => (
              <div key={i} style={{ fontSize: 13, color: "#0B5A4E", lineHeight: 1.6, paddingLeft: 4 }}>
                {step}
              </div>
            ))}
          </div>
          <button onClick={() => setPersona(null)}
            style={{ marginTop: 12, fontSize: 12, color: "#0E6163", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            ✕ Clear path
          </button>
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search pages, features, tracks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: "1 1 220px", padding: "9px 14px",
            border: "1px solid #e2e8f0", borderRadius: 9,
            fontSize: 14, outline: "none", fontFamily: "inherit",
            background: "#fff", color: "#1c2b3a",
          }}
          onFocus={e => (e.target.style.borderColor = "#0E6163")}
          onBlur={e  => (e.target.style.borderColor = "#e2e8f0")}
        />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {FILTERS.map(f => (
          <button key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
              border: filter === f.id ? "1.5px solid #0E6163" : "1px solid #e2e8f0",
              background: filter === f.id ? "#F0F9F7" : "#fff",
              color: filter === f.id ? "#0E6163" : "#718096",
              cursor: "pointer", fontFamily: "inherit",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, padding: "10px 14px", background: "#f8f9fa", border: "1px solid #e2e8f0", borderRadius: 10, flexWrap: "wrap" }}>
        {Object.entries(BADGE_CONFIG).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#718096" }}>
            <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: v.bg, color: v.color }}>
              {v.label}
            </span>
            <span>{k === "free" ? "No payment" : k === "pro" ? "₹499/month" : "Account needed"}</span>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SECTIONS.map(section => {
          if (!sectionVisible(section)) return null;
          const isOpen = expanded.has(section.id) || !!search;
          const bc = BADGE_CONFIG[section.badge];
          const visibleItems = section.items.filter(itemVisible);

          return (
            <div key={section.id} style={{ border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", transition: "all 0.2s" }}>

              {/* Section header */}
              <div
                onClick={() => toggleSection(section.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 18px", cursor: "pointer",
                  background: "#fff",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f8f9fa")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: section.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {section.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1c2b3a" }}>{section.name}</div>
                  <div style={{ fontSize: 12, color: "#718096", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {section.tagline}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: bc.bg, color: bc.color }}>
                    {bc.label}
                  </span>
                  <span style={{ fontSize: 12, color: "#a0aec0", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▼</span>
                </div>
              </div>

              {/* Section body */}
              {isOpen && (
                <div style={{ borderTop: "1px solid #f0f0f0", padding: "14px 18px", background: "#fafafa" }}>
                  <p style={{ fontSize: 13, color: "#718096", lineHeight: 1.7, margin: "0 0 14px", paddingBottom: 12, borderBottom: "1px solid #f0f0f0" }}>
                    {section.intro}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 8 }}>
                    {visibleItems.map((item, i) => {
                      const ibc = BADGE_CONFIG[item.badge];
                      return (
                        <a
                          key={i}
                          href={item.path || "#"}
                          style={{
                            display: "block", padding: "12px 14px",
                            border: "1px solid #e2e8f0", borderRadius: 10,
                            background: "#fff", textDecoration: "none",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#0E6163"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(14,97,99,0.08)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a", lineHeight: 1.3 }}>{item.name}</span>
                            <span style={{ padding: "1px 7px", borderRadius: 9, fontSize: 10, fontWeight: 700, background: ibc.bg, color: ibc.color, flexShrink: 0, marginTop: 1 }}>
                              {ibc.label}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: "#718096", lineHeight: 1.6 }}>{item.desc}</div>
                          {item.tags && item.tags.length > 0 && (
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 7 }}>
                              {item.tags.map(tag => (
                                <span key={tag} style={{ padding: "1px 7px", borderRadius: 6, fontSize: 10, background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#a0aec0" }}>{tag}</span>
                              ))}
                            </div>
                          )}
                          {item.path && (
                            <div style={{ fontSize: 10, color: "#cbd5e0", marginTop: 6, fontFamily: "monospace" }}>{item.path}</div>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div style={{ marginTop: 28, padding: "16px 20px", background: "#f8f9fa", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, color: "#718096", lineHeight: 1.7 }}>
        <strong style={{ color: "#1c2b3a" }}>What's free forever:</strong> Personal Finance, Crypto, Behavioral Finance & Hindi tracks · SIP, EMI, Tax calculators · 5 AI questions/day · Video library · Glossary · Case studies · Community Q&A
        <br />
        <strong style={{ color: "#1c2b3a" }}>What's on Pro (₹499/month):</strong> All 8 tracks in full · Unlimited AI Mentor · All 9 simulators · Downloads · Verified certificates · Leaderboard leagues
        <br />
        <a href="/pricing" style={{ color: "#0E6163", fontWeight: 600, textDecoration: "none" }}>See full pricing →</a>
      </div>
    </div>
  );
}
