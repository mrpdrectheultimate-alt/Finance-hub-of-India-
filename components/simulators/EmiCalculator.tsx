"use client";

import { useMemo, useState } from "react";

type LoanType = "home" | "car" | "personal" | "education";
type ScheduleRow = { month: number; emi: number; principal: number; interest: number; balance: number };

type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  display: string;
};

const LOAN_PRESETS: Record<LoanType, { principal: number; rate: number; tenure: number; label: string }> = {
  home: { principal: 5000000, rate: 8.5, tenure: 20, label: "Home Loan" },
  car: { principal: 700000, rate: 9.5, tenure: 5, label: "Car Loan" },
  personal: { principal: 500000, rate: 14, tenure: 3, label: "Personal Loan" },
  education: { principal: 1500000, rate: 10.5, tenure: 7, label: "Education Loan" },
};

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState(2000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [prepay, setPrepay] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const [loanType, setLoanType] = useState<LoanType>("home");

  const applyPreset = (type: LoanType) => {
    const preset = LOAN_PRESETS[type];
    setLoanType(type);
    setPrincipal(preset.principal);
    setRate(preset.rate);
    setTenure(preset.tenure);
    setPrepay(0);
  };

  const calc = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const totalMonths = tenure * 12;
    const emi =
      monthlyRate === 0
        ? principal / totalMonths
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);

    let balance = principal;
    let totalPaid = 0;
    let totalInterest = 0;
    let monthsActual = 0;
    const schedule: ScheduleRow[] = [];

    for (let month = 1; month <= totalMonths; month += 1) {
      if (balance <= 0) break;

      const interestPart = balance * monthlyRate;
      const principalPart = Math.min(emi - interestPart + prepay, balance);
      const payment = interestPart + principalPart;

      totalPaid += payment;
      totalInterest += interestPart;
      balance -= principalPart;
      monthsActual = month;

      if (month <= 12 || month % 12 === 0 || month === totalMonths) {
        schedule.push({
          month,
          emi: Math.round(payment),
          principal: Math.round(principalPart),
          interest: Math.round(interestPart),
          balance: Math.max(0, Math.round(balance)),
        });
      }
    }

    const totalPaidNoPrepay = emi * totalMonths;
    const totalInterestNoPrepay = totalPaidNoPrepay - principal;
    const monthsSaved = totalMonths - monthsActual;
    const interestSaved = totalInterestNoPrepay - totalInterest;

    return {
      emi: Math.round(emi),
      totalPaid: Math.round(totalPaid),
      totalInterest: Math.round(totalInterest),
      monthsActual,
      yearsActual: Math.floor(monthsActual / 12),
      monthsRemaining: monthsActual % 12,
      monthsSaved,
      interestSaved: Math.round(interestSaved),
      schedule,
      interestRatio: totalPaid > 0 ? Math.round((totalInterest / totalPaid) * 100) : 0,
    };
  }, [principal, rate, tenure, prepay]);

  const fmt = (value: number) => {
    if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `Rs ${(value / 100000).toFixed(1)} L`;
    return `Rs ${value.toLocaleString("en-IN")}`;
  };

  const fmtEmi = (value: number) => `Rs ${value.toLocaleString("en-IN")}`;
  const extraCostPct = principal > 0 ? Math.round((calc.totalInterest / principal) * 100) : 0;

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.titleRow}>
          <span style={s.icon}>EMI</span>
          <h2 style={s.title}>Loan & EMI Calculator</h2>
        </div>
        <p style={s.sub}>Understand the true cost of any loan and how prepayments help.</p>
      </div>

      <div style={s.presets}>
        {(Object.entries(LOAN_PRESETS) as [LoanType, (typeof LOAN_PRESETS)[LoanType]][]).map(([type, preset]) => (
          <button key={type} onClick={() => applyPreset(type)} style={{ ...s.presetBtn, ...(loanType === type ? s.presetBtnActive : {}) }} type="button">
            {preset.label}
          </button>
        ))}
      </div>

      <div style={s.layout}>
        <div style={s.controls}>
          <SliderField label="Loan amount" value={principal} min={50000} max={20000000} step={50000} onChange={setPrincipal} display={fmt(principal)} />
          <SliderField label={`Interest rate: ${rate}% p.a.`} value={rate} min={5} max={24} step={0.1} onChange={setRate} display={`${rate}%`} />
          <SliderField label={`Loan tenure: ${tenure} years`} value={tenure} min={1} max={30} step={1} onChange={setTenure} display={`${tenure} yr`} />
          <SliderField label={`Monthly prepayment: ${fmt(prepay)}`} value={prepay} min={0} max={50000} step={500} onChange={setPrepay} display={fmt(prepay)} />

          {prepay > 0 ? (
            <div style={s.prepayAlert}>
              <div style={s.prepayTitle}>Prepayment impact</div>
              <InfoRow label="Loan closes in" value={`${calc.yearsActual}y ${calc.monthsRemaining}m`} />
              <InfoRow label="Time saved" value={`${Math.floor(calc.monthsSaved / 12)}y ${calc.monthsSaved % 12}m`} />
              <InfoRow label="Interest saved" value={fmt(calc.interestSaved)} />
            </div>
          ) : null}
        </div>

        <div style={s.results}>
          <div style={s.emiCard}>
            <div style={s.emiLabel}>Your monthly EMI</div>
            <div style={s.emiValue}>{fmtEmi(calc.emi)}</div>
            {prepay > 0 ? <div style={s.emiTotal}>+ {fmtEmi(prepay)} prepayment = {fmtEmi(calc.emi + prepay)}/month</div> : null}
          </div>

          <div style={s.breakdownRow}>
            <Breakdown label="Principal" value={fmt(principal)} color="#185FA5" />
            <Breakdown label="Total interest" value={fmt(calc.totalInterest)} color="#B91C1C" />
            <Breakdown label="Total payment" value={fmt(calc.totalPaid)} color="#0a0a0a" />
          </div>

          <div style={s.pieWrap}>
            <div style={s.pieChart}>
              <div style={{ ...s.pieSegment, width: `${100 - calc.interestRatio}%`, background: "#185FA5" }} />
              <div style={{ ...s.pieSegment, width: `${calc.interestRatio}%`, background: "#FCA5A5" }} />
            </div>
            <div style={s.pieLegend}>
              <Legend color="#185FA5" text={`Principal: ${100 - calc.interestRatio}%`} />
              <Legend color="#FCA5A5" text={`Interest: ${calc.interestRatio}%`} />
            </div>
          </div>

          <div style={s.insight}>
            <span style={s.insightLabel}>Insight</span>
            <span>
              You pay {fmt(calc.totalInterest)} in interest on a {fmt(principal)} loan. That is {extraCostPct}% extra.
              {calc.interestRatio > 50 ? " Consider a shorter tenure, a higher EMI, or regular prepayments to reduce this." : ""}
            </span>
          </div>

          <button onClick={() => setShowTable(!showTable)} style={s.tableToggle} type="button">
            {showTable ? "Hide" : "Show"} amortisation schedule
          </button>

          {showTable ? (
            <div style={s.table}>
              <div style={s.tableHeader}>
                <span>Month</span><span>EMI</span><span>Principal</span><span>Interest</span><span>Balance</span>
              </div>
              {calc.schedule.map((row) => (
                <div key={row.month} style={s.tableRow}>
                  <span style={{ color: "#888" }}>{row.month}</span>
                  <span>{fmtEmi(row.emi)}</span>
                  <span style={{ color: "#185FA5" }}>{fmtEmi(row.principal)}</span>
                  <span style={{ color: "#B91C1C" }}>{fmtEmi(row.interest)}</span>
                  <span style={{ color: "#888" }}>{fmt(row.balance)}</span>
                </div>
              ))}
            </div>
          ) : null}

          <p style={s.disclaimer}>Educational only. Actual EMI may vary. Consult your bank for exact terms.</p>
        </div>
      </div>
    </div>
  );
}

function SliderField({ label, value, min, max, step, onChange, display }: SliderFieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, gap: 12 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: "#555" }}>{label}</label>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a" }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} style={{ width: "100%", accentColor: "#1D9E75" }} />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={s.prepayRow}>
      <span>{label}</span>
      <span style={{ color: "#1D9E75", fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function Breakdown({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={s.breakdownCard}>
      <div style={s.breakdownLabel}>{label}</div>
      <div style={{ ...s.breakdownVal, color }}>{value}</div>
    </div>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <div style={s.pieLegendItem}>
      <div style={{ ...s.pieDot, background: color }} />
      {text}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 16, overflow: "hidden", fontFamily: "system-ui,-apple-system,sans-serif" },
  header: { padding: "18px 22px 14px", borderBottom: "0.5px solid #eee" },
  titleRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  icon: { fontSize: 12, color: "#185FA5", fontWeight: 800, background: "#E6F1FB", padding: "4px 8px", borderRadius: 8 },
  title: { fontSize: 17, fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: 0 },
  sub: { fontSize: 12, color: "#888", margin: 0 },
  presets: { display: "flex", gap: 6, padding: "12px 22px", background: "#fafafa", borderBottom: "0.5px solid #eee", flexWrap: "wrap" },
  presetBtn: { padding: "5px 12px", fontSize: 12, fontWeight: 500, border: "0.5px solid #ddd", borderRadius: 20, background: "#fff", color: "#666", cursor: "pointer", fontFamily: "system-ui" },
  presetBtnActive: { background: "#0a0a0a", color: "#fff", border: "0.5px solid #0a0a0a" },
  layout: { display: "grid", gridTemplateColumns: "280px 1fr" },
  controls: { padding: 18, borderRight: "0.5px solid #eee", background: "#fafafa" },
  prepayAlert: { background: "#E1F5EE", border: "0.5px solid #9FE1CB", borderRadius: 9, padding: "12px 14px", marginTop: 8 },
  prepayTitle: { fontWeight: 600, fontSize: 12, color: "#0F6E56", marginBottom: 8 },
  prepayRow: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#555", marginBottom: 5, gap: 10 },
  results: { padding: "18px 22px" },
  emiCard: { background: "#0a0a0a", borderRadius: 12, padding: "18px 20px", textAlign: "center", marginBottom: 14 },
  emiLabel: { fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 },
  emiValue: { fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: 0 },
  emiTotal: { fontSize: 11, color: "#aaa", marginTop: 6 },
  breakdownRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 },
  breakdownCard: { background: "#fafafa", borderRadius: 9, padding: "12px 10px", textAlign: "center" },
  breakdownLabel: { fontSize: 10, color: "#777", marginBottom: 4 },
  breakdownVal: { fontSize: 15, fontWeight: 700, letterSpacing: 0 },
  pieWrap: { marginBottom: 14 },
  pieChart: { display: "flex", height: 24, borderRadius: 12, overflow: "hidden", marginBottom: 8 },
  pieSegment: { height: "100%", transition: "width .3s" },
  pieLegend: { display: "flex", gap: 16, flexWrap: "wrap" },
  pieLegendItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555" },
  pieDot: { width: 10, height: 10, borderRadius: 2 },
  insight: { display: "flex", gap: 8, background: "#FAEEDA", borderRadius: 9, padding: "10px 12px", fontSize: 12, color: "#633806", lineHeight: 1.6, marginBottom: 12 },
  insightLabel: { fontSize: 11, fontWeight: 800, color: "#854F0B", flexShrink: 0 },
  tableToggle: { fontSize: 12, color: "#1D9E75", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "system-ui", marginBottom: 10 },
  table: { fontSize: 11, border: "0.5px solid #eee", borderRadius: 8, overflow: "hidden", marginBottom: 10 },
  tableHeader: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", padding: "8px 12px", background: "#fafafa", fontWeight: 600, color: "#888", gap: 4 },
  tableRow: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", padding: "7px 12px", borderTop: "0.5px solid #f5f5f5", gap: 4, color: "#333" },
  disclaimer: { fontSize: 10, color: "#999", margin: 0 },
};
