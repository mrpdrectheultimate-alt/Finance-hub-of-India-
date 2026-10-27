"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { supabase } from "@/lib/supabase";
import {
  Flame,
  Star,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Calculator,
  TrendingUp,
  ChevronRight,
  Trophy,
  Sparkles,
  Brain,
  ShieldCheck,
  Clock,
  Award,
  Layers,
  Check,
  RotateCcw,
  Compass,
  AlertTriangle,
  Gift,
  ExternalLink,
} from "lucide-react";

// ============================================================
// FinanceHub of India — World-Class Learning Command Center
// app/dashboard/page.tsx
//
// 2-Zone Executive Architecture:
//   • Top Command Bar: Personalized Greeting, Date, Live Streak & Tier Badges
//   • 4 Institutional Metric Cards: Streak, XP, Curriculum %, AI Quota
//   • Zone 1: Primary Learning Engine (Left Column ~68%)
//       - Active Learning Hero (Track, Sanitized Title, %, Resume Lesson CTA)
//       - Up Next in Curriculum (Next 3 sequenced modules)
//       - 7-Day Consistency Matrix (Checked cadence)
//       - Spaced Repetition Review Queue Alert (Conditional)
//       - Recently Completed Feed (or Motivating Zero State)
//   • Zone 2: Utility & Intelligence Hub (Right Column ~32%)
//       - Frontier AI Mentor Quick-Launch with Daily Quota & Prompts
//       - Curated Financial Simulators Toolkit (SIP, Tax, Net Worth, EMI)
//       - Academic League & XP Progress Bar
//       - Plan Capabilities & Referral Module
//
// Strict 6-Color Palette (0% Green):
//   White:         #FFFFFF (Card surfaces, clarity)
//   Canvas:        #F8FAFC (Soft neutral slate workspace)
//   Midnight Navy: #090D16 & #0A1628 (Dominant hero, typography)
//   Electric Blue: #2563EB (Primary actions, progress, active links)
//   Golden Amber:  #EAB308 (Leagues, stars, milestone achievements)
//   Vibrant Orange:#F97316 (Streak fire, active labs, simulators)
//   Signal Red:    #EF4444 (Review alerts, risk warnings)
// ============================================================

type Profile = {
  id: string;
  full_name: string;
  subscription_tier: string;
  xp_total: number;
  current_streak: number;
  longest_streak: number;
  primary_track: string;
  onboarding_goal: string;
  ai_questions_today: number;
  theme: string;
};

type LessonItem = {
  id: string;
  title: string;
  slug: string;
  duration_minutes: number;
  order_index?: number;
  level_name: string;
  track_name: string;
  track_color: string;
  track_slug: string;
};

type RecentLesson = {
  lesson_id: string;
  completed_at: string;
  title: string;
  slug: string;
  duration_minutes: number;
  track_name: string;
  track_color: string;
};

type WeekDay = {
  label: string;
  date: string;
  done: boolean;
  isToday: boolean;
};

const LEAGUE_INFO = (xp: number) => {
  if (xp >= 10000) return { name: "Master League", emoji: "🏆", color: "#2563EB", next: null, nextXP: null };
  if (xp >= 5000) return { name: "Diamond League", emoji: "💎", color: "#2563EB", next: "Master", nextXP: 10000 };
  if (xp >= 2000) return { name: "Gold League", emoji: "🥇", color: "#EAB308", next: "Diamond", nextXP: 5000 };
  if (xp >= 500) return { name: "Silver League", emoji: "🥈", color: "#64748B", next: "Gold", nextXP: 2000 };
  return { name: "Bronze League", emoji: "🥉", color: "#F97316", next: "Silver", nextXP: 500 };
};

const TIER_LIMITS: Record<string, number> = { free: 5, pro: 50, expert: 200 };

const DEFAULT_PROFILE: Profile = {
  id: "",
  full_name: "Learner",
  subscription_tier: "free",
  xp_total: 50,
  current_streak: 1,
  longest_streak: 1,
  primary_track: "personal-finance",
  onboarding_goal: "",
  ai_questions_today: 0,
  theme: "light",
};

// Text sanitizer to fix encoding bugs (e.g., â€" -> —)
function cleanText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/â€"/g, "—")
    .replace(/â€”/g, "—")
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/Â/g, "")
    .trim();
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);
  const [upNextLessons, setUpNextLessons] = useState<LessonItem[]>([]);
  const [recentLessons, setRecentLessons] = useState<RecentLesson[]>([]);
  const [weekActivity, setWeekActivity] = useState<WeekDay[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [totalDone, setTotalDone] = useState(0);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Good day");
  const [currentDateStr, setCurrentDateStr] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    setCurrentDateStr(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    );
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      // 1. Fetch Profile and Progress in parallel
      const [profileRes, progressRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("user_progress")
          .select(`
            lesson_id, completed, completed_at,
            lessons (
              title, slug, duration_minutes,
              levels (
                title, slug,
                tracks (title, color_hex, slug)
              )
            )
          `)
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(20),
      ]);

      // 2. Fallback check for spaced repetition reviews due
      let reviewsDue = 0;
      try {
        const reviewRes = await supabase
          .from("user_mastery")
          .select("next_review")
          .eq("user_id", user.id)
          .lte("next_review", new Date().toISOString().split("T")[0]);
        reviewsDue = reviewRes.data?.length || 0;
      } catch {
        const rqRes = await supabase.from("review_queue").select("id").eq("user_id", user.id);
        reviewsDue = rqRes.data?.length || 0;
      }
      setReviewCount(reviewsDue);

      // 3. Normalize Profile
      const rawProf = profileRes.data;
      const userMetaName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Learner";

      const normProf: Profile = {
        id: user.id,
        full_name: cleanText(rawProf?.full_name || rawProf?.name || userMetaName),
        subscription_tier: rawProf?.subscription_tier || rawProf?.role || "free",
        xp_total: rawProf?.xp_total ?? 50,
        current_streak: rawProf?.current_streak ?? rawProf?.streak_current ?? 1,
        longest_streak: rawProf?.longest_streak ?? rawProf?.streak_longest ?? 1,
        primary_track: rawProf?.primary_track || "personal-finance",
        onboarding_goal: rawProf?.onboarding_goal || rawProf?.goal || "",
        ai_questions_today: rawProf?.ai_questions_today || 0,
        theme: "light",
      };
      setProfile(normProf);

      // 4. Parse completed lessons
      const prog = progressRes.data || [];
      const doneItems = prog.filter((p: any) => p.completed || p.completed_at);
      setTotalDone(doneItems.length);

      const completedIds = new Set(doneItems.map((p: any) => p.lesson_id));

      const parsedRecent: RecentLesson[] = doneItems.slice(0, 4).map((p: any) => {
        const l = p.lessons || {};
        const lv = l.levels || {};
        const tr = lv.tracks || {};
        return {
          lesson_id: p.lesson_id,
          completed_at: p.completed_at || new Date().toISOString(),
          title: cleanText(l.title || "Lesson"),
          slug: l.slug || "",
          duration_minutes: l.duration_minutes || 5,
          track_name: cleanText(tr.title || tr.name || "Personal Finance"),
          track_color: "#2563EB",
        };
      });
      setRecentLessons(parsedRecent);

      // 5. Build 7-day consistency calendar
      const days: WeekDay[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const label = i === 0 ? "Today" : i === 1 ? "Yest" : d.toLocaleDateString("en-IN", { weekday: "short" });
        const hasDone = doneItems.some((p: any) => p.completed_at?.startsWith(dateStr));
        days.push({ label, date: dateStr, done: hasDone, isToday: i === 0 });
      }
      setWeekActivity(days);

      // 6. Fetch track curriculum & resolve active + next lessons
      const { data: trackLessons } = await supabase
        .from("lessons")
        .select(`
          id, title, slug, duration_minutes, order_index,
          levels (title, slug, tracks (title, color_hex, slug))
        `)
        .order("order_index")
        .limit(40);

      if (trackLessons && trackLessons.length > 0) {
        const uncompleted = trackLessons.filter((l: any) => !completedIds.has(l.id));
        const active = uncompleted.length > 0 ? uncompleted[0] : trackLessons[0];

        const mapLesson = (item: any): LessonItem => {
          const lv = item.levels || {};
          const tr = lv.tracks || {};
          return {
            id: item.id,
            title: cleanText(item.title),
            slug: item.slug,
            duration_minutes: item.duration_minutes || 6,
            order_index: item.order_index,
            level_name: cleanText(lv.title || "Foundations"),
            track_name: cleanText(tr.title || "Personal Finance"),
            track_color: "#2563EB",
            track_slug: tr.slug || "personal-finance",
          };
        };

        setActiveLesson(mapLesson(active));
        setUpNextLessons(uncompleted.slice(1, 4).map(mapLesson));
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const league = LEAGUE_INFO(profile.xp_total || 0);
  const leagueMin =
    league.name === "Bronze League"
      ? 0
      : league.name === "Silver League"
      ? 500
      : league.name === "Gold League"
      ? 2000
      : league.name === "Diamond League"
      ? 5000
      : 10000;
  const leaguePct = league.nextXP
    ? Math.min(100, Math.max(0, Math.round(((profile.xp_total - leagueMin) / (league.nextXP - leagueMin)) * 100)))
    : 100;
  const aiLimit = TIER_LIMITS[profile.subscription_tier] || 5;
  const aiUsed = profile.ai_questions_today || 0;
  const aiRemaining = Math.max(0, aiLimit - aiUsed);
  const firstName = profile.full_name?.split(" ")[0] || "Learner";

  // Estimated track progress
  const trackProgressPct = Math.min(100, Math.round((totalDone / 45) * 100));

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC", padding: "40px 24px", fontFamily: "var(--font-ui, system-ui, sans-serif)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: 104,
                  background: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 16,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
          <div style={{ height: 320, background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: 20 }} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        color: "#090D16",
        fontFamily: "var(--font-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif)",
        paddingBottom: 80,
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        a { text-decoration: none; color: inherit; }
        .dash-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .dash-card:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.04); }
        .interactive-btn { transition: all 0.15s ease; }
        .interactive-btn:hover { transform: translateY(-1px); }
        @media (max-width: 960px) {
          .dash-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .metrics-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 540px) {
          .metrics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 1. TOP COMMAND BAR & INSTITUTIONAL BREADCRUMB             */}
      {/* ══════════════════════════════════════════════════════════ */}
      <header
        style={{
          background: "#FFFFFF",
          borderBottom: "1.5px solid #E2E8F0",
          padding: "16px 24px",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          {/* Brand Mark */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Logo size="md" href="/" />
            <div style={{ height: 20, width: 1.5, background: "#E2E8F0" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#64748B", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Academic Command Center
            </span>
          </div>

          {/* Quick Context & Status Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Streak Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "#FFF7ED",
                border: "1px solid #FFEDD5",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 800,
                color: "#F97316",
              }}
            >
              <Flame className="w-4 h-4 fill-[#F97316]" />
              <span>{profile.current_streak} Day Streak</span>
            </div>

            {/* Total XP Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "#FEFCE8",
                border: "1px solid #FEF08A",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 800,
                color: "#CA8A04",
              }}
            >
              <Star className="w-4 h-4 fill-[#EAB308]" />
              <span>{(profile.xp_total || 0).toLocaleString("en-IN")} XP</span>
            </div>

            {/* Tier Status */}
            <span
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 800,
                background: profile.subscription_tier === "free" ? "#EFF6FF" : "#2563EB",
                color: profile.subscription_tier === "free" ? "#2563EB" : "#FFFFFF",
                border: profile.subscription_tier === "free" ? "1px solid #BFDBFE" : "none",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {profile.subscription_tier === "free" ? "Free Core" : "Pro Academy"}
            </span>

            {/* Explore Curriculum Button */}
            <Link
              href="/explore"
              className="interactive-btn"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#FFFFFF",
                background: "#2563EB",
                padding: "7px 16px",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
              }}
            >
              Explore Tracks
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 2. MAIN WORKSPACE CONTAINER                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 0" }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: "#090D16", letterSpacing: "-0.03em", margin: 0 }}>
                {greeting}, {firstName}! 👋
              </h1>
              <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
                {currentDateStr} · Pick up where you left off or practice with interactive simulators.
              </p>
            </div>
            {profile.current_streak === 0 && (
              <span style={{ fontSize: 13, color: "#F97316", fontWeight: 700 }}>
                Complete today's lesson to start your 7-day consistency streak!
              </span>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 3. FOUR INSTITUTIONAL METRICS STRIP                        */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div
          className="metrics-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {/* Card 1: Consistency Streak */}
          <div
            className="dash-card"
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderTop: "3.5px solid #F97316",
              borderRadius: 16,
              padding: "18px 20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Consistency Streak
              </span>
              <Flame className="w-4 h-4 text-[#F97316]" />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#090D16", letterSpacing: "-0.02em" }}>
                {profile.current_streak}
              </span>
              <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>days active</span>
            </div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
              Personal Record: {profile.longest_streak} days
            </div>
          </div>

          {/* Card 2: Academic Mastery XP */}
          <div
            className="dash-card"
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderTop: "3.5px solid #EAB308",
              borderRadius: 16,
              padding: "18px 20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Academic XP
              </span>
              <Star className="w-4 h-4 text-[#EAB308]" />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#090D16", letterSpacing: "-0.02em" }}>
                {(profile.xp_total || 0).toLocaleString("en-IN")}
              </span>
              <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>XP</span>
            </div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
              {league.emoji} {league.name}
            </div>
          </div>

          {/* Card 3: Curriculum Completed */}
          <div
            className="dash-card"
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderTop: "3.5px solid #2563EB",
              borderRadius: 16,
              padding: "18px 20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Lessons Finished
              </span>
              <BookOpen className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#090D16", letterSpacing: "-0.02em" }}>
                {totalDone}
              </span>
              <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>completed</span>
            </div>
            <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 700, marginTop: 4 }}>
              {trackProgressPct}% of foundational core
            </div>
          </div>

          {/* Card 4: AI Mentor Daily Quota */}
          <div
            className="dash-card"
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderTop: "3.5px solid #090D16",
              borderRadius: 16,
              padding: "18px 20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                AI Mentor Quota
              </span>
              <Brain className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#090D16", letterSpacing: "-0.02em" }}>
                {aiRemaining}
              </span>
              <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>queries left</span>
            </div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
              Resets midnight · {profile.subscription_tier === "free" ? "Upgrade for 50/day" : "Unlimited Pro"}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 4. TWO-ZONE COMMAND CENTER GRID                            */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div
          className="dash-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.55fr 1fr",
            gap: 28,
            alignItems: "start",
          }}
        >
          {/* ──────────────────────────────────────────────────────── */}
          {/* ZONE 1: PRIMARY LEARNING ENGINE (LEFT 68%)              */}
          {/* ──────────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Active Learning Hero Card */}
            {activeLesson && (
              <div
                style={{
                  background: "linear-gradient(135deg, #090D16 0%, #1E3A8A 100%)",
                  borderRadius: 20,
                  padding: "32px",
                  color: "#FFFFFF",
                  boxShadow: "0 12px 32px rgba(9,13,22,0.18)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "relative", zIndex: 10 }}>
                  {/* Top Track & Level Meta */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          background: "rgba(37,99,235,0.3)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          color: "#93C5FD",
                          padding: "4px 10px",
                          borderRadius: 6,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {activeLesson.track_name}
                      </span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                        {activeLesson.level_name}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{activeLesson.duration_minutes} min read</span>
                    </div>
                  </div>

                  {/* Sanitized Main Title */}
                  <h2
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      lineHeight: 1.3,
                      marginBottom: 16,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {activeLesson.title}
                  </h2>

                  {/* Progress Bar & Status */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: "rgba(255,255,255,0.7)" }}>Track Completion</span>
                      <span style={{ color: "#60A5FA", fontWeight: 800 }}>{trackProgressPct}% Mastered</span>
                    </div>
                    <div style={{ width: "100%", height: 7, background: "rgba(255,255,255,0.15)", borderRadius: 999, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.max(8, trackProgressPct)}%`,
                          background: "#2563EB",
                          borderRadius: 999,
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* High-Contrast Action Button */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <Link
                      href={`/learn/${activeLesson.slug}`}
                      className="interactive-btn"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "13px 26px",
                        background: "#2563EB",
                        color: "#FFFFFF",
                        fontSize: 15,
                        fontWeight: 800,
                        borderRadius: 12,
                        boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
                      }}
                    >
                      <PlayCircle className="w-5 h-5" /> Resume Lesson
                    </Link>
                    <Link
                      href={`/tracks/${activeLesson.track_slug}`}
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.8)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      View Curriculum Map <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Retention Engine: Spaced Repetition Alert (Conditional) */}
            {reviewCount > 0 && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1.5px solid #FECACA",
                  borderRadius: 16,
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#EF4444",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#991B1B" }}>
                      {reviewCount} concept{reviewCount !== 1 ? "s" : ""} due for spaced review
                    </div>
                    <div style={{ fontSize: 13, color: "#7F1D1D", marginTop: 2 }}>
                      Reinforce your retention curve — takes less than 3 minutes.
                    </div>
                  </div>
                </div>
                <Link
                  href="/review"
                  style={{
                    padding: "9px 18px",
                    background: "#EF4444",
                    color: "#FFFFFF",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  Review Now →
                </Link>
              </div>
            )}

            {/* Up Next in Your Curriculum */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                borderRadius: 18,
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#090D16" }}>
                    Up Next in Curriculum
                  </h3>
                  <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                    Sequenced lessons designed for progressive mastery
                  </p>
                </div>
                <Link href="/explore" style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>
                  All Lessons →
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {upNextLessons.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/learn/${item.slug}`}
                    className="interactive-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "#EFF6FF",
                          color: "#2563EB",
                          fontSize: 11,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#090D16" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                          {item.track_name} · {item.level_name}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#64748B" }}>{item.duration_minutes}m</span>
                      <ChevronRight className="w-4 h-4 text-[#64748B]" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 7-Day Consistency Matrix */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                borderRadius: 18,
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#090D16" }}>
                    7-Day Study Cadence
                  </h3>
                  <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                    Daily study habits compound exponentially over 12 months
                  </p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#F97316" }}>
                  {profile.current_streak} Day Active Streak
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
                {weekActivity.map((day) => (
                  <div
                    key={day.date}
                    style={{
                      background: day.done ? "#EFF6FF" : "#F8FAFC",
                      border: day.isToday ? "2px solid #2563EB" : day.done ? "1.5px solid #BFDBFE" : "1.5px solid #E2E8F0",
                      borderRadius: 12,
                      padding: "12px 6px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 11, color: day.isToday ? "#2563EB" : "#64748B", fontWeight: 700, marginBottom: 8 }}>
                      {day.label}
                    </div>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: day.done ? "#2563EB" : "#E2E8F0",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {day.done ? <Check className="w-3.5 h-3.5 text-white" /> : "·"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Completed Feed */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                borderRadius: 18,
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#090D16" }}>
                  Recently Completed
                </h3>
                <Link href="/explore" style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>
                  Curriculum Catalog →
                </Link>
              </div>

              {recentLessons.length === 0 ? (
                <div
                  style={{
                    padding: "36px 20px",
                    textAlign: "center",
                    background: "#F8FAFC",
                    border: "1.5px dashed #CBD5E1",
                    borderRadius: 14,
                  }}
                >
                  <BookOpen className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#090D16" }}>
                    Your learning journey starts today
                  </div>
                  <p style={{ fontSize: 12, color: "#64748B", maxWidth: 360, margin: "4px auto 16px" }}>
                    Complete your first 5-minute foundational lesson to unlock track mastery metrics.
                  </p>
                  <Link
                    href="/explore"
                    style={{
                      display: "inline-block",
                      padding: "9px 20px",
                      background: "#2563EB",
                      color: "#FFFFFF",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    Start Your First Lesson →
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {recentLessons.map((item) => (
                    <Link
                      key={item.lesson_id}
                      href={`/learn/${item.slug}`}
                      className="interactive-btn"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CheckCircle2 className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#090D16" }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748B" }}>
                            {item.track_name} · Completed on{" "}
                            {new Date(item.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#64748B]" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* ZONE 2: UTILITY & INTELLIGENCE HUB (RIGHT 32%)          */}
          {/* ──────────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Frontier AI Mentor Quick-Launch Card */}
            <div
              className="dash-card"
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #BFDBFE",
                borderRadius: 18,
                padding: "24px",
                boxShadow: "0 4px 16px rgba(37,99,235,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "#EFF6FF",
                    color: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#090D16" }}>
                    Frontier AI Mentor
                  </h3>
                  <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 700 }}>
                    {aiRemaining} of {aiLimit} queries left today
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>
                Instant, source-cited clarification on any Indian tax, market, or valuation concept.
              </p>

              {/* Fast Suggested Queries */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                {[
                  "Old vs. New Tax Regime break-even",
                  "Why 89% lose money in F&O trading",
                  "How to calculate P/E ratio from scratch",
                ].map((q, i) => (
                  <Link
                    key={i}
                    href={`/ai-tutor?prompt=${encodeURIComponent(q)}`}
                    style={{
                      fontSize: 12,
                      color: "#2563EB",
                      background: "#F8FAFC",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #E2E8F0",
                      fontWeight: 600,
                    }}
                  >
                    "{q}" →
                  </Link>
                ))}
              </div>

              <Link
                href="/ai-tutor"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "11px",
                  background: "#2563EB",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 700,
                  borderRadius: 10,
                }}
              >
                Ask Custom Doubt →
              </Link>
            </div>

            {/* Curated Financial Simulators Toolkit */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                borderRadius: 18,
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#090D16" }}>
                  Interactive Finance Labs
                </h3>
                <Link href="/practice" style={{ fontSize: 11, fontWeight: 700, color: "#2563EB" }}>
                  All 15 Labs →
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { title: "SIP Wealth Modeler", sub: "Compounding with Indian returns", href: "/practice/sip", icon: TrendingUp },
                  { title: "Tax Regime Break-Even", sub: "Old vs. New slab math", href: "/practice/tax", icon: Calculator },
                  { title: "Net Worth & Asset Tracker", sub: "Real equity vs. debt ratio", href: "/practice/net-worth", icon: Layers },
                  { title: "Loan EMI & Prepayment", sub: "Save lakhs on interest", href: "/practice/emi", icon: Compass },
                ].map((tool, i) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={i}
                      href={tool.href}
                      className="interactive-btn"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: "#EFF6FF",
                            color: "#2563EB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#090D16" }}>{tool.title}</div>
                          <div style={{ fontSize: 10, color: "#64748B" }}>{tool.sub}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#64748B]" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Academic League & XP Tier Card */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                borderRadius: 18,
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#090D16" }}>
                    Your Academic League
                  </h3>
                  <div style={{ fontSize: 18, fontWeight: 900, color: league.color, marginTop: 4 }}>
                    {league.emoji} {league.name}
                  </div>
                </div>
                <Link
                  href="/leaderboard"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#2563EB",
                    background: "#EFF6FF",
                    padding: "4px 8px",
                    borderRadius: 6,
                  }}
                >
                  Leaderboard →
                </Link>
              </div>

              {league.nextXP && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748B", marginBottom: 6 }}>
                    <span>{(profile.xp_total || 0).toLocaleString("en-IN")} XP</span>
                    <span>{league.nextXP.toLocaleString("en-IN")} XP for {league.next}</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "#E2E8F0", borderRadius: 999, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${leaguePct}%`,
                        background: "#EAB308",
                        borderRadius: 999,
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}>
                    {((league.nextXP || 0) - (profile.xp_total || 0)).toLocaleString("en-IN")} XP needed for next tier promotion
                  </div>
                </div>
              )}
            </div>

            {/* Plan Capabilities / Pro Upgrade Card */}
            {profile.subscription_tier === "free" ? (
              <div
                style={{
                  background: "linear-gradient(135deg, #090D16 0%, #1E3A8A 100%)",
                  borderRadius: 18,
                  padding: "24px",
                  color: "#FFFFFF",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: "#60A5FA", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Unlock Full Academic Access
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 900, marginTop: 4, marginBottom: 8 }}>
                  Upgrade to Pro Academy
                </h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 16 }}>
                  Access all 8 master tracks, unlimited AI queries, 15 simulators, and verified LinkedIn certificates.
                </p>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 14 }}>
                  ₹499<span style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.6)" }}>/month</span>
                </div>
                <Link
                  href="/pricing"
                  className="interactive-btn"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "11px",
                    background: "#2563EB",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 800,
                    borderRadius: 10,
                  }}
                >
                  Start 7-Day Free Trial →
                </Link>
              </div>
            ) : (
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 18,
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#2563EB", fontWeight: 800, fontSize: 13 }}>
                  <ShieldCheck className="w-4 h-4" /> Pro Academy Active
                </div>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                  Full curriculum and unlimited AI features unlocked.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
