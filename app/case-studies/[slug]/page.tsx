"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CaseStudyDetail = {
  id:               string;
  slug:             string;
  title:            string;
  subtitle:         string;
  category:         string;
  difficulty:       string;
  duration_minutes: number;
  content_mdx:      string;
  protagonist:      string;
  key_lesson:       string;
  tags:             string[];
};

export default function CaseStudyDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [study, setStudy] = useState<CaseStudyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(false);

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
            const { data: completion } = await (supabase
              .from("user_case_study_completions") as any)
              .select("*")
              .eq("user_id", user.id)
              .eq("case_study_id", (data as any).id)
              .single();

            if (completion) {
              setCompleted(true);
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

  const handleMarkComplete = async () => {
    if (!study || completed) return;

    setCompleted(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase.from("user_case_study_completions") as any).upsert({
          user_id: user.id,
          case_study_id: study.id,
          xp_earned: 20,
          completed_at: new Date().toISOString(),
        });

        // Award XP RPC call if available
        try {
          await (supabase as any).rpc("increment_user_xp", { p_user_id: user.id, p_xp: 20 });
        } catch {
          // ignore fallback
        }

        setXpEarned(true);
      }
    } catch (err) {
      console.error("Error marking case study complete:", err);
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
            {study.protagonist && <span style={s.companyName}>👤 {study.protagonist}</span>}
            <span style={s.readTime}>⏱️ {study.duration_minutes || 10} min read</span>
          </div>
          <h1 style={s.title}>{study.title}</h1>
          {study.subtitle && <p style={s.subtitle}>{study.subtitle}</p>}
        </div>

        {/* Key Lesson Box */}
        {study.key_lesson && (
          <div style={s.keyLessonBox}>
            <div style={s.keyLessonHeader}>💡 KEY TAKEAWAY</div>
            <p style={s.keyLessonText}>{study.key_lesson}</p>
          </div>
        )}

        {/* Content Body */}
        <div style={s.contentCard}>
          <div style={s.prose}>
            {study.content_mdx.split("\n\n").map((para, i) => {
              if (para.startsWith("# ")) {
                return <h1 key={i} style={s.h1}>{para.replace("# ", "")}</h1>;
              }
              if (para.startsWith("## ")) {
                return <h2 key={i} style={s.h2}>{para.replace("## ", "")}</h2>;
              }
              if (para.startsWith("### ")) {
                return <h3 key={i} style={s.h3}>{para.replace("### ", "")}</h3>;
              }
              return (
                <p key={i} style={s.para}>
                  {para}
                </p>
              );
            })}
          </div>
        </div>

        {/* Action / Completion */}
        <div style={s.completionCard}>
          {!completed ? (
            <button onClick={handleMarkComplete} style={s.completeBtn}>
              Mark Case Study Completed (+20 XP)
            </button>
          ) : (
            <div style={s.completedBox}>
              ✅ <strong>Case Study Solved & Mastered!</strong>
              {xpEarned && <span style={s.xpBadge}>+20 XP Awarded</span>}
            </div>
          )}
        </div>
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
    flexWrap: "wrap",
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
  keyLessonBox: {
    background: "#EFF6FF",
    border: "1px solid #BFDBFE",
    padding: "16px 20px",
    borderRadius: "14px",
    marginBottom: "20px",
  },
  keyLessonHeader: {
    fontSize: "11px",
    fontWeight: 800,
    color: "#1E40AF",
    letterSpacing: "0.06em",
    marginBottom: "4px",
  },
  keyLessonText: {
    fontSize: "14px",
    fontWeight: 650,
    color: "#1E3A8A",
    margin: 0,
  },
  contentCard: {
    background: "#FFFFFF",
    padding: "32px",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    marginBottom: "20px",
  },
  prose: {
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.7",
  },
  h1: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#111827",
    margin: "24px 0 12px",
  },
  h2: {
    fontSize: "18px",
    fontWeight: 750,
    color: "#1F2937",
    margin: "20px 0 10px",
  },
  h3: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#374151",
    margin: "16px 0 8px",
  },
  para: {
    marginBottom: "14px",
    whiteSpace: "pre-wrap",
  },
  completionCard: {
    background: "#FFFFFF",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid #E5E7EB",
    textAlign: "center",
  },
  completeBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    background: "#059669",
    color: "#FFFFFF",
    fontWeight: 750,
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
  },
  completedBox: {
    fontSize: "15px",
    color: "#059669",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  xpBadge: {
    background: "#D1FAE5",
    color: "#059669",
    fontSize: "12px",
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: "6px",
  },
};
