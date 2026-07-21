"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Stats = {
  totalUsers: number;
  proUsers: number;
  expertUsers: number;
  totalLessons: number;
  publishedLessons: number;
  totalCompletions: number;
  aiConversations: number;
  activeToday: number;
};

type RecentUser = {
  id: string;
  full_name: string | null;
  role: string;
  xp_total: number;
  streak_current: number;
  created_at: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    const today = new Date().toISOString().split("T")[0];
    const [
      { count: totalUsers },
      { count: proUsers },
      { count: expertUsers },
      { count: totalLessons },
      { count: publishedLessons },
      { count: totalCompletions },
      { count: aiConversations },
      { count: activeToday },
      { data: recent },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "pro"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "expert"),
      supabase.from("lessons").select("*", { count: "exact", head: true }),
      supabase.from("lessons").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("user_progress").select("*", { count: "exact", head: true }),
      supabase.from("ai_conversations").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("last_active_date", today),
      supabase
        .from("profiles")
        .select("id, full_name, role, xp_total, streak_current, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    setStats({
      totalUsers: totalUsers || 0,
      proUsers: proUsers || 0,
      expertUsers: expertUsers || 0,
      totalLessons: totalLessons || 0,
      publishedLessons: publishedLessons || 0,
      totalCompletions: totalCompletions || 0,
      aiConversations: aiConversations || 0,
      activeToday: activeToday || 0,
    });
    setRecentUsers((recent as RecentUser[]) || []);
    setLoading(false);
  };

  const roleColor: Record<string, string> = {
    free: "#888",
    pro: "#1D9E75",
    expert: "#534AB7",
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
          {[
            { icon: "OV", label: "Overview", href: "/admin" },
            { icon: "LS", label: "Lessons", href: "/admin/lessons" },
            { icon: "US", label: "Users", href: "/admin/users" },
            { icon: "AN", label: "Analytics", href: "/admin/analytics" },
            { icon: "AI", label: "AI logs", href: "/admin/ai-logs" },
            { icon: "PY", label: "Payments", href: "https://dashboard.stripe.com" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={s.navItem}>
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <Link href="/dashboard" style={s.backToApp}>
          Back to app
        </Link>
      </aside>

      <main style={s.main}>
        <div style={s.topBar}>
          <h1 style={s.title}>Overview</h1>
          <div style={s.dateStr}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
        </div>

        {loading ? (
          <div style={s.loadingGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={s.skeleton} />
            ))}
          </div>
        ) : (
          <>
            <div style={s.statsGrid}>
              {[
                { label: "Total users", val: stats?.totalUsers, icon: "US", color: "#E6F1FB", accent: "#185FA5" },
                { label: "Active today", val: stats?.activeToday, icon: "AT", color: "#E1F5EE", accent: "#1D9E75" },
                { label: "Pro subscribers", val: stats?.proUsers, icon: "PR", color: "#E1F5EE", accent: "#1D9E75" },
                { label: "Expert subscribers", val: stats?.expertUsers, icon: "EX", color: "#EEEDFE", accent: "#534AB7" },
                { label: "Published lessons", val: stats?.publishedLessons, icon: "LS", color: "#FAEEDA", accent: "#854F0B" },
                { label: "Total completions", val: stats?.totalCompletions, icon: "CP", color: "#E1F5EE", accent: "#1D9E75" },
                { label: "AI conversations", val: stats?.aiConversations, icon: "AI", color: "#F5F5F3", accent: "#444" },
                {
                  label: "Conversion rate",
                  val: stats?.totalUsers
                    ? `${Math.round(((stats.proUsers + stats.expertUsers) / stats.totalUsers) * 100)}%`
                    : "0%",
                  icon: "CV",
                  color: "#E1F5EE",
                  accent: "#1D9E75",
                },
              ].map((item, i) => (
                <div key={i} style={{ ...s.statCard, background: item.color }}>
                  <div style={s.statIcon}>{item.icon}</div>
                  <div style={{ ...s.statVal, color: item.accent }}>{item.val}</div>
                  <div style={s.statLabel}>{item.label}</div>
                </div>
              ))}
            </div>

            <div style={s.section}>
              <h2 style={s.sectionTitle}>Quick actions</h2>
              <div style={s.actionsGrid}>
                {[
                  { icon: "ADD", label: "Add new lesson", href: "/admin/lessons/new", color: "#1D9E75" },
                  { icon: "EDIT", label: "Manage lessons", href: "/admin/lessons", color: "#185FA5" },
                  { icon: "USER", label: "View all users", href: "/admin/users", color: "#534AB7" },
                  { icon: "DATA", label: "Analytics", href: "/admin/analytics", color: "#854F0B" },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    style={{ ...s.actionCard, borderColor: `${action.color}40` }}
                  >
                    <div style={{ ...s.actionIcon, color: action.color }}>{action.icon}</div>
                    <div style={s.actionLabel}>{action.label}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div style={s.section}>
              <div style={s.sectionRow}>
                <h2 style={s.sectionTitle}>Recent sign-ups</h2>
                <Link href="/admin/users" style={s.seeAll}>
                  See all
                </Link>
              </div>
              <div style={s.table}>
                <div style={s.tableHeader}>
                  {["Name", "Role", "XP", "Streak", "Joined"].map((header) => (
                    <div key={header} style={s.th}>
                      {header}
                    </div>
                  ))}
                </div>
                {recentUsers.map((user) => {
                  const color = roleColor[user.role] || roleColor.free;

                  return (
                    <div key={user.id} style={s.tableRow}>
                      <div style={s.td}>{user.full_name || "Anonymous"}</div>
                      <div style={s.td}>
                        <span style={{ ...s.rolePill, color, background: `${color}22` }}>{user.role}</span>
                      </div>
                      <div style={s.td}>{user.xp_total} XP</div>
                      <div style={s.td}>{user.streak_current} days</div>
                      <div style={s.td}>
                        {new Date(user.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui, -apple-system, sans-serif" },
  sidebar: { width: 200, background: "#0a0a0a", display: "flex", flexDirection: "column", padding: "20px 0", position: "fixed", height: "100vh" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "0 16px 24px" },
  logoMark: { width: 28, height: 28, background: "#1D9E75", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 },
  logoText: { fontWeight: 600, fontSize: 14, color: "#fff" },
  adminTag: { fontSize: 10, color: "#1D9E75", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" },
  nav: { display: "flex", flexDirection: "column", gap: 2, padding: "0 8px", flex: 1 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, fontSize: 13, color: "#aaa", textDecoration: "none", transition: "all .15s" },
  navIcon: { width: 24, color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: ".04em" },
  backToApp: { fontSize: 12, color: "#666", textDecoration: "none", padding: "12px 16px", borderTop: "0.5px solid #222" },
  main: { marginLeft: 200, flex: 1, padding: "24px 28px" },
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: "-0.4px" },
  dateStr: { fontSize: 13, color: "#aaa" },
  loadingGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  skeleton: { height: 90, background: "#eee", borderRadius: 12, animation: "pulse 1.5s infinite" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(140px, 1fr))", gap: 12, marginBottom: 28 },
  statCard: { borderRadius: 12, padding: 16 },
  statIcon: { fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "#555", marginBottom: 8 },
  statVal: { fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 },
  statLabel: { fontSize: 11, color: "#666" },
  section: { marginBottom: 28 },
  sectionRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: "#0a0a0a", margin: "0 0 14px" },
  seeAll: { fontSize: 12, color: "#1D9E75", textDecoration: "none" },
  actionsGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(140px, 1fr))", gap: 12 },
  actionCard: { background: "#fff", border: "0.5px solid", borderRadius: 12, padding: 16, textDecoration: "none", transition: "transform .15s" },
  actionIcon: { fontSize: 11, fontWeight: 800, letterSpacing: ".06em", marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: 600, color: "#0a0a0a" },
  table: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, overflow: "hidden" },
  tableHeader: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", background: "#fafafa", borderBottom: "0.5px solid #eee" },
  th: { padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: ".04em" },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", borderBottom: "0.5px solid #f5f5f5" },
  td: { padding: "12px 16px", fontSize: 13, color: "#333", display: "flex", alignItems: "center" },
  rolePill: { fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20 },
};
