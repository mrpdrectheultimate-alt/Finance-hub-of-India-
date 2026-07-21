"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Lesson = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  is_free: boolean;
  duration_minutes: number;
  order_index: number;
  created_at: string;
  level: {
    title: string;
    track: {
      title: string;
      color_hex: string;
      icon: string | null;
    } | null;
  } | null;
};

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("lessons")
      .select("*, level:levels(title, track:tracks(title, color_hex, icon))")
      .order("created_at", { ascending: false });

    setLessons((data as Lesson[]) || []);
    setLoading(false);
  };

  const togglePublish = async (lesson: Lesson) => {
    setSaving(lesson.id);
    await supabase.from("lessons").update({ is_published: !lesson.is_published }).eq("id", lesson.id);
    setLessons((prev) =>
      prev.map((item) => (item.id === lesson.id ? { ...item, is_published: !item.is_published } : item)),
    );
    setSaving(null);
  };

  const toggleFree = async (lesson: Lesson) => {
    setSaving(lesson.id);
    await supabase.from("lessons").update({ is_free: !lesson.is_free }).eq("id", lesson.id);
    setLessons((prev) => prev.map((item) => (item.id === lesson.id ? { ...item, is_free: !item.is_free } : item)));
    setSaving(null);
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;

    await supabase.from("lessons").delete().eq("id", id);
    setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
  };

  const filtered = lessons.filter((lesson) => {
    const query = search.toLowerCase();
    const matchFilter = filter === "all" || (filter === "published" ? lesson.is_published : !lesson.is_published);
    const matchSearch =
      lesson.title.toLowerCase().includes(query) ||
      lesson.level?.title?.toLowerCase().includes(query) ||
      lesson.level?.track?.title?.toLowerCase().includes(query);

    return matchFilter && Boolean(matchSearch);
  });

  const published = lessons.filter((lesson) => lesson.is_published).length;
  const drafts = lessons.filter((lesson) => !lesson.is_published).length;

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
          {[
            { icon: "OV", label: "Overview", href: "/admin" },
            { icon: "LS", label: "Lessons", href: "/admin/lessons", active: true },
            { icon: "US", label: "Users", href: "/admin/users" },
            { icon: "AN", label: "Analytics", href: "/admin/analytics" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ ...s.navItem, ...(item.active ? s.navActive : {}) }}>
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <Link href="/dashboard" style={s.backToApp}>
          Back to app
        </Link>
      </aside>

      <main style={s.main}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>Lessons</h1>
            <p style={s.sub}>
              {published} published | {drafts} drafts | {lessons.length} total
            </p>
          </div>
          <Link href="/admin/lessons/new" style={s.addBtn}>
            Add lesson
          </Link>
        </div>

        <div style={s.toolbar}>
          <div style={s.filterTabs}>
            {(["all", "published", "draft"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{ ...s.filterTab, ...(filter === tab ? s.filterActive : {}) }}
                type="button"
              >
                {tab === "all"
                  ? `All (${lessons.length})`
                  : tab === "published"
                    ? `Published (${published})`
                    : `Drafts (${drafts})`}
              </button>
            ))}
          </div>
          <input
            placeholder="Search lessons..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={s.searchInput}
          />
        </div>

        <div style={s.table}>
          <div style={s.tableHeader}>
            {["Lesson", "Track / Level", "Status", "Access", "Duration", "Actions"].map((header) => (
              <div key={header} style={s.th}>
                {header}
              </div>
            ))}
          </div>

          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i} style={s.skeletonRow} />)
          ) : filtered.length === 0 ? (
            <div style={s.empty}>No lessons found</div>
          ) : (
            filtered.map((lesson) => (
              <div key={lesson.id} style={s.tableRow}>
                <div style={s.td}>
                  <div style={s.lessonTitle}>{lesson.title}</div>
                  <div style={s.lessonSlug}>/learn/{lesson.id.slice(0, 8)}...</div>
                </div>

                <div style={s.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        ...s.trackDot,
                        background: lesson.level?.track?.color_hex || "#1D9E75",
                      }}
                    />
                    <div>
                      <div style={s.trackTitle}>{lesson.level?.track?.title || "No track"}</div>
                      <div style={s.levelTitle}>{lesson.level?.title || "No level"}</div>
                    </div>
                  </div>
                </div>

                <div style={s.td}>
                  <button
                    onClick={() => togglePublish(lesson)}
                    disabled={saving === lesson.id}
                    style={{
                      ...s.toggleBtn,
                      background: lesson.is_published ? "#E1F5EE" : "#F5F5F3",
                      color: lesson.is_published ? "#0F6E56" : "#888",
                    }}
                    type="button"
                  >
                    {saving === lesson.id ? "Saving" : lesson.is_published ? "Published" : "Draft"}
                  </button>
                </div>

                <div style={s.td}>
                  <button
                    onClick={() => toggleFree(lesson)}
                    disabled={saving === lesson.id}
                    style={{
                      ...s.toggleBtn,
                      background: lesson.is_free ? "#E6F1FB" : "#EEEDFE",
                      color: lesson.is_free ? "#185FA5" : "#534AB7",
                    }}
                    type="button"
                  >
                    {lesson.is_free ? "Free" : "Pro"}
                  </button>
                </div>

                <div style={{ ...s.td, color: "#888", fontSize: 12 }}>{lesson.duration_minutes} min</div>

                <div style={{ ...s.td, display: "flex", gap: 6 }}>
                  <Link href={`/admin/lessons/${lesson.id}`} style={s.editBtn}>
                    Edit
                  </Link>
                  <Link href={`/learn/${lesson.id}`} target="_blank" style={s.viewBtn}>
                    View
                  </Link>
                  <button onClick={() => deleteLesson(lesson.id)} style={s.deleteBtn} type="button">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui, -apple-system, sans-serif" },
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
  topBar: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: "#0a0a0a", margin: "0 0 4px", letterSpacing: "-0.4px" },
  sub: { fontSize: 13, color: "#888", margin: 0 },
  addBtn: { padding: "10px 20px", background: "#1D9E75", color: "#fff", borderRadius: 9, textDecoration: "none", fontSize: 13, fontWeight: 600 },
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 },
  filterTabs: { display: "flex", gap: 4 },
  filterTab: { padding: "7px 14px", fontSize: 12, fontWeight: 500, border: "0.5px solid #ddd", borderRadius: 20, background: "#fff", color: "#666", cursor: "pointer", fontFamily: "system-ui" },
  filterActive: { background: "#0a0a0a", color: "#fff", border: "0.5px solid #0a0a0a" },
  searchInput: { padding: "8px 14px", fontSize: 13, border: "0.5px solid #ddd", borderRadius: 9, outline: "none", fontFamily: "system-ui", width: 240 },
  table: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, overflow: "hidden" },
  tableHeader: { display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 0.8fr 0.6fr 1.4fr", background: "#fafafa", borderBottom: "0.5px solid #eee" },
  th: { padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: ".04em" },
  skeletonRow: { height: 56, borderBottom: "0.5px solid #f5f5f5", background: "#fafafa", animation: "pulse 1.5s infinite" },
  empty: { padding: 40, textAlign: "center", color: "#aaa", fontSize: 14 },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 0.8fr 0.6fr 1.4fr", borderBottom: "0.5px solid #f5f5f5", alignItems: "center" },
  td: { padding: "12px 14px", fontSize: 13, color: "#333" },
  lessonTitle: { fontWeight: 600, fontSize: 13, color: "#0a0a0a", marginBottom: 2 },
  lessonSlug: { fontSize: 10, color: "#ccc", fontFamily: "monospace" },
  trackDot: { width: 10, height: 10, borderRadius: 999, flexShrink: 0 },
  trackTitle: { fontSize: 12, fontWeight: 600, color: "#333" },
  levelTitle: { fontSize: 11, color: "#aaa" },
  toggleBtn: { padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "none", borderRadius: 20, cursor: "pointer", fontFamily: "system-ui" },
  editBtn: { padding: "5px 10px", fontSize: 11, fontWeight: 600, background: "#E6F1FB", color: "#185FA5", borderRadius: 7, textDecoration: "none" },
  viewBtn: { padding: "5px 10px", fontSize: 11, fontWeight: 600, background: "#F5F5F3", color: "#555", borderRadius: 7, textDecoration: "none" },
  deleteBtn: { padding: "5px 8px", fontSize: 11, fontWeight: 600, background: "#FEF2F2", color: "#B91C1C", border: "none", borderRadius: 7, cursor: "pointer", fontFamily: "system-ui" },
};
