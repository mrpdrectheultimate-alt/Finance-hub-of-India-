"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Onboarding Flow
// Guides new users from signup to first lesson in < 60 seconds
// app/onboarding/page.tsx
// ============================================================

type Step = "goal" | "level" | "time" | "ready";

const GOALS = [
  { id: "personal", icon: "💰", label: "Manage my personal finances", track: "personal-finance", desc: "Budget, save, invest, insure" },
  { id: "investing", icon: "📈", label: "Learn to invest in stocks", track: "trading-markets", desc: "Equity, mutual funds, markets" },
  { id: "trading", icon: "📊", label: "Understand technical analysis", track: "technical-analysis", desc: "Charts, indicators, strategies" },
  { id: "crypto", icon: "₿", label: "Explore crypto and DeFi", track: "crypto-defi", desc: "Bitcoin, Ethereum, Web3" },
  { id: "corporate", icon: "🏢", label: "Learn corporate finance", track: "corporate-finance", desc: "Valuation, M&A, accounting" },
  { id: "behavioral", icon: "🧠", label: "Understand my money mindset", track: "behavioral-finance", desc: "Psychology, biases, habits" },
  { id: "forex", icon: "💱", label: "Learn forex and currencies", track: "forex-currency", desc: "Pairs, pips, trading" },
  { id: "explore", icon: "🗺️", label: "Just exploring everything", track: "personal-finance", desc: "I'll decide as I go" },
];

const LEVELS = [
  { id: "beginner", icon: "🌱", label: "Complete beginner", desc: "I know almost nothing about finance" },
  { id: "some", icon: "📗", label: "Know the basics", desc: "I understand budgeting and saving" },
  { id: "intermediate", icon: "📘", label: "Intermediate learner", desc: "I invest and follow markets" },
  { id: "advanced", icon: "🎓", label: "Advanced — fill gaps", desc: "I want to deepen specific areas" },
];

const TIMES = [
  { id: "5", icon: "⚡", label: "5 min/day", desc: "Quick daily habit" },
  { id: "15", icon: "📖", label: "15 min/day", desc: "Steady learning pace" },
  { id: "30", icon: "🚀", label: "30 min/day", desc: "Serious commitment" },
  { id: "60", icon: "🏆", label: "1 hour/day", desc: "Fast-track mastery" },
];

const TRACK_COLORS: Record<string, string> = {
  "personal-finance": "#1D9E75",
  "trading-markets": "#185FA5",
  "technical-analysis": "#854F0B",
  "crypto-defi": "#7C3AED",
  "corporate-finance": "#B91C1C",
  "behavioral-finance": "#D39A21",
  "forex-currency": "#0E6163",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("goal");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [goalData, setGoalData] = useState<(typeof GOALS)[0] | null>(null);

  const accentColor = goalData ? TRACK_COLORS[goalData.track] || "#0E6163" : "#0E6163";

  const handleGoal = (g: (typeof GOALS)[0]) => {
    setGoal(g.id);
    setGoalData(g);
    setTimeout(() => setStep("level"), 300);
  };

  const handleLevel = (l: string) => {
    setLevel(l);
    setTimeout(() => setStep("time"), 300);
  };

  const handleTime = (t: string) => {
    setTime(t);
    setTimeout(() => setStep("ready"), 300);
  };

  const handleStart = async () => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Save onboarding preferences to profile
      await supabase
        .from("profiles")
        .update({
          onboarding_goal: goal,
          onboarding_level: level,
          onboarding_time: time,
          primary_track: goalData?.track,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", user.id);

      // Track onboarding completion
      await supabase.from("user_xp_log").insert({
        user_id: user.id,
        xp_amount: 50,
        action: "onboarding_complete",
        description: "Completed onboarding — Welcome to FinanceHub!",
      } as any);

      // Update XP safely via RPC if available
      try {
        await (supabase as any).rpc("add_xp", { p_user_id: user.id, p_xp: 50 });
      } catch {
        // Fallback or non-critical error handling
      }

      router.push(`/dashboard?welcome=true&track=${goalData?.track}`);
    } catch (err) {
      console.error("Onboarding save error:", err);
      router.push("/dashboard");
    }
  };

  const stepProgress = { goal: 25, level: 50, time: 75, ready: 100 }[step];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f7f4ee 0%, #eef7f7 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "var(--font-ui, system-ui)",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: accentColor, letterSpacing: "-0.5px" }}>
          📚 FinanceHub
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 560, marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "#718096" }}>
            {step === "goal"
              ? "Step 1 of 3"
              : step === "level"
                ? "Step 2 of 3"
                : step === "time"
                  ? "Step 3 of 3"
                  : "Ready!"}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: accentColor }}>{stepProgress}%</span>
        </div>
        <div style={{ height: 6, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${stepProgress}%`,
              background: accentColor,
              borderRadius: 999,
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          padding: "32px 28px",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* STEP 1: Goal */}
        {step === "goal" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1c2b3a", marginBottom: 6, letterSpacing: "-0.3px" }}>
              What brings you to FinanceHub?
            </h1>
            <p style={{ fontSize: 14, color: "#718096", marginBottom: 24, lineHeight: 1.6 }}>
              We&apos;ll personalise your learning path based on your goal.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleGoal(g)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "14px 14px",
                    border: "1.5px solid",
                    borderColor: goal === g.id ? accentColor : "#e2e8f0",
                    background: goal === g.id ? accentColor + "10" : "#fff",
                    borderRadius: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    fontFamily: "var(--font-ui, system-ui)",
                  }}
                  type="button"
                >
                  <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{g.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a", lineHeight: 1.3, marginBottom: 2 }}>
                      {g.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#718096" }}>{g.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2: Level */}
        {step === "level" && (
          <>
            <button
              onClick={() => setStep("goal")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#718096",
                fontSize: 13,
                marginBottom: 16,
                padding: 0,
                fontFamily: "var(--font-ui, system-ui)",
              }}
              type="button"
            >
              ← Back
            </button>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1c2b3a", marginBottom: 6, letterSpacing: "-0.3px" }}>
              What&apos;s your current level?
            </h1>
            <p style={{ fontSize: 14, color: "#718096", marginBottom: 24, lineHeight: 1.6 }}>
              We&apos;ll recommend the right starting point for you.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLevel(l.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 18px",
                    border: "1.5px solid",
                    borderColor: level === l.id ? accentColor : "#e2e8f0",
                    background: level === l.id ? accentColor + "10" : "#fff",
                    borderRadius: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    fontFamily: "var(--font-ui, system-ui)",
                  }}
                  type="button"
                >
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{l.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1c2b3a", marginBottom: 2 }}>{l.label}</div>
                    <div style={{ fontSize: 13, color: "#718096" }}>{l.desc}</div>
                  </div>
                  {level === l.id && <span style={{ color: accentColor, fontSize: 18, flexShrink: 0 }}>✓</span>}
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 3: Time commitment */}
        {step === "time" && (
          <>
            <button
              onClick={() => setStep("level")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#718096",
                fontSize: 13,
                marginBottom: 16,
                padding: 0,
                fontFamily: "var(--font-ui, system-ui)",
              }}
              type="button"
            >
              ← Back
            </button>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1c2b3a", marginBottom: 6, letterSpacing: "-0.3px" }}>
              How much time can you commit daily?
            </h1>
            <p style={{ fontSize: 14, color: "#718096", marginBottom: 24, lineHeight: 1.6 }}>
              Even 5 minutes a day builds lasting financial knowledge.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {TIMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTime(t.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "20px 16px",
                    border: "1.5px solid",
                    borderColor: time === t.id ? accentColor : "#e2e8f0",
                    background: time === t.id ? accentColor + "10" : "#fff",
                    borderRadius: 12,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.15s",
                    fontFamily: "var(--font-ui, system-ui)",
                  }}
                  type="button"
                >
                  <span style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</span>
                  <div style={{ fontSize: 15, fontWeight: 700, color: time === t.id ? accentColor : "#1c2b3a", marginBottom: 4 }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#718096" }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 4: Ready */}
        {step === "ready" && goalData && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16, lineHeight: 1 }}>{goalData.icon}</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1c2b3a", marginBottom: 10, letterSpacing: "-0.4px" }}>
              Your path is ready! 🎉
            </h1>
            <p style={{ fontSize: 15, color: "#4a5568", lineHeight: 1.7, marginBottom: 24 }}>
              We&apos;ve set up your personalised learning path in{" "}
              <strong style={{ color: accentColor }}>{goalData.label}</strong>. You&apos;ll start with the fundamentals and progress at your pace.
            </p>

            {/* Path preview */}
            <div style={{ background: "#f8f9fa", borderRadius: 12, padding: "16px 18px", marginBottom: 24, textAlign: "left" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>
                Your learning path
              </div>
              {[
                { icon: "📖", text: "Start with the fundamentals", done: false },
                { icon: "🎯", text: "Practice with quizzes after each lesson", done: false },
                { icon: "🧮", text: "Apply knowledge in Finance Lab simulators", done: false },
                { icon: "🤖", text: "Ask AI Mentor anything you're unsure about", done: false },
                { icon: "🏆", text: "Earn your first certificate", done: false },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: "#4a5568" }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Bonus XP callout */}
            <div
              style={{
                background: accentColor + "12",
                border: `1px solid ${accentColor}30`,
                borderRadius: 10,
                padding: "10px 16px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>⭐</span>
              <div style={{ fontSize: 13, color: "#4a5568" }}>
                You&apos;ve earned <strong style={{ color: accentColor }}>50 XP</strong> just for setting up your profile!
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={saving}
              style={{
                width: "100%",
                padding: "15px 28px",
                background: saving ? "#ccc" : accentColor,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "var(--font-ui, system-ui)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: saving ? "none" : `0 6px 20px ${accentColor}40`,
                transition: "all 0.2s",
              }}
              type="button"
            >
              {saving ? (
                <>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Setting up your dashboard…
                </>
              ) : (
                <>Start learning — your first lesson awaits 🚀</>
              )}
            </button>

            <p style={{ fontSize: 11, color: "#a0aec0", marginTop: 12 }}>
              You can change your preferences anytime in Settings
            </p>
          </div>
        )}
      </div>

      {/* Trust indicators */}
      {step !== "ready" && (
        <div style={{ marginTop: 24, display: "flex", gap: 20, fontSize: 12, color: "#a0aec0" }}>
          <span>✓ Free forever for basic access</span>
          <span>✓ No credit card required</span>
          <span>✓ Cancel anytime</span>
        </div>
      )}
    </div>
  );
}
