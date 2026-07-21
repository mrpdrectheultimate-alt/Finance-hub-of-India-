"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

type Question = {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
  company_type: string | null;
  tags: string[];
  upvotes: number;
  saved: boolean;
};

type View = "questions" | "careers" | "certifications";

const CATEGORIES = [
  { id: "all", label: "All questions" },
  { id: "investment-banking", label: "Investment Banking" },
  { id: "pe-vc", label: "PE / VC" },
  { id: "trading", label: "Trading" },
  { id: "fpa", label: "FP&A / Corp Finance" },
  { id: "general", label: "General Finance" },
];

const DIFFICULTIES = ["all", "easy", "medium", "hard"];

const CAREER_PATHS = [
  {
    title: "Investment Banking Analyst",
    color: "#185FA5",
    bg: "#E6F1FB",
    time: "2-3 years to senior analyst",
    steps: [
      "Graduate with finance, economics, accounting, or engineering background.",
      "Build financial modelling skills: DCF, trading comps, transaction comps, LBO basics.",
      "Network through alumni, LinkedIn, internships, and boutique advisory firms.",
      "Apply for analyst roles in investment banks, Big 4 deal advisory, and valuation teams.",
      "Develop strong Excel, PowerPoint, accounting, and client communication skills.",
      "Target early analyst compensation in India: Rs. 8-15L CTC, varying widely by firm.",
    ],
    skills: ["DCF and LBO modelling", "Excel and PowerPoint", "Accounting", "Industry research", "Client communication"],
  },
  {
    title: "Equity Research Analyst",
    color: "#534AB7",
    bg: "#EEEDFE",
    time: "3-5 years to lead analyst",
    steps: [
      "Develop strong accounting, valuation, and report-writing skills.",
      "Pursue CFA if targeting institutional research roles.",
      "Start at sell-side research, buy-side research, PMS, AMC, or advisory firms.",
      "Cover a sector deeply and build company models.",
      "Build a track record of thoughtful calls and clear investment reasoning.",
    ],
    skills: ["Company modelling", "Sector expertise", "Writing", "Valuation", "Earnings analysis"],
  },
  {
    title: "Startup Finance / CFO Track",
    color: "#1D9E75",
    bg: "#E1F5EE",
    time: "5-8 years to CFO path",
    steps: [
      "Join a startup as finance analyst, finance manager, controller, or founder's office analyst.",
      "Own financial models, MIS, cash flow, and fundraising decks.",
      "Learn cap tables, term sheets, due diligence, and investor reporting.",
      "Take ownership of budgets, unit economics, and runway planning.",
      "Progress toward VP Finance or CFO as the company scales.",
    ],
    skills: ["Unit economics", "Investor relations", "Cap tables", "Fundraising", "Cash flow control"],
  },
  {
    title: "Trading / Fund Management",
    color: "#854F0B",
    bg: "#FAEEDA",
    time: "3-7 years to portfolio manager",
    steps: [
      "Build a foundation in markets, probability, statistics, and risk.",
      "Learn Python, backtesting, derivatives, and portfolio construction.",
      "Start at a proprietary trading desk, AMC, hedge fund, broker, or research desk.",
      "Develop a repeatable strategy with clear risk controls.",
      "Build a track record of disciplined alpha generation.",
    ],
    skills: ["Python or R", "Options and derivatives", "Risk management", "Backtesting", "Portfolio construction"],
  },
];

const CERTIFICATIONS = [
  {
    name: "CFA (Chartered Financial Analyst)",
    provider: "CFA Institute",
    duration: "3-4 years, 3 levels",
    cost: "Approx. Rs. 1.5-2L total",
    who: "Investment professionals, analysts, portfolio managers",
    difficulty: "Very hard",
    color: "#185FA5",
    value: "Global gold-standard credential for investment analysis, portfolio management, and institutional finance roles.",
    link: "https://www.cfainstitute.org",
  },
  {
    name: "FRM (Financial Risk Manager)",
    provider: "GARP",
    duration: "1-2 years, 2 parts",
    cost: "Approx. Rs. 80K-1.2L",
    who: "Risk managers, quants, regulators",
    difficulty: "Hard",
    color: "#534AB7",
    value: "Strong credential for market risk, credit risk, operational risk, banks, and hedge funds.",
    link: "https://www.garp.org",
  },
  {
    name: "CA (Chartered Accountant)",
    provider: "ICAI",
    duration: "4-5 years",
    cost: "Approx. Rs. 30-50K total",
    who: "Auditors, CFOs, tax professionals",
    difficulty: "Very hard",
    color: "#1D9E75",
    value: "India's most respected accounting and finance qualification, useful for audit, tax, controllership, and CFO roles.",
    link: "https://www.icai.org",
  },
  {
    name: "NISM Certifications",
    provider: "SEBI / NISM",
    duration: "1-4 months per exam",
    cost: "Approx. Rs. 1,500-3,000 per exam",
    who: "Brokers, mutual fund distributors, derivatives traders",
    difficulty: "Moderate",
    color: "#854F0B",
    value: "Often mandatory for specific Indian capital markets roles.",
    link: "https://www.nism.ac.in",
  },
  {
    name: "CFP (Certified Financial Planner)",
    provider: "FPSB India",
    duration: "6-12 months",
    cost: "Approx. Rs. 50-80K",
    who: "Financial advisors, wealth managers",
    difficulty: "Moderate",
    color: "#993C1D",
    value: "Useful for retail financial planning, wealth management, and advisory roles.",
    link: "https://www.fpsbindia.org",
  },
];

const DIFF_COLOR: Record<string, string> = { easy: "#1D9E75", medium: "#854F0B", hard: "#B91C1C" };
const DIFF_BG: Record<string, string> = { easy: "#E1F5EE", medium: "#FAEEDA", hard: "#FEF2F2" };

export default function CareerHubPage() {
  const [view, setView] = useState<View>("questions");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("free");

  useEffect(() => {
    void loadRole();
  }, []);

  useEffect(() => {
    if (view === "questions") void loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, category, difficulty]);

  const loadRole = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
    setUserRole(profile?.role || "free");
  };

  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const loadQuestions = async () => {
    setLoading(true);
    const token = await getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({ category, difficulty, search });
      const response = await fetch(`/api/career?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = (await response.json()) as { questions?: Question[] };
      if (response.ok) setQuestions(result.questions || []);
    } catch (error) {
      console.error("Failed to load career questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (question: Question) => {
    const token = await getToken();
    if (!token) return;

    const nextSaved = !question.saved;
    setQuestions((prev) => prev.map((item) => (item.id === question.id ? { ...item, saved: nextSaved } : item)));

    try {
      const response = await fetch("/api/career", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questionId: question.id, action: nextSaved ? "save" : "unsave" }),
      });
      if (!response.ok) {
        setQuestions((prev) => prev.map((item) => (item.id === question.id ? { ...item, saved: question.saved } : item)));
      }
    } catch {
      setQuestions((prev) => prev.map((item) => (item.id === question.id ? { ...item, saved: question.saved } : item)));
    }
  };

  const displayedQuestions = useMemo(() => questions, [questions]);

  return (
    <AppLayout userRole={userRole}>
      <main style={s.page}>
        <Link href="/dashboard" style={s.back}>Back to dashboard</Link>

        <div style={s.header}>
          <div style={s.headerIcon}>CAREER</div>
          <h1 style={s.title}>Career Hub</h1>
          <p style={s.sub}>Finance interview prep, career roadmaps, and certification guidance.</p>
        </div>

        <div style={s.viewTabs}>
          {[
            { id: "questions", label: "Interview Q&A" },
            { id: "careers", label: "Career Paths" },
            { id: "certifications", label: "Certifications" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as View)}
              style={{ ...s.viewTab, ...(view === tab.id ? s.viewTabActive : {}) }}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {view === "questions" ? (
          <section>
            <div style={s.filters}>
              <div style={s.categoryTabs}>
                {CATEGORIES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCategory(item.id)}
                    style={{ ...s.catBtn, ...(category === item.id ? s.catBtnActive : {}) }}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div style={s.filterRow}>
                <input
                  placeholder="Search questions or tags"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void loadQuestions();
                  }}
                  style={s.searchInput}
                />
                <button onClick={() => void loadQuestions()} style={s.searchBtn} type="button">Search</button>
                <div style={s.diffTabs}>
                  {DIFFICULTIES.map((item) => (
                    <button
                      key={item}
                      onClick={() => setDifficulty(item)}
                      style={{
                        ...s.diffBtn,
                        ...(difficulty === item ? s.diffBtnActive : {}),
                        ...(item !== "all" ? { color: difficulty === item ? "#fff" : DIFF_COLOR[item], borderColor: DIFF_COLOR[item] } : {}),
                        ...(difficulty === item && item !== "all" ? { background: DIFF_COLOR[item] } : {}),
                      }}
                      type="button"
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={s.questionsList}>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => <div key={index} style={s.skeleton} />)
              ) : displayedQuestions.length === 0 ? (
                <div style={s.empty}>No questions found. Try a different filter.</div>
              ) : (
                displayedQuestions.map((question) => {
                  const isOpen = expanded === question.id;
                  return (
                    <article key={question.id} style={s.qCard}>
                      <button
                        onClick={() => setExpanded(isOpen ? null : question.id)}
                        style={s.qHeader}
                        type="button"
                      >
                        <div style={s.qHeaderLeft}>
                          <span style={{ ...s.diffBadge, color: DIFF_COLOR[question.difficulty], background: DIFF_BG[question.difficulty] }}>
                            {question.difficulty}
                          </span>
                          <span style={s.catBadge}>{CATEGORIES.find((item) => item.id === question.category)?.label || question.category}</span>
                        </div>
                        <div style={s.qToggle}>{isOpen ? "−" : "+"}</div>
                      </button>

                      <div style={s.qQuestion}>{question.question}</div>

                      <div style={s.qTags}>
                        {question.tags.map((tag) => (
                          <span key={tag} style={s.qTag}>{tag}</span>
                        ))}
                      </div>

                      {isOpen ? (
                        <div style={s.answerWrap}>
                          <div style={s.answerLabel}>Model Answer</div>
                          <div style={s.answer}>{question.answer}</div>
                        </div>
                      ) : null}

                      <div style={s.qFooter}>
                        <span style={s.upvotes}>{question.upvotes} upvotes</span>
                        <button
                          onClick={() => void toggleSave(question)}
                          style={{ ...s.saveBtn, color: question.saved ? "#1D9E75" : "#888" }}
                          type="button"
                        >
                          {question.saved ? "Saved" : "Save"}
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        ) : null}

        {view === "careers" ? (
          <section style={s.careersGrid}>
            {CAREER_PATHS.map((path) => (
              <div key={path.title} style={{ ...s.careerCard, borderTop: `3px solid ${path.color}` }}>
                <div style={{ ...s.careerIcon, background: path.bg, color: path.color }}>{path.title.slice(0, 2).toUpperCase()}</div>
                <h3 style={{ ...s.careerTitle, color: path.color }}>{path.title}</h3>
                <div style={s.careerTime}>{path.time}</div>

                <div style={s.careerSection}>
                  <div style={s.careerSectionTitle}>Path</div>
                  {path.steps.map((step, index) => (
                    <div key={step} style={s.stepRow}>
                      <div style={{ ...s.stepNum, background: `${path.color}22`, color: path.color }}>{index + 1}</div>
                      <div style={s.stepText}>{step}</div>
                    </div>
                  ))}
                </div>

                <div style={s.careerSection}>
                  <div style={s.careerSectionTitle}>Key skills</div>
                  <div style={s.skillTags}>
                    {path.skills.map((skill) => (
                      <span key={skill} style={{ ...s.skillTag, color: path.color, background: path.bg }}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {view === "certifications" ? (
          <section style={s.certsGrid}>
            {CERTIFICATIONS.map((cert) => (
              <div key={cert.name} style={{ ...s.certCard, borderLeft: `3px solid ${cert.color}` }}>
                <div style={s.certHeader}>
                  <h3 style={{ ...s.certName, color: cert.color }}>{cert.name}</h3>
                  <span style={s.certProvider}>{cert.provider}</span>
                </div>

                <div style={s.certMeta}>
                  <div style={s.certMetaItem}>{cert.duration}</div>
                  <div style={s.certMetaItem}>{cert.cost}</div>
                  <div style={s.certMetaItem}>{cert.who}</div>
                  <div style={{ ...s.certMetaItem, color: cert.difficulty.includes("Very") ? "#B91C1C" : cert.difficulty === "Hard" ? "#854F0B" : "#1D9E75" }}>
                    {cert.difficulty}
                  </div>
                </div>

                <div style={s.certValue}>{cert.value}</div>

                <a href={cert.link} target="_blank" rel="noopener noreferrer" style={{ ...s.certLink, color: cert.color }}>
                  Visit official site
                </a>
              </div>
            ))}
          </section>
        ) : null}
      </main>
    </AppLayout>
  );
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100%", background: "var(--bg-page, #fafafa)", fontFamily: "system-ui,-apple-system,sans-serif", padding: "28px 24px 60px", maxWidth: 1040, margin: "0 auto" },
  back: { fontSize: 13, color: "var(--text-muted, #888)", textDecoration: "none", display: "block", marginBottom: 16 },
  header: { textAlign: "center", marginBottom: 24 },
  headerIcon: { display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#E1F5EE", color: "#1D9E75", fontSize: 11, fontWeight: 800, borderRadius: 8, padding: "5px 8px", marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 750, letterSpacing: "-0.5px", color: "var(--text-primary, #0a0a0a)", margin: "0 0 6px" },
  sub: { fontSize: 14, color: "var(--text-muted, #888)", margin: 0 },
  viewTabs: { display: "flex", gap: 8, marginBottom: 24, justifyContent: "center", flexWrap: "wrap" },
  viewTab: { padding: "9px 20px", fontSize: 13, fontWeight: 500, border: "0.5px solid var(--border, #ddd)", borderRadius: 24, background: "var(--bg-card, #fff)", color: "var(--text-secondary, #666)", cursor: "pointer", fontFamily: "system-ui" },
  viewTabActive: { background: "var(--text-primary, #0a0a0a)", color: "var(--bg-card, #fff)", border: "0.5px solid var(--text-primary, #0a0a0a)" },
  filters: { marginBottom: 16 },
  categoryTabs: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 },
  catBtn: { padding: "6px 12px", fontSize: 12, border: "0.5px solid var(--border, #ddd)", borderRadius: 20, background: "var(--bg-card, #fff)", color: "var(--text-secondary, #666)", cursor: "pointer", fontFamily: "system-ui" },
  catBtnActive: { background: "var(--text-primary, #0a0a0a)", color: "var(--bg-card, #fff)", border: "0.5px solid var(--text-primary, #0a0a0a)" },
  filterRow: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: 220, padding: "8px 14px", fontSize: 13, border: "0.5px solid var(--border, #ddd)", borderRadius: 9, outline: "none", fontFamily: "system-ui" },
  searchBtn: { padding: "8px 14px", border: "none", background: "#1D9E75", color: "#fff", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" },
  diffTabs: { display: "flex", gap: 4, flexWrap: "wrap" },
  diffBtn: { padding: "6px 12px", fontSize: 11, fontWeight: 500, border: "0.5px solid var(--border, #ddd)", borderRadius: 20, background: "var(--bg-card, #fff)", cursor: "pointer", fontFamily: "system-ui" },
  diffBtnActive: { color: "#fff" },
  questionsList: { display: "flex", flexDirection: "column", gap: 10 },
  skeleton: { height: 84, background: "var(--bg-surface, #eee)", borderRadius: 12 },
  empty: { padding: "40px", textAlign: "center", color: "var(--text-muted, #888)", fontSize: 14 },
  qCard: { background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 12, padding: "14px 16px" },
  qHeader: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, cursor: "pointer", border: "none", background: "transparent", padding: 0, fontFamily: "system-ui", textAlign: "left" },
  qHeaderLeft: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" },
  diffBadge: { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12 },
  catBadge: { fontSize: 10, color: "var(--text-muted, #888)", background: "var(--bg-surface, #f0f0f0)", padding: "2px 8px", borderRadius: 12 },
  qToggle: { fontSize: 18, color: "var(--text-muted, #aaa)", fontWeight: 400, lineHeight: 1 },
  qQuestion: { fontSize: 14, fontWeight: 650, color: "var(--text-primary, #0a0a0a)", lineHeight: 1.5, marginBottom: 8 },
  qTags: { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 },
  qTag: { fontSize: 10, color: "var(--text-muted, #888)", background: "var(--bg-surface, #f5f5f5)", padding: "2px 7px", borderRadius: 8 },
  answerWrap: { background: "#F8FEFB", border: "0.5px solid #9FE1CB", borderRadius: 9, padding: "12px 14px", marginBottom: 10 },
  answerLabel: { fontSize: 10, fontWeight: 800, color: "#0F6E56", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 },
  answer: { fontSize: 13, color: "#333", lineHeight: 1.75, whiteSpace: "pre-wrap" },
  qFooter: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  upvotes: { fontSize: 11, color: "var(--text-muted, #888)" },
  saveBtn: { fontSize: 11, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "system-ui" },
  careersGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 },
  careerCard: { background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 12, padding: "20px" },
  careerIcon: { width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, marginBottom: 10 },
  careerTitle: { fontSize: 17, fontWeight: 750, margin: "0 0 4px", letterSpacing: "-0.2px" },
  careerTime: { fontSize: 12, color: "var(--text-muted, #888)", marginBottom: 16 },
  careerSection: { marginBottom: 14 },
  careerSectionTitle: { fontSize: 10, fontWeight: 800, color: "var(--text-muted, #888)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 },
  stepRow: { display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  stepNum: { width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1 },
  stepText: { fontSize: 13, color: "var(--text-secondary, #444)", lineHeight: 1.5 },
  skillTags: { display: "flex", flexWrap: "wrap", gap: 5 },
  skillTag: { fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 12 },
  certsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 },
  certCard: { background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 12, padding: "18px 20px" },
  certHeader: { marginBottom: 12 },
  certName: { fontSize: 16, fontWeight: 750, margin: "0 0 3px", letterSpacing: "-0.2px" },
  certProvider: { fontSize: 12, color: "var(--text-muted, #888)" },
  certMeta: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 },
  certMetaItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary, #555)" },
  certValue: { fontSize: 13, color: "var(--text-secondary, #333)", lineHeight: 1.6, marginBottom: 14, padding: "10px 12px", background: "var(--bg-surface, #fafafa)", borderRadius: 8 },
  certLink: { fontSize: 13, fontWeight: 700, textDecoration: "none" },
};
