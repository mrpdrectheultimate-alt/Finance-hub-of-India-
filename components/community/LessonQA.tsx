"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Lesson Q&A Community Component
// components/community/LessonQA.tsx
// Per-lesson questions + answers + upvotes
// ============================================================

type Question = {
  id:           string;
  question:     string;
  upvote_count: number;
  answer_count: number;
  is_answered:  boolean;
  is_pinned:    boolean;
  created_at:   string;
  user:         { full_name: string; subscription_tier?: string; role?: string } | null;
  answers?:     Answer[];
  userUpvoted?: boolean;
};

type Answer = {
  id:           string;
  answer:       string;
  upvote_count: number;
  is_accepted:  boolean;
  is_staff:     boolean;
  is_ai:        boolean;
  created_at:   string;
  user:         { full_name: string; subscription_tier?: string; role?: string } | null;
  userUpvoted?: boolean;
};

const TIER_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  pro:    { label: "Pro",    color: "#185FA5", bg: "#EBF8FF" },
  expert: { label: "Expert", color: "#553C9A", bg: "#FAF5FF" },
  free:   { label: "",       color: "",        bg: "" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function Avatar({ name }: { name: string; tier?: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const colors   = ["#0E6163", "#185FA5", "#7C3AED", "#B91C1C", "#D4A017", "#854F0B"];
  const color    = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {initials || "?"}
    </div>
  );
}

interface LessonQAProps {
  lessonId:    string;
  lessonTitle: string;
}

export default function LessonQA({ lessonId, lessonTitle }: LessonQAProps) {
  const [questions,     setQuestions]     = useState<Question[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [newQuestion,   setNewQuestion]   = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [expandedId,    setExpandedId]    = useState<string | null>(null);
  const [answerText,    setAnswerText]    = useState<Record<string, string>>({});
  const [answerLoading, setAnswerLoading] = useState<Record<string, boolean>>({});
  const [currentUser,   setCurrentUser]   = useState<any>(null);
  const [sortBy,        setSortBy]        = useState<"recent" | "popular" | "unanswered">("recent");
  const [error,         setError]         = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id,full_name,role")
          .eq("id", user.id)
          .single();
        setCurrentUser(profile);
      }
      await loadQuestions();
    })();
  }, [lessonId, sortBy]);

  const loadQuestions = async () => {
    setLoading(true);

    let query = (supabase as any)
      .from("lesson_questions")
      .select(`
        id, question, upvote_count, answer_count, is_answered, is_pinned, created_at,
        profiles(full_name, role)
      `)
      .eq("lesson_id", lessonId)
      .eq("is_flagged", false);

    if (sortBy === "popular")    query = query.order("upvote_count", { ascending: false });
    if (sortBy === "unanswered") query = query.eq("is_answered", false).order("created_at", { ascending: false });
    if (sortBy === "recent")     query = query.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });

    const { data } = await query.limit(20);

    const formatted = (data || []).map((q: any) => ({
      ...q,
      user: q.profiles,
    }));

    // Check which ones the current user upvoted
    if (currentUser && formatted.length > 0) {
      const { data: upvotes } = await (supabase as any)
        .from("community_upvotes")
        .select("target_id")
        .eq("user_id", currentUser.id)
        .eq("target_type", "question")
        .in("target_id", formatted.map((q: Question) => q.id));

      const upvotedSet = new Set(upvotes?.map((u: any) => u.target_id) || []);
      formatted.forEach((q: Question) => { q.userUpvoted = upvotedSet.has(q.id); });
    }

    setQuestions(formatted);
    setLoading(false);
  };

  const loadAnswers = async (questionId: string) => {
    const { data } = await (supabase as any)
      .from("question_answers")
      .select(`
        id, answer, upvote_count, is_accepted, is_staff, is_ai, created_at,
        profiles(full_name, role)
      `)
      .eq("question_id", questionId)
      .eq("is_flagged", false)
      .order("is_accepted", { ascending: false })
      .order("upvote_count", { ascending: false })
      .limit(10);

    const formatted = (data || []).map((a: any) => ({
      ...a,
      user: a.profiles,
    }));

    if (currentUser && formatted.length > 0) {
      const { data: upvotes } = await (supabase as any)
        .from("community_upvotes")
        .select("target_id")
        .eq("user_id", currentUser.id)
        .eq("target_type", "answer")
        .in("target_id", formatted.map((a: Answer) => a.id));

      const upvotedSet = new Set(upvotes?.map((u: any) => u.target_id) || []);
      formatted.forEach((a: Answer) => { a.userUpvoted = upvotedSet.has(a.id); });
    }

    setQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, answers: formatted } : q
    ));
  };

  const handleExpand = async (questionId: string) => {
    if (expandedId === questionId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(questionId);
    await loadAnswers(questionId);
  };

  const submitQuestion = async () => {
    if (!newQuestion.trim() || newQuestion.length < 10) {
      setError("Question must be at least 10 characters.");
      return;
    }
    if (!currentUser) {
      setError("Please sign in to ask a question.");
      return;
    }
    setSubmitting(true);
    setError("");

    const { error: insertErr } = await (supabase as any)
      .from("lesson_questions")
      .insert({
        lesson_id: lessonId,
        user_id:   currentUser.id,
        question:  newQuestion.trim(),
      });

    if (insertErr) {
      setError("Failed to post question. Please try again.");
    } else {
      setNewQuestion("");
      await loadQuestions();
    }
    setSubmitting(false);
  };

  const submitAnswer = async (questionId: string) => {
    const text = answerText[questionId]?.trim();
    if (!text || text.length < 10 || !currentUser) return;

    setAnswerLoading(prev => ({ ...prev, [questionId]: true }));

    const { error: insertErr } = await (supabase as any)
      .from("question_answers")
      .insert({
        question_id: questionId,
        user_id:     currentUser.id,
        answer:      text,
      });

    if (!insertErr) {
      // Safely fetch current answer_count & update
      const { data: qData } = await (supabase as any)
        .from("lesson_questions")
        .select("answer_count")
        .eq("id", questionId)
        .single();

      const newCount = ((qData?.answer_count || 0) + 1);

      await (supabase as any)
        .from("lesson_questions")
        .update({ answer_count: newCount, is_answered: true })
        .eq("id", questionId);

      setAnswerText(prev => ({ ...prev, [questionId]: "" }));
      await loadAnswers(questionId);
      await loadQuestions();
    }

    setAnswerLoading(prev => ({ ...prev, [questionId]: false }));
  };

  const handleUpvote = async (type: "question" | "answer", targetId: string) => {
    if (!currentUser) { setError("Please sign in to upvote."); return; }

    await (supabase as any).rpc("toggle_upvote", {
      p_user_id:   currentUser.id,
      p_type:      type,
      p_target_id: targetId,
    });

    if (type === "question") await loadQuestions();
    else if (expandedId) await loadAnswers(expandedId);
  };

  const totalQs = questions.length;

  return (
    <div style={{ fontFamily: "var(--font-ui,system-ui)" }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 18,
      }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1c2b3a", margin: 0 }}>
          💬 Community Q&A
          {totalQs > 0 && (
            <span style={{ fontSize: 13, fontWeight: 500, color: "#718096", marginLeft: 8 }}>
              {totalQs} question{totalQs !== 1 ? "s" : ""}
            </span>
          )}
        </h3>

        {/* Sort */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["recent", "popular", "unanswered"] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              style={{
                padding: "5px 10px", fontSize: 11, fontWeight: sortBy === s ? 700 : 400,
                background: sortBy === s ? "#1c2b3a" : "#f7fafc",
                color: sortBy === s ? "#fff" : "#718096",
                border: `1px solid ${sortBy === s ? "#1c2b3a" : "#e2e8f0"}`,
                borderRadius: 8, cursor: "pointer",
                fontFamily: "var(--font-ui,system-ui)",
                textTransform: "capitalize",
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Ask a question */}
      {currentUser ? (
        <div style={{
          background: "#f8f9fa", border: "1px solid #e2e8f0",
          borderRadius: 12, padding: "14px 16px", marginBottom: 20,
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Avatar name={currentUser.full_name || "You"} tier={currentUser.subscription_tier || currentUser.role} />
            <div style={{ flex: 1 }}>
              <textarea
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                placeholder={`Ask a question about "${lessonTitle}"…`}
                rows={2}
                style={{
                  width: "100%", padding: "9px 12px",
                  border: "1px solid #e2e8f0", borderRadius: 9,
                  fontSize: 14, fontFamily: "var(--font-ui,system-ui)",
                  resize: "vertical", outline: "none",
                  boxSizing: "border-box", lineHeight: 1.5,
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: "#a0aec0" }}>
                  {newQuestion.length}/1000 characters · Be specific for better answers
                </span>
                <button
                  onClick={submitQuestion}
                  disabled={submitting || newQuestion.trim().length < 10}
                  style={{
                    padding: "7px 16px", fontSize: 13, fontWeight: 600,
                    background: submitting || newQuestion.trim().length < 10 ? "#e2e8f0" : "#0E6163",
                    color: submitting || newQuestion.trim().length < 10 ? "#a0aec0" : "#fff",
                    border: "none", borderRadius: 8, cursor:
                      submitting || newQuestion.trim().length < 10 ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-ui,system-ui)",
                  }}>
                  {submitting ? "Posting…" : "Ask Question"}
                </button>
              </div>
            </div>
          </div>
          {error && (
            <div style={{ fontSize: 12, color: "#E53E3E", marginTop: 8 }}>⚠️ {error}</div>
          )}
        </div>
      ) : (
        <div style={{
          background: "#f0f9f9", border: "1px solid #0E616330",
          borderRadius: 12, padding: "14px 18px", marginBottom: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 14, color: "#4a5568" }}>Sign in to ask questions and contribute answers</span>
          <a href="/login" style={{
            padding: "7px 16px", background: "#0E6163", color: "#fff",
            borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>Sign in</a>
        </div>
      )}

      {/* Questions list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 80, borderRadius: 12,
              background: "linear-gradient(90deg,#f5f5f5 25%,#ebebeb 50%,#f5f5f5 75%)",
              backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
            }} />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#718096" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🙋</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>No questions yet</div>
          <div style={{ fontSize: 13 }}>Be the first to ask something about this lesson!</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {questions.map(q => {
            const userTier = q.user?.subscription_tier || q.user?.role || "free";
            return (
              <div key={q.id} style={{
                background: "#fff",
                border: `1px solid ${expandedId === q.id ? "#0E6163" : "#e2e8f0"}`,
                borderRadius: 12,
                overflow: "hidden",
                transition: "all 0.2s",
              }}>
                {/* Question row */}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    {/* Upvote */}
                    <button
                      onClick={() => handleUpvote("question", q.id)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        gap: 2, padding: "4px 8px",
                        background: q.userUpvoted ? "#f0f9f9" : "#f7fafc",
                        border: `1px solid ${q.userUpvoted ? "#0E6163" : "#e2e8f0"}`,
                        borderRadius: 8, cursor: "pointer",
                        fontFamily: "var(--font-ui,system-ui)",
                        minWidth: 40, flexShrink: 0,
                      }}>
                      <span style={{ fontSize: 14, color: q.userUpvoted ? "#0E6163" : "#a0aec0" }}>▲</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: q.userUpvoted ? "#0E6163" : "#718096" }}>
                        {q.upvote_count}
                      </span>
                    </button>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      {/* Badges */}
                      <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                        {q.is_pinned && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#D4A017", background: "#FFFFF0", padding: "1px 7px", borderRadius: 10, border: "1px solid #FBD38D" }}>
                            📌 Pinned
                          </span>
                        )}
                        {q.is_answered && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#1D9E75", background: "#F0FFF4", padding: "1px 7px", borderRadius: 10, border: "1px solid #C6F6D5" }}>
                            ✅ Answered
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: 14, color: "#1c2b3a", lineHeight: 1.6, margin: "0 0 8px" }}>
                        {q.question}
                      </p>

                      {/* Meta */}
                      <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 11, color: "#a0aec0" }}>
                        <span>{q.user?.full_name || "Anonymous"}</span>
                        {userTier !== "free" && TIER_BADGE[userTier]?.label && (
                          <span style={{
                            ...TIER_BADGE[userTier],
                            padding: "1px 6px", borderRadius: 8, fontWeight: 700, fontSize: 9,
                          }}>
                            {TIER_BADGE[userTier]?.label}
                          </span>
                        )}
                        <span>{timeAgo(q.created_at)}</span>
                        <button
                          onClick={() => handleExpand(q.id)}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#0E6163", fontSize: 11, fontWeight: 600,
                            fontFamily: "var(--font-ui,system-ui)", padding: 0,
                          }}>
                          {expandedId === q.id
                            ? "Hide answers"
                            : `${q.answer_count} answer${q.answer_count !== 1 ? "s" : ""} →`
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answers section */}
                {expandedId === q.id && (
                  <div style={{ borderTop: "1px solid #f0f0f0", background: "#fafafa" }}>
                    {/* Existing answers */}
                    {(q.answers || []).map(ans => {
                      const ansTier = ans.user?.subscription_tier || ans.user?.role || "free";
                      return (
                        <div key={ans.id} style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid #f0f0f0",
                          background: ans.is_accepted ? "#f0fff4" : ans.is_staff ? "#f0f9f9" : "#fafafa",
                          borderLeft: ans.is_accepted ? "3px solid #1D9E75" : ans.is_staff ? "3px solid #0E6163" : "3px solid transparent",
                        }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            {/* Answer upvote */}
                            <button
                              onClick={() => handleUpvote("answer", ans.id)}
                              style={{
                                display: "flex", flexDirection: "column", alignItems: "center",
                                gap: 2, padding: "3px 6px",
                                background: ans.userUpvoted ? "#f0f9f9" : "#fff",
                                border: `1px solid ${ans.userUpvoted ? "#0E6163" : "#e2e8f0"}`,
                                borderRadius: 6, cursor: "pointer",
                                fontFamily: "var(--font-ui,system-ui)",
                                minWidth: 36, flexShrink: 0,
                              }}>
                              <span style={{ fontSize: 11, color: ans.userUpvoted ? "#0E6163" : "#a0aec0" }}>▲</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: ans.userUpvoted ? "#0E6163" : "#718096" }}>
                                {ans.upvote_count}
                              </span>
                            </button>

                            <div style={{ flex: 1 }}>
                              {/* Answer badges */}
                              {(ans.is_accepted || ans.is_staff || ans.is_ai) && (
                                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                                  {ans.is_accepted && <span style={{ fontSize: 10, fontWeight: 700, color: "#1D9E75", background: "#F0FFF4", padding: "1px 7px", borderRadius: 10 }}>✅ Best Answer</span>}
                                  {ans.is_staff  && <span style={{ fontSize: 10, fontWeight: 700, color: "#0E6163", background: "#E6FFFA", padding: "1px 7px", borderRadius: 10 }}>👨‍🏫 FinanceHub Team</span>}
                                  {ans.is_ai     && <span style={{ fontSize: 10, fontWeight: 700, color: "#553C9A", background: "#FAF5FF", padding: "1px 7px", borderRadius: 10 }}>🤖 AI Answer</span>}
                                </div>
                              )}

                              <p style={{ fontSize: 13, color: "#1c2b3a", lineHeight: 1.7, margin: "0 0 8px", whiteSpace: "pre-wrap" }}>
                                {ans.answer}
                              </p>

                              <div style={{ fontSize: 11, color: "#a0aec0" }}>
                                {ans.user?.full_name || "Anonymous"} · {timeAgo(ans.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add answer */}
                    {currentUser && (
                      <div style={{ padding: "12px 16px" }}>
                        <textarea
                          value={answerText[q.id] || ""}
                          onChange={e => setAnswerText(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder="Write your answer… Be clear and use Indian examples where helpful."
                          rows={3}
                          style={{
                            width: "100%", padding: "9px 12px",
                            border: "1px solid #e2e8f0", borderRadius: 8,
                            fontSize: 13, fontFamily: "var(--font-ui,system-ui)",
                            resize: "vertical", outline: "none",
                            boxSizing: "border-box", background: "#fff",
                          }}
                        />
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                          <button
                            onClick={() => submitAnswer(q.id)}
                            disabled={answerLoading[q.id] || (answerText[q.id] || "").trim().length < 10}
                            style={{
                              padding: "7px 16px", fontSize: 13, fontWeight: 600,
                              background: answerLoading[q.id] || (answerText[q.id] || "").trim().length < 10 ? "#e2e8f0" : "#1D9E75",
                              color: answerLoading[q.id] || (answerText[q.id] || "").trim().length < 10 ? "#a0aec0" : "#fff",
                              border: "none", borderRadius: 8,
                              cursor: answerLoading[q.id] || (answerText[q.id] || "").trim().length < 10 ? "not-allowed" : "pointer",
                              fontFamily: "var(--font-ui,system-ui)",
                            }}>
                            {answerLoading[q.id] ? "Posting…" : "Post Answer"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Community guidelines */}
      <div style={{
        marginTop: 20, padding: "10px 14px",
        background: "#f7fafc", border: "1px solid #e2e8f0",
        borderRadius: 9, fontSize: 11, color: "#718096", lineHeight: 1.6,
      }}>
        📋 <strong>Community guidelines:</strong> Ask specific, finance-related questions.
        Answers should be educational only — not personalised financial advice.
        Be respectful and constructive. Misinformation will be removed.
      </div>
    </div>
  );
}
