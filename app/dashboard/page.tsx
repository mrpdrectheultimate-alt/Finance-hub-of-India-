"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ReferralCard } from "@/components/ui/ReferralCard";

// ============================================================
// FinanceHub — User Dashboard
// app/dashboard/page.tsx
// Streak · XP · Progress · Today's lessons · Review due
// ============================================================

type Profile = {
  id:                 string;
  full_name:          string;
  subscription_tier:  string;
  xp_total:           number;
  current_streak:     number;
  longest_streak:     number;
  primary_track:      string;
  onboarding_goal:    string;
  ai_questions_today: number;
  theme:              string;
};

type RecentLesson = {
  lesson_id:    string;
  completed:    boolean;
  completed_at: string;
  lesson:       { title: string; slug: string; duration_minutes: number; level: { track: { name: string; color_hex: string } } };
};

type NextLesson = {
  id:               string;
  title:            string;
  slug:             string;
  duration_minutes: number;
  level:            { name: string; track: { name: string; color_hex: string; slug: string } };
};

type WeekDay = { label: string; done: boolean; date: string };

const LEAGUE_INFO = (xp: number) => {
  if (xp >= 10000) return { name: "Master",  emoji: "🏆", color: "#7C3AED", next: null,   nextXP: null };
  if (xp >= 5000)  return { name: "Diamond", emoji: "💎", color: "#185FA5", next: "Master",  nextXP: 10000 };
  if (xp >= 2000)  return { name: "Gold",    emoji: "🥇", color: "#D4A017", next: "Diamond", nextXP: 5000  };
  if (xp >= 500)   return { name: "Silver",  emoji: "🥈", color: "#718096", next: "Gold",    nextXP: 2000  };
  return             { name: "Bronze",  emoji: "🥉", color: "#854F0B", next: "Silver",  nextXP: 500   };
};

const TIER_LIMITS: Record<string, number> = { free: 5, pro: 50, expert: 200 };

function StatCard({ icon, value, label, color = "#0E6163", sub }: { icon: string; value: string | number; label: string; color?: string; sub?: string }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0",
      borderRadius: 14, padding: "16px 18px",
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color, letterSpacing: "-0.3px", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#718096", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#a0aec0", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [profile,      setProfile]      = useState<Profile | null>(null);
  const [recent,       setRecent]       = useState<RecentLesson[]>([]);
  const [nextLesson,   setNextLesson]   = useState<NextLesson | null>(null);
  const [weekActivity, setWeekActivity] = useState<WeekDay[]>([]);
  const [reviewCount,  setReviewCount]  = useState(0);
  const [totalDone,    setTotalDone]    = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [greeting,     setGreeting]     = useState("Good day");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    try {
      const [profileRes, progressRes] = await Promise.all([
        supabase.from("profiles")
          .select("*")
          .eq("id", user.id).single(),

        supabase.from("user_progress")
          .select(`
            lesson_id, completed, completed_at,
            lessons (
              title, slug, duration_minutes,
              levels (
                name, title,
                tracks (name, title, color_hex, slug)
              )
            )
          `)
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(20)
      ]);

      let reviewsCount = 0;
      try {
        const reviewRes = await supabase.from("user_mastery")
          .select("next_review")
          .eq("user_id", user.id)
          .lte("next_review", new Date().toISOString().split("T")[0]);
        reviewsCount = reviewRes.data?.length || 0;
      } catch (e) {
        // Fallback check on review_queue
        const rqRes = await supabase.from("review_queue").select("id").eq("user_id", user.id);
        reviewsCount = rqRes.data?.length || 0;
      }
      setReviewCount(reviewsCount);

      const rawProf = profileRes.data;
      if (rawProf) {
        const normProf: Profile = {
          id:                 rawProf.id,
          full_name:          rawProf.full_name || rawProf.name || "Learner",
          subscription_tier:  rawProf.subscription_tier || rawProf.role || "free",
          xp_total:           rawProf.xp_total || 0,
          current_streak:     rawProf.current_streak ?? rawProf.streak_current ?? 0,
          longest_streak:     rawProf.longest_streak ?? rawProf.streak_longest ?? 0,
          primary_track:      rawProf.primary_track || "personal-finance",
          onboarding_goal:    rawProf.onboarding_goal || rawProf.goal || "",
          ai_questions_today: rawProf.ai_questions_today || 0,
          theme:              rawProf.theme || "light",
        };
        setProfile(normProf);
      }

      const prog = progressRes.data || [];
      const done = prog.filter((p: any) => p.completed || p.completed_at);
      setTotalDone(done.length);

      const recentMapped: RecentLesson[] = done.slice(0, 5).map((p: any) => {
        const l = p.lessons || {};
        const lv = l.levels || {};
        const tr = lv.tracks || {};
        return {
          lesson_id:    p.lesson_id,
          completed:    p.completed || true,
          completed_at: p.completed_at || new Date().toISOString(),
          lesson: {
            title:            l.title || "Lesson",
            slug:             l.slug || "",
            duration_minutes: l.duration_minutes || 5,
            level: {
              track: {
                name:      tr.name || tr.title || "Finance",
                color_hex: tr.color_hex || "#0E6163"
              }
            }
          }
        };
      });
      setRecent(recentMapped);

      // Build 7-day activity grid
      const days: WeekDay[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const label   = i === 0 ? "Today" : i === 1 ? "Yesterday" : d.toLocaleDateString("en-IN", { weekday: "short" });
        const hasDone = done.some((p: any) => p.completed_at?.startsWith(dateStr));
        days.push({ label, date: dateStr, done: hasDone });
      }
      setWeekActivity(days);

      // Find next lesson to take
      const trackSlug = rawProf?.primary_track || "personal-finance";
      const completedIds = new Set(done.map((p: any) => p.lesson_id));

      const { data: trackLessons } = await supabase
        .from("lessons")
        .select(`
          id, title, slug, duration_minutes, order_index,
          levels!inner(name, title, tracks!inner(name, title, color_hex, slug))
        `)
        .order("order_index")
        .limit(30);

      if (trackLessons) {
        const next = trackLessons.find((l: any) => !completedIds.has(l.id));
        if (next) {
          const lv = (next as any).levels || {};
          const tr = lv.tracks || {};
          setNextLesson({
            id:               next.id,
            title:            next.title,
            slug:             next.slug,
            duration_minutes: next.duration_minutes || 5,
            level: {
              name: lv.name || lv.title || "Level 1",
              track: {
                name:      tr.name || tr.title || "Finance Track",
                color_hex: tr.color_hex || "#0E6163",
                slug:      tr.slug || "personal-finance"
              }
            }
          });
        }
      }

    } catch (err) {
      console.error("Dashboard error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px", fontFamily: "var(--font-ui,system-ui)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ height: 100, background: "linear-gradient(90deg,#f5f5f5 25%,#ebebeb 50%,#f5f5f5 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", borderRadius:14 }} />
        ))}
      </div>
    </div>
  );

  if (!profile) return null;

  const league = LEAGUE_INFO(profile.xp_total || 0);
  const leagueMin = league.name === "Bronze" ? 0 : league.name === "Silver" ? 500 : league.name === "Gold" ? 2000 : league.name === "Diamond" ? 5000 : 10000;
  const leaguePct = league.nextXP ? Math.min(100, Math.max(0, Math.round(((profile.xp_total - leagueMin) / (league.nextXP - leagueMin)) * 100))) : 100;
  const aiLimit   = TIER_LIMITS[profile.subscription_tier] || 5;
  const aiUsed    = profile.ai_questions_today || 0;
  const firstName = profile.full_name?.split(" ")[0] || "there";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 80px", fontFamily: "var(--font-ui,system-ui)" }}>

      {/* Greeting */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1c2b3a", margin: "0 0 4px", letterSpacing: "-0.3px" }}>
          {greeting}, {firstName}! 👋
        </h1>
        <p style={{ fontSize: 14, color: "#718096", margin: 0 }}>
          {profile.current_streak > 0
            ? `🔥 ${profile.current_streak}-day streak — keep it going!`
            : "Start a lesson today to begin your streak."}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="🔥" value={profile.current_streak} label="Day streak"
          color="#D4A017" sub={`Best: ${profile.longest_streak} days`} />
        <StatCard icon="⭐" value={(profile.xp_total || 0).toLocaleString("en-IN")} label="Total XP"
          color="#185FA5" sub={`${league.emoji} ${league.name} League`} />
        <StatCard icon="✅" value={totalDone} label="Lessons done"
          color="#1D9E75" sub="keep learning!" />
        <StatCard icon="🤖" value={`${aiUsed}/${aiLimit}`} label="AI questions today"
          color="#0E6163" sub={profile.subscription_tier === "free" ? "Upgrade for 50/day" : ""} />
      </div>

      {/* 7-day activity + league row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>

        {/* 7-day activity */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2b3a", marginBottom: 14 }}>This Week</div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
            {weekActivity.map(day => (
              <div key={day.date} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  width: "100%", aspectRatio: "1",
                  background: day.done ? "#1D9E75" : "#EDF2F7",
                  borderRadius: 8, marginBottom: 5,
                  border: day.label === "Today" ? "2px solid #0E6163" : "2px solid transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14,
                }}>
                  {day.done ? "✓" : ""}
                </div>
                <div style={{ fontSize: 9, color: day.label === "Today" ? "#0E6163" : "#a0aec0", fontWeight: day.label === "Today" ? 700 : 400 }}>
                  {day.label.slice(0, 3)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* League progress */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2b3a" }}>Your League</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: league.color, marginTop: 2 }}>
                {league.emoji} {league.name}
              </div>
            </div>
            <a href="/leaderboard" style={{
              fontSize: 12, color: "#0E6163", textDecoration: "none", fontWeight: 600,
              padding: "5px 10px", background: "#f0f9f9", borderRadius: 8,
            }}>
              Leaderboard →
            </a>
          </div>
          {league.nextXP && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#a0aec0", marginBottom: 5 }}>
                <span>{(profile.xp_total || 0).toLocaleString("en-IN")} XP</span>
                <span>{league.nextXP.toLocaleString("en-IN")} XP for {league.next}</span>
              </div>
              <div style={{ height: 7, background: "#EDF2F7", borderRadius: 999 }}>
                <div style={{ height: "100%", width: `${leaguePct}%`, background: league.color, borderRadius: 999, transition: "width 0.8s ease" }} />
              </div>
              <div style={{ fontSize: 11, color: "#a0aec0", marginTop: 5 }}>
                {((league.nextXP || 0) - (profile.xp_total || 0)).toLocaleString("en-IN")} XP to {league.next}
              </div>
            </>
          )}
          {!league.nextXP && (
            <div style={{ fontSize: 13, color: "#7C3AED", fontWeight: 600, marginTop: 6 }}>
              🏆 Maximum league achieved!
            </div>
          )}
        </div>
      </div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        <div>
          {/* Continue learning card */}
          {nextLesson && (
            <div style={{
              background: "linear-gradient(135deg,#1c2b3a 0%,#0E6163 100%)",
              borderRadius: 16, padding: "20px 22px", marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
                Continue Learning
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 6px", lineHeight: 1.3 }}>
                {nextLesson.title}
              </h3>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                {nextLesson.level.track.name} · {nextLesson.level.name} · {nextLesson.duration_minutes} min
              </div>
              <a href={`/learn/${nextLesson.slug}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "10px 20px", background: "#1D9E75", color: "#fff",
                  borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: "none",
                }}>
                Start Lesson →
              </a>
            </div>
          )}

          {/* Review due banner */}
          {reviewCount > 0 && (
            <div style={{
              background: "#FFF5F5", border: "1px solid #FEB2B2",
              borderRadius: 14, padding: "14px 18px", marginBottom: 16,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#C53030" }}>
                  📅 {reviewCount} concept{reviewCount !== 1 ? "s" : ""} due for review
                </div>
                <div style={{ fontSize: 12, color: "#718096", marginTop: 3 }}>
                  Keep your mastery high — review takes just a few minutes
                </div>
              </div>
              <a href="/review" style={{
                padding: "8px 16px", background: "#E53E3E", color: "#fff",
                borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", flexShrink: 0,
              }}>
                Review Now →
              </a>
            </div>
          )}

          {/* Recent lessons */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1c2b3a" }}>Recently Completed</div>
              <a href="/explore" style={{ fontSize: 12, color: "#0E6163", textDecoration: "none", fontWeight: 600 }}>
                Browse all →
              </a>
            </div>
            {recent.length === 0 ? (
              <div style={{ padding: "32px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📚</div>
                <div style={{ fontSize: 14, color: "#718096", marginBottom: 12 }}>No lessons completed yet</div>
                <a href="/explore" style={{
                  display: "inline-block", padding: "9px 20px",
                  background: "#0E6163", color: "#fff",
                  borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: "none",
                }}>
                  Start Learning →
                </a>
              </div>
            ) : recent.map((item, i) => {
              const trackColor = item.lesson?.level?.track?.color_hex || "#0E6163";
              return (
                <a key={item.lesson_id} href={`/learn/${item.lesson?.slug}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 18px",
                    borderBottom: i < recent.length - 1 ? "1px solid #f5f5f5" : "none",
                    textDecoration: "none",
                    background: "transparent",
                  }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: `${trackColor}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                  }}>
                    ✅
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.lesson?.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#a0aec0" }}>
                      {item.lesson?.level?.track?.name} ·{" "}
                      {item.completed_at ? new Date(item.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#a0aec0", flexShrink: 0 }}>→</div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Quick links */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2b3a", marginBottom: 12 }}>Quick Access</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "📖 Explore All Lessons", href: "/explore" },
                { label: "🤖 Ask AI Mentor",       href: "/ai-tutor" },
                { label: "📊 SIP Calculator",      href: "/practice/sip" },
                { label: "💎 Net Worth Tracker",   href: "/practice/net-worth" },
                { label: "🎯 Goal Planner",        href: "/practice/goals" },
                { label: "📚 Glossary",            href: "/glossary" },
                { label: "🗺️ Knowledge Map",       href: "/knowledge-map" },
                { label: "🔄 Daily Review",        href: "/review" },
                { label: "📋 Case Studies",        href: "/case-studies" },
                { label: "🏆 Leaderboard",         href: "/leaderboard" },
              ].map(link => (
                <a key={link.href} href={link.href}
                  style={{
                    display: "block", padding: "8px 12px",
                    background: "#f8f9fa", border: "1px solid #e2e8f0",
                    borderRadius: 8, fontSize: 13, color: "#1c2b3a",
                    textDecoration: "none", fontWeight: 500,
                  }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Upgrade prompt for free users */}
          {profile.subscription_tier === "free" && (
            <div style={{
              background: "linear-gradient(135deg,#553C9A,#7C3AED)",
              borderRadius: 14, padding: "18px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                💎 Upgrade to Pro
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 14 }}>
                Unlock 200+ lessons, 50 AI questions/day, certificates, and priority support.
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginBottom: 12 }}>
                ₹299<span style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.6)" }}>/month</span>
              </div>
              <a href="/pricing" style={{
                display: "block", textAlign: "center", padding: "9px",
                background: "#fff", color: "#553C9A",
                borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: "none",
              }}>
                Upgrade Now →
              </a>
            </div>
          )}

          {/* Referral Card */}
          <ReferralCard />

          {/* Certificates */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2b3a" }}>🏆 Certificates</div>
              <a href="/certificates" style={{ fontSize: 12, color: "#0E6163", textDecoration: "none", fontWeight: 600 }}>View all →</a>
            </div>
            <div style={{ fontSize: 12, color: "#718096", lineHeight: 1.6 }}>
              Complete all lessons in a track to earn a verified certificate — shareable on LinkedIn.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
