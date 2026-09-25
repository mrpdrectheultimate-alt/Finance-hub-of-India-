"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Glossary Page
// app/glossary/page.tsx
// SEO goldmine: 200+ finance terms, each indexable by Google
// ============================================================

type GlossaryTerm = {
  id:           string;
  term:         string;
  slug:         string;
  simple_def:   string;
  full_def:     string;
  example:      string;
  formula:      string;
  category:     string;
  difficulty:   "beginner" | "intermediate" | "advanced";
  related_terms: string[];
  view_count:   number;
};

const CATEGORIES = [
  { id: "all",              label: "All Terms",       icon: "📚" },
  { id: "personal-finance", label: "Personal Finance", icon: "💰" },
  { id: "trading-markets",  label: "Investing",        icon: "📈" },
  { id: "corporate-finance",label: "Corporate",        icon: "🏢" },
  { id: "technical-analysis",label:"Technical",        icon: "📊" },
  { id: "behavioral-finance",label:"Behavioral",       icon: "🧠" },
  { id: "forex-currency",   label: "Forex",            icon: "💱" },
  { id: "crypto-defi",      label: "Crypto",           icon: "₿"  },
];

const DIFFICULTY_COLORS = {
  beginner:     { bg: "#F0FFF4", text: "#22543D", border: "#C6F6D5" },
  intermediate: { bg: "#EBF8FF", text: "#2C5282", border: "#BEE3F8" },
  advanced:     { bg: "#FAF5FF", text: "#553C9A", border: "#E9D8FD" },
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function GlossaryPage() {
  const [terms,      setTerms]      = useState<GlossaryTerm[]>([]);
  const [filtered,   setFiltered]   = useState<GlossaryTerm[]>([]);
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [activeLetter, setActiveLetter] = useState("");
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [loading,    setLoading]    = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load all glossary terms
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("glossary")
        .select("*")
        .eq("is_published", true)
        .order("term");
      if (data) { const termsData = data as unknown as GlossaryTerm[]; setTerms(termsData); setFiltered(termsData); }
      setLoading(false);
    })();
  }, []);

  // Filter whenever search/category/difficulty/letter changes
  useEffect(() => {
    let result = [...terms];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.term.toLowerCase().includes(q) ||
        t.simple_def.toLowerCase().includes(q)
      );
    }
    if (category !== "all") {
      result = result.filter(t => t.category === category);
    }
    if (difficulty !== "all") {
      result = result.filter(t => t.difficulty === difficulty);
    }
    if (activeLetter) {
      result = result.filter(t =>
        t.term.toUpperCase().startsWith(activeLetter)
      );
    }
    setFiltered(result);
  }, [search, category, difficulty, activeLetter, terms]);

  const handleExpand = async (term: GlossaryTerm) => {
    const next = expanded === term.id ? null : term.id;
    setExpanded(next);
    if (next) {
      // Track view
      await (supabase as any).rpc("increment_glossary_views", { p_slug: term.slug });
    }
  };

  // Group filtered terms by first letter
  const grouped = filtered.reduce((acc, term) => {
    const letter = term.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  const lettersWithTerms = Object.keys(grouped).sort();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base, #f7f4ee)", fontFamily: "var(--font-ui, system-ui)" }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0D1117 0%, #1a2a40 100%)",
        padding: "48px 24px 40px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1D9E75", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>
          Finance Dictionary
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 10, lineHeight: 1.2 }}>
          Every Finance Term, Explained Simply
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", maxWidth: 520, margin: "0 auto 28px", lineHeight: 1.7 }}>
          {terms.length}+ terms · India-specific examples · From beginner to advanced
        </p>

        {/* Search */}
        <div style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
          <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={searchRef}
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveLetter(""); }}
            placeholder="Search any finance term…"
            style={{
              width: "100%", padding: "13px 16px 13px 46px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12, color: "#fff", fontSize: 15,
              fontFamily: "var(--font-ui, system-ui)",
              outline: "none", boxSizing: "border-box",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 18, padding: 0 }}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* Category filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => { setCategory(cat.id); setActiveLetter(""); }}
              style={{
                padding: "7px 14px",
                background: category === cat.id ? "#0E6163" : "#fff",
                color: category === cat.id ? "#fff" : "#4a5568",
                border: `1px solid ${category === cat.id ? "#0E6163" : "#e2e8f0"}`,
                borderRadius: 20, fontSize: 13, fontWeight: category === cat.id ? 600 : 400,
                cursor: "pointer", fontFamily: "var(--font-ui, system-ui)",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.15s",
              }}>
              {cat.icon} {cat.label}
            </button>
          ))}

          {/* Difficulty */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {["all", "beginner", "intermediate", "advanced"].map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                style={{
                  padding: "7px 12px", fontSize: 12, fontWeight: difficulty === d ? 600 : 400,
                  background: difficulty === d ? "#1c2b3a" : "#fff",
                  color: difficulty === d ? "#fff" : "#718096",
                  border: `1px solid ${difficulty === d ? "#1c2b3a" : "#e2e8f0"}`,
                  borderRadius: 20, cursor: "pointer", fontFamily: "var(--font-ui, system-ui)",
                  textTransform: "capitalize",
                }}>
                {d === "all" ? "All levels" : d}
              </button>
            ))}
          </div>
        </div>

        {/* A-Z Index */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 4,
          padding: "10px 14px", background: "#fff",
          border: "1px solid #e2e8f0", borderRadius: 10,
          marginBottom: 20,
        }}>
          <button onClick={() => setActiveLetter("")}
            style={{
              padding: "4px 8px", fontSize: 12, fontWeight: !activeLetter ? 700 : 400,
              background: !activeLetter ? "#0E6163" : "none",
              color: !activeLetter ? "#fff" : "#718096",
              border: "none", borderRadius: 6, cursor: "pointer",
              fontFamily: "var(--font-ui, system-ui)",
            }}>
            All
          </button>
          {ALPHABET.map(letter => {
            const hasTerms = terms.some(t => t.term[0].toUpperCase() === letter);
            return (
              <button key={letter}
                onClick={() => hasTerms && setActiveLetter(activeLetter === letter ? "" : letter)}
                style={{
                  width: 28, height: 28, fontSize: 12, fontWeight: activeLetter === letter ? 700 : 400,
                  background: activeLetter === letter ? "#0E6163" : "none",
                  color: activeLetter === letter ? "#fff" : hasTerms ? "#1c2b3a" : "#d1d5db",
                  border: "none", borderRadius: 6,
                  cursor: hasTerms ? "pointer" : "default",
                  fontFamily: "var(--font-ui, system-ui)",
                }}>
                {letter}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <div style={{ fontSize: 13, color: "#718096", marginBottom: 16 }}>
          {loading ? "Loading terms…" : `${filtered.length} term${filtered.length !== 1 ? "s" : ""} found`}
          {(search || category !== "all" || difficulty !== "all" || activeLetter) && (
            <button onClick={() => { setSearch(""); setCategory("all"); setDifficulty("all"); setActiveLetter(""); }}
              style={{ marginLeft: 10, fontSize: 12, color: "#0E6163", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Clear filters
            </button>
          )}
        </div>

        {/* Terms grouped by letter */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ height: 72, borderRadius: 12, border: "1px solid #e2e8f0",
                background: "linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%)",
                backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1c2b3a", marginBottom: 8 }}>No terms found</h3>
            <p style={{ fontSize: 14, color: "#718096" }}>Try different keywords or clear the filters</p>
          </div>
        ) : (
          lettersWithTerms.map(letter => (
            <div key={letter} id={`letter-${letter}`} style={{ marginBottom: 28 }}>
              {/* Letter header */}
              <div style={{
                fontSize: 20, fontWeight: 800, color: "#0E6163",
                borderBottom: "2px solid #0E616320",
                paddingBottom: 6, marginBottom: 12,
                display: "flex", alignItems: "baseline", gap: 10,
              }}>
                {letter}
                <span style={{ fontSize: 12, fontWeight: 500, color: "#a0aec0" }}>
                  {grouped[letter].length} term{grouped[letter].length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Terms in this letter group */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {grouped[letter].map(term => {
                  const isOpen   = expanded === term.id;
                  const diffStyle = DIFFICULTY_COLORS[term.difficulty];
                  return (
                    <div key={term.id}
                      style={{
                        background: "#fff",
                        border: `1px solid ${isOpen ? "#0E6163" : "#e2e8f0"}`,
                        borderRadius: 12,
                        overflow: "hidden",
                        transition: "all 0.2s",
                        boxShadow: isOpen ? "0 4px 20px rgba(14,97,99,0.1)" : "none",
                      }}>

                      {/* Term header (always visible) */}
                      <button onClick={() => handleExpand(term)}
                        style={{
                          width: "100%", padding: "14px 16px",
                          background: isOpen ? "#f0f9f9" : "transparent",
                          border: "none", cursor: "pointer",
                          textAlign: "left", fontFamily: "var(--font-ui, system-ui)",
                          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
                        }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: isOpen ? "#0E6163" : "#1c2b3a" }}>
                              {term.term}
                            </span>
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10,
                              background: diffStyle.bg, color: diffStyle.text, border: `1px solid ${diffStyle.border}`,
                              textTransform: "capitalize",
                            }}>
                              {term.difficulty}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: "#718096", lineHeight: 1.5, margin: 0 }}>
                            {term.simple_def}
                          </p>
                        </div>
                        <div style={{ color: "#a0aec0", fontSize: 18, flexShrink: 0, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}>
                          ↓
                        </div>
                      </button>

                      {/* Expanded content */}
                      {isOpen && (
                        <div style={{ padding: "0 16px 16px", borderTop: "1px solid #e2e8f0" }}>

                          {/* Full definition */}
                          {term.full_def && (
                            <div style={{ marginTop: 14 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
                                Full explanation
                              </div>
                              <p style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7, margin: 0 }}>
                                {term.full_def}
                              </p>
                            </div>
                          )}

                          {/* Formula */}
                          {term.formula && (
                            <div style={{ marginTop: 12 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
                                Formula
                              </div>
                              <div style={{
                                background: "#1c2b3a", color: "#e2e8f0",
                                padding: "8px 12px", borderRadius: 8,
                                fontSize: 13, fontFamily: "monospace", lineHeight: 1.5,
                              }}>
                                {term.formula}
                              </div>
                            </div>
                          )}

                          {/* India example */}
                          {term.example && (
                            <div style={{ marginTop: 12 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
                                India example
                              </div>
                              <div style={{
                                background: "#f0f9f9", borderLeft: "3px solid #0E6163",
                                padding: "8px 12px", borderRadius: "0 8px 8px 0",
                                fontSize: 13, color: "#1c2b3a", lineHeight: 1.6,
                              }}>
                                {term.example}
                              </div>
                            </div>
                          )}

                          {/* Related terms */}
                          {term.related_terms?.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
                                Related terms
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {term.related_terms.map(slug => (
                                  <button key={slug}
                                    onClick={() => {
                                      setSearch(slug.replace(/-/g, " "));
                                      setExpanded(null);
                                    }}
                                    style={{
                                      fontSize: 11, padding: "3px 10px",
                                      background: "#f7fafc", border: "1px solid #e2e8f0",
                                      borderRadius: 12, cursor: "pointer",
                                      color: "#0E6163", fontFamily: "var(--font-ui, system-ui)",
                                      textTransform: "capitalize",
                                    }}>
                                    {slug.replace(/-/g, " ")}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Learn more link */}
                          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <a href={`/glossary/${term.slug}`}
                              style={{ fontSize: 12, color: "#0E6163", textDecoration: "none", fontWeight: 600 }}>
                              Full glossary page →
                            </a>
                            <span style={{ fontSize: 11, color: "#a0aec0" }}>
                              {term.view_count > 0 ? `${term.view_count} views` : ""}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* SEO footer */}
        <div style={{
          marginTop: 48, padding: "24px", background: "#fff",
          borderRadius: 14, border: "1px solid #e2e8f0",
          textAlign: "center",
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1c2b3a", marginBottom: 8 }}>
            Master Every Finance Term
          </h2>
          <p style={{ fontSize: 14, color: "#718096", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 16px" }}>
            Understanding financial terminology is the foundation of financial literacy.
            FinanceHub&apos;s glossary covers {terms.length}+ terms from basic to advanced,
            all with India-specific examples in plain language.
          </p>
          <a href="/explore" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 20px", background: "#0E6163", color: "#fff",
            borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none",
          }}>
            Start Learning with Full Lessons →
          </a>
        </div>
      </div>
    </div>
  );
}
