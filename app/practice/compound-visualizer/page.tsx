"use client";

import { useState } from "react";
import Link from "next/link";

export default function CompoundVisualizer() {
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [monthlySip, setMonthlySip] = useState(10000);
  const [annualStepUp, setAnnualStepUp] = useState(10); // 10% step-up each year
  const [expectedReturn, setExpectedReturn] = useState(12); // 12% annual return
  const [durationYears, setDurationYears] = useState(20);

  // Calculate year-by-year compounding with step-up SIP
  let totalInvested = initialInvestment;
  let currentBalance = initialInvestment;
  let currentMonthlySip = monthlySip;

  const yearlyBreakdown = [];

  for (let year = 1; year <= durationYears; year++) {
    for (let month = 1; month <= 12; month++) {
      currentBalance += currentMonthlySip;
      totalInvested += currentMonthlySip;
      currentBalance *= 1 + expectedReturn / 100 / 12;
    }
    yearlyBreakdown.push({
      year,
      invested: Math.round(totalInvested),
      balance: Math.round(currentBalance),
      wealthGained: Math.round(currentBalance - totalInvested),
    });
    // Step-up SIP for next year
    currentMonthlySip *= 1 + annualStepUp / 100;
  }

  const finalBalance = currentBalance;
  const totalGain = finalBalance - totalInvested;

  // Cost of Delay calculation (delaying by 5 years)
  let delayedBalance = 0;
  let delayedInvested = 0;
  let delayedSip = monthlySip;
  const delayedYears = Math.max(1, durationYears - 5);

  for (let year = 1; year <= delayedYears; year++) {
    for (let month = 1; month <= 12; month++) {
      delayedBalance += delayedSip;
      delayedInvested += delayedSip;
      delayedBalance *= 1 + expectedReturn / 100 / 12;
    }
    delayedSip *= 1 + annualStepUp / 100;
  }
  const costOf5YrDelay = finalBalance - delayedBalance;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/practice" style={s.backLink}>
          ← Back to Finance Labs
        </Link>

        <div style={s.header}>
          <h1 style={s.title}>📈 Step-Up SIP & Power of Compounding</h1>
          <p style={s.sub}>
            Visualize how compounding exponentially accelerates wealth growth when you step up your monthly SIP with annual salary hikes.
          </p>
        </div>

        <div style={s.grid}>
          {/* Controls */}
          <div style={s.formCard}>
            <h3 style={s.cardTitle}>Investment Controls</h3>

            <div style={s.fieldGroup}>
              <label style={s.label}>Initial Lumpsum (₹): {initialInvestment.toLocaleString("en-IN")}</label>
              <input
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                style={s.input}
              />
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Starting Monthly SIP (₹): {monthlySip.toLocaleString("en-IN")}</label>
              <input
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={monthlySip}
                onChange={(e) => setMonthlySip(Number(e.target.value))}
                style={s.range}
              />
            </div>

            <div style={s.fieldRow}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Annual Step-Up (%): {annualStepUp}%</label>
                <input
                  type="number"
                  value={annualStepUp}
                  onChange={(e) => setAnnualStepUp(Number(e.target.value))}
                  style={s.input}
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Expected Return (%): {expectedReturn}%</label>
                <input
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  style={s.input}
                />
              </div>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Duration (Years): {durationYears} Years</label>
              <input
                type="range"
                min={5}
                max={35}
                value={durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value))}
                style={s.range}
              />
            </div>
          </div>

          {/* Results Summary & Breakdown */}
          <div style={s.resultCard}>
            <h3 style={s.cardTitle}>Compounding Summary</h3>

            <div style={s.metricBox}>
              <span style={s.metricLabel}>Total Future Portfolio Balance</span>
              <span style={s.metricVal}>₹{Math.round(finalBalance).toLocaleString("en-IN")}</span>
              <span style={s.metricSub}>Total Invested: ₹{Math.round(totalInvested).toLocaleString("en-IN")} | Pure Wealth Gain: ₹{Math.round(totalGain).toLocaleString("en-IN")}</span>
            </div>

            <div style={{ ...s.metricBox, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <span style={{ ...s.metricLabel, color: "#92400E" }}>Cost of 5-Year Delay</span>
              <span style={{ ...s.metricVal, color: "#B45309" }}>₹{Math.round(costOf5YrDelay).toLocaleString("en-IN")} Loss</span>
              <span style={s.metricSub}>Delaying your investment by 5 years reduces your final wealth by this amount!</span>
            </div>

            {/* Growth Table */}
            <div style={s.tableContainer}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Year</th>
                    <th style={s.th}>Total Invested</th>
                    <th style={s.th}>Portfolio Value</th>
                    <th style={s.th}>Compounded Wealth</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyBreakdown.filter((item) => item.year % 5 === 0 || item.year === 1).map((row) => (
                    <tr key={row.year}>
                      <td style={s.td}>Yr {row.year}</td>
                      <td style={s.td}>₹{row.invested.toLocaleString("en-IN")}</td>
                      <td style={{ ...s.td, fontWeight: 700, color: "#0F766E" }}>₹{row.balance.toLocaleString("en-IN")}</td>
                      <td style={{ ...s.td, color: "#2563EB" }}>₹{row.wealthGained.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  th: {
    textAlign: "left",
    padding: "8px 10px",
    borderBottom: "1px solid #E5E7EB",
    color: "#6B7280",
    fontWeight: 700,
  },
  td: {
    padding: "8px 10px",
    borderBottom: "1px solid #F3F4F6",
    color: "#374151",
  },
};
