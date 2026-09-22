"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Daily Review Page (Spaced Repetition)
// app/review/page.tsx
// Shows concepts due for review using SM-2 algorithm
// ============================================================

type ReviewConcept = {
  id:          string;
  name:        string;
  slug:        string;
  simple_def:  string;
  full_def:    string;
  formula:     string;
  example:     string;
  difficulty:  string;
  mastery:     {
    mastery_score:  number;
    next_review:    string;
    repetitions:    number;
    last_score:     number;
  } | null;
};

type ReviewPhase = "loading" | "intro" | "front" | "back" | "rating" | "complete";

const RATING_OPTIONS = [
  { q: 1, label: "Didn't remember",   emoji: "😕", color: "#E53E3E", bg: "#FFF5F5", desc: "Review again tomorrow" },
  { q: 2, label: "Very hard",         emoji: "😰", color: "#DD6B20", bg: "#FFFAF0", desc: "Review in 2 days" },
  { q: 3, label: "Got it with effort",emoji: "🤔", color: "#D69E2E", bg: "#FFFFF0", desc: "Review in 4 days" },
  { q: 4, label: "Recalled well",     emoji: "😊", color: "#38A169", bg: "#F0FFF4", desc: "Review in 1 week" },
  { q: 5, label: "Perfect recall",    emoji: "🎯", color: "#1D9E75", bg: "#E6FFFA", desc: "Review in 2 weeks" },
];

export default function ReviewPage() {
  const [phase,    setPhase]    = useState<ReviewPhase>("loading");
  const [queue,    setQueue]    = useState<ReviewConcept[]>([]);
  const [index,    setIndex]    = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results,  setResults]  = useState<{ concept: string; quality: number }[]>([]);
  const [streak,   setStreak]   = useState(0);

  const current = queue[index];
  const progress = queue.length > 0 ? Math.round((index / queue.length) * 100) : 0;

  // Load due concepts
  const loadQueue = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    // Get concepts due for review
    const { data: dueItems } = await supabase
      .from("user_concept_mastery")
      .select("concept_id, mastery_score, next_review, repetitions, last_score")
      .eq("user_id", user.id)
      .lte("next_review", today)
      .order("next_review")
      .limit(20);

    if (!dueItems?.length) {
      // No due items — show new concepts instead
      const { data: masteredIds } = await supabase
        .from("user_concept_mastery")
        .select("concept_id")
        .eq("user_id", user.id);

      const masteredSet = new Set(masteredIds?.map((m: any) => m.concept_id) || []);

      const { data: newConcepts } = await supabase
        .from("concepts")
        .select("*")
        .eq("is_published", true)
        .not("id", "in", `(${Array.from(masteredSet).join(",") || "null"})`)
        .order("difficulty")
        .limit(10);

      const enriched = (newConcepts || []).map((c: any) => ({ ...c, mastery: null }));
      setQueue(enriched);
      setPhase(enriched.length > 0 ? "intro" : "complete");
      return;
    }

    // Fetch full concept data
    const conceptIds = dueItems.map((d: any) => d.concept_id);
    const { data: concepts } = await supabase
      .from("concepts")
      .select("*")
      .in("id", conceptIds);

    const masteryMap = new Map(dueItems.map((d: any) => [d.concept_id, d]));

    const enriched = (concepts || []).map((c: any) => ({
      ...c,
      mastery: masteryMap.get(c.id) || null,
    }));

    setQueue(enriched);
    setPhase("intro");
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  // Handle rating submission
  const handleRate = async (quality: number) => {
    if (!current) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await (supabase as any).rpc("update_concept_mastery", {
      p_user_id:    user.id,
      p_concept_id: current.id,
      p_quality:    quality,
    });

    // Award XP for review
    const xp = quality >= 4 ? 10 : quality >= 3 ? 5 : 2;
    await (supabase.from("user_xp_log") as any).insert({
      user_id:   user.id,
      xp_amount: xp,
      reason:    `Reviewed: ${current.name}`,
    });

    setResults(prev => [...prev, { concept: current.name, quality }]);
    setRevealed(false);

    if (quality >= 4) setStreak(s => s + 1);
    else setStreak(0);

    if (index + 1 >= queue.length) {
      setPhase("complete");
    } else {
      setIndex(i => i + 1);
      setPhase("front");
    }
  };

  // ─── PHASE: Loading ───────────────────────────────────────
  if (phase === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-ui,system-ui)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#0E6163", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#718096", fontSize: 14 }}>Loading your review session…</p>
        </div>
      </div>
    );
  }

  // ─── PHASE: Intro ─────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base,#f7f4ee)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "var(--font-ui,system-ui)" }}>
        <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🧠</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1c2b3a", marginBottom: 10, letterSpacing: "-0.4px" }}>
            {queue[0]?.mastery ? "Daily Review" : "Learn New Concepts"}
          </h1>
          <p style={{ fontSize: 15, color: "#718096", lineHeight: 1.7, marginBottom: 28 }}>
            {queue[0]?.mastery
              ? `You have ${queue.length} concept${queue.length !== 1 ? "s" : ""} due for review today. Rating your recall helps the spaced repetition system schedule your next review at the perfect time.`
              : `You have ${queue.length} new concept${queue.length !== 1 ? "s" : ""} to explore today. Take your time with each one.`
            }
          </p>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
            {[
              { label: "To review", value: queue.length, icon: "📚" },
              { label: "Est. time", value: `${queue.length * 2} min`, icon: "⏱" },
              { label: "XP to earn", value: `${queue.length * 10}+`, icon: "⭐" },
            ].map(stat => (
              <div key={stat.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 10px" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#1c2b3a" }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "#a0aec0" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <button onClick={() => setPhase("front")}
            style={{
              width: "100%", padding: "15px", background: "#0E6163", color: "#fff",
              border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: "pointer", fontFamily: "var(--font-ui,system-ui)",
              boxShadow: "0 6px 20px rgba(14,97,99,0.3)",
            }}>
            Start Review Session →
          </button>

          <a href="/dashboard" style={{ display: "block", marginTop: 14, fontSize: 13, color: "#a0aec0", textDecoration: "none" }}>
            Skip for today
          </a>
        </div>
      </div>
    );
  }

  // ─── PHASE: Complete ─────────────────────────────────────
  if (phase === "complete") {
    const perfect = results.filter(r => r.quality >= 4).length;
    const totalXP = results.reduce((s, r) => s + (r.quality >= 4 ? 10 : r.quality >= 3 ? 5 : 2), 0);

    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base,#f7f4ee)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "var(--font-ui,system-ui)" }}>
        <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>
            {perfect === results.length ? "🏆" : perfect > results.length / 2 ? "🎉" : "📚"}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1c2b3a", marginBottom: 8, letterSpacing: "-0.4px" }}>
            Review Complete!
          </h1>
          <p style={{ fontSize: 15, color: "#718096", marginBottom: 28 }}>
            You reviewed {results.length} concept{results.length !== 1 ? "s" : ""}
          </p>

          {/* Results breakdown */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Recalled well",  value: results.filter(r => r.quality >= 4).length, color: "#1D9E75" },
                { label: "Needs work",     value: results.filter(r => r.quality < 3).length,  color: "#E53E3E" },
                { label: "XP earned",      value: `+${totalXP}`,                              color: "#D4A017" },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "#a0aec0" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Individual results */}
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 14 }}>
              {results.map((r, i) => {
                const rating = RATING_OPTIONS.find(o => o.q === r.quality) || RATING_OPTIONS[0];
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "#4a5568" }}>{r.concept}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: rating.color, background: rating.bg, padding: "2px 8px", borderRadius: 10 }}>
                      {rating.emoji} {rating.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <a href="/dashboard" style={{
              flex: 1, display: "block", textAlign: "center",
              padding: "12px", background: "#0E6163", color: "#fff",
              borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              Back to Dashboard
            </a>
            <a href="/explore" style={{
              flex: 1, display: "block", textAlign: "center",
              padding: "12px", background: "#fff", color: "#0E6163",
              border: "1px solid #0E6163", borderRadius: 10,
              fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              Continue Learning
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── PHASE: Card (front + back) ──────────────────────────
  if (!current) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base,#f7f4ee)",
      display: "flex", flexDirection: "column",
      fontFamily: "var(--font-ui,system-ui)",
    }}>
      {/* Top bar */}
      <div style={{
        padding: "14px 24px",
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <a href="/dashboard" style={{ color: "#a0aec0", textDecoration: "none", fontSize: 20 }}>←</a>

        {/* Progress */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "#718096" }}>
              {index + 1} of {queue.length}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0E6163" }}>{progress}%</span>
          </div>
          <div style={{ height: 5, background: "#EDF2F7", borderRadius: 999 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "#0E6163", borderRadius: 999, transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* Streak */}
        {streak > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#FFFFF0", border: "1px solid #FBD38D", borderRadius: 20, padding: "4px 10px" }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#D69E2E" }}>{streak}</span>
          </div>
        )}
      </div>

      {/* Card area */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "24px 20px",
      }}>
        <div style={{ maxWidth: 600, width: "100%" }}>

          {/* Difficulty + last score */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: ".07em" }}>
              {current.difficulty}
            </span>
            {current.mastery?.last_score && (
              <span style={{ fontSize: 11, color: "#a0aec0" }}>
                · Last: {RATING_OPTIONS.find(o => o.q === current.mastery?.last_score)?.emoji || "—"}
              </span>
            )}
          </div>

          {/* Flashcard */}
          <div style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 20,
            padding: "36px 32px",
            minHeight: 260,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            position: "relative",
            marginBottom: 20,
          }}>
            {/* Front: concept name */}
            <div style={{ marginBottom: revealed ? 24 : 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
                What is…
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 900, color: "#1c2b3a", letterSpacing: "-0.5px", margin: 0, lineHeight: 1.2 }}>
                {current.name}
              </h2>
            </div>

            {/* Back: answer */}
            {revealed && (
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 20, width: "100%" }}>
                <p style={{ fontSize: 16, color: "#1c2b3a", lineHeight: 1.7, fontWeight: 500, marginBottom: current.example ? 16 : 0 }}>
                  {current.simple_def}
                </p>

                {current.formula && (
                  <div style={{ background: "#f8f9fa", borderRadius: 8, padding: "8px 14px", fontFamily: "monospace", fontSize: 13, color: "#4a5568", marginBottom: 12 }}>
                    {current.formula}
                  </div>
                )}

                {current.example && (
                  <div style={{ background: "#f0f9f9", borderLeft: "3px solid #0E6163", padding: "10px 14px", borderRadius: "0 8px 8px 0", textAlign: "left" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#0E6163", marginBottom: 4 }}>INDIA EXAMPLE</div>
                    <p style={{ fontSize: 13, color: "#1c2b3a", lineHeight: 1.6, margin: 0 }}>{current.example}</p>
                  </div>
                )}
              </div>
            )}

            {/* Mastery ring overlay */}
            {current.mastery && (
              <div style={{ position: "absolute", top: 14, right: 14 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700,
                  color: current.mastery.mastery_score >= 80 ? "#1D9E75" : "#D4A017",
                  background: current.mastery.mastery_score >= 80 ? "#F0FFF4" : "#FFFFF0",
                  border: `1px solid ${current.mastery.mastery_score >= 80 ? "#C6F6D5" : "#FBD38D"}`,
                  padding: "3px 9px", borderRadius: 20,
                }}>
                  {Math.round(current.mastery.mastery_score)}% mastered
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              style={{
                width: "100%", padding: "15px",
                background: "#0E6163", color: "#fff",
                border: "none", borderRadius: 12,
                fontSize: 16, fontWeight: 700, cursor: "pointer",
                fontFamily: "var(--font-ui,system-ui)",
                boxShadow: "0 6px 20px rgba(14,97,99,0.3)",
              }}>
              Show Answer
            </button>
          ) : (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#718096", textAlign: "center", marginBottom: 12 }}>
                How well did you recall this?
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {RATING_OPTIONS.map(opt => (
                  <button key={opt.q} onClick={() => handleRate(opt.q)}
                    style={{
                      padding: "12px 10px",
                      background: opt.bg, color: opt.color,
                      border: `1.5px solid ${opt.color}30`,
                      borderRadius: 10, cursor: "pointer",
                      fontFamily: "var(--font-ui,system-ui)",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    }}>
                    <span style={{ fontSize: 22 }}>{opt.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{opt.label}</span>
                    <span style={{ fontSize: 10, color: opt.color + "aa" }}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
