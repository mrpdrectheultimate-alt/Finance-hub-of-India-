"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useState } from "react";

const PERSONAS = [
  { id: "student", label: "Student", icon: "ST", desc: "School / college" },
  { id: "professional", label: "Professional", icon: "PR", desc: "Working adult" },
  { id: "trader", label: "Trader", icon: "TR", desc: "Active investor" },
  { id: "founder", label: "Founder", icon: "FO", desc: "Startup / business" },
];

const TIMEFRAMES = [
  { days: "30", label: "30 days", icon: "30", desc: "Quick sprint" },
  { days: "60", label: "60 days", icon: "60", desc: "Steady build" },
  { days: "90", label: "90 days", icon: "90", desc: "Deep mastery" },
];

const EXAM_TARGETS = [
  { id: "", label: "No exam" },
  { id: "CFA L1", label: "CFA Level 1" },
  { id: "FRM Part 1", label: "FRM Part 1" },
  { id: "CA Final", label: "CA Final" },
  { id: "MBA Finance", label: "MBA Finance" },
  { id: "NISM", label: "NISM Certification" },
];

type RoadmapData = {
  overview: string;
  weekly_schedule?: {
    week: number;
    theme: string;
    focus_track: string;
    daily_plan?: {
      day: string;
      tasks?: { type: string; topic: string; duration_mins: number }[];
      total_mins: number;
    }[];
    milestone: string;
  }[];
  key_milestones?: { day: number; milestone: string }[];
  daily_habit?: string;
  success_metric?: string;
};

export default function AiRoadmapPlanner() {
  const [goal, setGoal] = useState("");
  const [persona, setPersona] = useState("professional");
  const [timeframe, setTimeframe] = useState("30");
  const [hoursPerDay, setHoursPerDay] = useState(1);
  const [examTarget, setExamTarget] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [activeWeek, setActiveWeek] = useState(0);

  const generate = async () => {
    if (!goal.trim()) {
      setError("Please describe your learning goal");
      return;
    }

    setGenerating(true);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("Please log in");
      setGenerating(false);
      return;
    }

    const res = await fetch("/api/ai-roadmap-planner", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ goal, persona, timeframe, hoursPerDay, examTarget }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to generate roadmap");
      setGenerating(false);
      return;
    }

    setRoadmap(data.roadmap);
    setActiveWeek(0);
    setGenerating(false);
  };

  const taskTypeColor: Record<string, string> = {
    lesson: "#E1F5EE",
    quiz: "#EEEDFE",
    review: "#FAEEDA",
  };

  return (
    <div style={s.page}>
      <Link href="/dashboard" style={s.back}>
        Back to dashboard
      </Link>

      <div style={s.header}>
        <div style={s.headerIcon}>AI</div>
        <h1 style={s.title}>AI Learning Roadmap</h1>
        <p style={s.sub}>Get a personalised day-by-day learning plan built around your goal.</p>
      </div>

      {!roadmap ? (
        <div style={s.setupCard}>
          <div style={s.field}>
            <label style={s.label}>What is your learning goal? *</label>
            <textarea
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              rows={3}
              placeholder="Example: I want to understand the stock market well enough to start investing monthly in index funds and understand tax planning basics."
              style={s.textarea}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>I am a...</label>
            <div style={s.personaGrid}>
              {PERSONAS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPersona(item.id)}
                  style={{ ...s.personaBtn, ...(persona === item.id ? s.personaBtnActive : {}) }}
                  type="button"
                >
                  <span style={s.personaIcon}>{item.icon}</span>
                  <span style={s.personaLabel}>{item.label}</span>
                  <span style={s.personaDesc}>{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Timeframe</label>
            <div style={s.timeframeRow}>
              {TIMEFRAMES.map((item) => (
                <button
                  key={item.days}
                  onClick={() => setTimeframe(item.days)}
                  style={{ ...s.timeframeBtn, ...(timeframe === item.days ? s.timeframeBtnActive : {}) }}
                  type="button"
                >
                  <span style={s.timeframeIcon}>{item.icon}</span>
                  <span style={s.timeframeLabel}>{item.label}</span>
                  <span style={s.timeframeDesc}>{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>
              Hours available per day: <strong>{hoursPerDay}h</strong>
            </label>
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.5}
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(Number(event.target.value))}
              style={{ width: "100%", accentColor: "#1D9E75" }}
            />
            <div style={s.hoursHints}>
              <span>30m</span>
              <span>1h</span>
              <span>2h</span>
              <span>3h</span>
              <span>4h</span>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Exam target (optional)</label>
            <select value={examTarget} onChange={(event) => setExamTarget(event.target.value)} style={s.select}>
              {EXAM_TARGETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {error ? <div style={s.errorBox}>{error}</div> : null}

          <button onClick={generate} disabled={generating || !goal.trim()} style={{ ...s.generateBtn, opacity: generating || !goal.trim() ? 0.6 : 1 }} type="button">
            {generating ? "Generating your roadmap..." : `Generate ${timeframe}-day roadmap`}
          </button>
        </div>
      ) : (
        <div>
          <div style={s.overviewCard}>
            <div style={s.overviewBadge}>Your personalised roadmap</div>
            <p style={s.overviewText}>{roadmap.overview}</p>
            <div style={s.overviewMeta}>
              <span style={s.metaBadge}>{timeframe} days</span>
              <span style={s.metaBadge}>{hoursPerDay}h/day</span>
              {examTarget ? <span style={s.metaBadge}>{examTarget}</span> : null}
            </div>
          </div>

          {roadmap.daily_habit ? (
            <div style={s.habitCard}>
              <div style={s.habitIcon}>DAILY</div>
              <div>
                <div style={s.habitTitle}>Daily habit for the next {timeframe} days</div>
                <div style={s.habitText}>{roadmap.daily_habit}</div>
              </div>
            </div>
          ) : null}

          {roadmap.key_milestones?.length ? (
            <div style={s.milestonesCard}>
              <div style={s.sectionTitle}>Key milestones</div>
              <div style={s.milestonesList}>
                {roadmap.key_milestones.map((milestone, index) => (
                  <div key={index} style={s.milestoneItem}>
                    <div style={s.milestoneDay}>Day {milestone.day}</div>
                    <div style={s.milestoneDivider} />
                    <div style={s.milestoneText}>{milestone.milestone}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {roadmap.weekly_schedule?.length ? (
            <div style={s.scheduleCard}>
              <div style={s.sectionTitle}>Weekly schedule</div>
              <div style={s.weekTabs}>
                {roadmap.weekly_schedule.map((week, index) => (
                  <button key={index} onClick={() => setActiveWeek(index)} style={{ ...s.weekTab, ...(activeWeek === index ? s.weekTabActive : {}) }} type="button">
                    Week {week.week}
                  </button>
                ))}
              </div>

              {roadmap.weekly_schedule[activeWeek] ? (
                <div>
                  <div style={s.weekHeader}>
                    <div style={s.weekTheme}>{roadmap.weekly_schedule[activeWeek].theme}</div>
                    <div style={s.weekMilestone}>Goal: {roadmap.weekly_schedule[activeWeek].milestone}</div>
                  </div>

                  {roadmap.weekly_schedule[activeWeek].daily_plan?.map((day, index) => (
                    <div key={index} style={s.dayCard}>
                      <div style={s.dayName}>{day.day}</div>
                      <div style={s.dayTasks}>
                        {day.tasks?.map((task, taskIndex) => (
                          <div key={taskIndex} style={{ ...s.taskItem, background: taskTypeColor[task.type] || "#f5f5f3" }}>
                            <span style={s.taskType}>{task.type}</span>
                            <span style={s.taskTopic}>{task.topic}</span>
                            <span style={s.taskDuration}>{task.duration_mins}m</span>
                          </div>
                        ))}
                      </div>
                      <div style={s.dayTotal}>{day.total_mins} min total</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {roadmap.success_metric ? (
            <div style={s.successCard}>
              <div style={s.successIcon}>OK</div>
              <div>
                <div style={s.successTitle}>How to measure success</div>
                <div style={s.successText}>{roadmap.success_metric}</div>
              </div>
            </div>
          ) : null}

          <div style={s.actions}>
            <button onClick={() => setRoadmap(null)} style={s.newBtn} type="button">
              Generate new roadmap
            </button>
            <Link href="/explore" style={s.startBtn}>
              Start learning now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui,-apple-system,sans-serif", padding: "24px 24px 60px", maxWidth: 760, margin: "0 auto" },
  back: { fontSize: 13, color: "#888", textDecoration: "none", display: "block", marginBottom: 20 },
  header: { textAlign: "center", marginBottom: 28 },
  headerIcon: { width: 40, height: 40, borderRadius: 10, background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 14, fontWeight: 800 },
  title: { fontSize: 26, fontWeight: 700, letterSpacing: 0, color: "#0a0a0a", margin: "0 0 8px" },
  sub: { fontSize: 14, color: "#888", margin: 0 },
  setupCard: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 14, padding: 24 },
  field: { marginBottom: 20 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 8 },
  textarea: { width: "100%", padding: "10px 12px", fontSize: 13, border: "0.5px solid #ddd", borderRadius: 8, outline: "none", fontFamily: "system-ui", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" as const },
  personaGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 },
  personaBtn: { padding: "12px 8px", border: "0.5px solid #ddd", borderRadius: 10, background: "#fff", cursor: "pointer", fontFamily: "system-ui", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  personaBtnActive: { border: "1.5px solid #1D9E75", background: "#F0FAF6" },
  personaIcon: { fontSize: 12, fontWeight: 800, color: "#1D9E75" },
  personaLabel: { fontSize: 12, fontWeight: 600, color: "#0a0a0a" },
  personaDesc: { fontSize: 10, color: "#aaa" },
  timeframeRow: { display: "flex", gap: 10 },
  timeframeBtn: { flex: 1, padding: 12, border: "0.5px solid #ddd", borderRadius: 10, background: "#fff", cursor: "pointer", fontFamily: "system-ui", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  timeframeBtnActive: { border: "1.5px solid #1D9E75", background: "#F0FAF6" },
  timeframeIcon: { fontSize: 12, fontWeight: 800, color: "#1D9E75" },
  timeframeLabel: { fontSize: 13, fontWeight: 600, color: "#0a0a0a" },
  timeframeDesc: { fontSize: 10, color: "#aaa" },
  hoursHints: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa", marginTop: 4 },
  select: { width: "100%", padding: "9px 12px", fontSize: 13, border: "0.5px solid #ddd", borderRadius: 8, outline: "none", fontFamily: "system-ui", background: "#fff" },
  errorBox: { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#B91C1C", marginBottom: 14 },
  generateBtn: { width: "100%", padding: 13, fontSize: 14, fontWeight: 600, border: "none", borderRadius: 10, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  overviewCard: { background: "#0a0a0a", borderRadius: 14, padding: "22px 24px", marginBottom: 14 },
  overviewBadge: { fontSize: 11, fontWeight: 600, color: "#1D9E75", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 },
  overviewText: { fontSize: 15, color: "#eee", lineHeight: 1.7, margin: "0 0 14px" },
  overviewMeta: { display: "flex", gap: 8, flexWrap: "wrap" },
  metaBadge: { fontSize: 11, background: "rgba(255,255,255,0.1)", color: "#ccc", padding: "4px 10px", borderRadius: 20 },
  habitCard: { display: "flex", gap: 12, background: "#FFF8E6", border: "0.5px solid #FAC775", borderRadius: 12, padding: "14px 16px", marginBottom: 14, alignItems: "flex-start" },
  habitIcon: { fontSize: 10, flexShrink: 0, fontWeight: 800, color: "#854F0B" },
  habitTitle: { fontWeight: 600, fontSize: 13, color: "#854F0B", marginBottom: 4 },
  habitText: { fontSize: 13, color: "#633806", lineHeight: 1.6 },
  milestonesCard: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "18px 20px", marginBottom: 14 },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: "#0a0a0a", marginBottom: 14 },
  milestonesList: { display: "flex", flexDirection: "column", gap: 10 },
  milestoneItem: { display: "flex", alignItems: "center", gap: 12 },
  milestoneDay: { fontSize: 11, fontWeight: 700, color: "#1D9E75", background: "#E1F5EE", padding: "3px 9px", borderRadius: 20, flexShrink: 0 },
  milestoneDivider: { width: 20, height: 1, background: "#eee", flexShrink: 0 },
  milestoneText: { fontSize: 13, color: "#444" },
  scheduleCard: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "18px 20px", marginBottom: 14 },
  weekTabs: { display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" },
  weekTab: { padding: "6px 14px", fontSize: 12, fontWeight: 500, border: "0.5px solid #ddd", borderRadius: 20, background: "#fff", color: "#666", cursor: "pointer", fontFamily: "system-ui" },
  weekTabActive: { background: "#0a0a0a", color: "#fff", border: "0.5px solid #0a0a0a" },
  weekHeader: { background: "#fafafa", borderRadius: 8, padding: "10px 14px", marginBottom: 12 },
  weekTheme: { fontWeight: 600, fontSize: 14, color: "#0a0a0a", marginBottom: 3 },
  weekMilestone: { fontSize: 12, color: "#888" },
  dayCard: { borderBottom: "0.5px solid #f5f5f5", padding: "10px 0" },
  dayName: { fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 7 },
  dayTasks: { display: "flex", flexDirection: "column", gap: 5 },
  taskItem: { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 7 },
  taskType: { fontSize: 10, color: "#555", textTransform: "uppercase", fontWeight: 700, flexShrink: 0 },
  taskTopic: { fontSize: 12, color: "#333", flex: 1 },
  taskDuration: { fontSize: 11, color: "#aaa", flexShrink: 0 },
  dayTotal: { fontSize: 11, color: "#aaa", textAlign: "right", marginTop: 5 },
  successCard: { display: "flex", gap: 12, background: "#E1F5EE", border: "0.5px solid #9FE1CB", borderRadius: 12, padding: "14px 16px", marginBottom: 20, alignItems: "flex-start" },
  successIcon: { fontSize: 10, flexShrink: 0, fontWeight: 800, color: "#0F6E56" },
  successTitle: { fontWeight: 600, fontSize: 13, color: "#0F6E56", marginBottom: 4 },
  successText: { fontSize: 13, color: "#04342C", lineHeight: 1.6 },
  actions: { display: "flex", gap: 10 },
  newBtn: { padding: "12px 20px", fontSize: 13, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 9, background: "#fff", color: "#555", cursor: "pointer", fontFamily: "system-ui" },
  startBtn: { flex: 1, padding: "12px 20px", fontSize: 13, fontWeight: 600, background: "#1D9E75", color: "#fff", borderRadius: 9, textDecoration: "none", textAlign: "center" },
};
