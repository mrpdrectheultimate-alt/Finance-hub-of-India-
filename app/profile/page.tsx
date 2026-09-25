"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MasteryDashboard from "@/components/adaptive/MasteryDashboard";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  role: string | null;
  xp_total: number | null;
  streak_current: number | null;
  streak_longest: number | null;
  created_at: string | null;
};

type BadgeRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
};

type EarnedBadge = {
  id: string;
  earned_at: string;
  badge: BadgeRow | null;
};

type XpLogEntry = {
  id: string;
  xp_amount: number;
  reason: string;
  created_at: string;
};

type Stats = {
  lessonsCompleted: number;
  quizzesPassed: number;
  avgQuizScore: number;
  aiQuestions: number;
  tradesPlaced: number;
  booksMarked: number;
  downloadsCount: number;
  totalTimeMinutes: number;
};

const XP_LEVELS = [
  { level: 1, name: "Beginner", min: 0, color: "#888888" },
  { level: 2, name: "Learner", min: 500, color: "#185FA5" },
  { level: 3, name: "Intermediate", min: 1500, color: "#1D9E75" },
  { level: 4, name: "Advanced", min: 3500, color: "#534AB7" },
  { level: 5, name: "Expert", min: 7000, color: "#854F0B" },
  { level: 6, name: "Master", min: 15000, color: "#B91C1C" },
];

function getLevel(xp: number) {
  return [...XP_LEVELS].reverse().find((level) => xp >= level.min) || XP_LEVELS[0];
}

function getInitials(name: string | null, email: string) {
  const source = name?.trim() || email.split("@")[0] || "U";
  return source
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeRow[]>([]);
  const [xpLog, setXpLog] = useState<XpLogEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "badges" | "settings">("overview");

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setEmail(user.email || "");

    const [
      profileRes,
      earnedBadgesRes,
      allBadgesRes,
      xpLogRes,
      progressRes,
      aiUsageRes,
      bookReadsRes,
      downloadsRes,
      portfoliosRes,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("user_badges")
        .select("id, earned_at, badge:badges(id, slug, title, description, icon)")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false }),
      supabase.from("badges").select("id, slug, title, description, icon").order("title", { ascending: true }),
      supabase.from("user_xp_log").select("id, xp_amount, reason, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("user_progress").select("quiz_score, time_spent_secs").eq("user_id", user.id),
      supabase.from("ai_usage_daily").select("count").eq("user_id", user.id),
      supabase.from("user_book_reads").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("user_downloads").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("paper_portfolios").select("id").eq("user_id", user.id),
    ]);

    const portfolioIds = ((portfoliosRes.data as any[]) || []).map((item: any) => item.id);
    const tradesRes = portfolioIds.length
      ? await supabase.from("paper_orders").select("id", { count: "exact", head: true }).in("portfolio_id", portfolioIds)
      : { count: 0 };

    const progress = progressRes.data || [];
    const quizScores = progress
      .map((item: { quiz_score: number | null }) => item.quiz_score)
      .filter((score): score is number => typeof score === "number");

    setProfile((profileRes.data as Profile | null) || null);
    setNewName((profileRes.data as Profile | null)?.full_name || "");
    setBadges((earnedBadgesRes.data as unknown as EarnedBadge[]) || []);
    setAllBadges((allBadgesRes.data as BadgeRow[]) || []);
    setXpLog((xpLogRes.data as XpLogEntry[]) || []);
    setStats({
      lessonsCompleted: progress.length,
      quizzesPassed: quizScores.filter((score) => score >= 70).length,
      avgQuizScore: quizScores.length ? Math.round(quizScores.reduce((total, score) => total + score, 0) / quizScores.length) : 0,
      aiQuestions: ((aiUsageRes.data as any[]) || []).reduce((total: number, row: any) => total + (row.count || 0), 0),
      tradesPlaced: tradesRes.count || 0,
      booksMarked: bookReadsRes.count || 0,
      downloadsCount: downloadsRes.count || 0,
      totalTimeMinutes: Math.round(progress.reduce((total: number, item: { time_spent_secs: number | null }) => total + (item.time_spent_secs || 0), 0) / 60),
    });

    setLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveName = async () => {
    if (!profile || !newName.trim()) return;
    setSaving(true);
    const cleanName = newName.trim();
    await supabase.from("profiles").update({ full_name: cleanName }).eq("id", profile.id);
    setProfile({ ...profile, full_name: cleanName });
    setEditingName(false);
    setSaving(false);
  };

  const manageSubscription = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    setSubLoading(true);
    const res = await fetch("/api/create-portal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const data = await res.json();
    setSubLoading(false);

    if (data.url) {
      window.location.href = data.url;
      return;
    }

    alert("Could not open billing portal. Please try again.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div style={s.loadingPage}>
        <div style={s.loadingCard}>Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={s.loadingPage}>
        <div style={s.loadingCard}>Profile not found.</div>
      </div>
    );
  }

  const role = profile.role || "free";
  const xpTotal = profile.xp_total || 0;
  const currentLevel = getLevel(xpTotal);
  const nextLevel = XP_LEVELS.find((level) => level.min > xpTotal);
  const xpInLevel = xpTotal - currentLevel.min;
  const xpNeeded = nextLevel ? nextLevel.min - currentLevel.min : 1;
  const xpPct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  const initials = getInitials(profile.full_name, email);
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "recently";

  const roleConfig =
    role === "expert"
      ? { label: "Expert", color: "#534AB7", bg: "#EEEDFE" }
      : role === "pro"
        ? { label: "Pro", color: "#1D9E75", bg: "#E1F5EE" }
        : { label: "Free", color: "#666666", bg: "#F5F5F3" };

  const earnedSlugs = new Set(badges.map((item) => item.badge?.slug).filter(Boolean));

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <Link href="/dashboard" style={s.backLink}>
          Back to dashboard
        </Link>

        <section style={s.hero}>
          <div style={s.heroLeft}>
            <div style={s.avatar}>{initials}</div>
            <div style={s.heroCopy}>
              {editingName ? (
                <div style={s.nameEdit}>
                  <input value={newName} onChange={(event) => setNewName(event.target.value)} style={s.nameInput} autoFocus />
                  <button onClick={saveName} disabled={saving} style={s.primarySmall} type="button">
                    {saving ? "Saving" : "Save"}
                  </button>
                  <button onClick={() => setEditingName(false)} style={s.ghostSmall} type="button">
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={s.nameRow}>
                  <h1 style={s.name}>{profile.full_name || "Set your name"}</h1>
                  <button onClick={() => setEditingName(true)} style={s.linkButton} type="button">
                    Edit
                  </button>
                </div>
              )}

              <div style={s.metaRow}>
                <span style={s.email}>{email}</span>
                <span style={{ ...s.rolePill, color: roleConfig.color, background: roleConfig.bg }}>{roleConfig.label}</span>
                <span style={s.memberSince}>Member since {memberSince}</span>
              </div>
            </div>
          </div>

          <div style={s.levelPanel}>
            <div style={s.levelTop}>
              <span style={{ ...s.levelBadge, background: currentLevel.color }}>Level {currentLevel.level}</span>
              <span style={s.levelName}>{currentLevel.name}</span>
            </div>
            <div style={s.xpTotal}>{xpTotal.toLocaleString()} XP</div>
            <div style={s.xpTrack}>
              <div style={{ ...s.xpFill, width: `${xpPct}%`, background: currentLevel.color }} />
            </div>
            <div style={s.xpCaption}>{nextLevel ? `${nextLevel.min - xpTotal} XP to ${nextLevel.name}` : "Top level reached"}</div>
          </div>
        </section>

        <section style={s.statsGrid}>
          {[
            { label: "Current streak", value: profile.streak_current || 0, suffix: " days" },
            { label: "Best streak", value: profile.streak_longest || 0, suffix: " days" },
            { label: "Lessons complete", value: stats?.lessonsCompleted || 0, suffix: "" },
            { label: "Quizzes passed", value: stats?.quizzesPassed || 0, suffix: "" },
            { label: "Badges earned", value: badges.length, suffix: "" },
            { label: "Avg quiz score", value: stats?.avgQuizScore || 0, suffix: "%" },
          ].map((item) => (
            <div key={item.label} style={s.statCard}>
              <div style={s.statValue}>
                {item.value}
                {item.suffix}
              </div>
              <div style={s.statLabel}>{item.label}</div>
            </div>
          ))}
        </section>

        <div style={s.tabs}>
          {(["overview", "badges", "settings"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }} type="button">
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <>
            <section style={s.planCard}>
              <div>
                <div style={s.sectionTitle}>{roleConfig.label} plan</div>
                <div style={s.mutedText}>
                  {role === "free" ? "Upgrade to unlock all lessons, unlimited AI, certificates, and advanced labs." : "Your premium learning tools are active."}
                </div>
              </div>
              {role === "free" ? (
                <Link href="/pricing" style={s.primaryLink}>
                  Upgrade to Pro
                </Link>
              ) : (
                <button onClick={manageSubscription} disabled={subLoading} style={s.secondaryButton} type="button">
                  {subLoading ? "Opening..." : "Manage billing"}
                </button>
              )}
            </section>

            <section style={s.section}>
              <div style={s.sectionTitle}>Learning progress</div>
              <div style={s.progressGrid}>
                {[
                  { label: "Lessons completed", value: stats?.lessonsCompleted || 0, max: 55, color: "#185FA5" },
                  { label: "Quizzes passed", value: stats?.quizzesPassed || 0, max: 30, color: "#1D9E75" },
                  { label: "AI questions asked", value: stats?.aiQuestions || 0, max: 100, color: "#534AB7" },
                  { label: "Books saved", value: stats?.booksMarked || 0, max: 30, color: "#854F0B" },
                  { label: "Downloads", value: stats?.downloadsCount || 0, max: 25, color: "#B91C1C" },
                  { label: "Trades placed", value: stats?.tradesPlaced || 0, max: 50, color: "#0F6E56" },
                ].map((item) => (
                  <div key={item.label} style={s.progressItem}>
                    <div style={s.progressHeader}>
                      <span>{item.label}</span>
                      <strong style={{ color: item.color }}>{item.value}</strong>
                    </div>
                    <div style={s.progressTrack}>
                      <div style={{ ...s.progressFill, width: `${Math.min(100, (item.value / item.max) * 100)}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={s.section}>
              <div style={s.sectionTitle}>Mastery</div>
              <MasteryDashboard />
            </section>

            <section style={s.section}>
              <div style={s.sectionTitle}>Quick links</div>
              <div style={s.quickLinks}>
                {[
                  { href: "/explore", label: "Continue learning", code: "EX" },
                  { href: "/library", label: "Video and book library", code: "LB" },
                  { href: "/simulators", label: "Open simulators", code: "SM" },
                  { href: "/career", label: "Career hub", code: "CR" },
                  { href: "/ai-tutor", label: "Ask AI tutor", code: "AI" },
                  { href: "/ai-exam", label: "Practice exam", code: "PE" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} style={s.quickLink}>
                    <span style={s.quickCode}>{link.code}</span>
                    <span style={s.quickLabel}>{link.label}</span>
                    <span style={s.quickArrow}>-&gt;</span>
                  </Link>
                ))}
              </div>
            </section>

            <section style={s.section}>
              <div style={s.sectionTitle}>Recent XP activity</div>
              <div style={s.xpList}>
                {xpLog.length ? (
                  xpLog.map((entry) => (
                    <div key={entry.id} style={s.xpRow}>
                      <div style={s.xpReason}>{entry.reason.replaceAll("_", " ")}</div>
                      <div style={s.xpDate}>{new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                      <div style={s.xpAmount}>+{entry.xp_amount} XP</div>
                    </div>
                  ))
                ) : (
                  <div style={s.empty}>Complete lessons and quizzes to earn XP.</div>
                )}
              </div>
            </section>
          </>
        ) : null}

        {activeTab === "badges" ? (
          <section style={s.section}>
            <div style={s.sectionHeader}>
              <div style={s.sectionTitle}>Badges</div>
              <div style={s.mutedText}>
                {badges.length} / {allBadges.length} earned
              </div>
            </div>
            {allBadges.length ? (
              <div style={s.badgeGrid}>
                {allBadges.map((badge) => {
                  const earned = earnedSlugs.has(badge.slug);
                  const earnedEntry = badges.find((item) => item.badge?.slug === badge.slug);
                  return (
                    <div key={badge.id} style={{ ...s.badgeCard, opacity: earned ? 1 : 0.55 }}>
                      <div style={s.badgeIcon}>{badge.icon || "Badge"}</div>
                      <div style={s.badgeTitle}>{badge.title}</div>
                      <div style={s.badgeDesc}>{earned ? `Earned ${new Date(earnedEntry?.earned_at || "").toLocaleDateString("en-IN")}` : badge.description || "Locked"}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={s.empty}>No badges configured yet.</div>
            )}
          </section>
        ) : null}

        {activeTab === "settings" ? (
          <section style={s.settingsStack}>
            <div style={s.settingsCard}>
              <div style={s.sectionTitle}>Account</div>
              <div style={s.settingRow}>
                <span>Display name</span>
                <button onClick={() => setEditingName(true)} style={s.linkButton} type="button">
                  Edit name
                </button>
              </div>
              <div style={s.settingRow}>
                <span>Email address</span>
                <strong>{email}</strong>
              </div>
              <div style={s.settingRow}>
                <span>Plan</span>
                <span style={{ ...s.rolePill, color: roleConfig.color, background: roleConfig.bg }}>{roleConfig.label}</span>
              </div>
              <div style={s.settingRow}>
                <span>Member since</span>
                <strong>{memberSince}</strong>
              </div>
            </div>

            <div style={s.settingsCard}>
              <div style={s.sectionTitle}>Session</div>
              <div style={s.settingRow}>
                <span>Sign out of this account</span>
                <button onClick={signOut} style={s.dangerButton} type="button">
                  Sign out
                </button>
              </div>
            </div>

            <div style={s.legalLinks}>
              <Link href="/privacy" style={s.legalLink}>
                Privacy Policy
              </Link>
              <Link href="/terms" style={s.legalLink}>
                Terms of Service
              </Link>
              <a href="mailto:hello@financehub.in" style={s.legalLink}>
                Contact Support
              </a>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "var(--bg-page, #fafafa)", color: "var(--text-primary, #0a0a0a)", fontFamily: "system-ui, -apple-system, sans-serif", padding: "24px 18px 64px" },
  inner: { maxWidth: 940, margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", fontFamily: "system-ui, -apple-system, sans-serif" },
  loadingCard: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "18px 22px", color: "#666" },
  backLink: { display: "inline-block", marginBottom: 16, fontSize: 13, color: "var(--text-muted, #888)", textDecoration: "none" },
  hero: { display: "flex", alignItems: "stretch", justifyContent: "space-between", gap: 16, flexWrap: "wrap", background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 14, padding: 20, marginBottom: 14 },
  heroLeft: { display: "flex", alignItems: "center", gap: 16, minWidth: 260, flex: "1 1 360px" },
  avatar: { width: 64, height: 64, borderRadius: "50%", background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, flexShrink: 0 },
  heroCopy: { minWidth: 0 },
  nameRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 },
  name: { margin: 0, fontSize: 24, lineHeight: 1.15, fontWeight: 800, letterSpacing: 0, color: "var(--text-primary, #0a0a0a)" },
  nameEdit: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 },
  nameInput: { padding: "8px 10px", fontSize: 15, border: "1px solid #1D9E75", borderRadius: 8, outline: "none", background: "var(--bg-card, #fff)", color: "var(--text-primary, #0a0a0a)" },
  primarySmall: { padding: "8px 12px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" },
  ghostSmall: { padding: "8px 12px", background: "transparent", color: "var(--text-secondary, #555)", border: "0.5px solid var(--border, #ddd)", borderRadius: 8, fontSize: 12, cursor: "pointer" },
  linkButton: { background: "transparent", border: "none", padding: 0, color: "#1D9E75", cursor: "pointer", fontSize: 12, fontWeight: 700 },
  metaRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  email: { fontSize: 12, color: "var(--text-muted, #888)" },
  rolePill: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800 },
  memberSince: { fontSize: 11, color: "var(--text-muted, #aaa)" },
  levelPanel: { minWidth: 220, flex: "0 1 260px", background: "var(--bg-surface, #f7f7f5)", borderRadius: 12, padding: 14 },
  levelTop: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  levelBadge: { display: "inline-flex", color: "#fff", padding: "3px 8px", borderRadius: 7, fontSize: 11, fontWeight: 800 },
  levelName: { fontSize: 13, fontWeight: 700, color: "var(--text-secondary, #555)" },
  xpTotal: { fontSize: 26, fontWeight: 800, color: "var(--text-primary, #0a0a0a)", marginBottom: 8 },
  xpTrack: { height: 7, background: "var(--border, #e6e6e6)", borderRadius: 4, overflow: "hidden", marginBottom: 6 },
  xpFill: { height: "100%", borderRadius: 4, transition: "width .35s ease" },
  xpCaption: { fontSize: 11, color: "var(--text-muted, #888)" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 },
  statCard: { background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 12, padding: "15px 12px", textAlign: "center" },
  statValue: { fontSize: 20, fontWeight: 800, color: "#1D9E75", marginBottom: 3 },
  statLabel: { fontSize: 11, color: "var(--text-muted, #888)" },
  tabs: { display: "flex", gap: 4, borderBottom: "0.5px solid var(--border, #e5e5e5)", marginBottom: 18 },
  tab: { padding: "11px 16px", background: "transparent", border: "none", borderBottom: "2px solid transparent", color: "var(--text-muted, #888)", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: -1 },
  tabActive: { color: "#1D9E75", borderBottomColor: "#1D9E75" },
  planCard: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 12, padding: "16px 18px", marginBottom: 18 },
  section: { marginBottom: 24 },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: 800, color: "var(--text-primary, #0a0a0a)", marginBottom: 8 },
  mutedText: { fontSize: 12, color: "var(--text-muted, #888)", lineHeight: 1.5 },
  primaryLink: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 16px", background: "#1D9E75", color: "#fff", borderRadius: 9, textDecoration: "none", fontSize: 13, fontWeight: 800 },
  secondaryButton: { padding: "10px 16px", background: "var(--bg-card, #fff)", color: "var(--text-secondary, #555)", border: "0.5px solid var(--border, #ddd)", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer" },
  progressGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10, background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 12, padding: 14 },
  progressItem: { minWidth: 0 },
  progressHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 12, color: "var(--text-secondary, #555)", marginBottom: 7 },
  progressTrack: { height: 6, background: "var(--border, #ededed)", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4, transition: "width .35s ease" },
  quickLinks: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 9 },
  quickLink: { display: "flex", alignItems: "center", gap: 10, background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 10, padding: "12px 13px", textDecoration: "none" },
  quickCode: { width: 30, height: 26, borderRadius: 7, background: "#E1F5EE", color: "#0F6E56", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 },
  quickLabel: { flex: 1, color: "var(--text-primary, #222)", fontSize: 13, fontWeight: 700 },
  quickArrow: { color: "var(--text-muted, #aaa)", fontSize: 13 },
  xpList: { background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 12, overflow: "hidden" },
  xpRow: { display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center", padding: "11px 14px", borderBottom: "0.5px solid var(--border, #f2f2f2)" },
  xpReason: { color: "var(--text-primary, #333)", fontSize: 13, textTransform: "capitalize" },
  xpDate: { color: "var(--text-muted, #aaa)", fontSize: 11 },
  xpAmount: { color: "#1D9E75", fontSize: 13, fontWeight: 800 },
  empty: { padding: "28px 20px", textAlign: "center", color: "var(--text-muted, #888)", background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 12, fontSize: 13 },
  badgeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 },
  badgeCard: { background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 12, padding: 14, minHeight: 126 },
  badgeIcon: { fontSize: 22, marginBottom: 8 },
  badgeTitle: { fontSize: 13, fontWeight: 800, color: "var(--text-primary, #111)", marginBottom: 5 },
  badgeDesc: { fontSize: 11, lineHeight: 1.45, color: "var(--text-muted, #888)" },
  settingsStack: { display: "grid", gap: 12 },
  settingsCard: { background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 12, padding: "16px 18px" },
  settingRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 0", borderTop: "0.5px solid var(--border, #f0f0f0)", fontSize: 13, color: "var(--text-secondary, #555)" },
  dangerButton: { padding: "8px 13px", border: "0.5px solid #FCA5A5", borderRadius: 8, background: "#FEF2F2", color: "#B91C1C", fontSize: 12, fontWeight: 800, cursor: "pointer" },
  legalLinks: { display: "flex", gap: 16, flexWrap: "wrap", padding: "6px 2px" },
  legalLink: { color: "var(--text-muted, #888)", textDecoration: "none", fontSize: 12 },
};
