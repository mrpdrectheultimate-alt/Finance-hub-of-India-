"use client";

import AiDoubtBox from "@/components/lesson/AiDoubtBox";
import PremiumGate from "@/components/lesson/PremiumGate";
import XpCelebration from "@/components/learn/XpCelebration";
import QuizModal from "@/components/quiz/QuizModal";
import { supabase } from "@/lib/supabase";
import type { Lesson, Level, Profile, Track } from "@/types/database";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TRACK_THEMES, useTheme } from "@/components/ui/ThemeProvider";

const ForexPaperTrader = dynamic(() => import("@/components/trading/ForexPaperTrader"), { ssr: false });
const CryptoPaperTrader = dynamic(() => import("@/components/trading/CryptoPaperTrader"), { ssr: false });
const LessonComments = dynamic(() => import("@/components/community/LessonComments"), { ssr: false });

type FullLesson = Lesson & {
  level: Level & { track: Track };
  quiz: { id: string; title: string; passing_score: number } | null;
  siblingLessons: { id: string; title: string; order_index: number; is_free: boolean }[];
};

type Playlist = {
  id: string;
  title: string;
  channel_name: string;
  embed_id: string;
  curator_note: string | null;
  video_count: number | null;
  duration_hrs: number | null;
};

type LessonTab = "learn" | "watch" | "practice" | "download";

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
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [markingDone, setMarkingDone] = useState(false);
  const [downloadingNotes, setDownloadingNotes] = useState(false);
  const [celebration, setCelebration] = useState<{ xp: number; reason: string; badge?: string | null } | null>(null);

  useEffect(() => {
    void loadLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => {
    const trackSlug = lesson?.level?.track?.slug;
    if (!trackSlug) return;

    const trackTheme = TRACK_THEMES[trackSlug];
    if (!trackTheme) return;

    setTheme(trackTheme);
    return () => resetToAuto();
  }, [lesson?.level?.track?.slug, resetToAuto, setTheme]);

  const loadLesson = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const [{ data: prof }, { data: les }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("lessons").select("*").eq("id", lessonId).single(),
    ]);

    if (!les) {
      router.push("/dashboard");
      return;
    }

    const [{ data: level }, { data: quiz }, { data: siblings }, { data: progress }] = await Promise.all([
      supabase.from("levels").select("*").eq("id", les.level_id).single(),
      supabase.from("quizzes").select("id, title, passing_score").eq("lesson_id", les.id).single(),
      supabase
        .from("lessons")
        .select("id, title, order_index, is_free")
        .eq("level_id", les.level_id)
        .eq("is_published", true)
        .order("order_index"),
      supabase.from("user_progress").select("id").eq("user_id", user.id).eq("lesson_id", les.id).single(),
    ]);

    const { data: track } = level ? await supabase.from("tracks").select("*").eq("id", level.track_id).single() : { data: null };

    if (track) {
      const { data: playlistRows } = await supabase
        .from("curated_playlists" as never)
        .select("id, title, channel_name, embed_id, curator_note, video_count, duration_hrs")
        .or(`lesson_id.eq.${les.id},track_id.eq.${track.id}`)
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .limit(4);
      setPlaylists((playlistRows as unknown as Playlist[] | null) || []);
    } else {
      setPlaylists([]);
    }

    setProfile(prof);
    setCompleted(Boolean(progress));
    setLesson({
      ...(les as Lesson),
      level: { ...(level as Level), track: track as Track },
      quiz: quiz || null,
      siblingLessons: siblings || [],
    });
    setLoading(false);
  };

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

    const result = await response.json() as {
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
  const practiceInfo = TRACK_PRACTICE[trackSlug];
  const visibleTabs: { id: LessonTab; label: string }[] = [
    { id: "learn", label: "Learn" },
    ...(playlists.length > 0 ? [{ id: "watch" as LessonTab, label: `Watch (${playlists.length})` }] : []),
    ...(practiceInfo ? [{ id: "practice" as LessonTab, label: "Practice" }] : []),
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
              const isActive = sibling.id === lessonId;
              const isLocked = !sibling.is_free && profile?.role === "free";

              return (
                <Link key={sibling.id} href={`/learn/${sibling.id}`} style={{ ...s.lessonListItem, ...(isActive ? s.lessonListActive : {}) }}>
                  <div style={{ ...s.lessonNum, ...(isActive ? s.lessonNumActive : {}) }}>{isLocked ? "Pro" : index + 1}</div>
                  <span style={s.lessonListTitle}>{sibling.title}</span>
                  {isActive ? <div style={s.activeDot} /> : null}
                </Link>
              );
            })}
          </div>
        </aside>

        <main style={s.main}>
          {isPremiumLocked ? (
            <PremiumGate lessonTitle={lesson.title} />
          ) : (
            <>
              <div style={s.lessonHeader}>
                <div style={s.lessonMeta}>
                  <span style={s.metaItem}>{lesson.duration_minutes} min read</span>
                  {lesson.is_free ? <span style={s.freeTag}>Free</span> : <span style={s.proTag}>Pro</span>}
                  {lesson.quiz ? <span style={s.quizTag}>Quiz included</span> : null}
                </div>
                <h1 style={s.lessonTitle}>{lesson.title}</h1>
              </div>

              <div style={s.tabs}>
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "learn" ? (
                <>
                  {lesson.video_url ? (
                    <div style={s.videoWrap}>
                      <iframe src={lesson.video_url.replace("watch?v=", "embed/")} style={s.video} allowFullScreen title={lesson.title} />
                    </div>
                  ) : null}

                  <div style={s.lessonBody}>
                    {lesson.content_mdx ? <LessonContent content={lesson.content_mdx} /> : <PlaceholderContent title={lesson.title} />}
                  </div>

                  <div style={s.takeawaysBox}>
                    <div style={s.takeawaysTitle}>Key takeaways</div>
                    <ul style={s.takeawaysList}>
                      <li>Re-read this lesson if any concept feels unclear before moving on.</li>
                      <li>Complete the quiz below to lock in your understanding and earn XP.</li>
                      <li>Use the AI tutor if you have doubts. It knows this lesson.</li>
                    </ul>
                  </div>

                  {lesson.level?.track?.slug === "trading-markets" || lesson.level?.track?.slug === "forex" ? (
                    <div style={s.embeddedPractice}>
                      <div style={s.embeddedPracticeTitle}>FX practice: apply what you just learned</div>
                      <ForexPaperTrader embedded defaultSymbol="EURUSD" />
                    </div>
                  ) : null}

                  <div style={s.actions}>
                    {!completed ? (
                      <button onClick={handleMarkComplete} disabled={markingDone} style={{ ...s.completeBtn, opacity: markingDone ? 0.7 : 1 }} type="button">
                        {markingDone ? "Saving..." : "Mark as complete: earn 25 XP"}
                      </button>
                    ) : (
                      <div style={s.completedBanner}>
                        Lesson complete: 25 XP earned
                        {lesson.quiz ? (
                          <button onClick={() => setShowQuiz(true)} style={s.quizBtn} type="button">
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
                <div style={s.watchPanel}>
                  <div style={s.panelTitle}>Curated videos for this lesson</div>
                  <p style={s.panelSub}>Hand-picked playlists to help you connect the lesson to real explanations and examples.</p>
                  {playlists.map((playlist) => (
                    <div key={playlist.id} style={s.playlistCard}>
                      <div style={s.playlistHeader}>
                        <div>
                          <div style={s.playlistTitle}>{playlist.title}</div>
                          <div style={s.playlistMeta}>
                            {playlist.channel_name} - {playlist.video_count || 1} videos - {playlist.duration_hrs || 1}h
                          </div>
                        </div>
                        <a
                          href={`https://youtube.com/playlist?list=${playlist.embed_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={s.youtubeLink}
                        >
                          Open on YouTube
                        </a>
                      </div>
                      {playlist.curator_note ? <div style={s.curatorNote}>{playlist.curator_note}</div> : null}
                      <div style={s.embedWrap}>
                        <iframe
                          src={`https://www.youtube.com/embed/videoseries?list=${playlist.embed_id}&rel=0&modestbranding=1`}
                          style={s.embed}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                          title={playlist.title}
                        />
                      </div>
                    </div>
                  ))}
                  <div style={s.disclaimer}>Videos are embedded from YouTube. Rights belong to the original creators.</div>
                </div>
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

        <div style={{ ...s.aiPanel, transform: showAI ? "translateX(0)" : "translateX(100%)" }}>
          <AiDoubtBox lessonTitle={lesson.title} lessonContent={lesson.content_mdx || ""} userRole={profile?.role || "free"} onClose={() => setShowAI(false)} />
        </div>
      </div>

      <button onClick={() => setShowAI(!showAI)} style={s.aiFloatBtn} type="button">
        {showAI ? "Close AI" : "Ask AI"}
      </button>

      {showQuiz && lesson.quiz ? (
        <QuizModal
          quizId={lesson.quiz.id}
          quizTitle={lesson.quiz.title}
          passingScore={lesson.quiz.passing_score}
          userId={profile?.id || ""}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          onClose={() => setShowQuiz(false)}
          onPass={() => setShowQuiz(false)}
        />
      ) : null}

      {celebration ? (
        <XpCelebration
          xp={celebration.xp}
          reason={celebration.reason}
          badge={celebration.badge}
          onClose={() => setCelebration(null)}
        />
      ) : null}
    </div>
  );
}

function LessonContent({ content }: { content: string }) {
  return (
    <div style={{ lineHeight: 1.8, fontSize: 16, color: "#333" }}>
      {content.split("\n").map((line, index) => {
        if (line.startsWith("# ")) return <h1 key={index} style={s.mdH1}>{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={index} style={s.mdH2}>{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={index} style={s.mdH3}>{line.slice(4)}</h3>;
        if (line.startsWith("- ")) return <li key={index} style={s.mdLi}>{line.slice(2)}</li>;
        if (line.startsWith("> ")) return <blockquote key={index} style={s.mdQuote}>{line.slice(2)}</blockquote>;
        if (line.startsWith("```")) return <div key={index} />;
        if (line.trim() === "") return <br key={index} />;
        return <p key={index} style={{ margin: "0 0 14px" }}>{line}</p>;
      })}
    </div>
  );
}

function PlaceholderContent({ title }: { title: string }) {
  return (
    <div style={{ lineHeight: 1.8, color: "#333" }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 16px" }}>Introduction</h2>
      <p style={{ marginBottom: 14, fontSize: 16 }}>
        Welcome to <strong>{title}</strong>. This lesson will walk you through the core concepts in a clear, step-by-step way.
      </p>
      <div style={s.infoBox}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#0F6E56", marginBottom: 6 }}>Why this matters</div>
        <p style={{ fontSize: 14, color: "#085041", margin: 0 }}>
          Finance knowledge is not just for professionals. It affects every decision you make about money.
        </p>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 600, margin: "24px 0 12px" }}>Core concept</h2>
      <p style={{ marginBottom: 14, fontSize: 16 }}>
        Content for this lesson is being uploaded by our content team. Check back shortly, or use the AI tutor to ask about this topic now.
      </p>
      <blockquote style={s.mdQuote}>
        "The stock market is a device for transferring money from the impatient to the patient." - Warren Buffett
      </blockquote>
    </div>
  );
}

function LessonSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui" }}>
      <div style={{ height: 56, background: "#fff", borderBottom: "0.5px solid #eee" }} />
      <div style={{ display: "flex" }}>
        <div style={{ width: 240, minHeight: "calc(100vh - 56px)", background: "#fff", borderRight: "0.5px solid #eee" }} />
        <div style={{ flex: 1, padding: "40px 48px" }}>
          {[260, 180, 400, 320, 400].map((width, index) => (
            <div key={index} style={{ height: index === 0 ? 36 : 16, width, background: "#eee", borderRadius: 4, marginBottom: index === 0 ? 24 : 12 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui, -apple-system, sans-serif" },
  header: { height: 52, background: "#fff", borderBottom: "0.5px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 50 },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  backBtn: { fontSize: 13, color: "#666", textDecoration: "none" },
  breadcrumb: { display: "flex", alignItems: "center", gap: 6, fontSize: 13 },
  breadTrack: { color: "#1D9E75", fontWeight: 500 },
  breadSep: { color: "#ccc" },
  breadLevel: { color: "#666" },
  headerRight: { display: "flex", alignItems: "center", gap: 10 },
  completedPill: { background: "#E1F5EE", color: "#0F6E56", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 },
  xpPill: { background: "#FFF8E6", border: "0.5px solid #FAC775", color: "#854F0B", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 },
  layout: { display: "flex", minHeight: "calc(100vh - 52px)", position: "relative" },
  sidebar: { width: 240, background: "#fff", borderRight: "0.5px solid #e5e5e5", padding: "20px 0", flexShrink: 0, position: "sticky", top: 52, height: "calc(100vh - 52px)", overflowY: "auto" },
  sidebarTitle: { fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".06em", padding: "0 16px 12px" },
  lessonList: { display: "flex", flexDirection: "column" },
  lessonListItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", textDecoration: "none", color: "#444", fontSize: 13, transition: "background .15s" },
  lessonListActive: { background: "#F0FAF6", color: "#0F6E56" },
  lessonNum: { width: 28, height: 22, borderRadius: 20, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0, color: "#888" },
  lessonNumActive: { background: "#1D9E75", color: "#fff" },
  lessonListTitle: { flex: 1, lineHeight: 1.3 },
  activeDot: { width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", flexShrink: 0 },
  main: { flex: 1, padding: "36px 48px 80px", maxWidth: 720 },
  lessonHeader: { marginBottom: 28 },
  lessonMeta: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  metaItem: { fontSize: 12, color: "#888" },
  freeTag: { background: "#E1F5EE", color: "#0F6E56", fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20 },
  proTag: { background: "#EEEDFE", color: "#534AB7", fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20 },
  quizTag: { background: "#FFF8E6", color: "#854F0B", fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20 },
  downloadBtn: { padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 20, background: "#fff", color: "#555", cursor: "pointer", fontFamily: "system-ui" },
  lessonTitle: { fontSize: 30, fontWeight: 700, letterSpacing: 0, color: "#0a0a0a", margin: 0, lineHeight: 1.2 },
  tabs: { display: "flex", gap: 6, borderBottom: "0.5px solid #eee", margin: "0 0 26px", overflowX: "auto" },
  tab: { padding: "10px 14px", border: "none", borderBottom: "2px solid transparent", background: "transparent", color: "#777", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "system-ui", whiteSpace: "nowrap" },
  tabActive: { color: "#1D9E75", borderBottomColor: "#1D9E75" },
  videoWrap: { borderRadius: 12, overflow: "hidden", marginBottom: 32, aspectRatio: "16/9", background: "#000" },
  video: { width: "100%", height: "100%", border: "none" },
  lessonBody: { marginBottom: 32 },
  takeawaysBox: { background: "#FAFAF8", border: "0.5px solid #E5E5E0", borderRadius: 10, padding: "16px 20px", marginBottom: 28 },
  takeawaysTitle: { fontWeight: 600, fontSize: 14, marginBottom: 8, color: "#333" },
  takeawaysList: { margin: 0, paddingLeft: 20, fontSize: 14, color: "#555", lineHeight: 1.8 },
  embeddedPractice: { margin: "32px 0", borderTop: "0.5px solid #eee", paddingTop: 24 },
  embeddedPracticeTitle: { fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 12 },
  actions: { marginBottom: 32 },
  completeBtn: { width: "100%", padding: "14px", fontSize: 15, fontWeight: 600, border: "none", borderRadius: 10, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  completedBanner: { background: "#E1F5EE", border: "0.5px solid #9FE1CB", borderRadius: 10, padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "#0F6E56", display: "flex", alignItems: "center", justifyContent: "space-between" },
  quizBtn: { padding: "8px 16px", fontSize: 13, border: "none", borderRadius: 8, background: "#1D9E75", color: "#fff", cursor: "pointer", fontWeight: 600, fontFamily: "system-ui" },
  lessonNav: { display: "flex", justifyContent: "space-between", borderTop: "0.5px solid #eee", paddingTop: 20 },
  navPrev: { fontSize: 13, color: "#555", textDecoration: "none", maxWidth: "45%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  navNext: { fontSize: 13, color: "#1D9E75", textDecoration: "none", fontWeight: 500, textAlign: "right", maxWidth: "45%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  watchPanel: { paddingBottom: 28 },
  practicePanel: { paddingBottom: 28 },
  downloadPanel: { paddingBottom: 28 },
  panelTitle: { fontSize: 18, fontWeight: 700, color: "#0a0a0a", marginBottom: 6, letterSpacing: 0 },
  panelSub: { fontSize: 13, color: "#777", lineHeight: 1.6, margin: "0 0 18px" },
  playlistCard: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: 16, marginBottom: 16 },
  playlistHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 10 },
  playlistTitle: { fontSize: 15, fontWeight: 700, color: "#0a0a0a", marginBottom: 4 },
  playlistMeta: { fontSize: 12, color: "#888" },
  youtubeLink: { fontSize: 12, color: "#185FA5", textDecoration: "none", fontWeight: 700, flexShrink: 0 },
  curatorNote: { fontSize: 13, lineHeight: 1.6, color: "#0F6E56", background: "#F0FAF6", borderRadius: 8, padding: "9px 11px", marginBottom: 12 },
  embedWrap: { borderRadius: 10, overflow: "hidden", background: "#000" },
  embed: { width: "100%", aspectRatio: "16/9", border: "none", display: "block" },
  disclaimer: { fontSize: 11, lineHeight: 1.6, color: "#999", marginTop: 12 },
  openSimulatorBtn: { display: "inline-block", padding: "12px 22px", borderRadius: 10, background: "#1D9E75", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700 },
  downloadCard: { display: "flex", gap: 16, alignItems: "center", background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: 18, marginBottom: 16 },
  downloadIcon: { width: 48, height: 48, borderRadius: 12, background: "#E1F5EE", color: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 },
  downloadName: { fontSize: 15, fontWeight: 700, color: "#0a0a0a", marginBottom: 4 },
  downloadMeta: { fontSize: 12, color: "#888", marginBottom: 10 },
  downloadFeatureList: { display: "flex", flexWrap: "wrap", gap: 6 },
  downloadFeature: { fontSize: 11, color: "#0F6E56", background: "#E1F5EE", padding: "3px 8px", borderRadius: 12 },
  largeDownloadBtn: { width: "100%", padding: 13, border: "none", borderRadius: 10, background: "#1D9E75", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "system-ui" },
  aiPanel: { width: 360, background: "#fff", borderLeft: "0.5px solid #e5e5e5", position: "fixed", right: 0, top: 52, height: "calc(100vh - 52px)", transition: "transform .3s ease", zIndex: 40 },
  aiFloatBtn: { position: "fixed", bottom: 24, right: 24, padding: "12px 20px", background: "#0a0a0a", color: "#fff", border: "none", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 60 },
  mdH1: { fontSize: 26, fontWeight: 700, margin: "28px 0 12px", color: "#0a0a0a", letterSpacing: 0 },
  mdH2: { fontSize: 20, fontWeight: 600, margin: "24px 0 10px", color: "#0a0a0a" },
  mdH3: { fontSize: 17, fontWeight: 600, margin: "20px 0 8px", color: "#1a1a1a" },
  mdLi: { marginBottom: 6, paddingLeft: 4 },
  mdQuote: { borderLeft: "3px solid #1D9E75", paddingLeft: 16, margin: "16px 0", color: "#555", fontStyle: "italic" },
  infoBox: { background: "#E1F5EE", border: "0.5px solid #9FE1CB", borderRadius: 10, padding: "16px 20px", marginBottom: 20 },
};
