"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

const DailyChallenges = dynamic(() => import("@/components/gamification/DailyChallenges"), { ssr: false });
const WeeklyMissions = dynamic(() => import("@/components/gamification/WeeklyMissions"), { ssr: false });
const SeasonProgress = dynamic(() => import("@/components/gamification/SeasonProgress"), { ssr: false });
const MasteryDashboard = dynamic(() => import("@/components/adaptive/MasteryDashboard"), { ssr: false });

type Profile = {
  id: string;
  full_name: string | null;
  role: "free" | "pro" | "expert";
  xp_total: number;
  streak_current: number;
  streak_longest: number;
  last_active_date: string | null;
  onboarding_done: boolean;
};

type DashboardData = {
  xp_total?: number;
  streak_current?: number;
  streak_at_risk?: boolean;
  lessons_completed?: number;
  lessons_total?: number;
  progress_pct?: number;
  weak_topics?: number;
  due_reviews?: number;
  next_lesson_id?: string | null;
  next_lesson_title?: string | null;
  next_lesson_reason?: string | null;
  role?: string;
};

type TrackProgress = {
  id: string;
  slug: string;
  title: string;
  icon: string | null;
  color_hex: string;
  completedLessons: number;
  totalLessons: number;
};

const XP_LEVELS = [
  { level: 1, name: "Beginner", min: 0, max: 499 },
  { level: 2, name: "Learner", min: 500, max: 1499 },
  { level: 3, name: "Intermediate", min: 1500, max: 3499 },
  { level: 4, name: "Advanced", min: 3500, max: 6999 },
  { level: 5, name: "Expert", min: 7000, max: 14999 },
  { level: 6, name: "Master", min: 15000, max: 99999 },
];

type ActiveTab = "home" | "mastery" | "leaderboard";

function getXpLevel(xp: number) {
  return XP_LEVELS.find((level) => xp >= level.min && xp <= level.max) || XP_LEVELS[0];
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [tracks, setTracks] = useState<TrackProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboard = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/auth/login");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, role, xp_total, streak_current, streak_longest, last_active_date, onboarding_done")
      .eq("id", session.user.id)
      .single();

    if (!profileData) {
      setLoading(false);
      return;
    }

    const userProfile = profileData as Profile;
    setProfile(userProfile);

    if (!userProfile.onboarding_done) {
      router.push("/onboarding");
      return;
    }

    try {
      const response = await fetch("/api/recommendations", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = (await response.json()) as { dashboard?: DashboardData };
      if (response.ok && result.dashboard) setDashData(result.dashboard);
    } catch (error) {
      console.error("Failed to load dashboard recommendations:", error);
    }

    await loadTrackProgress(session.user.id);
    setLoading(false);
  };

  const loadTrackProgress = async (userId: string) => {
    const [{ data: allTracks }, { data: progress }] = await Promise.all([
      supabase.from("tracks").select("id, slug, title, icon, color_hex").eq("is_active", true).order("order_index"),
      supabase.from("user_progress").select("lesson_id").eq("user_id", userId),
    ]);

    const completedIds = new Set(progress?.map((item) => item.lesson_id) || []);

    if (!allTracks?.length) {
      setTracks([]);
      return;
    }

    const enriched = await Promise.all(
      allTracks.map(async (track) => {
        const { data: levels } = await supabase.from("levels").select("id").eq("track_id", track.id);
        const levelIds = levels?.map((level) => level.id) || [];

        let lessons: { id: string }[] = [];
        if (levelIds.length) {
          const { data } = await supabase
            .from("lessons")
            .select("id")
            .in("level_id", levelIds)
            .eq("is_published", true);
          lessons = data || [];
        }

        return {
          id: track.id,
          slug: track.slug,
          title: track.title,
          icon: track.icon,
          color_hex: track.color_hex,
          totalLessons: lessons.length,
          completedLessons: lessons.filter((lesson) => completedIds.has(lesson.id)).length,
        };
      }),
    );

    setTracks(enriched);
  };

  if (loading) return <DashboardSkeleton />;
  if (!profile) return null;

  const xpLevel = getXpLevel(profile.xp_total);
  const nextLevel = XP_LEVELS[xpLevel.level] || null;
  const xpInLevel = profile.xp_total - xpLevel.min;
  const xpNeeded = nextLevel ? nextLevel.min - xpLevel.min : Math.max(1, xpLevel.max - xpLevel.min);
  const xpPct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  const firstName = profile.full_name?.split(" ")[0] || "there";
  const lessonsCompleted = dashData?.lessons_completed || tracks.reduce((sum, track) => sum + track.completedLessons, 0);
  const lessonsTotal = dashData?.lessons_total || tracks.reduce((sum, track) => sum + track.totalLessons, 0);
  const progressPct = dashData?.progress_pct ?? (lessonsTotal ? Math.round((lessonsCompleted / lessonsTotal) * 100) : 0);

  return (
    <AppLayout userRole={profile.role}>
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.greetingRow}>
              <div style={s.avatar}>{(profile.full_name || "?")[0].toUpperCase()}</div>
              <div>
                <div style={s.greeting}>{greeting}, {firstName}</div>
                <div style={s.subGreeting}>
                  {dashData?.streak_at_risk
                    ? "Your streak is at risk. Complete one activity now."
                    : profile.streak_current > 0
                      ? `${profile.streak_current}-day streak. Keep it going.`
                      : "Start your first lesson to begin your streak."}
                </div>
              </div>
            </div>
          </div>
          <div style={s.headerRight}>
            {profile.role === "free" ? <Link href="/pricing" style={s.upgradeBtn}>Upgrade to Pro</Link> : null}
            <Link href="/profile" style={s.profileBtn}>
              {profile.role !== "free" ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Settings"}
            </Link>
          </div>
        </div>

        <div style={s.xpBar}>
          <div style={s.xpBarLeft}>
            <span style={s.levelBadge}>Lv.{xpLevel.level}</span>
            <span style={s.levelName}>{xpLevel.name}</span>
          </div>
          <div style={s.xpBarMiddle}>
            <div style={s.xpProgressBg}>
              <div style={{ ...s.xpProgressFill, width: `${xpPct}%` }} />
            </div>
          </div>
          <div style={s.xpBarRight}>
            <span style={s.xpCount}>{profile.xp_total.toLocaleString()} XP</span>
            {nextLevel ? <span style={s.xpNext}>to {nextLevel.name}: {nextLevel.min.toLocaleString()}</span> : null}
          </div>
        </div>

        <div style={s.tabs}>
          {(["home", "mastery", "leaderboard"] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
              type="button"
            >
              {tab === "home" ? "Home" : tab === "mastery" ? "Mastery" : "Leaderboard"}
            </button>
          ))}
        </div>

        {activeTab === "home" ? (
          <div style={s.content}>
            <div style={s.statsRow}>
              {[
                { label: "Lessons done", val: lessonsCompleted, color: "#185FA5", bg: "#E6F1FB" },
                { label: "Day streak", val: profile.streak_current, color: "#854F0B", bg: "#FAEEDA" },
                { label: "XP total", val: profile.xp_total.toLocaleString(), color: "#534AB7", bg: "#EEEDFE" },
                { label: "Progress", val: `${progressPct}%`, color: "#1D9E75", bg: "#E1F5EE" },
              ].map((stat) => (
                <div key={stat.label} style={{ ...s.statCard, background: stat.bg }}>
                  <div style={{ ...s.statVal, color: stat.color }}>{stat.val}</div>
                  <div style={s.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {dashData?.next_lesson_id && dashData.next_lesson_title ? (
              <Link href={`/learn/${dashData.next_lesson_id}`} style={s.continueCta}>
                <div style={s.continueLeft}>
                  <div style={s.continueLabel}>{dashData.due_reviews ? "Review due" : "Continue learning"}</div>
                  <div style={s.continueTitle}>{dashData.next_lesson_title}</div>
                  {dashData.next_lesson_reason ? <div style={s.continueReason}>{dashData.next_lesson_reason}</div> : null}
                </div>
                <div style={s.continueArrow}>Go</div>
              </Link>
            ) : null}

            {(dashData?.weak_topics || 0) > 0 ? (
              <button style={s.alertBox} onClick={() => setActiveTab("mastery")} type="button">
                <span>{dashData?.weak_topics} topics need attention. Open your mastery map.</span>
                <span style={s.alertArrow}>Go</span>
              </button>
            ) : null}

            <div style={s.twoCol}>
              <DailyChallenges />
              <TrackProgressCard tracks={tracks} />
            </div>

            <WeeklyMissions />
          </div>
        ) : null}

        {activeTab === "mastery" ? (
          <div style={s.content}>
            <MasteryDashboard />
          </div>
        ) : null}

        {activeTab === "leaderboard" ? (
          <div style={s.content}>
            <SeasonProgress />
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}

function TrackProgressCard({ tracks }: { tracks: TrackProgress[] }) {
  return (
    <div style={s.tracksCard}>
      <div style={s.tracksHeader}>
        <span style={s.tracksTitle}>Learning tracks</span>
        <Link href="/explore" style={s.tracksLink}>Explore all</Link>
      </div>
      {tracks.length ? (
        tracks.map((track) => {
          const pct = track.totalLessons > 0 ? Math.round((track.completedLessons / track.totalLessons) * 100) : 0;
          return (
            <Link key={track.id} href={`/track/${track.slug}`} style={s.trackRow}>
              <div style={{ ...s.trackIcon, background: `${track.color_hex}22`, color: track.color_hex }}>
                {(track.icon || track.title.slice(0, 2)).slice(0, 2)}
              </div>
              <div style={s.trackInfo}>
                <div style={s.trackName}>{track.title}</div>
                <div style={s.trackProgress}>
                  <div style={s.trackProgressBg}>
                    <div style={{ ...s.trackProgressFill, width: `${pct}%`, background: track.color_hex }} />
                  </div>
                  <span style={s.trackPct}>{pct}%</span>
                </div>
              </div>
              <div style={{ ...s.trackCompletedCount, color: track.color_hex }}>
                {track.completedLessons}/{track.totalLessons}
              </div>
            </Link>
          );
        })
      ) : (
        <div style={s.emptyTrackState}>No tracks found yet.</div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: 24, fontFamily: "system-ui" }}>
      {[80, 40, 200, 200].map((height, index) => (
        <div key={index} style={{ height, background: "#eee", borderRadius: 12, marginBottom: 16 }} />
      ))}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100%", background: "var(--bg-page, #fafafa)", fontFamily: "system-ui,-apple-system,sans-serif", paddingBottom: 60 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 14px", background: "var(--bg-card, #fff)", borderBottom: "0.5px solid var(--border, #eee)", gap: 16 },
  headerLeft: { minWidth: 0 },
  greetingRow: { display: "flex", alignItems: "center", gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: "50%", background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 },
  greeting: { fontWeight: 700, fontSize: 16, color: "var(--text-primary, #0a0a0a)", marginBottom: 2, letterSpacing: "-0.2px" },
  subGreeting: { fontSize: 12, color: "var(--text-muted, #888)" },
  headerRight: { display: "flex", gap: 8, alignItems: "center", flexShrink: 0 },
  upgradeBtn: { padding: "7px 14px", background: "#1D9E75", color: "#fff", borderRadius: 9, textDecoration: "none", fontSize: 12, fontWeight: 600 },
  profileBtn: { padding: "7px 12px", border: "0.5px solid var(--border, #ddd)", borderRadius: 9, textDecoration: "none", fontSize: 12, color: "var(--text-secondary, #555)" },
  xpBar: { display: "flex", alignItems: "center", gap: 12, padding: "10px 24px", background: "var(--bg-card, #fff)", borderBottom: "0.5px solid var(--border, #eee)" },
  xpBarLeft: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 },
  levelBadge: { background: "#0a0a0a", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8 },
  levelName: { fontSize: 12, color: "var(--text-secondary, #555)", fontWeight: 500 },
  xpBarMiddle: { flex: 1 },
  xpProgressBg: { height: 6, background: "var(--bg-surface, #eee)", borderRadius: 3, overflow: "hidden" },
  xpProgressFill: { height: "100%", background: "#1D9E75", borderRadius: 3, transition: "width .5s ease" },
  xpBarRight: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  xpCount: { fontSize: 12, fontWeight: 700, color: "var(--text-primary, #0a0a0a)" },
  xpNext: { fontSize: 10, color: "var(--text-muted, #aaa)" },
  tabs: { display: "flex", gap: 4, padding: "12px 24px 0", background: "var(--bg-card, #fff)", borderBottom: "0.5px solid var(--border, #eee)" },
  tab: { padding: "8px 16px", fontSize: 13, fontWeight: 500, border: "none", borderBottom: "2px solid transparent", background: "transparent", color: "var(--text-muted, #888)", cursor: "pointer", fontFamily: "system-ui", marginBottom: -1 },
  tabActive: { color: "#1D9E75", borderBottomColor: "#1D9E75", fontWeight: 600 },
  content: { padding: "20px 24px", maxWidth: 980, margin: "0 auto" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 },
  statCard: { borderRadius: 12, padding: "14px 12px" },
  statVal: { fontSize: 22, fontWeight: 800, letterSpacing: "-0.3px", marginBottom: 2 },
  statLabel: { fontSize: 11, color: "#666" },
  continueCta: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0a", borderRadius: 12, padding: "16px 20px", marginBottom: 12, textDecoration: "none" },
  continueLeft: { minWidth: 0 },
  continueLabel: { fontSize: 10, fontWeight: 700, color: "#1D9E75", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 },
  continueTitle: { fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3, letterSpacing: "-0.2px" },
  continueReason: { fontSize: 11, color: "#aaa" },
  continueArrow: { fontSize: 12, color: "#fff", background: "#1D9E75", borderRadius: 8, padding: "6px 10px", fontWeight: 700, flexShrink: 0 },
  alertBox: { width: "100%", display: "flex", alignItems: "center", gap: 10, background: "#FAEEDA", border: "0.5px solid #FAC775", borderRadius: 10, padding: "10px 14px", marginBottom: 16, cursor: "pointer", fontSize: 13, color: "#854F0B", fontFamily: "system-ui", textAlign: "left" },
  alertArrow: { marginLeft: "auto", fontWeight: 700 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 },
  tracksCard: { background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 14, padding: "16px 18px" },
  tracksHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  tracksTitle: { fontSize: 14, fontWeight: 600, color: "var(--text-primary, #0a0a0a)" },
  tracksLink: { fontSize: 12, color: "#1D9E75", textDecoration: "none" },
  trackRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12, textDecoration: "none" },
  trackIcon: { width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 },
  trackInfo: { flex: 1, minWidth: 0 },
  trackName: { fontSize: 12, fontWeight: 600, color: "var(--text-primary, #0a0a0a)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  trackProgress: { display: "flex", alignItems: "center", gap: 6 },
  trackProgressBg: { flex: 1, height: 4, background: "var(--bg-surface, #eee)", borderRadius: 2, overflow: "hidden" },
  trackProgressFill: { height: "100%", borderRadius: 2, transition: "width .4s" },
  trackPct: { fontSize: 10, color: "var(--text-muted, #aaa)", minWidth: 28, textAlign: "right" },
  trackCompletedCount: { fontSize: 11, fontWeight: 700, flexShrink: 0 },
  emptyTrackState: { fontSize: 13, color: "var(--text-muted, #888)", padding: "12px 0" },
};
