"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type TrackWithLevels = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  color_hex: string;
  levels: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    is_free: boolean;
    xp_reward: number;
    order_index: number;
    lessonCount: number;
    completedCount: number;
  }[];
};

type RawTrack = Omit<TrackWithLevels, "levels"> & {
  levels?: Array<Omit<TrackWithLevels["levels"][number], "lessonCount" | "completedCount">>;
};

export default function ExplorePage() {
  const [tracks, setTracks] = useState<TrackWithLevels[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("free");
  const [activeTrack, setActiveTrack] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [{ data: profile }, { data: allTracks }] = await Promise.all([
      user ? supabase.from("profiles").select("role").eq("id", user.id).single() : Promise.resolve({ data: null }),
      supabase.from("tracks").select("*, levels(*)").eq("is_active", true).order("order_index"),
    ]);

    setUserRole(profile?.role || "free");

    if (!allTracks) {
      setLoading(false);
      return;
    }

    const { data: progress } = user
      ? await supabase.from("user_progress").select("lesson_id").eq("user_id", user.id)
      : { data: [] };
    const completedIds = new Set(progress?.map((item) => item.lesson_id) || []);

    const enriched = await Promise.all(
      (allTracks as RawTrack[]).map(async (track) => {
        const levels = await Promise.all(
          (track.levels || [])
            .sort((a, b) => a.order_index - b.order_index)
            .map(async (level) => {
              const { data: lessons } = await supabase
                .from("lessons")
                .select("id")
                .eq("level_id", level.id)
                .eq("is_published", true);
              const lessonCount = lessons?.length || 0;
              const completedCount = lessons?.filter((lesson) => completedIds.has(lesson.id)).length || 0;

              return { ...level, lessonCount, completedCount };
            }),
        );

        return { ...track, levels };
      }),
    );

    setTracks(enriched);
    setActiveTrack(enriched[0]?.slug || null);
    setLoading(false);
  };

  const activeTrackData = tracks.find((track) => track.slug === activeTrack);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <Link href="/dashboard" style={s.back}>
          Dashboard
        </Link>
        <h1 style={s.title}>Explore tracks</h1>
        <p style={s.sub}>Four complete learning tracks, from absolute beginner to expert.</p>
      </div>

      {loading ? (
        <div style={s.loadingWrap}>
          {[1, 2, 3, 4].map((item) => (
            <div key={item} style={s.skeleton} />
          ))}
        </div>
      ) : (
        <div style={s.layout}>
          <div style={s.trackSelector}>
            {tracks.map((track) => {
              const totalLessons = track.levels.reduce((sum, level) => sum + level.lessonCount, 0);
              const completedLessons = track.levels.reduce((sum, level) => sum + level.completedCount, 0);
              const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
              const isActive = activeTrack === track.slug;

              return (
                <button
                  key={track.id}
                  onClick={() => setActiveTrack(track.slug)}
                  style={{
                    ...s.trackCard,
                    ...(isActive ? { ...s.trackCardActive, borderColor: track.color_hex } : {}),
                  }}
                  type="button"
                >
                  <div style={s.trackCardTop}>
                    <div style={{ ...s.trackIcon, background: `${track.color_hex}22` }}>{track.icon || "FH"}</div>
                    <div style={s.trackMeta}>
                      <div style={s.trackName}>{track.title}</div>
                      <div style={s.trackStats}>
                        {completedLessons}/{totalLessons} lessons
                      </div>
                    </div>
                    <div style={{ ...s.trackPct, color: track.color_hex }}>{pct}%</div>
                  </div>
                  <div style={s.progressBg}>
                    <div style={{ ...s.progressFill, width: `${pct}%`, background: track.color_hex }} />
                  </div>
                </button>
              );
            })}
          </div>

          {activeTrackData ? (
            <div style={s.levelsPanel}>
              <div style={s.panelHeader}>
                <div style={s.panelIcon}>{activeTrackData.icon || "FH"}</div>
                <div>
                  <div style={s.panelTitle}>{activeTrackData.title}</div>
                  <div style={s.panelDesc}>{activeTrackData.description}</div>
                </div>
              </div>

              <div style={s.levelsList}>
                {activeTrackData.levels.map((level, index) => {
                  const pct = level.lessonCount > 0 ? Math.round((level.completedCount / level.lessonCount) * 100) : 0;
                  const isLocked = !level.is_free && userRole === "free";
                  const isComplete = pct === 100;

                  return (
                    <div key={level.id} style={{ ...s.levelCard, opacity: isLocked ? 0.75 : 1 }}>
                      <div style={s.levelTop}>
                        <div
                          style={{
                            ...s.levelNum,
                            background: isComplete ? "#1D9E75" : isLocked ? "#eee" : `${activeTrackData.color_hex}22`,
                            color: isComplete ? "#fff" : isLocked ? "#aaa" : activeTrackData.color_hex,
                          }}
                        >
                          {isComplete ? "Done" : isLocked ? "Pro" : index + 1}
                        </div>
                        <div style={s.levelInfo}>
                          <div style={s.levelTitle}>
                            {level.title}
                            {level.is_free ? <span style={s.freeTag}>Free</span> : <span style={s.proTag}>Pro</span>}
                          </div>
                          <div style={s.levelDesc}>{level.description}</div>
                        </div>
                        <div style={s.levelReward}>+{level.xp_reward} XP</div>
                      </div>

                      <div style={s.levelProgress}>
                        <div style={s.levelProgressBg}>
                          <div
                            style={{
                              ...s.levelProgressFill,
                              width: `${pct}%`,
                              background: activeTrackData.color_hex,
                            }}
                          />
                        </div>
                        <span style={s.levelPct}>
                          {level.completedCount}/{level.lessonCount}
                        </span>
                      </div>

                      {isLocked ? (
                        <Link
                          href="/pricing"
                          style={{
                            ...s.levelBtn,
                            background: "#fafafa",
                            color: "#aaa",
                            border: "0.5px solid #eee",
                          }}
                        >
                          Upgrade to unlock
                        </Link>
                      ) : (
                        <Link
                          href={`/track/${activeTrackData.slug}/${level.slug}`}
                          style={{
                            ...s.levelBtn,
                            background: `${activeTrackData.color_hex}18`,
                            color: activeTrackData.color_hex,
                            border: `0.5px solid ${activeTrackData.color_hex}40`,
                          }}
                        >
                          {isComplete ? "Review lessons" : pct > 0 ? "Continue" : "Start level"}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui,-apple-system,sans-serif", padding: "28px 24px 60px", maxWidth: 960, margin: "0 auto" },
  header: { marginBottom: 28 },
  back: { fontSize: 13, color: "#888", textDecoration: "none", display: "block", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", margin: "0 0 6px", color: "#0a0a0a" },
  sub: { fontSize: 14, color: "#666", margin: 0 },
  loadingWrap: { display: "flex", flexDirection: "column", gap: 12 },
  skeleton: { height: 80, background: "#eee", borderRadius: 12 },
  layout: { display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" },
  trackSelector: { display: "flex", flexDirection: "column", gap: 8, position: "sticky", top: 20 },
  trackCard: { width: "100%", textAlign: "left", background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "border-color .15s", fontFamily: "system-ui,-apple-system,sans-serif" },
  trackCardActive: { border: "1.5px solid", background: "#fff" },
  trackCardTop: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10 },
  trackIcon: { width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  trackMeta: { flex: 1 },
  trackName: { fontWeight: 600, fontSize: 14, color: "#0a0a0a" },
  trackStats: { fontSize: 11, color: "#aaa", marginTop: 2 },
  trackPct: { fontWeight: 700, fontSize: 15 },
  progressBg: { height: 4, background: "#eee", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2, transition: "width .4s" },
  levelsPanel: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 14, overflow: "hidden" },
  panelHeader: { display: "flex", alignItems: "center", gap: 14, padding: "20px 22px", borderBottom: "0.5px solid #eee" },
  panelIcon: { fontSize: 20, fontWeight: 700 },
  panelTitle: { fontWeight: 700, fontSize: 18, color: "#0a0a0a", letterSpacing: "-0.3px" },
  panelDesc: { fontSize: 13, color: "#888", marginTop: 3 },
  levelsList: { display: "flex", flexDirection: "column" },
  levelCard: { padding: "18px 22px", borderBottom: "0.5px solid #f5f5f5" },
  levelTop: { display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 },
  levelNum: { minWidth: 32, height: 32, padding: "0 8px", borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 },
  levelInfo: { flex: 1 },
  levelTitle: { fontWeight: 600, fontSize: 15, color: "#0a0a0a", display: "flex", alignItems: "center", gap: 8, marginBottom: 3 },
  freeTag: { fontSize: 10, fontWeight: 700, background: "#E1F5EE", color: "#0F6E56", padding: "2px 7px", borderRadius: 10 },
  proTag: { fontSize: 10, fontWeight: 700, background: "#EEEDFE", color: "#534AB7", padding: "2px 7px", borderRadius: 10 },
  levelDesc: { fontSize: 13, color: "#888", lineHeight: 1.5 },
  levelReward: { fontSize: 12, color: "#aaa", fontWeight: 500, flexShrink: 0 },
  levelProgress: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  levelProgressBg: { flex: 1, height: 5, background: "#eee", borderRadius: 3, overflow: "hidden" },
  levelProgressFill: { height: "100%", borderRadius: 3, transition: "width .4s" },
  levelPct: { fontSize: 11, color: "#aaa", minWidth: 36, textAlign: "right" },
  levelBtn: { display: "inline-block", padding: "8px 16px", fontSize: 12, fontWeight: 600, borderRadius: 8, textDecoration: "none", fontFamily: "system-ui" },
};
