"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Challenge = {
  id: string;
  title: string;
  description: string;
  type: string;
  xp_reward: number;
  completed: boolean;
  lesson_id: string | null;
  quiz_id: string | null;
};

const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  lesson: { icon: "READ", color: "#185FA5", bg: "#E6F1FB" },
  quiz: { icon: "QUIZ", color: "#534AB7", bg: "#EEEDFE" },
  streak: { icon: "STRK", color: "#854F0B", bg: "#FAEEDA" },
  simulator: { icon: "LAB", color: "#1D9E75", bg: "#E1F5EE" },
};

export default function DailyChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [celebrated, setCelebrated] = useState<string | null>(null);

  useEffect(() => {
    void loadChallenges();
  }, []);

  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const loadChallenges = async () => {
    setLoading(true);
    const token = await getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/daily-challenge", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = (await response.json()) as { challenges?: Challenge[] };
      if (response.ok) setChallenges(result.challenges || []);
    } catch (error) {
      console.error("Failed to load daily challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeChallenge = async (challenge: Challenge) => {
    if (challenge.completed || completing) return;

    const token = await getToken();
    if (!token) return;

    setCompleting(challenge.id);
    try {
      const response = await fetch("/api/daily-challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ challengeId: challenge.id }),
      });
      const result = (await response.json()) as { success?: boolean };

      if (response.ok && result.success) {
        setChallenges((prev) =>
          prev.map((item) => (item.id === challenge.id ? { ...item, completed: true } : item)),
        );
        setCelebrated(challenge.id);
        window.setTimeout(() => setCelebrated(null), 2000);
      }
    } catch (error) {
      console.error("Failed to complete challenge:", error);
    } finally {
      setCompleting(null);
    }
  };

  const completedCount = challenges.filter((challenge) => challenge.completed).length;
  const totalXP = challenges
    .filter((challenge) => challenge.completed)
    .reduce((sum, challenge) => sum + challenge.xp_reward, 0);
  const allDone = completedCount === challenges.length && challenges.length > 0;
  const progress = (completedCount / Math.max(challenges.length, 1)) * 125.6;

  if (loading) {
    return (
      <div style={s.loading}>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} style={s.skeleton} />
        ))}
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.titleRow}>
            <span style={s.titleIcon}>XP</span>
            <h3 style={s.title}>Daily Challenges</h3>
            <span style={s.dateTag}>Today</span>
          </div>
          <p style={s.sub}>Complete all four before midnight for bonus momentum.</p>
        </div>
        <div style={s.progress}>
          <svg width="52" height="52" viewBox="0 0 52 52" aria-label={`${completedCount} of ${challenges.length} challenges complete`}>
            <circle cx="26" cy="26" r="20" fill="none" stroke="#eee" strokeWidth="5" />
            <circle
              cx="26"
              cy="26"
              r="20"
              fill="none"
              stroke="#1D9E75"
              strokeWidth="5"
              strokeDasharray={`${progress} 125.6`}
              strokeLinecap="round"
              transform="rotate(-90 26 26)"
              style={{ transition: "stroke-dasharray .5s ease" }}
            />
            <text x="26" y="31" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0a0a0a">
              {completedCount}/{challenges.length}
            </text>
          </svg>
        </div>
      </div>

      {allDone ? (
        <div style={s.allDoneBanner}>
          <span style={s.allDoneMark}>DONE</span>
          <div>
            <div style={s.allDoneTitle}>All challenges complete</div>
            <div style={s.allDoneXP}>+{totalXP} XP earned today</div>
          </div>
        </div>
      ) : null}

      <div style={s.list}>
        {challenges.length === 0 ? (
          <div style={s.empty}>No challenges are available today. Check back tomorrow.</div>
        ) : (
          challenges.map((challenge) => {
            const meta = TYPE_META[challenge.type] || TYPE_META.lesson;
            const isCelebrating = celebrated === challenge.id;

            return (
              <div
                key={challenge.id}
                style={{
                  ...s.card,
                  ...(challenge.completed ? s.cardDone : {}),
                  ...(isCelebrating ? s.cardCelebrate : {}),
                }}
              >
                <div style={{ ...s.typeIcon, background: meta.bg, color: meta.color }}>
                  {challenge.completed ? "OK" : meta.icon}
                </div>

                <div style={s.cardBody}>
                  <div style={s.cardTitle}>{challenge.title}</div>
                  <div style={s.cardDesc}>{challenge.description}</div>
                </div>

                <div style={s.cardRight}>
                  <div style={{ ...s.xpBadge, color: meta.color, background: meta.bg }}>
                    +{challenge.xp_reward} XP
                  </div>

                  {!challenge.completed && challenge.lesson_id ? (
                    <Link href={`/learn/${challenge.lesson_id}`} style={{ ...s.actionBtn, background: meta.color }}>
                      Start
                    </Link>
                  ) : null}

                  {!challenge.completed && !challenge.lesson_id && challenge.type === "simulator" ? (
                    <Link href="/practice" style={{ ...s.actionBtn, background: meta.color }}>
                      Open
                    </Link>
                  ) : null}

                  {!challenge.completed && !challenge.lesson_id && challenge.type !== "simulator" ? (
                    <button
                      onClick={() => void completeChallenge(challenge)}
                      disabled={completing === challenge.id}
                      style={{ ...s.actionBtn, background: meta.color, opacity: completing === challenge.id ? 0.7 : 1 }}
                      type="button"
                    >
                      {completing === challenge.id ? "Saving" : "Mark done"}
                    </button>
                  ) : null}

                  {challenge.completed ? <div style={s.doneTag}>Done</div> : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!challenges.find((challenge) => challenge.type === "streak")?.completed ? (
        <div style={s.streakReminder}>
          Keep your streak alive by completing one activity today.
        </div>
      ) : null}

      <style>{`
        @keyframes dailyChallengePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes dailyChallengeSkeleton {
          0%, 100% { opacity: .55; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  wrap: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 14, overflow: "hidden", fontFamily: "system-ui,-apple-system,sans-serif" },
  loading: { padding: 16, display: "flex", flexDirection: "column", gap: 10, background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 14 },
  skeleton: { height: 64, background: "#eee", borderRadius: 10, animation: "dailyChallengeSkeleton 1.5s infinite" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 18px 12px", borderBottom: "0.5px solid #eee", gap: 16 },
  headerLeft: { minWidth: 0 },
  titleRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" },
  titleIcon: { fontSize: 10, fontWeight: 800, color: "#1D9E75", background: "#E1F5EE", borderRadius: 7, padding: "4px 6px" },
  title: { fontSize: 15, fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: "-0.3px" },
  dateTag: { fontSize: 10, fontWeight: 600, color: "#1D9E75", background: "#E1F5EE", padding: "2px 7px", borderRadius: 10 },
  sub: { fontSize: 12, color: "#888", margin: 0, lineHeight: 1.45 },
  progress: { flexShrink: 0 },
  allDoneBanner: { display: "flex", gap: 10, alignItems: "center", background: "#E1F5EE", padding: "12px 18px", fontSize: 14, borderBottom: "0.5px solid #9FE1CB" },
  allDoneMark: { fontSize: 10, fontWeight: 800, color: "#fff", background: "#1D9E75", borderRadius: 7, padding: "4px 6px" },
  allDoneTitle: { fontWeight: 600, color: "#0F6E56", marginBottom: 2 },
  allDoneXP: { fontSize: 12, color: "#1D9E75" },
  list: { display: "flex", flexDirection: "column" },
  empty: { padding: "24px", textAlign: "center", fontSize: 13, color: "#888" },
  card: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "0.5px solid #f5f5f5", transition: "background .2s", minWidth: 0 },
  cardDone: { opacity: 0.65 },
  cardCelebrate: { animation: "dailyChallengePulse 0.4s ease", background: "#F0FAF6" },
  typeIcon: { width: 40, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#0a0a0a", marginBottom: 2 },
  cardDesc: { fontSize: 11, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  cardRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 },
  xpBadge: { fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 },
  actionBtn: { padding: "5px 10px", fontSize: 11, fontWeight: 600, border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontFamily: "system-ui", textDecoration: "none", display: "inline-block" },
  doneTag: { fontSize: 11, fontWeight: 600, color: "#1D9E75" },
  streakReminder: { padding: "10px 16px", fontSize: 12, color: "#854F0B", background: "#FAEEDA", borderTop: "0.5px solid #FAC775" },
};
