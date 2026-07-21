"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface QuizModalProps {
  quizId: string;
  quizTitle: string;
  passingScore: number;
  userId: string;
  lessonId: string;
  lessonTitle?: string;
  onClose: () => void;
  onPass: (score: number) => void;
}

type QuizState = "loading" | "intro" | "question" | "result";

type WeaknessAnalysis = {
  misconceptions?: string[];
  root_cause?: string;
  targeted_explanation?: string;
  memory_trick?: string;
  study_focus?: string[];
  encouragement?: string;
};

export default function QuizModal({ quizId, quizTitle, passingScore, userId, lessonId, lessonTitle = "Current lesson", onClose, onPass }: QuizModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [state, setState] = useState<QuizState>("loading");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [weaknessAnalysis, setWeaknessAnalysis] = useState<WeaknessAnalysis | null>(null);
  const [weaknessLoading, setWeaknessLoading] = useState(false);

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  useEffect(() => {
    if (!timerActive) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, timerActive]);

  const loadQuiz = async () => {
    const { data } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quizId).order("order_index");

    if (data) {
      setQuestions(data as Question[]);
      setAnswers(new Array(data.length).fill(null));
    }

    setState("intro");
  };

  const startQuiz = () => {
    if (!questions.length) return;

    setState("question");
    setTimeLeft(30);
    setTimerActive(true);
  };

  const handleTimeout = () => {
    if (revealed) return;

    const updated = [...answers];
    updated[current] = -1;
    setAnswers(updated);
    setRevealed(true);
    setTimerActive(false);
  };

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
  };

  const handleConfirm = () => {
    if (selected === null || revealed) return;

    const updated = [...answers];
    updated[current] = selected;
    setAnswers(updated);
    setRevealed(true);
    setTimerActive(false);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((value) => value + 1);
      setSelected(null);
      setRevealed(false);
      setTimeLeft(30);
      setTimerActive(true);
      return;
    }

    finishQuiz();
  };

  const finishQuiz = async () => {
    if (!questions.length) return;

    const correct = answers.filter((answer, index) => answer === questions[index]?.correct_index).length;
    const percentage = Math.round((correct / questions.length) * 100);
    const passed = percentage >= passingScore;

    setScore(percentage);
    setState("result");
    setWeaknessAnalysis(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setXpEarned(0);
      return;
    }

    const wrongAnswers = questions.flatMap((question, index) => {
      if (answers[index] === question.correct_index) return [];

      const selectedAnswer = answers[index];
      return [{
        question: question.question_text,
        userAnswer: selectedAnswer === null || selectedAnswer === -1 ? "No answer" : question.options[selectedAnswer] || "No answer",
        correctAnswer: question.options[question.correct_index],
        explanation: question.explanation,
      }];
    });

    const response = await fetch("/api/submit-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        lessonId,
        quizId,
        score: percentage,
        passed,
      }),
    });

    const result = await response.json() as {
      xp_earned?: number;
      badge_earned?: string | null;
      error?: string;
    };

    if (!response.ok) {
      setXpEarned(0);
      return;
    }

    setXpEarned(result.xp_earned || 0);
    setNewBadge(result.badge_earned || null);

    if (wrongAnswers.length > 0) {
      setWeaknessLoading(true);
      try {
        const weaknessResponse = await fetch("/api/ai-weakness-detector", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ mode: "quiz", wrongAnswers, quizTitle, lessonTitle }),
        });
        const weaknessResult = (await weaknessResponse.json()) as { analysis?: WeaknessAnalysis };
        if (weaknessResponse.ok && weaknessResult.analysis) {
          setWeaknessAnalysis(weaknessResult.analysis);
        }
      } catch (error) {
        console.error("Weakness analysis failed:", error);
      } finally {
        setWeaknessLoading(false);
      }
    }

  };

  const handleDone = () => {
    if (score >= passingScore) onPass(score);
    onClose();
  };

  const resetQuiz = () => {
    setCurrent(0);
    setAnswers(new Array(questions.length).fill(null));
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setXpEarned(0);
    setNewBadge(null);
    setWeaknessAnalysis(null);
    setWeaknessLoading(false);
    setState("intro");
  };

  const question = questions[current];
  const timerPct = (timeLeft / 30) * 100;
  const timerColor = timeLeft > 15 ? "#1D9E75" : timeLeft > 8 ? "#FAC775" : "#EF4444";

  return (
    <div style={s.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <div>
            <div style={s.modalEyebrow}>Quiz</div>
            <div style={s.modalTitle}>{quizTitle}</div>
          </div>
          <button onClick={onClose} style={s.closeBtn} type="button">
            x
          </button>
        </div>

        {state === "loading" ? (
          <div style={s.center}>
            <div style={s.loadDot} />
            <p style={{ color: "#888", fontSize: 14 }}>Loading questions...</p>
          </div>
        ) : null}

        {state === "intro" ? (
          <div style={s.introBody}>
            <div style={s.introIcon}>Quiz</div>
            <h2 style={s.introH2}>Ready to test yourself?</h2>
            {questions.length ? (
              <>
                <p style={s.introP}>
                  {questions.length} questions - 30 seconds each - passing score {passingScore}%
                </p>
                <div style={s.introBullets}>
                  {["Select the best answer for each question", "You have 30 seconds per question", "Earn up to 100 XP for a perfect score", "Explanations shown after each answer"].map((item) => (
                    <div key={item} style={s.introBullet}>
                      <span style={s.checkGreen}>✓</span> {item}
                    </div>
                  ))}
                </div>
                <button onClick={startQuiz} style={s.startBtn} type="button">
                  Start quiz →
                </button>
              </>
            ) : (
              <>
                <p style={s.introP}>No quiz questions are available yet.</p>
                <button onClick={onClose} style={s.startBtn} type="button">
                  Back to lesson
                </button>
              </>
            )}
          </div>
        ) : null}

        {state === "question" && question ? (
          <div style={s.questionBody}>
            <div style={s.quizMeta}>
              <span style={s.qCount}>
                {current + 1} / {questions.length}
              </span>
              <div style={s.timerWrap}>
                <div style={{ ...s.timerBar, width: `${timerPct}%`, background: timerColor }} />
              </div>
              <span style={{ ...s.timerNum, color: timerColor }}>{timeLeft}s</span>
            </div>

            <div style={s.dots}>
              {questions.map((item, index) => (
                <div key={item.id} style={{ ...s.dot, background: index < current ? "#1D9E75" : index === current ? "#0a0a0a" : "#eee" }} />
              ))}
            </div>

            <p style={s.questionText}>{question.question_text}</p>

            <div style={s.options}>
              {question.options.map((option, index) => {
                let background = "#fff";
                let border = "0.5px solid #e0e0e0";
                let color = "#333";

                if (revealed) {
                  if (index === question.correct_index) {
                    background = "#E1F5EE";
                    border = "1.5px solid #1D9E75";
                    color = "#0F6E56";
                  } else if (index === selected && selected !== question.correct_index) {
                    background = "#FEF2F2";
                    border = "1.5px solid #EF4444";
                    color = "#B91C1C";
                  }
                } else if (index === selected) {
                  background = "#F0FAF6";
                  border = "1.5px solid #1D9E75";
                  color = "#0F6E56";
                }

                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(index)}
                    disabled={revealed}
                    style={{ ...s.option, background, border, color }}
                    type="button"
                  >
                    <span style={s.optLetter}>{String.fromCharCode(65 + index)}</span>
                    <span style={{ flex: 1, textAlign: "left" }}>{option}</span>
                    {revealed && index === question.correct_index ? <span style={{ color: "#1D9E75", fontWeight: 700 }}>✓</span> : null}
                    {revealed && index === selected && selected !== question.correct_index ? <span style={{ color: "#EF4444", fontWeight: 700 }}>x</span> : null}
                  </button>
                );
              })}
            </div>

            {revealed ? (
              <div
                style={{
                  ...s.explanation,
                  background: answers[current] === question.correct_index ? "#E1F5EE" : "#FEF2F2",
                  border: `0.5px solid ${answers[current] === question.correct_index ? "#9FE1CB" : "#FCA5A5"}`,
                }}
              >
                <span style={{ fontWeight: 600, marginRight: 6 }}>{answers[current] === question.correct_index ? "Correct!" : "Not quite."}</span>
                {question.explanation}
              </div>
            ) : null}

            <div style={s.qActions}>
              {!revealed ? (
                <button onClick={handleConfirm} disabled={selected === null} style={{ ...s.confirmBtn, opacity: selected === null ? 0.4 : 1 }} type="button">
                  Confirm answer
                </button>
              ) : (
                <button onClick={handleNext} style={s.nextBtn} type="button">
                  {current < questions.length - 1 ? "Next question →" : "See results →"}
                </button>
              )}
            </div>
          </div>
        ) : null}

        {state === "result" ? (
          <div style={s.resultBody}>
            <div style={s.scoreCircle}>
              <div style={s.scoreNum}>{score}%</div>
              <div style={s.scoreLabel}>{score >= passingScore ? "Passed" : "Try again"}</div>
            </div>

            {score >= passingScore ? (
              <div style={s.passBox}>
                <div style={s.passTitle}>Well done!</div>
                <p style={s.passDesc}>You passed with {score}%. Keep the momentum going.</p>
              </div>
            ) : (
              <div style={s.failBox}>
                <div style={s.failTitle}>Not quite - you need {passingScore}% to pass.</div>
                <p style={s.failDesc}>Review the lesson and try again. You have got this.</p>
              </div>
            )}

            <div style={s.xpRow}>
              <span style={s.xpIcon}>XP</span>
              <span style={s.xpText}>+{xpEarned} XP earned</span>
            </div>

            {newBadge ? (
              <div style={s.badgeRow}>
                <span style={{ fontSize: 18 }}>Badge</span>
                <div>
                  <div style={s.badgeTitle}>Badge unlocked: {newBadge}</div>
                  <div style={s.badgeSub}>Perfect score - incredible!</div>
                </div>
              </div>
            ) : null}

            <div style={s.breakdown}>
              <div style={s.breakdownTitle}>Answer breakdown</div>
              {questions.map((item, index) => (
                <div key={item.id} style={s.breakdownRow}>
                  <span style={{ ...s.breakdownIcon, color: answers[index] === item.correct_index ? "#1D9E75" : "#EF4444" }}>
                    {answers[index] === item.correct_index ? "✓" : "x"}
                  </span>
                  <span style={s.breakdownQ}>{item.question_text}</span>
                </div>
              ))}
            </div>

            {weaknessLoading ? (
              <div style={s.aiAnalysisBox}>
                <div style={s.aiAnalysisTitle}>AI is analysing your missed concepts...</div>
                <div style={s.aiAnalysisText}>This usually takes a few seconds.</div>
              </div>
            ) : null}

            {weaknessAnalysis ? (
              <div style={s.aiAnalysisBox}>
                <div style={s.aiAnalysisTitle}>AI weakness analysis</div>
                {weaknessAnalysis.root_cause ? <div style={s.aiAnalysisText}><strong>Root cause:</strong> {weaknessAnalysis.root_cause}</div> : null}
                {weaknessAnalysis.targeted_explanation ? <div style={s.aiAnalysisText}>{weaknessAnalysis.targeted_explanation}</div> : null}
                {weaknessAnalysis.memory_trick ? <div style={s.aiMemoryBox}><strong>Memory trick:</strong> {weaknessAnalysis.memory_trick}</div> : null}
                {weaknessAnalysis.study_focus?.length ? (
                  <div style={s.aiFocusList}>
                    {weaknessAnalysis.study_focus.map((item) => (
                      <span key={item} style={s.aiFocusTag}>{item}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div style={s.resultActions}>
              {score < passingScore ? (
                <button onClick={resetQuiz} style={s.retryBtn} type="button">
                  Retry quiz
                </button>
              ) : null}
              <button onClick={handleDone} style={s.doneBtn} type="button">
                {score >= passingScore ? "Continue →" : "Review lesson"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20, backdropFilter: "blur(2px)" },
  modal: { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", fontFamily: "system-ui, -apple-system, sans-serif" },
  modalHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "0.5px solid #eee" },
  modalEyebrow: { fontSize: 11, fontWeight: 600, color: "#1D9E75", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 },
  modalTitle: { fontSize: 16, fontWeight: 600, color: "#0a0a0a" },
  closeBtn: { fontSize: 16, color: "#aaa", background: "none", border: "none", cursor: "pointer", padding: 4, lineHeight: 1 },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, gap: 12 },
  loadDot: { width: 32, height: 32, borderRadius: "50%", background: "#1D9E75", opacity: 0.6 },
  introBody: { padding: "28px 28px 32px", textAlign: "center" },
  introIcon: { fontSize: 28, marginBottom: 12, color: "#1D9E75", fontWeight: 800 },
  introH2: { fontSize: 20, fontWeight: 700, color: "#0a0a0a", margin: "0 0 8px" },
  introP: { fontSize: 14, color: "#666", margin: "0 0 24px" },
  introBullets: { display: "flex", flexDirection: "column", gap: 8, textAlign: "left", background: "#fafafa", borderRadius: 10, padding: "14px 18px", marginBottom: 24 },
  introBullet: { fontSize: 13, color: "#444", display: "flex", gap: 8, alignItems: "flex-start" },
  checkGreen: { color: "#1D9E75", fontWeight: 700, flexShrink: 0, marginTop: 1 },
  startBtn: { width: "100%", padding: "13px", fontSize: 15, fontWeight: 600, border: "none", borderRadius: 10, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  questionBody: { padding: "20px 24px 28px" },
  quizMeta: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
  qCount: { fontSize: 12, fontWeight: 600, color: "#888", flexShrink: 0 },
  timerWrap: { flex: 1, height: 4, background: "#eee", borderRadius: 2, overflow: "hidden" },
  timerBar: { height: "100%", borderRadius: 2, transition: "width 1s linear, background .3s" },
  timerNum: { fontSize: 12, fontWeight: 700, flexShrink: 0, minWidth: 24, textAlign: "right" },
  dots: { display: "flex", gap: 5, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: "50%", transition: "background .2s" },
  questionText: { fontSize: 17, fontWeight: 600, color: "#0a0a0a", lineHeight: 1.5, margin: "0 0 20px" },
  options: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 },
  option: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: "system-ui", transition: "all .15s", lineHeight: 1.4 },
  optLetter: { width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  explanation: { padding: "12px 16px", borderRadius: 10, fontSize: 14, color: "#333", lineHeight: 1.6, marginBottom: 16 },
  qActions: { display: "flex", justifyContent: "flex-end" },
  confirmBtn: { padding: "10px 22px", fontSize: 14, fontWeight: 600, border: "none", borderRadius: 8, background: "#0a0a0a", color: "#fff", cursor: "pointer", fontFamily: "system-ui", transition: "opacity .2s" },
  nextBtn: { padding: "10px 22px", fontSize: 14, fontWeight: 600, border: "none", borderRadius: 8, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  resultBody: { padding: "24px 28px 32px" },
  scoreCircle: { width: 120, height: 120, borderRadius: "50%", background: "#E1F5EE", border: "4px solid #1D9E75", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" },
  scoreNum: { fontSize: 28, fontWeight: 800, color: "#0F6E56", letterSpacing: 0 },
  scoreLabel: { fontSize: 12, color: "#1D9E75", fontWeight: 600 },
  passBox: { background: "#E1F5EE", border: "0.5px solid #9FE1CB", borderRadius: 10, padding: "14px 18px", marginBottom: 16, textAlign: "center" },
  passTitle: { fontWeight: 700, fontSize: 15, color: "#04342C", marginBottom: 4 },
  passDesc: { fontSize: 13, color: "#0F6E56", margin: 0 },
  failBox: { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 10, padding: "14px 18px", marginBottom: 16, textAlign: "center" },
  failTitle: { fontWeight: 700, fontSize: 15, color: "#991B1B", marginBottom: 4 },
  failDesc: { fontSize: 13, color: "#B91C1C", margin: 0 },
  xpRow: { display: "flex", alignItems: "center", gap: 10, background: "#FFF8E6", border: "0.5px solid #FAC775", borderRadius: 10, padding: "12px 16px", marginBottom: 12 },
  xpIcon: { fontSize: 12, fontWeight: 800, color: "#854F0B" },
  xpText: { fontWeight: 600, fontSize: 14, color: "#854F0B" },
  badgeRow: { display: "flex", alignItems: "center", gap: 12, background: "#EEEDFE", border: "0.5px solid #C7C4F5", borderRadius: 10, padding: "12px 16px", marginBottom: 16 },
  badgeTitle: { fontWeight: 600, fontSize: 14, color: "#3C3489" },
  badgeSub: { fontSize: 12, color: "#6B63C0" },
  breakdown: { background: "#fafafa", border: "0.5px solid #eee", borderRadius: 10, padding: "14px 16px", marginBottom: 20 },
  breakdownTitle: { fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 },
  breakdownRow: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, fontSize: 13 },
  breakdownIcon: { fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 1 },
  breakdownQ: { color: "#444", lineHeight: 1.5 },
  aiAnalysisBox: { background: "#F0FAF6", border: "0.5px solid #9FE1CB", borderRadius: 10, padding: "14px 16px", marginBottom: 16 },
  aiAnalysisTitle: { fontSize: 13, fontWeight: 700, color: "#04342C", marginBottom: 8 },
  aiAnalysisText: { fontSize: 13, color: "#0F6E56", lineHeight: 1.6, marginBottom: 8 },
  aiMemoryBox: { background: "#fff", border: "0.5px solid #C3EBD9", borderRadius: 8, padding: "9px 10px", fontSize: 13, color: "#04342C", lineHeight: 1.6, marginBottom: 10 },
  aiFocusList: { display: "flex", flexWrap: "wrap", gap: 6 },
  aiFocusTag: { background: "#E1F5EE", color: "#0F6E56", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999 },
  resultActions: { display: "flex", gap: 10 },
  retryBtn: { flex: 1, padding: "11px", fontSize: 14, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 9, background: "#fff", color: "#333", cursor: "pointer", fontFamily: "system-ui" },
  doneBtn: { flex: 1, padding: "11px", fontSize: 14, fontWeight: 600, border: "none", borderRadius: 9, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
};
