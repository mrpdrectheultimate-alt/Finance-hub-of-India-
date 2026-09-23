"use client";

import { useState } from "react";
import Link from "next/link";

export default function FinancialStressTester() {
  const [liquidSavings, setLiquidSavings] = useState(300000); // Savings account + liquid MFs
  const [monthlyFixedExpenses, setMonthlyFixedExpenses] = useState(50000); // Rent, food, utilities
  const [monthlyEmi, setMonthlyEmi] = useState(25000); // Home/Car loan EMI
  const [hasHealthInsurance, setHasHealthInsurance] = useState(true);

  // Scenario 1: Job loss / income disruption
  const totalMonthlyCommitments = monthlyFixedExpenses + monthlyEmi;
  const survivalMonths = totalMonthlyCommitments > 0 ? liquidSavings / totalMonthlyCommitments : 0;

  // Scenario 2: Unexpected Medical Emergency (e.g. ₹5 Lakh bill)
  const medicalShockVal = 500000;
  const outOfPocketMedical = hasHealthInsurance ? 50000 : medicalShockVal; // 10% co-pay vs full cash
  const savingsPostMedical = Math.max(0, liquidSavings - outOfPocketMedical);
  const survivalPostMedical = totalMonthlyCommitments > 0 ? savingsPostMedical / totalMonthlyCommitments : 0;

  const getStressScore = () => {
    if (survivalMonths >= 6 && hasHealthInsurance) return { score: "A+ (Excellent Protection)", color: "#059669", bg: "#ECFDF5" };
    if (survivalMonths >= 3) return { score: "B (Moderate Liquidity)", color: "#D97706", bg: "#FEF3C7" };
    return { score: "C- (High Vulnerability)", color: "#DC2626", bg: "#FEF2F2" };
  };

  const stressStatus = getStressScore();

  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/practice" style={s.backLink}>
          ← Back to Finance Labs
        </Link>

        <div style={s.header}>
          <h1 style={s.title}>🚨 Financial Stress & Income Shock Tester</h1>
          <p style={s.sub}>
            Simulate real financial emergencies (job loss, medical hospitalizations, EMI rate hikes) to test your liquidity runway.
          </p>
        </div>

        <div style={s.grid}>
          {/* Controls */}
          <div style={s.formCard}>
            <h3 style={s.cardTitle}>Liquidity & Expense Inputs</h3>

            <div style={s.fieldGroup}>
              <label style={s.label}>Liquid Savings / Emergency Fund (₹): {liquidSavings.toLocaleString("en-IN")}</label>
              <input
                type="range"
                min={50000}
                max={1500000}
                step={25000}
                value={liquidSavings}
                onChange={(e) => setLiquidSavings(Number(e.target.value))}
                style={s.range}
              />
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Monthly Living Expenses (₹): {monthlyFixedExpenses.toLocaleString("en-IN")}</label>
              <input
                type="range"
                min={10000}
                max={200000}
                step={5000}
                value={monthlyFixedExpenses}
                onChange={(e) => setMonthlyFixedExpenses(Number(e.target.value))}
                style={s.range}
              />
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Monthly EMI Commitments (₹): {monthlyEmi.toLocaleString("en-IN")}</label>
              <input
                type="range"
                min={0}
                max={150000}
                step={5000}
                value={monthlyEmi}
                onChange={(e) => setMonthlyEmi(Number(e.target.value))}
                style={s.range}
              />
            </div>

            <div style={s.checkboxGroup}>
              <input
                type="checkbox"
                id="ins"
                checked={hasHealthInsurance}
                onChange={(e) => setHasHealthInsurance(e.target.checked)}
                style={s.checkbox}
              />
              <label htmlFor="ins" style={s.label}>I have comprehensive Health Insurance (Min ₹5 Lakhs)</label>
            </div>
          </div>

          {/* Stress Results */}
          <div style={s.resultCard}>
            <h3 style={s.cardTitle}>Stress Test Diagnostic</h3>

            <div style={{ ...s.metricBox, background: stressStatus.bg }}>
              <span style={s.metricLabel}>Financial Resilience Rating</span>
              <span style={{ ...s.metricVal, color: stressStatus.color }}>{stressStatus.score}</span>
            </div>

            <div style={s.metricBox}>
              <span style={s.metricLabel}>Scenario 1: Complete Job / Income Loss</span>
              <span style={s.metricVal}>{survivalMonths.toFixed(1)} Months Survival</span>
              <span style={s.metricSub}>Your ₹{liquidSavings.toLocaleString("en-IN")} buffer covers total monthly outflow of ₹{totalMonthlyCommitments.toLocaleString("en-IN")}</span>
            </div>

            <div style={s.metricBox}>
              <span style={s.metricLabel}>Scenario 2: ₹5 Lakh Emergency Medical Hospitalization</span>
              <span style={s.metricVal}>{survivalPostMedical.toFixed(1)} Months Remaining Survival</span>
              <span style={s.metricSub}>Out-of-pocket hospital cost: ₹{outOfPocketMedical.toLocaleString("en-IN")}</span>
            </div>

            <div style={s.tipBox}>
              <strong>💡 Financial Safety Protocol:</strong> Maintain at least 6 months of mandatory fixed expenses + EMIs in high-yield liquid funds or bank FDs to withstand severe macroeconomic downturns.
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
  checkboxGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
  },
  range: {
    width: "100%",
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
