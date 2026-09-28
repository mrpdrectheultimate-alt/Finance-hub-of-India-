"use client";
import { useState, useMemo } from "react";

// ============================================================
// FinanceHub — Compound Interest Visualiser
// components/visualisers/CompoundInterestVisualiser.tsx
// Interactive chart showing compounding power with Indian examples
// ============================================================

type DataPoint = { year: number; invested: number; value: number; interest: number };
type Scenario  = { label: string; monthly: number; rate: number; color: string; years: number };

const formatINR = (v: number): string => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000)   return `₹${(v / 100000).toFixed(1)} L`;
  if (v >= 1000)     return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
};

function calcSIPData(monthly: number, annualRate: number, years: number): DataPoint[] {
  const r      = annualRate / 100 / 12;
  const points: DataPoint[] = [];
  for (let y = 0; y <= years; y++) {
    const n        = y * 12;
    const invested = monthly * n;
    const value    = r === 0 ? invested : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    points.push({ year: y, invested, value: Math.round(value), interest: Math.round(value - invested) });
  }
  return points;
}

const PRESETS: { label: string; monthly: number; rate: number; years: number; icon: string }[] = [
  { label: "Starter SIP",    monthly: 1000,  rate: 12, years: 20, icon: "🌱" },
  { label: "Standard SIP",   monthly: 5000,  rate: 12, years: 20, icon: "📈" },
  { label: "Aggressive SIP", monthly: 15000, rate: 14, years: 25, icon: "🚀" },
  { label: "FIRE Target",    monthly: 50000, rate: 12, years: 15, icon: "🔥" },
];

const COMPARISON_SCENARIOS: Scenario[] = [
  { label: "Start at 25",   monthly: 5000, rate: 12, years: 35, color: "#1D9E75" },
  { label: "Start at 30",   monthly: 5000, rate: 12, years: 30, color: "#185FA5" },
  { label: "Start at 35",   monthly: 5000, rate: 12, years: 25, color: "#D4A017" },
  { label: "Start at 40",   monthly: 5000, rate: 12, years: 20, color: "#E53E3E" },
];

export default function CompoundInterestVisualiser() {
  const [monthly, setMonthly] = useState(5000);
  const [rate,    setRate]    = useState(12);
  const [years,   setYears]   = useState(20);
  const [mode,    setMode]    = useState<"single" | "compare">("single");
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const data = useMemo(() => calcSIPData(monthly, rate, years), [monthly, rate, years]);
  const final = data[data.length - 1];

  // Chart dimensions
  const W = 600, H = 240, PAD = { top: 20, right: 20, bottom: 36, left: 72 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const maxVal = final?.value || 1;

  const xScale = (year: number) => PAD.left + (year / years) * chartW;
  const yScale = (val: number)  => PAD.top  + chartH - (val / maxVal) * chartH;

  // Build SVG paths
  const investedPath = data.map((d, i) =>
    `${i === 0 ? "M" : "L"} ${xScale(d.year).toFixed(1)} ${yScale(d.invested).toFixed(1)}`
  ).join(" ");

  const valuePath = data.map((d, i) =>
    `${i === 0 ? "M" : "L"} ${xScale(d.year).toFixed(1)} ${yScale(d.value).toFixed(1)}`
  ).join(" ");

  const areaPath = `${valuePath} L ${xScale(years)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;

  // Hover data
  const hoveredData = hoveredYear !== null ? data.find(d => d.year === hoveredYear) : null;

  // Y axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map(f => ({
    value: maxVal * f,
    y:     yScale(maxVal * f),
  }));

  // Comparison mode
  const compData = COMPARISON_SCENARIOS.map(s => {
    const d = calcSIPData(s.monthly, s.rate, s.years);
    return { ...s, final: d[d.length - 1], data: d };
  });

  const compMax = Math.max(...compData.map(s => s.final.value));

  return (
    <div style={{ fontFamily: "var(--font-ui,system-ui)", maxWidth: 760, margin: "0 auto" }}>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["single", "compare"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{
              padding: "8px 18px", fontSize: 13, fontWeight: mode === m ? 700 : 500,
              background: mode === m ? "#0E6163" : "#fff",
              color: mode === m ? "#fff" : "#718096",
              border: `1px solid ${mode === m ? "#0E6163" : "#e2e8f0"}`,
              borderRadius: 8, cursor: "pointer", fontFamily: "var(--font-ui,system-ui)",
            }}>
            {m === "single" ? "📊 Build Your SIP" : "⚖️ Compare Start Ages"}
          </button>
        ))}
      </div>

      {mode === "single" ? (
        <div>
          {/* Presets */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            {PRESETS.map(p => (
              <button key={p.label}
                onClick={() => { setMonthly(p.monthly); setRate(p.rate); setYears(p.years); }}
                style={{
                  padding: "6px 14px", fontSize: 12, fontWeight: 500,
                  background: monthly === p.monthly && rate === p.rate ? "#f0f9f9" : "#f8f9fa",
                  border: `1px solid ${monthly === p.monthly && rate === p.rate ? "#0E6163" : "#e2e8f0"}`,
                  color: "#4a5568", borderRadius: 20, cursor: "pointer",
                  fontFamily: "var(--font-ui,system-ui)",
                }}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          {/* Inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Monthly SIP", value: monthly, set: setMonthly, min: 500,  max: 200000, step: 500,  format: (v: number) => formatINR(v) },
              { label: "Annual Return (%)", value: rate, set: setRate, min: 6, max: 20, step: 0.5, format: (v: number) => `${v}%` },
              { label: "Years",        value: years,   set: setYears,  min: 1,    max: 40,     step: 1,    format: (v: number) => `${v} yrs` },
            ].map(slider => (
              <div key={slider.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568" }}>{slider.label}</label>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0E6163" }}>{slider.format(slider.value)}</span>
                </div>
                <input type="range"
                  min={slider.min} max={slider.max} step={slider.step} value={slider.value}
                  onChange={e => slider.set(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#0E6163" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#a0aec0", marginTop: 3 }}>
                  <span>{slider.format(slider.min)}</span>
                  <span>{slider.format(slider.max)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Results summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total Invested",   value: formatINR(final?.invested || 0),  color: "#185FA5", bg: "#EBF8FF" },
              { label: "Interest Earned",  value: formatINR(final?.interest || 0),  color: "#1D9E75", bg: "#F0FFF4" },
              { label: "Final Value",      value: formatINR(final?.value    || 0),  color: "#0E6163", bg: "#E6FFFA" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.3px" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#718096", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Wealth multiplier */}
          {final && final.invested > 0 && (
            <div style={{ background: "#1c2b3a", borderRadius: 12, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#1D9E75" }}>
                {(final.value / final.invested).toFixed(1)}x
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Wealth Multiplier</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  Every ₹1 invested grew to ₹{(final.value / final.invested).toFixed(2)} through compounding
                </div>
              </div>
            </div>
          )}

          {/* SVG Chart */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px", overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2b3a", marginBottom: 12, display: "flex", gap: 16 }}>
              Growth of ₹{monthly.toLocaleString("en-IN")}/month at {rate}% for {years} years
              <span style={{ display: "flex", gap: 12, marginLeft: "auto" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: "#718096" }}>
                  <span style={{ width: 10, height: 3, background: "#185FA5", borderRadius: 2, display: "inline-block" }}/>
                  Invested
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: "#718096" }}>
                  <span style={{ width: 10, height: 3, background: "#1D9E75", borderRadius: 2, display: "inline-block" }}/>
                  Total Value
                </span>
              </span>
            </div>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              style={{ width: "100%", height: "auto" }}
              onMouseMove={(e) => {
                const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
                const x    = (e.clientX - rect.left) / rect.width * W;
                const year = Math.round(((x - PAD.left) / chartW) * years);
                setHoveredYear(Math.max(0, Math.min(years, year)));
              }}
              onMouseLeave={() => setHoveredYear(null)}
            >
              {/* Y axis */}
              {yTicks.map(tick => (
                <g key={tick.y}>
                  <line x1={PAD.left} y1={tick.y} x2={PAD.left + chartW} y2={tick.y}
                    stroke="#f0f0f0" strokeWidth={1} />
                  <text x={PAD.left - 6} y={tick.y + 4} textAnchor="end" fill="#a0aec0" fontSize={9}>
                    {tick.value >= 10000000 ? `${(tick.value/10000000).toFixed(1)}Cr`
                     : tick.value >= 100000 ? `${(tick.value/100000).toFixed(0)}L`
                     : `${(tick.value/1000).toFixed(0)}K`}
                  </text>
                </g>
              ))}

              {/* X axis labels */}
              {[0, 5, 10, 15, 20, 25, 30].filter(y => y <= years).map(y => (
                <text key={y} x={xScale(y)} y={H - 6} textAnchor="middle" fill="#a0aec0" fontSize={9}>
                  Yr {y}
                </text>
              ))}

              {/* Area fill */}
              <path d={areaPath} fill="#1D9E75" opacity={0.08} />

              {/* Invested line */}
              <path d={investedPath} fill="none" stroke="#185FA5" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.7} />

              {/* Value line */}
              <path d={valuePath} fill="none" stroke="#1D9E75" strokeWidth={2.5} strokeLinecap="round" />

              {/* Hover line + tooltip */}
              {hoveredYear !== null && hoveredData && (
                <>
                  <line x1={xScale(hoveredYear)} y1={PAD.top} x2={xScale(hoveredYear)} y2={PAD.top + chartH}
                    stroke="#0E6163" strokeWidth={1} strokeDasharray="3,3" />
                  <circle cx={xScale(hoveredYear)} cy={yScale(hoveredData.value)} r={4} fill="#1D9E75" />
                  <circle cx={xScale(hoveredYear)} cy={yScale(hoveredData.invested)} r={3} fill="#185FA5" />
                  {/* Tooltip */}
                  <g transform={`translate(${Math.min(xScale(hoveredYear) + 8, W - 130)}, ${Math.max(PAD.top + 10, yScale(hoveredData.value) - 50)})`}>
                    <rect rx={6} ry={6} width={120} height={62} fill="#1c2b3a" opacity={0.9} />
                    <text x={8} y={16} fill="rgba(255,255,255,0.6)" fontSize={9}>Year {hoveredData.year}</text>
                    <text x={8} y={30} fill="#1D9E75" fontSize={10} fontWeight="bold">
                      {formatINR(hoveredData.value)}
                    </text>
                    <text x={8} y={43} fill="rgba(255,255,255,0.6)" fontSize={8}>Invested: {formatINR(hoveredData.invested)}</text>
                    <text x={8} y={56} fill="#68D391" fontSize={8}>Interest: {formatINR(hoveredData.interest)}</text>
                  </g>
                </>
              )}
            </svg>
          </div>

          {/* Milestones */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>
              Milestone years
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[5, 10, 15, 20, 25, 30].filter(y => y <= years).map(y => {
                const d = data[y];
                if (!d) return null;
                return (
                  <div key={y} style={{
                    background: "#f8f9fa", border: "1px solid #e2e8f0",
                    borderRadius: 10, padding: "8px 12px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 11, color: "#a0aec0", marginBottom: 3 }}>Year {y}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0E6163" }}>{formatINR(d.value)}</div>
                    <div style={{ fontSize: 10, color: "#1D9E75" }}>
                      {d.invested > 0 ? `${(d.value/d.invested).toFixed(1)}x` : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* COMPARISON MODE */
        <div>
          <div style={{ background: "#f0f9f9", border: "1px solid #0E616330", borderRadius: 12, padding: "14px 18px", marginBottom: 20, fontSize: 13, color: "#0E6163", lineHeight: 1.7 }}>
            Same ₹5,000/month SIP at 12% — only the start age changes. See how much starting earlier matters.
          </div>

          {/* Comparison bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
            {compData.map(s => (
              <div key={s.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1c2b3a" }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: "#a0aec0" }}>{s.years} years</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{formatINR(s.final.value)}</span>
                    <span style={{ fontSize: 11, color: "#a0aec0", marginLeft: 6 }}>
                      ({(s.final.value / s.final.invested).toFixed(1)}x)
                    </span>
                  </div>
                </div>
                <div style={{ height: 12, background: "#EDF2F7", borderRadius: 999 }}>
                  <div style={{
                    height: "100%",
                    width: `${(s.final.value / compMax) * 100}%`,
                    background: s.color,
                    borderRadius: 999,
                    transition: "width 0.8s ease",
                    position: "relative",
                  }}>
                    {/* Invested portion */}
                    <div style={{
                      position: "absolute", left: 0, top: 0,
                      height: "100%",
                      width: `${(s.final.invested / s.final.value) * 100}%`,
                      background: s.color + "60",
                      borderRadius: 999,
                    }} />
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#a0aec0", marginTop: 3 }}>
                  Invested: {formatINR(s.final.invested)} · Interest: {formatINR(s.final.interest)}
                </div>
              </div>
            ))}
          </div>

          {/* Key insight */}
          <div style={{ background: "#1c2b3a", borderRadius: 14, padding: "20px 22px", color: "#fff" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1D9E75", marginBottom: 10 }}>
              💡 The Cost of Waiting
            </div>
            {compData.map((s, i) => {
              if (i === 0) return null;
              const diff   = compData[0].final.value - s.final.value;
              const diffYr = i * 5;
              return (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Starting {diffYr} year{diffYr > 1 ? "s" : ""} late costs you</span>
                  <span style={{ color: "#FC8181", fontWeight: 700 }}>−{formatINR(diff)}</span>
                </div>
              );
            })}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              Assumes same ₹5,000/month investment at 12% annual return until age 60
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop: 16, padding: "10px 14px", background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 11, color: "#718096", lineHeight: 1.6 }}>
        ⚠️ Returns shown assume constant {rate}% annual returns — actual mutual fund returns vary. Past returns are not indicative of future results. This is a planning tool, not a financial guarantee. Consult a SEBI-registered advisor for personalised advice.
      </div>
    </div>
  );
}
