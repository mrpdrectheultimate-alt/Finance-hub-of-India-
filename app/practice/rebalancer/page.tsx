"use client";

import { useState } from "react";
import Link from "next/link";

export default function AssetRebalancer() {
  const [equityVal, setEquityVal] = useState(700000);
  const [debtVal, setDebtVal] = useState(200000);
  const [goldVal, setGoldVal] = useState(100000);

  const [targetEquityPct, setTargetEquityPct] = useState(60);
  const [targetDebtPct, setTargetDebtPct] = useState(30);
  const [targetGoldPct, setTargetGoldPct] = useState(10);

  const totalPortfolio = equityVal + debtVal + goldVal;

  const currentEquityPct = totalPortfolio > 0 ? (equityVal / totalPortfolio) * 100 : 0;
  const currentDebtPct = totalPortfolio > 0 ? (debtVal / totalPortfolio) * 100 : 0;
  const currentGoldPct = totalPortfolio > 0 ? (goldVal / totalPortfolio) * 100 : 0;

  const targetEquityVal = (totalPortfolio * targetEquityPct) / 100;
  const targetDebtVal = (totalPortfolio * targetDebtPct) / 100;
  const targetGoldVal = (totalPortfolio * targetGoldPct) / 100;

  const equityDiff = targetEquityVal - equityVal;
  const debtDiff = targetDebtVal - debtVal;
  const goldDiff = targetGoldVal - goldVal;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <Link href="/practice" style={s.backLink}>
          ← Back to Finance Labs
        </Link>

        <div style={s.header}>
          <h1 style={s.title}>⚖️ Asset Allocation & Portfolio Rebalancer</h1>
          <p style={s.sub}>
            Detect portfolio allocation drift across equity, debt, and gold, and generate step-by-step rebalancing recommendations.
          </p>
        </div>

        <div style={s.grid}>
          {/* Inputs */}
          <div style={s.formCard}>
            <h3 style={s.cardTitle}>Current Holdings & Targets</h3>

            <div style={s.sectionDivider}>Current Portfolio Values (₹)</div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Equity / Stocks / Mutual Funds (₹)</label>
              <input
                type="number"
                value={equityVal}
                onChange={(e) => setEquityVal(Number(e.target.value))}
                style={s.input}
              />
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Debt / FD / PPF / Debt Funds (₹)</label>
              <input
                type="number"
                value={debtVal}
                onChange={(e) => setDebtVal(Number(e.target.value))}
                style={s.input}
              />
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Gold / SGB / Digital Gold (₹)</label>
              <input
                type="number"
                value={goldVal}
                onChange={(e) => setGoldVal(Number(e.target.value))}
                style={s.input}
              />
            </div>

            <div style={s.sectionDivider}>Target Allocation Percentages (%)</div>
            <div style={s.fieldRow}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Equity (%)</label>
                <input
                  type="number"
                  value={targetEquityPct}
                  onChange={(e) => setTargetEquityPct(Number(e.target.value))}
                  style={s.input}
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Debt (%)</label>
                <input
                  type="number"
                  value={targetDebtPct}
                  onChange={(e) => setTargetDebtPct(Number(e.target.value))}
                  style={s.input}
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Gold (%)</label>
                <input
                  type="number"
                  value={targetGoldPct}
                  onChange={(e) => setTargetGoldPct(Number(e.target.value))}
                  style={s.input}
                />
              </div>
            </div>
            {targetEquityPct + targetDebtPct + targetGoldPct !== 100 && (
              <span style={s.warnText}>⚠️ Target percentages must add up to 100% (Current total: {targetEquityPct + targetDebtPct + targetGoldPct}%)</span>
            )}
          </div>

          {/* Rebalancing Plan */}
          <div style={s.resultCard}>
            <h3 style={s.cardTitle}>Rebalancing Plan (Total Portfolio: ₹{totalPortfolio.toLocaleString("en-IN")})</h3>

            <div style={s.assetRow}>
              <div style={s.assetName}>📈 Equity</div>
              <div style={s.assetPct}>
                Current: {currentEquityPct.toFixed(1)}% → Target: {targetEquityPct}%
              </div>
              <div style={{ ...s.actionTag, color: equityDiff >= 0 ? "#059669" : "#DC2626" }}>
                {equityDiff >= 0 ? `BUY ₹${Math.round(equityDiff).toLocaleString("en-IN")}` : `SELL ₹${Math.round(Math.abs(equityDiff)).toLocaleString("en-IN")}`}
              </div>
            </div>

            <div style={s.assetRow}>
              <div style={s.assetName}>🏦 Debt</div>
              <div style={s.assetPct}>
                Current: {currentDebtPct.toFixed(1)}% → Target: {targetDebtPct}%
              </div>
              <div style={{ ...s.actionTag, color: debtDiff >= 0 ? "#059669" : "#DC2626" }}>
                {debtDiff >= 0 ? `BUY ₹${Math.round(debtDiff).toLocaleString("en-IN")}` : `SELL ₹${Math.round(Math.abs(debtDiff)).toLocaleString("en-IN")}`}
              </div>
            </div>

            <div style={s.assetRow}>
              <div style={s.assetName}>🥇 Gold</div>
              <div style={s.assetPct}>
                Current: {currentGoldPct.toFixed(1)}% → Target: {targetGoldPct}%
              </div>
              <div style={{ ...s.actionTag, color: goldDiff >= 0 ? "#059669" : "#DC2626" }}>
                {goldDiff >= 0 ? `BUY ₹${Math.round(goldDiff).toLocaleString("en-IN")}` : `SELL ₹${Math.round(Math.abs(goldDiff)).toLocaleString("en-IN")}`}
              </div>
            </div>

            <div style={s.tipBox}>
              <strong>💡 Tax-Efficient Rebalancing Tip:</strong> Instead of selling equity to trigger Capital Gains tax, consider directing new monthly SIP fresh inflows into underweight asset classes (Debt/Gold) until your portfolio realigns naturally!
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
  sectionDivider: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "16px 0 10px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "12px",
  },
  fieldRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
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
  warnText: {
    fontSize: "12px",
    color: "#DC2626",
    fontWeight: 600,
  },
  assetRow: {
    background: "#F9FAFB",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #F3F4F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assetName: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#111827",
  },
  assetPct: {
    fontSize: "12px",
    color: "#6B7280",
  },
  actionTag: {
    fontSize: "13px",
    fontWeight: 800,
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
