"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Question = {
  id?: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  order_index: number;
};

type Lesson = { id: string; title: string };
type Quiz = { id: string; title: string; passing_score: number; lesson_id: string };

export default function AdminQuizBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.quizId as string;
  const isNew = quizId === "new";

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quiz, setQuiz] = useState<Quiz>({ id: "", title: "", passing_score: 70, lesson_id: "" });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeQ, setActiveQ] = useState<number | null>(null);

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const loadData = async () => {
    const { data: lessonData } = await supabase.from("lessons").select("id, title").eq("is_published", true).order("title");
    setLessons(lessonData || []);

    if (!isNew) {
      const [{ data: quizData }, { data: qData }] = await Promise.all([
        supabase.from("quizzes").select("*").eq("id", quizId).single(),
        supabase.from("quiz_questions").select("*").eq("quiz_id", quizId).order("order_index"),
      ]);

      if (quizData) setQuiz(quizData as Quiz);
      if (qData) setQuestions((qData as Question[]).map((question) => ({ ...question, options: question.options || ["", "", "", ""] })));
    }
  };

  const addQuestion = () => {
    const question: Question = {
      question_text: "",
      options: ["", "", "", ""],
      correct_index: 0,
      explanation: "",
      order_index: questions.length + 1,
    };
    setQuestions((prev) => [...prev, question]);
    setActiveQ(questions.length);
  };

  const updateQuestion = (idx: number, field: keyof Question, value: string | number) => {
    setQuestions((prev) => prev.map((question, index) => (index === idx ? { ...question, [field]: value } : question)));
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((question, index) => {
        if (index !== questionIndex) return question;
        const options = [...question.options];
        options[optionIndex] = value;
        return { ...question, options };
      }),
    );
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, index) => index !== idx).map((question, index) => ({ ...question, order_index: index + 1 })));
    setActiveQ(null);
  };

  const handleSave = async () => {
    if (!quiz.lesson_id) {
      setError("Please select a lesson");
      return;
    }
    if (!quiz.title.trim()) {
      setError("Quiz title is required");
      return;
    }
    if (!questions.length) {
      setError("Add at least one question");
      return;
    }
    if (questions.some((question) => !question.question_text.trim() || question.options.some((option) => !option.trim()))) {
      setError("All questions must have text and all 4 options filled");
      return;
    }

    setSaving(true);
    setError("");
    let finalQuizId = quizId;

    if (isNew) {
      const { data: newQuiz, error: insertError } = await supabase
        .from("quizzes")
        .insert({ title: quiz.title, passing_score: quiz.passing_score, lesson_id: quiz.lesson_id } as never)
        .select()
        .single();

      if (insertError || !newQuiz) {
        setError(insertError?.message || "Failed to create quiz");
        setSaving(false);
        return;
      }

      finalQuizId = (newQuiz as { id: string }).id;
    } else {
      const { error: updateError } = await supabase
        .from("quizzes")
        .update({ title: quiz.title, passing_score: quiz.passing_score, lesson_id: quiz.lesson_id } as never)
        .eq("id", quizId);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      await supabase.from("quiz_questions").delete().eq("quiz_id", finalQuizId);
    }

    const inserts = questions.map((question, index) => ({
      quiz_id: finalQuizId,
      question_text: question.question_text,
      options: question.options,
      correct_index: question.correct_index,
      explanation: question.explanation,
      order_index: index + 1,
    }));

    const { error: questionError } = await supabase.from("quiz_questions").insert(inserts as never);
    if (questionError) {
      setError(questionError.message);
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
    if (isNew) router.push(`/admin/quizzes/${finalQuizId}`);
  };

  const scoreColor = (score: number) => (score >= 80 ? "#1D9E75" : score >= 60 ? "#854F0B" : "#B91C1C");

  return (
    <div style={s.page}>
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoMark}>F</div>
          <div>
            <div style={s.logoText}>FinanceHub</div>
            <div style={s.adminTag}>Admin</div>
          </div>
        </div>
        <nav style={s.nav}>
          {[
            { icon: "OV", label: "Overview", href: "/admin" },
            { icon: "LS", label: "Lessons", href: "/admin/lessons" },
            { icon: "QZ", label: "Quizzes", href: "/admin/quizzes", active: true },
            { icon: "US", label: "Users", href: "/admin/users" },
            { icon: "AN", label: "Analytics", href: "/admin/analytics" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ ...s.navItem, ...(item.active ? s.navActive : {}) }}>
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <Link href="/dashboard" style={s.backToApp}>
          Back to app
        </Link>
      </aside>

      <main style={s.main}>
        <div style={s.topBar}>
          <div>
            <Link href="/admin/quizzes" style={s.backLink}>
              All quizzes
            </Link>
            <h1 style={s.title}>{isNew ? "New quiz" : "Edit quiz"}</h1>
          </div>
          <div style={s.headerActions}>
            {saved ? <span style={s.savedBadge}>Saved</span> : null}
            {error ? <span style={s.errorBadge}>{error}</span> : null}
            <button onClick={handleSave} disabled={saving} style={s.saveBtn} type="button">
              {saving ? "Saving..." : "Save quiz"}
            </button>
          </div>
        </div>

        <div style={s.layout}>
          <div style={s.settingsPanel}>
            <div style={s.panelTitle}>Quiz settings</div>

            <div style={s.field}>
              <label style={s.label}>Quiz title</label>
              <input
                value={quiz.title}
                onChange={(event) => setQuiz((current) => ({ ...current, title: event.target.value }))}
                placeholder="e.g. Compound Interest Check"
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Attached to lesson</label>
              <select
                value={quiz.lesson_id}
                onChange={(event) => setQuiz((current) => ({ ...current, lesson_id: event.target.value }))}
                style={s.select}
              >
                <option value="">Select a lesson...</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Passing score (%)</label>
              <div style={s.scoreRow}>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={quiz.passing_score}
                  onChange={(event) => setQuiz((current) => ({ ...current, passing_score: Number(event.target.value) }))}
                  style={{ flex: 1, accentColor: scoreColor(quiz.passing_score) }}
                />
                <span style={{ ...s.scoreNum, color: scoreColor(quiz.passing_score) }}>{quiz.passing_score}%</span>
              </div>
              <div style={s.scoreMeta}>
                {quiz.passing_score >= 80
                  ? "Strict, good for exam prep"
                  : quiz.passing_score >= 70
                    ? "Standard, recommended for most lessons"
                    : "Easy, good for beginners"}
              </div>
            </div>

            <div style={s.qOverview}>
              <div style={s.panelTitle}>Questions ({questions.length})</div>
              {questions.map((question, index) => (
                <div
                  key={index}
                  onClick={() => setActiveQ(activeQ === index ? null : index)}
                  style={{ ...s.qOverviewItem, ...(activeQ === index ? s.qOverviewItemActive : {}) }}
                >
                  <div style={s.qONum}>{index + 1}</div>
                  <div style={s.qOText}>{question.question_text || "Untitled question"}</div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      removeQuestion(index);
                    }}
                    style={s.qODelete}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              ))}
              <button onClick={addQuestion} style={s.addQBtn} type="button">
                Add question
              </button>
            </div>
          </div>

          <div style={s.questionEditor}>
            {activeQ === null ? (
              <div style={s.noQuestion}>
                <div style={{ fontWeight: 600, fontSize: 16, color: "#0a0a0a", marginBottom: 6 }}>
                  {questions.length === 0 ? "No questions yet" : "Select a question to edit"}
                </div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
                  {questions.length === 0 ? "Click Add question to get started" : "Click any question on the left to edit it"}
                </div>
                {questions.length === 0 ? (
                  <button onClick={addQuestion} style={s.addFirstBtn} type="button">
                    Add first question
                  </button>
                ) : null}
              </div>
            ) : (
              <div style={s.qEditWrap}>
                <div style={s.qEditHeader}>
                  <div style={s.qEditNum}>Question {activeQ + 1}</div>
                  <button onClick={() => removeQuestion(activeQ)} style={s.deleteQBtn} type="button">
                    Delete question
                  </button>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Question text *</label>
                  <textarea
                    value={questions[activeQ].question_text}
                    onChange={(event) => updateQuestion(activeQ, "question_text", event.target.value)}
                    placeholder="What is the 50/30/20 rule used for?"
                    rows={3}
                    style={s.textarea}
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Answer options. Click the circle to mark correct.</label>
                  <div style={s.optionsList}>
                    {questions[activeQ].options.map((option, optionIndex) => {
                      const isCorrect = questions[activeQ].correct_index === optionIndex;
                      return (
                        <div key={optionIndex} style={{ ...s.optionRow, ...(isCorrect ? s.optionRowCorrect : {}) }}>
                          <button
                            onClick={() => updateQuestion(activeQ, "correct_index", optionIndex)}
                            style={{
                              ...s.correctToggle,
                              background: isCorrect ? "#1D9E75" : "#eee",
                              color: isCorrect ? "#fff" : "#aaa",
                            }}
                            type="button"
                          >
                            {String.fromCharCode(65 + optionIndex)}
                          </button>
                          <input
                            value={option}
                            onChange={(event) => updateOption(activeQ, optionIndex, event.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            style={{ ...s.optionInput, borderColor: isCorrect ? "#1D9E75" : "#ddd" }}
                          />
                          {isCorrect ? <span style={s.correctLabel}>Correct</span> : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Explanation shown after answer is revealed</label>
                  <textarea
                    value={questions[activeQ].explanation}
                    onChange={(event) => updateQuestion(activeQ, "explanation", event.target.value)}
                    placeholder="Explain why the correct answer is right."
                    rows={3}
                    style={s.textarea}
                  />
                </div>

                <div style={s.qPreview}>
                  <div style={s.qPreviewTitle}>Preview</div>
                  <div style={s.qPreviewText}>{questions[activeQ].question_text || "Question text..."}</div>
                  <div style={s.qPreviewOptions}>
                    {questions[activeQ].options.map((option, index) => (
                      <div key={index} style={{ ...s.qPreviewOpt, ...(index === questions[activeQ].correct_index ? s.qPreviewCorrect : {}) }}>
                        <span style={s.qPreviewLetter}>{String.fromCharCode(65 + index)}</span>
                        <span>{option || `Option ${String.fromCharCode(65 + index)}`}</span>
                        {index === questions[activeQ].correct_index ? <span style={{ color: "#1D9E75", marginLeft: "auto" }}>Correct</span> : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={s.qNav}>
                  <button disabled={activeQ === 0} onClick={() => setActiveQ(activeQ - 1)} style={{ ...s.qNavBtn, opacity: activeQ === 0 ? 0.3 : 1 }} type="button">
                    Prev
                  </button>
                  <span style={{ fontSize: 12, color: "#aaa" }}>
                    {activeQ + 1} / {questions.length}
                  </span>
                  <button
                    disabled={activeQ === questions.length - 1}
                    onClick={() => setActiveQ(activeQ + 1)}
                    style={{ ...s.qNavBtn, opacity: activeQ === questions.length - 1 ? 0.3 : 1 }}
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui,-apple-system,sans-serif" },
  sidebar: { width: 200, background: "#0a0a0a", display: "flex", flexDirection: "column", padding: "20px 0", position: "fixed", height: "100vh" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "0 16px 24px" },
  logoMark: { width: 28, height: 28, background: "#1D9E75", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 },
  logoText: { fontWeight: 600, fontSize: 14, color: "#fff" },
  adminTag: { fontSize: 10, color: "#1D9E75", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" },
  nav: { display: "flex", flexDirection: "column", gap: 2, padding: "0 8px", flex: 1 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, fontSize: 13, color: "#aaa", textDecoration: "none" },
  navActive: { background: "rgba(255,255,255,0.08)", color: "#fff" },
  navIcon: { width: 24, color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: ".04em" },
  backToApp: { fontSize: 12, color: "#666", textDecoration: "none", padding: "12px 16px", borderTop: "0.5px solid #222" },
  main: { marginLeft: 200, flex: 1, padding: "24px 28px" },
  topBar: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
  backLink: { fontSize: 12, color: "#888", textDecoration: "none", display: "block", marginBottom: 6 },
  title: { fontSize: 22, fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: "-0.4px" },
  headerActions: { display: "flex", alignItems: "center", gap: 8 },
  savedBadge: { fontSize: 12, color: "#0F6E56", background: "#E1F5EE", padding: "5px 12px", borderRadius: 20, fontWeight: 600 },
  errorBadge: { fontSize: 12, color: "#B91C1C", background: "#FEF2F2", padding: "5px 12px", borderRadius: 20, maxWidth: 300 },
  saveBtn: { padding: "9px 18px", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 9, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  layout: { display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, alignItems: "start" },
  settingsPanel: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: 20, position: "sticky", top: 16 },
  panelTitle: { fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 14 },
  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 },
  input: { width: "100%", padding: "9px 12px", fontSize: 13, border: "0.5px solid #ddd", borderRadius: 8, outline: "none", fontFamily: "system-ui", boxSizing: "border-box" },
  select: { width: "100%", padding: "9px 12px", fontSize: 13, border: "0.5px solid #ddd", borderRadius: 8, outline: "none", fontFamily: "system-ui", background: "#fff" },
  scoreRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 4 },
  scoreNum: { fontWeight: 700, fontSize: 18, minWidth: 40, textAlign: "right" },
  scoreMeta: { fontSize: 11, color: "#aaa" },
  qOverview: { borderTop: "0.5px solid #eee", paddingTop: 14, marginTop: 4 },
  qOverviewItem: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 4, border: "0.5px solid transparent", transition: "all .15s" },
  qOverviewItemActive: { background: "#F0FAF6", border: "0.5px solid #9FE1CB" },
  qONum: { width: 20, height: 20, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 },
  qOText: { flex: 1, fontSize: 12, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  qODelete: { fontSize: 11, color: "#B91C1C", background: "none", border: "none", cursor: "pointer", padding: "0 2px" },
  addQBtn: { width: "100%", padding: 9, fontSize: 13, fontWeight: 600, border: "1.5px dashed #ddd", borderRadius: 8, background: "transparent", color: "#888", cursor: "pointer", marginTop: 6, fontFamily: "system-ui" },
  questionEditor: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, minHeight: 500 },
  noQuestion: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, textAlign: "center", padding: 40 },
  addFirstBtn: { padding: "11px 22px", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 9, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  qEditWrap: { padding: "22px 24px" },
  qEditHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  qEditNum: { fontWeight: 700, fontSize: 16, color: "#0a0a0a" },
  deleteQBtn: { fontSize: 12, color: "#B91C1C", background: "#FEF2F2", border: "none", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontFamily: "system-ui" },
  textarea: { width: "100%", padding: "10px 12px", fontSize: 13, border: "0.5px solid #ddd", borderRadius: 8, outline: "none", fontFamily: "system-ui", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" },
  optionsList: { display: "flex", flexDirection: "column", gap: 8 },
  optionRow: { display: "flex", alignItems: "center", gap: 8, padding: 8, borderRadius: 9, border: "0.5px solid transparent", transition: "all .15s" },
  optionRowCorrect: { background: "#F0FAF6", border: "0.5px solid #9FE1CB" },
  correctToggle: { width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: "system-ui" },
  optionInput: { flex: 1, padding: "8px 12px", fontSize: 13, border: "0.5px solid", borderRadius: 8, outline: "none", fontFamily: "system-ui" },
  correctLabel: { fontSize: 11, color: "#1D9E75", fontWeight: 600, flexShrink: 0 },
  qPreview: { background: "#fafafa", border: "0.5px solid #eee", borderRadius: 10, padding: "14px 16px", marginBottom: 16 },
  qPreviewTitle: { fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 },
  qPreviewText: { fontWeight: 600, fontSize: 15, color: "#0a0a0a", marginBottom: 10, lineHeight: 1.5 },
  qPreviewOptions: { display: "flex", flexDirection: "column", gap: 6 },
  qPreviewOpt: { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: "0.5px solid #eee", fontSize: 13, background: "#fff" },
  qPreviewCorrect: { border: "0.5px solid #9FE1CB", background: "#E1F5EE" },
  qPreviewLetter: { width: 20, height: 20, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 },
  qNav: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "0.5px solid #eee" },
  qNavBtn: { padding: "7px 14px", fontSize: 12, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer", fontFamily: "system-ui", transition: "opacity .2s" },
};
