"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type SearchResult = {
  id: string;
  title: string;
  duration_minutes: number;
  is_free: boolean;
  level: {
    title: string;
    track: {
      title: string;
      icon: string | null;
      color_hex: string | null;
    } | null;
  } | null;
};

const quickLinks = [
  { label: "Personal Finance", href: "/explore", icon: "PF" },
  { label: "Trading and Markets", href: "/explore", icon: "TM" },
  { label: "Crypto and DeFi", href: "/explore", icon: "CD" },
  { label: "Corporate Finance", href: "/explore", icon: "CF" },
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSearch = () => {
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    debounce.current = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("lessons")
        .select("id, title, duration_minutes, is_free, level:levels(title, track:tracks(title, icon, color_hex))")
        .ilike("title", `%${query}%`)
        .eq("is_published", true)
        .limit(8);

      setResults(((data || []) as unknown) as SearchResult[]);
      setLoading(false);
    }, 250);

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  if (!open) {
    return (
      <button onClick={openSearch} style={s.searchTrigger} type="button">
        <span style={s.searchIcon}>Search</span>
        <span style={s.searchPlaceholder}>Search lessons...</span>
        <span style={s.searchShortcut}>Ctrl K</span>
      </button>
    );
  }

  return (
    <div style={s.overlay} onClick={(event) => event.target === event.currentTarget && setOpen(false)}>
      <div style={s.modal}>
        <div style={s.inputRow}>
          <span style={s.searchIconLg}>Search</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search lessons across all tracks..."
            style={s.input}
            autoComplete="off"
          />
          {query && (
            <button onClick={() => setQuery("")} style={s.clearBtn} type="button">Clear</button>
          )}
          <button onClick={() => setOpen(false)} style={s.escBtn} type="button">Esc</button>
        </div>

        <div style={s.results}>
          {loading && <div style={s.loadingRow}>Searching...</div>}

          {!loading && query && results.length === 0 && (
            <div style={s.emptyRow}>
              <div style={s.emptyTitle}>No lessons found for &quot;{query}&quot;</div>
              <div style={s.emptySub}>Try a different keyword or browse all tracks.</div>
            </div>
          )}

          {!loading && results.map((result) => {
            const track = result.level?.track;
            return (
              <Link
                key={result.id}
                href={`/learn/${result.id}`}
                onClick={() => setOpen(false)}
                style={s.resultItem}
              >
                <div style={{ ...s.resultTrackIcon, background: `${track?.color_hex || "#1D9E75"}22` }}>
                  {track?.icon || "FH"}
                </div>
                <div style={s.resultInfo}>
                  <div style={s.resultTitle}>{result.title}</div>
                  <div style={s.resultMeta}>
                    <span>{track?.title || "FinanceHub"}</span>
                    <span style={s.dot}>·</span>
                    <span>{result.level?.title || "Lesson"}</span>
                    <span style={s.dot}>·</span>
                    <span>{result.duration_minutes} min</span>
                    {result.is_free && <span style={s.freeTag}>Free</span>}
                  </div>
                </div>
                <span style={s.resultArrow}>Open</span>
              </Link>
            );
          })}

          {!query && (
            <div style={s.hintRow}>
              <div style={s.hintTitle}>Quick links</div>
              {quickLinks.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setOpen(false)} style={s.quickLink}>
                  <span style={s.quickIcon}>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div style={s.footer}>
          <span>Type to search</span>
          <span style={s.dot}>·</span>
          <span>Enter a result to open</span>
          <span style={s.dot}>·</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  searchTrigger: { display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: "#f5f5f3", border: "0.5px solid #e5e5e5", borderRadius: 8, cursor: "pointer", fontFamily: "system-ui", minWidth: 220 },
  searchIcon: { fontSize: 11, color: "#777", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" },
  searchPlaceholder: { fontSize: 13, color: "#888", flex: 1, textAlign: "left" },
  searchShortcut: { fontSize: 10, color: "#999", background: "#eee", padding: "2px 5px", borderRadius: 4 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 500, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "80px 18px 0", backdropFilter: "blur(2px)" },
  modal: { background: "#fff", borderRadius: 14, width: "100%", maxWidth: 560, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden", fontFamily: "system-ui,-apple-system,sans-serif" },
  inputRow: { display: "flex", alignItems: "center", gap: 8, padding: "14px 16px", borderBottom: "0.5px solid #eee" },
  searchIconLg: { fontSize: 11, color: "#777", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", flexShrink: 0 },
  input: { flex: 1, fontSize: 16, border: "none", outline: "none", color: "#0a0a0a", background: "transparent", fontFamily: "system-ui", minWidth: 0 },
  clearBtn: { fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer", padding: "2px 4px" },
  escBtn: { fontSize: 11, color: "#888", background: "#f5f5f5", border: "0.5px solid #eee", borderRadius: 5, padding: "3px 7px", cursor: "pointer", fontFamily: "system-ui" },
  results: { maxHeight: 380, overflowY: "auto" },
  loadingRow: { padding: "24px", textAlign: "center", fontSize: 13, color: "#888" },
  emptyRow: { padding: "32px", textAlign: "center" },
  emptyTitle: { fontSize: 14, color: "#444", fontWeight: 600 },
  emptySub: { fontSize: 12, color: "#aaa", marginTop: 4 },
  resultItem: { display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", textDecoration: "none", borderBottom: "0.5px solid #f5f5f5", transition: "background .1s" },
  resultTrackIcon: { width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#0a0a0a", flexShrink: 0 },
  resultInfo: { flex: 1, minWidth: 0 },
  resultTitle: { fontWeight: 600, fontSize: 14, color: "#0a0a0a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 },
  resultMeta: { fontSize: 11, color: "#888", display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" },
  dot: { color: "#ccc" },
  freeTag: { background: "#E1F5EE", color: "#0F6E56", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 8, marginLeft: 4 },
  resultArrow: { fontSize: 12, color: "#999", fontWeight: 600 },
  hintRow: { padding: "14px 16px" },
  hintTitle: { fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 },
  quickLink: { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, textDecoration: "none", fontSize: 13, color: "#555", transition: "background .1s" },
  quickIcon: { width: 26, height: 26, borderRadius: 7, background: "#f3f3f3", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#777" },
  footer: { display: "flex", gap: 8, padding: "10px 16px", borderTop: "0.5px solid #eee", fontSize: 11, color: "#aaa", flexWrap: "wrap" },
};
