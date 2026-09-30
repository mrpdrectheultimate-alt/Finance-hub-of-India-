"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Explore Page
// app/explore/page.tsx
// Browse all tracks, levels, lessons with progress indicators
// ============================================================

type Track = {
  id:          string;
  name:        string;
  title?:      string;
  slug:        string;
  description: string;
  color_hex:   string;
  icon_emoji:  string;
  icon?:       string;
  is_featured: boolean;
  levels:      Level[];
};

type Level = {
  id:          string;
  name:        string;
  title?:      string;
  slug:        string;
  order_index: number;
  lessons:     LessonCard[];
};

type LessonCard = {
  id:               string;
  title:            string;
  slug:             string;
  duration_minutes: number;
  is_free:          boolean;
  language:         string;
  difficulty_score: number;
  completed?:       boolean;
};

const LANG_LABELS: Record<string, string> = {
  en: "🇬🇧 English",
  hi: "🇮🇳 हिंदी",
};

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "#1D9E75", 2: "#1D9E75", 3: "#38A169",
  4: "#38A169", 5: "#D4A017", 6: "#D4A017",
  7: "#E53E3E", 8: "#E53E3E", 9: "#B91C1C", 10: "#B91C1C",
};

export default function ExplorePage() {
  const [tracks,       setTracks]       = useState<Track[]>([]);
  const [search,       setSearch]       = useState("");
  const [langFilter,   setLangFilter]   = useState<"all" | "en" | "hi">("all");
  const [tierFilter,   setTierFilter]   = useState<"all" | "free" | "paid">("all");
  const [expanded,     setExpanded]     = useState<string[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading,      setLoading]      = useState(true);
  const [totalLessons, setTotalLessons] = useState(0);
  const [user,         setUser]         = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      // Fetch all tracks with levels and lessons (resilient schema mapping)
      const { data: tracksData, error } = await supabase
        .from("tracks")
        .select(`
          *,
          levels (
            *,
            lessons (*)
          )
        `)
        .order("order_index");

      if (error) {
        console.error("Error fetching explore tracks:", error);
      }

      if (tracksData) {
        const mapped: Track[] = tracksData.map((t: any) => ({
          ...t,
          name:        t.name || t.title || "Track",
          icon_emoji:  t.icon_emoji || t.icon || "📚",
          is_featured: t.is_featured || false,
          levels: (t.levels || [])
            .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
            .map((lv: any) => ({
              ...lv,
              name: lv.name || lv.title || "Level",
              lessons: (lv.lessons || [])
                .filter((l: any) => l !== null && (l.is_published === undefined || l.is_published === true))
                .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)),
            })),
        }));

        setTracks(mapped);
        // Expand first track by default
        if (mapped.length > 0) setExpanded([mapped[0].id]);

        setTotalLessons(mapped.reduce((s: number, t: Track) =>
          s + t.levels.reduce((ls, lv) => ls + lv.lessons.length, 0), 0
        ));
      }

      // Load completed lessons for logged-in user
      if (u) {
        const { data: prog } = await supabase
          .from("user_progress")
          .select("lesson_id")
          .eq("user_id", u.id)
          .or("completed.eq.true,quiz_score.gt.0");
        setCompletedIds(new Set((prog || []).map((p: any) => p.lesson_id)));
      }

      setLoading(false);
    })();
  }, []);

  // Filter lessons based on search, language, tier
  const filteredTracks = tracks.map(track => ({
    ...track,
    levels: track.levels.map(level => ({
      ...level,
      lessons: level.lessons.filter(lesson => {
        const matchSearch = !search || lesson.title.toLowerCase().includes(search.toLowerCase());
        const matchLang   = langFilter === "all" || lesson.language === langFilter;
        const matchTier   = tierFilter === "all" ||
          (tierFilter === "free" && lesson.is_free) ||
          (tierFilter === "paid" && !lesson.is_free);
        return matchSearch && matchLang && matchTier;
      }),
    })).filter(lv => lv.lessons.length > 0),
  })).filter(t => t.levels.length > 0);

  const toggleTrack = (trackId: string) => {
    setExpanded(prev =>
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
  };

  const expandAll = () => setExpanded(tracks.map(t => t.id));

  // Progress per track
  const trackProgress = (track: Track) => {
    const total = track.levels.reduce((s, lv) => s + lv.lessons.length, 0);
    const done  = track.levels.reduce((s, lv) =>
      s + lv.lessons.filter(l => completedIds.has(l.id)).length, 0);
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 80px", fontFamily: "var(--font-ui,system-ui)" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1c2b3a", margin: "0 0 8px", letterSpacing: "-0.4px" }}>
          Explore Courses
        </h1>
        <p style={{ fontSize: 14, color: "#718096", margin: 0 }}>
          {totalLessons}+ lessons across {tracks.length} tracks · Free to start · Hindi + English
        </p>
      </div>

      {/* Search + filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search lessons…"
            style={{
              width: "100%", padding: "9px 12px 9px 36px",
              border: "1px solid #e2e8f0", borderRadius: 9,
              fontSize: 14, fontFamily: "var(--font-ui,system-ui)",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Language filter */}
        {(["all", "en", "hi"] as const).map(lang => (
          <button key={lang} onClick={() => setLangFilter(lang)}
            style={{
              padding: "9px 14px", fontSize: 13,
              fontWeight: langFilter === lang ? 700 : 400,
              background: langFilter === lang ? "#1c2b3a" : "#fff",
              color: langFilter === lang ? "#fff" : "#718096",
              border: `1px solid ${langFilter === lang ? "#1c2b3a" : "#e2e8f0"}`,
              borderRadius: 9, cursor: "pointer",
              fontFamily: "var(--font-ui,system-ui)",
            }}>
            {lang === "all" ? "🌐 All" : LANG_LABELS[lang]}
          </button>
        ))}

        {/* Tier filter */}
        {(["all", "free", "paid"] as const).map(tier => (
          <button key={tier} onClick={() => setTierFilter(tier)}
            style={{
              padding: "9px 14px", fontSize: 13,
              fontWeight: tierFilter === tier ? 700 : 400,
              background: tierFilter === tier ? "#1D9E75" : "#fff",
              color: tierFilter === tier ? "#fff" : "#718096",
              border: `1px solid ${tierFilter === tier ? "#1D9E75" : "#e2e8f0"}`,
              borderRadius: 9, cursor: "pointer",
              fontFamily: "var(--font-ui,system-ui)",
            }}>
            {tier === "all" ? "All" : tier === "free" ? "🆓 Free" : "💎 Pro"}
          </button>
        ))}

        <button onClick={expandAll}
          style={{
            padding: "9px 14px", fontSize: 13, color: "#0E6163",
            background: "#f0f9f9", border: "1px solid #0E616330",
            borderRadius: 9, cursor: "pointer",
            fontFamily: "var(--font-ui,system-ui)", fontWeight: 600,
          }}>
          Expand All
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              height: 80, borderRadius: 14,
              background: "linear-gradient(90deg,#f5f5f5 25%,#ebebeb 50%,#f5f5f5 75%)",
              backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
            }} />
          ))}
        </div>
      ) : filteredTracks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1c2b3a", marginBottom: 8 }}>No lessons found</h3>
          <button onClick={() => { setSearch(""); setLangFilter("all"); setTierFilter("all"); }}
            style={{ color: "#0E6163", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "var(--font-ui,system-ui)" }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filteredTracks.map(track => {
            const isOpen = expanded.includes(track.id);
            const prog   = trackProgress(track);
            const color  = track.color_hex || "#0E6163";
            const totalInTrack = track.levels.reduce((s, lv) => s + lv.lessons.length, 0);

            return (
              <div key={track.id} style={{
                background:   "#fff",
                border:       `1px solid ${isOpen ? color : "#e2e8f0"}`,
                borderRadius: 16,
                overflow:     "hidden",
                transition:   "all 0.2s",
                boxShadow:    isOpen ? `0 4px 20px ${color}20` : "none",
              }}>
                {/* Track header */}
                <button
                  onClick={() => toggleTrack(track.id)}
                  style={{
                    width:     "100%",
                    padding:   "18px 20px",
                    background: isOpen ? `${color}08` : "transparent",
                    border:    "none",
                    cursor:    "pointer",
                    textAlign: "left",
                    fontFamily:"var(--font-ui,system-ui)",
                    display:   "flex",
                    gap:       14,
                    alignItems:"center",
                  }}>
                  {/* Icon */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: `${color}15`,
                    border: `2px solid ${color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24,
                  }}>
                    {track.icon_emoji || track.icon || "📚"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1c2b3a", margin: 0 }}>
                        {track.name || track.title}
                      </h2>
                      {track.is_featured && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#D4A017", background: "#FFFFF0", padding: "1px 7px", borderRadius: 10, border: "1px solid #FBD38D" }}>
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#718096", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {track.description}
                    </div>

                    {/* Progress bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 5, background: "#EDF2F7", borderRadius: 999 }}>
                        <div style={{
                          height: "100%", width: `${prog.pct}%`,
                          background: color, borderRadius: 999,
                          transition: "width 0.8s ease",
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#718096", flexShrink: 0 }}>
                        {user ? `${prog.done}/${totalInTrack}` : `${totalInTrack} lessons`}
                      </span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <div style={{
                    color: "#a0aec0", fontSize: 18, flexShrink: 0,
                    transition: "transform 0.2s",
                    transform: isOpen ? "rotate(180deg)" : "none",
                  }}>
                    ↓
                  </div>
                </button>

                {/* Expanded levels + lessons */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${color}20` }}>
                    {track.levels.map((level, li) => (
                      <div key={level.id} style={{ borderBottom: li < track.levels.length - 1 ? `1px solid #f0f0f0` : "none" }}>
                        {/* Level header */}
                        <div style={{
                          padding: "10px 20px",
                          background: "#fafafa",
                          display: "flex", justifyContent: "space-between",
                          alignItems: "center",
                        }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: ".07em" }}>
                            {level.name || level.title}
                          </span>
                          <span style={{ fontSize: 11, color: "#a0aec0" }}>
                            {level.lessons.length} lesson{level.lessons.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Lessons */}
                        {level.lessons.map((lesson, i) => {
                          const done = completedIds.has(lesson.id);
                          return (
                            <a key={lesson.id} href={`/learn/${lesson.slug}`}
                              style={{
                                display:      "flex",
                                alignItems:   "center",
                                gap:          12,
                                padding:      "11px 20px",
                                textDecoration: "none",
                                background:   done ? "#f0fff4" : "transparent",
                                borderBottom: i < level.lessons.length - 1 ? "1px solid #f5f5f5" : "none",
                                transition:   "background 0.15s",
                              }}>
                              {/* Status dot */}
                              <div style={{
                                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                                background: done ? "#1D9E75" : "#EDF2F7",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11,
                              }}>
                                {done ? "✓" : <span style={{ color: "#CBD5E0", fontSize: 10 }}>○</span>}
                              </div>

                              {/* Title */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: done ? 500 : 600, color: done ? "#2d7738" : "#1c2b3a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {lesson.title}
                                </div>
                              </div>

                              {/* Meta */}
                              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                                {lesson.language === "hi" && (
                                  <span style={{ fontSize: 10, color: "#B91C1C", fontWeight: 700 }}>हि</span>
                                )}
                                {lesson.is_free ? (
                                  <span style={{ fontSize: 10, fontWeight: 700, color: "#1D9E75", background: "#F0FFF4", padding: "1px 6px", borderRadius: 8 }}>Free</span>
                                ) : (
                                  <span style={{ fontSize: 10, fontWeight: 700, color: "#718096", background: "#F7FAFC", padding: "1px 6px", borderRadius: 8 }}>Pro</span>
                                )}
                                <span style={{ fontSize: 11, color: "#a0aec0" }}>
                                  {lesson.duration_minutes}m
                                </span>
                                {lesson.difficulty_score && (
                                  <div style={{
                                    width: 6, height: 6, borderRadius: "50%",
                                    background: DIFFICULTY_COLORS[lesson.difficulty_score] || "#CBD5E0",
                                    flexShrink: 0,
                                  }} />
                                )}
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    ))}

                    {/* Track CTA */}
                    <div style={{ padding: "14px 20px", background: `${color}06`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "#718096" }}>
                        {prog.pct === 100 ? "🏆 Track complete!" : `${prog.pct}% complete`}
                      </span>
                      <a href={`/tracks/${track.slug}`}
                        style={{
                          padding: "7px 14px", background: color, color: "#fff",
                          borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none",
                        }}>
                        {prog.done === 0 ? "Start Track →" : "Continue →"}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom CTA for non-logged in users */}
      {!user && !loading && (
        <div style={{
          marginTop: 32, background: "linear-gradient(135deg,#1c2b3a 0%,#0E6163 100%)",
          borderRadius: 16, padding: "24px", textAlign: "center",
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
            Track your progress across all lessons
          </h3>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "0 0 16px" }}>
            Sign up free to save progress, earn XP, and get a personalised learning path.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <a href="/signup" style={{
              padding: "10px 22px", background: "#1D9E75", color: "#fff",
              borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: "none",
            }}>
              Sign Up Free →
            </a>
            <a href="/login" style={{
              padding: "10px 22px", background: "rgba(255,255,255,0.1)",
              color: "#fff", borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              Log In
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
