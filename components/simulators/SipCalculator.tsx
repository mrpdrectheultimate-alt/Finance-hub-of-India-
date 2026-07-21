"use client";

import { useMemo, useState } from "react";

type DataPoint = { year: number; invested: number; value: number; gains: number };

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  fmt: (value: number) => string;
};

export default function SipCalculator() {
  const [mode, setMode] = useState<"sip" | "lumpsum">("sip");
  const [monthly, setMonthly] = useState(5000);
  const [lumpsum, setLumpsum] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [stepUp, setStepUp] = useState(10);

  const result = useMemo(() => {
    const data: DataPoint[] = [];

    if (mode === "sip") {
      const monthlyRate = rate / 100 / 12;

      for (let year = 1; year <= years; year += 1) {
        const monthsElapsed = year * 12;
        let futureValue = 0;
        let invested = 0;

        for (let month = 1; month <= monthsElapsed; month += 1) {
          const yearOfMonth = Math.ceil(month / 12);
          const sipThisMonth = monthly * Math.pow(1 + stepUp / 100, yearOfMonth - 1);
          futureValue += sipThisMonth * Math.pow(1 + monthlyRate, monthsElapsed - month + 1);
          invested += sipThisMonth;
        }

        data.push({
          year,
          invested: Math.round(invested),
          value: Math.round(futureValue),
          gains: Math.round(futureValue - invested),
        });
      }
    } else {
      for (let year = 1; year <= years; year += 1) {
        const futureValue = lumpsum * Math.pow(1 + rate / 100, year);
        data.push({
          year,
          invested: lumpsum,
          value: Math.round(futureValue),
          gains: Math.round(futureValue - lumpsum),
        });
      }
    }

    return data;
  }, [mode, monthly, lumpsum, rate, years, stepUp]);

  const final = result[result.length - 1] || { invested: 0, value: 0, gains: 0, year: 0 };
  const maxVal = Math.max(1, ...result.map((point) => point.value));
  const returns = final.invested > 0 ? Math.round(((final.value - final.invested) / final.invested) * 100) : 0;

  const fmt = (value: number) => {
    if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 100000) return `Rs ${(value / 100000).toFixed(1)} L`;
    return `Rs ${value.toLocaleString("en-IN")}`;
  };

  const sampledResult = result.filter((_, index) => result.length <= 10 || index % Math.ceil(result.length / 10) === 0 || index === result.length - 1);

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.titleRow}>
          <span style={s.icon}>SIP</span>
          <h2 style={s.title}>SIP & Investment Calculator</h2>
        </div>
        <p style={s.sub}>See how your money grows with compound interest.</p>
      </div>

      <div style={s.layout}>
        <div style={s.controls}>
          <div style={s.modeToggle}>
            <button onClick={() => setMode("sip")} style={{ ...s.modeBtn, ...(mode === "sip" ? s.modeBtnActive : {}) }} type="button">
              Monthly SIP
            </button>
            <button onClick={() => setMode("lumpsum")} style={{ ...s.modeBtn, ...(mode === "lumpsum" ? s.modeBtnActive : {}) }} type="button">
              Lump Sum
            </button>
          </div>

          {mode === "sip" ? (
            <>
              <Slider label="Monthly SIP" value={monthly} min={500} max={100000} step={500} onChange={setMonthly} fmt={fmt} />
              <Slider label={`Annual step-up (${stepUp}%)`} value={stepUp} min={0} max={25} step={1} onChange={setStepUp} fmt={(value) => `${value}%`} />
            </>
          ) : (
            <Slider label="Lump sum amount" value={lumpsum} min={10000} max={10000000} step={10000} onChange={setLumpsum} fmt={fmt} />
          )}

          <Slider label={`Expected return (${rate}% p.a.)`} value={rate} min={4} max={24} step={0.5} onChange={setRate} fmt={(value) => `${value}%`} />
          <Slider label={`Investment period (${years} years)`} value={years} min={1} max={40} step={1} onChange={setYears} fmt={(value) => `${value} yr`} />

          <div style={s.benchmarks}>
            <div style={s.benchmarkTitle}>Typical returns</div>
            {[
              { label: "FD/Savings", rate: 7, color: "#777" },
              { label: "NIFTY 50 hist.", rate: 13, color: "#185FA5" },
              { label: "Large-cap MF", rate: 12, color: "#1D9E75" },
              { label: "Mid-cap MF", rate: 15, color: "#534AB7" },
            ].map((benchmark) => (
              <button
                key={benchmark.rate}
                onClick={() => setRate(benchmark.rate)}
                style={{
                  ...s.benchBtn,
                  borderColor: benchmark.color,
                  color: benchmark.color,
                  background: rate === benchmark.rate ? `${benchmark.color}15` : "transparent",
                }}
                type="button"
              >
                {benchmark.label} {benchmark.rate}%
              </button>
            ))}
          </div>
        </div>

        <div style={s.results}>
          <div style={s.summaryRow}>
            <Summary label="Total invested" value={fmt(final.invested)} color="#185FA5" />
            <Summary label="Wealth gained" value={fmt(final.gains)} color="#1D9E75" />
            <Summary label="Total value" value={fmt(final.value)} color="#0a0a0a" />
            <Summary label="Return on investment" value={`${returns}%`} color="#534AB7" />
          </div>

          <div style={s.chartWrap}>
            <div style={s.chartTitle}>Growth over {years} years</div>
            <div style={s.chart}>
              {sampledResult.map((point) => (
                <div key={point.year} style={s.barGroup}>
                  <div style={s.barStack}>
                    <div style={{ ...s.barGains, height: `${Math.max((point.gains / maxVal) * 180, 2)}px` }} />
                    <div style={{ ...s.barInvested, height: `${Math.max((point.invested / maxVal) * 180, 2)}px` }} />
                  </div>
                  <div style={s.barLabel}>{point.year}y</div>
                </div>
              ))}
            </div>
            <div style={s.legend}>
              <div style={s.legendItem}><div style={{ ...s.legendDot, background: "#185FA5" }} />Invested</div>
              <div style={s.legendItem}><div style={{ ...s.legendDot, background: "#1D9E75" }} />Gains</div>
            </div>
          </div>

          <div style={s.insightBox}>
            <span style={s.insightIcon}>Insight</span>
            <span style={s.insightText}>
              {mode === "sip" && stepUp > 0
                ? `With ${stepUp}% annual step-up, your SIP grows as your income grows. This can accelerate long-term wealth creation.`
                : `At ${rate}% annual return, your money roughly doubles every ${Math.round(72 / rate)} years by the Rule of 72.`}
              {returns > 100 ? ` Your investments return ${returns}%, so compounding is doing the heavy lifting.` : ""}
            </span>
          </div>

          <p style={s.disclaimer}>For educational purposes only. Mutual fund returns are subject to market risk. Past performance is not indicative of future results.</p>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, fmt }: SliderProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, gap: 12 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: "#555" }}>{label}</label>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a" }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} style={{ width: "100%", accentColor: "#1D9E75" }} />
    </div>
  );
}

function Summary({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={s.summaryCard}>
      <div style={s.summaryLabel}>{label}</div>
      <div style={{ ...s.summaryVal, color }}>{value}</div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 16, overflow: "hidden", fontFamily: "system-ui,-apple-system,sans-serif" },
  header: { padding: "18px 22px 14px", borderBottom: "0.5px solid #eee" },
  titleRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  icon: { fontSize: 12, color: "#1D9E75", fontWeight: 800, background: "#E1F5EE", padding: "4px 8px", borderRadius: 8 },
  title: { fontSize: 17, fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: 0 },
  sub: { fontSize: 12, color: "#888", margin: 0 },
  layout: { display: "grid", gridTemplateColumns: "300px 1fr", minHeight: 400 },
  controls: { padding: 18, borderRight: "0.5px solid #eee", background: "#fafafa" },
  modeToggle: { display: "flex", background: "#eee", borderRadius: 8, padding: 3, gap: 3, marginBottom: 18 },
  modeBtn: { flex: 1, padding: 7, fontSize: 12, fontWeight: 500, border: "none", borderRadius: 6, background: "transparent", color: "#666", cursor: "pointer", fontFamily: "system-ui" },
  modeBtnActive: { background: "#fff", color: "#0a0a0a", fontWeight: 600, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  benchmarks: { marginTop: 8 },
  benchmarkTitle: { fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 },
  benchBtn: { padding: "5px 10px", fontSize: 11, fontWeight: 500, border: "0.5px solid", borderRadius: 20, cursor: "pointer", marginRight: 5, marginBottom: 5, fontFamily: "system-ui" },
  results: { padding: "18px 22px" },
  summaryRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 },
  summaryCard: { background: "#fafafa", borderRadius: 10, padding: "12px 10px", textAlign: "center" },
  summaryLabel: { fontSize: 10, color: "#777", marginBottom: 5 },
  summaryVal: { fontSize: 16, fontWeight: 800, letterSpacing: 0 },
  chartWrap: { background: "#fafafa", borderRadius: 10, padding: "14px 16px", marginBottom: 14 },
  chartTitle: { fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 12 },
  chart: { display: "flex", alignItems: "flex-end", gap: 4, height: 190, marginBottom: 8 },
  barGroup: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  barStack: { display: "flex", flexDirection: "column", alignItems: "center", gap: 1, width: "100%", justifyContent: "flex-end" },
  barGains: { width: "100%", background: "#1D9E75", borderRadius: "3px 3px 0 0", transition: "height .3s", minHeight: 2 },
  barInvested: { width: "100%", background: "#185FA5", borderRadius: "0 0 3px 3px", transition: "height .3s", minHeight: 2 },
  barLabel: { fontSize: 9, color: "#aaa" },
  legend: { display: "flex", gap: 14 },
  legendItem: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#666" },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  insightBox: { display: "flex", gap: 8, background: "#E1F5EE", borderRadius: 9, padding: "10px 12px", marginBottom: 10 },
  insightIcon: { fontSize: 11, flexShrink: 0, fontWeight: 800, color: "#0F6E56" },
  insightText: { fontSize: 12, color: "#0F6E56", lineHeight: 1.6 },
  disclaimer: { fontSize: 10, color: "#999", lineHeight: 1.5, margin: 0 },
};
