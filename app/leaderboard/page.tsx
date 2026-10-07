"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Weekly Leaderboard with Leagues
// app/leaderboard/page.tsx
// Bronze → Silver → Gold → Diamond → Master
// ============================================================

type LeagueEntry = {
  user_id:      string;
  xp_earned:    number;
  lessons_done: number;
  quizzes_done: number;
  streak_days:  number;
  league:       string;
  rank:         number;
  profile: {
    full_name:         string;
    subscription_tier: string;
    current_streak:    number;
  };
};

type Week = {
  id:         string;
  week_start: string;
  week_end:   string;
};

const LEAGUE_CONFIG = {
  master:  { label: "Master",  emoji: "🏆", color: "#7C3AED", bg: "#FAF5FF", border: "#E9D8FD", min: 10000 },
  diamond: { label: "Diamond", emoji: "💎", color: "#185FA5", bg: "#EBF8FF", border: "#BEE3F8", min: 5000  },
  gold:    { label: "Gold",    emoji: "🥇", color: "#D4A017", bg: "#FFFFF0", border: "#FBD38D", min: 2000  },
  silver:  { label: "Silver",  emoji: "🥈", color: "#718096", bg: "#F7FAFC", border: "#CBD5E0", min: 500   },
  bronze:  { label: "Bronze",  emoji: "🥉", color: "#854F0B", bg: "#FFFBEB", border: "#FBD38D", min: 0     },
};

type LeagueKey = keyof typeof LEAGUE_CONFIG;

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function XPBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height: 4, background: "#EDF2F7", borderRadius: 999, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.8s ease" }} />
    </div>
  );
}

export default function LeaderboardPage() {
  const [entries,      setEntries]      = useState<LeagueEntry[]>([]);
  const [currentUser,  setCurrentUser]  = useState<LeagueEntry | null>(null);
  const [week,         setWeek]         = useState<Week | null>(null);
  const [activeLeague, setActiveLeague] = useState<LeagueKey>("gold");
  const [loading,      setLoading]      = useState(true);
  const [userLeague,   setUserLeague]   = useState<LeagueKey>("bronze");
  const [timeLeft,     setTimeLeft]     = useState("");

  // Countdown to end of week
  useEffect(() => {
    const tick = () => {
      if (!week?.week_end) return;
      const end  = new Date(week.week_end + "T23:59:59");
      const diff = end.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Week ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m left`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [week]);

  useEffect(() => {
    loadData();
  }, [activeLeague]);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    // Get current week
    const { data: rawWeekData } = await supabase
      .from("leaderboard_weeks")
      .select("*")
      .eq("is_current", true)
      .single();
    const weekData = rawWeekData as any;
    if (weekData) setWeek(weekData as Week);

    // Get user's own entry
    if (user && weekData) {
      const { data: myEntry } = await supabase
        .from("weekly_xp_log")
        .select(`*, profiles(full_name,subscription_tier,current_streak)`)
        .eq("user_id", user.id)
        .eq("week_id", weekData.id)
        .single();

      if (myEntry) {
        setCurrentUser({ ...(myEntry as any), profile: (myEntry as any).profiles });
        setUserLeague(((myEntry as any).league as LeagueKey) || "bronze");
      }
    }

    // Get leaderboard for active league
    if (weekData) {
      const { data: leagueData } = await supabase
        .from("weekly_xp_log")
        .select(`*, profiles(full_name,subscription_tier,current_streak)`)
        .eq("week_id", weekData.id)
        .eq("league", activeLeague)
        .order("xp_earned", { ascending: false })
        .limit(50);

      const formatted = (leagueData || []).map((e: any, i: number) => ({
        ...e,
        rank:    i + 1,
        profile: e.profiles,
      }));
      setEntries(formatted);
    }

    setLoading(false);
  };

  const league = LEAGUE_CONFIG[activeLeague];
  const nextLeague = activeLeague === "bronze" ? "silver"
    : activeLeague === "silver" ? "gold"
    : activeLeague === "gold"   ? "diamond"
    : activeLeague === "diamond"? "master"
    : null;

  const userXP      = currentUser?.xp_earned || 0;
  const nextMinXP   = nextLeague ? LEAGUE_CONFIG[nextLeague as LeagueKey].min : null;
  const xpToPromote = nextMinXP ? Math.max(0, nextMinXP - userXP) : 0;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px", fontFamily: "var(--font-ui,system-ui)" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1c2b3a", margin: "0 0 6px", letterSpacing: "-0.4px" }}>
          🏆 Weekly Leaderboard
        </h1>
        {week && (
          <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#718096" }}>
            <span>Week of {new Date(week.week_start).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            <span style={{ color: "#E53E3E", fontWeight: 600 }}>⏳ {timeLeft}</span>
          </div>
        )}
      </div>

      {/* My rank card */}
      {currentUser && (
        <div style={{
          background:  "linear-gradient(135deg, #1c2b3a 0%, #0E6163 100%)",
          borderRadius: 16, padding: "20px 22px", marginBottom: 24, color: "#fff",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
            Your Position This Week
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: `${LEAGUE_CONFIG[userLeague].color}30`,
              border: `2px solid ${LEAGUE_CONFIG[userLeague].color}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
            }}>
              {LEAGUE_CONFIG[userLeague].emoji}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
                {LEAGUE_CONFIG[userLeague].label} League
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#1D9E75" }}>
                #{currentUser.rank || "—"}
              </div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>
                {currentUser.xp_earned.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>XP this week</div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 16, marginBottom: nextLeague ? 14 : 0 }}>
            {[
              { icon: "📖", val: currentUser.lessons_done, label: "lessons" },
              { icon: "🎯", val: currentUser.quizzes_done, label: "quizzes" },
              { icon: "🔥", val: currentUser.streak_days,  label: "streak" },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 18 }}>{s.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Promotion progress */}
          {nextLeague && xpToPromote > 0 && (
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                  {xpToPromote.toLocaleString("en-IN")} XP to {LEAGUE_CONFIG[nextLeague as LeagueKey].emoji} {LEAGUE_CONFIG[nextLeague as LeagueKey].label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1D9E75" }}>
                  {Math.round((userXP / LEAGUE_CONFIG[nextLeague as LeagueKey].min) * 100)}%
                </span>
              </div>
              <XPBar
                value={userXP - LEAGUE_CONFIG[activeLeague].min}
                max={LEAGUE_CONFIG[nextLeague as LeagueKey].min - LEAGUE_CONFIG[activeLeague].min}
                color="#1D9E75"
              />
            </div>
          )}
          {nextLeague && xpToPromote === 0 && (
            <div style={{ background: "#1D9E75", borderRadius: 10, padding: "10px 14px", textAlign: "center", fontSize: 13, fontWeight: 700 }}>
              🎉 Promoted to {LEAGUE_CONFIG[nextLeague as LeagueKey].label}! Check the {LEAGUE_CONFIG[nextLeague as LeagueKey].label} league.
            </div>
          )}
        </div>
      )}

      {/* League tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {(Object.entries(LEAGUE_CONFIG) as [LeagueKey, typeof LEAGUE_CONFIG.master][]).reverse().map(([key, cfg]) => (
          <button key={key} onClick={() => setActiveLeague(key)}
            style={{
              padding: "8px 16px", flexShrink: 0,
              background: activeLeague === key ? cfg.color : "#fff",
              color: activeLeague === key ? "#fff" : cfg.color,
              border: `2px solid ${activeLeague === key ? cfg.color : cfg.border}`,
              borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "var(--font-ui,system-ui)",
              display: "flex", alignItems: "center", gap: 6,
            }}>
            <span>{cfg.emoji}</span>
            <span>{cfg.label}</span>
            {key === userLeague && <span style={{ fontSize: 9, background: "rgba(255,255,255,0.3)", padding: "1px 5px", borderRadius: 8 }}>YOU</span>}
          </button>
        ))}
      </div>

      {/* League info banner */}
      <div style={{
        background: league.bg, border: `1px solid ${league.border}`,
        borderRadius: 12, padding: "12px 16px", marginBottom: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: 14, color: league.color, fontWeight: 600 }}>
          {league.emoji} {league.label} League — {league.min.toLocaleString("en-IN")}+ XP
        </div>
        <div style={{ fontSize: 12, color: "#718096" }}>
          {entries.length} learner{entries.length !== 1 ? "s" : ""} this week
        </div>
      </div>

      {/* Leaderboard entries */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ height: 64, background: "linear-gradient(90deg,#f5f5f5 25%,#ebebeb 50%,#f5f5f5 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 12 }} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{league.emoji}</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1c2b3a", marginBottom: 8 }}>
            No one in {league.label} yet this week
          </h3>
          <p style={{ fontSize: 14, color: "#718096", marginBottom: 20 }}>
            Be the first! Earn {league.min.toLocaleString("en-IN")} XP this week to join {league.label} league.
          </p>
          <a href="/explore" style={{
            display: "inline-block", padding: "10px 22px",
            background: league.color, color: "#fff",
            borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none",
          }}>
            Start Earning XP →
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((entry, i) => {
            const isMe = entry.user_id === currentUser?.user_id;
            const medal = RANK_MEDALS[entry.rank];

            return (
              <div key={entry.user_id} style={{
                display: "flex", gap: 14, alignItems: "center",
                padding: "14px 16px",
                background: isMe ? `${league.color}10` : "#fff",
                border: `1.5px solid ${isMe ? league.color : "#e2e8f0"}`,
                borderRadius: 12,
                transition: "all 0.15s",
              }}>
                {/* Rank */}
                <div style={{ width: 36, textAlign: "center", flexShrink: 0 }}>
                  {medal ? (
                    <span style={{ fontSize: 22 }}>{medal}</span>
                  ) : (
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#a0aec0" }}>#{entry.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: `${league.color}20`,
                  border: `2px solid ${league.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700, color: league.color,
                }}>
                  {(entry.profile?.full_name || "?")[0].toUpperCase()}
                </div>

                {/* Name + stats */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1c2b3a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.profile?.full_name || "Anonymous"}
                      {isMe && <span style={{ marginLeft: 6, fontSize: 10, color: league.color, fontWeight: 700 }}>YOU</span>}
                    </span>
                    {entry.profile?.subscription_tier === "pro" && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#185FA5", background: "#EBF8FF", padding: "1px 6px", borderRadius: 8, flexShrink: 0 }}>PRO</span>
                    )}
                    {entry.profile?.subscription_tier === "expert" && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#553C9A", background: "#FAF5FF", padding: "1px 6px", borderRadius: 8, flexShrink: 0 }}>EXPERT</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#a0aec0" }}>
                    <span>📖 {entry.lessons_done}</span>
                    <span>🎯 {entry.quizzes_done}</span>
                    {entry.streak_days > 0 && <span>🔥 {entry.streak_days}d</span>}
                  </div>
                </div>

                {/* XP */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: league.color }}>
                    {entry.xp_earned.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: 10, color: "#a0aec0" }}>XP</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* How XP works */}
      <div style={{
        marginTop: 28, background: "#f8f9fa", border: "1px solid #e2e8f0",
        borderRadius: 14, padding: "18px 20px",
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1c2b3a", marginBottom: 12 }}>
          How to earn XP this week
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { action: "Complete a lesson",   xp: "+10 XP"  },
            { action: "Pass a quiz",          xp: "+25 XP"  },
            { action: "Daily streak",         xp: "+5 XP"   },
            { action: "Complete a review",    xp: "+10 XP"  },
            { action: "Use a simulator",      xp: "+5 XP"   },
            { action: "Complete a track",     xp: "+500 XP" },
          ].map(item => (
            <div key={item.action} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 12, color: "#4a5568" }}>{item.action}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1D9E75" }}>{item.xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
