"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Admin Dashboard
// app/admin/dashboard/page.tsx
// Real-time metrics · User analytics · Content health · Revenue
// ============================================================

type Metric = { label: string; value: string | number; delta?: string; deltaUp?: boolean; icon: string; color: string };
type DailySnap = { snapshot_date: string; total_users: number; active_users_dau: number; completions_today: number; pro_users: number };
type TopLesson = { title: string; slug: string; completion_count: number; avg_score: number };
type ContentHealth = { track: string; total_lessons: number; unreviewed: number; overdue_reviews: number; avg_quality_score: number; hindi_lessons: number };

export default function AdminDashboard() {
  const [metrics,       setMetrics]       = useState<Metric[]>([]);
  const [snapshots,     setSnapshots]     = useState<DailySnap[]>([]);
  const [topLessons,    setTopLessons]    = useState<TopLesson[]>([]);
  const [contentHealth, setContentHealth] = useState<ContentHealth[]>([]);
  const [communityStats,setCommunityStats]= useState<any>(null);
  const [recentUsers,   setRecentUsers]   = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [isAdmin,       setIsAdmin]       = useState(false);
  const [lastRefresh,   setLastRefresh]   = useState<Date>(new Date());
  const [activeTab,     setActiveTab]     = useState<"overview"|"content"|"users"|"community">("overview");

  const verifyAdmin = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",");
    return admins.includes(user.email || "");
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);

    const [
      profilesRes, progressRes, notesRes, aiRes,
      snapshotsRes, topLessonsRes, healthRes,
      communityRes, recentUsersRes, certsRes, leaderboardRes,
    ] = await Promise.all([
      (supabase as any).from("profiles").select("id,subscription_tier,created_at,current_streak,xp_total,language_pref"),
      (supabase as any).from("user_progress").select("id,completed_at").not("completed_at", "is", null),
      (supabase as any).from("user_notes").select("id").eq("is_archived", false),
      (supabase as any).from("ai_question_logs").select("id,created_at,intent").gte("created_at", new Date(Date.now()-86400000).toISOString()),
      (supabase as any).from("platform_metrics_daily").select("*").order("snapshot_date", { ascending: false }).limit(7),
      (supabase as any).rpc("search_lessons", { p_query: "finance money", p_limit: 10 }).select("title,slug").limit(10),
      (supabase as any).from("content_health_dashboard").select("*"),
      (supabase as any).from("community_health").select("*").single(),
      (supabase as any).from("profiles").select("id,full_name,email,subscription_tier,created_at,xp_total,current_streak").order("created_at", { ascending: false }).limit(20),
      (supabase as any).from("certificates").select("id").eq("is_valid", true),
      (supabase as any).from("weekly_xp_log").select("xp_earned").gte("xp_earned", 0).limit(100),
    ]);

    const profiles    = profilesRes.data    || [];
    const completions = progressRes.data    || [];
    const notes       = notesRes.data       || [];
    const aiQuestions = aiRes.data          || [];
    const snaps       = snapshotsRes.data   || [];
    const health      = healthRes.data      || [];
    const community   = communityRes.data;
    const recent      = recentUsersRes.data || [];
    const certs       = certsRes.data       || [];

    // Derived metrics
    const totalUsers  = profiles.length;
    const proUsers    = profiles.filter((p: any) => p.subscription_tier === "pro").length;
    const expertUsers = profiles.filter((p: any) => p.subscription_tier === "expert").length;
    const paidUsers   = proUsers + expertUsers;
    const convRate    = totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : "0";
    const newToday    = profiles.filter((p: any) => new Date(p.created_at).toDateString() === new Date().toDateString()).length;
    const activeToday = profiles.filter((p: any) => p.current_streak > 0).length;
    const avgStreak   = profiles.length > 0 ? (profiles.reduce((s: number, p: any) => s + (p.current_streak || 0), 0) / profiles.length).toFixed(1) : "0";
    const totalXP     = profiles.reduce((s: number, p: any) => s + (p.xp_total || 0), 0);
    const hindiUsers  = profiles.filter((p: any) => p.language_pref === "hi").length;

    const prev = snaps[1];
    const deltaUsers  = prev ? `${newToday > 0 ? "+" : ""}${newToday} today` : "";
    const deltaConv   = prev ? `${Number(convRate) > 3 ? "↑" : "↓"} vs 3% avg` : "";

    setMetrics([
      { label: "Total Users",       value: totalUsers.toLocaleString("en-IN"), delta: deltaUsers,      deltaUp: newToday > 0,         icon: "👥", color: "#185FA5" },
      { label: "Paid Users",        value: paidUsers.toLocaleString("en-IN"),  delta: `${convRate}% conversion`, deltaUp: Number(convRate)>3, icon: "💎", color: "#7C3AED" },
      { label: "Completions Today", value: completions.filter((c: any) => new Date(c.completed_at).toDateString()===new Date().toDateString()).length, delta: `${completions.length} total`, deltaUp: true, icon: "✅", color: "#1D9E75" },
      { label: "AI Questions Today",value: aiQuestions.length,                delta: "last 24h",        deltaUp: aiQuestions.length>10, icon: "🤖", color: "#0E6163" },
      { label: "Active Streaks",    value: activeToday.toLocaleString("en-IN"),delta: `avg ${avgStreak} days`,deltaUp: Number(avgStreak)>3,icon: "🔥", color: "#D4A017" },
      { label: "Certificates",      value: certs.length.toLocaleString("en-IN"),delta:"all-time",      deltaUp: certs.length>0,       icon: "🏆", color: "#854F0B" },
      { label: "Notes Written",     value: notes.length.toLocaleString("en-IN"),delta:"active notes",  deltaUp: notes.length>0,       icon: "📝", color: "#553C9A" },
      { label: "Hindi Users",       value: hindiUsers.toLocaleString("en-IN"),  delta:`${totalUsers>0?(hindiUsers/totalUsers*100).toFixed(1):0}% of users`, deltaUp: hindiUsers>0, icon: "🇮🇳", color: "#B91C1C" },
    ]);

    setSnapshots(snaps);
    setContentHealth(health);
    setCommunityStats(community);
    setRecentUsers(recent);
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const admin = await verifyAdmin();
      setIsAdmin(admin);
      if (admin) loadAll();
    })();
  }, [verifyAdmin, loadAll]);

  if (!isAdmin) return (
    <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "var(--font-ui,system-ui)" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1c2b3a" }}>Admin Access Required</h2>
      <p style={{ color: "#718096", fontSize: 14 }}>You do not have permission to view this page.</p>
    </div>
  );

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: "10px 18px", fontSize: 13, fontWeight: activeTab === t ? 700 : 400,
    color: activeTab === t ? "#0E6163" : "#718096", background: "none", border: "none",
    borderBottom: activeTab === t ? "2px solid #0E6163" : "2px solid transparent",
    cursor: "pointer", fontFamily: "var(--font-ui,system-ui)", marginBottom: -2,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f7f4ee", fontFamily: "var(--font-ui,system-ui)" }}>

      {/* Top bar */}
      <div style={{
        background: "#1c2b3a", padding: "14px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>📊 Admin Dashboard</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            Last refreshed: {lastRefresh.toLocaleTimeString("en-IN")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={loadAll}
            style={{ padding: "7px 14px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "var(--font-ui,system-ui)" }}>
            🔄 Refresh
          </button>
          <a href="/admin/cms" style={{ padding: "7px 14px", background: "#0E6163", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
            ✏️ Content CMS
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>

        {/* Metrics grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 88, background: "linear-gradient(90deg,#f5f5f5 25%,#ebebeb 50%,#f5f5f5 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 12 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
            {metrics.map(m => (
              <div key={m.label} style={{
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: 12, padding: "16px 18px",
                borderLeft: `4px solid ${m.color}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#1c2b3a", marginBottom: 4 }}>{m.value}</div>
                    <div style={{ fontSize: 12, color: "#718096" }}>{m.label}</div>
                  </div>
                  <div style={{ fontSize: 24 }}>{m.icon}</div>
                </div>
                {m.delta && (
                  <div style={{ fontSize: 11, color: m.deltaUp ? "#1D9E75" : "#E53E3E", marginTop: 8, fontWeight: 600 }}>
                    {m.delta}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ borderBottom: "2px solid #e2e8f0", marginBottom: 20, display: "flex" }}>
          {(["overview","content","users","community"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={tabStyle(t)}>
              {t === "overview" ? "📊 Overview" : t === "content" ? "📚 Content Health" : t === "users" ? "👥 Users" : "💬 Community"}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* 7-day activity */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1c2b3a", margin: "0 0 16px" }}>
                📈 7-Day Activity
              </h3>
              {snapshots.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#a0aec0", fontSize: 13 }}>
                  Run <code style={{ background: "#f7fafc", padding: "2px 6px", borderRadius: 4 }}>SELECT take_daily_snapshot();</code> in Supabase to start collecting daily metrics.
                </div>
              ) : snapshots.slice().reverse().map((snap, i) => {
                const maxUsers = Math.max(...snapshots.map(s => s.active_users_dau || 0)) || 1;
                const pct = ((snap.active_users_dau || 0) / maxUsers) * 100;
                return (
                  <div key={snap.snapshot_date} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
                      <span style={{ color: "#718096" }}>
                        {new Date(snap.snapshot_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}
                      </span>
                      <span style={{ color: "#1c2b3a", fontWeight: 600 }}>
                        {snap.active_users_dau} DAU · {snap.completions_today} completions
                      </span>
                    </div>
                    <div style={{ height: 6, background: "#EDF2F7", borderRadius: 999 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#0E6163", borderRadius: 999, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI intent breakdown */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1c2b3a", margin: "0 0 16px" }}>
                🤖 AI Question Intents (24h)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { intent: "education",      label: "📚 Education",   color: "#185FA5" },
                  { intent: "calculation",    label: "🧮 Calculation", color: "#854F0B" },
                  { intent: "recommendation", label: "💡 Advisory",    color: "#B7791F" },
                  { intent: "comparison",     label: "⚖️ Comparison",  color: "#553C9A" },
                  { intent: "quiz",           label: "🎯 Quiz",        color: "#1D9E75" },
                ].map(({ intent, label, color }) => {
                  const count = 0; // would load from ai_question_logs
                  return (
                    <div key={intent} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#4a5568" }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color, background: color + "15", padding: "2px 10px", borderRadius: 10 }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 14, fontSize: 11, color: "#a0aec0" }}>
                Run the daily snapshot cron to see historical breakdown here.
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1c2b3a", margin: "0 0 16px" }}>
                ⚡ Quick Actions
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "New Lesson", href: "/admin/cms", icon: "✏️", color: "#0E6163" },
                  { label: "Content Health", href: "#", icon: "🔍", color: "#185FA5", onClick: () => setActiveTab("content") },
                  { label: "Review Queue", href: "/admin/reviews", icon: "📋", color: "#D4A017" },
                  { label: "User Reports", href: "/admin/reports", icon: "🚩", color: "#B91C1C" },
                  { label: "Email Preview", href: "/admin/emails", icon: "📧", color: "#553C9A" },
                  { label: "Certificates", href: "/certificates", icon: "🏆", color: "#854F0B" },
                ].map(action => (
                  <a key={action.label}
                    href={action.href}
                    onClick={action.onClick ? (e) => { e.preventDefault(); action.onClick!(); } : undefined}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                      background: "#f8f9fa", border: "1px solid #e2e8f0", borderRadius: 8,
                      textDecoration: "none", color: "#1c2b3a", fontSize: 12, fontWeight: 600,
                      cursor: "pointer",
                    }}>
                    <span style={{ fontSize: 16 }}>{action.icon}</span>
                    {action.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Platform summary */}
            <div style={{ background: "linear-gradient(135deg, #1c2b3a 0%, #0E6163 100%)", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 20px", color: "#fff" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>
                🏆 Platform Health Score
              </h3>
              {[
                { label: "Content quality",    score: contentHealth.length > 0 ? Math.round(contentHealth.reduce((s,c) => s + (c.avg_quality_score || 0), 0) / contentHealth.length) : 0, max: 10 },
                { label: "Review coverage",    score: contentHealth.length > 0 ? Math.round((1 - contentHealth.reduce((s,c) => s + c.unreviewed, 0) / Math.max(contentHealth.reduce((s,c) => s + c.total_lessons, 0), 1)) * 100) : 0, max: 100 },
                { label: "Community answered", score: communityStats?.answer_rate_pct || 0, max: 100 },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>{item.label}</span>
                    <span style={{ color: "#1D9E75", fontWeight: 700 }}>{item.score}{item.max === 100 ? "%" : `/${item.max}`}</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 999 }}>
                    <div style={{ height: "100%", width: `${(item.score / item.max) * 100}%`, background: "#1D9E75", borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENT HEALTH TAB */}
        {activeTab === "content" && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1c2b3a", margin: 0 }}>Content Health by Track</h3>
                <a href="/admin/reviews" style={{ fontSize: 12, color: "#0E6163", textDecoration: "none", fontWeight: 600 }}>View review queue →</a>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 80px 80px 80px 80px 80px", padding: "8px 18px", background: "#f7fafc", borderBottom: "1px solid #f0f0f0", fontSize: 10, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".07em" }}>
                <span>Track</span>
                <span>Lessons</span>
                <span>Reviewed</span>
                <span>Overdue</span>
                <span>Quality</span>
                <span>Hindi</span>
                <span>No Quiz</span>
              </div>
              {contentHealth.map((row, i) => (
                <div key={row.track} style={{
                  display: "grid", gridTemplateColumns: "2fr 80px 80px 80px 80px 80px 80px",
                  padding: "12px 18px", alignItems: "center",
                  borderBottom: i < contentHealth.length - 1 ? "1px solid #f0f0f0" : "none",
                  background: i % 2 === 0 ? "#fff" : "#fafafa",
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a" }}>{row.track}</span>
                  <span style={{ fontSize: 13, color: "#4a5568" }}>{row.total_lessons}</span>
                  <span style={{ fontSize: 13, color: row.unreviewed > 0 ? "#D4A017" : "#1D9E75" }}>
                    {row.total_lessons - row.unreviewed}/{row.total_lessons}
                  </span>
                  <span style={{ fontSize: 13, color: row.overdue_reviews > 0 ? "#E53E3E" : "#1D9E75", fontWeight: row.overdue_reviews > 0 ? 700 : 400 }}>
                    {row.overdue_reviews > 0 ? `⚠️ ${row.overdue_reviews}` : "0"}
                  </span>
                  <span style={{ fontSize: 13, color: (row.avg_quality_score || 0) >= 7 ? "#1D9E75" : "#D4A017" }}>
                    {row.avg_quality_score ? `${Number(row.avg_quality_score).toFixed(1)}/10` : "—"}
                  </span>
                  <span style={{ fontSize: 13, color: row.hindi_lessons > 0 ? "#0E6163" : "#CBD5E0" }}>
                    {row.hindi_lessons > 0 ? `✅ ${row.hindi_lessons}` : "0"}
                  </span>
                  <span style={{ fontSize: 13, color: "#E53E3E" }}>
                    {/* lessons_without_quiz not in view — show placeholder */}—
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1c2b3a", margin: 0 }}>Recent Users (latest 20)</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 120px 80px 80px 80px", padding: "8px 18px", background: "#f7fafc", borderBottom: "1px solid #f0f0f0", fontSize: 10, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".07em" }}>
              <span>User</span><span>Joined</span><span>Plan</span><span>XP</span><span>Streak</span>
            </div>
            {recentUsers.map((user, i) => (
              <div key={user.id} style={{
                display: "grid", gridTemplateColumns: "2fr 120px 80px 80px 80px",
                padding: "11px 18px", alignItems: "center",
                borderBottom: i < recentUsers.length - 1 ? "1px solid #f0f0f0" : "none",
                background: i % 2 === 0 ? "#fff" : "#fafafa",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a" }}>{user.full_name || "—"}</div>
                  <div style={{ fontSize: 11, color: "#a0aec0" }}>{user.email}</div>
                </div>
                <span style={{ fontSize: 12, color: "#718096" }}>
                  {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                  background: user.subscription_tier === "pro" ? "#EBF8FF" : user.subscription_tier === "expert" ? "#FAF5FF" : "#F7FAFC",
                  color: user.subscription_tier === "pro" ? "#185FA5" : user.subscription_tier === "expert" ? "#553C9A" : "#718096",
                }}>
                  {(user.subscription_tier || "free").toUpperCase()}
                </span>
                <span style={{ fontSize: 12, color: "#1D9E75", fontWeight: 600 }}>{(user.xp_total || 0).toLocaleString("en-IN")}</span>
                <span style={{ fontSize: 12, color: (user.current_streak || 0) > 0 ? "#D4A017" : "#CBD5E0" }}>
                  {user.current_streak > 0 ? `🔥${user.current_streak}` : "—"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* COMMUNITY TAB */}
        {activeTab === "community" && communityStats && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1c2b3a", margin: "0 0 16px" }}>Community Stats</h3>
              {[
                { label: "Total Questions",    value: communityStats.total_questions     || 0 },
                { label: "Total Answers",      value: communityStats.total_answers       || 0 },
                { label: "Unanswered",         value: communityStats.unanswered_questions|| 0, alert: true },
                { label: "Answer Rate",        value: `${communityStats.answer_rate_pct || 0}%` },
                { label: "Questions (7 days)", value: communityStats.questions_7d        || 0 },
                { label: "Answers (7 days)",   value: communityStats.answers_7d          || 0 },
              ].map(stat => (
                <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ fontSize: 13, color: "#4a5568" }}>{stat.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: (stat as any).alert && stat.value > 0 ? "#E53E3E" : "#1c2b3a" }}>
                    {(stat as any).alert && stat.value > 0 ? "⚠️ " : ""}{stat.value}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1c2b3a", margin: "0 0 16px" }}>Moderation Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Review flagged content",  href: "/admin/moderation", icon: "🚩" },
                  { label: "View unanswered questions",href: "/admin/unanswered",  icon: "❓" },
                  { label: "Pin best answers",         href: "/admin/pin",         icon: "📌" },
                  { label: "Add staff answers",        href: "/admin/staff-answer",icon: "👨🏫" },
                ].map(action => (
                  <a key={action.label} href={action.href}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#f8f9fa", border: "1px solid #e2e8f0", borderRadius: 9, textDecoration: "none", color: "#1c2b3a", fontSize: 13 }}>
                    <span style={{ fontSize: 18 }}>{action.icon}</span>
                    {action.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
