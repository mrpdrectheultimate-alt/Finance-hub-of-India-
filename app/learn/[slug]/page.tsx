"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase }         from "@/lib/supabase";
import LessonQA             from "@/components/community/LessonQA";
import { AIDisclaimer }     from "@/components/ui/FinanceDisclaimer";

// ============================================================
// FinanceHub — Lesson Player
// app/learn/[slug]/page.tsx  (client shell)
// MDX · Progress · Quiz · Notes · Q&A · XP · Certificates
// ============================================================

type Lesson = {
  id:               string;
  title:            string;
  slug:             string;
  content_mdx:      string;
  duration_minutes: number;
  is_free:          boolean;
  language:         string;
  key_takeaways:    string[];
  difficulty_score: number;
  meta_description: string;
  level: { name: string; track: { name: string; slug: string; color_hex: string } };
};

type QuizQuestion = {
  id:           string;
  question:     string;
  option_a:     string;
  option_b:     string;
  option_c:     string;
  option_d:     string;
  correct:      "a" | "b" | "c" | "d";
  explanation:  string;
};

type Tab = "lesson" | "quiz" | "notes" | "ai" | "community";

const DIFFICULTY_LABEL = ["","Easiest","Easy","Beginner","Beginner+","Medium","Med-Hard","Hard","Very Hard","Expert","Master"];

function XPToast({ xp, streak, milestone }: { xp: number; streak: number; milestone: number | null }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const t = setTimeout(() => setVisible(false), 3500); return () => clearTimeout(t); }, []);
  if (!visible || xp === 0) return null;
  return (
    <div style={{
      position: "fixed", bottom: 80, right: 20, zIndex: 9999,
      background: "#1c2b3a", borderRadius: 14, padding: "14px 18px",
      boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
      animation: "slide-up 0.4s ease-out",
      fontFamily: "var(--font-ui,system-ui)",
      minWidth: 200,
    }}>
      <div style={{ fontSize: 24, fontWeight: 900, color: "#1D9E75", marginBottom: 4 }}>+{xp} XP ⭐</div>
      {streak > 1 && (
        <div style={{ fontSize: 13, color: "#F6AD55" }}>🔥 {streak}-day streak!</div>
      )}
      {milestone && (
        <div style={{ fontSize: 13, color: "#D4A017", fontWeight: 700, marginTop: 4 }}>
          🏅 {milestone}-day streak milestone!
        </div>
      )}
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ height: 3, background: "var(--border-light,#e2e8f0)", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "var(--brand-primary,#0E6163)", transition: "width 0.3s ease" }} />
    </div>
  );
}

export default function LessonPlayer({ params }: { params: { slug: string } }) {
  const [lesson,       setLesson]       = useState<Lesson | null>(null);
  const [questions,    setQuestions]    = useState<QuizQuestion[]>([]);
  const [progress,     setProgress]     = useState(0);       // reading progress 0-100
  const [completed,    setCompleted]    = useState(false);
  const [tab,          setTab]          = useState<Tab>("lesson");
  const [note,         setNote]         = useState("");
  const [notesSaved,   setNotesSaved]   = useState(false);
  const [quizAnswers,  setQuizAnswers]  = useState<Record<string, string>>({});
  const [quizDone,     setQuizDone]     = useState(false);
  const [quizScore,    setQuizScore]    = useState(0);
  const [xpToast,      setXpToast]      = useState<{ xp: number; streak: number; milestone: number | null } | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [user,         setUser]         = useState<any>(null);
  const [certId,       setCertId]       = useState<string | null>(null);
  const contentRef  = useRef<HTMLDivElement>(null);
  const startTime   = useRef(Date.now());

  // Load lesson + user state
  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await (supabase.auth as any).getUser();
      setUser(u);

      // Fetch lesson by slug or id
      const { data: lessonData } = await (supabase as any)
        .from("lessons")
        .select(`
          id, title, slug, content_mdx, duration_minutes,
          is_free, language, key_takeaways, difficulty_score, meta_description,
          levels!inner(name, tracks!inner(name, slug, color_hex))
        `)
        .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
        .eq("is_published", true)
        .single();

      if (!lessonData) { setLoading(false); return; }

      const mapped: Lesson = {
        ...lessonData,
        level: {
          name:  (lessonData as any).levels.name,
          track: (lessonData as any).levels.tracks,
        },
      };
      setLesson(mapped);

      // Check if already completed
      if (u) {
        const { data: prog } = await (supabase as any)
          .from("user_progress")
          .select("completed, quiz_score")
          .eq("user_id", u.id)
          .eq("lesson_id", lessonData.id)
          .single();
        if (prog?.completed) setCompleted(true);

        // Load existing note
        const { data: noteData } = await (supabase as any)
          .from("user_notes")
          .select("content")
          .eq("user_id", u.id)
          .eq("lesson_id", lessonData.id)
          .single();
        if (noteData?.content) setNote(noteData.content);
      }

      // Fetch quiz questions
      const { data: quizRes } = await (supabase as any)
        .from("quizzes")
        .select("id")
        .eq("lesson_id", lessonData.id);

      const quizIds = (quizRes || []).map((q: any) => q.id);

      const { data: quiz } = quizIds.length > 0 ? await (supabase as any)
        .from("quiz_questions")
        .select("*")
        .in("quiz_id", quizIds)
        .limit(5) : { data: [] };

      setQuestions(quiz || []);

      setLoading(false);
    })();
  }, [params.slug]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const el  = contentRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const h   = el.offsetHeight;
      const vh  = window.innerHeight;
      const pct = Math.min(100, Math.max(0, ((vh - top) / (h + vh)) * 100));
      setProgress(Math.round(pct));
      // Auto-complete at 85% scroll
      if (pct >= 85 && !completed && user) completeLesson(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [completed, user]);

  const completeLesson = useCallback(async (fromButton: boolean) => {
    if (!lesson || !user || (completed && !fromButton)) return;
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);

    const passed = quizDone && quizScore >= 70;
    const res    = await fetch("/api/complete-lesson", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        lessonId:         lesson.id,
        timeSpentSeconds: elapsed,
        quizScore:        quizDone ? quizScore : null,
        quizPassed:       passed,
        isReview:         completed,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      setCompleted(true);
      if (result.xp_earned > 0) {
        setXpToast({ xp: result.xp_earned, streak: result.new_streak, milestone: result.streak_milestone });
      }
      if (result.certificate_id) setCertId(result.certificate_id);
    }
  }, [lesson, user, completed, quizDone, quizScore]);

  const submitQuiz = async () => {
    if (!questions.length) return;
    let correct = 0;
    questions.forEach(q => { if (quizAnswers[q.id] === q.correct) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    setQuizScore(score);
    setQuizDone(true);
    await completeLesson(true);
  };

  const saveNote = async () => {
    if (!user || !lesson) return;
    await (supabase as any).from("user_notes").upsert({
      user_id:   user.id,
      lesson_id: lesson.id,
      content:   note,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  if (loading) return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px", fontFamily: "var(--font-ui,system-ui)" }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: i === 1 ? 32 : 16, background: "linear-gradient(90deg,#f5f5f5 25%,#ebebeb 50%,#f5f5f5 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", borderRadius: 8, marginBottom: 14, width: i === 1 ? "60%" : i === 2 ? "90%" : "75%" }} />
      ))}
    </div>
  );

  if (!lesson) return (
    <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "var(--font-ui,system-ui)" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1c2b3a" }}>Lesson not found</h2>
      <a href="/explore" style={{ color: "#0E6163", fontSize: 14 }}>Browse all lessons →</a>
    </div>
  );

  const track = lesson.level.track;

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 20px 80px", fontFamily: "var(--font-ui,system-ui)" }}>

      {/* Reading progress bar */}
      <ProgressBar pct={progress} />

      {/* XP Toast */}
      {xpToast && <XPToast {...xpToast} />}

      {/* Certificate banner */}
      {certId && (
        <div style={{
          background: "linear-gradient(135deg,#1D9E75,#0E6163)", borderRadius: 14,
          padding: "16px 20px", marginTop: 16, marginBottom: 8,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>🏆 Track Complete!</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>You earned a certificate for {track.name}</div>
          </div>
          <a href="/certificates" style={{
            padding: "8px 16px", background: "#fff", color: "#0E6163",
            borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none",
          }}>
            View Certificate →
          </a>
        </div>
      )}

      {/* Breadcrumb + header */}
      <div style={{ paddingTop: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "#a0aec0", marginBottom: 12, flexWrap: "wrap" }}>
          <a href="/explore" style={{ color: "#a0aec0", textDecoration: "none" }}>Explore</a>
          <span>›</span>
          <a href={`/tracks/${track.slug}`} style={{ color: track.color_hex || "#0E6163", textDecoration: "none", fontWeight: 600 }}>
            {track.name}
          </a>
          <span>›</span>
          <span style={{ color: "#718096" }}>{lesson.level.name}</span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1c2b3a", letterSpacing: "-0.4px", margin: "0 0 10px", lineHeight: 1.25 }}>
          {lesson.title}
        </h1>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", fontSize: 12, color: "#718096" }}>
          <span>⏱ {lesson.duration_minutes} min</span>
          <span>📊 {DIFFICULTY_LABEL[lesson.difficulty_score] || "Intermediate"}</span>
          {lesson.language === "hi" && <span style={{ color: "#B91C1C", fontWeight: 600 }}>🇮🇳 हिंदी</span>}
          {lesson.is_free && <span style={{ color: "#1D9E75", fontWeight: 600 }}>Free lesson</span>}
          {completed && <span style={{ color: "#1D9E75", fontWeight: 700 }}>✅ Completed</span>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid var(--border-light,#e2e8f0)", marginBottom: 24, overflowX: "auto" }}>
        {([
          { id: "lesson",    label: "📖 Lesson" },
          { id: "quiz",      label: `🎯 Quiz${questions.length > 0 ? ` (${questions.length})` : ""}` },
          { id: "notes",     label: "📝 My Notes" },
          { id: "ai",        label: "🤖 Ask AI" },
          { id: "community", label: "💬 Q&A" },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: "10px 16px", flexShrink: 0, fontSize: 13,
              fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? "#0E6163" : "#718096",
              background: "none", border: "none",
              borderBottom: tab === t.id ? "2px solid #0E6163" : "2px solid transparent",
              marginBottom: -2, cursor: "pointer", fontFamily: "var(--font-ui,system-ui)",
              whiteSpace: "nowrap",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* LESSON TAB */}
      {tab === "lesson" && (
        <div>
          <div ref={contentRef}
            className="lesson-content"
            style={{ fontSize: 15, lineHeight: 1.85, color: "#1c2b3a" }}
            dangerouslySetInnerHTML={{
              __html: renderMDX(lesson.content_mdx || "")
            }}
          />

          {/* Key takeaways */}
          {lesson.key_takeaways?.length > 0 && (
            <div style={{
              background: "#f0f9f9", border: "1px solid #0E616330",
              borderRadius: 14, padding: "18px 20px", marginTop: 28,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0E6163", marginBottom: 12 }}>
                🎓 Key Takeaways
              </div>
              {lesson.key_takeaways.filter(Boolean).map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span style={{ color: "#1D9E75", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ fontSize: 14, color: "#1c2b3a", lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
          )}

          <AIDisclaimer />

          {/* Complete button */}
          {!completed ? (
            <button onClick={() => completeLesson(true)}
              style={{
                width: "100%", marginTop: 24, padding: "14px",
                background: "#0E6163", color: "#fff",
                border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "var(--font-ui,system-ui)",
                boxShadow: "0 6px 20px rgba(14,97,99,0.25)",
              }}>
              ✅ Mark as Complete & Earn XP
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <a href={`/tracks/${track.slug}`}
                style={{
                  flex: 1, display: "block", textAlign: "center",
                  padding: "12px", background: "#0E6163", color: "#fff",
                  borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none",
                }}>
                Next Lesson →
              </a>
              <button onClick={() => setTab("quiz")}
                style={{
                  flex: 1, padding: "12px",
                  background: "#fff", color: "#0E6163",
                  border: "1px solid #0E6163", borderRadius: 10,
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--font-ui,system-ui)",
                }}>
                Take Quiz 🎯
              </button>
            </div>
          )}
        </div>
      )}

      {/* QUIZ TAB */}
      {tab === "quiz" && (
        <div>
          {questions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#718096" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
              <div style={{ fontWeight: 600 }}>No quiz for this lesson yet</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Quizzes are added regularly — check back soon</div>
            </div>
          ) : quizDone ? (
            // Results
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>
                {quizScore >= 70 ? "🎉" : "📚"}
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1c2b3a", marginBottom: 8 }}>
                {quizScore}% — {quizScore >= 70 ? "Passed!" : "Keep practicing"}
              </h2>
              <p style={{ color: "#718096", marginBottom: 24 }}>
                {Math.round((quizScore / 100) * questions.length)} of {questions.length} correct
              </p>

              {/* Question review */}
              {questions.map((q, i) => {
                const userAns    = quizAnswers[q.id];
                const isCorrect  = userAns === q.correct;
                const optionMap: Record<string, string> = { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d };
                return (
                  <div key={q.id} style={{
                    textAlign: "left", marginBottom: 16,
                    background: isCorrect ? "#F0FFF4" : "#FFF5F5",
                    border: `1px solid ${isCorrect ? "#C6F6D5" : "#FEB2B2"}`,
                    borderRadius: 12, padding: "14px 16px",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2b3a", marginBottom: 8 }}>
                      {i+1}. {q.question}
                    </div>
                    <div style={{ fontSize: 12, color: isCorrect ? "#1D9E75" : "#E53E3E", marginBottom: 6, fontWeight: 600 }}>
                      {isCorrect ? "✅ Correct" : `❌ You chose: ${optionMap[userAns] || "—"}. Correct: ${optionMap[q.correct]}`}
                    </div>
                    {q.explanation && (
                      <div style={{ fontSize: 12, color: "#718096", lineHeight: 1.6 }}>{q.explanation}</div>
                    )}
                  </div>
                );
              })}

              <button onClick={() => { setQuizDone(false); setQuizAnswers({}); setQuizScore(0); }}
                style={{
                  padding: "10px 24px", background: "#0E6163", color: "#fff",
                  border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "var(--font-ui,system-ui)", marginTop: 8,
                }}>
                Retry Quiz
              </button>
            </div>
          ) : (
            // Questions
            <div>
              <div style={{ fontSize: 14, color: "#718096", marginBottom: 20 }}>
                {questions.length} question{questions.length !== 1 ? "s" : ""} · Pass mark: 70% · +25 XP for passing
              </div>
              {questions.map((q, i) => {
                const opts = [
                  { key: "a", text: q.option_a },
                  { key: "b", text: q.option_b },
                  { key: "c", text: q.option_c },
                  { key: "d", text: q.option_d },
                ].filter(o => o.text);
                return (
                  <div key={q.id} style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1c2b3a", marginBottom: 12, lineHeight: 1.5 }}>
                      {i+1}. {q.question}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {opts.map(opt => (
                        <button key={opt.key} onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt.key }))}
                          style={{
                            padding: "11px 14px", textAlign: "left", fontSize: 14,
                            background: quizAnswers[q.id] === opt.key ? "#f0f9f9" : "#fff",
                            border: `2px solid ${quizAnswers[q.id] === opt.key ? "#0E6163" : "#e2e8f0"}`,
                            borderRadius: 9, cursor: "pointer",
                            fontFamily: "var(--font-ui,system-ui)", color: "#1c2b3a",
                            transition: "all 0.15s",
                          }}>
                          <span style={{ fontWeight: 700, color: quizAnswers[q.id] === opt.key ? "#0E6163" : "#a0aec0", marginRight: 8 }}>
                            {opt.key.toUpperCase()}.
                          </span>
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              <button
                onClick={submitQuiz}
                disabled={Object.keys(quizAnswers).length < questions.length}
                style={{
                  width: "100%", padding: "13px",
                  background: Object.keys(quizAnswers).length < questions.length ? "#e2e8f0" : "#0E6163",
                  color: Object.keys(quizAnswers).length < questions.length ? "#a0aec0" : "#fff",
                  border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
                  cursor: Object.keys(quizAnswers).length < questions.length ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-ui,system-ui)",
                }}>
                Submit Quiz ({Object.keys(quizAnswers).length}/{questions.length} answered)
              </button>
            </div>
          )}
        </div>
      )}

      {/* NOTES TAB */}
      {tab === "notes" && (
        <div>
          <div style={{ fontSize: 13, color: "#718096", marginBottom: 12 }}>
            Your private notes for this lesson. Saved to your account.
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Write your notes, key points, questions, or reflections here…"
            rows={14}
            style={{
              width: "100%", padding: "14px", border: "1px solid #e2e8f0",
              borderRadius: 12, fontSize: 14, fontFamily: "var(--font-reading,Georgia,serif)",
              lineHeight: 1.7, outline: "none", resize: "vertical", boxSizing: "border-box",
              color: "#1c2b3a",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <span style={{ fontSize: 11, color: "#a0aec0" }}>{note.length} characters</span>
            <button onClick={saveNote}
              style={{
                padding: "8px 20px",
                background: notesSaved ? "#1D9E75" : "#0E6163",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-ui,system-ui)", transition: "background 0.3s",
              }}>
              {notesSaved ? "✅ Saved!" : "Save Notes"}
            </button>
          </div>

          {/* Notes tips */}
          <div style={{ marginTop: 20, background: "#f8f9fa", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#718096", marginBottom: 8 }}>
              💡 Effective note-taking tips
            </div>
            {[
              "Write in your own words — don't just copy the lesson",
              "Note any India-specific examples that apply to your life",
              "Write one question you'd like to explore further",
              "Summarise the lesson in 2-3 lines at the end",
            ].map((tip, i) => (
              <div key={i} style={{ fontSize: 12, color: "#718096", marginBottom: 4 }}>• {tip}</div>
            ))}
          </div>
        </div>
      )}

      {/* AI TAB */}
      {tab === "ai" && (
        <div>
          {user ? (
            <div>
              {/* Dynamic import of AIMentor to avoid hydration issues */}
              <div style={{ background: "#f0f9f9", borderRadius: 12, padding: "14px 16px", marginBottom: 16, fontSize: 13, color: "#0E6163", lineHeight: 1.6 }}>
                🤖 Ask the AI Mentor anything about <strong>{lesson.title}</strong>.
                Questions, clarifications, examples — the AI knows you're studying this lesson.
              </div>
              <a href="/ai-tutor" style={{
                display: "block", textAlign: "center", padding: "12px",
                background: "#0E6163", color: "#fff", borderRadius: 10,
                fontSize: 14, fontWeight: 600, textDecoration: "none",
              }}>
                Open AI Mentor in full screen →
              </a>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1c2b3a", marginBottom: 8 }}>
                Sign in to use AI Mentor
              </h3>
              <a href="/auth/login" style={{
                display: "inline-block", padding: "10px 22px",
                background: "#0E6163", color: "#fff",
                borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: "none",
              }}>
                Sign in →
              </a>
            </div>
          )}
        </div>
      )}

      {/* COMMUNITY TAB */}
      {tab === "community" && (
        <LessonQA lessonId={lesson.id} lessonTitle={lesson.title} />
      )}
    </div>
  );
}

// ─── Simple MDX renderer (no extra deps) ─────────────────────
function renderMDX(mdx: string): string {
  return mdx
    .replace(/^# (.+)$/gm,   "<h1>$1</h1>")
    .replace(/^## (.+)$/gm,  "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g,    "<em>$1</em>")
    .replace(/`(.+?)`/g,      "<code>$1</code>")
    .replace(/^\| (.+)$/gm,   "<tr><td>$1</td></tr>") // crude table
    .replace(/^> (.+)$/gm,    "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm,    "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm,"<li>$2</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|b|u|l|p|t|c])/gm, "<p>")
    .replace(/\[Source: (.+?)\]/g, "<span class='source-cite'>📎 $1</span>")
    .replace(/⚠️/g, "<span style='color:#D4A017'>⚠️</span>")
    .replace(/✅/g,  "<span style='color:#1D9E75'>✅</span>");
}
