"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  duration_minutes: number;
  is_free: boolean;
  is_published: boolean;
  order_index?: number;
}

interface Level {
  id: string;
  title: string;
  slug: string;
  order_index: number;
  lessons: Lesson[];
}

interface Track {
  id: string;
  title: string;
  name?: string;
  slug: string;
  description: string;
  icon?: string;
  icon_emoji?: string;
  color_hex?: string;
}

const SLUG_ALIASES: Record<string, string> = {
  pf: "personal-finance",
  "personal-finance": "personal-finance",
  tm: "trading-markets",
  "trading-markets": "trading-markets",
  "stock-market": "trading-markets",
  trading: "trading-markets",
  cf: "corporate-finance",
  "corporate-finance": "corporate-finance",
  cr: "crypto-defi",
  "crypto-defi": "crypto-defi",
  crypto: "crypto-defi",
  bf: "behavioral-finance",
  "behavioral-finance": "behavioral-finance",
  ta: "technical-analysis",
  "technical-analysis": "technical-analysis",
  fx: "forex-currency",
  "forex-currency": "forex-currency",
  "forex-currencies": "forex-currency",
  hi: "hindi",
  hindi: "hindi",
  "hindi-finance": "hindi",
};

export default function TrackPage({ params }: { params: { slug: string } }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadTrackData() {
      const rawSlug = (params?.slug || "").toLowerCase().trim();
      const resolvedSlug = SLUG_ALIASES[rawSlug] || rawSlug;

      try {
        // Special case: Hindi track synthesis
        if (resolvedSlug === "hindi") {
          const { data: hLessons } = await supabase
            .from("lessons")
            .select("id, title, slug, duration_minutes, is_free, is_published, order_index")
            .eq("language", "hi")
            .eq("is_published", true)
            .order("order_index");

          if (!isMounted) return;

          const hindiTrack: Track = {
            id: "hindi-finance-track",
            title: "हिंदी Finance (Hindi Finance)",
            slug: "hindi",
            description: "Personal finance, tax, investing, and wealth building explained simply in Hindi. आसान भाषा में वित्तीय साक्षरता।",
            icon: "🇮🇳",
            color_hex: "#B91C1C",
          };

          const hindiLevel: Level = {
            id: "hindi-level-1",
            title: "हिंदी में वित्तीय साक्षरता (Hindi Lessons)",
            slug: "hindi-curriculum",
            order_index: 1,
            lessons: (hLessons as Lesson[]) || [],
          };

          setTrack(hindiTrack);
          setLevels([hindiLevel]);
          setExpanded([hindiLevel.id]);
          setLoading(false);
          return;
        }

        // Standard track query
        let { data: t } = await supabase
          .from("tracks")
          .select("*")
          .eq("slug", resolvedSlug)
          .maybeSingle();

        // Fallback: search by partial match or code
        if (!t) {
          const { data: fallbackTrack } = await supabase
            .from("tracks")
            .select("*")
            .ilike("slug", `%${resolvedSlug}%`)
            .limit(1)
            .maybeSingle();
          t = fallbackTrack;
        }

        if (!t) {
          if (isMounted) {
            setTrack(null);
            setLoading(false);
          }
          return;
        }

        const loadedTrack: Track = {
          ...t,
          title: t.title || t.name || "Track",
          icon: t.icon || t.icon_emoji || "📚",
          color_hex: t.color_hex || "#0E6163",
        };

        const { data: lvls, error: lvlErr } = await supabase
          .from("levels")
          .select("id, title, slug, order_index, lessons(id, title, slug, duration_minutes, is_free, is_published, order_index)")
          .eq("track_id", t.id)
          .order("order_index");

        if (lvlErr) {
          console.error("Levels query error:", lvlErr);
        }

        const formattedLevels: Level[] = (lvls || []).map((lv: any) => ({
          id: lv.id,
          title: lv.title || lv.name || "Level",
          slug: lv.slug,
          order_index: lv.order_index || 0,
          lessons: (lv.lessons || [])
            .filter((l: any) => l && (l.is_published === undefined || l.is_published === true))
            .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)),
        }));

        if (!isMounted) return;

        setTrack(loadedTrack);
        setLevels(formattedLevels);
        if (formattedLevels.length > 0) {
          setExpanded([formattedLevels[0].id]);
        }
      } catch (err) {
        console.error("Error loading track details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTrackData();

    return () => {
      isMounted = false;
    };
  }, [params.slug]);

  if (loading) {
    return (
      <div style={{ maxWidth: 860, margin: "60px auto", padding: "0 20px", fontFamily: "var(--font-ui,system-ui)" }}>
        <div style={{ height: 160, background: "#f1f5f9", borderRadius: 16, animation: "pulse 1.5s infinite", marginBottom: 24 }} />
        <div style={{ height: 80, background: "#f8fafc", borderRadius: 12, marginBottom: 12 }} />
        <div style={{ height: 80, background: "#f8fafc", borderRadius: 12, marginBottom: 12 }} />
      </div>
    );
  }

  if (!track) {
    return (
      <div style={{ maxWidth: 640, margin: "80px auto", padding: "40px 24px", textAlign: "center", background: "#fff", borderRadius: 18, border: "1px solid #e2e8f0", fontFamily: "var(--font-ui,system-ui)" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1c2b3a", margin: "0 0 10px" }}>Track not found</h1>
        <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6, margin: "0 0 24px" }}>
          We couldn&apos;t find the track you were looking for. It might have been updated or renamed.
        </p>
        <Link
          href="/explore"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            background: "#0E6163",
            color: "#fff",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Browse All Tracks in Explore →
        </Link>
      </div>
    );
  }

  const totalLessons = levels.reduce((s, lv) => s + lv.lessons.length, 0);
  const color = track.color_hex || "#0E6163";
  const firstLesson = levels[0]?.lessons[0];
  const startHref = firstLesson ? `/learn/${firstLesson.slug || firstLesson.id}` : "/explore";

  return (
    <div style={{ fontFamily: "var(--font-ui,system-ui)", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Top Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 20px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
          <Link href="/explore" style={{ color: "#0E6163", textDecoration: "none", fontWeight: 600 }}>
            Explore
          </Link>
          <span>/</span>
          <span style={{ color: "#1e293b", fontWeight: 700 }}>{track.title}</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)`, borderBottom: "1px solid #e2e8f0", padding: "48px 20px 40px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>{track.icon || "📚"}</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", margin: "0 0 10px", letterSpacing: "-0.5px" }}>
            {track.title}
          </h1>
          <p style={{ fontSize: 16, color: "#475569", maxWidth: 640, lineHeight: 1.7, margin: "0 0 20px" }}>
            {track.description}
          </p>

          <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#64748b", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ background: "#fff", padding: "4px 12px", borderRadius: 20, border: "1px solid #e2e8f0", fontWeight: 600 }}>
              📖 {totalLessons} lessons
            </span>
            <span style={{ background: "#fff", padding: "4px 12px", borderRadius: 20, border: "1px solid #e2e8f0", fontWeight: 600 }}>
              🎓 {levels.length} levels
            </span>
            <span style={{ background: "#fff", padding: "4px 12px", borderRadius: 20, border: "1px solid #e2e8f0", fontWeight: 600, color: "#16a34a" }}>
              ✓ 100% Free to Start
            </span>
          </div>

          <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href={startHref}
              style={{
                display: "inline-block",
                padding: "12px 26px",
                background: color,
                color: "#fff",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: `0 4px 12px ${color}35`,
              }}
            >
              Start First Lesson →
            </Link>
            <Link
              href="/explore"
              style={{
                display: "inline-block",
                padding: "12px 20px",
                background: "#fff",
                color: "#475569",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                border: "1px solid #cbd5e1",
              }}
            >
              All Tracks
            </Link>
          </div>
        </div>
      </div>

      {/* Levels & Lessons Accordion */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 20px 80px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 18 }}>
          Curriculum Syllabus
        </h2>

        {levels.length === 0 ? (
          <div style={{ background: "#fff", padding: "28px", borderRadius: 14, border: "1px solid #e2e8f0", textAlign: "center", color: "#64748b" }}>
            Lessons for this track are being published. Check back shortly!
          </div>
        ) : (
          levels.map((lv, levelIdx) => {
            const isOpen = expanded.includes(lv.id);
            const published = lv.lessons;

            return (
              <div
                key={lv.id}
                style={{
                  marginBottom: 14,
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: isOpen ? "0 4px 12px rgba(0,0,0,0.03)" : "none",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((e) =>
                      isOpen ? e.filter((id) => id !== lv.id) : [...e, lv.id]
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "18px 22px",
                    background: isOpen ? `${color}08` : "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontFamily: "inherit",
                    textAlign: "left",
                    transition: "background 0.15s ease",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                      Level {levelIdx + 1}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                      {lv.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {published.length} lessons
                    </div>
                  </div>
                  <span
                    style={{
                      color: "#64748b",
                      fontSize: 16,
                      fontWeight: 700,
                      transform: isOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div>
                    {published.length === 0 ? (
                      <div style={{ padding: "18px 22px", fontSize: 13, color: "#94a3b8" }}>
                        Lessons coming soon.
                      </div>
                    ) : (
                      published.map((l, i) => (
                        <Link
                          key={l.id}
                          href={`/learn/${l.slug || l.id}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            padding: "13px 22px",
                            borderTop: "1px solid #f1f5f9",
                            textDecoration: "none",
                            background: "#fff",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                        >
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              background: "#f1f5f9",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#64748b",
                              flexShrink: 0,
                            }}
                          >
                            {i + 1}
                          </div>
                          <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                            {l.title}
                          </div>
                          <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#64748b", alignItems: "center" }}>
                            {l.is_free && (
                              <span style={{ color: "#16a34a", background: "#f0fdf4", padding: "2px 8px", borderRadius: 12, fontWeight: 700, fontSize: 11 }}>
                                Free
                              </span>
                            )}
                            <span>{l.duration_minutes || 7} min</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
