"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type CaseStudy = {
  id:               string;
  slug:             string;
  title:            string;
  subtitle:         string;
  category:         string;
  difficulty:       "beginner" | "intermediate" | "advanced";
  duration_minutes: number;
  protagonist:      string;
  key_lesson:       string;
  tags:             string[];
};

const CATEGORIES = ["All", "personal-finance", "trading-markets", "corporate-finance", "taxation", "investing"];

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: studies } = await supabase
          .from("case_studies")
          .select("id, slug, title, subtitle, category, difficulty, duration_minutes, protagonist, key_lesson, tags")
          .eq("is_published", true)
          .order("created_at", { ascending: true });

        if (studies) setCaseStudies(studies as CaseStudy[]);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: completions } = await (supabase
            .from("user_case_study_completions") as any)
            .select("case_study_id")
            .eq("user_id", user.id);

          if (completions) {
            setCompletedIds((completions as any[]).map((c) => c.case_study_id));
          }
        }
      } catch (err) {
        console.error("Error loading case studies:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredStudies = caseStudies.filter((cs) => {
    const matchesCategory = activeCategory === "All" || cs.category === activeCategory;
    const matchesSearch =
      cs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cs.protagonist && cs.protagonist.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cs.key_lesson && cs.key_lesson.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cs.subtitle && cs.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "beginner":
        return { label: "Beginner", bg: "#E1F5EE", color: "#0F766E" };
      case "intermediate":
        return { label: "Intermediate", bg: "#E6F1FB", color: "#1D4ED8" };
      case "advanced":
        return { label: "Advanced", bg: "#FAEEDA", color: "#B45309" };
      default:
        return { label: diff, bg: "#F3F4F6", color: "#4B5563" };
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <Link href="/dashboard" style={s.backLink}>
            ← Back to Dashboard
          </Link>
          <div style={s.badgeRow}>
            <span style={s.headerBadge}>REAL-WORLD ANALYSIS</span>
            <span style={s.headerBadgeSub}>20 XP per case</span>
          </div>
          <h1 style={s.title}>Indian Business & Finance Case Studies</h1>
          <p style={s.sub}>
            Analyse real corporate dilemmas, balance sheet crises, regulatory decisions, and personal finance choices across Indian history.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div style={s.filterContainer}>
          <input
            type="text"
            placeholder="Search by topic, keyword, or character..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={s.searchInput}
          />
          <div style={s.categoryBar}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  ...s.catBtn,
                  ...(activeCategory === cat ? s.catBtnActive : {}),
                }}
              >
                {cat === "All" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Case Studies Grid */}
        {loading ? (
          <div style={s.loadingGrid}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} style={s.skeletonCard} />
            ))}
          </div>
        ) : filteredStudies.length === 0 ? (
          <div style={s.emptyState}>
            <h3>No case studies found</h3>
            <p>Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {filteredStudies.map((cs) => {
              const diffBadge = getDifficultyBadge(cs.difficulty);
              const isCompleted = completedIds.includes(cs.id);

              return (
                <div key={cs.id} style={s.card}>
                  <div style={s.cardHeader}>
                    <span style={{ ...s.diffBadge, background: diffBadge.bg, color: diffBadge.color }}>
                      {diffBadge.label}
                    </span>
                    <span style={s.readTime}>⏱️ {cs.duration_minutes || 10} min read</span>
                    {isCompleted && <span style={s.completedBadge}>✓ Solved</span>}
                  </div>

                  <h3 style={s.cardTitle}>{cs.title}</h3>
                  {cs.protagonist && <div style={s.companyTag}>👤 {cs.protagonist}</div>}
                  <p style={s.cardSummary}>{cs.subtitle || cs.key_lesson}</p>

                  <div style={s.cardFooter}>
                    <span style={s.categoryTag}>{cs.category}</span>
                    <Link href={`/case-studies/${cs.slug}`} style={s.readBtn}>
                      Read & Analyze →
                    </Link>
                  </div>
                </div>
              );
            })}
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
    maxWidth: "1080px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "28px",
  },
  backLink: {
    display: "inline-block",
    fontSize: "13px",
    color: "#6B7280",
    textDecoration: "none",
    marginBottom: "12px",
    fontWeight: 500,
  },
  badgeRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "10px",
  },
  headerBadge: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    color: "#0F766E",
    background: "#E1F5EE",
    padding: "4px 10px",
    borderRadius: "12px",
  },
  headerBadgeSub: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#D97706",
    background: "#FEF3C7",
    padding: "4px 10px",
    borderRadius: "12px",
  },
  title: {
    fontSize: "32px",
    fontWeight: 800,
    color: "#111827",
    margin: "0 0 8px",
    letterSpacing: "-0.5px",
  },
  sub: {
    fontSize: "15px",
    color: "#4B5563",
    margin: 0,
    maxWidth: "720px",
    lineHeight: "1.5",
  },
  filterContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "32px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    fontSize: "14px",
    background: "#FFFFFF",
    outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  categoryBar: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    paddingBottom: "4px",
  },
  catBtn: {
    padding: "6px 14px",
    borderRadius: "20px",
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    color: "#4B5563",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  catBtnActive: {
    background: "#111827",
    color: "#FFFFFF",
    borderColor: "#111827",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  loadingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  skeletonCard: {
    height: "220px",
    background: "#E5E7EB",
    borderRadius: "14px",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 16px",
    background: "#FFFFFF",
    borderRadius: "14px",
    border: "1px solid #E5E7EB",
    color: "#6B7280",
  },
  card: {
    background: "#FFFFFF",
    borderRadius: "14px",
    border: "1px solid #E5E7EB",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  diffBadge: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "6px",
  },
  readTime: {
    fontSize: "12px",
    color: "#6B7280",
  },
  completedBadge: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#059669",
    background: "#D1FAE5",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 750,
    color: "#111827",
    margin: "0 0 6px",
    lineHeight: "1.3",
  },
  companyTag: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#2563EB",
    marginBottom: "10px",
  },
  cardSummary: {
    fontSize: "13px",
    color: "#4B5563",
    lineHeight: "1.5",
    margin: "0 0 20px",
    flexGrow: 1,
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "12px",
    borderTop: "1px solid #F3F4F6",
  },
  categoryTag: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#6B7280",
    background: "#F3F4F6",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  readBtn: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#0F766E",
    textDecoration: "none",
  },
};
