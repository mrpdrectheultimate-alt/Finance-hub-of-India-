"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  label: string;
  type: "need" | "want" | "saving";
  min: number;
  max: number;
  recommended: number;
  value: number;
  tip: string;
};

const SALARY = 50000;

const DEFAULT_CATEGORIES: Category[] = [
  { id: "rent", label: "Rent / Housing", type: "need", min: 0, max: 25000, recommended: 15000, value: 15000, tip: "Ideally keep rent under 30% of income" },
  { id: "food", label: "Groceries & Food", type: "need", min: 2000, max: 10000, recommended: 5000, value: 5000, tip: "Cook at home to save Rs. 2,000-3,000/month" },
  { id: "transport", label: "Transport", type: "need", min: 500, max: 8000, recommended: 3000, value: 3000, tip: "Public transport can beat a car loan for beginners" },
  { id: "utilities", label: "Bills & Utilities", type: "need", min: 500, max: 5000, recommended: 2000, value: 2000, tip: "Electricity, internet, and phone combined" },
  { id: "dining", label: "Dining Out", type: "want", min: 0, max: 8000, recommended: 2000, value: 2000, tip: "Every Rs. 500 dinner out is Rs. 500 less invested" },
  { id: "entertain", label: "Entertainment", type: "want", min: 0, max: 5000, recommended: 1500, value: 1500, tip: "Streaming, events, hobbies - be intentional" },
  { id: "shopping", label: "Shopping / Clothes", type: "want", min: 0, max: 8000, recommended: 2000, value: 2000, tip: "Buy what you need, not what is on sale" },
  { id: "emergency", label: "Emergency Fund", type: "saving", min: 0, max: 15000, recommended: 5000, value: 5000, tip: "Build to 3-6 months of expenses first" },
  { id: "invest", label: "Investments / SIP", type: "saving", min: 0, max: 20000, recommended: 5000, value: 5000, tip: "Even Rs. 500/month in an index fund compounds powerfully" },
  { id: "goals", label: "Goals / Travel", type: "saving", min: 0, max: 10000, recommended: 3500, value: 3500, tip: "Save specifically for what matters to you" },
];

type GameState = "playing" | "result";

const formatMoney = (amount: number) => `Rs. ${amount.toLocaleString("en-IN")}`;

export default function BudgetSimulator() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [state, setState] = useState<GameState>("playing");
  const [score, setScore] = useState(0);
  const [badgeEarned, setBadgeEarned] = useState(false);

  const total = categories.reduce((sum, category) => sum + category.value, 0);
  const remaining = SALARY - total;
  const isOver = remaining < 0;

  const needs = categories.filter((category) => category.type === "need").reduce((sum, category) => sum + category.value, 0);
  const wants = categories.filter((category) => category.type === "want").reduce((sum, category) => sum + category.value, 0);
  const savings = categories.filter((category) => category.type === "saving").reduce((sum, category) => sum + category.value, 0);

  const needsPct = Math.round((needs / SALARY) * 100);
  const wantsPct = Math.round((wants / SALARY) * 100);
  const savingsPct = Math.round((savings / SALARY) * 100);

  const updateCategory = (id: string, value: number) => {
    setCategories((previous) => previous.map((category) => (category.id === id ? { ...category, value } : category)));
  };

  const calculateScore = () => {
    let value = 0;

    if (needsPct >= 40 && needsPct <= 55) value += 30;
    else if (needsPct <= 60) value += 15;

    if (wantsPct >= 20 && wantsPct <= 35) value += 20;
    else if (wantsPct <= 40) value += 10;

    if (savingsPct >= 20) value += 30;
    else if (savingsPct >= 10) value += 15;

    const emergencyFund = categories.find((category) => category.id === "emergency");
    if ((emergencyFund?.value || 0) >= 2000) value += 10;

    const investment = categories.find((category) => category.id === "invest");
    if ((investment?.value || 0) >= 1000) value += 10;

    return Math.min(value, 100);
  };

  const handleSubmit = async () => {
    if (isOver) return;

    const finalScore = calculateScore();
    setScore(finalScore);
    setState("result");

    if (finalScore >= 70) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) return;

        const response = await fetch("/api/award-xp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ activity: "budget_sim", score: finalScore }),
        });

        const result = await response.json() as { badge_earned?: string | null };
        if (response.ok && result.badge_earned) setBadgeEarned(true);
      }
    }
  };

  const handleReset = () => {
    setCategories(DEFAULT_CATEGORIES);
    setState("playing");
    setScore(0);
    setBadgeEarned(false);
  };

  const getScoreGrade = (value: number) => {
    if (value >= 90) return { grade: "A+", label: "Financial genius", color: "#1D9E75", bg: "#E1F5EE" };
    if (value >= 75) return { grade: "A", label: "Excellent budgeter", color: "#185FA5", bg: "#E6F1FB" };
    if (value >= 60) return { grade: "B", label: "Good start", color: "#854F0B", bg: "#FAEEDA" };
    return { grade: "C", label: "Room to improve", color: "#712B13", bg: "#FAECE7" };
  };

  const typeColor = { need: "#185FA5", want: "#854F0B", saving: "#1D9E75" };
  const typeBg = { need: "#E6F1FB", want: "#FAEEDA", saving: "#E1F5EE" };

  if (state === "result") {
    const grade = getScoreGrade(score);

    return (
      <div style={s.page}>
        <div style={s.inner}>
          <Link href="/practice" style={s.back}>
            ← Practice zone
          </Link>
          <div style={s.resultCard}>
            <div style={{ ...s.scoreCircle, background: grade.bg, border: `3px solid ${grade.color}` }}>
              <div style={{ ...s.scoreGrade, color: grade.color }}>{grade.grade}</div>
              <div style={{ fontSize: 13, color: grade.color, fontWeight: 600 }}>{score}/100</div>
            </div>
            <h2 style={s.resultTitle}>{grade.label}</h2>
            <p style={s.resultSub}>Here is how your budget compared to the 50/30/20 rule:</p>

            <div style={s.breakdown}>
              {[
                { label: "Needs", pct: needsPct, target: "40-55%", ok: needsPct >= 40 && needsPct <= 55, color: typeColor.need },
                { label: "Wants", pct: wantsPct, target: "20-35%", ok: wantsPct >= 20 && wantsPct <= 35, color: typeColor.want },
                { label: "Savings", pct: savingsPct, target: "20%+", ok: savingsPct >= 20, color: typeColor.saving },
              ].map((row) => (
                <div key={row.label} style={s.breakdownRow}>
                  <div style={s.breakdownLabel}>{row.label}</div>
                  <div style={s.breakdownBar}>
                    <div style={{ ...s.breakdownFill, width: `${Math.min(row.pct, 100)}%`, background: row.color }} />
                  </div>
                  <div style={{ ...s.breakdownPct, color: row.color }}>{row.pct}%</div>
                  <div style={{ ...s.breakdownStatus, color: row.ok ? "#1D9E75" : "#EF4444" }}>{row.ok ? "Good" : `Target: ${row.target}`}</div>
                </div>
              ))}
            </div>

            {badgeEarned ? (
              <div style={s.badgeBox}>
                <div>
                  <div style={{ fontWeight: 600, color: "#0F6E56", fontSize: 14 }}>Badge unlocked: Budget Master</div>
                  <div style={{ fontSize: 12, color: "#1D9E75" }}>You scored 70+ on the budget simulator.</div>
                </div>
              </div>
            ) : null}

            <div style={s.feedbackBox}>
              <div style={s.feedbackTitle}>Your personalised tips</div>
              {savingsPct < 20 ? (
                <p style={s.feedbackItem}>
                  Your savings rate is {savingsPct}%. Aim for at least 20%. Cut wants by {formatMoney(Math.round(((20 - savingsPct) * SALARY) / 100))} to hit the target.
                </p>
              ) : null}
              {needsPct > 55 ? <p style={s.feedbackItem}>Needs are eating {needsPct}% of your income. If rent is the culprit, consider a cheaper area or a flatmate.</p> : null}
              {wantsPct > 35 ? <p style={s.feedbackItem}>Wants at {wantsPct}% is above the 30% guideline. Dining out and shopping are usually the easiest to trim.</p> : null}
              {savingsPct >= 20 && needsPct <= 55 && wantsPct <= 35 ? (
                <p style={s.feedbackItem}>Your budget is well structured. Make sure your SIP is actually set up as an auto-debit.</p>
              ) : null}
            </div>

            <div style={s.resultActions}>
              <button onClick={handleReset} style={s.retryBtn} type="button">
                Try different allocation
              </button>
              <Link href="/dashboard" style={s.doneBtn}>
                Back to dashboard →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <Link href="/practice" style={s.back}>
          ← Practice zone
        </Link>

        <div style={s.gameHeader}>
          <div>
            <div style={s.gameEyebrow}>Simulator</div>
            <h1 style={s.gameTitle}>Budget Simulator</h1>
            <p style={s.gameSub}>Allocate your Rs. 50,000 monthly salary. Hit the 50/30/20 rule to score 100.</p>
          </div>
        </div>

        <div style={s.totalBar}>
          <div>
            <div style={s.totalSpent}>{formatMoney(total)} allocated</div>
            <div style={{ ...s.totalRemaining, color: isOver ? "#EF4444" : "#1D9E75" }}>
              {isOver ? `${formatMoney(Math.abs(remaining))} over budget` : `${formatMoney(remaining)} remaining`}
            </div>
          </div>
          <div style={{ ...s.totalPill, background: isOver ? "#FEF2F2" : "#E1F5EE", color: isOver ? "#B91C1C" : "#0F6E56" }}>{isOver ? "Over" : "On track"}</div>
        </div>

        <div style={s.overallBar}>
          <div style={{ ...s.overallFill, width: `${Math.min((total / SALARY) * 100, 100)}%`, background: isOver ? "#EF4444" : "#1D9E75" }} />
        </div>

        <div style={s.summary}>
          {[
            { label: "Needs", pct: needsPct, target: 50, color: typeColor.need, bg: typeBg.need },
            { label: "Wants", pct: wantsPct, target: 30, color: typeColor.want, bg: typeBg.want },
            { label: "Savings", pct: savingsPct, target: 20, color: typeColor.saving, bg: typeBg.saving },
          ].map((row) => (
            <div key={row.label} style={{ ...s.summaryCard, background: row.bg }}>
              <div style={{ ...s.summaryPct, color: row.color }}>{row.pct}%</div>
              <div style={{ ...s.summaryLabel, color: row.color }}>{row.label}</div>
              <div style={{ ...s.summaryTarget, color: row.color }}>Target: {row.target}%</div>
            </div>
          ))}
        </div>

        <div style={s.categories}>
          {(["need", "want", "saving"] as const).map((type) => (
            <div key={type} style={s.categoryGroup}>
              <div style={s.groupLabel}>
                <span style={{ ...s.groupTag, background: typeBg[type], color: typeColor[type] }}>{type === "need" ? "Needs" : type === "want" ? "Wants" : "Savings"}</span>
                <span style={s.groupTotal}>{formatMoney(categories.filter((category) => category.type === type).reduce((sum, category) => sum + category.value, 0))}</span>
              </div>
              {categories
                .filter((category) => category.type === type)
                .map((category) => (
                  <div key={category.id} style={s.categoryRow}>
                    <div style={s.catLeft}>
                      <div>
                        <div style={s.catLabel}>{category.label}</div>
                        <div style={s.catTip}>{category.tip}</div>
                      </div>
                    </div>
                    <div style={s.catRight}>
                      <div style={s.catValue}>{formatMoney(category.value)}</div>
                      <input type="range" min={category.min} max={category.max} step={500} value={category.value} onChange={(event) => updateCategory(category.id, Number(event.target.value))} style={s.slider} />
                      <div style={s.sliderLabels}>
                        <span>{formatMoney(category.min)}</span>
                        <span style={{ color: "#1D9E75", fontSize: 10 }}>Rec: {formatMoney(category.recommended)}</span>
                        <span>{formatMoney(category.max)}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>

        <button onClick={handleSubmit} disabled={isOver} style={{ ...s.submitBtn, opacity: isOver ? 0.4 : 1 }} type="button">
          {isOver ? "Fix your budget first" : "Submit and see my score →"}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui, -apple-system, sans-serif", padding: "24px 20px 60px" },
  inner: { maxWidth: 680, margin: "0 auto" },
  back: { fontSize: 13, color: "#888", textDecoration: "none", display: "block", marginBottom: 16 },
  gameHeader: { marginBottom: 20 },
  gameEyebrow: { fontSize: 12, fontWeight: 600, color: "#1D9E75", letterSpacing: ".04em", marginBottom: 4 },
  gameTitle: { fontSize: 26, fontWeight: 700, letterSpacing: 0, margin: "0 0 6px", color: "#0a0a0a" },
  gameSub: { fontSize: 14, color: "#666", margin: 0 },
  totalBar: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "14px 18px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" },
  totalSpent: { fontWeight: 700, fontSize: 18, color: "#0a0a0a", letterSpacing: 0 },
  totalRemaining: { fontSize: 13, fontWeight: 500, marginTop: 2 },
  totalPill: { fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20 },
  overallBar: { height: 6, background: "#eee", borderRadius: 3, overflow: "hidden", marginBottom: 16 },
  overallFill: { height: "100%", borderRadius: 3, transition: "width .2s, background .2s" },
  summary: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 },
  summaryCard: { borderRadius: 10, padding: "12px", textAlign: "center" },
  summaryPct: { fontSize: 22, fontWeight: 800, letterSpacing: 0 },
  summaryLabel: { fontSize: 12, fontWeight: 600, margin: "2px 0" },
  summaryTarget: { fontSize: 10, opacity: 0.7 },
  categories: { display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 },
  categoryGroup: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, overflow: "hidden" },
  groupLabel: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "0.5px solid #f0f0f0" },
  groupTag: { fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 },
  groupTotal: { fontWeight: 700, fontSize: 15, color: "#0a0a0a" },
  categoryRow: { display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderBottom: "0.5px solid #f8f8f8" },
  catLeft: { display: "flex", gap: 10, flex: 1, minWidth: 0 },
  catLabel: { fontSize: 13, fontWeight: 600, color: "#0a0a0a", marginBottom: 2 },
  catTip: { fontSize: 11, color: "#aaa", lineHeight: 1.4 },
  catRight: { width: 180, flexShrink: 0 },
  catValue: { fontSize: 16, fontWeight: 700, color: "#0a0a0a", textAlign: "right", marginBottom: 6, letterSpacing: 0 },
  slider: { width: "100%", accentColor: "#1D9E75", cursor: "pointer" },
  sliderLabels: { display: "flex", justifyContent: "space-between", fontSize: 9, color: "#ccc", marginTop: 2 },
  submitBtn: { width: "100%", padding: "14px", fontSize: 15, fontWeight: 600, border: "none", borderRadius: 10, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui", transition: "opacity .2s" },
  resultCard: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 16, padding: "32px 28px" },
  scoreCircle: { width: 110, height: 110, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" },
  scoreGrade: { fontSize: 32, fontWeight: 800, letterSpacing: 0 },
  resultTitle: { fontSize: 20, fontWeight: 700, color: "#0a0a0a", textAlign: "center", margin: "0 0 6px" },
  resultSub: { fontSize: 14, color: "#666", textAlign: "center", margin: "0 0 20px" },
  breakdown: { marginBottom: 20 },
  breakdownRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  breakdownLabel: { width: 60, fontSize: 12, fontWeight: 600, color: "#333" },
  breakdownBar: { flex: 1, height: 8, background: "#eee", borderRadius: 4, overflow: "hidden" },
  breakdownFill: { height: "100%", borderRadius: 4, transition: "width .5s" },
  breakdownPct: { width: 36, fontSize: 13, fontWeight: 700, textAlign: "right" },
  breakdownStatus: { width: 100, fontSize: 11, textAlign: "right" },
  badgeBox: { display: "flex", alignItems: "center", gap: 12, background: "#E1F5EE", border: "0.5px solid #9FE1CB", borderRadius: 10, padding: "12px 16px", marginBottom: 16 },
  feedbackBox: { background: "#fafafa", border: "0.5px solid #eee", borderRadius: 10, padding: "14px 16px", marginBottom: 20 },
  feedbackTitle: { fontWeight: 600, fontSize: 13, marginBottom: 8, color: "#333" },
  feedbackItem: { fontSize: 13, color: "#444", lineHeight: 1.6, margin: "0 0 8px" },
  resultActions: { display: "flex", gap: 10 },
  retryBtn: { flex: 1, padding: "11px", fontSize: 13, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 9, background: "#fff", color: "#333", cursor: "pointer", fontFamily: "system-ui" },
  doneBtn: { flex: 1, padding: "11px", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 9, background: "#1D9E75", color: "#fff", textDecoration: "none", textAlign: "center" },
};
