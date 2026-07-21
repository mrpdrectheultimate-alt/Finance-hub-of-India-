"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Mission = {
  id: string;
  title: string;
  target: number;
  type: string;
  xp: number;
  track?: string;
  min_score?: number;
  sim_id?: string;
};

type WeeklyMission = {
  id: string;
  theme: string;
  description: string;
  missions: Mission[];
  xp_multiplier: number;
  week_start: string;
};

type UserProgress = {
  progress: Record<string, number>;
  completed: boolean;
  xp_earned: number;
};

type WeeklyMissionResponse = {
  mission: WeeklyMission | null;
  progress: UserProgress | null;
  daysLeft: number;
};

export default function WeeklyMissions() {
  const [weeklyMission, setWeeklyMission] = useState<WeeklyMission | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    void loadMission();
  }, []);

  const loadMission = async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/weekly-mission", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = (await response.json()) as WeeklyMissionResponse;

      if (response.ok) {
        setWeeklyMission(result.mission);
        setUserProgress(result.progress || { progress: {}, completed: false, xp_earned: 0 });
        setDaysLeft(result.daysLeft || 0);
      }
    } catch (error) {
      console.error("Failed to load weekly mission:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMissionProgress = (mission: Mission) => userProgress?.progress?.[mission.id] || 0;

  const totalXP = weeklyMission?.missions.reduce((sum, mission) => sum + mission.xp, 0) || 0;
  const earnedXP = userProgress?.xp_earned || 0;
  const completedMissions = weeklyMission?.missions.filter((mission) => getMissionProgress(mission) >= mission.target).length || 0;
  const totalMissions = weeklyMission?.missions.length || 0;
  const overallPct = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

  if (loading) {
    return (
      <div style={s.wrap}>
        <div style={s.skeleton} />
        <div style={s.skeleton} />
        <div style={s.skeleton} />
      </div>
    );
  }

  if (!weeklyMission) {
    return (
      <div style={s.wrap}>
        <div style={s.empty}>No weekly mission is available. Check back next Monday.</div>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.headerTop}>
          <div>
            <div style={s.weekLabel}>Weekly Mission</div>
            <h3 style={s.theme}>{weeklyMission.theme}</h3>
            <p style={s.desc}>{weeklyMission.description}</p>
          </div>
          <div style={s.multiplierBadge}>
            <div style={s.multiplierNum}>{weeklyMission.xp_multiplier}x</div>
            <div style={s.multiplierLabel}>XP bonus</div>
          </div>
        </div>

        <div>
          <div style={s.overallTop}>
            <span style={s.overallLabel}>
              {completedMissions}/{totalMissions} tasks complete
            </span>
            <span style={s.daysLeft}>{daysLeft} days left</span>
          </div>
          <div style={s.progressBg}>
            <div style={{ ...s.progressFill, width: `${overallPct}%` }} />
          </div>
          <div style={s.xpRow}>
            <span style={s.xpEarned}>{earnedXP} XP earned</span>
            <span style={s.xpTotal}>of {totalXP} XP available</span>
          </div>
        </div>
      </div>

      {userProgress?.completed ? (
        <div style={s.completedBanner}>
          Weekly mission complete. +{earnedXP} XP earned. Come back next week for a new mission.
        </div>
      ) : null}

      <div style={s.missionList}>
        {weeklyMission.missions.map((mission, index) => {
          const progress = getMissionProgress(mission);
          const isDone = progress >= mission.target;
          const pct = Math.min(100, Math.round((progress / mission.target) * 100));

          return (
            <div key={mission.id} style={{ ...s.missionCard, ...(isDone ? s.missionCardDone : {}) }}>
              <div style={s.missionLeft}>
                <div style={{ ...s.missionCheck, background: isDone ? "#1D9E75" : "#eee", color: isDone ? "#fff" : "#888" }}>
                  {isDone ? "OK" : index + 1}
                </div>
              </div>

              <div style={s.missionBody}>
                <div style={s.missionTitle}>{mission.title}</div>

                {mission.target > 1 ? (
                  <div style={s.taskProgress}>
                    <div style={s.taskProgressBg}>
                      <div style={{ ...s.taskProgressFill, width: `${pct}%` }} />
                    </div>
                    <span style={s.taskProgressLabel}>{progress}/{mission.target}</span>
                  </div>
                ) : null}

                <div style={s.missionTags}>
                  <span style={s.typeTag}>{getMissionTypeLabel(mission.type)}</span>
                  {mission.track ? <span style={s.trackTag}>{mission.track}</span> : null}
                  {mission.min_score ? <span style={s.scoreTag}>{mission.min_score}%+ score</span> : null}
                </div>
              </div>

              <div style={s.missionRight}>
                <div style={{ ...s.missionXP, color: isDone ? "#1D9E75" : "#888" }}>+{mission.xp} XP</div>
                {isDone ? <div style={s.doneLabel}>Done</div> : getMissionLink(mission)}
              </div>
            </div>
          );
        })}
      </div>

      <div style={s.footer}>
        <span style={s.footerIcon}>TIP</span>
        <span style={s.footerText}>
          Complete all tasks before {daysLeft > 0 ? `${daysLeft} days` : "end of day"} to earn the full XP bonus with {weeklyMission.xp_multiplier}x multiplier.
        </span>
      </div>
    </div>
  );
}

function getMissionTypeLabel(type: string): string {
  return {
    lessons: "Lessons",
    quiz_pass: "Quiz",
    simulator: "Lab",
    streak: "Streak",
    ai_question: "AI Tutor",
  }[type] || type;
}

function getMissionLink(mission: Mission) {
  if (mission.type === "lessons" || mission.type === "quiz_pass") {
    return <Link href="/explore" style={s.goBtn}>Go</Link>;
  }
  if (mission.type === "simulator") {
    return <Link href="/practice" style={s.goBtn}>Go</Link>;
  }
  if (mission.type === "ai_question") {
    return <Link href="/ai-tutor" style={s.goBtn}>Go</Link>;
  }
  return null;
}

const s: Record<string, CSSProperties> = {
  wrap: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 14, overflow: "hidden", fontFamily: "system-ui,-apple-system,sans-serif" },
  skeleton: { height: 60, background: "#eee", margin: "10px 16px", borderRadius: 8 },
  empty: { padding: "28px", textAlign: "center", fontSize: 13, color: "#888" },
  header: { padding: "16px 18px", borderBottom: "0.5px solid #eee", background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)" },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 14 },
  weekLabel: { fontSize: 10, fontWeight: 700, color: "#1D9E75", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 },
  theme: { fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.2px" },
  desc: { fontSize: 12, color: "#bbb", margin: 0, lineHeight: 1.45 },
  multiplierBadge: { background: "#1D9E75", borderRadius: 10, padding: "8px 12px", textAlign: "center", flexShrink: 0 },
  multiplierNum: { fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 },
  multiplierLabel: { fontSize: 9, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: ".05em" },
  overallTop: { display: "flex", justifyContent: "space-between", marginBottom: 5, gap: 12 },
  overallLabel: { fontSize: 12, color: "#ddd", fontWeight: 500 },
  daysLeft: { fontSize: 11, color: "#aaa" },
  progressBg: { height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden", marginBottom: 5 },
  progressFill: { height: "100%", background: "#1D9E75", borderRadius: 3, transition: "width .5s ease" },
  xpRow: { display: "flex", justifyContent: "space-between", gap: 12 },
  xpEarned: { fontSize: 11, color: "#1D9E75", fontWeight: 600 },
  xpTotal: { fontSize: 11, color: "#888" },
  completedBanner: { background: "#E1F5EE", padding: "12px 18px", fontSize: 13, color: "#0F6E56", fontWeight: 500, borderBottom: "0.5px solid #9FE1CB" },
  missionList: { display: "flex", flexDirection: "column" },
  missionCard: { display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: "0.5px solid #f5f5f5", transition: "background .15s" },
  missionCardDone: { background: "#F8FEFB" },
  missionLeft: { flexShrink: 0 },
  missionCheck: { width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 },
  missionBody: { flex: 1, minWidth: 0 },
  missionTitle: { fontSize: 13, fontWeight: 600, color: "#0a0a0a", marginBottom: 5 },
  taskProgress: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 },
  taskProgressBg: { flex: 1, height: 4, background: "#eee", borderRadius: 2, overflow: "hidden" },
  taskProgressFill: { height: "100%", background: "#1D9E75", borderRadius: 2, transition: "width .4s" },
  taskProgressLabel: { fontSize: 10, color: "#888", flexShrink: 0 },
  missionTags: { display: "flex", gap: 5, flexWrap: "wrap" },
  typeTag: { fontSize: 10, color: "#555", background: "#f0f0f0", padding: "1px 6px", borderRadius: 8 },
  trackTag: { fontSize: 10, color: "#185FA5", background: "#E6F1FB", padding: "1px 6px", borderRadius: 8 },
  scoreTag: { fontSize: 10, color: "#534AB7", background: "#EEEDFE", padding: "1px 6px", borderRadius: 8 },
  missionRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 },
  missionXP: { fontSize: 12, fontWeight: 700 },
  doneLabel: { fontSize: 11, fontWeight: 600, color: "#1D9E75" },
  goBtn: { fontSize: 11, fontWeight: 700, color: "#1D9E75", textDecoration: "none", padding: "4px 8px", border: "0.5px solid #1D9E75", borderRadius: 6 },
  footer: { display: "flex", gap: 8, padding: "10px 16px", background: "#fafafa", fontSize: 12, color: "#888", lineHeight: 1.5 },
  footerIcon: { flexShrink: 0, fontSize: 10, fontWeight: 800, color: "#1D9E75", background: "#E1F5EE", padding: "2px 5px", borderRadius: 6, alignSelf: "flex-start" },
  footerText: {},
};
