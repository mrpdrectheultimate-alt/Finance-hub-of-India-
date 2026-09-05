"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useState } from "react";

type Question = {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: string;
  topic_tag: string;
};

const EXAM_TYPES = [
  { id: "general", label: "General Finance", icon: "GF" },
  { id: "cfa", label: "CFA Level 1 Style", icon: "CFA" },
  { id: "frm", label: "FRM Style", icon: "FRM" },
  { id: "ca", label: "CA Exam Style", icon: "CA" },
];

const DIFFICULTIES = [
  { id: "easy", label: "Easy", color: "#1D9E75" },
  { id: "intermediate", label: "Intermediate", color: "#854F0B" },
  { id: "hard", label: "Hard", color: "#B91C1C" },
];

export default function AiExamGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [count, setCount] = useState(5);
  const [examType, setExamType] = useState("general");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"setup" | "exam" | "results">("setup");

  const generate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setGenerating(true);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("Please log in");
      setGenerating(false);
      return;
    }

    const res = await fetch("/api/ai-exam-generator", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ topic, difficulty, count, examType }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to generate exam");
      setGenerating(false);
      return;
    }

    setQuestions(data.questions || []);
    setAnswers({});
    setPhase("exam");
    setGenerating(false);
  };

  const submit = () => {
    const correct = questions.filter((question, index) => answers[index] === question.correct_index).length;
    setScore(Math.round((correct / questions.length) * 100));
    setPhase("results");
  };

  const reset = () => {
    setPhase("setup");
    setQuestions([]);
    setAnswers({});
  };

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  return (
    <div style={s.page}>
      <Link href="/dashboard" style={s.back}>
        Back to dashboard
      </Link>

      <div style={s.header}>
        <div style={s.icon}>AI</div>
        <h1 style={s.title}>AI Exam Generator</h1>
        <p style={s.sub}>Generate practice questions on any finance topic instantly.</p>
      </div>

      {phase === "setup" ? (
        <div style={s.setupCard}>
          <div style={s.field}>
            <label style={s.label}>Topic *</label>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. Compound interest, Options Greeks, Working capital management"
              style={s.input}
            />
            <div style={s.hint}>Be specific. &quot;P/E ratio interpretation&quot; is better than &quot;stocks&quot;.</div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Exam style</label>
            <div style={s.examTypeGrid}>
              {EXAM_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setExamType(type.id)}
                  style={{ ...s.examTypeBtn, ...(examType === type.id ? s.examTypeBtnActive : {}) }}
                  type="button"
                >
                  <span style={s.examTypeIcon}>{type.icon}</span>
                  <span style={s.examTypeLabel}>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Difficulty</label>
              <div style={s.diffRow}>
                {DIFFICULTIES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDifficulty(item.id)}
                    style={{
                      ...s.diffBtn,
                      ...(difficulty === item.id ? { background: item.color, color: "#fff", border: `1.5px solid ${item.color}` } : {}),
                    }}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ ...s.field, width: 140 }}>
              <label style={s.label}>Questions</label>
              <select value={count} onChange={(event) => setCount(Number(event.target.value))} style={s.select}>
                {[3, 5, 7, 10].map((number) => (
                  <option key={number} value={number}>
                    {number} questions
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? <div style={s.errorBox}>{error}</div> : null}

          <button onClick={generate} disabled={generating || !topic.trim()} style={{ ...s.generateBtn, opacity: generating || !topic.trim() ? 0.6 : 1 }} type="button">
            {generating ? "Generating your exam..." : `Generate ${count} questions`}
          </button>

          <p style={s.disclaimer}>AI-generated questions are for educational practice only. Verify with official sources for exam preparation.</p>
        </div>
      ) : null}

      {phase === "exam" ? (
        <div style={s.examWrap}>
          <div style={s.examHeader}>
            <div style={s.examMeta}>
              <span>{questions.length} questions</span>
              <span>{topic}</span>
              <span>{difficulty}</span>
            </div>
            <div style={s.progress}>
              {Object.keys(answers).length}/{questions.length} answered
            </div>
          </div>

          {questions.map((question, questionIndex) => {
            const userAnswer = answers[questionIndex];
            return (
              <div key={questionIndex} style={s.questionCard}>
                <div style={s.questionNum}>Q{questionIndex + 1}</div>
                <div style={s.questionText}>{question.question}</div>
                <div style={s.optionsList}>
                  {question.options.map((option, optionIndex) => {
                    const isSelected = userAnswer === optionIndex;
                    return (
                      <button
                        key={optionIndex}
                        onClick={() => setAnswers((previous) => ({ ...previous, [questionIndex]: optionIndex }))}
                        style={{ ...s.optionBtn, ...(isSelected ? s.optionSelected : {}) }}
                        type="button"
                      >
                        <span style={{ ...s.optionLetter, ...(isSelected ? s.optionLetterSelected : {}) }}>{String.fromCharCode(65 + optionIndex)}</span>
                        <span style={s.optionText}>{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div style={s.examActions}>
            <button onClick={reset} style={s.backBtn} type="button">
              New exam
            </button>
            <button onClick={submit} disabled={!allAnswered} style={{ ...s.submitBtn, opacity: allAnswered ? 1 : 0.4 }} type="button">
              Submit exam
            </button>
          </div>
        </div>
      ) : null}

      {phase === "results" ? (
        <div style={s.resultsWrap}>
          <div
            style={{
              ...s.scoreBanner,
              background: score >= 70 ? "#E1F5EE" : score >= 50 ? "#FAEEDA" : "#FEF2F2",
              border: `0.5px solid ${score >= 70 ? "#9FE1CB" : score >= 50 ? "#FAC775" : "#FCA5A5"}`,
            }}
          >
            <div style={{ ...s.scoreNum, color: score >= 70 ? "#0F6E56" : score >= 50 ? "#854F0B" : "#B91C1C" }}>{score}%</div>
            <div style={s.scoreLabel}>{score >= 80 ? "Excellent" : score >= 70 ? "Good pass" : score >= 50 ? "Getting there" : "Needs more practice"}</div>
            <div style={s.scoreSub}>
              {questions.filter((question, index) => answers[index] === question.correct_index).length} of {questions.length} correct
            </div>
          </div>

          {questions.map((question, questionIndex) => {
            const userAnswer = answers[questionIndex];
            const isCorrect = userAnswer === question.correct_index;
            return (
              <div key={questionIndex} style={{ ...s.reviewCard, borderLeft: `3px solid ${isCorrect ? "#1D9E75" : "#EF4444"}` }}>
                <div style={s.reviewQ}>
                  <span style={{ ...s.reviewIcon, color: isCorrect ? "#1D9E75" : "#EF4444" }}>{isCorrect ? "Correct" : "Wrong"}</span>
                  {question.question}
                </div>
                {!isCorrect && userAnswer !== undefined ? (
                  <div style={s.wrongAnswer}>
                    You chose: <strong>{question.options[userAnswer]}</strong>
                  </div>
                ) : null}
                <div style={s.correctAnswer}>
                  Correct: <strong>{question.options[question.correct_index]}</strong>
                </div>
                <div style={s.explanation}>{question.explanation}</div>
                {question.topic_tag ? <div style={s.topicTag}>{question.topic_tag}</div> : null}
              </div>
            );
          })}

          <div style={s.resultsActions}>
            <button onClick={reset} style={s.newExamBtn} type="button">
              Generate new exam
            </button>
            <button
              onClick={() => {
                setPhase("exam");
                setAnswers({});
              }}
              style={s.retryBtn}
              type="button"
            >
              Retry same exam
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui,-apple-system,sans-serif", padding: "24px 24px 60px", maxWidth: 720, margin: "0 auto" },
  back: { fontSize: 13, color: "#888", textDecoration: "none", display: "block", marginBottom: 20 },
  header: { textAlign: "center", marginBottom: 28 },
  icon: { width: 40, height: 40, borderRadius: 10, background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 14, fontWeight: 800 },
  title: { fontSize: 26, fontWeight: 700, letterSpacing: 0, color: "#0a0a0a", margin: "0 0 8px" },
  sub: { fontSize: 14, color: "#888", margin: 0 },
  setupCard: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 14, padding: 24 },
  field: { marginBottom: 18 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 7, letterSpacing: ".02em" },
  input: { width: "100%", padding: "10px 12px", fontSize: 14, border: "0.5px solid #ddd", borderRadius: 8, outline: "none", fontFamily: "system-ui", boxSizing: "border-box" as const },
  hint: { fontSize: 11, color: "#aaa", marginTop: 5 },
  examTypeGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 },
  examTypeBtn: { padding: "10px 8px", border: "0.5px solid #ddd", borderRadius: 9, background: "#fff", cursor: "pointer", fontFamily: "system-ui", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  examTypeBtnActive: { border: "1.5px solid #1D9E75", background: "#F0FAF6" },
  examTypeIcon: { fontSize: 11, fontWeight: 800, color: "#1D9E75" },
  examTypeLabel: { fontSize: 11, fontWeight: 500, color: "#333", textAlign: "center" },
  row: { display: "flex", gap: 16 },
  diffRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  diffBtn: { padding: "8px 14px", fontSize: 12, fontWeight: 500, border: "0.5px solid #ddd", borderRadius: 8, background: "#fff", color: "#555", cursor: "pointer", fontFamily: "system-ui" },
  select: { width: "100%", padding: "9px 12px", fontSize: 14, border: "0.5px solid #ddd", borderRadius: 8, outline: "none", fontFamily: "system-ui", background: "#fff" },
  errorBox: { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#B91C1C", marginBottom: 14 },
  generateBtn: { width: "100%", padding: 13, fontSize: 14, fontWeight: 600, border: "none", borderRadius: 10, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  disclaimer: { fontSize: 11, color: "#aaa", textAlign: "center", marginTop: 12 },
  examWrap: {},
  examHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "10px 14px", background: "#fff", borderRadius: 10, border: "0.5px solid #eee", gap: 12 },
  examMeta: { display: "flex", gap: 8, fontSize: 12, color: "#888", flexWrap: "wrap" },
  progress: { fontSize: 12, fontWeight: 600, color: "#1D9E75", whiteSpace: "nowrap" },
  questionCard: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "18px 20px", marginBottom: 14 },
  questionNum: { fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 },
  questionText: { fontSize: 15, fontWeight: 600, color: "#0a0a0a", lineHeight: 1.5, marginBottom: 14 },
  optionsList: { display: "flex", flexDirection: "column", gap: 7 },
  optionBtn: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "0.5px solid #e5e5e5", borderRadius: 9, background: "#fafafa", cursor: "pointer", textAlign: "left", fontFamily: "system-ui", transition: "all .15s" },
  optionSelected: { border: "1.5px solid #1D9E75", background: "#F0FAF6" },
  optionLetter: { width: 24, height: 24, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, color: "#888" },
  optionLetterSelected: { background: "#1D9E75", color: "#fff" },
  optionText: { fontSize: 13, color: "#333", lineHeight: 1.4 },
  examActions: { display: "flex", justifyContent: "space-between", marginTop: 20, gap: 10 },
  backBtn: { padding: "10px 20px", fontSize: 13, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 9, background: "#fff", color: "#555", cursor: "pointer", fontFamily: "system-ui" },
  submitBtn: { padding: "10px 24px", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 9, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui", transition: "opacity .2s" },
  resultsWrap: {},
  scoreBanner: { borderRadius: 14, padding: 24, textAlign: "center", marginBottom: 20 },
  scoreNum: { fontSize: 52, fontWeight: 800, letterSpacing: 0, marginBottom: 4 },
  scoreLabel: { fontSize: 18, fontWeight: 600, color: "#333", marginBottom: 4 },
  scoreSub: { fontSize: 13, color: "#888" },
  reviewCard: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 10, padding: "14px 16px", marginBottom: 10 },
  reviewQ: { fontSize: 14, fontWeight: 600, color: "#0a0a0a", marginBottom: 8, display: "flex", gap: 8, alignItems: "flex-start" },
  reviewIcon: { fontWeight: 700, flexShrink: 0, marginTop: 1 },
  wrongAnswer: { fontSize: 13, color: "#B91C1C", marginBottom: 4 },
  correctAnswer: { fontSize: 13, color: "#0F6E56", marginBottom: 8 },
  explanation: { fontSize: 13, color: "#555", lineHeight: 1.6, background: "#fafafa", borderRadius: 7, padding: "8px 10px" },
  topicTag: { fontSize: 10, color: "#aaa", background: "#f0f0f0", padding: "2px 8px", borderRadius: 10, display: "inline-block", marginTop: 6 },
  resultsActions: { display: "flex", gap: 10, marginTop: 20 },
  newExamBtn: { flex: 1, padding: 12, fontSize: 13, fontWeight: 600, border: "none", borderRadius: 9, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  retryBtn: { flex: 1, padding: 12, fontSize: 13, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 9, background: "#fff", color: "#555", cursor: "pointer", fontFamily: "system-ui" },
};
