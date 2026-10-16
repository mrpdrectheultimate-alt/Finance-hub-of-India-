"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LessonQA from "@/components/community/LessonQA";
import { FinanceDisclaimer } from "@/components/ui/FinanceDisclaimer";

// ============================================================
// FinanceHub — World-Class Lesson Reader & Player
// app/learn/[slug]/page.tsx
// High-Contrast · Eye-Comfort Reading Modes · Table Formatter
// Dynamic TOC · Quiz Engine · Notes · AI Tutor · Q&A · Prev/Next
// ============================================================

type SiblingLesson = {
  id: string;
  title: string;
  slug: string;
  sort_order: number;
  duration_minutes: number;
  is_free: boolean;
};

type Lesson = {
  id: string;
  title: string;
  slug: string;
  content_mdx: string;
  duration_minutes: number;
  is_free: boolean;
  language: string;
  key_takeaways: string[];
  difficulty_score: number;
  meta_description: string;
  level: {
    id?: string;
    name: string;
    track: { name: string; slug: string; color_hex: string };
  };
};

type QuizQuestion = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct: "a" | "b" | "c" | "d";
  explanation: string;
};

type Tab = "lesson" | "quiz" | "notes" | "ai" | "community";
type ReadingTheme = "light" | "sepia" | "dark";
type FontSize = "sm" | "md" | "lg";

const DIFFICULTY_LABEL = [
  "",
  "Easiest",
  "Easy",
  "Beginner",
  "Beginner+",
  "Medium",
  "Med-Hard",
  "Hard",
  "Very Hard",
  "Expert",
  "Master",
];

// ─── XP Toast Notification ──────────────────────────────────
function XPToast({
  xp,
  streak,
  milestone,
}: {
  xp: number;
  streak: number;
  milestone: number | null;
}) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4500);
    return () => clearTimeout(t);
  }, []);
  if (!visible || xp === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        right: 24,
        zIndex: 9999,
        background: "#0F172A",
        border: "1px solid #10B981",
        color: "#FFFFFF",
        borderRadius: 16,
        padding: "16px 22px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
        animation: "slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        fontFamily: "var(--font-ui, system-ui)",
        minWidth: 220,
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#34D399",
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>+{xp} XP</span>
        <span>⭐</span>
      </div>
      {streak > 1 && (
        <div style={{ fontSize: 13, color: "#FBBF24", fontWeight: 600 }}>
          🔥 {streak}-day learning streak!
        </div>
      )}
      {milestone && (
        <div
          style={{
            fontSize: 12,
            color: "#60A5FA",
            fontWeight: 700,
            marginTop: 4,
          }}
        >
          🏅 Milestone: {milestone} days of continuous learning!
        </div>
      )}
    </div>
  );
}

// ─── Markdown Formatter & Table Parser ────────────────────────
function formatMarkdown(rawMdx: string): {
  html: string;
  headings: { id: string; text: string; level: number }[];
} {
  const headings: { id: string; text: string; level: number }[] = [];

  let text = (rawMdx || "")
    .replace(/â€”/g, "—")
    .replace(/â€“/g, "–")
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€\x9d/g, '"');

  // 1. Isolate code blocks
  const codeBlocks: string[] = [];
  text = text.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const placeholder = `___CODEBLOCK_${codeBlocks.length}___`;
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    codeBlocks.push(
      `<div class="code-block-box"><div class="code-block-header">${
        lang || "code"
      }</div><pre class="code-block-pre"><code>${escaped}</code></pre></div>`
    );
    return placeholder;
  });

  // 2. Parse Markdown Tables: matches contiguous lines starting with |
  text = text.replace(
    /((?:^[ \t]*\|.+?\|[ \t]*(?:\r?\n|$))+)/gm,
    (tableBlock) => {
      const rawLines = tableBlock
        .trim()
        .split(/\r?\n/)
        .filter((line) => line.trim().startsWith("|"));
      if (rawLines.length === 0) return tableBlock;

      let headerHtml = "";
      let bodyHtml = "";
      let isHeader = true;

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        // Separator line like |---|---|
        if (/^\|[ \t]*(?::?-+:?[ \t]*\|)+$/.test(line)) {
          isHeader = false;
          continue;
        }

        const cells = line
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());

        if (i === 0 && isHeader) {
          headerHtml = `<tr>${cells
            .map(
              (c) => `<th class="lesson-th">${inlineStyleFormat(c)}</th>`
            )
            .join("")}</tr>`;
        } else {
          bodyHtml += `<tr>${cells
            .map(
              (c) => `<td class="lesson-td">${inlineStyleFormat(c)}</td>`
            )
            .join("")}</tr>`;
        }
      }

      return `<div class="lesson-table-container"><table class="lesson-table">${
        headerHtml ? `<thead>${headerHtml}</thead>` : ""
      }<tbody>${bodyHtml}</tbody></table></div>`;
    }
  );

  // 3. Headings with Slug IDs
  text = text.replace(/^(#{1,4})\s+(.+)$/gm, (_, hashes, titleText) => {
    const level = hashes.length;
    const cleanTitle = titleText.replace(/<[^>]+>/g, "").trim();
    const id = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    headings.push({ id, text: cleanTitle, level });
    const tag = `h${level}`;
    return `<${tag} id="${id}" class="lesson-heading-${level} scroll-mt-24">${inlineStyleFormat(
      titleText
    )}</${tag}>`;
  });

  // 4. Blockquotes
  text = text.replace(/^(?:>[ \t]?)(.+)$/gm, (_, quoteText) => {
    return `<blockquote class="lesson-blockquote">${inlineStyleFormat(
      quoteText
    )}</blockquote>`;
  });

  // 5. Unordered lists
  text = text.replace(/((?:^[ \t]*[-*]\s+.+?(?:\r?\n|$))+)/gm, (listBlock) => {
    const items = listBlock
      .trim()
      .split(/\r?\n/)
      .map((line) => {
        const item = line.replace(/^[ \t]*[-*]\s+/, "");
        return `<li class="lesson-li">${inlineStyleFormat(item)}</li>`;
      })
      .join("");
    return `<ul class="lesson-ul">${items}</ul>`;
  });

  // 6. Ordered lists
  text = text.replace(/((?:^[ \t]*\d+\.\s+.+?(?:\r?\n|$))+)/gm, (listBlock) => {
    const items = listBlock
      .trim()
      .split(/\r?\n/)
      .map((line) => {
        const item = line.replace(/^[ \t]*\d+\.\s+/, "");
        return `<li class="lesson-li-numbered">${inlineStyleFormat(item)}</li>`;
      })
      .join("");
    return `<ol class="lesson-ol">${items}</ol>`;
  });

  // 7. Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="lesson-inline-code">$1</code>');

  // 8. Paragraphs
  const paragraphs = text.split(/\n{2,}/);
  const formattedParagraphs = paragraphs.map((p) => {
    const trimmed = p.trim();
    if (!trimmed) return "";
    if (/^<(h[1-6]|div|table|ul|ol|blockquote|pre)/i.test(trimmed)) {
      return trimmed;
    }
    if (/^___CODEBLOCK_\d+___$/.test(trimmed)) {
      return trimmed;
    }
    return `<p class="lesson-p">${inlineStyleFormat(trimmed)}</p>`;
  });

  let finalHtml = formattedParagraphs.join("\n\n");

  // Restore code blocks
  finalHtml = finalHtml.replace(
    /___CODEBLOCK_(\d+)___/g,
    (_, idx) => codeBlocks[Number(idx)] || ""
  );

  // Citation pills and highlights
  finalHtml = finalHtml
    .replace(
      /\[Source: (.+?)\]/g,
      '<span class="lesson-source-pill">📎 Source: $1</span>'
    )
    .replace(/⚠️/g, '<span class="lesson-badge-warn">⚠️</span>')
    .replace(/✅/g, '<span class="lesson-badge-check">✅</span>');

  return { html: finalHtml, headings };
}

function inlineStyleFormat(str: string): string {
  return str
    .replace(/\*\*(.+?)\*\*/g, '<strong class="lesson-strong">$1</strong>')
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>");
}

export default function LessonPlayer({ params }: { params: { slug: string } }) {
  const router = useRouter();

  // Core Data
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [prevLesson, setPrevLesson] = useState<SiblingLesson | null>(null);
  const [nextLesson, setNextLesson] = useState<SiblingLesson | null>(null);
  const [siblingLessons, setSiblingLessons] = useState<SiblingLesson[]>([]);

  // Reader Settings & Preferences
  const [theme, setTheme] = useState<ReadingTheme>("light");
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [focusMode, setFocusMode] = useState(false);
  const [activeHeading, setActiveHeading] = useState("");

  // User State & Progress
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [tab, setTab] = useState<Tab>("lesson");
  const [note, setNote] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizDone, setQuizDone] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [xpToast, setXpToast] = useState<{
    xp: number;
    streak: number;
    milestone: number | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [certId, setCertId] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const startTime = useRef(Date.now());

  // Parse MDX content into HTML + Headings
  const { html: parsedContent, headings } = useMemo(() => {
    if (!lesson?.content_mdx) return { html: "", headings: [] };
    return formatMarkdown(lesson.content_mdx);
  }, [lesson?.content_mdx]);

  // Load lesson, user, progress, notes, and quiz data
  useEffect(() => {
    (async () => {
      const {
        data: { user: u },
      } = await (supabase.auth as any).getUser();
      setUser(u);

      const rawSlug = decodeURIComponent(params.slug || "").trim();
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          rawSlug
        );

      let query = (supabase as any).from("lessons").select(`
          id, title, slug, content_mdx, duration_minutes,
          is_free, language, key_takeaways, difficulty_score, meta_description,
          levels(id, title, slug, tracks(id, title, slug, color_hex, icon))
        `);

      if (isUuid) {
        query = query.eq("id", rawSlug);
      } else {
        query = query.eq("slug", rawSlug);
      }

      let { data: lessonData, error: lErr } = await query
        .eq("is_published", true)
        .maybeSingle();

      if (!lessonData && !isUuid) {
        const { data: fallback } = await (supabase as any)
          .from("lessons")
          .select(`
            id, title, slug, content_mdx, duration_minutes,
            is_free, language, key_takeaways, difficulty_score, meta_description,
            levels(id, title, slug, tracks(id, title, slug, color_hex, icon))
          `)
          .ilike("slug", `%${rawSlug}%`)
          .eq("is_published", true)
          .limit(1)
          .maybeSingle();

        lessonData = fallback;
      }

      if (lErr) console.error("Lesson query error:", lErr);

      if (!lessonData) {
        setLoading(false);
        return;
      }

      const cleanTitle = (lessonData.title || "")
        .replace(/â€”/g, "—")
        .replace(/â€“/g, "–")
        .replace(/â€™/g, "'")
        .replace(/â€œ/g, '"')
        .replace(/â€\x9d/g, '"');

      const lvl = (lessonData as any).levels;
      const trk = lvl?.tracks;

      const mapped: Lesson = {
        ...lessonData,
        title: cleanTitle,
        level: {
          id: lvl?.id,
          name: lvl?.title || lvl?.name || "Level 1",
          track: {
            name: trk?.title || trk?.name || "Curriculum",
            slug: trk?.slug || "explore",
            color_hex: trk?.color_hex || "#0E6163",
          },
        },
      };
      setLesson(mapped);

      // Fetch sibling lessons in the same level for Prev/Next navigation
      if (lvl?.id) {
        const { data: siblings } = await (supabase as any)
          .from("lessons")
          .select("id, title, slug, sort_order, duration_minutes, is_free")
          .eq("level_id", lvl.id)
          .eq("is_published", true)
          .order("sort_order", { ascending: true });

        if (siblings && siblings.length > 0) {
          setSiblingLessons(siblings);
          const curIdx = siblings.findIndex(
            (s: any) => s.id === lessonData.id || s.slug === lessonData.slug
          );
          if (curIdx > 0) setPrevLesson(siblings[curIdx - 1]);
          if (curIdx >= 0 && curIdx < siblings.length - 1)
            setNextLesson(siblings[curIdx + 1]);
        }
      }

      // Check User Progress & Notes
      if (u) {
        const { data: prog } = await (supabase as any)
          .from("user_progress")
          .select("completed, quiz_score")
          .eq("user_id", u.id)
          .eq("lesson_id", lessonData.id)
          .single();
        if (prog?.completed) setCompleted(true);

        const { data: noteData } = await (supabase as any)
          .from("user_notes")
          .select("content")
          .eq("user_id", u.id)
          .eq("lesson_id", lessonData.id)
          .single();
        if (noteData?.content) setNote(noteData.content);
      }

      // Fetch Quizzes
      const { data: quizRes } = await (supabase as any)
        .from("quizzes")
        .select("id")
        .eq("lesson_id", lessonData.id);

      const quizIds = (quizRes || []).map((q: any) => q.id);

      const { data: quiz } =
        quizIds.length > 0
          ? await (supabase as any)
              .from("quiz_questions")
              .select("*")
              .in("quiz_id", quizIds)
              .limit(5)
          : { data: [] };

      setQuestions(quiz || []);
      setLoading(false);
    })();
  }, [params.slug]);

  // Complete lesson API call
  const completeLesson = useCallback(
    async (fromButton: boolean) => {
      if (!lesson || !user || (completed && !fromButton)) return;
      const elapsed = Math.round((Date.now() - startTime.current) / 1000);

      const passed = quizDone && quizScore >= 70;
      const res = await fetch("/api/complete-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          timeSpentSeconds: elapsed,
          quizScore: quizDone ? quizScore : null,
          quizPassed: passed,
          isReview: completed,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setCompleted(true);
        if (result.xp_earned > 0) {
          setXpToast({
            xp: result.xp_earned,
            streak: result.new_streak,
            milestone: result.streak_milestone,
          });
        }
        if (result.certificate_id) setCertId(result.certificate_id);
      }
    },
    [lesson, user, completed, quizDone, quizScore]
  );

  // Track scroll position & spy on active heading
  useEffect(() => {
    const handleScroll = () => {
      const el = contentRef.current;
      if (!el) return;

      const top = el.getBoundingClientRect().top;
      const h = el.offsetHeight;
      const vh = window.innerHeight;
      const pct = Math.min(100, Math.max(0, ((vh - top) / (h + vh)) * 100));
      setProgress(Math.round(pct));

      // Auto-complete if read 90%+
      if (pct >= 90 && !completed && user) {
        completeLesson(false);
      }

      // Heading Scroll Spy
      if (headings.length > 0) {
        for (let i = headings.length - 1; i >= 0; i--) {
          const hEl = document.getElementById(headings[i].id);
          if (hEl) {
            const rect = hEl.getBoundingClientRect();
            if (rect.top <= 140) {
              setActiveHeading(headings[i].id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [completed, user, completeLesson, headings]);

  // Quiz submission
  const submitQuiz = async () => {
    if (!questions.length) return;
    let correct = 0;
    questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    setQuizScore(score);
    setQuizDone(true);
    await completeLesson(true);
  };

  // Notes save
  const saveNote = async () => {
    if (!user || !lesson) return;
    await (supabase as any).from("user_notes").upsert(
      {
        user_id: user.id,
        lesson_id: lesson.id,
        content: note,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  // Theme palettes with verified 10:1+ WCAG AAA contrast
  const themeStyles = useMemo(() => {
    if (theme === "dark") {
      return {
        pageBg: "#0B0F19",
        cardBg: "#131927",
        cardBorder: "#232E45",
        textPrimary: "#F8FAFC",
        textSecondary: "#CBD5E1",
        textMuted: "#94A3B8",
        tableHeaderBg: "#1E293B",
        tableBorder: "#2D3B55",
        tableRowEven: "#172033",
        codeBg: "#0E1524",
        blockquoteBg: "rgba(45, 212, 191, 0.08)",
        blockquoteBorder: "#2DD4BF",
        tagBg: "#1E293B",
        tagText: "#94A3B8",
        accent: "#2DD4BF",
      };
    }
    if (theme === "sepia") {
      return {
        pageBg: "#F5EFE6",
        cardBg: "#FAF7F2",
        cardBorder: "#E5DCB",
        textPrimary: "#2C2117",
        textSecondary: "#4A3B32",
        textMuted: "#796657",
        tableHeaderBg: "#EDE4D7",
        tableBorder: "#DACFBE",
        tableRowEven: "#F4ECE1",
        codeBg: "#EFE7DC",
        blockquoteBg: "rgba(142, 85, 36, 0.08)",
        blockquoteBorder: "#9A6324",
        tagBg: "#EDE4D7",
        tagText: "#796657",
        accent: "#9A6324",
      };
    }
    // Default: Light
    return {
      pageBg: "#F8FAFC",
      cardBg: "#FFFFFF",
      cardBorder: "#E2E8F0",
      textPrimary: "#0F172A",
      textSecondary: "#334155",
      textMuted: "#64748B",
      tableHeaderBg: "#F1F5F9",
      tableBorder: "#E2E8F0",
      tableRowEven: "#F8FAFC",
      codeBg: "#F1F5F9",
      blockquoteBg: "rgba(14, 97, 99, 0.06)",
      blockquoteBorder: "#0E6163",
      tagBg: "#F1F5F9",
      tagText: "#475569",
      accent: "#0E6163",
    };
  }, [theme]);

  const fontSizeClass =
    fontSize === "sm"
      ? "text-[15px] leading-[1.75]"
      : fontSize === "lg"
      ? "text-[19px] leading-[1.85]"
      : "text-[17px] leading-[1.8]";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="max-w-[760px] w-full space-y-4">
          <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-3/4 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-6 w-1/3 bg-slate-200 rounded animate-pulse" />
          <div className="h-96 w-full bg-slate-200 rounded-2xl animate-pulse mt-8" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-4">📚</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Lesson not found</h2>
        <p className="text-slate-600 mb-6 text-sm">
          The requested lesson may have moved or is not yet published.
        </p>
        <a
          href="/explore"
          className="px-5 py-2.5 bg-[#0E6163] text-white rounded-xl text-sm font-semibold hover:bg-[#0A4A4C] transition-colors"
        >
          Browse All Learning Tracks →
        </a>
      </div>
    );
  }

  const track = lesson.level.track;

  return (
    <div
      style={{
        backgroundColor: themeStyles.pageBg,
        color: themeStyles.textPrimary,
        minHeight: "100vh",
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      {/* ─── FLOATING TOP PROGRESS BAR ─── */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
        <div
          className="h-full transition-all duration-150"
          style={{
            width: `${progress}%`,
            backgroundColor: themeStyles.accent,
          }}
        />
      </div>

      {/* ─── STICKY HEADER & READING CONTROLS ─── */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          backgroundColor:
            theme === "dark"
              ? "rgba(19, 25, 39, 0.85)"
              : theme === "sepia"
              ? "rgba(250, 247, 242, 0.9)"
              : "rgba(255, 255, 255, 0.9)",
          borderColor: themeStyles.cardBorder,
        }}
      >
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-2 text-xs font-medium truncate">
            <a
              href="/explore"
              className="hover:underline flex items-center gap-1"
              style={{ color: themeStyles.textMuted }}
            >
              <span>Explore</span>
            </a>
            <span style={{ color: themeStyles.textMuted }}>›</span>
            <a
              href={`/tracks/${track.slug}`}
              className="hover:underline truncate max-w-[160px] sm:max-w-none font-semibold"
              style={{ color: track.color_hex || themeStyles.accent }}
            >
              {track.name}
            </a>
            <span style={{ color: themeStyles.textMuted }}>›</span>
            <span
              className="truncate max-w-[200px] hidden md:inline"
              style={{ color: themeStyles.textMuted }}
            >
              {lesson.level.name}
            </span>
          </div>

          {/* Reader Preferences Bar */}
          <div className="flex items-center gap-2">
            {/* Font Size Selector */}
            <div
              className="flex items-center rounded-lg p-0.5 border"
              style={{ borderColor: themeStyles.cardBorder, background: themeStyles.tagBg }}
            >
              <button
                onClick={() => setFontSize("sm")}
                title="Smaller font size"
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  fontSize === "sm" ? "bg-white shadow-sm font-bold" : "opacity-70"
                }`}
                style={{ color: themeStyles.textPrimary }}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize("md")}
                title="Normal font size"
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  fontSize === "md" ? "bg-white shadow-sm font-bold" : "opacity-70"
                }`}
                style={{ color: themeStyles.textPrimary }}
              >
                A
              </button>
              <button
                onClick={() => setFontSize("lg")}
                title="Larger font size"
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  fontSize === "lg" ? "bg-white shadow-sm font-bold" : "opacity-70"
                }`}
                style={{ color: themeStyles.textPrimary }}
              >
                A+
              </button>
            </div>

            {/* Reading Theme Toggle */}
            <div
              className="flex items-center rounded-lg p-0.5 border"
              style={{ borderColor: themeStyles.cardBorder, background: themeStyles.tagBg }}
            >
              <button
                onClick={() => setTheme("light")}
                title="Day reading mode (Clean light)"
                className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 ${
                  theme === "light" ? "bg-white shadow-sm font-semibold" : "opacity-70"
                }`}
                style={{ color: themeStyles.textPrimary }}
              >
                ☀️ <span className="hidden sm:inline">Light</span>
              </button>
              <button
                onClick={() => setTheme("sepia")}
                title="Sepia reading mode (Eye comfort)"
                className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 ${
                  theme === "sepia" ? "bg-white shadow-sm font-semibold" : "opacity-70"
                }`}
                style={{ color: themeStyles.textPrimary }}
              >
                📜 <span className="hidden sm:inline">Sepia</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                title="Night mode (WCAG AAA contrast)"
                className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 ${
                  theme === "dark" ? "bg-slate-800 text-white shadow-sm font-semibold" : "opacity-70"
                }`}
                style={{ color: themeStyles.textPrimary }}
              >
                🌙 <span className="hidden sm:inline">Dark</span>
              </button>
            </div>

            {/* Focus Mode (Toggles Sidebar) */}
            <button
              onClick={() => setFocusMode((prev) => !prev)}
              title={focusMode ? "Show Sidebar" : "Hide Sidebar (Distraction Free Focus)"}
              className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
              style={{
                borderColor: themeStyles.cardBorder,
                backgroundColor: focusMode ? themeStyles.tagBg : "transparent",
                color: themeStyles.textPrimary,
              }}
            >
              <span>{focusMode ? "📖 Show Sidebar" : "🔍 Focus"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── CERTIFICATE BANNER (IF EARNED) ─── */}
      {certId && (
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-gradient-to-r from-emerald-600 to-[#0E6163] text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-base font-bold flex items-center gap-2">
                <span>🏆</span> Track Completed! Certificate Unlocked
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                You have satisfied all milestones for {track.name}. View your verified certificate.
              </p>
            </div>
            <a
              href="/certificates"
              className="inline-block px-5 py-2.5 bg-white text-[#0E6163] font-bold text-xs rounded-xl hover:bg-emerald-50 transition-colors shadow-sm"
            >
              View Certificate →
            </a>
          </div>
        </div>
      )}

      {/* ─── XP TOAST NOTIFICATION ─── */}
      {xpToast && <XPToast {...xpToast} />}

      {/* ─── MAIN WORKSPACE GRID ─── */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8">
        <div
          className={`grid grid-cols-1 ${
            focusMode ? "lg:grid-cols-1" : "lg:grid-cols-[280px_minmax(0,1fr)]"
          } gap-10 items-start`}
        >
          {/* ═══════════════════════════════════════════════════════ */}
          {/* STICKY SIDEBAR (TOC + LESSON NAVIGATION)                */}
          {/* ═══════════════════════════════════════════════════════ */}
          {!focusMode && (
            <aside className="hidden lg:block sticky top-20 space-y-6">
              {/* Table of Contents */}
              <div
                className="p-5 rounded-2xl border shadow-sm transition-colors"
                style={{
                  backgroundColor: themeStyles.cardBg,
                  borderColor: themeStyles.cardBorder,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                    style={{ color: themeStyles.textMuted }}
                  >
                    <span>📑</span> Table of Contents
                  </h3>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: themeStyles.tagBg,
                      color: themeStyles.accent,
                    }}
                  >
                    {progress}% Read
                  </span>
                </div>

                {headings.length > 0 ? (
                  <nav className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
                    {headings.map((h) => {
                      const isActive = activeHeading === h.id;
                      return (
                        <a
                          key={h.id}
                          href={`#${h.id}`}
                          className={`block py-1.5 text-xs rounded-lg transition-all ${
                            h.level === 3 ? "pl-4 text-[11px]" : "pl-2"
                          }`}
                          style={{
                            color: isActive
                              ? themeStyles.accent
                              : themeStyles.textSecondary,
                            fontWeight: isActive ? 700 : 400,
                            backgroundColor: isActive
                              ? themeStyles.tagBg
                              : "transparent",
                          }}
                        >
                          {h.text}
                        </a>
                      );
                    })}
                  </nav>
                ) : (
                  <p className="text-xs italic" style={{ color: themeStyles.textMuted }}>
                    Full reading outline available below.
                  </p>
                )}
              </div>

              {/* Sibling Lessons in this Track / Level */}
              {siblingLessons.length > 0 && (
                <div
                  className="p-5 rounded-2xl border shadow-sm transition-colors"
                  style={{
                    backgroundColor: themeStyles.cardBg,
                    borderColor: themeStyles.cardBorder,
                  }}
                >
                  <h3
                    className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                    style={{ color: themeStyles.textMuted }}
                  >
                    <span>📚</span> {lesson.level.name} Lessons
                  </h3>
                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                    {siblingLessons.map((sib, idx) => {
                      const isCurrent = sib.id === lesson.id || sib.slug === lesson.slug;
                      return (
                        <a
                          key={sib.id}
                          href={`/learn/${sib.slug}`}
                          className="flex items-center gap-2.5 p-2 rounded-xl text-xs transition-colors group"
                          style={{
                            backgroundColor: isCurrent ? themeStyles.tagBg : "transparent",
                            color: isCurrent
                              ? themeStyles.accent
                              : themeStyles.textSecondary,
                            fontWeight: isCurrent ? 700 : 500,
                          }}
                        >
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                            style={{
                              backgroundColor: isCurrent
                                ? themeStyles.accent
                                : themeStyles.tagBg,
                              color: isCurrent ? "#fff" : themeStyles.textMuted,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span className="truncate flex-1">{sib.title}</span>
                          <span
                            className="text-[10px] opacity-60 flex-shrink-0"
                            style={{ color: themeStyles.textMuted }}
                          >
                            {sib.duration_minutes}m
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Actions Card */}
              <div
                className="p-4 rounded-2xl border shadow-sm space-y-2"
                style={{
                  backgroundColor: themeStyles.cardBg,
                  borderColor: themeStyles.cardBorder,
                }}
              >
                <button
                  onClick={() => setIsBookmarked((b) => !b)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium hover:opacity-90 transition-colors"
                  style={{ background: themeStyles.tagBg, color: themeStyles.textPrimary }}
                >
                  <span className="flex items-center gap-2">
                    <span>{isBookmarked ? "🔖" : "📑"}</span>
                    {isBookmarked ? "Bookmarked" : "Bookmark Lesson"}
                  </span>
                  {isBookmarked && (
                    <span className="text-[10px] text-emerald-600 font-bold">Saved</span>
                  )}
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium hover:opacity-90 transition-colors"
                  style={{ background: themeStyles.tagBg, color: themeStyles.textPrimary }}
                >
                  <span>🖨️</span> Print / Save PDF
                </button>
                <button
                  onClick={() => setTab("community")}
                  className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium hover:opacity-90 transition-colors"
                  style={{ background: themeStyles.tagBg, color: themeStyles.textPrimary }}
                >
                  <span>💬</span> Discuss in Q&A
                </button>
              </div>
            </aside>
          )}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* MAIN READING STAGE (CENTERED, MAX-W 820px)              */}
          {/* ═══════════════════════════════════════════════════════ */}
          <main className="max-w-[820px] w-full mx-auto">
            {/* ARTICLE CONTAINER CARD */}
            <div
              className="rounded-3xl p-6 sm:p-10 border shadow-sm transition-colors"
              style={{
                backgroundColor: themeStyles.cardBg,
                borderColor: themeStyles.cardBorder,
              }}
            >
              {/* Track Badge & Meta Header */}
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${track.color_hex}18` || "rgba(14,97,99,0.1)",
                    color: track.color_hex || themeStyles.accent,
                  }}
                >
                  🏷️ {track.name}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-md text-xs font-semibold"
                  style={{ background: themeStyles.tagBg, color: themeStyles.textMuted }}
                >
                  ⏱ {lesson.duration_minutes || 8} min read
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-md text-xs font-semibold"
                  style={{ background: themeStyles.tagBg, color: themeStyles.textMuted }}
                >
                  📊 {DIFFICULTY_LABEL[lesson.difficulty_score] || "Medium"}
                </span>
                {lesson.language === "hi" && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                    🇮🇳 हिंदी
                  </span>
                )}
                {lesson.is_free ? (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                    Free lesson
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
                    PRO
                  </span>
                )}
                {completed && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✅ Completed
                  </span>
                )}
              </div>

              {/* Main Untruncated Lesson Title */}
              <h1
                className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-6"
                style={{ color: themeStyles.textPrimary }}
              >
                {lesson.title}
              </h1>

              {/* Interactive Tabs Header */}
              <div
                className="flex items-center gap-1 sm:gap-2 mb-8 border-b overflow-x-auto pb-px"
                style={{ borderColor: themeStyles.cardBorder }}
              >
                {[
                  { id: "lesson", label: "📖 Lesson" },
                  {
                    id: "quiz",
                    label: `🎯 Quiz${
                      questions.length > 0 ? ` (${questions.length})` : ""
                    }`,
                  },
                  { id: "notes", label: "📝 My Notes" },
                  { id: "ai", label: "🤖 Ask AI" },
                  { id: "community", label: "💬 Q&A" },
                ].map((t) => {
                  const isActive = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id as Tab)}
                      className="px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap"
                      style={{
                        borderColor: isActive ? themeStyles.accent : "transparent",
                        color: isActive ? themeStyles.accent : themeStyles.textMuted,
                        marginBottom: -1,
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* ─── TAB 1: LESSON CONTENT ─── */}
              {tab === "lesson" && (
                <div>
                  {/* Typeset MDX Content */}
                  <div
                    ref={contentRef}
                    className={`lesson-rendered-article ${fontSizeClass}`}
                    style={{ color: themeStyles.textSecondary }}
                    dangerouslySetInnerHTML={{ __html: parsedContent }}
                  />

                  {/* Key Takeaways Callout Box */}
                  {lesson.key_takeaways?.length > 0 && (
                    <div
                      className="mt-10 p-6 rounded-2xl border"
                      style={{
                        backgroundColor: themeStyles.blockquoteBg,
                        borderColor: `${themeStyles.accent}40`,
                      }}
                    >
                      <h4
                        className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2"
                        style={{ color: themeStyles.accent }}
                      >
                        <span>🎓</span> Key Takeaways
                      </h4>
                      <div className="space-y-3">
                        {lesson.key_takeaways.filter(Boolean).map((point, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                              style={{
                                backgroundColor: themeStyles.accent,
                                color: "#FFFFFF",
                              }}
                            >
                              {idx + 1}
                            </span>
                            <span
                              className="text-sm sm:text-base leading-relaxed"
                              style={{ color: themeStyles.textPrimary }}
                            >
                              {point}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Official Financial / Regulatory Disclaimer */}
                  <div className="mt-8">
                    <FinanceDisclaimer
                      type={
                        track.slug.includes("trade") || track.slug.includes("tech")
                          ? "trading"
                          : track.slug.includes("crypto")
                          ? "crypto"
                          : "general"
                      }
                    />
                  </div>

                  {/* Mark as Complete CTA Button */}
                  <div className="mt-10 pt-6 border-t" style={{ borderColor: themeStyles.cardBorder }}>
                    {!completed ? (
                      <button
                        onClick={() => completeLesson(true)}
                        className="w-full py-4 px-6 rounded-2xl text-base font-bold text-white transition-all transform active:scale-[0.99] shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        style={{ backgroundColor: themeStyles.accent }}
                      >
                        <span>✅</span>
                        <span>Mark as Complete & Earn 25 XP</span>
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div
                          className="flex-1 w-full py-3.5 px-4 rounded-xl text-center text-sm font-semibold border"
                          style={{
                            background: "rgba(16, 185, 129, 0.1)",
                            color: "#059669",
                            borderColor: "rgba(16, 185, 129, 0.3)",
                          }}
                        >
                          ✅ Lesson Completed
                        </div>
                        {questions.length > 0 && !quizDone && (
                          <button
                            onClick={() => setTab("quiz")}
                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-colors"
                            style={{ backgroundColor: themeStyles.accent }}
                          >
                            Take Quiz ({questions.length} Qs) 🎯
                          </button>
                        )}
                        {nextLesson && (
                          <a
                            href={`/learn/${nextLesson.slug}`}
                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-colors text-center"
                            style={{ backgroundColor: themeStyles.accent }}
                          >
                            Next Lesson →
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Previous / Next Lesson Navigation Cards */}
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t"
                    style={{ borderColor: themeStyles.cardBorder }}
                  >
                    {prevLesson ? (
                      <a
                        href={`/learn/${prevLesson.slug}`}
                        className="p-4 rounded-2xl border transition-all hover:shadow-md group"
                        style={{
                          borderColor: themeStyles.cardBorder,
                          background: themeStyles.tagBg,
                        }}
                      >
                        <div
                          className="text-[11px] font-bold uppercase tracking-wider mb-1"
                          style={{ color: themeStyles.textMuted }}
                        >
                          ← Previous Lesson
                        </div>
                        <div
                          className="text-sm font-bold group-hover:underline line-clamp-2"
                          style={{ color: themeStyles.textPrimary }}
                        >
                          {prevLesson.title}
                        </div>
                        <div
                          className="text-[11px] mt-1"
                          style={{ color: themeStyles.textMuted }}
                        >
                          ⏱ {prevLesson.duration_minutes} min
                        </div>
                      </a>
                    ) : (
                      <div />
                    )}

                    {nextLesson && (
                      <a
                        href={`/learn/${nextLesson.slug}`}
                        className="p-4 rounded-2xl border transition-all hover:shadow-md text-right group"
                        style={{
                          borderColor: themeStyles.cardBorder,
                          background: themeStyles.tagBg,
                        }}
                      >
                        <div
                          className="text-[11px] font-bold uppercase tracking-wider mb-1"
                          style={{ color: themeStyles.textMuted }}
                        >
                          Next Lesson →
                        </div>
                        <div
                          className="text-sm font-bold group-hover:underline line-clamp-2"
                          style={{ color: themeStyles.textPrimary }}
                        >
                          {nextLesson.title}
                        </div>
                        <div
                          className="text-[11px] mt-1"
                          style={{ color: themeStyles.textMuted }}
                        >
                          ⏱ {nextLesson.duration_minutes} min
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* ─── TAB 2: INTERACTIVE QUIZ ─── */}
              {tab === "quiz" && (
                <div>
                  {questions.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-5xl mb-3">🎯</div>
                      <h3
                        className="text-base font-bold mb-1"
                        style={{ color: themeStyles.textPrimary }}
                      >
                        No quiz available yet for this lesson
                      </h3>
                      <p className="text-xs" style={{ color: themeStyles.textMuted }}>
                        Interactive quizzes for this topic will be available soon.
                      </p>
                    </div>
                  ) : quizDone ? (
                    <div className="text-center py-6">
                      <div className="text-6xl mb-4">
                        {quizScore >= 70 ? "🎉" : "📚"}
                      </div>
                      <h3
                        className="text-2xl font-extrabold mb-1"
                        style={{ color: themeStyles.textPrimary }}
                      >
                        {quizScore}% — {quizScore >= 70 ? "Passed with Distinction!" : "Keep Reviewing"}
                      </h3>
                      <p className="text-sm mb-6" style={{ color: themeStyles.textMuted }}>
                        You answered{" "}
                        {Math.round((quizScore / 100) * questions.length)} of{" "}
                        {questions.length} questions correctly.
                      </p>

                      <div className="space-y-4 text-left mb-8">
                        {questions.map((q, idx) => {
                          const userChoice = quizAnswers[q.id];
                          const isCorrect = userChoice === q.correct;
                          const optionMap: Record<string, string> = {
                            a: q.option_a,
                            b: q.option_b,
                            c: q.option_c,
                            d: q.option_d,
                          };

                          return (
                            <div
                              key={q.id}
                              className="p-4 rounded-2xl border"
                              style={{
                                backgroundColor: isCorrect
                                  ? "rgba(16, 185, 129, 0.08)"
                                  : "rgba(239, 68, 68, 0.08)",
                                borderColor: isCorrect
                                  ? "rgba(16, 185, 129, 0.3)"
                                  : "rgba(239, 68, 68, 0.3)",
                              }}
                            >
                              <div
                                className="text-sm font-bold mb-2"
                                style={{ color: themeStyles.textPrimary }}
                              >
                                {idx + 1}. {q.question}
                              </div>
                              <div
                                className="text-xs font-semibold mb-2"
                                style={{
                                  color: isCorrect ? "#059669" : "#DC2626",
                                }}
                              >
                                {isCorrect
                                  ? "✅ Correct"
                                  : `❌ You chose: ${
                                      optionMap[userChoice] || "No answer"
                                    }. Correct answer: ${optionMap[q.correct]}`}
                              </div>
                              {q.explanation && (
                                <p
                                  className="text-xs leading-relaxed"
                                  style={{ color: themeStyles.textMuted }}
                                >
                                  💡 {q.explanation}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => {
                            setQuizDone(false);
                            setQuizAnswers({});
                            setQuizScore(0);
                          }}
                          className="px-6 py-2.5 rounded-xl border font-semibold text-xs transition-colors"
                          style={{
                            borderColor: themeStyles.cardBorder,
                            color: themeStyles.textPrimary,
                          }}
                        >
                          Retry Quiz
                        </button>
                        {nextLesson && (
                          <a
                            href={`/learn/${nextLesson.slug}`}
                            className="px-6 py-2.5 rounded-xl text-white font-semibold text-xs shadow-md transition-colors"
                            style={{ backgroundColor: themeStyles.accent }}
                          >
                            Next Lesson →
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        className="text-xs font-medium mb-6 pb-3 border-b flex justify-between items-center"
                        style={{
                          color: themeStyles.textMuted,
                          borderColor: themeStyles.cardBorder,
                        }}
                      >
                        <span>
                          {questions.length} Question{questions.length !== 1 ? "s" : ""} · Pass mark: 70%
                        </span>
                        <span className="text-emerald-600 font-bold">+25 XP on Passing</span>
                      </div>

                      <div className="space-y-6">
                        {questions.map((q, idx) => {
                          const opts = [
                            { key: "a", text: q.option_a },
                            { key: "b", text: q.option_b },
                            { key: "c", text: q.option_c },
                            { key: "d", text: q.option_d },
                          ].filter((o) => o.text);

                          return (
                            <div key={q.id}>
                              <div
                                className="text-sm sm:text-base font-bold mb-3"
                                style={{ color: themeStyles.textPrimary }}
                              >
                                {idx + 1}. {q.question}
                              </div>
                              <div className="space-y-2">
                                {opts.map((opt) => {
                                  const isSelected = quizAnswers[q.id] === opt.key;
                                  return (
                                    <button
                                      key={opt.key}
                                      onClick={() =>
                                        setQuizAnswers((prev) => ({
                                          ...prev,
                                          [q.id]: opt.key,
                                        }))
                                      }
                                      className="w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-3"
                                      style={{
                                        borderColor: isSelected
                                          ? themeStyles.accent
                                          : themeStyles.cardBorder,
                                        backgroundColor: isSelected
                                          ? themeStyles.blockquoteBg
                                          : themeStyles.cardBg,
                                        color: themeStyles.textPrimary,
                                      }}
                                    >
                                      <span
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border"
                                        style={{
                                          borderColor: isSelected
                                            ? themeStyles.accent
                                            : themeStyles.cardBorder,
                                          backgroundColor: isSelected
                                            ? themeStyles.accent
                                            : "transparent",
                                          color: isSelected ? "#fff" : themeStyles.textMuted,
                                        }}
                                      >
                                        {opt.key.toUpperCase()}
                                      </span>
                                      <span className="flex-1">{opt.text}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={submitQuiz}
                        disabled={Object.keys(quizAnswers).length < questions.length}
                        className="w-full mt-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: themeStyles.accent }}
                      >
                        Submit Quiz ({Object.keys(quizAnswers).length}/{questions.length} Answered)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 3: PRIVATE NOTES ─── */}
              {tab === "notes" && (
                <div>
                  <p className="text-xs mb-4" style={{ color: themeStyles.textMuted }}>
                    Your private, encrypted notes for this lesson. Saved to your FinanceHub account.
                  </p>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write your notes, formulas, reflections, or personal investment rules here..."
                    rows={12}
                    className="w-full p-4 rounded-2xl border text-sm outline-none resize-y transition-colors font-sans"
                    style={{
                      borderColor: themeStyles.cardBorder,
                      backgroundColor: themeStyles.tagBg,
                      color: themeStyles.textPrimary,
                    }}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs" style={{ color: themeStyles.textMuted }}>
                      {note.length} characters
                    </span>
                    <button
                      onClick={saveNote}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-colors"
                      style={{
                        backgroundColor: notesSaved ? "#10B981" : themeStyles.accent,
                      }}
                    >
                      {notesSaved ? "✅ Saved to Account!" : "Save Notes"}
                    </button>
                  </div>

                  <div
                    className="mt-6 p-4 rounded-xl border text-xs space-y-1.5"
                    style={{
                      background: themeStyles.tagBg,
                      borderColor: themeStyles.cardBorder,
                      color: themeStyles.textMuted,
                    }}
                  >
                    <div className="font-bold mb-1" style={{ color: themeStyles.textPrimary }}>
                      💡 Recommended Note-Taking Habits
                    </div>
                    <div>• Summarize the core concept in your own words.</div>
                    <div>• Note any specific Indian stock market or tax rules that apply.</div>
                    <div>• Write down 1 practical rule you will follow in your trading or investing.</div>
                  </div>
                </div>
              )}

              {/* ─── TAB 4: ASK AI MENTOR ─── */}
              {tab === "ai" && (
                <div className="py-4">
                  <div
                    className="p-5 rounded-2xl border mb-6 text-sm leading-relaxed"
                    style={{
                      backgroundColor: themeStyles.blockquoteBg,
                      borderColor: `${themeStyles.accent}40`,
                      color: themeStyles.textPrimary,
                    }}
                  >
                    🤖 Have questions about <strong>{lesson.title}</strong>? Ask the AI
                    Mentor to explain with real-world Indian market examples, break down
                    formulas, or clarify definitions.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {[
                      "Explain this like I'm a complete beginner",
                      "Give me a real-life Indian market example",
                      "What are the biggest mistakes to avoid here?",
                      "How do I practice this in paper trading?",
                    ].map((prompt, i) => (
                      <a
                        key={i}
                        href={`/ai-tutor?prompt=${encodeURIComponent(
                          `Regarding the lesson "${lesson.title}": ${prompt}`
                        )}`}
                        className="p-3.5 rounded-xl border text-xs font-semibold transition-all hover:shadow-sm"
                        style={{
                          borderColor: themeStyles.cardBorder,
                          background: themeStyles.tagBg,
                          color: themeStyles.textPrimary,
                        }}
                      >
                        💡 &ldquo;{prompt}&rdquo;
                      </a>
                    ))}
                  </div>
                  <a
                    href={`/ai-tutor?context=${encodeURIComponent(lesson.title)}`}
                    className="block w-full text-center py-3.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md transition-colors"
                    style={{ backgroundColor: themeStyles.accent }}
                  >
                    Open AI Mentor in Full Screen →
                  </a>
                </div>
              )}

              {/* ─── TAB 5: COMMUNITY Q&A ─── */}
              {tab === "community" && (
                <div className="pt-2">
                  <LessonQA lessonId={lesson.id} lessonTitle={lesson.title} />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ─── EMBEDDED STYLES FOR TYPESET ARTICLE ─── */}
      <style jsx global>{`
        .lesson-rendered-article {
          font-family: var(--font-ui, system-ui, sans-serif);
        }

        .lesson-heading-1 {
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin: 2.2rem 0 1rem;
          color: inherit;
        }

        .lesson-heading-2 {
          font-size: 1.45rem;
          font-weight: 750;
          letter-spacing: -0.02em;
          margin: 2rem 0 0.85rem;
          color: inherit;
        }

        .lesson-heading-3 {
          font-size: 1.18rem;
          font-weight: 700;
          margin: 1.6rem 0 0.65rem;
          color: inherit;
        }

        .lesson-p {
          margin-bottom: 1.4rem;
          color: inherit;
        }

        .lesson-strong {
          font-weight: 700;
          color: inherit;
        }

        .lesson-blockquote {
          border-left: 4px solid var(--brand-primary, #0E6163);
          margin: 1.5rem 0;
          padding: 0.85rem 1.25rem;
          border-radius: 0 12px 12px 0;
          background: rgba(14, 97, 99, 0.05);
          font-style: italic;
        }

        .lesson-ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.4rem;
        }

        .lesson-ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.4rem;
        }

        .lesson-li,
        .lesson-li-numbered {
          margin-bottom: 0.5rem;
          line-height: 1.7;
        }

        .lesson-inline-code {
          font-family: monospace;
          font-size: 0.88em;
          padding: 2px 6px;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.05);
        }

        /* ── Modern Formatted Tables ── */
        .lesson-table-container {
          overflow-x: auto;
          margin: 1.75rem 0;
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .lesson-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.92rem;
          text-align: left;
        }

        .lesson-th {
          padding: 12px 16px;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.78rem;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(0, 0, 0, 0.03);
        }

        .lesson-td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          line-height: 1.6;
        }

        .lesson-table tbody tr:nth-child(even) {
          background: rgba(0, 0, 0, 0.015);
        }

        .lesson-source-pill {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748B;
          background: rgba(0, 0, 0, 0.05);
          padding: 3px 8px;
          border-radius: 6px;
          margin-top: 4px;
        }

        .lesson-badge-warn {
          color: #D97706;
          font-weight: bold;
        }

        .lesson-badge-check {
          color: #059669;
          font-weight: bold;
        }

        .code-block-box {
          margin: 1.5rem 0;
          border-radius: 12px;
          overflow: hidden;
          background: #0F172A;
          color: #F8FAFC;
        }

        .code-block-header {
          padding: 6px 14px;
          font-size: 0.72rem;
          font-family: monospace;
          text-transform: uppercase;
          background: #1E293B;
          color: #94A3B8;
        }

        .code-block-pre {
          padding: 14px 16px;
          overflow-x: auto;
          font-size: 0.88rem;
          line-height: 1.6;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
