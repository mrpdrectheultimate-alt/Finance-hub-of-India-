"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type TopLesson = {
  title: string;
  total_completions: number;
  avg_quiz_score: number | null;
};

type Analytics = {
  total_users: number;
  new_users: number;
  dau_today: number;
  dau_7d_avg: number | null;
  pro_users: number;
  expert_users: number;
  conversion_rate: number | null;
  mrr_estimate: number;
  total_completions: number;
  avg_lessons_per_user: number | null;
  quiz_attempts: number;
  avg_quiz_score: number | null;
  ai_questions: number;
  total_comments: number;
  published_lessons: number;
  total_quizzes: number;
  total_tracks: number;
  users_with_streak: number;
  avg_streak: number | null;
  max_streak: number | null;
  top_lessons: TopLesson[];
};

const DATE_RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "All time", days: 3650 },
];

const ADMIN_LINKS = [
  { icon: "OV", label: "Overview", href: "/admin" },
  { icon: "LS", label: "Lessons", href: "/admin/lessons" },
  { icon: "QZ", label: "Quizzes", href: "/admin/quizzes" },
  { icon: "US", label: "Users", href: "/admin/users" },
  { icon: "AN", label: "Analytics", href: "/admin/analytics" },
];

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const response = await fetch(`/api/admin/analytics?days=${days}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const result = await response.json() as { analytics?: Analytics; error?: string };

    if (!response.ok || !result.analytics) {
      setError(result.error || "Failed to load analytics");
      setLoading(false);
      return;
    }

    setAnalytics({
      ...result.analytics,
      top_lessons: result.analytics.top_lessons || [],
    });
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoMark}>F</div>
          <div>
            <div style={s.logoText}>FinanceHub</div>
            <div style={s.adminTag}>Admin</div>
          </div>
        </div>
        <nav style={s.nav}>
          {ADMIN_LINKS.map((item) => (
            <Link key={item.href} href={item.href} style={{ ...s.navItem, ...(item.href === "/admin/analytics" ? s.navActive : {}) }}>
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <Link href="/dashboard" style={s.backToApp}>Back to app</Link>
      </aside>

      <main style={s.main}>
        <header style={s.header}>
          <div>
            <div style={s.breadcrumb}>
              <Link href="/admin" style={s.breadcrumbLink}>Admin</Link> / Analytics
            </div>
            <h1 style={s.title}>Analytics Dashboard</h1>
            <p style={s.sub}>Metrics across users, revenue, learning, community, and content.</p>
          </div>
          <div style={s.headerRight}>
            <div style={s.dateRange}>
              {DATE_RANGES.map((range) => (
                <button
                  key={range.days}
                  onClick={() => setDays(range.days)}
                  style={{ ...s.dateBtn, ...(days === range.days ? s.dateBtnActive : {}) }}
                  type="button"
                >
                  {range.label}
                </button>
              ))}
            </div>
            <button onClick={() => void loadAnalytics()} style={s.refreshBtn} type="button">Refresh</button>
          </div>
        </header>

        {error ? (
          <div style={s.errorBox}>
            <div>{error}</div>
            <Link href="/dashboard" style={s.errorLink}>Back to dashboard</Link>
          </div>
        ) : loading ? (
          <LoadingSkeleton />
        ) : analytics ? (
          <>
            <SectionTitle>Revenue</SectionTitle>
            <div style={{ ...s.grid, gridTemplateColumns: "repeat(4, minmax(0, 1fr))", marginBottom: 24 }}>
              <MetricCard label="Monthly revenue est." value={formatRupees(analytics.mrr_estimate)} sub="based on current roles" color="#1D9E75" bg="#E1F5EE" big />
              <MetricCard label="Pro subscribers" value={analytics.pro_users} sub="Rs 499/month" color="#185FA5" bg="#E6F1FB" />
              <MetricCard label="Expert subscribers" value={analytics.expert_users} sub="Rs 999/month" color="#534AB7" bg="#EEEDFE" />
              <MetricCard label="Conversion rate" value={`${valueOrZero(analytics.conversion_rate)}%`} sub="free to paid" color="#854F0B" bg="#FAEEDA" />
            </div>

            <SectionTitle>Users</SectionTitle>
            <div style={{ ...s.grid, gridTemplateColumns: "repeat(4, minmax(0, 1fr))", marginBottom: 24 }}>
              <MetricCard label="Total users" value={analytics.total_users.toLocaleString()} sub="all time" color="#0a0a0a" bg="#F5F5F3" />
              <MetricCard label="New users" value={analytics.new_users} sub={`last ${days} days`} color="#185FA5" bg="#E6F1FB" />
              <MetricCard label="Active today" value={analytics.dau_today} sub="DAU" color="#1D9E75" bg="#E1F5EE" />
              <MetricCard label="7-day avg DAU" value={valueOrZero(analytics.dau_7d_avg)} sub="rolling average" color="#534AB7" bg="#EEEDFE" />
            </div>

            <SectionTitle>Engagement</SectionTitle>
            <div style={{ ...s.grid, gridTemplateColumns: "repeat(3, minmax(0, 1fr))", marginBottom: 24 }}>
              <MetricCard label="Lesson completions" value={analytics.total_completions.toLocaleString()} sub={`last ${days} days`} color="#1D9E75" bg="#E1F5EE" />
              <MetricCard label="Avg lessons/user" value={valueOrZero(analytics.avg_lessons_per_user)} sub={`last ${days} days`} color="#185FA5" bg="#E6F1FB" />
              <MetricCard label="Quiz attempts" value={analytics.quiz_attempts.toLocaleString()} sub={`last ${days} days`} color="#534AB7" bg="#EEEDFE" />
              <MetricCard label="Avg quiz score" value={`${valueOrZero(analytics.avg_quiz_score)}%`} sub="completed quizzes" color="#854F0B" bg="#FAEEDA" />
              <MetricCard label="AI questions" value={analytics.ai_questions.toLocaleString()} sub={`last ${days} days`} color="#993C1D" bg="#FAECE7" />
              <MetricCard label="Discussion comments" value={analytics.total_comments.toLocaleString()} sub={`last ${days} days`} color="#0F6E56" bg="#E1F5EE" />
            </div>

            <SectionTitle>Streaks</SectionTitle>
            <div style={{ ...s.grid, gridTemplateColumns: "repeat(3, minmax(0, 1fr))", marginBottom: 24 }}>
              <MetricCard label="Users with streak" value={analytics.users_with_streak} sub="active streak greater than 0" color="#854F0B" bg="#FAEEDA" />
              <MetricCard label="Average streak" value={`${valueOrZero(analytics.avg_streak)} days`} sub="among streak holders" color="#854F0B" bg="#FAEEDA" />
              <MetricCard label="Longest streak" value={`${valueOrZero(analytics.max_streak)} days`} sub="all-time record" color="#854F0B" bg="#FAEEDA" />
            </div>

            <SectionTitle>Content</SectionTitle>
            <div style={{ ...s.grid, gridTemplateColumns: "repeat(3, minmax(0, 1fr))", marginBottom: 24 }}>
              <MetricCard label="Published lessons" value={analytics.published_lessons} sub="across tracks" color="#0a0a0a" bg="#F5F5F3" />
              <MetricCard label="Total quizzes" value={analytics.total_quizzes} sub="quiz records" color="#0a0a0a" bg="#F5F5F3" />
              <MetricCard label="Active tracks" value={analytics.total_tracks} sub="learning tracks" color="#0a0a0a" bg="#F5F5F3" />
            </div>

            <SectionTitle>Top Lessons</SectionTitle>
            <div style={s.topLessonsCard}>
              <div style={s.topLessonsHeader}>
                <span>Lesson</span>
                <span style={{ textAlign: "right" }}>Completions</span>
                <span style={{ textAlign: "right" }}>Avg score</span>
              </div>
              {analytics.top_lessons.length === 0 ? (
                <div style={s.emptyPanel}>No completions yet in this period.</div>
              ) : analytics.top_lessons.map((lesson, index) => {
                const maxCompletions = analytics.top_lessons[0]?.total_completions || 1;
                const pct = Math.round((lesson.total_completions / maxCompletions) * 100);
                return (
                  <div key={`${lesson.title}-${index}`} style={s.topLessonRow}>
                    <div style={s.topLessonLeft}>
                      <span style={s.topLessonRank}>#{index + 1}</span>
                      <div style={s.topLessonBody}>
                        <div style={s.topLessonTitle}>{lesson.title}</div>
                        <div style={s.topLessonBar}>
                          <div style={{ ...s.topLessonBarFill, width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                    <span style={s.topLessonStat}>{lesson.total_completions}</span>
                    <span style={{ ...s.topLessonStat, color: valueOrZero(lesson.avg_quiz_score) >= 70 ? "#1D9E75" : "#B91C1C" }}>
                      {lesson.avg_quiz_score === null ? "NA" : `${lesson.avg_quiz_score}%`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={s.quickLinks}>
              <Link href="/admin/lessons" style={s.quickLink}>Manage lessons</Link>
              <Link href="/admin/users" style={s.quickLink}>Manage users</Link>
              <Link href="/admin/quizzes" style={s.quickLink}>Quiz builder</Link>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <div style={s.sectionTitle}>{children}</div>;
}

function MetricCard({
  label,
  value,
  sub,
  color,
  bg,
  big = false,
}: {
  label: string;
  value: string | number;
  sub: string;
  color: string;
  bg: string;
  big?: boolean;
}) {
  return (
    <div style={{ ...s.metricCard, background: bg }}>
      <div style={{ ...s.metricVal, color, fontSize: big ? 28 : 22 }}>{value}</div>
      <div style={s.metricLabel}>{label}</div>
      <div style={s.metricSub}>{sub}</div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[80, 120, 120, 120].map((height, index) => (
        <div key={index} style={{ height, background: "#eee", borderRadius: 12 }} />
      ))}
    </div>
  );
}

function formatRupees(value: number) {
  if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `Rs ${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `Rs ${(value / 1000).toFixed(0)}K`;
  return `Rs ${value}`;
}

function valueOrZero(value: number | null | undefined) {
  return value ?? 0;
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui,-apple-system,sans-serif", display: "flex" },
  sidebar: { width: 220, background: "#0a0a0a", color: "#fff", padding: "20px 12px", position: "fixed", height: "100vh", display: "flex", flexDirection: "column" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "0 8px 24px" },
  logoMark: { width: 32, height: 32, background: "#1D9E75", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 },
  logoText: { fontWeight: 700, fontSize: 15 },
  adminTag: { fontSize: 11, color: "#888", marginTop: 2 },
  nav: { display: "flex", flexDirection: "column", gap: 3, flex: 1 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, color: "#aaa", textDecoration: "none", fontSize: 13 },
  navActive: { background: "rgba(29,158,117,0.18)", color: "#22C48E", fontWeight: 700 },
  navIcon: { width: 22, fontSize: 11, fontWeight: 800 },
  backToApp: { color: "#666", fontSize: 12, textDecoration: "none", padding: "12px 8px" },
  main: { marginLeft: 220, flex: 1, padding: "24px 28px 60px", maxWidth: 1120 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 20, flexWrap: "wrap" },
  breadcrumb: { fontSize: 12, color: "#aaa", marginBottom: 6 },
  breadcrumbLink: { color: "#aaa", textDecoration: "none" },
  title: { fontSize: 24, fontWeight: 750, letterSpacing: "-0.5px", color: "#0a0a0a", margin: "0 0 4px" },
  sub: { fontSize: 13, color: "#888", margin: 0 },
  headerRight: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  dateRange: { display: "flex", border: "0.5px solid #ddd", borderRadius: 9, overflow: "hidden" },
  dateBtn: { padding: "7px 14px", fontSize: 12, fontWeight: 600, border: "none", background: "#fff", color: "#666", cursor: "pointer", fontFamily: "system-ui" },
  dateBtnActive: { background: "#0a0a0a", color: "#fff" },
  refreshBtn: { padding: "7px 14px", fontSize: 12, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 9, background: "#fff", color: "#555", cursor: "pointer", fontFamily: "system-ui" },
  sectionTitle: { fontSize: 12, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 },
  grid: { display: "grid", gap: 10 },
  metricCard: { borderRadius: 12, padding: "16px 14px", minWidth: 0 },
  metricVal: { fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4, lineHeight: 1 },
  metricLabel: { fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 2 },
  metricSub: { fontSize: 11, color: "#888" },
  topLessonsCard: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, overflow: "hidden", marginBottom: 24 },
  topLessonsHeader: { display: "grid", gridTemplateColumns: "1fr 100px 100px", padding: "10px 16px", background: "#fafafa", fontSize: 11, fontWeight: 700, color: "#888", borderBottom: "0.5px solid #eee" },
  topLessonRow: { display: "grid", gridTemplateColumns: "1fr 100px 100px", padding: "12px 16px", borderBottom: "0.5px solid #f5f5f5", alignItems: "center" },
  topLessonLeft: { display: "flex", alignItems: "center", gap: 12, minWidth: 0 },
  topLessonRank: { fontSize: 12, fontWeight: 800, color: "#aaa", width: 24, flexShrink: 0 },
  topLessonBody: { minWidth: 0, flex: 1 },
  topLessonTitle: { fontSize: 13, fontWeight: 600, color: "#0a0a0a", marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  topLessonBar: { height: 3, background: "#eee", borderRadius: 2, width: "100%", maxWidth: 220, overflow: "hidden" },
  topLessonBarFill: { height: "100%", background: "#1D9E75", borderRadius: 2 },
  topLessonStat: { fontSize: 13, fontWeight: 700, color: "#555", textAlign: "right" },
  quickLinks: { display: "flex", gap: 10, flexWrap: "wrap" },
  quickLink: { padding: "10px 18px", background: "#fff", border: "0.5px solid #ddd", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "#333", textDecoration: "none" },
  errorBox: { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 10, padding: 16, fontSize: 14, color: "#B91C1C", marginBottom: 16 },
  errorLink: { display: "inline-block", marginTop: 10, color: "#B91C1C", fontWeight: 700, textDecoration: "none" },
  emptyPanel: { padding: 18, color: "#888", fontSize: 13 },
};
