"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Concept Card Component
// components/learn/ConceptCard.tsx
// Shows concept with mastery score + spaced repetition UI
// ============================================================

type Concept = {
  id:          string;
  name:        string;
  slug:        string;
  simple_def:  string;
  full_def:    string;
  formula:     string;
  example:     string;
  difficulty:  "beginner" | "intermediate" | "advanced";
  track_slugs: string[];
};

type MasteryData = {
  mastery_score:  number;
  quiz_score:     number;
  exposure_count: number;
  next_review:    string;
  repetitions:    number;
  last_reviewed:  string;
};

interface ConceptCardProps {
  concept:     Concept;
  showMastery?: boolean;
  compact?:    boolean;
  onReview?:   (concept: Concept) => void;
}

const DIFFICULTY_CONFIG = {
  beginner:     { color: "#22543D", bg: "#F0FFF4", border: "#C6F6D5", label: "Beginner" },
  intermediate: { color: "#2C5282", bg: "#EBF8FF", border: "#BEE3F8", label: "Intermediate" },
  advanced:     { color: "#553C9A", bg: "#FAF5FF", border: "#E9D8FD", label: "Advanced" },
};

function MasteryRing({ score, size = 48 }: { score: number; size?: number }) {
  const radius      = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset  = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#1D9E75" : score >= 50 ? "#D4A017" : score > 0 ? "#E53E3E" : "#CBD5E0";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#EDF2F7" strokeWidth={5} />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={5}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: size > 44 ? 13 : 10, fontWeight: 700, color,
      }}>
        {score > 0 ? `${Math.round(score)}%` : "—"}
      </div>
    </div>
  );
}

export function ConceptCard({ concept, showMastery = true, compact = false, onReview }: ConceptCardProps) {
  const [mastery,   setMastery]   = useState<MasteryData | null>(null);
  const [expanded,  setExpanded]  = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const diff = DIFFICULTY_CONFIG[concept.difficulty];

  useEffect(() => {
    if (!showMastery) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_concept_mastery")
        .select("mastery_score,quiz_score,exposure_count,next_review,repetitions,last_reviewed")
        .eq("user_id", user.id)
        .eq("concept_id", concept.id)
        .single();
      if (data) setMastery(data as unknown as MasteryData);
    })();
  }, [concept.id, showMastery]);

  const isDueForReview = mastery?.next_review &&
    new Date(mastery.next_review) <= new Date();

  const handleRate = async (quality: number) => {
    setReviewing(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await (supabase as any).rpc("update_concept_mastery", {
      p_user_id:    user.id,
      p_concept_id: concept.id,
      p_quality:    quality,
    });

    // Refresh mastery
    const { data: updated } = await supabase
      .from("user_concept_mastery")
      .select("mastery_score,quiz_score,exposure_count,next_review,repetitions,last_reviewed")
      .eq("user_id", user.id)
      .eq("concept_id", concept.id)
      .single();
    if (updated) setMastery(updated as unknown as MasteryData);
    onReview?.(concept);
  };

  if (compact) {
    return (
      <div style={{
        display: "flex", gap: 12, alignItems: "center",
        padding: "10px 14px",
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
        transition: "all 0.15s",
        borderLeft: isDueForReview ? "3px solid #E53E3E" : "3px solid transparent",
      }}>
        {showMastery && <MasteryRing score={mastery?.mastery_score || 0} size={40} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a", marginBottom: 2 }}>
            {concept.name}
          </div>
          <div style={{ fontSize: 11, color: "#718096", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {concept.simple_def}
          </div>
        </div>
        {isDueForReview && (
          <div style={{ fontSize: 10, fontWeight: 700, color: "#E53E3E", background: "#FFF5F5", padding: "2px 7px", borderRadius: 10, flexShrink: 0 }}>
            Review due
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${expanded ? "#0E6163" : "#e2e8f0"}`,
      borderRadius: 14,
      overflow: "hidden",
      transition: "all 0.2s",
      boxShadow: expanded ? "0 4px 20px rgba(14,97,99,0.1)" : "none",
    }}>
      {/* Card header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: "16px 18px",
          cursor: "pointer",
          background: expanded ? "#f0f9f9" : "#fff",
          display: "flex", gap: 14, alignItems: "flex-start",
        }}
      >
        {showMastery && <MasteryRing score={mastery?.mastery_score || 0} />}

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1c2b3a", margin: 0 }}>
              {concept.name}
            </h3>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "1px 7px",
              background: diff.bg, color: diff.color, border: `1px solid ${diff.border}`,
              borderRadius: 10, textTransform: "capitalize",
            }}>
              {diff.label}
            </span>
            {isDueForReview && (
              <span style={{ fontSize: 10, fontWeight: 700, color: "#E53E3E", background: "#FFF5F5", padding: "1px 7px", borderRadius: 10 }}>
                📅 Review due
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: "#718096", lineHeight: 1.6, margin: 0 }}>
            {concept.simple_def}
          </p>
        </div>

        <div style={{ color: "#a0aec0", fontSize: 16, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none", flexShrink: 0 }}>
          ↓
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid #e2e8f0" }}>

          {/* Mastery stats row */}
          {showMastery && mastery && (
            <div style={{
              display: "flex", gap: 12, padding: "12px 0",
              borderBottom: "1px solid #f0f0f0", marginBottom: 14,
            }}>
              {[
                { label: "Mastery",    value: `${Math.round(mastery.mastery_score || 0)}%` },
                { label: "Reviews",    value: mastery.repetitions || 0 },
                { label: "Next review",value: mastery.next_review
                    ? new Date(mastery.next_review).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                    : "Not started" },
              ].map(stat => (
                <div key={stat.label} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1c2b3a" }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".05em" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Full definition */}
          {concept.full_def && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 7 }}>
                Explanation
              </div>
              <p style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7, margin: 0 }}>{concept.full_def}</p>
            </div>
          )}

          {/* Formula */}
          {concept.formula && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 7 }}>
                Formula
              </div>
              <div style={{
                background: "#1c2b3a", color: "#a0e6ff",
                padding: "10px 14px", borderRadius: 8,
                fontFamily: "monospace", fontSize: 13, lineHeight: 1.5,
              }}>
                {concept.formula}
              </div>
            </div>
          )}

          {/* India example */}
          {concept.example && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 7 }}>
                India example
              </div>
              <div style={{
                background: "#f0f9f9", borderLeft: "3px solid #0E6163",
                padding: "10px 14px", borderRadius: "0 8px 8px 0",
                fontSize: 13, color: "#1c2b3a", lineHeight: 1.7,
              }}>
                {concept.example}
              </div>
            </div>
          )}

          {/* Spaced repetition rating */}
          {showMastery && !reviewing && (
            <button
              onClick={() => setReviewing(true)}
              style={{
                width: "100%", padding: "10px", fontSize: 13, fontWeight: 600,
                background: isDueForReview ? "#0E6163" : "#f7fafc",
                color: isDueForReview ? "#fff" : "#0E6163",
                border: `1px solid ${isDueForReview ? "#0E6163" : "#0E616340"}`,
                borderRadius: 9, cursor: "pointer",
                fontFamily: "var(--font-ui, system-ui)",
              }}>
              {isDueForReview ? "📅 Rate your recall now" : "🔄 Test your recall"}
            </button>
          )}

          {reviewing && (
            <div style={{ background: "#f8f9fa", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a", marginBottom: 12, textAlign: "center" }}>
                How well did you recall <strong>{concept.name}</strong>?
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { q: 1, label: "Didn't remember", color: "#E53E3E", bg: "#FFF5F5" },
                  { q: 3, label: "Partly recalled",  color: "#D69E2E", bg: "#FFFFF0" },
                  { q: 5, label: "Recalled perfectly", color: "#1D9E75", bg: "#F0FFF4" },
                ].map(opt => (
                  <button key={opt.q} onClick={() => handleRate(opt.q)}
                    style={{
                      padding: "10px 8px", fontSize: 12, fontWeight: 600,
                      color: opt.color, background: opt.bg,
                      border: `1px solid ${opt.color}30`,
                      borderRadius: 8, cursor: "pointer", textAlign: "center",
                      fontFamily: "var(--font-ui, system-ui)", lineHeight: 1.4,
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setReviewing(false)}
                style={{ width: "100%", marginTop: 8, padding: "6px", fontSize: 12, color: "#a0aec0",
                  background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-ui, system-ui)" }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Mastery Dashboard Widget
// Shows track-level mastery overview
// ============================================================
export function MasteryDashboard({ trackSlug }: { trackSlug?: string }) {
  const [concepts, setConcepts] = useState<(Concept & { mastery: MasteryData | null })[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get concepts for this track (or all)
      let query = supabase.from("concepts").select("*").eq("is_published", true);
      if (trackSlug) {
        query = query.contains("track_slugs", [trackSlug]);
      }
      const { data: conceptsData } = await query.order("name").limit(20);
      if (!conceptsData) return;

      // Get mastery for all concepts
      const { data: masteryData } = await supabase
        .from("user_concept_mastery")
        .select("concept_id,mastery_score,quiz_score,next_review,repetitions,exposure_count,last_reviewed")
        .eq("user_id", user.id)
        .in("concept_id", conceptsData.map((c: any) => c.id));

      const masteryMap = new Map(masteryData?.map((m: any) => [m.concept_id, m]) || []);

      const enriched = conceptsData.map((c: any) => ({
        ...c,
        mastery: masteryMap.get(c.id) || null,
      }));

      const due = enriched.filter(c =>
        c.mastery?.next_review && new Date(c.mastery.next_review) <= new Date()
      ).length;

      setConcepts(enriched);
      setDueCount(due);
      setLoading(false);
    })();
  }, [trackSlug]);

  const avgMastery = concepts.length
    ? Math.round(concepts.reduce((s, c) => s + (c.mastery?.mastery_score || 0), 0) / concepts.length)
    : 0;

  const masteryColor = avgMastery >= 80 ? "#1D9E75" : avgMastery >= 50 ? "#D4A017" : "#E53E3E";

  if (loading) return (
    <div style={{ borderRadius: 14, border: "1px solid #e2e8f0", padding: 20, height: 200,
      background: "linear-gradient(90deg,#f5f5f5 25%,#ebebeb 50%,#f5f5f5 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
  );

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "16px 18px", background: "linear-gradient(135deg, #0D1117 0%, #1a2a40 100%)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1D9E75", marginBottom: 2 }}>Your Mastery</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{avgMastery}% average</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: dueCount > 0 ? "#FC8181" : "#68D391" }}>
            {dueCount}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>due for review</div>
        </div>
      </div>

      {/* Master progress bar */}
      <div style={{ padding: "12px 18px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "#718096" }}>Overall concept mastery</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: masteryColor }}>{avgMastery}%</span>
        </div>
        <div style={{ height: 7, background: "#EDF2F7", borderRadius: 999 }}>
          <div style={{ height: "100%", width: `${avgMastery}%`, background: masteryColor, borderRadius: 999, transition: "width 1s ease" }} />
        </div>
      </div>

      {/* Concept list */}
      <div style={{ padding: "10px 14px", maxHeight: 320, overflowY: "auto" }}>
        {concepts.map(concept => {
          const score   = concept.mastery?.mastery_score || 0;
          const isDue   = concept.mastery?.next_review && new Date(concept.mastery.next_review) <= new Date();
          const barColor = score >= 80 ? "#1D9E75" : score >= 50 ? "#D4A017" : score > 0 ? "#E53E3E" : "#CBD5E0";

          return (
            <div key={concept.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#1c2b3a", display: "flex", gap: 6, alignItems: "center" }}>
                  {concept.name}
                  {isDue && <span style={{ fontSize: 9, color: "#E53E3E", fontWeight: 700, background: "#FFF5F5", padding: "1px 5px", borderRadius: 8 }}>REVIEW</span>}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: barColor }}>{score > 0 ? `${Math.round(score)}%` : "Not started"}</span>
              </div>
              <div style={{ height: 5, background: "#EDF2F7", borderRadius: 999 }}>
                <div style={{ height: "100%", width: `${score}%`, background: barColor, borderRadius: 999, transition: "width 0.8s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      {dueCount > 0 && (
        <div style={{ padding: "12px 18px", borderTop: "1px solid #f0f0f0" }}>
          <a href="/review"
            style={{
              display: "block", textAlign: "center",
              padding: "10px", background: "#0E6163", color: "#fff",
              borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}>
            Review {dueCount} concept{dueCount !== 1 ? "s" : ""} due today →
          </a>
        </div>
      )}
    </div>
  );
}
