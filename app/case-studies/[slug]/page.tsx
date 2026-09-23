"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FinancialMetric = {
  label: string;
  value: string;
};

type Option = {
  id:               string;
  text:             string;
  is_recommended:   boolean;
  reasoning:        string;
};

type CaseStudyDetail = {
  id:                string;
  slug:              string;
  title:             string;
  subtitle:          string;
  category:          string;
  difficulty:        string;
  read_time_mins:    number;
  company_name:      string;
  summary:           string;
  background_mdx:    string;
  financial_metrics: FinancialMetric[];
  dilemma_question:  string;
  options:           Option[];
  retrospective_mdx: string;
};

export default function CaseStudyDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [study, setStudy] = useState<CaseStudyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [userAlreadyCompleted, setUserAlreadyCompleted] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  useEffect(() => {
    async function loadCaseStudy() {
      if (!slug) return;
      try {
        const { data } = await supabase
          .from("case_studies")
          .select("*")
          .eq("slug", slug)
          .single();

        if (data) {
          setStudy(data as CaseStudyDetail);

          // Check user completion
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: userProgress } = await (supabase
              .from("user_case_study_progress") as any)
              .select("selected_option")
              .eq("user_id", user.id)
              .eq("case_study_id", (data as any).id)
              .single();

            if (userProgress) {
              setSelectedOption((userProgress as any).selected_option);
              setSubmitted(true);
              setUserAlreadyCompleted(true);
            }
          }
        }
      } catch (err) {
        console.error("Error loading case study detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCaseStudy();
  }, [slug]);

  const handleSubmitDecision = async () => {
    if (!selectedOption || !study || submitted) return;

    setSubmitted(true);
    const chosen = study.options.find((o) => o.id === selectedOption);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !userAlreadyCompleted) {
        await (supabase.from("user_case_study_progress") as any).insert({
          user_id: user.id,
          case_study_id: study.id,
          selected_option: selectedOption,
          xp_earned: 50,
        });

        // Award XP RPC call if present
        try {
          await (supabase as any).rpc("increment_user_xp", { p_user_id: user.id, p_xp: 50 });
        } catch {
          // ignore fallback
        }

        setXpAwarded(true);
      }
    } catch (err) {
      console.error("Error saving decision:", err);
    }
  };

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.container}>
          <p>Loading case study...</p>
        </div>
      </div>
    );
  }

  if (!study) {
    return (
      <div style={s.page}>
        <div style={s.container}>
          <h2>Case Study Not Found</h2>
          <Link href="/case-studies" style={s.backLink}>
            ← Back to Case Studies
          </Link>
        </div>
      </div>
    );
  }

  const chosenOption = study.options.find((o) => o.id === selectedOption);

  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/case-studies" style={s.backLink}>
          ← Back to All Case Studies
        </Link>

        {/* Case Header */}
        <div style={s.headerBox}>
          <div style={s.metaRow}>
            <span style={s.categoryTag}>{study.category}</span>
            <span style={s.companyName}>🏢 {study.company_name}</span>
            <span style={s.readTime}>⏱️ {study.read_time_mins} min read</span>
          </div>
          <h1 style={s.title}>{study.title}</h1>
          <p style={s.subtitle}>{study.subtitle}</p>
        </div>

        {/* Key Financial Metrics */}
        {study.financial_metrics && study.financial_metrics.length > 0 && (
          <div style={s.metricsBox}>
            <h3 style={s.sectionHeader}>Key Financial Snapshot</h3>
            <div style={s.metricsGrid}>
              {study.financial_metrics.map((m, idx) => (
                <div key={idx} style={s.metricCard}>
                  <div style={s.metricLabel}>{m.label}</div>
                  <div style={s.metricValue}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Case Context & Background */}
        <div style={s.contentCard}>
          <h3 style={s.sectionHeader}>Background & Context</h3>
          <div style={s.prose}>
            {study.background_mdx.split("\n\n").map((para, i) => (
              <p key={i} style={s.para}>
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Decision Dilemma Section */}
        <div style={s.dilemmaCard}>
          <div style={s.dilemmaBadge}>DECISION DILEMMA</div>
          <h3 style={s.dilemmaQuestion}>{study.dilemma_question}</h3>

          <div style={s.optionsList}>
            {study.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              let optStyle = { ...s.optionBtn };

              if (isSelected) {
                optStyle = { ...optStyle, ...s.optionSelected };
              }
              if (submitted && opt.is_recommended) {
                optStyle = { ...optStyle, ...s.optionRecommended };
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => !submitted && setSelectedOption(opt.id)}
                  style={optStyle}
                  disabled={submitted}
                >
                  <span style={s.optionId}>{opt.id}</span>
                  <span style={s.optionText}>{opt.text}</span>
                </button>
              );
            })}
          </div>

          {!submitted ? (
            <button
              onClick={handleSubmitDecision}
              disabled={!selectedOption}
              style={{
                ...s.submitBtn,
                opacity: selectedOption ? 1 : 0.5,
                cursor: selectedOption ? "pointer" : "not-allowed",
              }}
            >
              Submit Strategic Decision
            </button>
          ) : (
            <div style={s.feedbackBox}>
              <div style={s.feedbackHeader}>
                {chosenOption?.is_recommended ? (
                  <span style={s.correctText}>✅ Recommended Strategy Chosen!</span>
                ) : (
                  <span style={s.alternativeText}>💡 Alternative Decision Path</span>
                )}
                {xpAwarded && <span style={s.xpBadge}>+50 XP Earned!</span>}
              </div>
              <p style={s.reasoningText}>
                <strong>Analysis:</strong> {chosenOption?.reasoning}
              </p>
            </div>
          )}
        </div>

        {/* Historical Retrospective */}
        {submitted && (
          <div style={s.retrospectiveCard}>
            <h3 style={s.retroHeader}>📜 Historical Retrospective & Outcome</h3>
            <div style={s.prose}>
              {study.retrospective_mdx.split("\n\n").map((para, i) => (
                <p key={i} style={s.para}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F9FAFB",
    padding: "32px 16px 60px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  container: {
    maxWidth: "840px",
    margin: "0 auto",
  },
  backLink: {
    display: "inline-block",
    fontSize: "13px",
    color: "#6B7280",
    textDecoration: "none",
    marginBottom: "16px",
    fontWeight: 500,
  },
  headerBox: {
    background: "#FFFFFF",
    padding: "28px",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    marginBottom: "20px",
  },
  metaRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "12px",
    fontSize: "13px",
  },
  categoryTag: {
    fontWeight: 700,
    color: "#0F766E",
    background: "#E1F5EE",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  companyName: {
    fontWeight: 600,
    color: "#2563EB",
  },
  readTime: {
    color: "#6B7280",
  },
  title: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#111827",
    margin: "0 0 8px",
    letterSpacing: "-0.4px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#4B5563",
    margin: 0,
    lineHeight: "1.5",
  },
  metricsBox: {
    background: "#FFFFFF",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    marginBottom: "20px",
  },
  sectionHeader: {
    fontSize: "16px",
    fontWeight: 750,
    color: "#111827",
    margin: "0 0 14px",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
    gap: "12px",
  },
  metricCard: {
    background: "#F9FAFB",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #F3F4F6",
  },
  metricLabel: {
    fontSize: "12px",
    color: "#6B7280",
    marginBottom: "4px",
  },
  metricValue: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#111827",
  },
  contentCard: {
    background: "#FFFFFF",
    padding: "28px",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    marginBottom: "20px",
  },
  prose: {
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.7",
  },
  para: {
    marginBottom: "14px",
  },
  dilemmaCard: {
    background: "#1E293B",
    color: "#FFFFFF",
    padding: "28px",
    borderRadius: "16px",
    marginBottom: "20px",
  },
  dilemmaBadge: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    color: "#38BDF8",
    marginBottom: "10px",
  },
  dilemmaQuestion: {
    fontSize: "20px",
    fontWeight: 750,
    margin: "0 0 20px",
    lineHeight: "1.4",
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },
  optionBtn: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "10px",
    background: "#334155",
    border: "1px solid #475569",
    color: "#F8FAFC",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  optionSelected: {
    background: "#0284C7",
    borderColor: "#38BDF8",
  },
  optionRecommended: {
    border: "2px solid #10B981",
  },
  optionId: {
    fontWeight: 800,
    background: "#0F172A",
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "12px",
  },
  optionText: {
    flexGrow: 1,
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    background: "#10B981",
    color: "#FFFFFF",
    fontWeight: 750,
    fontSize: "15px",
    border: "none",
  },
  feedbackBox: {
    background: "#0F172A",
    padding: "18px",
    borderRadius: "12px",
    border: "1px solid #334155",
  },
  feedbackHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  correctText: {
    color: "#34D399",
    fontWeight: 750,
    fontSize: "15px",
  },
  alternativeText: {
    color: "#FBBF24",
    fontWeight: 750,
    fontSize: "15px",
  },
  xpBadge: {
    background: "#059669",
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: "6px",
  },
  reasoningText: {
    fontSize: "14px",
    color: "#94A3B8",
    margin: 0,
    lineHeight: "1.5",
  },
  retrospectiveCard: {
    background: "#FEFCE8",
    border: "1px solid #FEF08A",
    padding: "28px",
    borderRadius: "16px",
  },
  retroHeader: {
    fontSize: "18px",
    fontWeight: 750,
    color: "#854D0E",
    margin: "0 0 14px",
  },
};
