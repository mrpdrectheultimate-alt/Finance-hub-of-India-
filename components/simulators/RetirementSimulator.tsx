"use client";

import { useMemo, useState } from "react";

type ProjectionPoint = { age: number; corpus: number; needed: number };
type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

export default function RetirementSimulator() {
  const [currentAge, setCurrentAge] = useState(28);
  const [retireAge, setRetireAge] = useState(60);
  const [lifeExp, setLifeExp] = useState(85);
  const [monthlySave, setMonthlySave] = useState(15000);
  const [currentSaved, setCurrentSaved] = useState(200000);
  const [preReturnRate, setPreReturnRate] = useState(12);
  const [postReturnRate, setPostReturnRate] = useState(7);
  const [monthlyExpense, setMonthlyExpense] = useState(50000);
  const [inflation, setInflation] = useState(6);

  const calc = useMemo(() => {
    const yearsToRetire = Math.max(1, retireAge - currentAge);
    const yearsInRetirement = Math.max(1, lifeExp - retireAge);

    const futureMonthlyExp = monthlyExpense * Math.pow(1 + inflation / 100, yearsToRetire);
    const annualExpRetirement = futureMonthlyExp * 12;
    const realReturn = (postReturnRate - inflation) / 100;

    const corpusNeeded =
      realReturn <= 0
        ? annualExpRetirement * yearsInRetirement
        : annualExpRetirement * ((1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn);

    const monthlyRate = preReturnRate / 100 / 12;
    const months = yearsToRetire * 12;
    const fvCurrentSavings = currentSaved * Math.pow(1 + preReturnRate / 100, yearsToRetire);
    const fvMonthlySavings =
      monthlyRate === 0
        ? monthlySave * months
        : monthlySave * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);

    const corpusAtRetirement = fvCurrentSavings + fvMonthlySavings;
    const rawGap = corpusNeeded - corpusAtRetirement;
    const isOnTrack = corpusAtRetirement >= corpusNeeded;

    let neededMonthlySavings = monthlySave;
    if (!isOnTrack && monthlyRate > 0) {
      const fvNeeded = corpusNeeded - fvCurrentSavings;
      neededMonthlySavings = Math.max(
        0,
        Math.round(fvNeeded / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate))),
      );
    }

    const projection: ProjectionPoint[] = [];
    for (let year = 0; year <= yearsToRetire; year += 1) {
      const age = currentAge + year;
      const elapsedMonths = year * 12;
      const fvSaved = currentSaved * Math.pow(1 + preReturnRate / 100, year);
      const fvSip =
        monthlyRate === 0
          ? monthlySave * elapsedMonths
          : monthlySave * ((Math.pow(1 + monthlyRate, elapsedMonths) - 1) / monthlyRate) * (1 + monthlyRate);

      projection.push({
        age,
        corpus: Math.round(fvSaved + fvSip),
        needed: Math.round(corpusNeeded / Math.pow(1 + preReturnRate / 100, yearsToRetire - year)),
      });
    }

    return {
      yearsToRetire,
      yearsInRetirement,
      futureMonthlyExp: Math.round(futureMonthlyExp),
      annualExpRetirement: Math.round(annualExpRetirement),
      corpusNeeded: Math.round(corpusNeeded),
      corpusAtRetirement: Math.round(corpusAtRetirement),
      gap: Math.round(Math.abs(rawGap)),
      isOnTrack,
      neededMonthlySavings,
      projection,
      readinessScore: corpusNeeded > 0 ? Math.min(100, Math.round((corpusAtRetirement / corpusNeeded) * 100)) : 100,
    };
  }, [currentAge, retireAge, lifeExp, monthlySave, currentSaved, preReturnRate, postReturnRate, monthlyExpense, inflation]);

  const fmt = (value: number) => {
    if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 100000) return `Rs ${(value / 100000).toFixed(1)} L`;
    return `Rs ${value.toLocaleString("en-IN")}`;
  };

  const scoreColor = calc.readinessScore >= 80 ? "#1D9E75" : calc.readinessScore >= 50 ? "#854F0B" : "#B91C1C";
  const scoreBg = calc.readinessScore >= 80 ? "#E1F5EE" : calc.readinessScore >= 50 ? "#FAEEDA" : "#FEF2F2";
  const maxCorpus = Math.max(1, calc.corpusNeeded, calc.corpusAtRetirement);
  const sampledProjection = calc.projection.filter((_, index) => index % Math.max(1, Math.floor(calc.projection.length / 8)) === 0 || index === calc.projection.length - 1);

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.titleRow}>
          <span style={s.headerIcon}>RET</span>
          <h2 style={s.title}>Retirement Planner</h2>
        </div>
        <p style={s.sub}>See whether your savings plan can support a comfortable retirement.</p>
      </div>

      <div style={s.layout}>
        <div style={s.controls}>
          <div style={s.section}>
            <div style={s.sectionTitle}>About you</div>
            <Slider label={`Current age: ${currentAge}`} value={currentAge} min={18} max={55} step={1} onChange={setCurrentAge} />
            <Slider label={`Retire at: ${retireAge}`} value={retireAge} min={currentAge + 5} max={75} step={1} onChange={setRetireAge} />
            <Slider label={`Life expectancy: ${lifeExp}`} value={lifeExp} min={retireAge + 5} max={100} step={1} onChange={setLifeExp} />
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>Money</div>
            <Slider label={`Monthly savings: ${fmt(monthlySave)}`} value={monthlySave} min={1000} max={200000} step={1000} onChange={setMonthlySave} />
            <Slider label={`Already saved: ${fmt(currentSaved)}`} value={currentSaved} min={0} max={5000000} step={50000} onChange={setCurrentSaved} />
            <Slider label={`Monthly expenses today: ${fmt(monthlyExpense)}`} value={monthlyExpense} min={10000} max={500000} step={5000} onChange={setMonthlyExpense} />
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>Assumptions</div>
            <Slider label={`Pre-retirement return: ${preReturnRate}%`} value={preReturnRate} min={6} max={18} step={0.5} onChange={setPreReturnRate} />
            <Slider label={`Post-retirement return: ${postReturnRate}%`} value={postReturnRate} min={4} max={12} step={0.5} onChange={setPostReturnRate} />
            <Slider label={`Inflation: ${inflation}%`} value={inflation} min={3} max={10} step={0.5} onChange={setInflation} />
          </div>
        </div>

        <div style={s.results}>
          <div style={{ ...s.scoreCard, background: scoreBg, border: `0.5px solid ${scoreColor}40` }}>
            <div style={s.scoreRow}>
              <div>
                <div style={s.scoreLabel}>Retirement readiness</div>
                <div style={{ ...s.scoreNum, color: scoreColor }}>{calc.readinessScore}%</div>
                <div style={{ ...s.scoreStatus, color: scoreColor }}>{calc.isOnTrack ? "On track" : "Needs attention"}</div>
              </div>
              <div style={s.scoreRing}>
                <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#eee" strokeWidth="8" />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="8"
                    strokeDasharray={`${(calc.readinessScore / 100) * 201} 201`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                  <text x="40" y="46" textAnchor="middle" fontSize="14" fontWeight="700" fill={scoreColor}>
                    {calc.readinessScore}%
                  </text>
                </svg>
              </div>
            </div>
          </div>

          <div style={s.numbersGrid}>
            {[
              { label: "Years to retire", value: `${calc.yearsToRetire} years`, color: "#185FA5" },
              { label: "Years in retirement", value: `${calc.yearsInRetirement} years`, color: "#534AB7" },
              { label: `Monthly expense at ${retireAge}`, value: fmt(calc.futureMonthlyExp), color: "#854F0B" },
              { label: "Corpus needed", value: fmt(calc.corpusNeeded), color: "#B91C1C" },
              { label: "Corpus you will have", value: fmt(calc.corpusAtRetirement), color: "#1D9E75" },
              { label: calc.isOnTrack ? "Surplus" : "Shortfall", value: fmt(calc.gap), color: calc.isOnTrack ? "#1D9E75" : "#B91C1C" },
            ].map((item) => (
              <div key={item.label} style={s.numCard}>
                <div style={s.numLabel}>{item.label}</div>
                <div style={{ ...s.numVal, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>

          {!calc.isOnTrack ? (
            <div style={s.actionCard}>
              <div style={s.actionTitle}>What you need to do</div>
              <div style={s.actionRow}>
                <span>Increase monthly savings to</span>
                <span style={{ fontWeight: 700, color: "#B91C1C", fontSize: 15 }}>{fmt(calc.neededMonthlySavings)}/month</span>
              </div>
              <div style={s.actionRow}>
                <span>That is</span>
                <span style={{ fontWeight: 600, color: "#555" }}>{fmt(Math.max(0, calc.neededMonthlySavings - monthlySave))} more than now</span>
              </div>
            </div>
          ) : (
            <div style={s.onTrackCard}>
              <span style={s.onTrackLabel}>Good</span>
              <span>You are on track for retirement. Keep going and consider increasing savings when your income rises.</span>
            </div>
          )}

          <div style={s.chartSection}>
            <div style={s.chartTitle}>Corpus growth to retirement</div>
            <div style={s.barChart}>
              {sampledProjection.map((point) => (
                <div key={point.age} style={s.barGroup}>
                  <div style={s.barWrap}>
                    <div style={{ ...s.bar, height: `${Math.max((point.corpus / maxCorpus) * 120, 2)}px`, background: point.corpus >= calc.corpusNeeded ? "#1D9E75" : "#185FA5" }} />
                  </div>
                  <div style={s.barAge}>{point.age}</div>
                </div>
              ))}
            </div>
          </div>

          <p style={s.disclaimer}>Educational projections only. Actual returns vary. Consult a SEBI-registered financial advisor for personalised retirement planning.</p>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }: SliderProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <label style={{ fontSize: 12, color: "#555" }}>{label}</label>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} style={{ width: "100%", accentColor: "#1D9E75" }} />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 16, overflow: "hidden", fontFamily: "system-ui,-apple-system,sans-serif" },
  header: { padding: "18px 22px 14px", borderBottom: "0.5px solid #eee" },
  titleRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  headerIcon: { fontSize: 12, color: "#534AB7", fontWeight: 800, background: "#EEEDFE", padding: "4px 8px", borderRadius: 8 },
  title: { fontSize: 17, fontWeight: 700, color: "#0a0a0a", margin: 0 },
  sub: { fontSize: 12, color: "#888", margin: 0 },
  layout: { display: "grid", gridTemplateColumns: "280px 1fr" },
  controls: { padding: 16, borderRight: "0.5px solid #eee", background: "#fafafa", overflowY: "auto" },
  section: { marginBottom: 16, paddingBottom: 16, borderBottom: "0.5px solid #eee" },
  sectionTitle: { fontSize: 11, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 },
  results: { padding: "18px 22px" },
  scoreCard: { borderRadius: 12, padding: "16px 18px", marginBottom: 14 },
  scoreRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  scoreLabel: { fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 },
  scoreNum: { fontSize: 28, fontWeight: 800, letterSpacing: 0, marginBottom: 2 },
  scoreStatus: { fontSize: 13, fontWeight: 600 },
  scoreRing: {},
  numbersGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 },
  numCard: { background: "#fafafa", borderRadius: 9, padding: "10px 12px" },
  numLabel: { fontSize: 10, color: "#777", marginBottom: 4 },
  numVal: { fontSize: 14, fontWeight: 700, letterSpacing: 0 },
  actionCard: { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 10, padding: "14px 16px", marginBottom: 14 },
  actionTitle: { fontWeight: 600, fontSize: 13, color: "#B91C1C", marginBottom: 10 },
  actionRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555", marginBottom: 6, gap: 12 },
  onTrackCard: { display: "flex", gap: 10, background: "#E1F5EE", border: "0.5px solid #9FE1CB", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#0F6E56", lineHeight: 1.6, marginBottom: 14 },
  onTrackLabel: { fontWeight: 800, fontSize: 11, flexShrink: 0 },
  chartSection: { background: "#fafafa", borderRadius: 10, padding: "14px 16px", marginBottom: 10 },
  chartTitle: { fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 12 },
  barChart: { display: "flex", alignItems: "flex-end", gap: 6, height: 130 },
  barGroup: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  barWrap: { flex: 1, display: "flex", alignItems: "flex-end", width: "100%" },
  bar: { width: "100%", borderRadius: "3px 3px 0 0", transition: "height .3s", minHeight: 2 },
  barAge: { fontSize: 9, color: "#aaa" },
  disclaimer: { fontSize: 10, color: "#999", margin: 0, lineHeight: 1.5 },
};
