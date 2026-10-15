"use client";

import { useState, useRef, useEffect, useMemo, type CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AIDisclaimer } from "@/components/ui/FinanceDisclaimer";

// ============================================================
// FinanceHub — Frontier-Grade AI Finance Mentor
// components/ai/AIMentor.tsx
// Full-viewport workspace · Persistent chat sessions · Voice dictation · Rich sources
// ============================================================

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  loading?: boolean;
  timestamp?: number;
};

type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
};

interface AIMentorProps {
  lessonContext?: { lessonTitle: string; trackName: string };
  initialQuestion?: string;
  compact?: boolean;
}

const INTENT_BADGES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  education: { label: "📚 Concept Explanation", color: "#1E40AF", bg: "#EFF6FF", border: "#BFDBFE" },
  calculation: { label: "🧮 Step-by-Step Maths", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  comparison: { label: "⚖️ Financial Comparison", color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE" },
  recommendation: { label: "💡 Educational Guidance", color: "#0F766E", bg: "#F0FDFA", border: "#99F6E4" },
  quiz: { label: "🎯 Practice Quiz", color: "#047857", bg: "#ECFDF5", border: "#A7F3D0" },
  clarification: { label: "🔍 Deep Dive", color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD" },
};

const DEFAULT_SESSIONS: ChatSession[] = [
  {
    id: "sample-1",
    title: "SIP vs mutual funds comparison",
    updatedAt: Date.now() - 2 * 60 * 60 * 1000,
    messages: [
      {
        id: "s1-q",
        role: "user",
        content: "What is the difference between a SIP and a mutual fund?",
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
      },
      {
        id: "s1-a",
        role: "assistant",
        content: "A **Mutual Fund** is the *investment vehicle* (a pooled basket of stocks, bonds, or gold managed by professional fund managers), while a **SIP (Systematic Investment Plan)** is a *method of investing* into that fund.\n\n### Key Differences:\n- **Mutual Fund**: The product you buy (e.g., Nifty 50 Index Fund).\n- **SIP**: An automated schedule where a fixed amount (e.g., ₹1,000) is deducted monthly to buy fund units.\n\n[Source: AMFI India / amfiindia.com]\n[Source: SEBI / sebi.gov.in]",
        intent: "comparison",
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: "sample-2",
    title: "Understanding credit score & CIBIL",
    updatedAt: Date.now() - 24 * 60 * 60 * 1000,
    messages: [],
  },
  {
    id: "sample-3",
    title: "Income tax slabs (Old vs New)",
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    messages: [],
  },
  {
    id: "sample-4",
    title: "How government bonds work in India",
    updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    messages: [],
  },
  {
    id: "sample-5",
    title: "ELSS vs PPF tax saving comparison",
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    messages: [],
  },
];

const STARTER_QUESTIONS = [
  {
    icon: "🌱",
    title: "Explain SIPs with an example",
    prompt: "Explain how Systematic Investment Plans (SIP) work in India with a simple ₹5,000 monthly example.",
  },
  {
    icon: "📈",
    title: "Compare ELSS and PPF",
    prompt: "Compare ELSS mutual funds and PPF under Section 80C in terms of returns, lock-in period, and tax.",
  },
  {
    icon: "🪙",
    title: "How does compound interest work?",
    prompt: "Show me how compound interest creates wealth over 15 years using an Indian rupee calculation.",
  },
  {
    icon: "💳",
    title: "What is a credit score?",
    prompt: "What is a CIBIL score in India, what is considered a good score, and how can I improve it?",
  },
];

const genId = () => Math.random().toString(36).slice(2, 9);

function formatTimestamp(ts?: number): string {
  if (!ts) return "Recently";
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function AIMentor({ lessonContext, initialQuestion, compact = false }: AIMentorProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialQuestion || "");
  const [searchHistory, setSearchHistory] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number>(5);
  const [tier, setTier] = useState("free");
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("Learner");
  const [userAvatar, setUserAvatar] = useState("U");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedModel, setSelectedModel] = useState("FinanceHub AI (Claude 3.5)");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize and load saved sessions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("financehub_chat_sessions");
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
          setMessages(parsed[0].messages);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to load stored chat sessions:", e);
    }

    // Default seed
    setSessions(DEFAULT_SESSIONS);
    setCurrentSessionId(DEFAULT_SESSIONS[0].id);
    setMessages(DEFAULT_SESSIONS[0].messages);
  }, []);

  // Save sessions to localStorage when updated
  const persistSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem("financehub_chat_sessions", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to persist chat sessions:", e);
    }
  };

  // Load user profile & rate limit
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select("full_name, subscription_tier, ai_questions_today, role")
          .eq("id", user.id)
          .single();

        if (data) {
          const profile = data as any;
          const name = profile.full_name?.split(" ")[0] || "Learner";
          setUserName(name);
          setUserAvatar(name.charAt(0).toUpperCase());
          const subTier = profile.subscription_tier || profile.role || "free";
          setTier(subTier);
          const limits: Record<string, number> = { free: 5, pro: 50, expert: 200 };
          const lim = limits[subTier] || 5;
          setLimit(lim);
          setRemaining(Math.max(0, lim - (profile.ai_questions_today || 0)));
        }
      } catch (err) {
        console.error("Error loading user profile in AIMentor:", err);
      }
    })();
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Handle New Chat
  const handleNewChat = () => {
    const newId = genId();
    const newSession: ChatSession = {
      id: newId,
      title: "New conversation",
      updatedAt: Date.now(),
      messages: [],
    };
    const updated = [newSession, ...sessions];
    persistSessions(updated);
    setCurrentSessionId(newId);
    setMessages([]);
    setInput("");
    setError("");
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  // Switch Conversation
  const switchSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setError("");
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  // Delete Conversation
  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    persistSessions(updated);
    if (currentSessionId === id) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
        setMessages(updated[0].messages);
      } else {
        handleNewChat();
      }
    }
  };

  // Send Message
  const sendMessage = async (overridePrompt?: string) => {
    const q = (overridePrompt || input).trim();
    if (!q || loading) return;

    setInput("");
    setError("");
    setLoading(true);

    const userMsg: Message = { id: genId(), role: "user", content: q, timestamp: Date.now() };
    const assistantMsg: Message = { id: genId(), role: "assistant", content: "", loading: true, timestamp: Date.now() };

    const nextMessages = [...messages, userMsg, assistantMsg];
    setMessages(nextMessages);

    // Update session title if first user question
    let sessionTitle = sessions.find((s) => s.id === currentSessionId)?.title || "New conversation";
    if (messages.length === 0) {
      sessionTitle = q.length > 36 ? `${q.slice(0, 36)}...` : q;
    }

    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, conversationHistory: history, lessonContext }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || "Unable to reach AI Mentor service. Please try again.";
        setError(errMsg);
        const rolledBack = nextMessages.filter((m) => m.id !== assistantMsg.id);
        setMessages(rolledBack);
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let detectedIntent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullContent += data.text;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: fullContent, loading: false } : m))
                );
              }
              if (data.done) {
                detectedIntent = data.intent || "";
                if (data.remaining !== undefined) setRemaining(data.remaining);
                if (data.tier) setTier(data.tier);
              }
            } catch {
              // Partial chunk continue
            }
          }
        }
      }

      // Finalize messages in session
      const finalized = nextMessages.map((m) =>
        m.id === assistantMsg.id ? { ...m, content: fullContent, loading: false, intent: detectedIntent } : m
      );
      setMessages(finalized);

      const updatedSessions = sessions.map((s) =>
        s.id === currentSessionId
          ? { ...s, title: sessionTitle, updatedAt: Date.now(), messages: finalized }
          : s
      );
      persistSessions(updatedSessions);
    } catch (err) {
      console.error("AI chat error:", err);
      setError("Network or connection error. Please verify your internet and try again.");
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  // Copy message text
  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Voice dictation using Web Speech API
  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice dictation is supported in modern browsers like Google Chrome, Microsoft Edge, and Safari.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  const filteredSessions = useMemo(() => {
    if (!searchHistory.trim()) return sessions;
    const term = searchHistory.toLowerCase();
    return sessions.filter((s) => s.title.toLowerCase().includes(term));
  }, [sessions, searchHistory]);

  const isEmpty = messages.length === 0;

  return (
    <div style={compact ? s.compactWrapper : s.workspaceRoot}>
      
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* LEFT CHAT SIDEBAR (Collapsible, ChatGPT/Claude Style)         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {!compact && (
        <>
          {sidebarOpen && (
            <div style={s.mobileBackdrop} onClick={() => setSidebarOpen(false)} />
          )}

          <aside style={{ ...s.sidebar, transform: sidebarOpen || (typeof window !== "undefined" && window.innerWidth >= 1024) ? "translateX(0)" : "translateX(-100%)" }}>
            
            {/* Top Sidebar Action: New Chat */}
            <div style={s.sidebarTop}>
              <div style={s.sidebarBrandRow}>
                <div style={s.brandLogoIcon}>🤖</div>
                <div style={{ minWidth: 0 }}>
                  <div style={s.brandTitle}>AI Finance Mentor</div>
                  <div style={s.brandSub}>Your India-aware tutor</div>
                </div>
              </div>

              <button type="button" onClick={handleNewChat} style={s.newChatBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                New Chat
              </button>

              {/* Search Conversations */}
              <div style={s.searchWrap}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" style={s.searchIcon}>
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  style={s.sidebarSearchInput}
                />
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div style={s.sidebarNavLinks}>
              <div style={s.activeNavPill}>
                <span style={{ marginRight: 8, fontSize: 14 }}>💬</span>
                AI Finance Mentor
              </div>
              <Link href="/explore" style={s.sidebarNavLink}>
                <span style={{ marginRight: 8, fontSize: 14 }}>💡</span>
                Explore Prompts &amp; Tracks
              </Link>
            </div>

            {/* Recent Conversations List */}
            <div style={s.historyContainer}>
              <div style={s.historyHeaderRow}>
                <span style={s.historyHeaderLabel}>RECENT CONVERSATIONS</span>
                {sessions.length > 0 && (
                  <span style={s.historyCountBadge}>{sessions.length}</span>
                )}
              </div>

              <div style={s.historyList}>
                {filteredSessions.length === 0 ? (
                  <div style={s.historyEmpty}>No conversations found.</div>
                ) : (
                  filteredSessions.map((session) => {
                    const isSelected = session.id === currentSessionId;
                    return (
                      <div
                        key={session.id}
                        onClick={() => switchSession(session)}
                        style={{
                          ...s.historyItem,
                          background: isSelected ? "#E6F3F3" : "transparent",
                          color: isSelected ? "#0F3D3E" : "#334155",
                          fontWeight: isSelected ? 600 : 500,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: isSelected ? 1 : 0.6 }}>
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span style={s.historyTitleText} title={session.title}>
                          {session.title}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => deleteSession(e, session.id)}
                          style={s.deleteSessionBtn}
                          title="Delete conversation"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Utilities */}
            <div style={s.sidebarBottom}>
              <Link href="/roadmap" style={s.bottomNavLink}>
                <span style={{ marginRight: 8 }}>🧭</span>
                Learning roadmap
              </Link>
              <Link href="/library" style={s.bottomNavLink}>
                <span style={{ marginRight: 8 }}>🔖</span>
                Saved resources &amp; library
              </Link>
              <Link href="/profile" style={s.bottomNavLink}>
                <span style={{ marginRight: 8 }}>⚙️</span>
                Settings
              </Link>

              {tier === "free" && (
                <div style={s.upgradeBanner}>
                  <div style={s.upgradeBadge}>PRO TIER</div>
                  <div style={s.upgradeTitle}>Unlimited AI Questions</div>
                  <p style={s.upgradeSub}>Get unlimited deep financial analysis and 24/7 mentor access.</p>
                  <Link href="/pricing" style={s.upgradeBtn}>
                    Upgrade for ₹499/mo →
                  </Link>
                </div>
              )}
            </div>

          </aside>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MAIN CONVERSATION WORKSPACE                                    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <main style={s.mainWorkspace}>
        
        {/* Workspace Top Bar */}
        <header style={s.workspaceHeader}>
          <div style={s.headerLeft}>
            {!compact && (
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                style={s.menuToggleBtn}
                aria-label="Toggle chat history"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            )}

            <div style={s.headerTitleGroup}>
              <div style={s.headerAvatar}>🤖</div>
              <div>
                <div style={s.headerTitleRow}>
                  <h1 style={s.headerTitle}>AI Finance Mentor</h1>
                  <span style={s.eduModePill} title="Configured for SEBI compliance and mathematical clarity">
                    <span style={s.pulseGreenDot} />
                    Educational mode
                    <span style={s.infoIcon}>ⓘ</span>
                  </span>
                </div>
                <div style={s.headerSubtext}>
                  {lessonContext ? `Context: ${lessonContext.lessonTitle}` : "Your India-aware learning companion"}
                </div>
              </div>
            </div>
          </div>

          <div style={s.headerRight}>
            {/* Model Selector Dropdown */}
            <div style={s.modelDropdownWrapper}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" style={{ marginRight: 6 }}>
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                style={s.modelSelect}
              >
                <option value="FinanceHub AI (Claude 3.5)">Model: FinanceHub AI (Claude 3.5)</option>
                <option value="FinanceHub Speed (Claude 3.5 Haiku)">Model: FinanceHub Speed</option>
              </select>
            </div>

            {/* Questions quota badge */}
            {remaining !== null && (
              <div
                style={{
                  ...s.quotaBadge,
                  background: remaining === 0 ? "#FEE2E2" : remaining <= 2 ? "#FEF3C7" : "#F1F5F9",
                  color: remaining === 0 ? "#DC2626" : remaining <= 2 ? "#D97706" : "#475569",
                  borderColor: remaining === 0 ? "#FECACA" : remaining <= 2 ? "#FDE68A" : "#CBD5E1",
                }}
              >
                {remaining === 0 ? "Daily limit reached" : `${remaining}/${limit} free left today`}
              </div>
            )}
          </div>
        </header>

        {/* Conversation Canvas */}
        <div style={s.chatScrollContainer}>
          
          {/* EMPTY STATE (Matching uploaded reference images 2 & 3) */}
          {isEmpty ? (
            <div style={s.emptyStateWrapper}>
              
              {/* Central Vector Illustration: Open Book + Radiating Growth Bars */}
              <div style={s.heroGraphicContainer}>
                <svg width="120" height="96" viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Glowing starburst rays */}
                  <line x1="60" y1="4" x2="60" y2="12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
                  <line x1="40" y1="12" x2="44" y2="18" stroke="#10B981" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                  <line x1="80" y1="12" x2="76" y2="18" stroke="#10B981" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                  
                  {/* Upward Growth Chart Bars */}
                  <rect x="46" y="24" width="6" height="20" rx="3" fill="#10B981" />
                  <rect x="57" y="16" width="6" height="28" rx="3" fill="#059669" />
                  <rect x="68" y="10" width="6" height="34" rx="3" fill="#047857" />
                  <path d="M49 20L60 12L71 6" stroke="#34D399" strokeWidth="2" strokeLinecap="round"/>

                  {/* Open Ledger / Book Pages */}
                  <path d="M16 66C28 62 44 60 60 66C76 60 92 62 104 66V82C92 78 76 76 60 82C44 76 28 78 16 82V66Z" fill="#F8FAFC" stroke="#0F3D3E" strokeWidth="2.5" strokeLinejoin="round"/>
                  <path d="M60 66V82" stroke="#0F3D3E" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M22 71C32 68 44 67 54 70" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M66 70C76 67 88 68 98 71" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M22 75C32 72 44 71 54 74" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M66 74C76 71 88 72 98 75" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Headline */}
              <h2 style={s.heroMainHeading}>
                Learn finance <span style={s.heroTealAccent}>with clarity.</span>
              </h2>
              <p style={s.heroSubHeading}>
                Ask a question, explore a concept, or turn a topic into a guided lesson.
              </p>
              <p style={s.heroDescription}>
                Get clear explanations, step-by-step examples, and India-specific insights from reliable sources.
              </p>

              {/* Three Capability Cards */}
              <div style={s.featuresRow}>
                <div style={{ ...s.featureCard, background: "#F0FDF4", borderColor: "#BBF7D0" }}>
                  <div style={s.featureHeader}>
                    <span style={{ ...s.featureIcon, color: "#16A34A" }}>📖</span>
                    <span style={s.featureTitle}>Explain simply</span>
                  </div>
                  <p style={s.featureText}>
                    Easy-to-understand explanations with real-life Indian examples.
                  </p>
                </div>

                <div style={{ ...s.featureCard, background: "#EFF6FF", borderColor: "#BFDBFE" }}>
                  <div style={s.featureHeader}>
                    <span style={{ ...s.featureIcon, color: "#2563EB" }}>🧮</span>
                    <span style={s.featureTitle}>Show the maths</span>
                  </div>
                  <p style={s.featureText}>
                    Step-by-step calculations, formulas and worked rupee examples.
                  </p>
                </div>

                <div style={{ ...s.featureCard, background: "#FAF5FF", borderColor: "#E9D5FF" }}>
                  <div style={s.featureHeader}>
                    <span style={{ ...s.featureIcon, color: "#7C3AED" }}>📑</span>
                    <span style={s.featureTitle}>Cite sources</span>
                  </div>
                  <p style={s.featureText}>
                    Information from official Indian regulators (RBI, SEBI, AMFI).
                  </p>
                </div>
              </div>

              {/* Starter Question Section */}
              <div style={s.starterSection}>
                <div style={s.starterSectionHeader}>TRY A STARTER QUESTION</div>
                <div style={s.starterGrid}>
                  {STARTER_QUESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendMessage(item.prompt)}
                      style={s.starterCard}
                    >
                      <span style={s.starterCardIcon}>{item.icon}</span>
                      <span style={s.starterCardTitle}>{item.title}</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={s.starterArrow}>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* ACTIVE CONVERSATION MESSAGES */
            <div style={s.messagesContainer}>
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    style={{
                      ...s.messageRow,
                      justifyContent: isUser ? "flex-end" : "flex-start",
                    }}
                  >
                    {!isUser && (
                      <div style={s.aiAvatarCircle}>🤖</div>
                    )}

                    <div style={{ ...s.bubbleWrapper, maxWidth: isUser ? "75%" : "88%" }}>
                      
                      {/* Intent Badge */}
                      {!isUser && msg.intent && INTENT_BADGES[msg.intent] && (
                        <div
                          style={{
                            ...s.intentBadge,
                            background: INTENT_BADGES[msg.intent].bg,
                            color: INTENT_BADGES[msg.intent].color,
                            borderColor: INTENT_BADGES[msg.intent].border,
                          }}
                        >
                          {INTENT_BADGES[msg.intent].label}
                        </div>
                      )}

                      {/* Bubble Content */}
                      <div
                        style={{
                          ...s.messageBubble,
                          background: isUser ? "#0F3D3E" : "#FFFFFF",
                          color: isUser ? "#FFFFFF" : "#0F172A",
                          borderColor: isUser ? "#0F3D3E" : "#E2E8F0",
                          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          boxShadow: isUser ? "0 2px 8px rgba(15, 61, 62, 0.2)" : "0 2px 8px rgba(0, 0, 0, 0.03)",
                        }}
                      >
                        {msg.loading ? (
                          <div style={s.typingDotsRow}>
                            <span style={{ ...s.bounceDot, animationDelay: "0ms" }} />
                            <span style={{ ...s.bounceDot, animationDelay: "150ms" }} />
                            <span style={{ ...s.bounceDot, animationDelay: "300ms" }} />
                          </div>
                        ) : (
                          <div
                            style={s.markdownText}
                            dangerouslySetInnerHTML={{
                              __html: formatMessageMarkdown(msg.content, isUser),
                            }}
                          />
                        )}
                      </div>

                      {/* Message Actions */}
                      {!isUser && !msg.loading && (
                        <div style={s.messageActionsRow}>
                          <button
                            type="button"
                            onClick={() => copyMessage(msg.content, msg.id)}
                            style={s.actionBtn}
                            title="Copy answer to clipboard"
                          >
                            {copiedId === msg.id ? (
                              <span style={{ color: "#10B981" }}>✓ Copied</span>
                            ) : (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                Copy
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setInput(`Could you give another example of that?`)}
                            style={s.actionBtn}
                          >
                            Give example
                          </button>

                          <span style={s.messageTime}>
                            {formatTimestamp(msg.timestamp)}
                          </span>
                        </div>
                      )}

                      {/* Safety Disclaimer for advisory topics */}
                      {!isUser && !msg.loading && (msg.intent === "recommendation" || msg.content.includes("invest") || msg.content.includes("tax")) && (
                        <div style={s.bubbleDisclaimer}>
                          <AIDisclaimer />
                        </div>
                      )}

                    </div>

                    {isUser && (
                      <div style={s.userAvatarCircle}>{userAvatar}</div>
                    )}
                  </div>
                );
              })}

              {/* Error banner */}
              {error && (
                <div style={s.errorBanner}>
                  <span>⚠️ {error}</span>
                  <button type="button" onClick={() => setError("")} style={s.dismissErrorBtn}>
                    ✕
                  </button>
                </div>
              )}

              <div ref={bottomRef} style={{ height: 16 }} />
            </div>
          )}

        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* FLOATING COMPOSER BAR (Modern Pill with Attach & Voice)      */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div style={s.composerSection}>
          <div style={s.composerShell}>
            
            {/* Hidden File Picker */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  alert(`File selected: ${e.target.files[0].name}. (Financial document analysis enabled)`);
                }
              }}
            />

            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={s.composerIconBtn}
              title="Attach financial statement or document"
              aria-label="Attach file"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>

            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask about a finance concept, calculation, or decision..."
              style={s.composerTextarea}
            />

            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleVoice}
              style={{
                ...s.composerIconBtn,
                color: isRecording ? "#DC2626" : "#64748B",
                background: isRecording ? "#FEE2E2" : "transparent",
              }}
              title={isRecording ? "Listening... click to stop" : "Voice dictation"}
              aria-label="Voice input"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                ...s.sendCircleBtn,
                background: input.trim() && !loading ? "#0F3D3E" : "#E2E8F0",
                color: input.trim() && !loading ? "#FFFFFF" : "#94A3B8",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              }}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>

          </div>

          <div style={s.composerDisclaimer}>
            ⓘ For education, not personalized investment, tax, or legal advice. All calculations are illustrative.
          </div>
        </div>

      </main>

    </div>
  );
}

// ─── Markdown & Source Formatting Helper ───────────────────────

function formatMessageMarkdown(text: string, isUser: boolean): string {
  if (!text) return "";

  if (isUser) {
    return text.replace(/\n/g, "<br/>");
  }

  return text
    // Headings
    .replace(/^### (.*$)/gim, "<h4 style='font-size:15px;font-weight:700;margin:12px 0 6px;color:#0F172A'>$1</h4>")
    .replace(/^## (.*$)/gim, "<h3 style='font-size:16px;font-weight:700;margin:14px 0 8px;color:#0F172A'>$1</h3>")
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, "<strong style='font-weight:700;color:#0F172A'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code / formulas
    .replace(/`([^`]+)`/g, "<code style='background:#F1F5F9;color:#0F3D3E;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em;border:1px solid #E2E8F0'>$1</code>")
    // Sources formatting (Clickable pill tags)
    .replace(/\[Source: ([^\]]+)\]/g, (match, p1) => {
      return `<span style='display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;color:#0F766E;background:#F0FDFA;border:1px solid #99F6E4;padding:2px 8px;border-radius:12px;margin:4px 4px 4px 0'>📑 Source: ${p1}</span>`;
    })
    // Bullet points
    .replace(/^\s*[-•]\s+(.*$)/gim, "<li style='margin-bottom:4px;list-style-type:disc;margin-left:20px'>$1</li>")
    // Paragraph breaks
    .replace(/\n\n/g, "</p><p style='margin:0 0 10px'>")
    .replace(/\n/g, "<br/>");
}

// ─── World-Class Design Tokens (ChatGPT / Claude Standard) ────

const s: Record<string, CSSProperties> = {
  workspaceRoot: {
    display: "flex",
    height: "calc(100vh - 54px)",
    background: "#FFFFFF",
    overflow: "hidden",
    position: "relative",
    fontFamily: "var(--font-ui, system-ui, -apple-system, sans-serif)",
  },
  compactWrapper: {
    display: "flex",
    flexDirection: "column",
    height: 520,
    background: "#FFFFFF",
    borderRadius: 14,
    border: "1px solid #E2E8F0",
    overflow: "hidden",
  },
  mobileBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 95,
  },

  /* SIDEBAR STYLES */
  sidebar: {
    width: 270,
    background: "#F8FAFC",
    borderRight: "1px solid #E2E8F0",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    zIndex: 100,
    transition: "transform 0.25s ease",
  },
  sidebarTop: {
    padding: "16px 14px 12px",
    borderBottom: "1px solid #E2E8F0",
  },
  sidebarBrandRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  brandLogoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "linear-gradient(135deg, #0F3D3E 0%, #10B981 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    color: "#FFFFFF",
  },
  brandTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    color: "#0F172A",
    lineHeight: 1.2,
  },
  brandSub: {
    fontSize: 11,
    color: "#64748B",
  },
  newChatBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "9px 14px",
    borderRadius: 9999,
    background: "#0F3D3E",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(15, 61, 62, 0.2)",
    transition: "background 0.15s ease",
    marginBottom: 10,
  },
  searchWrap: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  sidebarSearchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "7px 10px 7px 30px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    fontSize: 12,
    color: "#0F172A",
    outline: "none",
  },
  sidebarNavLinks: {
    padding: "8px 10px",
    borderBottom: "1px solid #E2E8F0",
  },
  activeNavPill: {
    display: "flex",
    alignItems: "center",
    padding: "7px 10px",
    borderRadius: 8,
    background: "#E6F3F3",
    color: "#0F3D3E",
    fontSize: 12.5,
    fontWeight: 700,
    marginBottom: 4,
  },
  sidebarNavLink: {
    display: "flex",
    alignItems: "center",
    padding: "7px 10px",
    borderRadius: 8,
    color: "#475569",
    fontSize: 12.5,
    fontWeight: 500,
    textDecoration: "none",
    transition: "background 0.15s",
  },
  historyContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 10px",
  },
  historyHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 6px 8px",
  },
  historyHeaderLabel: {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: "0.06em",
    color: "#94A3B8",
  },
  historyCountBadge: {
    fontSize: 10,
    fontWeight: 700,
    background: "#E2E8F0",
    color: "#475569",
    padding: "1px 6px",
    borderRadius: 9999,
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  historyEmpty: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    padding: "24px 8px",
  },
  historyItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 8px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12.5,
    transition: "background 0.15s ease",
  },
  historyTitleText: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  deleteSessionBtn: {
    background: "none",
    border: "none",
    color: "#94A3B8",
    fontSize: 11,
    cursor: "pointer",
    padding: 2,
    opacity: 0.6,
  },
  sidebarBottom: {
    padding: "12px 10px 16px",
    borderTop: "1px solid #E2E8F0",
    background: "#F8FAFC",
  },
  bottomNavLink: {
    display: "flex",
    alignItems: "center",
    padding: "6px 8px",
    color: "#475569",
    fontSize: 12,
    textDecoration: "none",
    fontWeight: 500,
    borderRadius: 6,
  },
  upgradeBanner: {
    marginTop: 10,
    padding: "12px",
    borderRadius: 10,
    background: "linear-gradient(135deg, #0A1628 0%, #0F3D3E 100%)",
    color: "#FFFFFF",
  },
  upgradeBadge: {
    display: "inline-block",
    fontSize: 9,
    fontWeight: 800,
    background: "#10B981",
    color: "#FFFFFF",
    padding: "1px 5px",
    borderRadius: 4,
    marginBottom: 4,
  },
  upgradeTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 2,
  },
  upgradeSub: {
    fontSize: 10.5,
    color: "rgba(255,255,255,0.75)",
    margin: "0 0 8px",
    lineHeight: 1.4,
  },
  upgradeBtn: {
    display: "block",
    textAlign: "center",
    padding: "5px 8px",
    borderRadius: 6,
    background: "#10B981",
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: 700,
    textDecoration: "none",
  },

  /* MAIN WORKSPACE STYLES */
  mainWorkspace: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    background: "#FFFFFF",
    position: "relative",
  },
  workspaceHeader: {
    height: 58,
    borderBottom: "1px solid #E2E8F0",
    padding: "0 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#FFFFFF",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  menuToggleBtn: {
    background: "none",
    border: "none",
    color: "#334155",
    cursor: "pointer",
    padding: 6,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
  },
  headerTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "linear-gradient(135deg, #0F3D3E 0%, #10B981 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 17,
  },
  headerTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0F172A",
    margin: 0,
  },
  eduModePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "2px 8px",
    borderRadius: 9999,
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    color: "#065F46",
    fontSize: 11,
    fontWeight: 600,
  },
  pulseGreenDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#10B981",
  },
  infoIcon: {
    fontSize: 11,
    color: "#059669",
    marginLeft: 2,
  },
  headerSubtext: {
    fontSize: 11.5,
    color: "#64748B",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  modelDropdownWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#F8FAFC",
    border: "1px solid #CBD5E1",
    borderRadius: 8,
    padding: "3px 8px",
  },
  modelSelect: {
    border: "none",
    background: "transparent",
    fontSize: 12,
    color: "#334155",
    fontWeight: 600,
    outline: "none",
    cursor: "pointer",
  },
  quotaBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 9px",
    borderRadius: 9999,
    border: "1px solid",
  },

  /* CHAT SCROLL AREA */
  chatScrollContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 24px 140px",
  },

  /* EMPTY STATE (HERO GRAPHIC + CARDS) */
  emptyStateWrapper: {
    maxWidth: 820,
    margin: "0 auto",
    textAlign: "center",
    padding: "24px 0 16px",
  },
  heroGraphicContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroMainHeading: {
    fontSize: "clamp(1.75rem, 3vw, 2.35rem)",
    fontWeight: 800,
    color: "#0F172A",
    margin: "0 0 8px",
    letterSpacing: "-0.03em",
  },
  heroTealAccent: {
    color: "#0F3D3E",
  },
  heroSubHeading: {
    fontSize: 15.5,
    color: "#334155",
    fontWeight: 600,
    margin: "0 0 6px",
  },
  heroDescription: {
    fontSize: 13.5,
    color: "#64748B",
    maxWidth: 620,
    margin: "0 auto 28px",
    lineHeight: 1.6,
  },

  /* 3 CAPABILITY CARDS */
  featuresRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginBottom: 32,
    textAlign: "left",
  },
  featureCard: {
    padding: "16px 18px",
    borderRadius: 14,
    border: "1px solid",
  },
  featureHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  featureIcon: {
    fontSize: 16,
  },
  featureTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    color: "#0F172A",
  },
  featureText: {
    fontSize: 12,
    color: "#475569",
    margin: 0,
    lineHeight: 1.5,
  },

  /* STARTER QUESTIONS */
  starterSection: {
    textAlign: "left",
  },
  starterSectionHeader: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.08em",
    color: "#94A3B8",
    marginBottom: 12,
  },
  starterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 10,
  },
  starterCard: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    background: "#FFFFFF",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
  },
  starterCardIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  starterCardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1E293B",
    flex: 1,
  },
  starterArrow: {
    flexShrink: 0,
    marginLeft: 8,
  },

  /* ACTIVE MESSAGES */
  messagesContainer: {
    maxWidth: 820,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  messageRow: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  aiAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "linear-gradient(135deg, #0F3D3E 0%, #10B981 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    flexShrink: 0,
    marginTop: 2,
  },
  userAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#0F3D3E",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 2,
  },
  bubbleWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  intentBadge: {
    display: "inline-block",
    alignSelf: "flex-start",
    fontSize: 10.5,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 9999,
    border: "1px solid",
    marginBottom: 6,
  },
  messageBubble: {
    padding: "14px 18px",
    border: "1px solid",
    fontSize: 14,
    lineHeight: 1.65,
  },
  markdownText: {
    wordBreak: "break-word",
  },
  messageActionsRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
    paddingLeft: 4,
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: "none",
    border: "none",
    color: "#64748B",
    fontSize: 11.5,
    fontWeight: 600,
    cursor: "pointer",
    padding: 2,
  },
  messageTime: {
    fontSize: 11,
    color: "#94A3B8",
    marginLeft: "auto",
  },
  bubbleDisclaimer: {
    marginTop: 8,
  },
  typingDotsRow: {
    display: "flex",
    gap: 5,
    alignItems: "center",
    padding: "6px 4px",
  },
  bounceDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#0F3D3E",
    display: "inline-block",
    opacity: 0.6,
  },
  errorBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: 10,
    color: "#DC2626",
    fontSize: 13,
  },
  dismissErrorBtn: {
    background: "none",
    border: "none",
    color: "#DC2626",
    fontSize: 14,
    cursor: "pointer",
  },

  /* FLOATING COMPOSER SECTION */
  composerSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(to top, #FFFFFF 75%, rgba(255,255,255,0) 100%)",
    padding: "16px 24px 14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    pointerEvents: "auto",
  },
  composerShell: {
    width: "100%",
    maxWidth: 820,
    background: "#FFFFFF",
    borderRadius: 24,
    border: "1px solid #CBD5E1",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
    display: "flex",
    alignItems: "center",
    padding: "6px 10px 6px 14px",
    gap: 8,
  },
  composerIconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 6,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s ease",
  },
  composerTextarea: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    color: "#0F172A",
    resize: "none",
    maxHeight: 180,
    lineHeight: 1.45,
    fontFamily: "inherit",
    padding: "6px 4px",
  },
  sendCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.15s ease",
  },
  composerDisclaimer: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
  },
};
