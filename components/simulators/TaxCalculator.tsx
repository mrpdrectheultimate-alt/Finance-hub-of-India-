"use client";

import { useMemo, useState } from "react";

type CityType = "metro" | "non-metro";
type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function computeOldTax(income: number): number {
  if (income <= 250000) return 0;
  if (income <= 500000) return (income - 250000) * 0.05;
  if (income <= 1000000) return 12500 + (income - 500000) * 0.2;
  return 112500 + (income - 1000000) * 0.3;
}

function computeNewTax(income: number): number {
  if (income <= 300000) return 0;
  if (income <= 600000) return (income - 300000) * 0.05;
  if (income <= 900000) return 15000 + (income - 600000) * 0.1;
  if (income <= 1200000) return 45000 + (income - 900000) * 0.15;
  if (income <= 1500000) return 90000 + (income - 1200000) * 0.2;
  return 150000 + (income - 1500000) * 0.3;
}

export default function TaxCalculator() {
  const [grossSalary, setGrossSalary] = useState(1200000);
  const [hra, setHra] = useState(300000);
  const [rentPaid, setRentPaid] = useState(180000);
  const [cityType, setCityType] = useState<CityType>("metro");
  const [section80C, setSection80C] = useState(150000);
  const [nps, setNps] = useState(50000);
  const [homeLoanInt, setHomeLoanInt] = useState(0);
  const [medInsurance, setMedInsurance] = useState(25000);
  const [otherDeductions, setOtherDeductions] = useState(0);

  const calc = useMemo(() => {
    const basicSalary = grossSalary * 0.5;
    const hraExempt = Math.min(
      hra,
      rentPaid - 0.1 * basicSalary,
      cityType === "metro" ? 0.5 * basicSalary : 0.4 * basicSalary,
    );
    const hraExemptFinal = Math.max(0, hraExempt);

    const std80C = Math.min(section80C, 150000);
    const std80CCD = Math.min(nps, 50000);
    const std24b = Math.min(homeLoanInt, 200000);
    const std80D = Math.min(medInsurance, 25000);
    const stdDeduction = 50000;
    const totalDeductions = hraExemptFinal + std80C + std80CCD + std24b + std80D + stdDeduction + otherDeductions;
    const taxableOld = Math.max(0, grossSalary - totalDeductions);

    const oldTax = computeOldTax(taxableOld);
    const oldRebate = taxableOld <= 500000 ? Math.min(oldTax, 12500) : 0;
    const finalOldTax = Math.max(0, (oldTax - oldRebate) * 1.04);

    const stdDeductionNew = 75000;
    const taxableNew = Math.max(0, grossSalary - stdDeductionNew);
    const newTax = computeNewTax(taxableNew);
    const newRebate = taxableNew <= 700000 ? Math.min(newTax, 25000) : 0;
    const finalNewTax = Math.max(0, (newTax - newRebate) * 1.04);

    const betterRegime = finalOldTax <= finalNewTax ? "old" : "new";

    return {
      taxableOld: Math.round(taxableOld),
      taxableNew: Math.round(taxableNew),
      finalOldTax: Math.round(finalOldTax),
      finalNewTax: Math.round(finalNewTax),
      savings: Math.round(Math.abs(finalOldTax - finalNewTax)),
      betterRegime,
      totalDeductions: Math.round(totalDeductions),
      hraExemptFinal: Math.round(hraExemptFinal),
      effectiveRateOld: grossSalary > 0 ? ((finalOldTax / grossSalary) * 100).toFixed(1) : "0",
      effectiveRateNew: grossSalary > 0 ? ((finalNewTax / grossSalary) * 100).toFixed(1) : "0",
      inHandOld: Math.round(grossSalary - finalOldTax),
      inHandNew: Math.round(grossSalary - finalNewTax),
    };
  }, [grossSalary, hra, rentPaid, cityType, section80C, nps, homeLoanInt, medInsurance, otherDeductions]);

  const fmt = (value: number) => {
    if (value >= 100000) return `Rs ${(value / 100000).toFixed(1)}L`;
    return `Rs ${value.toLocaleString("en-IN")}`;
  };

  const isOldBetter = calc.betterRegime === "old";

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.titleRow}>
          <span style={s.icon}>TAX</span>
          <h2 style={s.title}>Income Tax Calculator FY 2024-25</h2>
        </div>
        <p style={s.sub}>Compare old and new regimes to see which saves more.</p>
      </div>

      <div style={s.layout}>
        <div style={s.controls}>
          <div style={s.ctrlSection}>
            <div style={s.ctrlTitle}>Income</div>
            <Slider label={`Gross salary: ${fmt(grossSalary)}`} value={grossSalary} min={300000} max={10000000} step={50000} onChange={setGrossSalary} />
          </div>

          <div style={s.ctrlSection}>
            <div style={s.ctrlTitle}>HRA old regime only</div>
            <Slider label={`HRA received: ${fmt(hra)}`} value={hra} min={0} max={1000000} step={10000} onChange={setHra} />
            <Slider label={`Rent paid: ${fmt(rentPaid)}`} value={rentPaid} min={0} max={1200000} step={10000} onChange={setRentPaid} />
            <div style={s.cityToggle}>
              <button onClick={() => setCityType("metro")} style={{ ...s.cityBtn, ...(cityType === "metro" ? s.cityBtnActive : {}) }} type="button">
                Metro 50%
              </button>
              <button onClick={() => setCityType("non-metro")} style={{ ...s.cityBtn, ...(cityType === "non-metro" ? s.cityBtnActive : {}) }} type="button">
                Non-metro 40%
              </button>
            </div>
          </div>

          <div style={s.ctrlSection}>
            <div style={s.ctrlTitle}>Deductions old regime</div>
            <Slider label={`80C: ${fmt(section80C)}`} value={section80C} min={0} max={150000} step={5000} onChange={setSection80C} />
            <Slider label={`80CCD NPS: ${fmt(nps)}`} value={nps} min={0} max={50000} step={5000} onChange={setNps} />
            <Slider label={`24(b) home loan interest: ${fmt(homeLoanInt)}`} value={homeLoanInt} min={0} max={200000} step={10000} onChange={setHomeLoanInt} />
            <Slider label={`80D medical insurance: ${fmt(medInsurance)}`} value={medInsurance} min={0} max={25000} step={2500} onChange={setMedInsurance} />
            <Slider label={`Other deductions: ${fmt(otherDeductions)}`} value={otherDeductions} min={0} max={200000} step={5000} onChange={setOtherDeductions} />
          </div>
        </div>

        <div style={s.results}>
          <div style={{ ...s.winnerBanner, background: isOldBetter ? "#E1F5EE" : "#EEEDFE", borderColor: isOldBetter ? "#9FE1CB" : "#CECBF6" }}>
            <div style={{ ...s.winnerTitle, color: isOldBetter ? "#0F6E56" : "#534AB7" }}>
              {isOldBetter ? "Old Regime saves more" : "New Regime saves more"}
            </div>
            <div style={s.winnerSavings}>Save {fmt(calc.savings)}/year by choosing {isOldBetter ? "Old" : "New"} regime</div>
            <div style={s.winnerInhand}>In-hand: {fmt(isOldBetter ? calc.inHandOld : calc.inHandNew)} vs {fmt(isOldBetter ? calc.inHandNew : calc.inHandOld)}</div>
          </div>

          <div style={s.compTable}>
            <div style={s.compHeader}>
              <div />
              <div style={{ ...s.compCol, color: isOldBetter ? "#0F6E56" : "#555" }}>Old Regime {isOldBetter ? "best" : ""}</div>
              <div style={{ ...s.compCol, color: !isOldBetter ? "#534AB7" : "#555" }}>New Regime {!isOldBetter ? "best" : ""}</div>
            </div>
            {[
              { label: "Gross salary", old: fmt(grossSalary), new: fmt(grossSalary) },
              { label: "Deductions", old: `-${fmt(calc.totalDeductions)}`, new: "-Rs 75,000 std" },
              { label: "Taxable income", old: fmt(calc.taxableOld), new: fmt(calc.taxableNew) },
              { label: "Income tax", old: fmt(calc.finalOldTax), new: fmt(calc.finalNewTax) },
              { label: "Effective tax rate", old: `${calc.effectiveRateOld}%`, new: `${calc.effectiveRateNew}%` },
              { label: "Monthly in-hand", old: fmt(Math.round(calc.inHandOld / 12)), new: fmt(Math.round(calc.inHandNew / 12)) },
            ].map((row) => (
              <div key={row.label} style={s.compRow}>
                <div style={s.compLabel}>{row.label}</div>
                <div style={{ ...s.compVal, color: isOldBetter && row.label !== "Gross salary" ? "#0F6E56" : "#333" }}>{row.old}</div>
                <div style={{ ...s.compVal, color: !isOldBetter && row.label !== "Gross salary" ? "#534AB7" : "#333" }}>{row.new}</div>
              </div>
            ))}
          </div>

          <div style={s.slabsWrap}>
            <div style={s.slabsTitle}>New regime slabs FY 2024-25</div>
            <div style={s.slabs}>
              {[
                { range: "Up to Rs 3L", rate: "0%" },
                { range: "Rs 3L to Rs 6L", rate: "5%" },
                { range: "Rs 6L to Rs 9L", rate: "10%" },
                { range: "Rs 9L to Rs 12L", rate: "15%" },
                { range: "Rs 12L to Rs 15L", rate: "20%" },
                { range: "Above Rs 15L", rate: "30%" },
              ].map((slab) => (
                <div key={slab.range} style={s.slab}>
                  <span style={s.slabRange}>{slab.range}</span>
                  <span style={s.slabRate}>{slab.rate}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={s.disclaimer}>Educational estimate only. Consult a CA for your actual tax liability. Surcharge and cess may apply differently for higher incomes.</p>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }: SliderProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 3 }}>{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} style={{ width: "100%", accentColor: "#1D9E75" }} />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 16, overflow: "hidden", fontFamily: "system-ui,-apple-system,sans-serif" },
  header: { padding: "18px 22px 14px", borderBottom: "0.5px solid #eee" },
  titleRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  icon: { fontSize: 12, color: "#0F6E56", fontWeight: 800, background: "#E1F5EE", padding: "4px 8px", borderRadius: 8 },
  title: { fontSize: 17, fontWeight: 700, color: "#0a0a0a", margin: 0 },
  sub: { fontSize: 12, color: "#888", margin: 0 },
  layout: { display: "grid", gridTemplateColumns: "280px 1fr" },
  controls: { padding: 14, borderRight: "0.5px solid #eee", background: "#fafafa", overflowY: "auto", maxHeight: 580 },
  ctrlSection: { marginBottom: 14, paddingBottom: 14, borderBottom: "0.5px solid #eee" },
  ctrlTitle: { fontSize: 11, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 },
  cityToggle: { display: "flex", gap: 6, marginTop: 6 },
  cityBtn: { flex: 1, padding: 5, fontSize: 11, border: "0.5px solid #ddd", borderRadius: 7, background: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  cityBtnActive: { background: "#0a0a0a", color: "#fff", border: "0.5px solid #0a0a0a" },
  results: { padding: "16px 20px" },
  winnerBanner: { borderRadius: 12, padding: "16px 18px", border: "0.5px solid", marginBottom: 16, textAlign: "center" },
  winnerTitle: { fontSize: 15, fontWeight: 700, marginBottom: 4 },
  winnerSavings: { fontSize: 20, fontWeight: 800, color: "#0a0a0a", letterSpacing: 0, marginBottom: 4 },
  winnerInhand: { fontSize: 12, color: "#888" },
  compTable: { border: "0.5px solid #eee", borderRadius: 10, overflow: "hidden", marginBottom: 14 },
  compHeader: { display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", background: "#fafafa", padding: "8px 12px", borderBottom: "0.5px solid #eee" },
  compCol: { fontSize: 12, fontWeight: 700, textAlign: "right" },
  compRow: { display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", padding: "9px 12px", borderBottom: "0.5px solid #f5f5f5", fontSize: 12 },
  compLabel: { color: "#555" },
  compVal: { textAlign: "right", fontWeight: 500 },
  slabsWrap: { background: "#fafafa", borderRadius: 10, padding: "12px 14px", marginBottom: 12 },
  slabsTitle: { fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 8 },
  slabs: { display: "flex", flexDirection: "column", gap: 4 },
  slab: { display: "flex", justifyContent: "space-between", fontSize: 12 },
  slabRange: { color: "#555" },
  slabRate: { fontWeight: 600, color: "#0a0a0a" },
  disclaimer: { fontSize: 10, color: "#999", margin: 0, lineHeight: 1.5 },
};
