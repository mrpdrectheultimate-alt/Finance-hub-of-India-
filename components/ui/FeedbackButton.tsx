"use client";
import { useState, useRef, useEffect } from "react";

// ============================================================
// FinanceHub — Feedback Button
// components/ui/FeedbackButton.tsx
//
// Floating button on every page. Collects:
//   ⭐ Website ratings
//   🐛 Bug reports
//   💡 Feature requests
//   ❓ Questions
//   📚 Content issues
//   💬 General feedback
//
// On submit → POST /api/feedback → email to admin via Resend
// ============================================================

type FeedbackType = "rating" | "bug" | "feature" | "question" | "content" | "other";

const TYPES: Array<{
  id:   FeedbackType;
  icon: string;
  name: string;
  desc: string;
  placeholder: string;
}> = [
  { id:"rating",  icon:"⭐", name:"Rate website",    desc:"Overall experience",   placeholder:"Tell us what you liked or what could be better…" },
  { id:"bug",     icon:"🐛", name:"Report a bug",    desc:"Something broken",     placeholder:"Describe what happened and how to reproduce it…" },
  { id:"feature", icon:"💡", name:"Feature request", desc:"Something missing",    placeholder:"Describe the feature you'd like to see on FinanceHub…" },
  { id:"question",icon:"❓", name:"Ask a question",  desc:"Content or platform",  placeholder:"What would you like to know? We'll reply in 24 hours." },
  { id:"content", icon:"📚", name:"Content issue",   desc:"Lesson or accuracy",   placeholder:"Which lesson, and what was inaccurate or missing?" },
  { id:"other",   icon:"💬", name:"Other",           desc:"Anything else",        placeholder:"Your message…" },
];

const PAGES = [
  "Homepage","Lesson player","Explore / courses","Finance Lab / simulators",
  "AI Mentor","Library","Dashboard","Leaderboard","Certificates",
  "Glossary","Case Studies","Knowledge Map","Profile / settings",
  "Pricing page","Site map","Other",
];

const SUCCESS_MSG: Record<FeedbackType, string> = {
  rating:  "Your rating helps us understand what's working and what needs improvement.",
  bug:     "Our team has been notified and will investigate this issue promptly.",
  feature: "We've logged your feature request. Popular requests get built first.",
  question:"We'll get back to you with an answer within 24 hours.",
  content: "Our content team will review this lesson and correct any inaccuracies.",
  other:   "Your feedback has been received. We read every message and use them to improve FinanceHub.",
};

export default function FeedbackButton() {
  const [open,        setOpen]        = useState(false);
  const [type,        setType]        = useState<FeedbackType | null>(null);
  const [rating,      setRating]      = useState(0);
  const [hoverStar,   setHoverStar]   = useState(0);
  const [message,     setMessage]     = useState("");
  const [email,       setEmail]       = useState("");
  const [page,        setPage]        = useState("");
  const [status,      setStatus]      = useState<"idle"|"sending"|"done"|"error">("idle");
  const [msgError,    setMsgError]    = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const textRef  = useRef<HTMLTextAreaElement>(null);

  const currentUrl = typeof window !== "undefined" ? window.location.pathname : "";

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const btn = document.getElementById("fh-fb-btn");
        if (btn && btn.contains(e.target as Node)) return;
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus textarea when type selected
  useEffect(() => {
    if (type && textRef.current) {
      setTimeout(() => textRef.current?.focus(), 100);
    }
  }, [type]);

  const reset = () => {
    setType(null); setRating(0); setHoverStar(0);
    setMessage(""); setEmail(""); setPage("");
    setStatus("idle"); setMsgError(false);
  };

  const handleSubmit = async () => {
    if (!message.trim()) { setMsgError(true); textRef.current?.focus(); return; }
    setStatus("sending");

    try {
      const res = await fetch("/api/feedback", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type, rating: rating || null,
          page: page || currentUrl,
          message: message.trim(),
          email:   email.trim() || null,
          url:     currentUrl,
          ts:      new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Send failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const activeType = TYPES.find(t => t.id === type);

  return (
    <>
      {/* ── Floating trigger button ────────────────────────── */}
      <button
        id="fh-fb-btn"
        onClick={() => { setOpen(o => !o); if (!open) reset(); }}
        aria-label="Send feedback"
        style={{
          position:     "fixed",
          bottom:       28,
          right:        28,
          display:      "flex",
          alignItems:   "center",
          gap:          8,
          background:   "#ffffff",
          border:       "0.5px solid #d1d5db",
          borderRadius: 24,
          padding:      "10px 16px 10px 12px",
          cursor:       "pointer",
          boxShadow:    "0 4px 16px rgba(0,0,0,0.10)",
          fontFamily:   "inherit",
          zIndex:       1000,
          transition:   "all 0.18s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor="#0E6163"; e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.15)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor="#d1d5db"; e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.10)"; }}
      >
        {/* Pulse dot */}
        <span style={{
          width:12, height:12, borderRadius:"50%",
          background:"#1D9E75", flexShrink:0,
          boxShadow: open ? "none" : "0 0 0 3px rgba(29,158,117,0.2)",
          transition:"box-shadow 0.3s",
        }} />
        <span style={{ fontSize:13, fontWeight:600, color:"#0B1A2B", letterSpacing:"-0.1px" }}>
          {open ? "Close" : "Feedback"}
        </span>
      </button>

      {/* ── Feedback panel ─────────────────────────────────── */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Feedback panel"
          style={{
            position:     "fixed",
            bottom:       80,
            right:        28,
            width:        340,
            background:   "#ffffff",
            border:       "0.5px solid #e5e7eb",
            borderRadius: 16,
            boxShadow:    "0 8px 32px rgba(0,0,0,0.13)",
            zIndex:       999,
            overflow:     "hidden",
            animation:    "fhSlideUp 0.2s ease",
          }}
        >
          <style>{`
            @keyframes fhSlideUp {
              from { opacity:0; transform:translateY(10px); }
              to   { opacity:1; transform:translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"15px 18px 13px", borderBottom:"0.5px solid #f0f0f0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#0E6163,#1D9E75)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>
                📈
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"#0B1A2B" }}>Share your feedback</div>
                <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>We read every message</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", fontSize:18, padding:"2px 4px", lineHeight:1, borderRadius:6, fontFamily:"inherit" }}
              onMouseEnter={e=>(e.currentTarget.style.color="#374151")}
              onMouseLeave={e=>(e.currentTarget.style.color="#9ca3af")}>
              ✕
            </button>
          </div>

          {/* ── SUCCESS STATE ─────────────────────────────── */}
          {status === "done" && (
            <div style={{ padding:"28px 24px", textAlign:"center" }}>
              <div style={{ fontSize:44, marginBottom:12 }}>🎉</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#0B1A2B", marginBottom:8 }}>Thank you!</div>
              <div style={{ fontSize:13, color:"#6b7280", lineHeight:1.7, marginBottom:16 }}>
                {activeType ? SUCCESS_MSG[activeType.id] : SUCCESS_MSG.other}
              </div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, color:"#9ca3af", background:"#f9fafb", border:"0.5px solid #e5e7eb", borderRadius:20, padding:"5px 14px", marginBottom:14 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#1D9E75", flexShrink:0 }}/>
                We reply within 24 hours
              </div>
              <button onClick={reset}
                style={{ display:"block", width:"100%", padding:"8px", marginTop:4, background:"none", border:"0.5px solid #e5e7eb", borderRadius:9, fontSize:12, color:"#6b7280", cursor:"pointer", fontFamily:"inherit" }}>
                Send another message
              </button>
            </div>
          )}

          {/* ── ERROR STATE ───────────────────────────────── */}
          {status === "error" && (
            <div style={{ padding:"24px", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:10 }}>⚠️</div>
              <div style={{ fontSize:14, fontWeight:600, color:"#0B1A2B", marginBottom:6 }}>Failed to send</div>
              <div style={{ fontSize:12, color:"#6b7280", marginBottom:16 }}>Please try again or email us at support@financehub.in</div>
              <button onClick={() => setStatus("idle")}
                style={{ padding:"8px 20px", background:"#0E6163", color:"#fff", border:"none", borderRadius:9, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                Try again
              </button>
            </div>
          )}

          {/* ── MAIN FORM ─────────────────────────────────── */}
          {(status === "idle" || status === "sending") && (
            <>
              {/* Type grid */}
              {!type && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, padding:"14px 16px" }}>
                  {TYPES.map(t => (
                    <button key={t.id} onClick={() => { setType(t.id); setMsgError(false); }}
                      style={{
                        display:"flex", alignItems:"center", gap:9,
                        padding:"10px 11px",
                        border:"0.5px solid #e5e7eb", borderRadius:10,
                        background:"#fafafa", cursor:"pointer",
                        fontFamily:"inherit", textAlign:"left",
                        transition:"all 0.15s",
                      }}
                      onMouseEnter={e=>{ e.currentTarget.style.borderColor="#0E6163"; e.currentTarget.style.background="#F0F9F7"; }}
                      onMouseLeave={e=>{ e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.background="#fafafa"; }}>
                      <span style={{ fontSize:18, flexShrink:0 }}>{t.icon}</span>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:"#0B1A2B", lineHeight:1.3 }}>{t.name}</div>
                        <div style={{ fontSize:10, color:"#9ca3af", marginTop:1 }}>{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Form fields */}
              {type && activeType && (
                <div style={{ padding:"4px 16px 14px" }}>
                  {/* Back + type header */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 0 12px", borderBottom:"0.5px solid #f5f5f5", marginBottom:12 }}>
                    <button onClick={() => { setType(null); setMessage(""); setRating(0); setMsgError(false); }}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", fontSize:16, padding:"0 4px 0 0", lineHeight:1, fontFamily:"inherit" }}>
                      ←
                    </button>
                    <span style={{ fontSize:14, fontWeight:600, color:"#0B1A2B" }}>{activeType.icon} {activeType.name}</span>
                  </div>

                  {/* Star rating */}
                  {type === "rating" && (
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:11, fontWeight:500, color:"#6b7280", marginBottom:8 }}>Overall rating</div>
                      <div style={{ display:"flex", gap:4 }}>
                        {[1,2,3,4,5].map(n => (
                          <button key={n}
                            onClick={() => setRating(n)}
                            onMouseEnter={() => setHoverStar(n)}
                            onMouseLeave={() => setHoverStar(0)}
                            style={{
                              fontSize:26, background:"none", border:"none", cursor:"pointer",
                              opacity: n <= (hoverStar || rating) ? 1 : 0.25,
                              transform: n <= (hoverStar || rating) ? "scale(1.1)" : "scale(1)",
                              transition:"all 0.12s", lineHeight:1, padding:"2px",
                              color: n <= (hoverStar || rating) ? "#F59E0B" : "#9ca3af",
                            }}>★</button>
                        ))}
                        {rating > 0 && (
                          <span style={{ fontSize:11, color:"#9ca3af", alignSelf:"center", marginLeft:4 }}>
                            {["","Terrible","Poor","Okay","Good","Excellent!"][rating]}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Page picker */}
                  {(type === "bug" || type === "content") && (
                    <div style={{ marginBottom:10 }}>
                      <label style={{ display:"block", fontSize:11, fontWeight:500, color:"#6b7280", marginBottom:5 }}>
                        Which page? (optional)
                      </label>
                      <select value={page} onChange={e => setPage(e.target.value)}
                        style={{ width:"100%", padding:"8px 12px", border:"0.5px solid #e5e7eb", borderRadius:9, background:"#fafafa", color:"#0B1A2B", fontFamily:"inherit", fontSize:12, outline:"none", cursor:"pointer" }}>
                        <option value="">Select a page…</option>
                        {PAGES.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Message */}
                  <label style={{ display:"block", fontSize:11, fontWeight:500, color:"#6b7280", marginBottom:5 }}>
                    Your message{type !== "rating" ? "" : " (optional)"}
                  </label>
                  {msgError && (
                    <div style={{ fontSize:11, color:"#dc2626", marginBottom:6 }}>
                      Please write your message before sending.
                    </div>
                  )}
                  <textarea
                    ref={textRef}
                    value={message}
                    onChange={e => { setMessage(e.target.value); if(e.target.value) setMsgError(false); }}
                    placeholder={activeType.placeholder}
                    maxLength={1000}
                    rows={4}
                    style={{
                      width:"100%", padding:"10px 12px",
                      border:`0.5px solid ${msgError ? "#dc2626" : "#e5e7eb"}`,
                      borderRadius:9, background:"#fafafa",
                      color:"#0B1A2B", fontFamily:"inherit", fontSize:13,
                      lineHeight:1.6, resize:"none", outline:"none",
                      marginBottom:10, boxSizing:"border-box",
                      transition:"border-color 0.15s",
                    }}
                    onFocus={e=>(e.target.style.borderColor="#0E6163")}
                    onBlur={e=>(e.target.style.borderColor=msgError?"#dc2626":"#e5e7eb")}
                  />

                  {/* Email */}
                  <label style={{ display:"block", fontSize:11, fontWeight:500, color:"#6b7280", marginBottom:5 }}>
                    Email <span style={{ color:"#9ca3af", fontWeight:400 }}>(optional — so we can reply)</span>
                  </label>
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{
                      width:"100%", padding:"8px 12px",
                      border:"0.5px solid #e5e7eb", borderRadius:9,
                      background:"#fafafa", color:"#0B1A2B",
                      fontFamily:"inherit", fontSize:12, outline:"none",
                      marginBottom:12, boxSizing:"border-box",
                      transition:"border-color 0.15s",
                    }}
                    onFocus={e=>(e.target.style.borderColor="#0E6163")}
                    onBlur={e=>(e.target.style.borderColor="#e5e7eb")}
                  />

                  {/* Submit row */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                    <span style={{ fontSize:11, color:"#d1d5db" }}>{message.length} / 1000</span>
                    <button
                      onClick={handleSubmit}
                      disabled={status === "sending"}
                      style={{
                        padding:"9px 20px",
                        background: status === "sending" ? "#9ca3af" : "#0E6163",
                        color:"#fff", border:"none", borderRadius:9,
                        fontSize:13, fontWeight:600, cursor: status === "sending" ? "not-allowed" : "pointer",
                        fontFamily:"inherit", display:"flex", alignItems:"center", gap:6,
                        transition:"background 0.15s",
                      }}>
                      {status === "sending" ? (
                        <><span style={{ width:12, height:12, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"fhSpin 0.7s linear infinite", display:"inline-block" }} /> Sending…</>
                      ) : "Send feedback"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          {status !== "done" && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 18px", borderTop:"0.5px solid #f5f5f5", background:"#fafafa" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:"#9ca3af" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#1D9E75", flexShrink:0 }}/>
                Reply within 24 hours
              </div>
              <span style={{ fontSize:10, color:"#d1d5db" }}>FinanceHub</span>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fhSpin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
