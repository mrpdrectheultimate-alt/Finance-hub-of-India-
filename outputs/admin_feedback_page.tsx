"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Admin Feedback Dashboard
// app/admin/feedback/page.tsx
// Read all feedback, filter, reply, mark resolved
// ============================================================

type FeedbackItem = {
  id:          string;
  type:        string;
  rating:      number | null;
  page:        string | null;
  message:     string;
  email:       string | null;
  url:         string | null;
  status:      "new" | "read" | "replied" | "resolved";
  created_at:  string;
  admin_note:  string | null;
};

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  rating:  { icon:"⭐", color:"#92400E", bg:"#FFFBEB" },
  bug:     { icon:"🐛", color:"#991B1B", bg:"#FEF2F2" },
  feature: { icon:"💡", color:"#166534", bg:"#F0FDF4" },
  question:{ icon:"❓", color:"#1E40AF", bg:"#EFF6FF" },
  content: { icon:"📚", color:"#6B21A8", bg:"#FDF4FF" },
  other:   { icon:"💬", color:"#475569", bg:"#F1F5F9" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new:      { label:"New",      color:"#991B1B", bg:"#FEF2F2" },
  read:     { label:"Read",     color:"#92400E", bg:"#FFFBEB" },
  replied:  { label:"Replied",  color:"#166534", bg:"#F0FDF4" },
  resolved: { label:"Resolved", color:"#475569", bg:"#F1F5F9" },
};

export default function AdminFeedbackPage() {
  const [items,      setItems]      = useState<FeedbackItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected,   setSelected]   = useState<FeedbackItem | null>(null);
  const [note,       setNote]       = useState("");
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState("");

  useEffect(() => { loadFeedback(); }, []);

  const loadFeedback = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as FeedbackItem[]) || []);
    setLoading(false);
  };

  const markStatus = async (id: string, status: FeedbackItem["status"]) => {
    await supabase.from("feedback").update({ status } as any).eq("id", id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  const saveNote = async () => {
    if (!selected) return;
    setSaving(true);
    await supabase.from("feedback").update({ admin_note: note, status: "read" } as any).eq("id", selected.id);
    setItems(prev => prev.map(i => i.id === selected.id ? { ...i, admin_note: note, status: "read" } : i));
    setSaving(false);
  };

  const openItem = (item: FeedbackItem) => {
    setSelected(item);
    setNote(item.admin_note || "");
    if (item.status === "new") markStatus(item.id, "read");
  };

  // Stats
  const stats = {
    total:    items.length,
    new:      items.filter(i => i.status === "new").length,
    bugs:     items.filter(i => i.type === "bug").length,
    avgRating: items.filter(i => i.rating).length
      ? (items.filter(i => i.rating).reduce((s, i) => s + (i.rating || 0), 0) / items.filter(i => i.rating).length).toFixed(1)
      : "—",
  };

  const filtered = items.filter(i => {
    if (filter !== "all" && i.status !== filter) return false;
    if (typeFilter !== "all" && i.type !== typeFilter) return false;
    if (search && !i.message.toLowerCase().includes(search.toLowerCase()) &&
        !i.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleString("en-IN", { timeZone:"Asia/Kolkata", day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" });

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"var(--font-ui,system-ui)" }}>
      {/* Header */}
      <div style={{ background:"#0B1A2B", padding:"20px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, color:"#fff", margin:0, letterSpacing:"-0.3px" }}>
            📬 Feedback Dashboard
          </h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>
            All user feedback · FinanceHub Admin
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <a href="/admin/dashboard" style={{ padding:"7px 14px", background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.7)", borderRadius:8, fontSize:12, textDecoration:"none" }}>
            ← Admin home
          </a>
          <button onClick={loadFeedback} style={{ padding:"7px 14px", background:"#0E6163", color:"#fff", border:"none", borderRadius:8, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e2e8f0", padding:"16px 28px", display:"flex", gap:24, flexWrap:"wrap" }}>
        {[
          { label:"Total feedback",    val:stats.total,     color:"#0B1A2B" },
          { label:"Unread",            val:stats.new,       color:"#991B1B" },
          { label:"Bug reports",       val:stats.bugs,      color:"#991B1B" },
          { label:"Avg rating",        val:`${stats.avgRating}/5`, color:"#92400E" },
        ].map(s => (
          <div key={s.label} style={{ textAlign:"center" }}>
            <div style={{ fontSize:24, fontWeight:800, color:s.color, letterSpacing:"-0.5px", lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:11, color:"#9ca3af", marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", height:"calc(100vh - 140px)" }}>

        {/* LEFT: List */}
        <div style={{ width:360, borderRight:"1px solid #e2e8f0", background:"#fff", display:"flex", flexDirection:"column", flexShrink:0 }}>

          {/* Filters */}
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #f0f0f0" }}>
            <input
              type="text" placeholder="Search messages or emails…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width:"100%", padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box" as any, marginBottom:8, fontFamily:"inherit" }}
            />
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {["all","new","read","replied","resolved"].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  style={{ padding:"4px 10px", fontSize:11, fontWeight:filter===s?700:400, background:filter===s?"#0B1A2B":"#f1f5f9", color:filter===s?"#fff":"#718096", border:"none", borderRadius:20, cursor:"pointer", textTransform:"capitalize" as any, fontFamily:"inherit" }}>
                  {s}
                </button>
              ))}
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:6 }}>
              {["all","bug","feature","question","rating","content","other"].map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  style={{ padding:"3px 9px", fontSize:10, fontWeight:typeFilter===t?700:400, background:typeFilter===t?"#0E6163":"#f8fafc", color:typeFilter===t?"#fff":"#9ca3af", border:"1px solid #e2e8f0", borderRadius:20, cursor:"pointer", textTransform:"capitalize" as any, fontFamily:"inherit" }}>
                  {t !== "all" ? (TYPE_CONFIG[t]?.icon + " ") : ""}{t}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div style={{ flex:1, overflowY:"auto" }}>
            {loading ? (
              <div style={{ padding:24, textAlign:"center", color:"#9ca3af", fontSize:13 }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding:24, textAlign:"center", color:"#9ca3af", fontSize:13 }}>No feedback matches your filter</div>
            ) : (
              filtered.map(item => {
                const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.other;
                const sc = STATUS_CONFIG[item.status];
                const isSelected = selected?.id === item.id;
                return (
                  <div key={item.id} onClick={() => openItem(item)}
                    style={{
                      padding:"14px 16px", cursor:"pointer",
                      borderBottom:"1px solid #f5f7fa",
                      background: isSelected ? "#F0F9F7" : item.status === "new" ? "#FFFBF5" : "#fff",
                      borderLeft: isSelected ? "3px solid #0E6163" : "3px solid transparent",
                      transition:"background 0.12s",
                    }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <span style={{ fontSize:14 }}>{tc.icon}</span>
                        <span style={{ fontSize:12, fontWeight:600, color:"#1c2b3a" }}>
                          {item.type.charAt(0).toUpperCase()+item.type.slice(1)}
                        </span>
                        {item.rating && <span style={{ fontSize:11, color:"#F59E0B" }}>{"★".repeat(item.rating)}</span>}
                      </div>
                      <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                        <span style={{ padding:"1px 7px", borderRadius:10, fontSize:10, fontWeight:600, background:sc.bg, color:sc.color }}>{sc.label}</span>
                        <span style={{ fontSize:10, color:"#c0c8d2" }}>{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:"#526173", lineHeight:1.5, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as any }}>
                      {item.message}
                    </div>
                    {item.email && (
                      <div style={{ fontSize:10, color:"#0E6163", marginTop:5 }}>📧 {item.email}</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Detail */}
        <div style={{ flex:1, overflowY:"auto", padding:28, background:"#f8fafc" }}>
          {!selected ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color:"#9ca3af" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📬</div>
              <div style={{ fontSize:15, fontWeight:600, color:"#1c2b3a", marginBottom:6 }}>Select a message</div>
              <div style={{ fontSize:13 }}>Click any feedback item to read it</div>
            </div>
          ) : (
            <div style={{ maxWidth:680, margin:"0 auto" }}>

              {/* Detail header */}
              <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:"20px 24px", marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:12 }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                    {(() => { const tc=TYPE_CONFIG[selected.type]||TYPE_CONFIG.other; return (
                      <span style={{ padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:600, background:tc.bg, color:tc.color }}>
                        {tc.icon} {selected.type.charAt(0).toUpperCase()+selected.type.slice(1)}
                      </span>
                    );})()}
                    {selected.rating && (
                      <span style={{ fontSize:16, color:"#F59E0B" }}>{"★".repeat(selected.rating)}{"☆".repeat(5-selected.rating)}</span>
                    )}
                  </div>
                  <div style={{ fontSize:12, color:"#9ca3af" }}>{formatDate(selected.created_at)}</div>
                </div>

                {/* Meta */}
                <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"6px 16px", fontSize:12, marginBottom:16 }}>
                  {selected.email && <><span style={{ color:"#9ca3af", fontWeight:500 }}>From</span><span style={{ color:"#1c2b3a" }}><a href={`mailto:${selected.email}`} style={{ color:"#0E6163" }}>{selected.email}</a></span></>}
                  {selected.page  && <><span style={{ color:"#9ca3af", fontWeight:500 }}>Page</span><span style={{ color:"#1c2b3a" }}>{selected.page}</span></>}
                  {selected.url   && <><span style={{ color:"#9ca3af", fontWeight:500 }}>URL</span><span style={{ color:"#526173", fontFamily:"monospace", fontSize:11 }}>{selected.url}</span></>}
                </div>

                {/* Message */}
                <div style={{ background:"#f8fafc", borderLeft:"3px solid #0E6163", padding:"14px 16px", borderRadius:"0 10px 10px 0", fontSize:14, color:"#374151", lineHeight:1.8, whiteSpace:"pre-wrap", marginBottom:20 }}>
                  {selected.message}
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {selected.email && (
                    <a href={`mailto:${selected.email}?subject=Re: Your FinanceHub feedback&body=Hi,%0A%0AThank you for reaching out.%0A%0ARegarding your message: "${selected.message.slice(0,80)}…"%0A%0A`}
                      style={{ padding:"8px 16px", background:"#0E6163", color:"#fff", borderRadius:9, fontSize:13, fontWeight:600, textDecoration:"none" }}>
                      📧 Reply by email
                    </a>
                  )}
                  {(["new","read","replied","resolved"] as const).map(s => (
                    <button key={s} onClick={() => markStatus(selected.id, s)}
                      disabled={selected.status === s}
                      style={{
                        padding:"8px 14px", fontSize:12, fontWeight:500,
                        background: selected.status===s ? "#0B1A2B" : "#f1f5f9",
                        color: selected.status===s ? "#fff" : "#718096",
                        border:"none", borderRadius:9, cursor: selected.status===s ? "default" : "pointer",
                        fontFamily:"inherit", textTransform:"capitalize" as any,
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin note */}
              <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:"20px 24px" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#1c2b3a", marginBottom:10 }}>📝 Admin note (private)</div>
                <textarea
                  value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Add internal notes about this feedback…"
                  rows={4}
                  style={{ width:"100%", padding:"10px 12px", border:"1px solid #e2e8f0", borderRadius:9, fontSize:13, fontFamily:"inherit", lineHeight:1.6, resize:"none", outline:"none", boxSizing:"border-box" as any, marginBottom:10 }}
                  onFocus={e=>(e.target.style.borderColor="#0E6163")}
                  onBlur={e=>(e.target.style.borderColor="#e2e8f0")}
                />
                <button onClick={saveNote} disabled={saving}
                  style={{ padding:"8px 18px", background:saving?"#9ca3af":"#0B1A2B", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:600, cursor:saving?"not-allowed":"pointer", fontFamily:"inherit" }}>
                  {saving ? "Saving…" : "Save note"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
