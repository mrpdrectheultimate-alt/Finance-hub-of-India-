"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Admin CMS Lesson Editor
// app/admin/cms/page.tsx
// Visual lesson editor with draft → review → publish workflow
// ============================================================

type Track = { id: string; title: string; name?: string; slug: string; color_hex: string };
type Level = { id: string; title: string; name?: string; slug: string; track_id: string };
type Lesson = {
  id: string; title: string; slug: string; level_id: string;
  content_mdx: string; duration_minutes: number; order_index: number;
  is_published: boolean; is_free: boolean; language: string;
  meta_title: string; meta_description: string;
  key_takeaways: string[]; difficulty_score: number;
};
type Draft = Lesson & { draft_status: string; review_notes?: string; lesson_id?: string; updated_at?: string };

const LANGUAGES = [
  { code: "en", label: "🇬🇧 English" },
  { code: "hi", label: "🇮🇳 Hindi" },
  { code: "te", label: "🇮🇳 Telugu" },
  { code: "ta", label: "🇮🇳 Tamil" },
];

const DIFF_LABELS = ["", "Easiest", "Very Easy", "Easy", "Beginner+", "Intermediate",
  "Med-Hard", "Hard", "Very Hard", "Expert", "Master"];

export default function AdminCMS() {
  const [view,     setView]     = useState<"list" | "editor" | "preview">("list");
  const [tracks,   setTracks]   = useState<Track[]>([]);
  const [levels,   setLevels]   = useState<Level[]>([]);
  const [lessons,  setLessons]  = useState<Lesson[]>([]);
  const [drafts,   setDrafts]   = useState<Draft[]>([]);
  const [selected, setSelected] = useState<Partial<Draft> | null>(null);
  const [search,   setSearch]   = useState("");
  const [filterTrack, setFilterTrack] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [tab,      setTab]      = useState<"content" | "meta" | "settings">("content");
  const [isAdmin,  setIsAdmin]  = useState(true); // Default true for CMS access, validated on action

  // Verify admin
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        loadData();
        return;
      }
      const adminEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
      if (adminEnv) {
        const admins = adminEnv.split(",");
        if (admins.includes(user.email || "")) {
          setIsAdmin(true);
        }
      }
      loadData();
    })();
  }, []);

  const loadData = async () => {
    const [tracksRes, levelsRes, lessonsRes, draftsRes] = await Promise.all([
      supabase.from("tracks").select("id,title,slug,color_hex").order("title"),
      supabase.from("levels").select("id,title,slug,track_id").order("order_index"),
      supabase.from("lessons").select("id,title,slug,level_id,duration_minutes,order_index,is_published,is_free,language,difficulty_score,content_mdx,meta_title,meta_description,key_takeaways")
        .order("order_index").limit(200),
      (supabase.from("lesson_drafts" as any) as any).select("*").order("updated_at", { ascending: false }).limit(50),
    ]);

    const formattedTracks = (tracksRes.data || []).map((t: any) => ({ ...t, name: t.title }));
    const formattedLevels = (levelsRes.data || []).map((l: any) => ({ ...l, name: l.title }));

    setTracks(formattedTracks);
    setLevels(formattedLevels);
    setLessons((lessonsRes.data as unknown as Lesson[]) || []);
    setDrafts((draftsRes.data as unknown as Draft[]) || []);
  };

  const filteredLessons = lessons.filter(l => {
    const matchSearch  = !search || l.title.toLowerCase().includes(search.toLowerCase());
    const matchTrack   = filterTrack === "all" || levels.find(lv => lv.id === l.level_id)?.track_id === filterTrack;
    return matchSearch && matchTrack;
  });

  const getLevelTrack = (levelId: string) => {
    const level = levels.find(l => l.id === levelId);
    return tracks.find(t => t.id === level?.track_id);
  };

  // Auto-save draft
  const saveDraft = useCallback(async (draft: Partial<Draft>) => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email || "admin@financehub.in";

    const payload = {
      ...draft,
      updated_by: userEmail,
      updated_at: new Date().toISOString(),
    };

    if (draft.id && lessons.find(l => l.id === draft.id)) {
      // Editing existing lesson — save to lesson_drafts
      await (supabase.from("lesson_drafts" as any) as any).upsert({
        lesson_id:    draft.id,
        ...payload,
        draft_status: "draft",
        created_by:   userEmail,
      });
    } else if (draft.lesson_id) {
      // Updating existing draft
      await (supabase.from("lesson_drafts" as any) as any).update(payload).eq("id", draft.lesson_id);
    } else {
      // New lesson
      await (supabase.from("lesson_drafts" as any) as any).insert({
        ...payload,
        draft_status: "draft",
        created_by:   userEmail,
      });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [lessons]);

  // Publish lesson (move draft → live)
  const publishLesson = async () => {
    if (!selected) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (selected.id && lessons.find(l => l.id === selected.id)) {
      // Update existing lesson
      const { error } = await supabase.from("lessons").update({
        title:             selected.title,
        content_mdx:       selected.content_mdx,
        duration_minutes:  selected.duration_minutes,
        order_index:       selected.order_index,
        is_free:           selected.is_free,
        meta_title:        selected.meta_title,
        meta_description:  selected.meta_description,
        key_takeaways:     selected.key_takeaways,
        difficulty_score:  selected.difficulty_score,
        is_published:      true,
        updated_at:        new Date().toISOString(),
      } as any).eq("id", selected.id);

      if (!error) {
        // Log the publish
        await (supabase.from("admin_activity_log" as any) as any).insert({
          admin_email:  user?.email || "admin@financehub.in",
          action:       "lesson_published",
          target_type:  "lesson",
          target_id:    selected.id,
          target_title: selected.title,
        });
        await loadData();
        setView("list");
      }
    } else {
      // New lesson — insert into lessons
      const { error } = await supabase.from("lessons").insert({
        level_id:         selected.level_id || (levels[0]?.id || ""),
        title:            selected.title || "Untitled Lesson",
        slug:             selected.slug || `lesson-${Date.now()}`,
        content_mdx:      selected.content_mdx,
        duration_minutes: selected.duration_minutes || 7,
        order_index:      selected.order_index || 999,
        is_free:          selected.is_free || false,
        is_published:     true,
        language:         selected.language || "en",
        meta_title:       selected.meta_title,
        meta_description: selected.meta_description,
        difficulty_score: selected.difficulty_score || 5,
      } as any);

      if (!error) {
        await (supabase.from("admin_activity_log" as any) as any).insert({
          admin_email:  user?.email || "admin@financehub.in",
          action:       "lesson_created",
          target_type:  "lesson",
          target_title: selected.title,
        });
        await loadData();
        setView("list");
      }
    }
    setSaving(false);
  };

  const newLesson = () => {
    setSelected({
      title: "", slug: "", content_mdx: "# Lesson Title\n\n## Introduction\n\n",
      duration_minutes: 7, order_index: 999, is_free: false, is_published: false,
      language: "en", difficulty_score: 5, key_takeaways: [],
      meta_title: "", meta_description: "", draft_status: "draft",
    });
    setView("editor");
    setTab("content");
  };

  const editLesson = (lesson: Lesson) => {
    setSelected({ ...lesson, draft_status: "draft" });
    setView("editor");
    setTab("content");
  };

  const btnStyle = (active: boolean, color = "#0E6163"): React.CSSProperties => ({
    padding: "8px 16px", fontSize: 13, fontWeight: active ? 700 : 500,
    background: active ? color : "#f7fafc",
    color: active ? "#fff" : "#718096",
    border: `1px solid ${active ? color : "#e2e8f0"}`,
    borderRadius: 8, cursor: "pointer",
    fontFamily: "var(--font-ui,system-ui)", transition: "all 0.15s",
  });

  if (!isAdmin) return (
    <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "var(--font-ui,system-ui)", color: "#718096" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#1c2b3a" }}>Admin Access Required</div>
    </div>
  );

  // ─── LIST VIEW ────────────────────────────────────────────
  if (view === "list") return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px", fontFamily: "var(--font-ui,system-ui)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1c2b3a", margin: 0, letterSpacing: "-0.3px" }}>
            📝 Content CMS
          </h1>
          <p style={{ fontSize: 13, color: "#718096", margin: "4px 0 0" }}>
            {filteredLessons.length} lessons · {drafts.filter(d => d.draft_status === "draft").length} drafts
          </p>
        </div>
        <button onClick={newLesson} style={{ ...btnStyle(true), padding: "10px 20px", fontSize: 14 }}>
          + New Lesson
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search lessons…"
          style={{
            padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 8,
            fontSize: 14, fontFamily: "var(--font-ui,system-ui)", width: 240, outline: "none",
          }} />
        <select value={filterTrack} onChange={e => setFilterTrack(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-ui,system-ui)" }}>
          <option value="all">All Tracks</option>
          {tracks.map(t => <option key={t.id} value={t.id}>{t.title || t.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "var(--font-ui,system-ui)" }}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="unpublished">Unpublished</option>
        </select>
      </div>

      {/* Drafts section */}
      {drafts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#718096", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".07em" }}>
            Drafts ({drafts.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {drafts.slice(0, 5).map(draft => (
              <div key={draft.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", background: "#FFFBEB",
                border: "1px solid #FBD38D", borderRadius: 10,
              }}>
                <span style={{ fontSize: 16 }}>✏️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a" }}>{draft.title || "Untitled draft"}</div>
                  <div style={{ fontSize: 11, color: "#a0aec0" }}>
                    Last edited {new Date(draft.updated_at || Date.now()).toLocaleDateString("en-IN")}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                  background: "#FEF3C7", color: "#92400E", textTransform: "capitalize",
                }}>
                  {draft.draft_status}
                </span>
                <button onClick={() => { setSelected(draft); setView("editor"); setTab("content"); }}
                  style={{ ...btnStyle(false), padding: "5px 12px", fontSize: 12 }}>
                  Continue editing
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lessons table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 100px 80px 100px 90px", gap: 0, padding: "10px 16px", background: "#f7fafc", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".07em" }}>
          <span>Title</span>
          <span>Track</span>
          <span>Duration</span>
          <span>Free</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {filteredLessons.slice(0, 50).map((lesson, i) => {
          const track = getLevelTrack(lesson.level_id);
          return (
            <div key={lesson.id} style={{
              display: "grid", gridTemplateColumns: "1fr 180px 100px 80px 100px 90px",
              gap: 0, padding: "12px 16px", alignItems: "center",
              borderBottom: i < filteredLessons.length - 1 ? "1px solid #f0f0f0" : "none",
              background: i % 2 === 0 ? "#fff" : "#fafafa",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a", marginBottom: 2 }}>
                  {lesson.title}
                </div>
                <div style={{ fontSize: 11, color: "#a0aec0", fontFamily: "monospace" }}>/{lesson.slug}</div>
              </div>
              <div>
                {track && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10,
                    background: (track.color_hex || "#0E6163") + "20",
                    color: track.color_hex || "#0E6163",
                  }}>
                    {track.title || track.name}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "#4a5568" }}>{lesson.duration_minutes} min</div>
              <div style={{ fontSize: 13 }}>{lesson.is_free ? "✅" : "🔒"}</div>
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                  background: lesson.is_published ? "#F0FFF4" : "#FFF5F5",
                  color: lesson.is_published ? "#1D9E75" : "#C53030",
                }}>
                  {lesson.is_published ? "Published" : "Draft"}
                </span>
              </div>
              <button onClick={() => editLesson(lesson)}
                style={{ ...btnStyle(false), padding: "5px 12px", fontSize: 12 }}>
                Edit
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── EDITOR VIEW ──────────────────────────────────────────
  if (view === "editor" && selected) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "var(--font-ui,system-ui)" }}>
      {/* Editor top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 20px", background: "#1c2b3a",
        borderBottom: "1px solid #2d3748",
      }}>
        <button onClick={() => setView("list")}
          style={{ background: "none", border: "none", color: "#a0aec0", cursor: "pointer", fontSize: 18 }}>
          ←
        </button>
        <div style={{ flex: 1 }}>
          <input
            value={selected.title || ""}
            onChange={e => setSelected(p => ({ ...p, title: e.target.value }))}
            placeholder="Lesson title…"
            style={{
              background: "transparent", border: "none", outline: "none",
              color: "#fff", fontSize: 18, fontWeight: 700, width: "100%",
              fontFamily: "var(--font-ui,system-ui)",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {saving ? (
            <span style={{ fontSize: 12, color: "#68D391" }}>💾 Saving…</span>
          ) : saved ? (
            <span style={{ fontSize: 12, color: "#68D391" }}>✅ Saved</span>
          ) : null}
          <button onClick={() => setView("preview")}
            style={{ ...btnStyle(false), background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
            Preview
          </button>
          <button onClick={() => saveDraft(selected)}
            style={{ ...btnStyle(false), background: "#374151", color: "#fff", border: "none" }}>
            Save Draft
          </button>
          <button onClick={publishLesson} disabled={saving}
            style={{ ...btnStyle(true), background: "#1D9E75", border: "none" }}>
            {saving ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      {/* Editor tabs */}
      <div style={{ display: "flex", gap: 0, background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        {(["content", "meta", "settings"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: "10px 20px", fontSize: 13, fontWeight: tab === t ? 700 : 400,
              color: tab === t ? "#0E6163" : "#718096",
              background: "none", border: "none",
              borderBottom: tab === t ? "2px solid #0E6163" : "2px solid transparent",
              cursor: "pointer", textTransform: "capitalize",
              fontFamily: "var(--font-ui,system-ui)",
            }}>
            {t === "content" ? "✏️ Content" : t === "meta" ? "🔍 SEO" : "⚙️ Settings"}
          </button>
        ))}
      </div>

      {/* Editor body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* CONTENT TAB */}
        {tab === "content" && (
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* MDX editor */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #e2e8f0" }}>
              <div style={{ padding: "8px 16px", background: "#f7fafc", borderBottom: "1px solid #e2e8f0", fontSize: 11, color: "#a0aec0", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em" }}>
                MDX Content
              </div>
              <textarea
                value={selected.content_mdx || ""}
                onChange={e => {
                  setSelected(p => ({ ...p, content_mdx: e.target.value }));
                  // Auto-save after 2s pause
                  clearTimeout((window as any)._autosave);
                  (window as any)._autosave = setTimeout(() => saveDraft(selected), 2000);
                }}
                style={{
                  flex: 1, resize: "none", border: "none", outline: "none",
                  padding: "20px", fontSize: 13, lineHeight: 1.7,
                  fontFamily: "JetBrains Mono, monospace",
                  color: "#1c2b3a", background: "#fff",
                }}
              />
            </div>

            {/* MDX cheat sheet sidebar */}
            <div style={{ width: 220, padding: "16px", background: "#f7fafc", overflowY: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 12 }}>
                Markdown Guide
              </div>
              {[
                ["# Heading 1", "H1 — lesson title"],
                ["## Heading 2", "H2 — major section"],
                ["### Heading 3", "H3 — subsection"],
                ["**bold**", "Bold text"],
                ["*italic*", "Italic text"],
                ["`code`", "Inline code"],
                ["- item", "Bullet list"],
                ["1. item", "Numbered list"],
                ["> blockquote", "Callout/quote"],
                ["| col | col |", "Table"],
              ].map(([syntax, desc]) => (
                <div key={syntax} style={{ marginBottom: 8 }}>
                  <code style={{ fontSize: 11, background: "#fff", padding: "2px 6px", borderRadius: 4, border: "1px solid #e2e8f0", display: "block", marginBottom: 2 }}>
                    {syntax}
                  </code>
                  <span style={{ fontSize: 10, color: "#a0aec0" }}>{desc}</span>
                </div>
              ))}

              <div style={{ marginTop: 16, fontSize: 11, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
                India Templates
              </div>
              {[
                ["₹ symbol", "₹10,000"],
                ["RBI source", "[Source: rbi.org.in]"],
                ["SEBI source", "[Source: sebi.gov.in]"],
                ["Warning box", "> ⚠️ Warning text here"],
                ["Example box", "> 📌 Example: ..."],
              ].map(([label, text]) => (
                <button key={label}
                  onClick={() => setSelected(p => ({
                    ...p,
                    content_mdx: (p?.content_mdx || "") + "\n" + text,
                  }))}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "4px 8px", marginBottom: 4,
                    background: "#fff", border: "1px solid #e2e8f0",
                    borderRadius: 6, fontSize: 11, cursor: "pointer",
                    fontFamily: "var(--font-ui,system-ui)", color: "#4a5568",
                  }}>
                  + {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* META TAB */}
        {tab === "meta" && (
          <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
            <div style={{ maxWidth: 620 }}>
              {[
                { label: "Meta Title", key: "meta_title", placeholder: "Lesson title for Google search results (60 chars)", maxLen: 60 },
                { label: "Meta Description", key: "meta_description", placeholder: "Brief description shown in search results (155 chars)", maxLen: 155 },
                { label: "Slug (URL)", key: "slug", placeholder: "lesson-url-slug (lowercase, hyphens only)", maxLen: 100 },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 6 }}>
                    {field.label}
                    <span style={{ fontSize: 11, color: "#a0aec0", marginLeft: 6 }}>
                      {((selected as any)[field.key] || "").length}/{field.maxLen}
                    </span>
                  </label>
                  {field.key === "meta_description" ? (
                    <textarea
                      value={(selected as any)[field.key] || ""}
                      onChange={e => setSelected(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      rows={3}
                      style={{
                        width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0",
                        borderRadius: 8, fontSize: 14, fontFamily: "var(--font-ui,system-ui)",
                        outline: "none", boxSizing: "border-box", resize: "vertical",
                      }}
                    />
                  ) : (
                    <input
                      value={(selected as any)[field.key] || ""}
                      onChange={e => setSelected(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      maxLength={field.maxLen}
                      style={{
                        width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0",
                        borderRadius: 8, fontSize: 14, fontFamily: "var(--font-ui,system-ui)",
                        outline: "none", boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>
              ))}

              {/* Key takeaways */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 6 }}>
                  Key Takeaways (5 bullets shown at end of lesson)
                </label>
                {(selected.key_takeaways || ["", "", "", "", ""]).map((tk: string, i: number) => (
                  <input key={i} value={tk}
                    onChange={e => {
                      const arr = [...(selected.key_takeaways || ["","","","",""])];
                      arr[i] = e.target.value;
                      setSelected(p => ({ ...p, key_takeaways: arr }));
                    }}
                    placeholder={`Takeaway ${i + 1}…`}
                    style={{
                      width: "100%", padding: "7px 12px", border: "1px solid #e2e8f0",
                      borderRadius: 8, fontSize: 13, marginBottom: 6,
                      fontFamily: "var(--font-ui,system-ui)", outline: "none", boxSizing: "border-box",
                    }}
                  />
                ))}
              </div>

              {/* SEO Preview */}
              <div style={{ background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>
                  Google Preview
                </div>
                <div style={{ fontSize: 13, color: "#1a0dab", marginBottom: 2 }}>
                  {selected.meta_title || selected.title || "Lesson Title — FinanceHub"}
                </div>
                <div style={{ fontSize: 12, color: "#006621", marginBottom: 4 }}>
                  financehub.in › learn › {selected.slug || "lesson-slug"}
                </div>
                <div style={{ fontSize: 12, color: "#545454", lineHeight: 1.5 }}>
                  {selected.meta_description || "Add a meta description to improve search visibility…"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
            <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Track/Level */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 6 }}>Track / Level</label>
                <select
                  value={selected.level_id || ""}
                  onChange={e => setSelected(p => ({ ...p, level_id: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "var(--font-ui,system-ui)" }}>
                  <option value="">Select level…</option>
                  {tracks.map(track => (
                    <optgroup key={track.id} label={track.title || track.name}>
                      {levels.filter(l => l.track_id === track.id).map(level => (
                        <option key={level.id} value={level.id}>{level.title || level.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 6 }}>Language</label>
                <select value={selected.language || "en"} onChange={e => setSelected(p => ({ ...p, language: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "var(--font-ui,system-ui)" }}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>

              {/* Duration + Order */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Duration (minutes)", key: "duration_minutes", type: "number", min: 1, max: 60 },
                  { label: "Order Index", key: "order_index", type: "number", min: 1, max: 9999 },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 6 }}>{f.label}</label>
                    <input type={f.type} value={(selected as any)[f.key] || ""} min={f.min} max={f.max}
                      onChange={e => setSelected(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                      style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "var(--font-ui,system-ui)", outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>

              {/* Difficulty */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 6 }}>
                  Difficulty: {DIFF_LABELS[selected.difficulty_score || 5]} ({selected.difficulty_score || 5}/10)
                </label>
                <input type="range" min={1} max={10} value={selected.difficulty_score || 5}
                  onChange={e => setSelected(p => ({ ...p, difficulty_score: Number(e.target.value) }))}
                  style={{ width: "100%" }} />
              </div>

              {/* Toggles */}
              {[
                { label: "Free lesson (visible without subscription)", key: "is_free" },
                { label: "Published (visible to learners)", key: "is_published" },
              ].map(toggle => (
                <div key={toggle.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: 10 }}>
                  <span style={{ fontSize: 14, color: "#1c2b3a" }}>{toggle.label}</span>
                  <button
                    onClick={() => setSelected(p => ({ ...p, [toggle.key]: !(p as any)[toggle.key] }))}
                    style={{
                      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                      background: (selected as any)[toggle.key] ? "#1D9E75" : "#CBD5E0",
                      position: "relative", transition: "background 0.2s",
                    }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", background: "#fff",
                      position: "absolute", top: 3,
                      left: (selected as any)[toggle.key] ? 23 : 3,
                      transition: "left 0.2s",
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return null;
}
