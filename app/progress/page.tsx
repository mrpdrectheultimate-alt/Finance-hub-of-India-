"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ProgressRow = {
  lesson_id: string;
  quiz_score: number | null;
  time_spent_secs: number;
  completed_at: string;
};

export default function ProgressPage() {
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const [{ data: progress }, { data: profile }] = await Promise.all([
        supabase
          .from("user_progress")
          .select("lesson_id, quiz_score, time_spent_secs, completed_at")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false }),
        supabase.from("profiles").select("xp_total").eq("id", user.id).single(),
      ]);

      setRows((progress as ProgressRow[]) || []);
      setXp(profile?.xp_total || 0);
      setLoading(false);
    };

    void load();
  }, []);

  const quizScores = rows.filter((row) => row.quiz_score !== null).map((row) => row.quiz_score as number);
  const avgQuiz = quizScores.length ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length) : 0;
  const minutes = Math.round(rows.reduce((sum, row) => sum + (row.time_spent_secs || 0), 0) / 60);

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <Link href="/dashboard" style={s.back}>Dashboard</Link>
        <h1 style={s.title}>My progress</h1>
        <p style={s.sub}>A quick view of your learning activity across FinanceHub.</p>

        {loading ? (
          <div style={s.card}>Loading progress...</div>
        ) : (
          <>
            <div style={s.grid}>
              <Stat label="Total XP" value={xp.toLocaleString("en-IN")} />
              <Stat label="Lessons completed" value={rows.length.toString()} />
              <Stat label="Average quiz score" value={`${avgQuiz}%`} />
              <Stat label="Time learning" value={`${minutes} min`} />
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Recent activity</div>
              {rows.length ? rows.slice(0, 12).map((row) => (
                <div key={`${row.lesson_id}-${row.completed_at}`} style={s.row}>
                  <div>
                    <div style={s.rowTitle}>Lesson completed</div>
                    <div style={s.rowMeta}>{new Date(row.completed_at).toLocaleDateString("en-IN")}</div>
                  </div>
                  {row.quiz_score !== null ? <div style={s.score}>{row.quiz_score}% quiz</div> : null}
                </div>
              )) : (
                <div style={s.empty}>Complete your first lesson to start tracking progress.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={s.stat}>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui,-apple-system,sans-serif", padding: "28px 20px 60px" },
  inner: { maxWidth: 760, margin: "0 auto" },
  back: { fontSize: 13, color: "#888", textDecoration: "none", display: "block", marginBottom: 16 },
  title: { fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "#0a0a0a" },
  sub: { fontSize: 14, color: "#666", margin: "0 0 24px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 18 },
  stat: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: 16 },
  statValue: { fontSize: 22, fontWeight: 800, color: "#1D9E75", marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#777" },
  card: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: 18 },
  cardTitle: { fontWeight: 700, fontSize: 15, marginBottom: 12 },
  row: { display: "flex", justifyContent: "space-between", gap: 12, padding: "11px 0", borderTop: "0.5px solid #f0f0f0" },
  rowTitle: { fontSize: 13, fontWeight: 600, color: "#222" },
  rowMeta: { fontSize: 12, color: "#999", marginTop: 2 },
  score: { fontSize: 12, fontWeight: 700, color: "#0F6E56", background: "#E1F5EE", borderRadius: 999, padding: "4px 10px", height: "fit-content" },
  empty: { fontSize: 13, color: "#888", padding: "18px 0" },
};
