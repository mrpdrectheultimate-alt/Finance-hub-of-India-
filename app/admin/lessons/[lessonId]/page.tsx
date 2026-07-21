"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Lesson } from "@/types/database";

type LevelOption = {
  id: string;
  title: string;
  track: {
    title: string;
    icon: string | null;
  } | null;
};

type LessonForm = {
  title: string;
  slug: string;
  level_id: string;
  content_mdx: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  is_published: boolean;
  is_free: boolean;
};

const emptyForm: LessonForm = {
  title: "",
  slug: "",
  level_id: "",
  content_mdx: "",
  video_url: "",
  duration_minutes: 5,
  order_index: 1,
  is_published: false,
  is_free: true,
};

export default function AdminLessonEditor() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params?.lessonId as string;
  const isNew = !lessonId || lessonId === "new";

  const [levels, setLevels] = useState<LevelOption[]>([]);
  const [form, setForm] = useState<LessonForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"content" | "settings" | "preview">("content");

  useEffect(() => {
    void loadLevels();
    if (!isNew) void loadLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const loadLevels = async () => {
    const { data } = await supabase
      .from("levels")
      .select("id, title, track:tracks(title, icon)")
      .order("order_index");

    setLevels((data as LevelOption[]) || []);
  };

  const loadLesson = async () => {
    const { data } = await supabase.from("lessons").select("*").eq("id", lessonId).single();
    if (!data) return;

    const lesson = data as Lesson;
    setForm({
      title: lesson.title,
      slug: lesson.slug,
      level_id: lesson.level_id,
      content_mdx: lesson.content_mdx || "",
      video_url: lesson.video_url || "",
      duration_minutes: lesson.duration_minutes,
      order_index: lesson.order_index,
      is_published: lesson.is_published,
      is_free: lesson.is_free,
    });
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.level_id) {
      setError("Title and level are required");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      content_mdx: form.content_mdx || null,
      video_url: form.video_url || null,
    };

    if (isNew) {
      const { data, error: insertError } = await supabase.from("lessons").insert(payload as never).select("id").single();
      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }

      router.push(`/admin/lessons/${data.id}`);
    } else {
      const { error: updateError } = await supabase.from("lessons").update(payload).eq("id", lessonId);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    }

    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const wordCount = form.content_mdx.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

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
            <Link href="/admin/lessons" style={s.backLink}>
              All lessons
            </Link>
            <h1 style={s.title}>{isNew ? "New lesson" : "Edit lesson"}</h1>
          </div>
          <div style={s.headerActions}>
            {saved ? <span style={s.savedBadge}>Saved</span> : null}
            {error ? <span style={s.errorBadge}>{error}</span> : null}
            <button onClick={handleSave} disabled={saving} style={s.saveBtn} type="button">
              {saving ? "Saving..." : "Save lesson"}
            </button>
            {!isNew ? (
              <button
                onClick={() => setForm((current) => ({ ...current, is_published: !current.is_published }))}
                style={{
                  ...s.publishBtn,
                  background: form.is_published ? "#FEF2F2" : "#1D9E75",
                  color: form.is_published ? "#B91C1C" : "#fff",
                }}
                type="button"
              >
                {form.is_published ? "Unpublish" : "Publish"}
              </button>
            ) : null}
          </div>
        </div>

        <div style={s.statusRow}>
          <span
            style={{
              ...s.statusPill,
              background: form.is_published ? "#E1F5EE" : "#F5F5F3",
              color: form.is_published ? "#0F6E56" : "#888",
            }}
          >
            {form.is_published ? "Published" : "Draft"}
          </span>
          <span
            style={{
              ...s.statusPill,
              background: form.is_free ? "#E6F1FB" : "#EEEDFE",
              color: form.is_free ? "#185FA5" : "#534AB7",
            }}
          >
            {form.is_free ? "Free" : "Pro"}
          </span>
          <span style={s.wordCount}>
            {wordCount} words | about {readTime} min read
          </span>
        </div>

        <div style={s.tabs}>
          {(["content", "settings", "preview"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
              type="button"
            >
              {tabLabel(tab)}
            </button>
          ))}
        </div>

        {activeTab === "content" ? (
          <div>
            <div style={s.field}>
              <label style={s.label}>Lesson title *</label>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="e.g. How compound interest actually works"
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Video URL (YouTube embed, optional)</label>
              <input
                value={form.video_url}
                onChange={(event) => setForm((current) => ({ ...current, video_url: event.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Lesson content (Markdown)</label>
              <div style={s.editorToolbar}>
                {[
                  ["H1", "# "],
                  ["H2", "## "],
                  ["H3", "### "],
                  ["Bold", "**text**"],
                  ["Quote", "> "],
                  ["List", "- "],
                ].map(([label, insert]) => (
                  <button
                    key={label}
                    onClick={() => setForm((current) => ({ ...current, content_mdx: `${current.content_mdx}\n${insert}` }))}
                    style={s.toolbarBtn}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <textarea
                value={form.content_mdx}
                onChange={(event) => setForm((current) => ({ ...current, content_mdx: event.target.value }))}
                placeholder={`# Lesson title\n\n## Introduction\n\nWrite your lesson content here using Markdown...\n\n> Key insight or quote\n\n## Main concept\n\nExplanation...\n\n- Bullet point 1\n- Bullet point 2`}
                style={s.textarea}
                rows={28}
              />
            </div>
          </div>
        ) : null}

        {activeTab === "settings" ? (
          <div style={s.settingsTab}>
            <div style={s.settingsGrid}>
              <div style={s.field}>
                <label style={s.label}>Level *</label>
                <select
                  value={form.level_id}
                  onChange={(event) => setForm((current) => ({ ...current, level_id: event.target.value }))}
                  style={s.select}
                >
                  <option value="">Select a level...</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.track?.title || "Track"} - {level.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={s.field}>
                <label style={s.label}>URL slug (auto-generated if empty)</label>
                <input
                  value={form.slug}
                  onChange={(event) => setForm((current) => ({ ...current, slug: cleanSlug(event.target.value) }))}
                  placeholder="how-compound-interest-works"
                  style={s.input}
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Duration (minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={form.duration_minutes}
                  onChange={(event) => setForm((current) => ({ ...current, duration_minutes: Number(event.target.value) }))}
                  style={{ ...s.input, width: 100 }}
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Order index (1 = first)</label>
                <input
                  type="number"
                  min={1}
                  value={form.order_index}
                  onChange={(event) => setForm((current) => ({ ...current, order_index: Number(event.target.value) }))}
                  style={{ ...s.input, width: 100 }}
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Access level</label>
                <div style={s.toggleGroup}>
                  <button
                    onClick={() => setForm((current) => ({ ...current, is_free: true }))}
                    style={{ ...s.toggleOpt, ...(form.is_free ? s.toggleOptActive : {}) }}
                    type="button"
                  >
                    Free
                  </button>
                  <button
                    onClick={() => setForm((current) => ({ ...current, is_free: false }))}
                    style={{ ...s.toggleOpt, ...(form.is_free ? {} : s.toggleOptActivePro) }}
                    type="button"
                  >
                    Pro only
                  </button>
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Publish status</label>
                <div style={s.toggleGroup}>
                  <button
                    onClick={() => setForm((current) => ({ ...current, is_published: false }))}
                    style={{ ...s.toggleOpt, ...(!form.is_published ? s.toggleOptActive : {}) }}
                    type="button"
                  >
                    Draft
                  </button>
                  <button
                    onClick={() => setForm((current) => ({ ...current, is_published: true }))}
                    style={{ ...s.toggleOpt, ...(form.is_published ? s.toggleOptActiveGreen : {}) }}
                    type="button"
                  >
                    Published
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "preview" ? (
          <div style={s.previewTab}>
            <div style={s.previewHeader}>
              <div style={s.previewMeta}>
                {form.duration_minutes} min | {form.is_free ? "Free" : "Pro"}
              </div>
              <h1 style={s.previewTitle}>{form.title || "Untitled lesson"}</h1>
            </div>
            {form.video_url ? (
              <div style={s.previewVideo}>
                <iframe
                  src={form.video_url.replace("watch?v=", "embed/")}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  allowFullScreen
                />
              </div>
            ) : null}
            <div style={s.previewBody}>
              {form.content_mdx.split("\n").map((line, index) => renderMarkdownLine(line, index))}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function cleanSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function tabLabel(tab: "content" | "settings" | "preview") {
  if (tab === "content") return "Content";
  if (tab === "settings") return "Settings";
  return "Preview";
}

function renderMarkdownLine(line: string, index: number) {
  if (line.startsWith("# ")) {
    return (
      <h1 key={index} style={{ fontSize: 26, fontWeight: 700, margin: "24px 0 12px", letterSpacing: "-0.5px" }}>
        {line.slice(2)}
      </h1>
    );
  }
  if (line.startsWith("## ")) {
    return (
      <h2 key={index} style={{ fontSize: 20, fontWeight: 600, margin: "20px 0 10px" }}>
        {line.slice(3)}
      </h2>
    );
  }
  if (line.startsWith("### ")) {
    return (
      <h3 key={index} style={{ fontSize: 16, fontWeight: 600, margin: "16px 0 8px" }}>
        {line.slice(4)}
      </h3>
    );
  }
  if (line.startsWith("- ")) {
    return (
      <li key={index} style={{ marginBottom: 5, paddingLeft: 4, color: "#444" }}>
        {line.slice(2)}
      </li>
    );
  }
  if (line.startsWith("> ")) {
    return (
      <blockquote
        key={index}
        style={{ borderLeft: "3px solid #1D9E75", paddingLeft: 14, margin: "14px 0", color: "#555", fontStyle: "italic" }}
      >
        {line.slice(2)}
      </blockquote>
    );
  }
  if (line.trim() === "") return <br key={index} />;

  return (
    <p key={index} style={{ margin: "0 0 12px", color: "#333", lineHeight: 1.8 }}>
      {line}
    </p>
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
  main: { marginLeft: 200, flex: 1, padding: "24px 32px", maxWidth: "calc(100vw - 200px)" },
  topBar: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 },
  backLink: { fontSize: 12, color: "#888", textDecoration: "none", display: "block", marginBottom: 6 },
  title: { fontSize: 22, fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: "-0.4px" },
  headerActions: { display: "flex", alignItems: "center", gap: 8 },
  savedBadge: { fontSize: 12, color: "#0F6E56", background: "#E1F5EE", padding: "5px 12px", borderRadius: 20, fontWeight: 600 },
  errorBadge: { fontSize: 12, color: "#B91C1C", background: "#FEF2F2", padding: "5px 12px", borderRadius: 20 },
  saveBtn: { padding: "9px 18px", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 9, background: "#0a0a0a", color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  publishBtn: { padding: "9px 18px", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 9, cursor: "pointer", fontFamily: "system-ui" },
  statusRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
  statusPill: { fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 },
  wordCount: { fontSize: 11, color: "#aaa" },
  tabs: { display: "flex", gap: 4, marginBottom: 20, borderBottom: "0.5px solid #eee", paddingBottom: 0 },
  tab: { padding: "9px 16px", fontSize: 13, fontWeight: 500, border: "none", borderRadius: "8px 8px 0 0", background: "transparent", color: "#888", cursor: "pointer", fontFamily: "system-ui" },
  tabActive: { background: "#fff", color: "#0a0a0a", fontWeight: 600, borderBottom: "2px solid #1D9E75" },
  field: { marginBottom: 18 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6, letterSpacing: ".02em" },
  input: { width: "100%", padding: "10px 12px", fontSize: 14, border: "0.5px solid #ddd", borderRadius: 8, outline: "none", fontFamily: "system-ui", boxSizing: "border-box" },
  editorToolbar: { display: "flex", gap: 4, marginBottom: 6 },
  toolbarBtn: { padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 6, background: "#fff", cursor: "pointer", color: "#555", fontFamily: "system-ui" },
  textarea: { width: "100%", padding: 14, fontSize: 13, border: "0.5px solid #ddd", borderRadius: 8, outline: "none", fontFamily: "monospace", boxSizing: "border-box", lineHeight: 1.7, resize: "vertical", color: "#333" },
  settingsTab: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: 24 },
  settingsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  select: { width: "100%", padding: "10px 12px", fontSize: 14, border: "0.5px solid #ddd", borderRadius: 8, outline: "none", fontFamily: "system-ui", background: "#fff" },
  toggleGroup: { display: "flex", gap: 6 },
  toggleOpt: { padding: "8px 16px", fontSize: 13, fontWeight: 500, border: "0.5px solid #ddd", borderRadius: 8, background: "#fff", color: "#888", cursor: "pointer", fontFamily: "system-ui" },
  toggleOptActive: { background: "#0a0a0a", color: "#fff", border: "0.5px solid #0a0a0a" },
  toggleOptActiveGreen: { background: "#1D9E75", color: "#fff", border: "0.5px solid #1D9E75" },
  toggleOptActivePro: { background: "#534AB7", color: "#fff", border: "0.5px solid #534AB7" },
  previewTab: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "32px 40px", maxWidth: 720 },
  previewHeader: { marginBottom: 24 },
  previewMeta: { fontSize: 12, color: "#aaa", marginBottom: 8 },
  previewTitle: { fontSize: 28, fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: "-0.6px" },
  previewVideo: { borderRadius: 10, overflow: "hidden", aspectRatio: "16/9", background: "#000", marginBottom: 28 },
  previewBody: { lineHeight: 1.8 },
};
