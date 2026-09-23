"use client";

import { useState } from "react";
import Link from "next/link";

export default function InsuranceNeedsCalculator() {
  const [annualIncome, setAnnualIncome] = useState(1200000);
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [existingLifeCover, setExistingLifeCover] = useState(2000000);
  const [totalLiabilities, setTotalLiabilities] = useState(3000000); // e.g. home loan
  const [familyDependents, setFamilyDependents] = useState(2);
  const [existingHealthCover, setExistingHealthCover] = useState(500000);

  // HLV (Human Life Value) Calculation
  const workingYearsRemaining = Math.max(1, retirementAge - currentAge);
  const rawHLV = annualIncome * workingYearsRemaining * 0.7; // assuming 70% income replacement
  const requiredLifeCover = Math.max(0, rawHLV + totalLiabilities - existingLifeCover);
  const recommendedHealthCover = Math.max(0, 1000000 + familyDependents * 500000 - existingHealthCover);

  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/practice" style={s.backLink}>
          ← Back to Finance Labs
        </Link>

        <div style={s.header}>
          <h1 style={s.title}>🛡️ Insurance Needs & HLV Calculator</h1>
          <p style={s.sub}>
            Calculate your Human Life Value (HLV), identify life insurance coverage gaps, and evaluate health protection adequacy.
          </p>
        </div>

        <div style={s.grid}>
          {/* Controls Form */}
          <div style={s.formCard}>
            <h3 style={s.cardTitle}>Your Financial Profile</h3>

            <div style={s.fieldGroup}>
              <label style={s.label}>Annual Income (₹): {annualIncome.toLocaleString("en-IN")}</label>
              <input
                type="range"
                min={300000}
                max={5000000}
                step={50000}
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                style={s.range}
              />
            </div>

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
                <label style={s.label}>Retirement Age: {retirementAge}</label>
                <input
                  type="number"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(Number(e.target.value))}
                  style={s.input}
                />
              </div>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Existing Life Cover (₹): {existingLifeCover.toLocaleString("en-IN")}</label>
              <input
                type="number"
                value={existingLifeCover}
                onChange={(e) => setExistingLifeCover(Number(e.target.value))}
                style={s.input}
              />
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Total Liabilities / Loans (₹): {totalLiabilities.toLocaleString("en-IN")}</label>
              <input
                type="number"
                value={totalLiabilities}
                onChange={(e) => setTotalLiabilities(Number(e.target.value))}
                style={s.input}
              />
            </div>

            <div style={s.fieldRow}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Family Dependents: {familyDependents}</label>
                <input
                  type="number"
                  value={familyDependents}
                  onChange={(e) => setFamilyDependents(Number(e.target.value))}
                  style={s.input}
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Existing Health Cover (₹)</label>
                <input
                  type="number"
                  value={existingHealthCover}
                  onChange={(e) => setExistingHealthCover(Number(e.target.value))}
                  style={s.input}
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div style={s.resultCard}>
            <h3 style={s.cardTitle}>Coverage Gap Analysis</h3>

            <div style={s.metricBox}>
              <span style={s.metricLabel}>Recommended Pure Term Life Cover</span>
              <span style={s.metricVal}>₹{(rawHLV + totalLiabilities).toLocaleString("en-IN")}</span>
              <span style={s.metricSub}>10–15x Annual Income + Debt Obligations</span>
            </div>

            <div style={{ ...s.metricBox, background: requiredLifeCover > 0 ? "#FEF2F2" : "#ECFDF5" }}>
              <span style={s.metricLabel}>Life Insurance Cover Gap</span>
              <span style={{ ...s.metricVal, color: requiredLifeCover > 0 ? "#DC2626" : "#059669" }}>
                {requiredLifeCover > 0
                  ? `₹${requiredLifeCover.toLocaleString("en-IN")} Shortfall`
                  : "✓ Fully Protected"}
              </span>
            </div>

            <div style={s.metricBox}>
              <span style={s.metricLabel}>Health Insurance Gap</span>
              <span style={{ ...s.metricVal, color: recommendedHealthCover > 0 ? "#D97706" : "#059669" }}>
                {recommendedHealthCover > 0
                  ? `₹${recommendedHealthCover.toLocaleString("en-IN")} Additional Super Top-up Recommended`
                  : "✓ Adequate Health Cover"}
              </span>
            </div>

            <div style={s.tipBox}>
              <strong>💡 SEBI/IRDAI Rule of Thumb:</strong> Buy pure Term Insurance early to lock in low premiums. Avoid mixing insurance with investment (ULIPs/Endowment) for optimal net returns.
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
    padding: "12px",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#1E40AF",
    lineHeight: "1.5",
  },
};
