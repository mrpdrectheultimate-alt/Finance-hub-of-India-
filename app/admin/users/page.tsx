"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type AdminUser = {
  id: string;
  full_name: string | null;
  role: "free" | "pro" | "expert";
  xp_total: number;
  streak_current: number;
  streak_longest: number;
  last_active_date: string | null;
  onboarding_done: boolean;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "free" | "pro" | "expert">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "xp_total" | "streak_current">("created_at");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order(sortBy, { ascending: false }).limit(200);
    setUsers((data as AdminUser[]) || []);
    setLoading(false);
  };

  const updateRole = async (userId: string, role: "free" | "pro" | "expert") => {
    await supabase.from("profiles").update({ role }).eq("id", userId);
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => (prev ? { ...prev, role } : null));
    }
  };

  const sendEmail = async (userId: string, type: "welcome" | "streak_reminder") => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token || ""}`,
      },
      body: JSON.stringify({ type, userId }),
    });

    alert(response.ok ? "Email sent" : "Email could not be sent");
  };

  const filtered = users.filter((user) => {
    const query = search.toLowerCase();
    const matchRole = filter === "all" || user.role === filter;
    const matchSearch = !query || (user.full_name || "").toLowerCase().includes(query) || user.id.includes(query);
    return matchRole && matchSearch;
  });

  const counts = {
    all: users.length,
    free: users.filter((user) => user.role === "free").length,
    pro: users.filter((user) => user.role === "pro").length,
    expert: users.filter((user) => user.role === "expert").length,
  };

  const paying = counts.pro + counts.expert;
  const conversion = Math.round((paying / (counts.all || 1)) * 100);

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
            { icon: "US", label: "Users", href: "/admin/users", active: true },
            { icon: "AN", label: "Analytics", href: "/admin/analytics" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ ...s.navItem, ...(item.active ? s.navActive : {}) }}>
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
          <div>
            <h1 style={s.title}>Users</h1>
            <p style={s.sub}>
              {counts.all} total | {paying} paying | {conversion}% conversion
            </p>
          </div>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} style={s.sortSelect}>
            <option value="created_at">Sort: Newest</option>
            <option value="xp_total">Sort: Most XP</option>
            <option value="streak_current">Sort: Best streak</option>
          </select>
        </div>

        <div style={s.toolbar}>
          <div style={s.filterTabs}>
            {(["all", "free", "pro", "expert"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{ ...s.filterTab, ...(filter === tab ? s.filterActive : {}) }}
                type="button"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
              </button>
            ))}
          </div>
          <input
            placeholder="Search by name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={s.searchInput}
          />
        </div>

        <div style={s.layout}>
          <div style={{ flex: 1 }}>
            <div style={s.table}>
              <div style={s.tableHeader}>
                {["User", "Role", "XP", "Streak", "Last active", "Actions"].map((header) => (
                  <div key={header} style={s.th}>
                    {header}
                  </div>
                ))}
              </div>

              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <div key={i} style={s.skeletonRow} />)
              ) : filtered.length === 0 ? (
                <div style={s.empty}>No users found</div>
              ) : (
                filtered.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    style={{ ...s.tableRow, ...(selectedUser?.id === user.id ? s.rowSelected : {}) }}
                  >
                    <div style={s.td}>
                      <div style={s.userAvatar}>{avatarLetter(user.full_name)}</div>
                      <div>
                        <div style={s.userName}>{user.full_name || "Anonymous"}</div>
                        <div style={s.userId}>{user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                    <div style={s.td}>
                      <span style={{ ...s.rolePill, ...roleStyle(user.role) }}>{user.role}</span>
                    </div>
                    <div style={{ ...s.td, fontWeight: 600, color: "#0a0a0a" }}>{user.xp_total}</div>
                    <div style={s.td}>{user.streak_current} days</div>
                    <div style={s.td}>
                      <span style={{ ...s.activeDot, background: isActive(user.last_active_date) ? "#1D9E75" : "#ddd" }} />
                      {user.last_active_date
                        ? new Date(user.last_active_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                        : "Never"}
                    </div>
                    <div style={s.td}>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedUser(user);
                        }}
                        style={s.viewBtn}
                        type="button"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedUser ? (
            <div style={s.detailPanel}>
              <div style={s.detailHeader}>
                <div style={s.detailAvatar}>{avatarLetter(selectedUser.full_name)}</div>
                <div>
                  <div style={s.detailName}>{selectedUser.full_name || "Anonymous"}</div>
                  <div style={s.detailId}>{selectedUser.id.slice(0, 12)}...</div>
                </div>
                <button onClick={() => setSelectedUser(null)} style={s.closeBtn} type="button">
                  Close
                </button>
              </div>

              <div style={s.detailStats}>
                {[
                  ["Role", selectedUser.role],
                  ["XP", selectedUser.xp_total.toString()],
                  ["Streak", `${selectedUser.streak_current} days`],
                  ["Best streak", `${selectedUser.streak_longest} days`],
                  [
                    "Joined",
                    new Date(selectedUser.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  ],
                  ["Last active", selectedUser.last_active_date || "Never"],
                  ["Onboarding", selectedUser.onboarding_done ? "Done" : "Pending"],
                ].map(([label, value]) => (
                  <div key={label} style={s.detailRow}>
                    <span style={s.detailLabel}>{label}</span>
                    <span style={s.detailVal}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={s.detailSection}>
                <div style={s.detailSectionTitle}>Change role</div>
                <div style={s.roleButtons}>
                  {(["free", "pro", "expert"] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => updateRole(selectedUser.id, role)}
                      style={{ ...s.roleBtn, ...(selectedUser.role === role ? s.roleBtnActive : {}) }}
                      type="button"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.detailSection}>
                <div style={s.detailSectionTitle}>Send email</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button onClick={() => sendEmail(selectedUser.id, "welcome")} style={s.emailBtn} type="button">
                    Welcome email
                  </button>
                  <button onClick={() => sendEmail(selectedUser.id, "streak_reminder")} style={s.emailBtn} type="button">
                    Streak reminder
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function avatarLetter(name: string | null) {
  return (name || "?")[0].toUpperCase();
}

function isActive(date: string | null) {
  if (!date) return false;
  return new Date(date) >= new Date(Date.now() - 7 * 86400000);
}

function roleStyle(role: AdminUser["role"]) {
  const styles = {
    free: { background: "#F5F5F3", color: "#888" },
    pro: { background: "#E1F5EE", color: "#0F6E56" },
    expert: { background: "#EEEDFE", color: "#534AB7" },
  };

  return styles[role];
}

const s: Record<string, CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui, -apple-system, sans-serif" },
  sidebar: { width: 200, background: "#0a0a0a", display: "flex", flexDirection: "column", padding: "20px 0", position: "fixed", height: "100vh" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "0 16px 24px" },
  logoMark: { width: 28, height: 28, background: "#1D9E75", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 },
  logoText: { fontWeight: 600, fontSize: 14, color: "#fff" },
  adminTag: { fontSize: 10, color: "#1D9E75", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" },
  nav: { display: "flex", flexDirection: "column", gap: 2, padding: "0 8px", flex: 1 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, fontSize: 13, color: "#aaa", textDecoration: "none" },
  navActive: { background: "rgba(255,255,255,0.08)", color: "#fff" },
  navIcon: { width: 24, color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: ".04em" },
  backToApp: { fontSize: 12, color: "#666", textDecoration: "none", padding: "12px 16px", borderTop: "0.5px solid #222" },
  main: { marginLeft: 200, flex: 1, padding: "24px 28px" },
  topBar: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: "#0a0a0a", margin: "0 0 4px", letterSpacing: "-0.4px" },
  sub: { fontSize: 13, color: "#888", margin: 0 },
  sortSelect: { padding: "8px 12px", fontSize: 13, border: "0.5px solid #ddd", borderRadius: 8, background: "#fff", fontFamily: "system-ui", outline: "none" },
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 },
  filterTabs: { display: "flex", gap: 4 },
  filterTab: { padding: "7px 14px", fontSize: 12, fontWeight: 500, border: "0.5px solid #ddd", borderRadius: 20, background: "#fff", color: "#666", cursor: "pointer", fontFamily: "system-ui" },
  filterActive: { background: "#0a0a0a", color: "#fff", border: "0.5px solid #0a0a0a" },
  searchInput: { padding: "8px 14px", fontSize: 13, border: "0.5px solid #ddd", borderRadius: 9, outline: "none", fontFamily: "system-ui", width: 200 },
  layout: { display: "flex", gap: 16, alignItems: "flex-start" },
  table: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, overflow: "hidden" },
  tableHeader: { display: "grid", gridTemplateColumns: "2fr 1fr 0.8fr 0.8fr 1fr 0.6fr", background: "#fafafa", borderBottom: "0.5px solid #eee" },
  th: { padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: ".04em" },
  skeletonRow: { height: 52, borderBottom: "0.5px solid #f5f5f5", background: "#fafafa" },
  empty: { padding: 36, color: "#999", fontSize: 13, textAlign: "center" },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 1fr 0.8fr 0.8fr 1fr 0.6fr", borderBottom: "0.5px solid #f5f5f5", cursor: "pointer", transition: "background .1s" },
  rowSelected: { background: "#F0FAF6" },
  td: { padding: "11px 14px", fontSize: 13, color: "#333", display: "flex", alignItems: "center", gap: 8 },
  userAvatar: { width: 28, height: 28, borderRadius: "50%", background: "#E1F5EE", color: "#0F6E56", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  userName: { fontWeight: 600, fontSize: 13, color: "#0a0a0a" },
  userId: { fontSize: 10, color: "#ccc", fontFamily: "monospace" },
  rolePill: { fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20 },
  activeDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  viewBtn: { padding: "4px 10px", fontSize: 11, fontWeight: 600, background: "#F5F5F3", color: "#555", border: "none", borderRadius: 7, cursor: "pointer", fontFamily: "system-ui" },
  detailPanel: { width: 280, flexShrink: 0, background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: 18, position: "sticky", top: 16 },
  detailHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "0.5px solid #eee" },
  detailAvatar: { width: 40, height: 40, borderRadius: "50%", background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 },
  detailName: { fontWeight: 700, fontSize: 14, color: "#0a0a0a" },
  detailId: { fontSize: 10, color: "#ccc", fontFamily: "monospace" },
  closeBtn: { marginLeft: "auto", fontSize: 11, color: "#888", background: "#F5F5F3", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer" },
  detailStats: { marginBottom: 16 },
  detailRow: { display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: "0.5px solid #f5f5f5" },
  detailLabel: { color: "#aaa" },
  detailVal: { fontWeight: 600, color: "#333", textAlign: "right" },
  detailSection: { marginTop: 14, paddingTop: 14, borderTop: "0.5px solid #eee" },
  detailSectionTitle: { fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 },
  roleButtons: { display: "flex", gap: 6 },
  roleBtn: { flex: 1, padding: 7, fontSize: 12, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 8, background: "#fff", color: "#555", cursor: "pointer", fontFamily: "system-ui" },
  roleBtnActive: { background: "#0a0a0a", color: "#fff" },
  emailBtn: { width: "100%", padding: "8px 12px", fontSize: 12, fontWeight: 500, border: "0.5px solid #ddd", borderRadius: 8, background: "#fff", color: "#333", cursor: "pointer", fontFamily: "system-ui", textAlign: "left" },
};
