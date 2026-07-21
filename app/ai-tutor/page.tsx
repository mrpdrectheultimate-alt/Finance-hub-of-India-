"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "What is the 50/30/20 budgeting rule?",
  "How does compound interest work in simple terms?",
  "What is the difference between a mutual fund and an ETF?",
  "Explain what a P/E ratio means",
  "How do I start investing with INR 5,000 per month?",
  "What is DeFi and how is it different from traditional banking?",
  "What is a cap table and why does it matter for founders?",
  "Explain options trading in simple terms",
];

const PERSONAS = [
  { id: "student", label: "School student", icon: "ST", desc: "Simple analogies, no jargon" },
  { id: "professional", label: "Working adult", icon: "PR", desc: "Practical, India-focused" },
  { id: "trader", label: "Trader", icon: "TR", desc: "Technical, markets-focused" },
  { id: "founder", label: "Founder", icon: "FO", desc: "Business and startup lens" },
];

const FREE_LIMIT = 5;

export default function AiTutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState("professional");
  const [userRole, setUserRole] = useState("free");
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    void loadUser();
    setMessages([
      {
        role: "assistant",
        content:
          "Hi! I'm your AI finance tutor. Ask me anything about personal finance, investing, trading, crypto, corporate finance, or business. I'll explain it clearly, with no jargon unless you want it.",
      },
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    setUserRole(profile?.role || "free");

    const { data: usageCount } = await supabase.rpc("get_ai_usage_today" as never, { p_user_id: user.id } as never);
    setQuestionsUsed(typeof usageCount === "number" ? usageCount : 0);
  };

  const isLimited = userRole === "free" && questionsUsed >= FREE_LIMIT;

  const send = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || loading || isLimited) return;

    const userMessage: Message = { role: "user", content: question };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          messages: nextMessages,
          lessonTitle: "General finance Q&A",
          lessonContent: `Tutor persona: ${persona}`,
          userRole,
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Sorry, something went wrong. Please try again.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.reply || "Sorry, something went wrong. Please try again.",
        },
      ]);
      setQuestionsUsed((value) => value + 1);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: error instanceof Error ? error.message : "Something went wrong. Please try again." },
      ]);
    }

    setLoading(false);
  };

  const handleKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Chat cleared. Ask me anything about finance!" }]);
  };

  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => (part.startsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part));
  };

  return (
    <div style={s.page}>
      <aside style={s.aside}>
        <div style={s.asideHeader}>
          <Link href="/dashboard" style={s.back}>
            Dashboard
          </Link>
          <div style={s.asideLogo}>
            <div style={s.logoMark}>AI</div>
            <div>
              <div style={s.logoTitle}>AI Finance Tutor</div>
              <div style={s.logoSub}>FinanceHub powered assistant</div>
            </div>
          </div>
        </div>

        <div style={s.asideSection}>
          <div style={s.asideSectionTitle}>Explain to me as a</div>
          {PERSONAS.map((item) => (
            <button
              key={item.id}
              onClick={() => setPersona(item.id)}
              style={{ ...s.personaBtn, ...(persona === item.id ? s.personaBtnActive : {}) }}
              type="button"
            >
              <span style={s.personaIcon}>{item.icon}</span>
              <div style={s.personaInfo}>
                <div style={s.personaLabel}>{item.label}</div>
                <div style={s.personaDesc}>{item.desc}</div>
              </div>
              {persona === item.id ? <span style={s.personaCheck}>Selected</span> : null}
            </button>
          ))}
        </div>

        {userRole === "free" ? (
          <div style={s.asideSection}>
            <div style={s.asideSectionTitle}>Free questions today</div>
            <div style={s.usageBar}>
              <div style={{ ...s.usageFill, width: `${(questionsUsed / FREE_LIMIT) * 100}%` }} />
            </div>
            <div style={s.usageText}>
              {questionsUsed} / {FREE_LIMIT} used
            </div>
            {isLimited ? (
              <Link href="/pricing" style={s.upgradeBtn}>
                Upgrade for unlimited
              </Link>
            ) : null}
          </div>
        ) : null}

        <div style={s.asideSection}>
          <div style={s.asideSectionTitle}>Try asking</div>
          {SUGGESTED.slice(0, 5).map((question) => (
            <button
              key={question}
              onClick={() => send(question)}
              disabled={isLimited}
              style={{ ...s.suggestBtn, opacity: isLimited ? 0.4 : 1 }}
              type="button"
            >
              {question}
            </button>
          ))}
        </div>

        <div style={s.disclaimer}>
          Educational only. Not financial advice. Consult a certified financial advisor for personal decisions.
        </div>
      </aside>

      <main style={s.main}>
        <div style={s.chatHeader}>
          <div style={s.chatTitle}>Finance Q&A</div>
          <button onClick={clearChat} style={s.clearBtn} type="button">
            Clear chat
          </button>
        </div>

        <div style={s.messages}>
          {messages.map((message, index) => (
            <div key={index} style={{ ...s.msgRow, justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}>
              {message.role === "assistant" ? <div style={s.botAvatar}>AI</div> : null}
              <div style={{ ...s.bubble, ...(message.role === "user" ? s.userBubble : s.botBubble) }}>
                {message.content.split("\n").map((line, lineIndex) => (
                  <p key={lineIndex} style={{ margin: lineIndex === 0 ? 0 : "8px 0 0", lineHeight: 1.65, fontSize: 14 }}>
                    {parseBold(line)}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {loading ? (
            <div style={{ ...s.msgRow, justifyContent: "flex-start" }}>
              <div style={s.botAvatar}>AI</div>
              <div style={{ ...s.bubble, ...s.botBubble }}>
                <div style={s.typingRow}>
                  {[0, 1, 2].map((item) => (
                    <div key={item} style={{ ...s.typingDot, animationDelay: `${item * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {isLimited ? (
            <div style={s.limitBanner}>
              <span>You have used your 5 free questions today.</span>
              <Link href="/pricing" style={s.limitLink}>
                Upgrade to Pro
              </Link>
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>

        <div style={s.inputWrap}>
          <div style={s.inputRow}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKey}
              rows={2}
              placeholder={isLimited ? "Upgrade to ask more questions" : "Ask anything about finance..."}
              disabled={isLimited || loading}
              style={{ ...s.textarea, opacity: isLimited ? 0.5 : 1 }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading || isLimited}
              style={{ ...s.sendBtn, opacity: !input.trim() || loading || isLimited ? 0.4 : 1 }}
              type="button"
            >
              Send
            </button>
          </div>
          <div style={s.inputMeta}>
            Press Enter to send. Shift+Enter for a new line.
            <span style={{ color: "#1D9E75" }}> {PERSONAS.find((item) => item.id === persona)?.label} mode</span>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { display: "flex", height: "100vh", background: "#fafafa", fontFamily: "system-ui,-apple-system,sans-serif", overflow: "hidden" },
  aside: { width: 280, background: "#fff", borderRight: "0.5px solid #e5e5e5", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 },
  asideHeader: { padding: "20px 18px 16px", borderBottom: "0.5px solid #eee" },
  back: { fontSize: 12, color: "#888", textDecoration: "none", display: "block", marginBottom: 14 },
  asideLogo: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: { width: 36, height: 36, borderRadius: 9, background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 },
  logoTitle: { fontWeight: 700, fontSize: 14, color: "#0a0a0a" },
  logoSub: { fontSize: 10, color: "#aaa", marginTop: 1 },
  asideSection: { padding: "16px 18px", borderBottom: "0.5px solid #f0f0f0" },
  asideSectionTitle: { fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 },
  personaBtn: { display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 10px", border: "0.5px solid #eee", borderRadius: 9, background: "#fff", cursor: "pointer", marginBottom: 5, textAlign: "left", fontFamily: "system-ui", transition: "all .15s" },
  personaBtnActive: { border: "1.5px solid #1D9E75", background: "#F0FAF6" },
  personaIcon: { width: 24, fontSize: 11, fontWeight: 800, color: "#1D9E75", flexShrink: 0 },
  personaInfo: { flex: 1 },
  personaLabel: { fontSize: 12, fontWeight: 600, color: "#0a0a0a" },
  personaDesc: { fontSize: 10, color: "#aaa", marginTop: 1 },
  personaCheck: { fontSize: 10, color: "#1D9E75", fontWeight: 700 },
  usageBar: { height: 4, background: "#eee", borderRadius: 2, overflow: "hidden", marginBottom: 5 },
  usageFill: { height: "100%", background: "#1D9E75", borderRadius: 2, transition: "width .3s" },
  usageText: { fontSize: 11, color: "#888" },
  upgradeBtn: { display: "block", fontSize: 12, color: "#1D9E75", fontWeight: 600, textDecoration: "none", marginTop: 8 },
  suggestBtn: { display: "block", width: "100%", textAlign: "left", padding: "7px 10px", fontSize: 12, color: "#555", background: "#fafafa", border: "0.5px solid #eee", borderRadius: 7, cursor: "pointer", marginBottom: 5, fontFamily: "system-ui", lineHeight: 1.4 },
  disclaimer: { padding: "14px 18px", fontSize: 10, color: "#999", lineHeight: 1.6, marginTop: "auto" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  chatHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: "0.5px solid #eee", background: "#fff", flexShrink: 0 },
  chatTitle: { fontWeight: 600, fontSize: 15, color: "#0a0a0a" },
  clearBtn: { fontSize: 12, color: "#aaa", background: "none", border: "none", cursor: "pointer", fontFamily: "system-ui" },
  messages: { flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 8 },
  botAvatar: { width: 28, height: 28, borderRadius: 8, background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 },
  bubble: { maxWidth: "78%", padding: "11px 14px", borderRadius: 14, lineHeight: 1.65 },
  botBubble: { background: "#F5F5F3", color: "#222", borderBottomLeftRadius: 4 },
  userBubble: { background: "#1D9E75", color: "#fff", borderBottomRightRadius: 4 },
  typingRow: { display: "flex", gap: 5, alignItems: "center" },
  typingDot: { width: 7, height: 7, borderRadius: "50%", background: "#aaa", animation: "bounce 1s infinite" },
  limitBanner: { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#B91C1C", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  limitLink: { color: "#1D9E75", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", fontSize: 12 },
  inputWrap: { padding: "14px 22px", borderTop: "0.5px solid #eee", background: "#fff", flexShrink: 0 },
  inputRow: { display: "flex", gap: 8, alignItems: "flex-end" },
  textarea: { flex: 1, padding: "10px 14px", fontSize: 14, border: "0.5px solid #e0e0e0", borderRadius: 12, resize: "none", fontFamily: "system-ui", outline: "none", lineHeight: 1.5, color: "#333" },
  sendBtn: { minWidth: 56, height: 38, borderRadius: 999, background: "#1D9E75", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "opacity .2s" },
  inputMeta: { fontSize: 10, color: "#aaa", marginTop: 6, textAlign: "center" },
};
