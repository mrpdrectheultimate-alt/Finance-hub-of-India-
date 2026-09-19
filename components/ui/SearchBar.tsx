"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ============================================================
// FinanceHub — Global SearchBar Component
// Keyboard shortcut: Ctrl+K / Cmd+K
// Floating modal with grouped results
// components/ui/SearchBar.tsx
// ============================================================

type SearchResult = {
  type: "lesson" | "video" | "book" | "simulator";
  id?: string;
  title: string;
  url: string;
  meta: string;
  icon: string;
  color?: string;
};

type SearchResults = {
  lessons: SearchResult[];
  videos: SearchResult[];
  books: SearchResult[];
  simulators: SearchResult[];
  total: number;
  query: string;
};

const TYPE_LABELS: Record<string, string> = {
  lessons: "Lessons",
  videos: "Videos",
  books: "Books",
  simulators: "Simulators",
};

export default function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults(null);
      setActive(-1);
    }
  }, [open]);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`);
      const data = await res.json();
      setResults(data);
      setActive(-1);
    } catch {
      /* silent fail */
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 250);
  };

  // All flat results for keyboard navigation
  const allResults: SearchResult[] = results
    ? [
        ...(results.lessons || []),
        ...(results.videos || []),
        ...(results.books || []),
        ...(results.simulators || []),
      ]
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!allResults.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, allResults.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    }
    if (e.key === "Enter" && active >= 0) {
      navigate(allResults[active].url);
    }
  };

  const navigate = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 14px",
          background: "var(--bg-surface, #f5f5f3)",
          border: "1px solid var(--border, #e2ddd5)",
          borderRadius: 9,
          cursor: "pointer",
          fontFamily: "var(--font-ui, system-ui)",
          color: "var(--text-muted, #718096)",
          fontSize: 13,
          transition: "all 0.15s",
        }}
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        Search
        <kbd
          style={{
            fontSize: 10,
            padding: "1px 5px",
            background: "var(--bg-card, #fff)",
            border: "1px solid var(--border, #e2ddd5)",
            borderRadius: 4,
            color: "var(--text-muted, #718096)",
          }}
        >
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          animation: "fade-in-fast 0.15s ease-out",
        }}
      />

      {/* Search modal */}
      <div
        style={{
          position: "fixed",
          top: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "92%",
          maxWidth: 620,
          background: "var(--bg-card, #fff)",
          borderRadius: 16,
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          border: "1px solid var(--border, #e2ddd5)",
          zIndex: 1001,
          overflow: "hidden",
          animation: "scale-in 0.2s ease-out",
          fontFamily: "var(--font-ui, system-ui)",
        }}
      >
        {/* Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            borderBottom: results ? "1px solid var(--border, #e2ddd5)" : "none",
          }}
        >
          {loading ? (
            <div
              style={{
                width: 18,
                height: 18,
                border: "2px solid #ddd",
                borderTopColor: "var(--accent, #0e6163)",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                flexShrink: 0,
              }}
            />
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a0aec0"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search lessons, videos, books, simulators…"
            style={{
              flex: 1,
              fontSize: 16,
              color: "var(--text-primary, #1c2b3a)",
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "var(--font-ui, system-ui)",
            }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults(null);
                inputRef.current?.focus();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#a0aec0",
                fontSize: 18,
                padding: 0,
                flexShrink: 0,
              }}
              type="button"
            >
              ✕
            </button>
          )}
          <kbd
            onClick={() => setOpen(false)}
            style={{
              fontSize: 11,
              padding: "2px 6px",
              background: "var(--bg-surface,#f5f5f3)",
              border: "1px solid var(--border,#e2ddd5)",
              borderRadius: 4,
              color: "#718096",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        {results && query.length >= 2 && (
          <div style={{ maxHeight: 440, overflowY: "auto", scrollbarWidth: "thin" }}>
            {results.total === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center", color: "#718096" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>No results for &quot;{query}&quot;</div>
                <div style={{ fontSize: 13 }}>Try different keywords or browse by track</div>
              </div>
            ) : (
              Object.entries({
                lessons: results.lessons || [],
                videos: results.videos || [],
                books: results.books || [],
                simulators: results.simulators || [],
              })
                .filter(([, items]) => items.length > 0)
                .map(([type, items]) => {
                  let globalIdx = 0;
                  if (type === "videos") globalIdx = (results.lessons || []).length;
                  if (type === "books")
                    globalIdx = (results.lessons || []).length + (results.videos || []).length;
                  if (type === "simulators")
                    globalIdx =
                      (results.lessons || []).length +
                      (results.videos || []).length +
                      (results.books || []).length;

                  return (
                    <div key={type}>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#a0aec0",
                          textTransform: "uppercase",
                          letterSpacing: ".08em",
                          padding: "10px 18px 4px",
                        }}
                      >
                        {TYPE_LABELS[type]} ({items.length})
                      </div>
                      {items.map((result, i) => {
                        const idx = globalIdx + i;
                        const isActive = active === idx;
                        return (
                          <div
                            key={result.id || result.url}
                            onClick={() => navigate(result.url)}
                            onMouseEnter={() => setActive(idx)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              padding: "10px 18px",
                              cursor: "pointer",
                              background: isActive ? "var(--accent-light, #e6f3f3)" : "transparent",
                              borderLeft: isActive
                                ? "3px solid var(--accent, #0e6163)"
                                : "3px solid transparent",
                              transition: "all 0.1s",
                            }}
                          >
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                flexShrink: 0,
                                background: result.color
                                  ? result.color + "18"
                                  : "var(--bg-surface,#f5f5f3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                              }}
                            >
                              {result.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: isActive ? 600 : 500,
                                  color: isActive
                                    ? "var(--accent,#0e6163)"
                                    : "var(--text-primary,#1c2b3a)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {result.title}
                              </div>
                              <div style={{ fontSize: 11, color: "#a0aec0", marginTop: 2 }}>
                                {result.meta}
                              </div>
                            </div>
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#cbd5e0"
                              strokeWidth="2"
                              style={{ flexShrink: 0 }}
                            >
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* Hints when empty */}
        {!results && (
          <div style={{ padding: "16px 18px 20px" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#a0aec0",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 10,
              }}
            >
              Quick access
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                "SIP Calculator",
                "Income Tax",
                "Compound Interest",
                "NIFTY 50",
                "Options Trading",
                "Budget",
              ].map((hint) => (
                <button
                  key={hint}
                  onClick={() => handleInput(hint)}
                  style={{
                    padding: "5px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    background: "var(--bg-surface,#f5f5f3)",
                    border: "1px solid var(--border,#e2ddd5)",
                    borderRadius: 20,
                    cursor: "pointer",
                    color: "var(--text-secondary,#4a5568)",
                    fontFamily: "var(--font-ui, system-ui)",
                  }}
                  type="button"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            gap: 16,
            padding: "8px 18px",
            borderTop: "1px solid var(--border,#e2ddd5)",
            background: "var(--bg-surface,#f5f5f3)",
          }}
        >
          {[
            { keys: ["↑", "↓"], label: "navigate" },
            { keys: ["↵"], label: "open" },
            { keys: ["esc"], label: "close" },
          ].map((hint) => (
            <div key={hint.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {hint.keys.map((k) => (
                <kbd
                  key={k}
                  style={{
                    fontSize: 10,
                    padding: "1px 4px",
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: 3,
                    color: "#718096",
                  }}
                >
                  {k}
                </kbd>
              ))}
              <span style={{ fontSize: 11, color: "#a0aec0" }}>{hint.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
