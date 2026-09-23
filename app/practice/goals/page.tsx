"use client";
import { useState } from "react";

// ============================================================
// FinanceHub — Goal-Based Financial Planner
// app/practice/goals/page.tsx
// Plan multiple financial goals with SIP calculations
// ============================================================

type GoalCategory = "home" | "car" | "education" | "retirement" | "wedding" | "travel" | "emergency" | "business" | "other";
type Priority     = "must" | "should" | "nice";

type Goal = {
  id:            string;
  name:          string;
  category:      GoalCategory;
  targetAmount:  number;
  currentSaved:  number;
  targetYear:    number;
  expectedReturn: number;
  priority:      Priority;
  inflationRate: number;
};

const CATEGORY_CONFIG: Record<GoalCategory, { icon: string; label: string; color: string; defaultReturn: number; inflation: number }> = {
  home:       { icon: "🏠", label: "Buy a Home",         color: "#1D9E75", defaultReturn: 10, inflation: 6 },
  car:        { icon: "🚗", label: "Buy a Car",          color: "#185FA5", defaultReturn: 8,  inflation: 5 },
  education:  { icon: "🎓", label: "Education",          color: "#7C3AED", defaultReturn: 10, inflation: 10 },
  retirement: { icon: "🌅", label: "Retirement",         color: "#D4A017", defaultReturn: 12, inflation: 6 },
  wedding:    { icon: "💍", label: "Wedding",            color: "#B91C1C", defaultReturn: 8,  inflation: 8 },
  travel:     { icon: "✈️", label: "Travel / Vacation",  color: "#0E6163", defaultReturn: 8,  inflation: 5 },
  emergency:  { icon: "🛡️", label: "Emergency Fund",    color: "#718096", defaultReturn: 6,  inflation: 0 },
  business:   { icon: "🏢", label: "Start a Business",  color: "#854F0B", defaultReturn: 10, inflation: 5 },
  other:      { icon: "⭐", label: "Other Goal",         color: "#5A67D8", defaultReturn: 10, inflation: 6 },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  must:   { label: "Must Achieve",     color: "#B91C1C", bg: "#FFF5F5" },
  should: { label: "Should Achieve",   color: "#D4A017", bg: "#FFFFF0" },
  nice:   { label: "Nice to Have",     color: "#38A169", bg: "#F0FFF4" },
};

const CURRENT_YEAR = new Date().getFullYear();
const genId = () => Math.random().toString(36).slice(2, 9);

const formatINR = (v: number) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(2)} Cr`
  : v >= 100000 ? `₹${(v / 100000).toFixed(1)} L`
  : v >= 1000   ? `₹${(v / 1000).toFixed(0)}K`
  : `₹${Math.round(v).toLocaleString("en-IN")}`;

function calcSIP(futureValue: number, annualReturn: number, years: number): number {
  if (years <= 0) return futureValue;
  const r = annualReturn / 100 / 12;
  const n = years * 12;
  if (r === 0) return futureValue / n;
  return futureValue * r / (Math.pow(1 + r, n) - 1);
}

function inflatedAmount(amount: number, inflation: number, years: number): number {
  return amount * Math.pow(1 + inflation / 100, years);
}

const SAMPLE_GOALS: Goal[] = [
  { id: genId(), name: "Down payment — dream flat", category: "home",       targetAmount: 2000000, currentSaved: 400000, targetYear: CURRENT_YEAR + 4, expectedReturn: 10, priority: "must",   inflationRate: 6 },
  { id: genId(), name: "Child's engineering degree",  category: "education",  targetAmount: 2500000, currentSaved: 200000, targetYear: CURRENT_YEAR + 12, expectedReturn: 12, priority: "must",  inflationRate: 10 },
  { id: genId(), name: "Retirement corpus",            category: "retirement", targetAmount: 30000000, currentSaved: 1500000, targetYear: CURRENT_YEAR + 22, expectedReturn: 12, priority: "must", inflationRate: 6 },
  { id: genId(), name: "Europe trip",                 category: "travel",     targetAmount: 500000,  currentSaved: 50000,  targetYear: CURRENT_YEAR + 2,  expectedReturn: 8,  priority: "nice",  inflationRate: 5 },
];

export default function GoalPlanner() {
  const [goals,      setGoals]      = useState<Goal[]>(SAMPLE_GOALS);
  const [showAdd,    setShowAdd]    = useState(false);
  const [sortBy,     setSortBy]     = useState<"priority" | "year" | "sip">("priority");
  const [newGoal,    setNewGoal]    = useState<Partial<Goal>>({
    category: "home", priority: "must", expectedReturn: 10, inflationRate: 6, targetYear: CURRENT_YEAR + 5, currentSaved: 0,
  });

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0",
    borderRadius: 8, fontSize: 13, fontFamily: "var(--font-ui,system-ui)",
    outline: "none", boxSizing: "border-box",
  };

  const handleCategoryChange = (cat: GoalCategory) => {
    const config = CATEGORY_CONFIG[cat];
    setNewGoal(p => ({
      ...p,
      category:       cat,
      expectedReturn: config.defaultReturn,
      inflationRate:  config.inflation,
    }));
  };

  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetYear) return;
    setGoals(prev => [...prev, { ...newGoal, id: genId() } as Goal]);
    setNewGoal({ category: "home", priority: "must", expectedReturn: 10, inflationRate: 6, targetYear: CURRENT_YEAR + 5, currentSaved: 0 });
    setShowAdd(false);
  };

  const removeGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));

  // Enriched goals with calculations
  const enriched = goals.map(g => {
    const years          = Math.max(0, g.targetYear - CURRENT_YEAR);
    const inflatedTarget = inflatedAmount(g.targetAmount, g.inflationRate, years);
    const remaining      = Math.max(0, inflatedTarget - g.currentSaved * Math.pow(1 + g.expectedReturn / 100, years));
    const sipNeeded      = calcSIP(remaining, g.expectedReturn, years);
    const progress       = Math.min(100, g.currentSaved / inflatedTarget * 100);
    const cat            = CATEGORY_CONFIG[g.category];
    const pri            = PRIORITY_CONFIG[g.priority];
    return { ...g, years, inflatedTarget, remaining, sipNeeded, progress, cat, pri };
  });

  const sorted = [...enriched].sort((a, b) => {
    if (sortBy === "priority") {
      const order = { must: 0, should: 1, nice: 2 };
      return order[a.priority] - order[b.priority];
    }
    if (sortBy === "year")  return a.targetYear - b.targetYear;
    if (sortBy === "sip")   return b.sipNeeded - a.sipNeeded;
    return 0;
  });

  const totalSIPNeeded = enriched.filter(g => g.priority === "must").reduce((s, g) => s + g.sipNeeded, 0);
  const totalSIPAll    = enriched.reduce((s, g) => s + g.sipNeeded, 0);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px", fontFamily: "var(--font-ui,system-ui)" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1c2b3a", marginBottom: 6, letterSpacing: "-0.4px" }}>
          🎯 Goal-Based Financial Planner
        </h1>
        <p style={{ fontSize: 14, color: "#718096", lineHeight: 1.6 }}>
          Define your financial goals. We calculate the exact SIP needed for each — adjusted for inflation.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Goals defined",      value: goals.length,                    icon: "🎯", color: "#0E6163" },
          { label: "Must-achieve SIP",   value: formatINR(totalSIPNeeded) + "/mo", icon: "💰", color: "#B91C1C" },
          { label: "Total SIP (all goals)",value: formatINR(totalSIPAll) + "/mo",  icon: "📈", color: "#185FA5" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 14, padding: "16px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#718096", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#718096" }}>Sort by:</span>
        {(["priority", "year", "sip"] as const).map(s => (
          <button key={s} onClick={() => setSortBy(s)}
            style={{
              padding: "6px 12px", fontSize: 12, fontWeight: sortBy === s ? 700 : 400,
              background: sortBy === s ? "#1c2b3a" : "#fff",
              color: sortBy === s ? "#fff" : "#718096",
              border: `1px solid ${sortBy === s ? "#1c2b3a" : "#e2e8f0"}`,
              borderRadius: 20, cursor: "pointer", fontFamily: "var(--font-ui,system-ui)",
              textTransform: "capitalize",
            }}>
            {s === "sip" ? "SIP Required" : s}
          </button>
        ))}
        <button onClick={() => setShowAdd(s => !s)}
          style={{
            marginLeft: "auto", padding: "8px 18px",
            background: "#0E6163", color: "#fff",
            border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--font-ui,system-ui)",
          }}>
          + Add Goal
        </button>
      </div>

      {/* Add goal form */}
      {showAdd && (
        <div style={{
          background: "#f0f9f9", border: "1px solid #0E616330",
          borderRadius: 14, padding: 20, marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0E6163", marginBottom: 16 }}>New Financial Goal</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Goal Name</label>
              <input value={newGoal.name || ""} onChange={e => setNewGoal(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Daughter's college fund" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Category</label>
              <select value={newGoal.category} onChange={e => handleCategoryChange(e.target.value as GoalCategory)} style={inputStyle}>
                {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Target Amount Today (₹)</label>
              <input type="number" value={newGoal.targetAmount || ""}
                onChange={e => setNewGoal(p => ({ ...p, targetAmount: Number(e.target.value) }))}
                placeholder="e.g. 2500000" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Already Saved (₹)</label>
              <input type="number" value={newGoal.currentSaved || ""}
                onChange={e => setNewGoal(p => ({ ...p, currentSaved: Number(e.target.value) }))}
                placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Target Year</label>
              <input type="number" value={newGoal.targetYear || ""}
                onChange={e => setNewGoal(p => ({ ...p, targetYear: Number(e.target.value) }))}
                min={CURRENT_YEAR + 1} max={CURRENT_YEAR + 40} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Priority</label>
              <select value={newGoal.priority} onChange={e => setNewGoal(p => ({ ...p, priority: e.target.value as Priority }))} style={inputStyle}>
                <option value="must">Must Achieve</option>
                <option value="should">Should Achieve</option>
                <option value="nice">Nice to Have</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Expected Return (% p.a.)</label>
              <input type="number" value={newGoal.expectedReturn || ""} step="0.5"
                onChange={e => setNewGoal(p => ({ ...p, expectedReturn: Number(e.target.value) }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 4 }}>Inflation Rate (% p.a.)</label>
              <input type="number" value={newGoal.inflationRate || ""} step="0.5"
                onChange={e => setNewGoal(p => ({ ...p, inflationRate: Number(e.target.value) }))} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addGoal} style={{
              padding: "9px 20px", background: "#0E6163", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "var(--font-ui,system-ui)",
            }}>Add Goal</button>
            <button onClick={() => setShowAdd(false)} style={{
              padding: "9px 14px", background: "#fff", color: "#718096",
              border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13,
              cursor: "pointer", fontFamily: "var(--font-ui,system-ui)",
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Goal cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {sorted.map(goal => (
          <div key={goal.id} style={{
            background: "#fff",
            border: `1px solid ${goal.cat.color}25`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}>
            {/* Card top bar */}
            <div style={{
              height: 5,
              background: `linear-gradient(90deg, ${goal.cat.color} ${goal.progress}%, #EDF2F7 ${goal.progress}%)`,
            }} />

            <div style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                {/* Left: name + meta */}
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: goal.cat.color + "18",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, flexShrink: 0,
                  }}>
                    {goal.cat.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1c2b3a", margin: "0 0 4px" }}>
                      {goal.name}
                    </h3>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                        background: goal.pri.bg, color: goal.pri.color,
                      }}>
                        {goal.pri.label}
                      </span>
                      <span style={{ fontSize: 12, color: "#718096" }}>
                        🗓 {goal.targetYear} · {goal.years} years away
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: SIP */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: goal.cat.color }}>
                    {formatINR(goal.sipNeeded)}/mo
                  </div>
                  <div style={{ fontSize: 11, color: "#a0aec0" }}>SIP needed</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12 }}>
                  <span style={{ color: "#718096" }}>
                    Saved: <strong style={{ color: "#1c2b3a" }}>{formatINR(goal.currentSaved)}</strong>
                  </span>
                  <span style={{ color: "#718096" }}>
                    Inflation-adjusted target: <strong style={{ color: goal.cat.color }}>{formatINR(goal.inflatedTarget)}</strong>
                  </span>
                </div>
                <div style={{ height: 8, background: "#EDF2F7", borderRadius: 999 }}>
                  <div style={{
                    height: "100%", width: `${goal.progress}%`,
                    background: goal.cat.color, borderRadius: 999,
                    transition: "width 0.8s ease",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "#a0aec0", marginTop: 4 }}>
                  {goal.progress.toFixed(1)}% funded
                </div>
              </div>

              {/* Metrics row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {[
                  { label: "Today's value",   value: formatINR(goal.targetAmount) },
                  { label: "Inflation adj.",  value: formatINR(goal.inflatedTarget) },
                  { label: "Still needed",    value: formatINR(Math.max(0, goal.remaining)) },
                  { label: "Return assumed",  value: `${goal.expectedReturn}% p.a.` },
                ].map(m => (
                  <div key={m.label} style={{ background: "#f8f9fa", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2b3a" }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: "#a0aec0" }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Remove */}
              <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => removeGoal(goal.id)}
                  style={{ fontSize: 12, color: "#CBD5E0", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-ui,system-ui)" }}>
                  Remove goal
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total SIP summary */}
      <div style={{
        marginTop: 24, background: "#1c2b3a", borderRadius: 14,
        padding: "20px 24px", color: "#fff",
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "#fff" }}>
          📊 Your Monthly SIP Allocation
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {(["must", "should", "nice"] as Priority[]).map(p => {
            const pri   = PRIORITY_CONFIG[p];
            const total = enriched.filter(g => g.priority === p).reduce((s, g) => s + g.sipNeeded, 0);
            return (
              <div key={p} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: pri.color, marginBottom: 4 }}>{pri.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{formatINR(total)}/mo</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  {enriched.filter(g => g.priority === p).length} goal{enriched.filter(g => g.priority === p).length !== 1 ? "s" : ""}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Total monthly SIP commitment</span>
          <span style={{ fontSize: 26, fontWeight: 900, color: "#1D9E75" }}>{formatINR(totalSIPAll)}/mo</span>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: "#a0aec0", lineHeight: 1.6 }}>
        🧮 SIP calculations assume constant returns. Actual returns vary. Inflation adjusts the target amount forward
        to today&apos;s rupee equivalent in the future year. Consult a SEBI-registered financial planner for personalised advice.
      </div>
    </div>
  );
}
