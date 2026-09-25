"use client";

import AiDoubtBox from "@/components/lesson/AiDoubtBox";
import PremiumGate from "@/components/lesson/PremiumGate";
import XpCelebration from "@/components/learn/XpCelebration";
import QuizModal from "@/components/quiz/QuizModal";
import LessonVideoTab from "@/components/video/LessonVideoTab";
import { supabase } from "@/lib/supabase";
import type { Lesson, Level, Profile, Track } from "@/types/database";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { THEME_CONFIG, TRACK_THEMES, useTheme } from "@/components/ui/ThemeProvider";

const ForexPaperTrader = dynamic(() => import("@/components/trading/ForexPaperTrader"), { ssr: false });
const CryptoPaperTrader = dynamic(() => import("@/components/trading/CryptoPaperTrader"), { ssr: false });
const LessonComments = dynamic(() => import("@/components/community/LessonComments"), { ssr: false });
const LessonNotesTab = dynamic(() => import("@/components/notes/LessonNotesTab"), { ssr: false });
const LessonQA = dynamic(() => import("@/components/community/LessonQA"), { ssr: false });

type FullLesson = Lesson & {
  level: Level & { track: Track };
  quiz: { id: string; title: string; passing_score: number } | null;
  siblingLessons: { id: string; title: string; order_index: number; is_free: boolean }[];
};

type Playlist = {
  id: string;
  title: string;
  channel_name: string;
  description: string | null;
  playlist_url: string | null;
  embed_id: string;
  embed_type: string | null;
  video_type: string | null;
  curator_note: string | null;
  video_count: number | null;
  duration_hrs: number | null;
};

type LessonTab = "learn" | "watch" | "practice" | "notes" | "community" | "download";

const TRACK_PRACTICE: Record<string, { type: "forex" | "crypto" | "simulator"; label: string; href?: string }> = {
  "trading-markets": { type: "forex", label: "Forex Practice Terminal" },
  "forex-currency": { type: "forex", label: "Forex Practice Terminal" },
  "technical-analysis": { type: "forex", label: "Chart Practice Terminal" },
  "crypto-defi": { type: "crypto", label: "Crypto Practice Terminal" },
  "personal-finance": { type: "simulator", label: "Finance Simulators", href: "/simulators" },
  "behavioral-finance": { type: "simulator", label: "Trading Psychology Practice", href: "/simulators" },
  "corporate-finance": { type: "simulator", label: "Startup Cash Flow Simulator", href: "/simulators" },
};

export default function LessonPlayer({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const { setTheme, resetToAuto } = useTheme();
  const startTime = useRef(Date.now());
  const [lesson, setLesson] = useState<FullLesson | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeTab, setActiveTab] = useState<LessonTab>("learn");
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [markingDone, setMarkingDone] = useState(false);
  const [downloadingNotes, setDownloadingNotes] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAiDoubt, setShowAiDoubt] = useState(false);
  const [celebration, setCelebration] = useState<{ xp: number; reason: string; badge?: string | null } | null>(null);

  const loadLessonData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    const { data: les } = await supabase.from("lessons").select("*").eq("id", lessonId).single();

    if (!les) {
      router.push("/dashboard");
      return;
    }

    const lessonObj = les as any;
    const [{ data: level }, { data: quiz }, { data: siblings }, { data: progress }] = await Promise.all([
      supabase.from("levels").select("*").eq("id", lessonObj.level_id).single(),
      supabase.from("quizzes").select("id, title, passing_score").eq("lesson_id", lessonObj.id).single(),
      supabase
        .from("lessons")
        .select("id, title, order_index, is_free")
        .eq("level_id", lessonObj.level_id)
        .eq("is_published", true)
        .order("order_index"),
      supabase.from("user_progress").select("id").eq("user_id", user.id).eq("lesson_id", lessonObj.id).single(),
    ]);

    const levelObj = level as any;
    const { data: trackData } = levelObj ? await supabase.from("tracks").select("*").eq("id", levelObj.track_id).single() : { data: null };
    const trackObj = trackData as any;
    if (trackObj) {
      const { data: playlistRows } = await supabase
        .from("curated_playlists" as never)
        .select("id, title, channel_name, description, playlist_url, embed_id, embed_type, video_type, curator_note, video_count, duration_hrs")
        .or(`lesson_id.eq.${lessonObj.id},track_id.eq.${trackObj.id},category.eq.${trackObj.slug}`)
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("video_type", { ascending: false })
        .limit(6);
      setPlaylists((playlistRows as unknown as Playlist[] | null) || []);
    } else {
      setPlaylists([]);
    }

    setProfile(prof as any);
    setCompleted(Boolean(progress));
    setLesson({
      ...(les as Lesson),
      level: { ...(level as Level), track: trackObj as Track },
      quiz: quiz || null,
      siblingLessons: siblings || [],
    });
    setLoading(false);
  }, [lessonId, router]);

  useEffect(() => {
    void loadLessonData();
  }, [loadLessonData]);

  useEffect(() => {
    if (!lesson?.level?.track?.slug) {
      resetToAuto();
      return;
    }

    const nextTheme = TRACK_THEMES[lesson.level.track.slug] || "default";
    setTheme(nextTheme);

    return () => {
      resetToAuto();
    };
  }, [lesson?.level?.track?.slug, setTheme, resetToAuto]);

  const handleMarkComplete = async () => {
    if (!lesson || !profile || completed) return;

    setMarkingDone(true);
    const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setMarkingDone(false);
      return;
    }

    const response = await fetch("/api/complete-lesson", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ lessonId: lesson.id, timeSpent }),
    });

    const result = (await response.json()) as {
      success?: boolean;
      reason?: string;
      xp_earned?: number;
      new_xp_total?: number;
      badge_earned?: string | null;
    };

    if (!response.ok) {
      console.error("complete-lesson failed:", result);
      setMarkingDone(false);
      return;
    }

    if (result.reason === "already_completed") {
      setCompleted(true);
      setMarkingDone(false);
      if (lesson.quiz) setTimeout(() => setShowQuiz(true), 600);
      return;
    }

    const xpAmount = result.xp_earned || 0;

    setCompleted(true);
    setProfile((current) => (current ? { ...current, xp_total: result.new_xp_total ?? (current.xp_total || 0) + xpAmount } : current));
    setCelebration({ xp: xpAmount, reason: "Lesson completed", badge: result.badge_earned || null });
    setMarkingDone(false);

    if (lesson.quiz) setTimeout(() => setShowQuiz(true), 600);
  };

  const downloadNotes = async () => {
    if (!lesson || downloadingNotes) return;
    setDownloadingNotes(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setDownloadingNotes(false);
      return;
    }

    const response = await fetch("/api/download-lesson-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ lessonId: lesson.id }),
    });

    if (!response.ok) {
      console.error("download notes failed", await response.json().catch(() => ({})));
      setDownloadingNotes(false);
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${lesson.title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_").slice(0, 50)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setDownloadingNotes(false);
  };

  if (loading) return <LessonSkeleton />;
  if (!lesson) return null;

  const isPremiumLocked = !lesson.is_free && profile?.role === "free";
  const currentIndex = lesson.siblingLessons.findIndex((item) => item.id === lessonId);
  const prevLesson = currentIndex > 0 ? lesson.siblingLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < lesson.siblingLessons.length - 1 ? lesson.siblingLessons[currentIndex + 1] : null;
  const trackSlug = lesson.level?.track?.slug || "";
  const trackTheme = TRACK_THEMES[trackSlug] || "default";
  const trackColor = THEME_CONFIG[trackTheme]?.accent || "#0E6163";
  const practiceInfo = TRACK_PRACTICE[trackSlug];
  const visibleTabs: { id: LessonTab; label: string }[] = [
    { id: "learn", label: "Learn" },
    ...(playlists.length > 0 ? [{ id: "watch" as LessonTab, label: `Watch (${playlists.length})` }] : []),
    ...(practiceInfo ? [{ id: "practice" as LessonTab, label: "Practice" }] : []),
    { id: "notes", label: "My Notes" },
    { id: "community", label: "💬 Q&A" },
    { id: "download", label: "Download" },
  ];

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerLeft}>
          <Link href="/dashboard" style={s.backBtn}>
            Dashboard
          </Link>
          <div style={s.breadcrumb}>
            <span style={s.breadTrack}>{lesson.level?.track?.title}</span>
            <span style={s.breadSep}>/</span>
            <span style={s.breadLevel}>{lesson.level?.title}</span>
          </div>
        </div>
        <div style={s.headerRight}>
          {completed ? <div style={s.completedPill}>Completed</div> : null}
          <div style={s.xpPill}>{profile?.xp_total || 0} XP</div>
        </div>
      </header>

      <div style={s.layout}>
        <aside style={s.sidebar}>
          <div style={s.sidebarTitle}>{lesson.level?.title}</div>
          <div style={s.lessonList}>
            {lesson.siblingLessons.map((sibling, index) => {
              const active = sibling.id === lessonId;
              return (
                <Link
                  key={sibling.id}
                  href={`/learn/${sibling.id}`}
                  style={{
                    ...s.sidebarItem,
                    backgroundColor: active ? "var(--bg-elevated, #FFFFFF)" : "transparent",
                    borderColor: active ? "var(--border-strong, #CBD5E1)" : "transparent",
                    color: active ? "var(--accent-primary, #0E6163)" : "var(--text-secondary, #64748B)",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  <span style={s.itemNumber}>{index + 1}</span>
                  <span style={s.itemTitle}>{sibling.title}</span>
                  {!sibling.is_free ? <span style={s.proTag}>PRO</span> : null}
                </Link>
              );
            })}
          </div>
        </aside>

        <main style={s.main}>
          <div style={s.hero}>
            <div style={s.lessonMetaRow}>
              <span style={{ ...s.trackPill, backgroundColor: trackColor }}>{lesson.level?.track?.title}</span>
              <span style={s.durationPill}>{lesson.duration_minutes} min read</span>
              {lesson.quiz ? <span style={s.quizPill}>Quiz available</span> : null}
            </div>
            <h1 style={s.title}>{lesson.title}</h1>

            <div style={s.tabBar}>
              {visibleTabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      ...s.tabButton,
                      backgroundColor: active ? "var(--accent-primary, #0E6163)" : "transparent",
                      color: active ? "#FFFFFF" : "var(--text-secondary, #64748B)",
                      borderColor: active ? "transparent" : "var(--border-subtle, #E2E8F0)",
                    }}
                    type="button"
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {isPremiumLocked ? (
            <PremiumGate lessonTitle={lesson.title} />
          ) : (
            <>
              {activeTab === "learn" ? (
                <>
                  <div style={s.content}>
                    <div style={s.prose}>{lesson.content_mdx}</div>

                    {showAiDoubt ? (
                      <div style={{ marginBottom: 24 }}>
                        <AiDoubtBox
                          lessonTitle={lesson.title}
                          lessonContent={lesson.content_mdx || ""}
                          userRole={(profile?.role as "free" | "pro" | "expert") || "free"}
                          onClose={() => setShowAiDoubt(false)}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAiDoubt(true)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 16px",
                          borderRadius: 12,
                          backgroundColor: "var(--bg-elevated, #F1F5F9)",
                          border: "1px solid var(--border-subtle, #E2E8F0)",
                          color: "var(--text-primary, #0F172A)",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          marginBottom: 24,
                        }}
                      >
                        ✨ Ask AI Tutor about this lesson
                      </button>
                    )}

                    {completed ? (
                      <div style={s.completedCard}>
                        <div>
                          <div style={s.completedCardTitle}>Lesson completed</div>
                          <div style={s.completedCardSub}>You have already earned XP for this lesson.</div>
                        </div>
                        {lesson.quiz ? (
                          <button onClick={() => setShowQuiz(true)} style={s.quizBtn} type="button">
                            Retake quiz
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <div style={s.completionBox}>
                        <button
                          onClick={handleMarkComplete}
                          disabled={markingDone}
                          style={{ ...s.completeBtn, opacity: markingDone ? 0.65 : 1 }}
                          type="button"
                        >
                          {markingDone ? "Saving..." : "Mark as complete (+50 XP)"}
                        </button>
                        {lesson.quiz ? (
                          <button onClick={() => setShowQuiz(true)} style={s.quizBtnSecondary} type="button">
                            Take quiz
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div style={s.lessonNav}>
                    {prevLesson ? (
                      <Link href={`/learn/${prevLesson.id}`} style={s.navPrev}>
                        {prevLesson.title}
                      </Link>
                    ) : (
                      <div />
                    )}
                    {nextLesson ? (
                      <Link href={`/learn/${nextLesson.id}`} style={{ ...s.navNext, opacity: completed ? 1 : 0.4, pointerEvents: completed ? "auto" : "none" }}>
                        {nextLesson.title}
                      </Link>
                    ) : null}
                  </div>

                  <LessonComments lessonId={lesson.id} lessonTitle={lesson.title} />
                </>
              ) : null}

              {activeTab === "watch" ? (
                <LessonVideoTab lessonId={lesson.id} trackSlug={trackSlug} trackColor={trackColor} />
              ) : null}

              {activeTab === "practice" ? (
                <div style={s.practicePanel}>
                  <div style={s.panelTitle}>{practiceInfo?.label}</div>
                  <p style={s.panelSub}>Apply the concept with fake money or guided calculators. No real money is involved.</p>
                  {practiceInfo?.type === "forex" ? <ForexPaperTrader embedded defaultSymbol="EURUSD" /> : null}
                  {practiceInfo?.type === "crypto" ? <CryptoPaperTrader embedded /> : null}
                  {practiceInfo?.type === "simulator" && practiceInfo.href ? (
                    <Link href={practiceInfo.href} style={s.openSimulatorBtn}>
                      Open {practiceInfo.label}
                    </Link>
                  ) : null}
                </div>
              ) : null}

              {activeTab === "notes" ? (
                <LessonNotesTab
                  lessonId={lesson.id}
                  lessonTitle={lesson.title}
                  trackSlug={trackSlug}
                  trackIcon={lesson.level?.track?.icon || "📖"}
                />
              ) : null}

              {activeTab === "community" ? (
                <div style={{ marginTop: 24 }}>
                  <LessonQA lessonId={lesson.id} lessonTitle={lesson.title} />
                </div>
              ) : null}

              {activeTab === "download" ? (
                <div style={s.downloadPanel}>
                  <div style={s.panelTitle}>Download lesson notes</div>
                  <p style={s.panelSub}>Get a clean offline study file with the lesson content, checklist, and disclaimer.</p>
                  <div style={s.downloadCard}>
                    <div style={s.downloadIcon}>TXT</div>
                    <div>
                      <div style={s.downloadName}>{lesson.title}</div>
                      <div style={s.downloadMeta}>
                        {lesson.level?.track?.title} - {lesson.level?.title} - {lesson.duration_minutes} min read
                      </div>
                      <div style={s.downloadFeatureList}>
                        <span style={s.downloadFeature}>Full lesson</span>
                        <span style={s.downloadFeature}>Revision checklist</span>
                        <span style={s.downloadFeature}>Key takeaways</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={downloadNotes} disabled={downloadingNotes} style={{ ...s.largeDownloadBtn, opacity: downloadingNotes ? 0.65 : 1 }} type="button">
                    {downloadingNotes ? "Preparing..." : "Download notes (.txt)"}
                  </button>
                  <div style={s.disclaimer}>For personal study only. Content is educational and not financial advice.</div>
                </div>
              ) : null}
            </>
          )}
        </main>
      </div>

      {showQuiz && lesson.quiz && profile ? (
        <QuizModal
          quizId={lesson.quiz.id}
          quizTitle={lesson.quiz.title}
          passingScore={lesson.quiz.passing_score}
          userId={profile.id}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          onClose={() => setShowQuiz(false)}
          onPass={(score) => {
            setCelebration({ xp: score, reason: "Quiz passed!" });
            setShowQuiz(false);
          }}
        />
      ) : null}

      {celebration ? (
        <XpCelebration
          badge={celebration.badge}
          onClose={() => setCelebration(null)}
          reason={celebration.reason}
          xp={celebration.xp}
        />
      ) : null}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "var(--bg-base, #F8FAFC)",
    color: "var(--text-primary, #0F172A)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    backgroundColor: "var(--bg-surface, #FFFFFF)",
    borderBottom: "1px solid var(--border-subtle, #E2E8F0)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  backBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid var(--border-subtle, #E2E8F0)",
    color: "var(--text-secondary, #64748B)",
    fontSize: 13,
    textDecoration: "none",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
  },
  breadTrack: {
    color: "var(--text-secondary, #64748B)",
  },
  breadSep: {
    color: "var(--border-strong, #CBD5E1)",
  },
  breadLevel: {
    color: "var(--text-primary, #0F172A)",
    fontWeight: 600,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  completedPill: {
    padding: "4px 10px",
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
    color: "#166534",
    fontSize: 12,
    fontWeight: 600,
  },
  xpPill: {
    padding: "4px 10px",
    borderRadius: 999,
    backgroundColor: "var(--bg-elevated, #F1F5F9)",
    color: "var(--text-primary, #0F172A)",
    fontSize: 12,
    fontWeight: 600,
  },
  layout: {
    display: "flex",
    flex: 1,
  },
  sidebar: {
    width: 280,
    backgroundColor: "var(--bg-surface, #FFFFFF)",
    borderRight: "1px solid var(--border-subtle, #E2E8F0)",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-muted, #94A3B8)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  lessonList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid transparent",
    fontSize: 13,
    textDecoration: "none",
    transition: "all 0.15s ease",
  },
  itemNumber: {
    fontSize: 12,
    opacity: 0.7,
  },
  itemTitle: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  proTag: {
    fontSize: 10,
    fontWeight: 700,
    color: "#D97706",
    backgroundColor: "#FEF3C7",
    padding: "2px 6px",
    borderRadius: 4,
  },
  main: {
    flex: 1,
    padding: "32px 40px",
    maxWidth: 920,
    margin: "0 auto",
    width: "100%",
  },
  hero: {
    marginBottom: 28,
  },
  lessonMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  trackPill: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 6,
  },
  durationPill: {
    fontSize: 12,
    color: "var(--text-muted, #94A3B8)",
  },
  quizPill: {
    fontSize: 11,
    fontWeight: 600,
    color: "#2563EB",
    backgroundColor: "#DBEAFE",
    padding: "2px 8px",
    borderRadius: 999,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    lineHeight: 1.25,
    marginBottom: 16,
  },
  tabBar: {
    display: "flex",
    gap: 8,
    borderBottom: "1px solid var(--border-subtle, #E2E8F0)",
    paddingBottom: 8,
  },
  tabButton: {
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid transparent",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  content: {
    backgroundColor: "var(--bg-surface, #FFFFFF)",
    border: "1px solid var(--border-subtle, #E2E8F0)",
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
  },
  prose: {
    fontSize: 15,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    marginBottom: 32,
  },
  completedCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    border: "1px solid #BBF7D0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  completedCardTitle: {
    fontWeight: 700,
    color: "#15803D",
    fontSize: 14,
  },
  completedCardSub: {
    color: "#166534",
    fontSize: 12,
  },
  completionBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingTop: 16,
    borderTop: "1px solid var(--border-subtle, #E2E8F0)",
  },
  completeBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    backgroundColor: "var(--accent-primary, #0E6163)",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  },
  quizBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
  },
  quizBtnSecondary: {
    padding: "10px 16px",
    borderRadius: 10,
    backgroundColor: "transparent",
    border: "1px solid var(--border-strong, #CBD5E1)",
    color: "var(--text-primary, #0F172A)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  lessonNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
  },
  navPrev: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid var(--border-subtle, #E2E8F0)",
    color: "var(--text-secondary, #64748B)",
    fontSize: 13,
    textDecoration: "none",
    maxWidth: 300,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  navNext: {
    padding: "10px 16px",
    borderRadius: 10,
    backgroundColor: "var(--accent-primary, #0E6163)",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    maxWidth: 300,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  practicePanel: {
    backgroundColor: "var(--bg-surface, #FFFFFF)",
    border: "1px solid var(--border-subtle, #E2E8F0)",
    borderRadius: 16,
    padding: 24,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 6,
  },
  panelSub: {
    fontSize: 13,
    color: "var(--text-secondary, #64748B)",
    marginBottom: 20,
  },
  openSimulatorBtn: {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: 10,
    backgroundColor: "var(--accent-primary, #0E6163)",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
  },
  downloadPanel: {
    backgroundColor: "var(--bg-surface, #FFFFFF)",
    border: "1px solid var(--border-subtle, #E2E8F0)",
    borderRadius: 16,
    padding: 24,
  },
  downloadCard: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "var(--bg-elevated, #F8FAFC)",
    border: "1px solid var(--border-subtle, #E2E8F0)",
    marginBottom: 16,
  },
  downloadIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    color: "#4F46E5",
    fontWeight: 800,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  downloadName: {
    fontWeight: 700,
    fontSize: 14,
  },
  downloadMeta: {
    fontSize: 12,
    color: "var(--text-muted, #94A3B8)",
    marginTop: 2,
    marginBottom: 6,
  },
  downloadFeatureList: {
    display: "flex",
    gap: 8,
  },
  downloadFeature: {
    fontSize: 11,
    padding: "2px 6px",
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
    color: "#475569",
  },
  largeDownloadBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    backgroundColor: "#4F46E5",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    marginBottom: 12,
  },
  disclaimer: {
    fontSize: 11,
    color: "var(--text-muted, #94A3B8)",
  },
};

function LessonSkeleton() {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>
      Loading lesson...
    </div>
  );
}
