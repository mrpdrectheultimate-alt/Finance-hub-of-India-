"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { supabase } from "@/lib/supabase";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiDoubtBoxProps {
  lessonTitle: string;
  lessonContent: string;
  userRole: "free" | "pro" | "expert";
  onClose: () => void;
}

const FREE_LIMIT = 5;

export default function AiDoubtBox({ lessonTitle, lessonContent, userRole, onClose }: AiDoubtBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your AI finance tutor. I know this lesson on **${lessonTitle}** inside out. Ask me anything - I'll explain it clearly at your level.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, error]);

  useEffect(() => {
    if (userRole !== "free") return;

    const loadUsage = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: usageCount } = await supabase.rpc("get_ai_usage_today" as never, { p_user_id: user.id } as never);
      setQuestionsUsed(typeof usageCount === "number" ? usageCount : 0);
    };

    void loadUsage();
  }, [userRole]);

  const isLimited = userRole === "free" && questionsUsed >= FREE_LIMIT;

  const handleSend = async () => {
    if (!input.trim() || loading || isLimited) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Please log in to use the AI tutor.");
        return;
      }

      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
          lessonTitle,
          lessonContent: lessonContent.slice(0, 2000),
          userRole,
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Failed to get response");

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: data.reply || "I could not generate a response this time." },
      ]);
      setQuestionsUsed((value) => value + 1);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    `Explain ${lessonTitle} in simple terms`,
    "Give me a real-world example",
    "What is the most common mistake people make here?",
    "How does this connect to investing?",
  ];

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.aiAvatar}>AI</div>
          <div>
            <div style={s.headerTitle}>AI Finance Tutor</div>
            <div style={s.headerSub}>Knows this lesson - always available</div>
          </div>
        </div>
        <button onClick={onClose} style={s.closeBtn} type="button">
          x
        </button>
      </div>

      {userRole === "free" ? (
        <div style={s.usageBar}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={s.usageLabel}>Free questions</span>
            <span style={s.usageCount}>
              {questionsUsed} / {FREE_LIMIT}
            </span>
          </div>
          <div style={s.usageTrack}>
            <div style={{ ...s.usageFill, width: `${(questionsUsed / FREE_LIMIT) * 100}%` }} />
          </div>
          {isLimited ? (
            <div style={s.limitMsg}>
              Upgrade to Pro for unlimited AI tutor access.{" "}
              <a href="/pricing" style={s.upgradeLink}>
                Upgrade -&gt;
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={s.messages}>
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} style={{ ...s.msgRow, justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}>
            {message.role === "assistant" ? <div style={s.aiBubbleAvatar}>AI</div> : null}
            <div style={{ ...s.bubble, ...(message.role === "user" ? s.userBubble : s.aiBubble) }}>
              <FormattedMessage content={message.content} />
            </div>
          </div>
        ))}

        {loading ? (
          <div style={{ ...s.msgRow, justifyContent: "flex-start" }}>
            <div style={s.aiBubbleAvatar}>AI</div>
            <div style={{ ...s.bubble, ...s.aiBubble }}>
              <div style={s.typing}>
                <span style={s.typingDot} />
                <span style={s.typingDot} />
                <span style={s.typingDot} />
              </div>
            </div>
          </div>
        ) : null}

        {error ? <div style={s.errorMsg}>{error}</div> : null}

        <div ref={bottomRef} />
      </div>

      {messages.length === 1 ? (
        <div style={s.suggestions}>
          <div style={s.suggestionsLabel}>Try asking:</div>
          {suggestedQuestions.map((question) => (
            <button key={question} onClick={() => setInput(question)} style={s.suggestionBtn} type="button">
              {question}
            </button>
          ))}
        </div>
      ) : null}

      <div style={s.inputArea}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLimited ? "Upgrade to ask more questions" : "Ask anything about this lesson..."}
          disabled={isLimited || loading}
          rows={2}
          style={{ ...s.textarea, opacity: isLimited ? 0.5 : 1 }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading || isLimited}
          style={{ ...s.sendBtn, opacity: !input.trim() || loading || isLimited ? 0.4 : 1 }}
          type="button"
        >
          ^
        </button>
      </div>
      <div style={s.disclaimer}>Educational only - not financial advice</div>
    </div>
  );
}

function FormattedMessage({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return (
    <p style={{ margin: 0, lineHeight: 1.6, fontSize: 14 }}>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}

const s: Record<string, React.CSSProperties> = {
  panel: { display: "flex", flexDirection: "column", height: "100%", background: "#fff", fontFamily: "system-ui, -apple-system, sans-serif" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "0.5px solid #eee", flexShrink: 0 },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  aiAvatar: { width: 36, height: 36, borderRadius: 10, background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 },
  headerTitle: { fontWeight: 600, fontSize: 14, color: "#0a0a0a" },
  headerSub: { fontSize: 11, color: "#aaa", marginTop: 1 },
  closeBtn: { fontSize: 15, color: "#aaa", background: "none", border: "none", cursor: "pointer", padding: 4 },
  usageBar: { padding: "10px 16px", background: "#fafafa", borderBottom: "0.5px solid #eee", flexShrink: 0 },
  usageLabel: { fontSize: 11, color: "#888" },
  usageCount: { fontSize: 11, fontWeight: 600, color: "#333" },
  usageTrack: { height: 3, background: "#eee", borderRadius: 2, overflow: "hidden" },
  usageFill: { height: "100%", background: "#1D9E75", borderRadius: 2, transition: "width .3s" },
  limitMsg: { fontSize: 11, color: "#B91C1C", marginTop: 6 },
  upgradeLink: { color: "#1D9E75", fontWeight: 600 },
  messages: { flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 8 },
  aiBubbleAvatar: { width: 24, height: 24, borderRadius: 8, background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0, marginBottom: 2 },
  bubble: { maxWidth: "85%", padding: "10px 13px", borderRadius: 12, lineHeight: 1.6 },
  aiBubble: { background: "#F5F5F3", color: "#222", borderBottomLeftRadius: 4 },
  userBubble: { background: "#1D9E75", color: "#fff", borderBottomRightRadius: 4 },
  typing: { display: "flex", gap: 4, alignItems: "center", padding: "2px 0" },
  typingDot: { width: 6, height: 6, borderRadius: "50%", background: "#aaa" },
  errorMsg: { fontSize: 12, color: "#B91C1C", background: "#FEF2F2", padding: "8px 12px", borderRadius: 8, textAlign: "center" },
  suggestions: { padding: "8px 16px 0", flexShrink: 0 },
  suggestionsLabel: { fontSize: 11, color: "#aaa", marginBottom: 6 },
  suggestionBtn: { display: "block", width: "100%", textAlign: "left", padding: "7px 10px", fontSize: 12, color: "#555", background: "#fafafa", border: "0.5px solid #eee", borderRadius: 8, cursor: "pointer", marginBottom: 5, fontFamily: "system-ui" },
  inputArea: { display: "flex", gap: 8, padding: "10px 12px", borderTop: "0.5px solid #eee", flexShrink: 0, alignItems: "flex-end" },
  textarea: { flex: 1, padding: "9px 12px", fontSize: 13, border: "0.5px solid #e0e0e0", borderRadius: 10, resize: "none", fontFamily: "system-ui", outline: "none", lineHeight: 1.5, color: "#333" },
  sendBtn: { width: 36, height: 36, borderRadius: "50%", background: "#1D9E75", color: "#fff", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "opacity .2s" },
  disclaimer: { fontSize: 10, color: "#ccc", textAlign: "center", padding: "4px 0 8px", flexShrink: 0 },
};
