"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type QuizRow = {
  id: string;
  title: string;
  lesson_id: string | null;
  passing_score: number | null;
  created_at?: string | null;
};

type LessonRow = {
  id: string;
  title: string;
};

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [lessonsById, setLessonsById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    setError("");

    const client = supabase as any;
    const [{ data: quizData, error: quizError }, { data: lessonData }] = await Promise.all([
      client.from("quizzes").select("*").order("created_at", { ascending: false }),
      supabase.from("lessons").select("id, title"),
    ]);

    if (quizError) {
      setError(quizError.message || "Failed to load quizzes");
      setLoading(false);
      return;
    }

    const lessonMap = ((lessonData || []) as LessonRow[]).reduce<Record<string, string>>((acc, lesson) => {
      acc[lesson.id] = lesson.title;
      return acc;
    }, {});

    setLessonsById(lessonMap);
    setQuizzes((quizData || []) as QuizRow[]);
    setLoading(false);
  };

  const deleteQuiz = async (quizId: string) => {
    if (!window.confirm("Delete this quiz? This cannot be undone.")) return;
    const client = supabase as any;
    await client.from("quiz_questions").delete().eq("quiz_id", quizId);
    const { error: deleteError } = await client.from("quizzes").delete().eq("id", quizId);
    if (deleteError) {
      setError(deleteError.message || "Failed to delete quiz");
      return;
    }
    setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
  };

  return (
    <div style={s.page}>
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoMark}>F</div>
          <div>
            <div style={s.logoText}>FinanceHub</div>
            <div style={s.adminTag}>Admin</div>
          </div>
        </div>
        <nav style={s.nav}>
          <Link href="/admin" style={s.navItem}><span style={s.navIcon}>OV</span>Overview</Link>
          <Link href="/admin/lessons" style={s.navItem}><span style={s.navIcon}>LS</span>Lessons</Link>
          <Link href="/admin/quizzes" style={{ ...s.navItem, ...s.navActive }}><span style={s.navIcon}>QZ</span>Quizzes</Link>
          <Link href="/admin/users" style={s.navItem}><span style={s.navIcon}>US</span>Users</Link>
        </nav>
        <Link href="/dashboard" style={s.backToApp}>Back to app</Link>
      </aside>

      <main style={s.main}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>Quizzes</h1>
            <p style={s.subtitle}>Create and manage lesson quizzes.</p>
          </div>
          <Link href="/admin/quizzes/new" style={s.newBtn}>New quiz</Link>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        <section style={s.panel}>
          {loading ? (
            <div style={s.empty}>Loading quizzes...</div>
          ) : quizzes.length === 0 ? (
            <div style={s.empty}>
              <div style={s.emptyTitle}>No quizzes yet</div>
              <Link href="/admin/quizzes/new" style={s.inlineBtn}>Create your first quiz</Link>
            </div>
          ) : (
            <div style={s.table}>
              <div style={{ ...s.row, ...s.head }}>
                <span>Quiz</span>
                <span>Lesson</span>
                <span>Passing</span>
                <span>Actions</span>
              </div>
              {quizzes.map((quiz) => (
                <div key={quiz.id} style={s.row}>
                  <div style={s.quizTitle}>{quiz.title}</div>
                  <div style={s.muted}>{quiz.lesson_id ? lessonsById[quiz.lesson_id] || "Unknown lesson" : "No lesson"}</div>
                  <div style={s.muted}>{quiz.passing_score || 70}%</div>
                  <div style={s.actions}>
                    <Link href={`/admin/quizzes/${quiz.id}`} style={s.editLink}>Edit</Link>
                    <button type="button" onClick={() => void deleteQuiz(quiz.id)} style={s.deleteBtn}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui,-apple-system,sans-serif" },
  sidebar: { width: 200, background: "#0a0a0a", display: "flex", flexDirection: "column", padding: "20px 0", position: "fixed", height: "100vh" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "0 16px 24px" },
  logoMark: { width: 28, height: 28, background: "#1D9E75", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 },
  logoText: { fontWeight: 600, fontSize: 14, color: "#fff" },
  adminTag: { fontSize: 10, color: "#1D9E75", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" },
  nav: { display: "flex", flexDirection: "column", gap: 2, padding: "0 8px", flex: 1 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, fontSize: 13, color: "#aaa", textDecoration: "none" },
  navActive: { background: "rgba(255,255,255,0.08)", color: "#fff" },
  navIcon: { width: 24, color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: ".04em" },
  backToApp: { fontSize: 12, color: "#666", textDecoration: "none", padding: "12px 16px", borderTop: "0.5px solid #222" },
  main: { marginLeft: 200, flex: 1, padding: "24px 28px" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: "-0.4px" },
  subtitle: { margin: "6px 0 0", color: "#777", fontSize: 13 },
  newBtn: { padding: "10px 16px", background: "#1D9E75", color: "#fff", borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: "none" },
  errorBox: { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 10, color: "#B91C1C", padding: "10px 14px", marginBottom: 14, fontSize: 13 },
  panel: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, overflow: "hidden" },
  table: { display: "flex", flexDirection: "column" },
  row: { display: "grid", gridTemplateColumns: "1.4fr 1.4fr 100px 150px", gap: 16, alignItems: "center", padding: "14px 18px", borderBottom: "0.5px solid #eee", fontSize: 13 },
  head: { background: "#fafafa", color: "#888", fontWeight: 700, fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase" },
  quizTitle: { fontWeight: 650, color: "#111" },
  muted: { color: "#666" },
  actions: { display: "flex", alignItems: "center", gap: 10 },
  editLink: { color: "#1D9E75", fontWeight: 600, textDecoration: "none" },
  deleteBtn: { border: "none", background: "transparent", color: "#B91C1C", cursor: "pointer", fontSize: 13, padding: 0, fontFamily: "system-ui" },
  empty: { padding: 40, textAlign: "center", color: "#777", fontSize: 14 },
  emptyTitle: { color: "#111", fontSize: 16, fontWeight: 700, marginBottom: 12 },
  inlineBtn: { color: "#1D9E75", fontWeight: 600, textDecoration: "none" },
};
