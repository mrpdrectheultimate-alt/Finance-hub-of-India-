"use client";

import { useMemo, useState } from "react";

type HireEvent = { month: number; role: string; monthlyCost: number };
type RevenueEvent = { month: number; label: string; monthlyRevenue: number };
type Scenario = "base" | "bull" | "bear";
type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

const SCENARIO_MULTIPLIERS: Record<Scenario, { burn: number; growth: number }> = {
  base: { burn: 1.0, growth: 1.0 },
  bull: { burn: 0.9, growth: 1.5 },
  bear: { burn: 1.3, growth: 0.5 },
};

export default function StartupCashFlowSimulator() {
  const [initialCash, setInitialCash] = useState(5000000);
  const [monthlyBurn, setMonthlyBurn] = useState(300000);
  const [monthlyRevenue, setMonthlyRevenue] = useState(50000);
  const [revenueGrowth, setRevenueGrowth] = useState(15);
  const [scenario, setScenario] = useState<Scenario>("base");
  const [hires, setHires] = useState<HireEvent[]>([
    { month: 3, role: "Engineer", monthlyCost: 120000 },
    { month: 6, role: "Sales Lead", monthlyCost: 100000 },
  ]);
  const [revenues, setRevenues] = useState<RevenueEvent[]>([
    { month: 4, label: "First enterprise client", monthlyRevenue: 100000 },
    { month: 8, label: "Second major client", monthlyRevenue: 200000 },
  ]);
  const [showAddHire, setShowAddHire] = useState(false);
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [newHire, setNewHire] = useState({ month: 1, role: "", monthlyCost: 80000 });
  const [newRevenue, setNewRevenue] = useState({ month: 1, label: "", monthlyRevenue: 50000 });

  const simulation = useMemo(() => {
    const multiplier = SCENARIO_MULTIPLIERS[scenario];
    const months: {
      month: number;
      cash: number;
      burn: number;
      revenue: number;
      netBurn: number;
      runwayLeft: number;
      isAlive: boolean;
      event?: string;
    }[] = [];

    let cash = initialCash;
    let currentBurn = monthlyBurn * multiplier.burn;
    let currentRevenue = monthlyRevenue;
    let deadMonth = 0;

    for (let month = 1; month <= 24; month += 1) {
      const hire = hires.find((item) => item.month === month);
      if (hire) currentBurn += hire.monthlyCost * multiplier.burn;

      const revenueEvent = revenues.find((item) => item.month === month);
      if (revenueEvent) currentRevenue += revenueEvent.monthlyRevenue * multiplier.growth;

      if (month > 1) currentRevenue *= 1 + (revenueGrowth * multiplier.growth) / 100;

      const netBurn = currentBurn - currentRevenue;
      const newCash = cash - netBurn;
      const runwayLeft = netBurn > 0 ? Math.floor(newCash / netBurn) : 999;
      const isAlive = newCash > 0;

      if (!isAlive && !deadMonth) deadMonth = month;

      months.push({
        month,
        cash: Math.round(Math.max(0, newCash)),
        burn: Math.round(currentBurn),
        revenue: Math.round(currentRevenue),
        netBurn: Math.round(netBurn),
        runwayLeft: isAlive ? runwayLeft : 0,
        isAlive,
        event: hire ? `Hired ${hire.role}` : revenueEvent ? revenueEvent.label : undefined,
      });

      cash = Math.max(0, newCash);
      if (!isAlive) break;
    }

    return {
      months,
      runway: deadMonth || months.length,
      deadMonth,
      lastMonth: months[months.length - 1],
      isViable: !deadMonth || deadMonth > 18,
    };
  }, [initialCash, monthlyBurn, monthlyRevenue, revenueGrowth, scenario, hires, revenues]);

  const fmt = (value: number) => {
    if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `Rs ${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `Rs ${(value / 1000).toFixed(0)}K`;
    return `Rs ${value}`;
  };

  const maxCash = Math.max(1, ...simulation.months.map((month) => month.cash), initialCash);
  const breakEven = simulation.months.find((month) => month.netBurn <= 0);

  const addHire = () => {
    if (!newHire.role.trim()) return;
    setHires((previous) => [...previous, newHire].sort((a, b) => a.month - b.month));
    setShowAddHire(false);
    setNewHire({ month: 1, role: "", monthlyCost: 80000 });
  };

  const addRevenue = () => {
    if (!newRevenue.label.trim()) return;
    setRevenues((previous) => [...previous, newRevenue].sort((a, b) => a.month - b.month));
    setShowAddRevenue(false);
    setNewRevenue({ month: 1, label: "", monthlyRevenue: 50000 });
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.titleRow}>
          <span style={s.headerIcon}>RUN</span>
          <h2 style={s.title}>Startup Cash Flow Simulator</h2>
        </div>
        <p style={s.sub}>Model runway, hiring decisions, revenue milestones, and path to profitability.</p>
      </div>

      <div style={s.scenarios}>
        {[
          { id: "base", label: "Base case", desc: "Normal execution" },
          { id: "bull", label: "Bull case", desc: "Fast growth, lean burn" },
          { id: "bear", label: "Bear case", desc: "Slow growth, higher costs" },
        ].map((item) => (
          <button key={item.id} onClick={() => setScenario(item.id as Scenario)} style={{ ...s.scenBtn, ...(scenario === item.id ? s.scenBtnActive : {}) }} type="button">
            <span style={s.scenLabel}>{item.label}</span>
            <span style={s.scenDesc}>{item.desc}</span>
          </button>
        ))}
      </div>

      <div style={s.layout}>
        <div style={s.controls}>
          <div style={s.controlSection}>
            <div style={s.ctrlTitle}>Starting position</div>
            <Slider label={`Cash in bank: ${fmt(initialCash)}`} value={initialCash} min={500000} max={50000000} step={500000} onChange={setInitialCash} />
            <Slider label={`Monthly burn: ${fmt(monthlyBurn)}`} value={monthlyBurn} min={50000} max={2000000} step={25000} onChange={setMonthlyBurn} />
            <Slider label={`Monthly revenue: ${fmt(monthlyRevenue)}`} value={monthlyRevenue} min={0} max={1000000} step={10000} onChange={setMonthlyRevenue} />
            <Slider label={`Revenue growth: ${revenueGrowth}% MoM`} value={revenueGrowth} min={0} max={50} step={1} onChange={setRevenueGrowth} />
          </div>

          <div style={s.controlSection}>
            <div style={s.ctrlTitle}>Hiring plan</div>
            {hires.map((hire, index) => (
              <div key={`${hire.role}-${hire.month}-${index}`} style={s.eventRow}>
                <div>
                  <div style={s.eventName}>M{hire.month}: {hire.role}</div>
                  <div style={s.eventCost}>{fmt(hire.monthlyCost)}/mo</div>
                </div>
                <button onClick={() => setHires((previous) => previous.filter((_, itemIndex) => itemIndex !== index))} style={s.removeBtn} type="button">x</button>
              </div>
            ))}
            {showAddHire ? (
              <div style={s.addForm}>
                <input placeholder="Role" value={newHire.role} onChange={(event) => setNewHire((previous) => ({ ...previous, role: event.target.value }))} style={s.addInput} />
                <div style={s.addRow}>
                  <input type="number" placeholder="Month" value={newHire.month} onChange={(event) => setNewHire((previous) => ({ ...previous, month: Number(event.target.value) }))} style={{ ...s.addInput, width: 70 }} />
                  <input type="number" placeholder="Monthly cost" value={newHire.monthlyCost} onChange={(event) => setNewHire((previous) => ({ ...previous, monthlyCost: Number(event.target.value) }))} style={s.addInput} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={addHire} style={s.confirmBtn} type="button">Add hire</button>
                  <button onClick={() => setShowAddHire(false)} style={s.cancelBtn} type="button">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddHire(true)} style={s.addBtn} type="button">+ Add hire</button>
            )}
          </div>

          <div style={s.controlSection}>
            <div style={s.ctrlTitle}>Revenue milestones</div>
            {revenues.map((revenue, index) => (
              <div key={`${revenue.label}-${revenue.month}-${index}`} style={s.eventRow}>
                <div>
                  <div style={s.eventName}>M{revenue.month}: {revenue.label}</div>
                  <div style={s.eventCost}>+{fmt(revenue.monthlyRevenue)}/mo</div>
                </div>
                <button onClick={() => setRevenues((previous) => previous.filter((_, itemIndex) => itemIndex !== index))} style={s.removeBtn} type="button">x</button>
              </div>
            ))}
            {showAddRevenue ? (
              <div style={s.addForm}>
                <input placeholder="Event label" value={newRevenue.label} onChange={(event) => setNewRevenue((previous) => ({ ...previous, label: event.target.value }))} style={s.addInput} />
                <div style={s.addRow}>
                  <input type="number" placeholder="Month" value={newRevenue.month} onChange={(event) => setNewRevenue((previous) => ({ ...previous, month: Number(event.target.value) }))} style={{ ...s.addInput, width: 70 }} />
                  <input type="number" placeholder="Monthly revenue" value={newRevenue.monthlyRevenue} onChange={(event) => setNewRevenue((previous) => ({ ...previous, monthlyRevenue: Number(event.target.value) }))} style={s.addInput} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={addRevenue} style={s.confirmBtn} type="button">Add milestone</button>
                  <button onClick={() => setShowAddRevenue(false)} style={s.cancelBtn} type="button">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddRevenue(true)} style={s.addBtn} type="button">+ Add milestone</button>
            )}
          </div>
        </div>

        <div style={s.results}>
          <div style={{ ...s.runwayCard, background: simulation.isViable ? "#E1F5EE" : "#FEF2F2", borderColor: simulation.isViable ? "#9FE1CB" : "#FCA5A5" }}>
            <div style={{ ...s.runwayNum, color: simulation.isViable ? "#0F6E56" : "#B91C1C" }}>
              {simulation.deadMonth ? `${simulation.deadMonth} months` : "24+ months"}
            </div>
            <div style={s.runwayLabel}>Runway in {scenario} scenario</div>
            <div style={{ ...s.runwayStatus, color: simulation.isViable ? "#1D9E75" : "#B91C1C" }}>
              {simulation.isViable ? "Viable: enough time to reach milestones" : "Critical: raise or cut burn immediately"}
            </div>
          </div>

          <div style={s.statsRow}>
            {[
              { label: "Net burn/month", value: fmt(simulation.months[0]?.netBurn || 0), color: "#B91C1C" },
              { label: "Revenue at M12", value: fmt(simulation.months[11]?.revenue || 0), color: "#1D9E75" },
              { label: "Cash at M12", value: fmt(simulation.months[11]?.cash || 0), color: "#185FA5" },
              { label: "Break-even est.", value: breakEven ? `Month ${breakEven.month}` : "24m+", color: "#534AB7" },
            ].map((stat) => (
              <div key={stat.label} style={s.statCard}>
                <div style={s.statLabel}>{stat.label}</div>
                <div style={{ ...s.statVal, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div style={s.chartWrap}>
            <div style={s.chartTitle}>Cash balance over 24 months</div>
            <div style={s.cashChart}>
              {simulation.months.map((month) => (
                <div key={month.month} style={s.cashBarGroup}>
                  <div
                    style={{
                      ...s.cashBar,
                      height: `${Math.max((month.cash / maxCash) * 120, 2)}px`,
                      background: month.cash < initialCash * 0.25 ? "#FCA5A5" : month.cash < initialCash * 0.5 ? "#FAC775" : "#1D9E75",
                    }}
                  />
                  {month.event ? <div style={s.eventMarker}>•</div> : null}
                  <div style={s.cashBarLabel}>M{month.month}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={s.tableWrap}>
            <div style={s.tableTitle}>Month-by-month breakdown</div>
            <div style={s.table}>
              <div style={s.tableHead}>
                <span>Mo</span><span>Burn</span><span>Revenue</span><span>Net</span><span>Cash</span>
              </div>
              {simulation.months.slice(0, 12).map((month) => (
                <div key={month.month} style={{ ...s.tableRow, background: month.event ? "#FFF8E6" : "transparent" }}>
                  <span style={s.monthCol}>
                    {month.month}
                    {month.event ? <span style={s.eventTag}>{month.event}</span> : null}
                  </span>
                  <span style={{ color: "#B91C1C" }}>{fmt(month.burn)}</span>
                  <span style={{ color: "#1D9E75" }}>{fmt(month.revenue)}</span>
                  <span style={{ color: month.netBurn <= 0 ? "#1D9E75" : "#B91C1C" }}>{month.netBurn <= 0 ? "+" : ""}{fmt(Math.abs(month.netBurn))}</span>
                  <span style={{ color: "#0a0a0a", fontWeight: 600 }}>{fmt(month.cash)}</span>
                </div>
              ))}
            </div>
          </div>
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
  headerIcon: { fontSize: 12, color: "#854F0B", fontWeight: 800, background: "#FAEEDA", padding: "4px 8px", borderRadius: 8 },
  title: { fontSize: 17, fontWeight: 700, color: "#0a0a0a", margin: 0 },
  sub: { fontSize: 12, color: "#888", margin: 0 },
  scenarios: { display: "flex", gap: 8, padding: "12px 22px", background: "#fafafa", borderBottom: "0.5px solid #eee" },
  scenBtn: { flex: 1, padding: "10px 12px", border: "0.5px solid #ddd", borderRadius: 10, background: "#fff", cursor: "pointer", fontFamily: "system-ui", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  scenBtnActive: { border: "1.5px solid #1D9E75", background: "#F0FAF6" },
  scenLabel: { fontSize: 12, fontWeight: 600, color: "#0a0a0a" },
  scenDesc: { fontSize: 10, color: "#777" },
  layout: { display: "grid", gridTemplateColumns: "260px 1fr" },
  controls: { padding: 14, borderRight: "0.5px solid #eee", background: "#fafafa", overflowY: "auto", maxHeight: 600 },
  controlSection: { marginBottom: 16, paddingBottom: 14, borderBottom: "0.5px solid #eee" },
  ctrlTitle: { fontSize: 11, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 },
  eventRow: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: "0.5px solid #eee", borderRadius: 7, padding: "7px 10px", marginBottom: 5, gap: 8 },
  eventName: { fontSize: 12, fontWeight: 500, color: "#333" },
  eventCost: { fontSize: 10, color: "#888" },
  removeBtn: { fontSize: 11, color: "#999", background: "none", border: "none", cursor: "pointer" },
  addForm: { background: "#fff", border: "0.5px solid #ddd", borderRadius: 8, padding: 10, marginBottom: 6 },
  addRow: { display: "flex", gap: 6, marginBottom: 6 },
  addInput: { flex: 1, padding: "6px 8px", fontSize: 12, border: "0.5px solid #ddd", borderRadius: 6, outline: "none", fontFamily: "system-ui", minWidth: 0 },
  confirmBtn: { padding: "6px 12px", fontSize: 11, fontWeight: 600, border: "none", borderRadius: 6, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  cancelBtn: { padding: "6px 12px", fontSize: 11, border: "0.5px solid #ddd", borderRadius: 6, background: "#fff", color: "#555", cursor: "pointer", fontFamily: "system-ui" },
  addBtn: { width: "100%", padding: 7, fontSize: 11, fontWeight: 500, border: "1.5px dashed #ddd", borderRadius: 7, background: "transparent", color: "#888", cursor: "pointer", fontFamily: "system-ui" },
  results: { padding: "16px 20px" },
  runwayCard: { borderRadius: 12, padding: "16px 18px", border: "0.5px solid", marginBottom: 14, textAlign: "center" },
  runwayNum: { fontSize: 32, fontWeight: 800, letterSpacing: 0, marginBottom: 4 },
  runwayLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  runwayStatus: { fontSize: 13, fontWeight: 600 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 },
  statCard: { background: "#fafafa", borderRadius: 9, padding: "10px 10px" },
  statLabel: { fontSize: 10, color: "#777", marginBottom: 3 },
  statVal: { fontSize: 13, fontWeight: 700 },
  chartWrap: { background: "#fafafa", borderRadius: 10, padding: "12px 14px", marginBottom: 14 },
  chartTitle: { fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 10 },
  cashChart: { display: "flex", alignItems: "flex-end", gap: 3, height: 130 },
  cashBarGroup: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  cashBar: { width: "100%", borderRadius: "3px 3px 0 0", transition: "all .3s", minHeight: 2 },
  eventMarker: { fontSize: 8, color: "#854F0B", marginBottom: -2 },
  cashBarLabel: { fontSize: 8, color: "#aaa" },
  tableWrap: { background: "#fafafa", borderRadius: 10, padding: "12px 14px" },
  tableTitle: { fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 8 },
  table: { fontSize: 11 },
  tableHead: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "6px 8px", fontWeight: 600, color: "#777", borderBottom: "0.5px solid #eee" },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "6px 8px", borderBottom: "0.5px solid #f5f5f5", alignItems: "center" },
  monthCol: { display: "flex", flexDirection: "column", gap: 1 },
  eventTag: { fontSize: 9, color: "#854F0B", background: "#FAEEDA", padding: "1px 5px", borderRadius: 5 },
};
