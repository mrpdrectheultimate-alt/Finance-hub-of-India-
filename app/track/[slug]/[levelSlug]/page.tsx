"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type LessonItem = {
  id: string;
  title: string;
  duration_minutes: number;
  is_free: boolean;
  order_index: number;
  video_url: string | null;
  completed: boolean;
};

type LevelInfo = {
  id: string;
  title: string;
  description: string | null;
  xp_reward: number;
  is_free: boolean;
  track: {
    title: string;
    icon: string | null;
    color_hex: string;
    slug: string;
  } | null;
};

export default function TrackLevelPage() {
  const params = useParams();
  const trackSlug = params?.slug as string;
  const levelSlug = params?.levelSlug as string;

  const [level, setLevel] = useState<LevelInfo | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("free");

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackSlug, levelSlug]);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [{ data: profile }, { data: levelData }] = await Promise.all([
      user ? supabase.from("profiles").select("role").eq("id", user.id).single() : Promise.resolve({ data: null }),
      supabase
        .from("levels")
        .select("*, track:tracks(title, icon, color_hex, slug)")
        .eq("slug", levelSlug)
        .single(),
    ]);

    const currentLevel = levelData as LevelInfo | null;

    setUserRole(profile?.role || "free");
    setLevel(currentLevel);

    if (!currentLevel) {
      setLoading(false);
      return;
    }

    const [{ data: lessonData }, { data: progress }] = await Promise.all([
      supabase
        .from("lessons")
        .select("id, title, duration_minutes, is_free, order_index, video_url")
        .eq("level_id", currentLevel.id)
        .eq("is_published", true)
        .order("order_index"),
      user ? supabase.from("user_progress").select("lesson_id").eq("user_id", user.id) : Promise.resolve({ data: [] }),
    ]);

    const completedIds = new Set(progress?.map((item) => item.lesson_id) || []);
    setLessons(((lessonData as Omit<LessonItem, "completed">[]) || []).map((lesson) => ({
      ...lesson,
      completed: completedIds.has(lesson.id),
    })));
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={s.loadingPage}>
        <div style={{ color: "#888" }}>Loading lessons...</div>
      </div>
    );
  }

  if (!level || !level.track) return null;

  const track = level.track;
  const completed = lessons.filter((lesson) => lesson.completed).length;
  const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;
  const nextLesson = lessons.find((lesson) => !lesson.completed);
  const isLevelLocked = !level.is_free && userRole === "free";

  return (
    <div style={s.page}>
      <div style={s.breadcrumb}>
        <Link href="/explore" style={s.breadLink}>
          Explore
        </Link>
        <span style={s.breadSep}>/</span>
        <span style={{ ...s.breadCurrent, color: track.color_hex }}>
          {track.icon || "FH"} {track.title}
        </span>
        <span style={s.breadSep}>/</span>
        <span style={s.breadCurrent}>{level.title}</span>
      </div>

      <div style={{ ...s.levelHeader, borderLeft: `4px solid ${track.color_hex}` }}>
        <div style={s.headerLeft}>
          <h1 style={s.levelTitle}>{level.title}</h1>
          <p style={s.levelDesc}>{level.description}</p>
          <div style={s.levelMeta}>
            <span style={s.metaTag}>{lessons.length} lessons</span>
            <span style={s.metaTag}>+{level.xp_reward} XP on completion</span>
            {level.is_free ? (
              <span style={{ ...s.metaTag, background: "#E1F5EE", color: "#0F6E56" }}>Free level</span>
            ) : (
              <span style={{ ...s.metaTag, background: "#EEEDFE", color: "#534AB7" }}>Pro level</span>
            )}
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.pctCircle}>
            <div style={{ ...s.pctNum, color: track.color_hex }}>{pct}%</div>
            <div style={s.pctLabel}>complete</div>
          </div>
        </div>
      </div>

      <div style={s.progressBar}>
        <div style={{ ...s.progressFill, width: `${pct}%`, background: track.color_hex }} />
      </div>
      <div style={s.progressLabel}>
        {completed} of {lessons.length} lessons completed
      </div>

      {!isLevelLocked && nextLesson ? (
        <Link href={`/learn/${nextLesson.id}`} style={{ ...s.startBtn, background: track.color_hex }}>
          {pct > 0 ? `Continue - ${nextLesson.title}` : `Start level - ${nextLesson.title}`}
        </Link>
      ) : null}

      {isLevelLocked ? (
        <div style={s.lockBanner}>
          <div style={s.lockMark}>Pro</div>
          <div>
            <div style={s.lockTitle}>This level requires Pro</div>
            <div style={s.lockSub}>Upgrade to unlock all lessons, quizzes, and certificates.</div>
          </div>
          <Link href="/pricing" style={s.lockBtn}>
            Upgrade to Pro
          </Link>
        </div>
      ) : null}

      <div style={s.lessonList}>
        {lessons.map((lesson, index) => {
          const isLocked = !lesson.is_free && userRole === "free";
          const isNext = lesson.id === nextLesson?.id;

          return (
            <div
              key={lesson.id}
              style={{
                ...s.lessonCard,
                ...(isNext ? { ...s.lessonCardNext, borderColor: track.color_hex } : {}),
                ...(lesson.completed ? s.lessonCardDone : {}),
              }}
            >
              <div
                style={{
                  ...s.lessonNum,
                  background: lesson.completed ? "#1D9E75" : isNext ? track.color_hex : "#eee",
                  color: lesson.completed || isNext ? "#fff" : "#aaa",
                }}
              >
                {lesson.completed ? "Done" : isLocked ? "Pro" : index + 1}
              </div>

              <div style={s.lessonInfo}>
                <div style={s.lessonTitle}>{lesson.title}</div>
                <div style={s.lessonMeta}>
                  <span>{lesson.duration_minutes} min</span>
                  {lesson.video_url ? <span>Video</span> : null}
                  {lesson.is_free ? <span style={s.freeTag}>Free</span> : <span style={s.proTag}>Pro</span>}
                  {lesson.completed ? <span style={s.doneTag}>Done</span> : null}
                  {isNext ? (
                    <span style={{ ...s.nextTag, color: track.color_hex, background: `${track.color_hex}18` }}>
                      Next up
                    </span>
                  ) : null}
                </div>
              </div>

              {isLocked ? (
                <Link href="/pricing" style={s.lessonLockBtn}>
                  Unlock
                </Link>
              ) : (
                <Link href={`/learn/${lesson.id}`} style={{ ...s.lessonBtn, color: lesson.completed ? "#aaa" : track.color_hex }}>
                  {lesson.completed ? "Review" : "Start"}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  loadingPage: { minHeight: "100vh", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" },
  page: { minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui,-apple-system,sans-serif", padding: "24px 24px 60px", maxWidth: 720, margin: "0 auto" },
  breadcrumb: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 20 },
  breadLink: { color: "#888", textDecoration: "none" },
  breadSep: { color: "#ccc" },
  breadCurrent: { color: "#555" },
  levelHeader: { background: "#fff", borderRadius: "0 12px 12px 0", padding: "20px 22px", marginBottom: 14, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  headerLeft: { flex: 1 },
  levelTitle: { fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: "#0a0a0a", margin: "0 0 6px" },
  levelDesc: { fontSize: 14, color: "#666", lineHeight: 1.6, margin: "0 0 12px" },
  levelMeta: { display: "flex", flexWrap: "wrap", gap: 6 },
  metaTag: { fontSize: 11, fontWeight: 500, background: "#f0f0f0", color: "#555", padding: "3px 9px", borderRadius: 20 },
  headerRight: {},
  pctCircle: { width: 72, height: 72, borderRadius: "50%", border: "3px solid #eee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  pctNum: { fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" },
  pctLabel: { fontSize: 9, color: "#aaa" },
  progressBar: { height: 6, background: "#eee", borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: "100%", borderRadius: 3, transition: "width .5s" },
  progressLabel: { fontSize: 12, color: "#aaa", marginBottom: 20 },
  startBtn: { display: "block", padding: "13px 20px", fontSize: 14, fontWeight: 600, color: "#fff", borderRadius: 10, textDecoration: "none", marginBottom: 20, textAlign: "center" },
  lockBanner: { background: "#fafafa", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, marginBottom: 20 },
  lockMark: { fontSize: 11, fontWeight: 800, color: "#534AB7", background: "#EEEDFE", padding: "5px 8px", borderRadius: 999 },
  lockTitle: { fontWeight: 600, fontSize: 14, color: "#0a0a0a", marginBottom: 3 },
  lockSub: { fontSize: 12, color: "#888" },
  lockBtn: { marginLeft: "auto", padding: "9px 16px", background: "#1D9E75", color: "#fff", borderRadius: 9, textDecoration: "none", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" },
  lessonList: { display: "flex", flexDirection: "column", gap: 8 },
  lessonCard: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, transition: "border-color .15s" },
  lessonCardNext: { border: "1.5px solid", background: "#F8FEFB" },
  lessonCardDone: { opacity: 0.75 },
  lessonNum: { minWidth: 32, height: 32, padding: "0 8px", borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 },
  lessonInfo: { flex: 1, minWidth: 0 },
  lessonTitle: { fontWeight: 600, fontSize: 14, color: "#0a0a0a", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  lessonMeta: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", fontSize: 12, color: "#888" },
  freeTag: { fontSize: 10, fontWeight: 700, background: "#E1F5EE", color: "#0F6E56", padding: "1px 6px", borderRadius: 8 },
  proTag: { fontSize: 10, fontWeight: 700, background: "#EEEDFE", color: "#534AB7", padding: "1px 6px", borderRadius: 8 },
  doneTag: { fontSize: 10, fontWeight: 700, color: "#1D9E75" },
  nextTag: { fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 8 },
  lessonBtn: { fontSize: 12, fontWeight: 600, textDecoration: "none", flexShrink: 0 },
  lessonLockBtn: { fontSize: 12, fontWeight: 600, color: "#aaa", textDecoration: "none", flexShrink: 0 },
};
