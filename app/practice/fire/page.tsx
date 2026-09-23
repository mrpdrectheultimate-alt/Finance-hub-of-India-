"use client";

import { useState } from "react";
import Link from "next/link";

export default function FireCalculator() {
  const [currentAge, setCurrentAge] = useState(28);
  const [targetRetireAge, setTargetRetireAge] = useState(45);
  const [monthlyExpense, setMonthlyExpense] = useState(60000);
  const [currentSavings, setCurrentSavings] = useState(1500000);
  const [monthlyInvest, setMonthlyInvest] = useState(40000);
  const [expectedReturn, setExpectedReturn] = useState(12); // % return
  const [inflationRate, setInflationRate] = useState(6); // % inflation
  const [fireMultiplier, setFireMultiplier] = useState(25); // 25x annual expenses (4% rule)

  const yearsToRetire = Math.max(1, targetRetireAge - currentAge);
  const annualExpenseNow = monthlyExpense * 12;

  // Inflation adjusted future expense
  const futureAnnualExpense = annualExpenseNow * Math.pow(1 + inflationRate / 100, yearsToRetire);
  const targetFireCorpus = futureAnnualExpense * fireMultiplier;

  // Compound growth of current savings
  const grownSavings = currentSavings * Math.pow(1 + expectedReturn / 100, yearsToRetire);

  // Future value of monthly investment SIP
  const monthlyRate = expectedReturn / 100 / 12;
  const totalMonths = yearsToRetire * 12;
  const fvSip = monthlyInvest * (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));

  const projectedCorpus = grownSavings + fvSip;
  const fireReadinessPercent = Math.min(100, Math.round((projectedCorpus / targetFireCorpus) * 100));

  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/practice" style={s.backLink}>
          ← Back to Finance Labs
        </Link>

        <div style={s.header}>
          <h1 style={s.title}>🔥 FIRE Calculator (Financial Independence)</h1>
          <p style={s.sub}>
            Calculate your Lean, Standard, or Fat FIRE target corpus and discover if your monthly SIP will achieve early retirement.
          </p>
        </div>

        <div style={s.grid}>
          {/* Controls */}
          <div style={s.formCard}>
            <h3 style={s.cardTitle}>FIRE Parameters</h3>

            <div style={s.fieldRow}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Current Age: {currentAge}</label>
                <input
                  type="number"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  style={s.input}
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Target Early Age: {targetRetireAge}</label>
                <input
                  type="number"
                  value={targetRetireAge}
                  onChange={(e) => setTargetRetireAge(Number(e.target.value))}
                  style={s.input}
                />
              </div>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Current Monthly Expense (₹): {monthlyExpense.toLocaleString("en-IN")}</label>
              <input
                type="range"
                min={20000}
                max={300000}
                step={5000}
                value={monthlyExpense}
                onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                style={s.range}
              />
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Monthly Investment / SIP (₹): {monthlyInvest.toLocaleString("en-IN")}</label>
              <input
                type="range"
                min={5000}
                max={200000}
                step={5000}
                value={monthlyInvest}
                onChange={(e) => setMonthlyInvest(Number(e.target.value))}
                style={s.range}
              />
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Existing Portfolio / Savings (₹): {currentSavings.toLocaleString("en-IN")}</label>
              <input
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
                style={s.input}
              />
            </div>

            <div style={s.fieldRow}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Expected Return (%): {expectedReturn}%</label>
                <input
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  style={s.input}
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Inflation Rate (%): {inflationRate}%</label>
                <input
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  style={s.input}
                />
              </div>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>FIRE Type Target</label>
              <div style={s.btnGroup}>
                <button
                  type="button"
                  onClick={() => setFireMultiplier(20)}
                  style={{ ...s.typeBtn, ...(fireMultiplier === 20 ? s.typeBtnActive : {}) }}
                >
                  Lean (20x)
                </button>
                <button
                  type="button"
                  onClick={() => setFireMultiplier(25)}
                  style={{ ...s.typeBtn, ...(fireMultiplier === 25 ? s.typeBtnActive : {}) }}
                >
                  Standard (25x)
                </button>
                <button
                  type="button"
                  onClick={() => setFireMultiplier(30)}
                  style={{ ...s.typeBtn, ...(fireMultiplier === 30 ? s.typeBtnActive : {}) }}
                >
                  Fat (30x)
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={s.resultCard}>
            <h3 style={s.cardTitle}>FIRE Readiness Projection</h3>

            <div style={s.progressContainer}>
              <div style={s.progressHeader}>
                <span style={s.progressLabel}>Target Readiness</span>
                <span style={s.progressVal}>{fireReadinessPercent}%</span>
              </div>
              <div style={s.progressBarBg}>
                <div
                  style={{
                    ...s.progressBarFill,
                    width: `${fireReadinessPercent}%`,
                    background: fireReadinessPercent >= 100 ? "#059669" : "#3B82F6",
                  }}
                />
              </div>
            </div>

            <div style={s.metricBox}>
              <span style={s.metricLabel}>Target FIRE Corpus at Age {targetRetireAge}</span>
              <span style={s.metricVal}>₹{Math.round(targetFireCorpus).toLocaleString("en-IN")}</span>
              <span style={s.metricSub}>Adjusted for {inflationRate}% annual inflation over {yearsToRetire} years</span>
            </div>

            <div style={s.metricBox}>
              <span style={s.metricLabel}>Projected Corpus at Age {targetRetireAge}</span>
              <span style={s.metricVal}>₹{Math.round(projectedCorpus).toLocaleString("en-IN")}</span>
            </div>

            <div style={s.tipBox}>
              {fireReadinessPercent >= 100 ? (
                <span>🎉 <strong>On Track for Early Retirement!</strong> Your current SIP and savings will achieve FIRE by age {targetRetireAge}.</span>
              ) : (
                <span>💡 <strong>Gap Identified:</strong> Increase your monthly SIP by ₹{Math.round((targetFireCorpus - projectedCorpus) / (totalMonths * 1.5)).toLocaleString("en-IN")} to bridge the shortfall before age {targetRetireAge}.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F9FAFB",
    padding: "32px 16px 60px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  container: {
    maxWidth: "960px",
    margin: "0 auto",
  },
  backLink: {
    fontSize: "13px",
    color: "#6B7280",
    textDecoration: "none",
    marginBottom: "16px",
    display: "inline-block",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#111827",
    margin: "0 0 6px",
  },
  sub: {
    fontSize: "14px",
    color: "#4B5563",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "20px",
  },
  formCard: {
    background: "#FFFFFF",
    padding: "24px",
    borderRadius: "14px",
    border: "1px solid #E5E7EB",
  },
  resultCard: {
    background: "#FFFFFF",
    padding: "24px",
    borderRadius: "14px",
    border: "1px solid #E5E7EB",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: 750,
    color: "#111827",
    margin: "0 0 16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
  },
  fieldRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    fontSize: "14px",
  },
  range: {
    width: "100%",
  },
  btnGroup: {
    display: "flex",
    gap: "8px",
  },
  typeBtn: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    background: "#FFFFFF",
    fontSize: "12px",
    fontWeight: 600,
    color: "#4B5563",
    cursor: "pointer",
  },
  typeBtnActive: {
    background: "#111827",
    color: "#FFFFFF",
    borderColor: "#111827",
  },
  progressContainer: {
    marginBottom: "8px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "6px",
  },
  progressLabel: {
    color: "#374151",
  },
  progressVal: {
    color: "#1D4ED8",
  },
  progressBarBg: {
    height: "10px",
    background: "#E5E7EB",
    borderRadius: "6px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.4s ease",
  },
  metricBox: {
    background: "#F9FAFB",
    padding: "16px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  metricLabel: {
    fontSize: "12px",
    color: "#6B7280",
    fontWeight: 600,
  },
  metricVal: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#111827",
  },
  metricSub: {
    fontSize: "11px",
    color: "#9CA3AF",
  },
  tipBox: {
    background: "#EFF6FF",
    border: "1px solid #BFDBFE",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#1E40AF",
    lineHeight: "1.5",
  },
};
