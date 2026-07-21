"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STEPS = [
  {
    key: "who",
    q: "Who are you?",
    hint: "This helps us set your starting level",
    options: [
      { label: "School or college student", icon: "🎒", value: "student" },
      { label: "Working professional", icon: "💼", value: "professional" },
      { label: "Trader or investor", icon: "📊", value: "trader" },
      { label: "Founder or business owner", icon: "🚀", value: "founder" },
      { label: "Preparing for finance exams", icon: "📝", value: "exam" },
    ],
  },
  {
    key: "goal",
    q: "What's your main goal?",
    hint: "Pick the one that matters most right now",
    options: [
      { label: "Stop living paycheck to paycheck", icon: "💸", value: "budgeting" },
      { label: "Start investing confidently", icon: "📈", value: "investing" },
      { label: "Learn trading from scratch", icon: "🕯️", value: "trading" },
      { label: "Understand my business finances", icon: "🏢", value: "business" },
      { label: "Pass a finance certification", icon: "🏆", value: "exam" },
    ],
  },
  {
    key: "level",
    q: "How much do you already know?",
    hint: "Be honest. There's no wrong answer.",
    options: [
      { label: "Complete beginner: start from zero", icon: "🌱", value: "beginner" },
      { label: "I know the basics", icon: "📗", value: "basics" },
      { label: "Intermediate: I've started learning", icon: "📘", value: "intermediate" },
      { label: "Advanced: I want depth", icon: "📙", value: "advanced" },
    ],
  },
];

const TRACK_MAP: Record<string, { track_slug: string; track_title: string; level: string; reason: string }> = {
  student: {
    track_slug: "personal-finance",
    track_title: "Personal Finance",
    level: "Absolute Beginner",
    reason: "We'll start with money basics: saving, bank accounts, compound interest, and budgeting.",
  },
  professional: {
    track_slug: "personal-finance",
    track_title: "Personal Finance",
    level: "Working Adult",
    reason: "Taxes, EMIs, insurance, and mutual funds: the essentials for financial independence.",
  },
  trader: {
    track_slug: "trading",
    track_title: "Trading",
    level: "Markets 101",
    reason: "We'll start with how markets work, then move to charts, risk, and strategies.",
  },
  founder: {
    track_slug: "corporate-finance",
    track_title: "Corporate and Founder Finance",
    level: "Business Basics",
    reason: "Unit economics, cap tables, fundraising, and financial statements for builders.",
  },
  exam: {
    track_slug: "personal-finance",
    track_title: "Exam Prep",
    level: "CFA Level 1 Overview",
    reason: "Structured prep with concept lessons, mock tests, and question banks.",
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const current = STEPS[step];
  const rec = TRACK_MAP[answers.who || "professional"];
  const isResult = step >= STEPS.length;

  const handleSelect = (value: string) => {
    if (!current) return;

    const updated = { ...answers, [current.key]: value };
    setAnswers(updated);

    setTimeout(() => {
      setStep((currentStep) => (currentStep < STEPS.length - 1 ? currentStep + 1 : STEPS.length));
    }, 180);
  };

  const handleFinish = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: track } = await supabase.from("tracks").select("id").eq("slug", rec.track_slug).single();

    await supabase
      .from("profiles")
      .update({
        goal: answers.goal,
        current_track_id: track?.id || null,
        onboarding_done: true,
      })
      .eq("id", user.id);

    router.push("/dashboard");
  };

  const progress = ((Math.min(step, STEPS.length - 1) + 1) / STEPS.length) * 100;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoRow}>
            <div style={styles.logoMark}>F</div>
            <span style={styles.logoText}>FinanceHub</span>
          </div>
          <div style={styles.stepCount}>
            {Math.min(step + 1, STEPS.length)} of {STEPS.length}
          </div>
        </div>

        <div style={styles.progressBg}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>

        {!isResult && current ? (
          <div style={{ marginTop: 36 }}>
            <p style={styles.hint}>{current.hint}</p>
            <h2 style={styles.question}>{current.q}</h2>
            <div style={styles.options}>
              {current.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  style={{
                    ...styles.option,
                    ...(answers[current.key] === option.value ? styles.optionActive : {}),
                  }}
                  type="button"
                >
                  <span style={styles.optionIcon}>{option.icon}</span>
                  <span style={styles.optionLabel}>{option.label}</span>
                  {answers[current.key] === option.value ? <span style={styles.check}>✓</span> : null}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 36 }}>
            <div style={styles.resultBadge}>✨ Your path is ready</div>
            <h2 style={styles.resultTrack}>{rec.track_title}</h2>
            <p style={styles.resultLevel}>
              Starting level: <strong>{rec.level}</strong>
            </p>
            <p style={styles.resultReason}>{rec.reason}</p>

            <div style={styles.summaryBox}>
              {Object.entries(answers).map(([key, value]) => (
                <div key={key} style={styles.summaryRow}>
                  <span style={styles.summaryKey}>{key}</span>
                  <span style={styles.summaryVal}>{value}</span>
                </div>
              ))}
            </div>

            <button
              disabled={saving}
              onClick={handleFinish}
              style={{ ...styles.startBtn, opacity: saving ? 0.7 : 1 }}
              type="button"
            >
              {saving ? "Setting up your dashboard..." : "Start learning →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#fafafa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "#fff",
    border: "0.5px solid #e5e5e5",
    borderRadius: 16,
    padding: "28px 32px 36px",
    width: "100%",
    maxWidth: 480,
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  logoRow: { display: "flex", alignItems: "center", gap: 8 },
  logoMark: {
    width: 26,
    height: 26,
    background: "#1D9E75",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
  },
  logoText: { fontWeight: 600, fontSize: 15, letterSpacing: 0 },
  stepCount: { fontSize: 12, color: "#aaa", fontWeight: 500 },
  progressBg: { height: 3, background: "#eee", borderRadius: 2, marginTop: 16, overflow: "hidden" },
  progressFill: { height: "100%", background: "#1D9E75", borderRadius: 2, transition: "width 0.4s ease" },
  hint: {
    fontSize: 12,
    color: "#aaa",
    fontWeight: 500,
    letterSpacing: ".04em",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  question: { fontSize: 20, fontWeight: 700, color: "#0a0a0a", letterSpacing: 0, margin: "0 0 20px" },
  options: { display: "flex", flexDirection: "column", gap: 8 },
  option: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    border: "0.5px solid #e0e0e0",
    borderRadius: 10,
    background: "#fff",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "system-ui",
    transition: "all .15s",
  },
  optionActive: { border: "1.5px solid #1D9E75", background: "#F0FAF6" },
  optionIcon: { fontSize: 20, flexShrink: 0 },
  optionLabel: { fontSize: 14, color: "#333", flex: 1 },
  check: { color: "#1D9E75", fontWeight: 700, fontSize: 14 },
  resultBadge: {
    display: "inline-block",
    background: "#E1F5EE",
    color: "#0F6E56",
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: 20,
    marginBottom: 14,
  },
  resultTrack: { fontSize: 24, fontWeight: 700, color: "#0a0a0a", letterSpacing: 0, margin: "0 0 6px" },
  resultLevel: { fontSize: 14, color: "#555", margin: "0 0 12px" },
  resultReason: { fontSize: 14, color: "#444", lineHeight: 1.6, margin: "0 0 20px" },
  summaryBox: { background: "#fafafa", border: "0.5px solid #eee", borderRadius: 10, padding: "14px 16px", marginBottom: 20 },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: "#555" },
  summaryKey: { color: "#aaa", textTransform: "capitalize", fontWeight: 500 },
  summaryVal: { color: "#333", fontWeight: 500, textTransform: "capitalize" },
  startBtn: {
    width: "100%",
    padding: "13px",
    fontSize: 15,
    fontWeight: 600,
    border: "none",
    borderRadius: 10,
    background: "#1D9E75",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "system-ui",
  },
};
