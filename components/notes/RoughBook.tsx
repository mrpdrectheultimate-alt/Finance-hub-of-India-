"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────
type NoteType = "general"|"lesson"|"video"|"concept"|"formula"|"quiz"|"todo";
type NoteColor = "yellow"|"blue"|"green"|"pink"|"purple"|"orange"|"white";

type Note = {
  id:           string;
  title:        string;
  content:      string;
  note_type:    NoteType;
  color:        NoteColor;
  tags:         string[];
  is_pinned:    boolean;
  is_archived:  boolean;
  lesson_id:    string | null;
  lesson_title: string | null;
  track_slug:   string | null;
  track_icon:   string | null;
  created_at:   string;
  updated_at:   string;
};

interface RoughBookProps {
  // Optional — if inside a lesson page, pre-links the note
  lessonId?:    string;
  lessonTitle?: string;
  trackSlug?:   string;
  trackIcon?:   string;
  trackColor?:  string;
  // Display mode
  mode?: "panel" | "page" | "floating";
}

// ─── Constants ────────────────────────────────────────────────
const NOTE_COLORS: Record<NoteColor, { bg: string; border: string; label: string }> = {
  yellow: { bg: "#FFFBEB", border: "#FDE68A", label: "Yellow" },
  blue:   { bg: "#EFF6FF", border: "#BFDBFE", label: "Blue"   },
  green:  { bg: "#F0FDF4", border: "#BBF7D0", label: "Green"  },
  pink:   { bg: "#FDF2F8", border: "#F9A8D4", label: "Pink"   },
  purple: { bg: "#FAF5FF", border: "#DDD6FE", label: "Purple" },
  orange: { bg: "#FFF7ED", border: "#FED7AA", label: "Orange" },
  white:  { bg: "#FFFFFF", border: "#E5E7EB", label: "White"  },
};

const NOTE_TYPES: { id: NoteType; label: string; icon: string }[] = [
  { id: "general",  label: "General",   icon: "📝" },
  { id: "lesson",   label: "Lesson",    icon: "📚" },
  { id: "video",    label: "Video",     icon: "▶"  },
  { id: "concept",  label: "Concept",   icon: "💡" },
  { id: "formula",  label: "Formula",   icon: "🧮" },
  { id: "quiz",     label: "Quiz",      icon: "🎯" },
  { id: "todo",     label: "To-do",     icon: "✅" },
];

const QUICK_FORMATS = [
  { label: "B",      action: "bold",      wrap: "**",    style: { fontWeight: 700 } },
  { label: "I",      action: "italic",    wrap: "_",     style: { fontStyle: "italic" } },
  { label: "•",      action: "bullet",    prefix: "- ",  style: {} },
  { label: "1.",     action: "numbered",  prefix: "1. ", style: {} },
  { label: "[]",     action: "checkbox",  prefix: "- [ ] ", style: { fontFamily: "monospace" } },
  { label: "```",    action: "code",      wrap: "`",     style: { fontFamily: "monospace" } },
  { label: "—",      action: "divider",   insert: "\n---\n", style: {} },
];

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60)   return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400)return `${Math.floor(s/3600)}h ago`;
  return new Date(date).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
}

// ─── Main Component ───────────────────────────────────────────
export default function RoughBook({
  lessonId, lessonTitle, trackSlug, trackIcon, trackColor = "#1D9E75",
  mode = "page",
}: RoughBookProps) {
  const [notes,       setNotes]       = useState<Note[]>([]);
  const [activeNote,  setActiveNote]  = useState<Note | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [search,      setSearch]      = useState("");
  const [filterType,  setFilterType]  = useState<NoteType | "all">("all");
  const [filterTag,   setFilterTag]   = useState("");
  const [showPinned,  setShowPinned]  = useState(false);
  const [showArchived,setShowArchived]= useState(false);
  const [tagInput,    setTagInput]    = useState("");
  const [userId,      setUserId]      = useState("");
  const [allTags,     setAllTags]     = useState<string[]>([]);
  const [wordCount,   setWordCount]   = useState(0);
  const [charCount,   setCharCount]   = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTypePicker,  setShowTypePicker]  = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadNotes = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("user_notes" as never)
      .select("*")
      .eq("user_id", uid)
      .eq("is_archived", showArchived)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(100);

    const loadedNotes = (data as unknown as Note[]) || [];
    setNotes(loadedNotes);

    // Collect all unique tags
    const tags = new Set<string>();
    loadedNotes.forEach(n => n.tags?.forEach(t => tags.add(t)));
    setAllTags(Array.from(tags));
  }, [showArchived]);

  const init = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);
    await loadNotes(user.id);
    setLoading(false);
  }, [loadNotes]);

  useEffect(() => { void init(); }, [init]);

  const saveNote = useCallback(async (note: Note) => {
    setSaving(true);
    const { error } = await supabase
      .from("user_notes" as never)
      .update({
        title:       note.title,
        content:     note.content,
        note_type:   note.note_type,
        color:       note.color,
        tags:        note.tags,
        is_pinned:   note.is_pinned,
        is_archived: note.is_archived,
      } as never)
      .eq("id", note.id)
      .eq("user_id", userId);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setNotes(prev => prev.map(n => n.id === note.id ? { ...note, updated_at: new Date().toISOString() } : n));
    }
  }, [userId]);

  // Auto-save with 800ms debounce
  const scheduleSave = useCallback((note: Note) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaved(false);
    saveTimer.current = setTimeout(() => void saveNote(note), 800);
  }, [saveNote]);

  const updateActiveNote = (changes: Partial<Note>) => {
    if (!activeNote) return;
    const updated = { ...activeNote, ...changes };
    setActiveNote(updated);
    scheduleSave(updated);

    // Update word/char count if content changed
    if (changes.content !== undefined) {
      setWordCount(changes.content.trim().split(/\s+/).filter(Boolean).length);
      setCharCount(changes.content.length);
    }
  };

  const createNote = async () => {
    if (!userId) return;
    const { data, error } = await supabase.from("user_notes" as never).insert({
      user_id:      userId,
      title:        lessonTitle ? `Notes: ${lessonTitle}` : "New note",
      content:      lessonTitle ? `# ${lessonTitle}\n\n` : "",
      note_type:    lessonId ? "lesson" : "general",
      color:        "yellow",
      tags:         trackSlug ? [trackSlug.replace(/-/g, " ")] : [],
      lesson_id:    lessonId    || null,
      lesson_title: lessonTitle || null,
      track_slug:   trackSlug   || null,
      track_icon:   trackIcon   || null,
    } as never).select().single();

    if (!error && data) {
      const newNote = data as unknown as Note;
      setNotes(prev => [newNote, ...prev]);
      setActiveNote(newNote);
      setWordCount(0);
      setCharCount(newNote.content.length);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm("Delete this note permanently?")) return;
    await supabase.from("user_notes" as never).delete().eq("id", noteId).eq("user_id", userId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
    if (activeNote?.id === noteId) setActiveNote(null);
  };

  const togglePin = async (note: Note) => {
    const updated = { ...note, is_pinned: !note.is_pinned };
    await supabase.from("user_notes" as never).update({ is_pinned: updated.is_pinned } as never).eq("id", note.id);
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n).sort((a, b) =>
      (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0) ||
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ));
    if (activeNote?.id === note.id) setActiveNote(updated);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 30);
    if (!tag || !activeNote || activeNote.tags.includes(tag)) { setTagInput(""); return; }
    updateActiveNote({ tags: [...activeNote.tags, tag] });
    if (!allTags.includes(tag)) setAllTags(prev => [...prev, tag]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    if (!activeNote) return;
    updateActiveNote({ tags: activeNote.tags.filter(t => t !== tag) });
  };

  // Toolbar formatting
  const applyFormat = (format: typeof QUICK_FORMATS[0]) => {
    const ta = textareaRef.current;
    if (!ta || !activeNote) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const sel   = activeNote.content.substring(start, end);
    let newContent = activeNote.content;
    let newCursor  = end;

    if (format.insert) {
      newContent = newContent.substring(0, start) + format.insert + newContent.substring(end);
      newCursor  = start + format.insert.length;
    } else if (format.wrap) {
      const wrapped = `${format.wrap}${sel || "text"}${format.wrap}`;
      newContent = newContent.substring(0, start) + wrapped + newContent.substring(end);
      newCursor  = start + wrapped.length;
    } else if (format.prefix) {
      // Insert prefix at start of line
      const lineStart = newContent.lastIndexOf("\n", start - 1) + 1;
      newContent = newContent.substring(0, lineStart) + format.prefix + newContent.substring(lineStart);
      newCursor  = start + format.prefix.length;
    }

    updateActiveNote({ content: newContent });
    setTimeout(() => { ta.selectionStart = newCursor; ta.selectionEnd = newCursor; ta.focus(); }, 0);
  };

  // Download note as .txt
  const downloadNote = () => {
    if (!activeNote) return;
    const blob = new Blob([`${activeNote.title}\n${"=".repeat(activeNote.title.length)}\n\n${activeNote.content}`], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${activeNote.title.replace(/[^a-z0-9]/gi, "_")}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  // Filter notes for sidebar
  const filteredNotes = notes.filter(n => {
    if (showPinned && !n.is_pinned) return false;
    if (filterType !== "all" && n.note_type !== filterType) return false;
    if (filterTag && !n.tags.includes(filterTag)) return false;
    if (search) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }
    return true;
  });

  const colorCfg = activeNote ? NOTE_COLORS[activeNote.color] : NOTE_COLORS.yellow;
  const typeCfg  = activeNote ? NOTE_TYPES.find(t => t.id === activeNote.note_type) : NOTE_TYPES[0];

  if (loading) return (
    <div style={{ display: "flex", gap: 14, padding: 20 }}>
      {[200, 100, 300].map((w, i) => (
        <div key={i} style={{ height: 120, width: w, background: "#eee", borderRadius: 12, animation: "pulse 1.5s infinite" }} />
      ))}
    </div>
  );

  return (
    <div style={{ ...s.root, ...(mode === "panel" ? s.rootPanel : mode === "floating" ? s.rootFloating : {}) }}>

      {/* ── LEFT: Notes sidebar ── */}
      <div style={s.sidebar}>
        {/* Sidebar header */}
        <div style={s.sidebarHeader}>
          <div style={s.sidebarTitle}>
            <span style={{ fontSize: 18 }}>📕</span>
            <span>Rough Book</span>
            <span style={s.noteCount}>{notes.length}</span>
          </div>
          <button onClick={createNote} style={{ ...s.newBtn, background: trackColor }}>+ New</button>
        </div>

        {/* Search */}
        <div style={s.searchWrap}>
          <input
            placeholder="Search notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={s.searchInput}
          />
        </div>

        {/* Quick filters */}
        <div style={s.filterRow}>
          <button onClick={() => setShowPinned(!showPinned)}
            style={{ ...s.filterChip, ...(showPinned ? { background: trackColor, color: "#fff" } : {}) }}>
            📌 Pinned
          </button>
          <button onClick={() => setShowArchived(!showArchived)}
            style={{ ...s.filterChip, ...(showArchived ? { background: "#555", color: "#fff" } : {}) }}>
            📦 Archive
          </button>
          {lessonId && (
            <button
              onClick={() => setFilterType(filterType === "lesson" ? "all" : "lesson")}
              style={{ ...s.filterChip, ...(filterType === "lesson" ? { background: trackColor, color: "#fff" } : {}) }}>
              {trackIcon} This lesson
            </button>
          )}
        </div>

        {/* Type filter */}
        <div style={s.typeFilterRow}>
          <button onClick={() => setFilterType("all")}
            style={{ ...s.typeChip, ...(filterType === "all" ? s.typeChipActive : {}) }}>
            All
          </button>
          {NOTE_TYPES.map(t => (
            <button key={t.id} onClick={() => setFilterType(filterType === t.id ? "all" : t.id)}
              style={{ ...s.typeChip, ...(filterType === t.id ? { ...s.typeChipActive, background: trackColor + "20", color: trackColor } : {}) }}>
              {t.icon}
            </button>
          ))}
        </div>

        {/* Tags filter */}
        {allTags.length > 0 && (
          <div style={s.tagsFilter}>
            {allTags.slice(0, 12).map(tag => (
              <button key={tag} onClick={() => setFilterTag(filterTag === tag ? "" : tag)}
                style={{ ...s.tagChip, ...(filterTag === tag ? { background: trackColor, color: "#fff" } : {}) }}>
                # {tag}
              </button>
            ))}
          </div>
        )}

        {/* Notes list */}
        <div style={s.notesList}>
          {filteredNotes.length === 0 ? (
            <div style={s.emptyNotes}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-secondary,#4a5568)", marginBottom: 6 }}>
                {search ? "No notes found" : "No notes yet"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted,#718096)", marginBottom: 14 }}>
                {search ? "Try a different search" : "Click + New to create your first note"}
              </div>
              {!search && (
                <button onClick={createNote} style={{ ...s.newBtn, background: trackColor, margin: "0 auto" }}>
                  + Create note
                </button>
              )}
            </div>
          ) : filteredNotes.map(note => (
            <div key={note.id}
              onClick={() => {
                setActiveNote(note);
                setWordCount(note.content.trim().split(/\s+/).filter(Boolean).length);
                setCharCount(note.content.length);
              }}
              style={{
                ...s.noteCard,
                background:  NOTE_COLORS[note.color].bg,
                borderColor: activeNote?.id === note.id ? trackColor : NOTE_COLORS[note.color].border,
                borderWidth:  activeNote?.id === note.id ? 2 : 1,
              }}>
              <div style={s.noteCardHeader}>
                <span style={s.noteCardType}>{NOTE_TYPES.find(t => t.id === note.note_type)?.icon}</span>
                <span style={s.noteCardTitle}>{note.title || "Untitled"}</span>
                {note.is_pinned && <span style={{ fontSize: 11 }}>📌</span>}
              </div>
              {note.lesson_title && (
                <div style={s.noteCardLesson}>{note.track_icon} {note.lesson_title}</div>
              )}
              <div style={s.noteCardPreview}>
                {note.content.replace(/[#*_`>\-\[\]]/g, "").trim().slice(0, 80) || "Empty note"}
              </div>
              <div style={s.noteCardFooter}>
                <span style={s.noteCardTime}>{timeAgo(note.updated_at)}</span>
                {note.tags.slice(0, 2).map(tag => (
                  <span key={tag} style={s.noteCardTag}>#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Editor ── */}
      <div style={s.editor}>
        {!activeNote ? (
          <div style={s.editorEmpty}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📕</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary,#1c2b3a)", marginBottom: 8 }}>
              Your Digital Rough Book
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-muted,#718096)", lineHeight: 1.7, maxWidth: 380, marginBottom: 24 }}>
              Take notes while reading lessons, watching videos, or practicing.
              Notes are organised by lesson, tagged, and searchable.
            </p>
            <div style={s.emptyFeatures}>
              {[
                { icon: "📝", text: "Rich text with formatting" },
                { icon: "🏷️", text: "Tags and categories" },
                { icon: "📌", text: "Pin important notes" },
                { icon: "⬇", text:  "Download as text file" },
                { icon: "🔍", text: "Search all notes" },
                { icon: "📚", text: "Linked to lessons" },
              ].map((f, i) => (
                <div key={i} style={s.emptyFeature}>
                  <span style={{ fontSize: 20 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary,#4a5568)" }}>{f.text}</span>
                </div>
              ))}
            </div>
            <button onClick={createNote} style={{ ...s.newBtnLg, background: trackColor }}>
              + Create your first note
            </button>
          </div>
        ) : (
          <div style={{ ...s.editorActive, background: colorCfg.bg }}>
            {/* Editor toolbar */}
            <div style={s.toolbar}>
              {/* Note type */}
              <div style={{ position: "relative" }}>
                <button onClick={() => { setShowTypePicker(!showTypePicker); setShowColorPicker(false); }}
                  style={s.toolbarBtn} title="Note type">
                  {typeCfg?.icon} {typeCfg?.label}
                </button>
                {showTypePicker && (
                  <div style={s.pickerDropdown}>
                    {NOTE_TYPES.map(t => (
                      <button key={t.id}
                        onClick={() => { updateActiveNote({ note_type: t.id }); setShowTypePicker(false); }}
                        style={{ ...s.pickerItem, fontWeight: activeNote.note_type === t.id ? 700 : 400 }}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Color picker */}
              <div style={{ position: "relative" }}>
                <button onClick={() => { setShowColorPicker(!showColorPicker); setShowTypePicker(false); }}
                  style={{ ...s.toolbarBtn, display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: colorCfg.border, border: "1px solid #aaa" }} />
                  Color
                </button>
                {showColorPicker && (
                  <div style={{ ...s.pickerDropdown, display: "flex", gap: 6, padding: 10, flexWrap: "wrap" as const, width: 180 }}>
                    {(Object.entries(NOTE_COLORS) as [NoteColor, any][]).map(([key, cfg]) => (
                      <button key={key} title={cfg.label}
                        onClick={() => { updateActiveNote({ color: key }); setShowColorPicker(false); }}
                        style={{
                          width: 28, height: 28, borderRadius: "50%", border: "2px solid",
                          borderColor: activeNote.color === key ? "#555" : cfg.border,
                          background: cfg.bg, cursor: "pointer",
                          boxShadow: activeNote.color === key ? "0 0 0 3px rgba(0,0,0,0.2)" : "none",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={s.toolbarDiv} />

              {/* Format buttons */}
              {QUICK_FORMATS.map(fmt => (
                <button key={fmt.action} onClick={() => applyFormat(fmt)}
                  style={{ ...s.toolbarBtn, ...fmt.style, minWidth: 30, padding: "4px 7px" }}
                  title={fmt.action}>
                  {fmt.label}
                </button>
              ))}

              <div style={s.toolbarDiv} />

              {/* Actions */}
              <button onClick={() => togglePin(activeNote)} title={activeNote.is_pinned ? "Unpin" : "Pin"}
                style={{ ...s.toolbarBtn, color: activeNote.is_pinned ? "#D39A21" : "var(--text-muted,#718096)" }}>
                📌
              </button>
              <button onClick={downloadNote} title="Download as .txt" style={s.toolbarBtn}>⬇</button>
              <button onClick={() => deleteNote(activeNote.id)} title="Delete note"
                style={{ ...s.toolbarBtn, color: "#EF4444" }}>🗑</button>

              <div style={{ flex: 1 }} />

              {/* Save status */}
              <div style={s.saveStatus}>
                {saving ? (
                  <span style={{ color: "var(--text-muted,#718096)" }}>● Saving…</span>
                ) : saved ? (
                  <span style={{ color: "#1D9E75" }}>✓ Saved</span>
                ) : (
                  <span style={{ color: "var(--text-muted,#718096)", fontSize: 11 }}>
                    {wordCount} words · {charCount} chars
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <input
              value={activeNote.title}
              onChange={e => updateActiveNote({ title: e.target.value })}
              placeholder="Note title…"
              style={{ ...s.titleInput, background: colorCfg.bg }}
            />

            {/* Lesson context badge */}
            {activeNote.lesson_title && (
              <div style={s.contextBadge}>
                <span>{activeNote.track_icon}</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary,#4a5568)" }}>
                  {activeNote.lesson_title}
                </span>
              </div>
            )}

            {/* Content editor */}
            <textarea
              ref={textareaRef}
              value={activeNote.content}
              onChange={e => updateActiveNote({ content: e.target.value })}
              placeholder={`Start writing your notes here…\n\nTips:\n**bold** _italic_ \`code\`\n- bullet list\n1. numbered list\n- [ ] checkbox\n\n# Heading\n## Section\n\n---  (divider)`}
              style={{ ...s.contentArea, background: colorCfg.bg }}
              spellCheck
            />

            {/* Tags section */}
            <div style={{ ...s.tagsSection, borderColor: colorCfg.border }}>
              <div style={s.tagsRow}>
                <span style={{ fontSize: 12, color: "var(--text-muted,#718096)", flexShrink: 0 }}>🏷️ Tags:</span>
                {activeNote.tags.map(tag => (
                  <div key={tag} style={s.tagPill}>
                    #{tag}
                    <button onClick={() => removeTag(tag)} style={s.tagRemove}>×</button>
                  </div>
                ))}
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag…"
                  style={s.tagInput}
                />
                {tagInput && (
                  <button onClick={addTag} style={s.tagAddBtn}>Add</button>
                )}
              </div>

              {/* Tag suggestions from existing tags */}
              {tagInput && allTags.filter(t => t.includes(tagInput.toLowerCase()) && !activeNote.tags.includes(t)).length > 0 && (
                <div style={s.tagSuggestions}>
                  {allTags.filter(t => t.includes(tagInput.toLowerCase()) && !activeNote.tags.includes(t)).slice(0, 5).map(t => (
                    <button key={t} onClick={() => { updateActiveNote({ tags: [...activeNote.tags, t] }); setTagInput(""); }}
                      style={s.tagSuggestion}>
                      #{t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer meta */}
            <div style={s.editorFooter}>
              <span style={{ fontSize: 11, color: "var(--text-muted,#718096)" }}>
                Created {new Date(activeNote.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted,#718096)" }}>
                Updated {timeAgo(activeNote.updated_at)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root:        { display:"grid", gridTemplateColumns:"280px 1fr", height:"calc(100vh - 120px)", minHeight:500, background:"var(--bg-card,#fff)", border:"1px solid var(--border,#e2ddd5)", borderRadius:16, overflow:"hidden", fontFamily:"var(--font-ui,system-ui)" },
  rootPanel:   { height:"100%", minHeight:400, borderRadius:12 },
  rootFloating:{ height:600, borderRadius:16, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" },
  sidebar:     { borderRight:"1px solid var(--border,#e2ddd5)", display:"flex", flexDirection:"column", background:"var(--bg-surface,#f5f5f3)", overflow:"hidden" },
  sidebarHeader:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 14px 10px", borderBottom:"1px solid var(--border,#e2ddd5)" },
  sidebarTitle:{ display:"flex", alignItems:"center", gap:6, fontSize:14, fontWeight:700, color:"var(--text-primary,#1c2b3a)" },
  noteCount:   { fontSize:10, fontWeight:700, background:"var(--bg-card,#fff)", border:"1px solid var(--border,#e2ddd5)", color:"var(--text-muted,#718096)", padding:"1px 6px", borderRadius:12 },
  newBtn:      { display:"flex", alignItems:"center", gap:4, padding:"5px 12px", fontSize:12, fontWeight:600, border:"none", borderRadius:8, color:"#fff", cursor:"pointer", fontFamily:"var(--font-ui,system-ui)", flexShrink:0 },
  newBtnLg:    { padding:"11px 28px", fontSize:14, fontWeight:700, border:"none", borderRadius:11, color:"#fff", cursor:"pointer", fontFamily:"var(--font-ui,system-ui)" },
  searchWrap:  { padding:"8px 12px 6px" },
  searchInput: { width:"100%", padding:"7px 10px", fontSize:12, border:"1px solid var(--border,#e2ddd5)", borderRadius:8, outline:"none", fontFamily:"var(--font-ui,system-ui)", background:"var(--bg-card,#fff)", color:"var(--text-primary,#1c2b3a)", boxSizing:"border-box" as const },
  filterRow:   { display:"flex", gap:5, padding:"0 10px 6px", flexWrap:"wrap" as const },
  filterChip:  { padding:"3px 8px", fontSize:10, fontWeight:600, border:"1px solid var(--border,#e2ddd5)", borderRadius:20, background:"var(--bg-card,#fff)", color:"var(--text-muted,#718096)", cursor:"pointer", fontFamily:"var(--font-ui,system-ui)" },
  typeFilterRow:{ display:"flex", gap:4, padding:"0 10px 6px" },
  typeChip:    { padding:"3px 7px", fontSize:11, border:"1px solid var(--border,#e2ddd5)", borderRadius:8, background:"var(--bg-card,#fff)", color:"var(--text-muted,#718096)", cursor:"pointer", fontFamily:"var(--font-ui,system-ui)" },
  typeChipActive:{ fontWeight:600 },
  tagsFilter:  { display:"flex", gap:4, padding:"0 10px 6px", flexWrap:"wrap" as const },
  tagChip:     { padding:"2px 7px", fontSize:10, fontWeight:500, border:"1px solid var(--border,#e2ddd5)", borderRadius:12, background:"var(--bg-card,#fff)", color:"var(--text-muted,#718096)", cursor:"pointer", fontFamily:"var(--font-ui,system-ui)" },
  notesList:   { flex:1, overflowY:"auto" as const, padding:"6px 10px", scrollbarWidth:"thin" as const },
  emptyNotes:  { textAlign:"center" as const, padding:"32px 16px", display:"flex", flexDirection:"column" as const, alignItems:"center" },
  noteCard:    { padding:"10px 12px", borderRadius:10, border:"1px solid", marginBottom:6, cursor:"pointer", transition:"all 0.15s" },
  noteCardHeader:{ display:"flex", alignItems:"center", gap:6, marginBottom:4 },
  noteCardType:{ fontSize:13, flexShrink:0 },
  noteCardTitle:{ fontSize:13, fontWeight:600, color:"var(--text-primary,#1c2b3a)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const },
  noteCardLesson:{ fontSize:10, color:"var(--text-muted,#718096)", marginBottom:4 },
  noteCardPreview:{ fontSize:12, color:"var(--text-secondary,#4a5568)", lineHeight:1.5, marginBottom:6, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as const, overflow:"hidden" },
  noteCardFooter:{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" as const },
  noteCardTime:{ fontSize:10, color:"var(--text-muted,#718096)" },
  noteCardTag: { fontSize:9, color:"var(--text-muted,#718096)", background:"rgba(0,0,0,0.06)", padding:"1px 5px", borderRadius:8 },
  editor:      { display:"flex", flexDirection:"column" as const, overflow:"hidden" },
  editorEmpty: { flex:1, display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", padding:"40px 32px", textAlign:"center" as const },
  emptyFeatures:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24, width:"100%", maxWidth:360 },
  emptyFeature:{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"var(--bg-surface,#f5f5f3)", borderRadius:10 },
  editorActive:{ flex:1, display:"flex", flexDirection:"column" as const, overflow:"hidden" },
  toolbar:     { display:"flex", alignItems:"center", gap:3, padding:"8px 14px", borderBottom:"1px solid rgba(0,0,0,0.08)", flexWrap:"wrap" as const, flexShrink:0 },
  toolbarBtn:  { padding:"4px 9px", fontSize:12, border:"1px solid rgba(0,0,0,0.1)", borderRadius:6, background:"rgba(255,255,255,0.7)", color:"var(--text-secondary,#4a5568)", cursor:"pointer", fontFamily:"var(--font-ui,system-ui)", display:"flex", alignItems:"center", gap:4 },
  toolbarDiv:  { width:1, height:18, background:"rgba(0,0,0,0.1)", margin:"0 3px", flexShrink:0 },
  saveStatus:  { fontSize:12, color:"var(--text-muted,#718096)", flexShrink:0 },
  titleInput:  { width:"100%", padding:"14px 20px 8px", fontSize:22, fontWeight:800, color:"var(--text-primary,#1c2b3a)", border:"none", outline:"none", fontFamily:"var(--font-ui,system-ui)", letterSpacing:"-0.4px", flexShrink:0, boxSizing:"border-box" as const },
  contextBadge:{ display:"flex", alignItems:"center", gap:6, padding:"4px 20px 8px", flexShrink:0 },
  contentArea: { flex:1, padding:"8px 20px 14px", fontSize:14, lineHeight:1.85, color:"var(--text-secondary,#4a5568)", border:"none", outline:"none", resize:"none" as const, fontFamily:"var(--font-reading,'Source Serif 4',Georgia,serif)", overflowY:"auto" as const, boxSizing:"border-box" as const },
  tagsSection: { padding:"10px 20px 8px", borderTop:"1px solid", flexShrink:0 },
  tagsRow:     { display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" as const },
  tagPill:     { display:"flex", alignItems:"center", gap:3, fontSize:11, fontWeight:500, color:"var(--text-secondary,#4a5568)", background:"rgba(0,0,0,0.07)", padding:"2px 8px", borderRadius:12 },
  tagRemove:   { fontSize:13, lineHeight:1, background:"none", border:"none", cursor:"pointer", color:"var(--text-muted,#718096)", padding:0 },
  tagInput:    { fontSize:12, border:"none", outline:"none", fontFamily:"var(--font-ui,system-ui)", background:"transparent", color:"var(--text-secondary,#4a5568)", minWidth:80 },
  tagAddBtn:   { fontSize:11, fontWeight:600, padding:"2px 8px", border:"1px solid var(--border,#e2ddd5)", borderRadius:8, background:"var(--bg-card,#fff)", cursor:"pointer", fontFamily:"var(--font-ui,system-ui)", color:"var(--text-muted,#718096)" },
  tagSuggestions:{ display:"flex", gap:5, marginTop:6, flexWrap:"wrap" as const },
  tagSuggestion: { fontSize:11, padding:"2px 8px", border:"1px dashed var(--border,#e2ddd5)", borderRadius:12, background:"transparent", cursor:"pointer", color:"var(--text-muted,#718096)", fontFamily:"var(--font-ui,system-ui)" },
  editorFooter:{ display:"flex", justifyContent:"space-between", padding:"6px 20px 12px", flexShrink:0 },
  pickerDropdown:{ position:"absolute", top:"calc(100% + 4px)", left:0, background:"var(--bg-card,#fff)", border:"1px solid var(--border,#e2ddd5)", borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", zIndex:200, minWidth:140, overflow:"hidden" },
  pickerItem:  { display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 12px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"var(--font-ui,system-ui)", fontSize:12, color:"var(--text-secondary,#4a5568)", textAlign:"left" as const },
};
