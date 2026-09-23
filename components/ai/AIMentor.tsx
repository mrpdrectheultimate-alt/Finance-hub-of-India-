"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AIDisclaimer } from "@/components/ui/FinanceDisclaimer";

// ============================================================
// FinanceHub — AI Mentor Chat Component
// components/ai/AIMentor.tsx
// Streaming · Personalised · Source-cited · Rate-limited
// ============================================================

type Message = {
  id:       string;
  role:     "user" | "assistant";
  content:  string;
  intent?:  string;
  loading?: boolean;
};

const INTENT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  education:      { label: "📚 Education",   color: "#185FA5", bg: "#EBF8FF" },
  calculation:    { label: "🧮 Calculation", color: "#854F0B", bg: "#FFFBEB" },
  comparison:     { label: "⚖️ Comparison",  color: "#553C9A", bg: "#FAF5FF" },
  recommendation: { label: "💡 Advisory",   color: "#B7791F", bg: "#FFFFF0" },
  quiz:           { label: "🎯 Quiz",        color: "#1D9E75", bg: "#F0FFF4" },
  clarification:  { label: "🔍 Detail",     color: "#0E6163", bg: "#E6FFFA" },
};

const QUICK_QUESTIONS = [
  "What is SIP and how does it work?",
  "Explain compound interest with an Indian example",
  "What is the difference between ELSS and PPF?",
  "How do I calculate my income tax?",
  "What is CAGR and how to calculate it?",
  "Explain what options trading is",
  "What is CIBIL score and how to improve it?",
  "How does NPS tax benefit work?",
];

const genId = () => Math.random().toString(36).slice(2, 9);

function formatMessage(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code style='background:#f1f5f9;padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.9em'>$1</code>")
    .replace(/\[Source: (.+?)\]/g, "<span style='font-size:11px;color:#718096;background:#f7fafc;border:1px solid #e2e8f0;padding:2px 7px;border-radius:10px;display:inline-block;margin:2px 0'>📎 Source: $1</span>")
    .replace(/\n\n/g, "</p><p style='margin:0 0 10px'>")
    .replace(/\n/g, "<br/>");
}

interface AIMentorProps {
  lessonContext?: { lessonTitle: string; trackName: string };
  initialQuestion?: string;
  compact?: boolean;
}

export default function AIMentor({ lessonContext, initialQuestion, compact = false }: AIMentorProps) {
  const [messages,   setMessages]   = useState<Message[]>([]);
  const [input,      setInput]      = useState(initialQuestion || "");
  const [loading,    setLoading]    = useState(false);
  const [remaining,  setRemaining]  = useState<number | null>(null);
  const [limit,      setLimit]      = useState<number>(5);
  const [tier,       setTier]       = useState("free");
  const [error,      setError]      = useState("");
  const [userName,   setUserName]   = useState("there");
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  // Load user info
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await (supabase.from("profiles") as any)
        .select("full_name,subscription_tier,ai_questions_today,ai_reset_date")
        .eq("id", user.id).single();
      if (data) {
        const profileData = data as any;
        setUserName(profileData.full_name?.split(" ")[0] || "there");
        setTier(profileData.subscription_tier || "free");
        const limits = { free: 5, pro: 50, expert: 200 };
        const lim = limits[profileData.subscription_tier as keyof typeof limits] || 5;
        setLimit(lim);
        setRemaining(lim - (profileData.ai_questions_today || 0));
      }
    })();
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (question?: string) => {
    const q = (question || input).trim();
    if (!q || loading) return;

    setInput("");
    setError("");
    setLoading(true);

    const userMsg: Message = { id: genId(), role: "user", content: q };
    const assistantMsg: Message = { id: genId(), role: "assistant", content: "", loading: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai-mentor", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ question: q, conversationHistory: history, lessonContext }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Something went wrong. Please try again.");
        setMessages(prev => prev.filter(m => m.id !== assistantMsg.id));
        setLoading(false);
        return;
      }

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let   full    = "";
      let   intent  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              full += data.text;
              setMessages(prev => prev.map(m =>
                m.id === assistantMsg.id ? { ...m, content: full, loading: false } : m
              ));
            }
            if (data.done) {
              intent = data.intent || "";
              setRemaining(data.remaining ?? null);
              setTier(data.tier || tier);
            }
          } catch { /* partial chunk */ }
        }
      }

      // Finalise message with intent
      setMessages(prev => prev.map(m =>
        m.id === assistantMsg.id ? { ...m, content: full, loading: false, intent } : m
      ));

    } catch (err) {
      setError("Connection error. Please check your internet and try again.");
      setMessages(prev => prev.filter(m => m.id !== assistantMsg.id));
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isRateLimited   = remaining !== null && remaining <= 0;
  const isLowOnQuestions= remaining !== null && remaining <= 2 && remaining > 0;

  return (
    <div style={{
      display:        "flex",
      flexDirection:  "column",
      height:         compact ? 480 : "calc(100vh - 120px)",
      background:     "#fff",
      border:         "1px solid #e2e8f0",
      borderRadius:   compact ? 14 : 0,
      overflow:       "hidden",
      fontFamily:     "var(--font-ui,system-ui)",
    }}>

      {/* Header */}
      <div style={{
        padding:       "14px 18px",
        background:    "linear-gradient(135deg, #0D1117 0%, #1a2a40 100%)",
        borderBottom:  "1px solid #0E616340",
        display:       "flex",
        alignItems:    "center",
        justifyContent:"space-between",
        flexShrink:    0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #0E6163, #1D9E75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>
            🤖
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>AI Finance Mentor</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
              {lessonContext ? `Studying: ${lessonContext.lessonTitle}` : "Ask anything about finance"}
            </div>
          </div>
        </div>

        {/* Rate limit indicator */}
        {remaining !== null && (
          <div style={{
            fontSize:     11,
            fontWeight:   600,
            color:        isRateLimited ? "#FC8181" : isLowOnQuestions ? "#F6AD55" : "rgba(255,255,255,0.6)",
            background:   "rgba(255,255,255,0.08)",
            padding:      "4px 10px",
            borderRadius: 20,
          }}>
            {isRateLimited ? "Daily limit reached" : `${remaining}/${limit} questions left`}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", scrollbarWidth: "thin" }}>

        {/* Welcome message */}
        {messages.length === 0 && (
          <div>
            <div style={{
              textAlign: "center", padding: "24px 0 20px",
              borderBottom: "1px solid #f0f0f0", marginBottom: 20,
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎓</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1c2b3a", marginBottom: 6 }}>
                Hello, {userName}! I'm your AI Finance Mentor.
              </h2>
              <p style={{ fontSize: 13, color: "#718096", lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>
                Ask me anything about personal finance, investing, trading, tax, or any financial concept.
                I'll explain with India-specific examples and cite my sources.
              </p>
            </div>

            {/* Quick questions */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>
                Try asking…
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {QUICK_QUESTIONS.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    style={{
                      padding: "9px 12px", textAlign: "left",
                      background: "#f8f9fa", border: "1px solid #e2e8f0",
                      borderRadius: 9, cursor: "pointer", fontSize: 12,
                      color: "#4a5568", fontFamily: "var(--font-ui,system-ui)",
                      lineHeight: 1.4,
                      transition: "all 0.15s",
                    }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map(msg => (
          <div key={msg.id} style={{
            display:   "flex",
            gap:       10,
            marginBottom: 16,
            flexDirection: msg.role === "user" ? "row-reverse" : "row",
          }}>
            {/* Avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              background: msg.role === "user"
                ? "linear-gradient(135deg, #185FA5, #0E6163)"
                : "linear-gradient(135deg, #0E6163, #1D9E75)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, marginTop: 2,
            }}>
              {msg.role === "user" ? "👤" : "🤖"}
            </div>

            {/* Bubble */}
            <div style={{ maxWidth: "78%", minWidth: 0 }}>
              {/* Intent badge for AI messages */}
              {msg.role === "assistant" && msg.intent && INTENT_LABELS[msg.intent] && (
                <div style={{
                  display:      "inline-block",
                  fontSize:     10, fontWeight: 700, padding: "2px 8px",
                  borderRadius: 10, marginBottom: 4,
                  background:   INTENT_LABELS[msg.intent].bg,
                  color:        INTENT_LABELS[msg.intent].color,
                }}>
                  {INTENT_LABELS[msg.intent].label}
                </div>
              )}

              <div style={{
                padding:      "10px 14px",
                background:   msg.role === "user" ? "#0E6163" : "#f8f9fa",
                color:        msg.role === "user" ? "#fff" : "#1c2b3a",
                borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                fontSize:     13,
                lineHeight:   1.7,
              }}>
                {msg.loading ? (
                  <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: "50%", background: "#a0aec0",
                        animation: `bounce 1.2s infinite ${i * 0.2}s`,
                      }} />
                    ))}
                  </div>
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: `<p style='margin:0 0 10px'>${formatMessage(msg.content)}</p>`
                    }}
                  />
                )}
              </div>

              {/* AI disclaimer for recommendation/trading content */}
              {msg.role === "assistant" && !msg.loading &&
                (msg.intent === "recommendation" || msg.content.includes("invest") || msg.content.includes("trade")) && (
                <AIDisclaimer />
              )}
            </div>
          </div>
        ))}

        {/* Error */}
        {error && (
          <div style={{
            padding: "10px 14px", background: "#FFF5F5", border: "1px solid #FEB2B2",
            borderRadius: 10, fontSize: 13, color: "#C53030", marginBottom: 12,
          }}>
            ⚠️ {error}
            <button onClick={() => setError("")} style={{ marginLeft: 8, color: "#C53030", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
              Dismiss
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding:    "12px 16px",
        borderTop:  "1px solid #e2e8f0",
        background: "#fff",
        flexShrink: 0,
      }}>
        {/* Rate limited */}
        {isRateLimited ? (
          <div style={{
            textAlign: "center", padding: "14px",
            background: "#FFF5F5", borderRadius: 12,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#C53030", marginBottom: 6 }}>
              Daily question limit reached
            </div>
            <div style={{ fontSize: 12, color: "#718096", marginBottom: 10 }}>
              {tier === "free" ? `Free plan: 5 questions/day. Upgrade for ${tier === "free" ? "50" : "200"} questions.` : "Resets at midnight IST"}
            </div>
            {tier === "free" && (
              <a href="/pricing" style={{
                display: "inline-block", padding: "8px 20px",
                background: "#0E6163", color: "#fff",
                borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none",
              }}>
                Upgrade to Pro →
              </a>
            )}
          </div>
        ) : (
          <div>
            {isLowOnQuestions && (
              <div style={{ fontSize: 11, color: "#D69E2E", marginBottom: 6, textAlign: "center" }}>
                ⚠️ {remaining} question{remaining !== 1 ? "s" : ""} remaining today
                {tier === "free" && " · "}
                {tier === "free" && <a href="/pricing" style={{ color: "#D69E2E" }}>Upgrade for more</a>}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about finance… (Enter to send, Shift+Enter for new line)"
                disabled={loading}
                rows={1}
                style={{
                  flex:       1,
                  resize:     "none",
                  padding:    "10px 14px",
                  border:     "1px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize:   14,
                  fontFamily: "var(--font-ui,system-ui)",
                  outline:    "none",
                  lineHeight: 1.5,
                  maxHeight:  100,
                  overflowY:  "auto",
                  color:      "#1c2b3a",
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{
                  width:        44,
                  height:       44,
                  borderRadius: 10,
                  background:   loading || !input.trim() ? "#EDF2F7" : "#0E6163",
                  border:       "none",
                  cursor:       loading || !input.trim() ? "not-allowed" : "pointer",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent: "center",
                  fontSize:     18,
                  flexShrink:   0,
                  transition:   "background 0.15s",
                }}
              >
                {loading ? (
                  <div style={{ width: 18, height: 18, border: "2px solid #a0aec0", borderTopColor: "#0E6163", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#fff" : "#a0aec0"} strokeWidth="2">
                    <path d="m22 2-7 20-4-9-9-4 20-7z"/>
                  </svg>
                )}
              </button>
            </div>

            <div style={{ fontSize: 10, color: "#a0aec0", marginTop: 6, textAlign: "center" }}>
              AI Mentor provides educational information only · Not financial advice
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
