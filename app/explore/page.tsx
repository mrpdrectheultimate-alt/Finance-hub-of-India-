"use client";

import { useState, useEffect, useMemo, type CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — World-Class Explore Courses Catalog
// app/explore/page.tsx
// Balanced Track Deck · Full-Width Curriculum Workspace · Zero Truncation · Progress Rings
// ============================================================

type Lesson = {
  id: string;
  level_id: string;
  title: string;
  slug: string;
  duration_minutes: number;
  is_free: boolean;
  language: string;
  difficulty_score: number;
  is_published?: boolean;
  order_index?: number;
};

type Level = {
  id: string;
  track_id: string;
  title: string;
  name?: string;
  slug: string;
  description?: string;
  order_index: number;
  lessons: Lesson[];
};

type Track = {
  id: string;
  slug: string;
  title: string;
  name?: string;
  description: string;
  icon: string;
  color_hex: string;
  order_index: number;
  levels: Level[];
};

const TRACK_ICONS: Record<string, string> = {
  "personal-finance": "🏠",
  "trading-markets": "📈",
  "stock-market": "📊",
  "crypto-defi": "₿",
  "corporate-finance": "🏢",
  "behavioral-finance": "🧠",
  "forex-currency": "💱",
  "technical-analysis": "📉",
};

const TRACK_THEMES: Record<string, { bg: string; text: string }> = {
  "personal-finance": { bg: "#ECFDF5", text: "#065F46" },
  "trading-markets": { bg: "#EFF6FF", text: "#1E40AF" },
  "crypto-defi": { bg: "#FAF5FF", text: "#6B21A8" },
  "corporate-finance": { bg: "#FEF2F2", text: "#991B1B" },
  "behavioral-finance": { bg: "#F5F3FF", text: "#5B21B6" },
  "forex-currency": { bg: "#F0F9FF", text: "#075985" },
  "technical-analysis": { bg: "#ECFEFF", text: "#155E75" },
};

export default function ExplorePage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>("all");
  const [langFilter, setLangFilter] = useState<"all" | "en" | "hi">("all");
  const [tierFilter, setTierFilter] = useState<"all" | "free" | "pro">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Active track being inspected in full-width curriculum workspace
  const [activeCurriculumTrackId, setActiveCurriculumTrackId] = useState<string | null>(null);
  
  // Accordion state for list view
  const [expandedListTracks, setExpandedListTracks] = useState<string[]>([]);
  
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);

  // 1. Fetch tracks, levels, lessons, and user progress from Supabase
  useEffect(() => {
    let mounted = true;

    async function loadExploreData() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (mounted) setUser(currentUser);

        // Fetch tracks with nested levels and lessons
        const { data: tracksData, error } = await supabase
          .from("tracks")
          .select(`
            id, slug, title, description, icon, color_hex, order_index,
            levels (
              id, track_id, title, slug, description, order_index,
              lessons (
                id, level_id, title, slug, duration_minutes, is_free, language, difficulty_score, is_published, order_index
              )
            )
          `)
          .order("order_index");

        if (error) {
          console.error("Error fetching explore tracks:", error);
        }

        if (tracksData && mounted) {
          // Normalize and filter out tracks with 0 lessons
          const validTracks: Track[] = tracksData
            .map((t: any) => {
              const sortedLevels: Level[] = (t.levels || [])
                .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
                .map((lv: any) => ({
                  ...lv,
                  title: lv.title || lv.name || "Curriculum Level",
                  lessons: (lv.lessons || [])
                    .filter((l: any) => l && (l.is_published === undefined || l.is_published === true))
                    .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)),
                }));

              return {
                id: t.id,
                slug: t.slug,
                title: t.title || t.name || "Learning Track",
                description: t.description || "Master essential financial strategies and concepts.",
                icon: TRACK_ICONS[t.slug] || t.icon || "📚",
                color_hex: t.color_hex || "#0E6163",
                order_index: t.order_index || 0,
                levels: sortedLevels,
              };
            })
            .filter((t: Track) => {
              const lessonCount = t.levels.reduce((sum: number, lv: Level) => sum + lv.lessons.length, 0);
              return lessonCount > 0;
            });

          setTracks(validTracks);

          // By default, select the first track for the curriculum focus
          if (validTracks.length > 0) {
            setActiveCurriculumTrackId(validTracks[0].id);
            setExpandedListTracks([validTracks[0].id]);
          }
        }

        // Fetch user's completed lessons
        if (currentUser && mounted) {
          const { data: prog } = await supabase
            .from("user_progress")
            .select("lesson_id")
            .eq("user_id", currentUser.id)
            .or("completed.eq.true,quiz_score.gt.0");

          if (prog && mounted) {
            setCompletedIds(new Set(prog.map((p: any) => p.lesson_id)));
          }
        }
      } catch (err) {
        console.error("Failed to load explore data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadExploreData();

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Computed Metrics
  const totalLessonsCount = useMemo(() => {
    return tracks.reduce((acc, t) => acc + t.levels.reduce((lsum, lv) => lsum + lv.lessons.length, 0), 0);
  }, [tracks]);

  const totalHindiLessonsCount = useMemo(() => {
    return tracks.reduce(
      (acc, t) =>
        acc +
        t.levels.reduce(
          (lsum, lv) => lsum + lv.lessons.filter((l) => l.language === "hi").length,
          0
        ),
      0
    );
  }, [tracks]);

  // 3. User progress across all tracks (for Continue Learning hero)
  const activeProgressTrack = useMemo(() => {
    if (!user || completedIds.size === 0) return null;
    let highestTrack: Track | null = null;
    let highestPct = 0;
    let completedInTrack = 0;
    let totalInTrack = 0;

    for (const t of tracks) {
      const total = t.levels.reduce((s, lv) => s + lv.lessons.length, 0);
      const done = t.levels.reduce((s, lv) => s + lv.lessons.filter((l) => completedIds.has(l.id)).length, 0);
      const pct = total > 0 ? (done / total) * 100 : 0;

      if (pct > 0 && pct < 100 && pct >= highestPct) {
        highestPct = pct;
        highestTrack = t;
        completedInTrack = done;
        totalInTrack = total;
      }
    }

    return highestTrack
      ? {
          track: highestTrack,
          pct: Math.round(highestPct),
          done: completedInTrack,
          total: totalInTrack,
        }
      : null;
  }, [user, completedIds, tracks]);

  // 4. Filtering logic
  const filteredTracks = useMemo(() => {
    return tracks
      .filter((t) => selectedTrackFilter === "all" || t.slug === selectedTrackFilter)
      .map((track) => ({
        ...track,
        levels: track.levels
          .map((level) => ({
            ...level,
            lessons: level.lessons.filter((lesson) => {
              const q = search.trim().toLowerCase();
              const matchSearch =
                !q ||
                lesson.title.toLowerCase().includes(q) ||
                track.title.toLowerCase().includes(q);
              const matchLang = langFilter === "all" || lesson.language === langFilter;
              const matchTier =
                tierFilter === "all" ||
                (tierFilter === "free" && lesson.is_free) ||
                (tierFilter === "pro" && !lesson.is_free);
              return matchSearch && matchLang && matchTier;
            }),
          }))
          .filter((lv) => lv.lessons.length > 0),
      }))
      .filter((t) => t.levels.length > 0);
  }, [tracks, selectedTrackFilter, search, langFilter, tierFilter]);

  // Track stats helper
  const getTrackStats = (track: Track) => {
    const total = track.levels.reduce((s, lv) => s + lv.lessons.length, 0);
    const done = track.levels.reduce(
      (s, lv) => s + lv.lessons.filter((l) => completedIds.has(l.id)).length,
      0
    );
    const approxHours = Math.max(1, Math.round((total * 12) / 60));
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, approxHours, pct };
  };

  // Currently focused track for the full-width curriculum workspace
  const focusedCurriculumTrack = useMemo(() => {
    if (!activeCurriculumTrackId) return null;
    return filteredTracks.find((t) => t.id === activeCurriculumTrackId) || null;
  }, [filteredTracks, activeCurriculumTrackId]);

  // Toggle for list view
  const toggleListTrack = (trackId: string) => {
    setExpandedListTracks((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  return (
    <div style={s.pageWrapper}>
      <div style={s.mainContainer}>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 1. HERO HEADER WITH SOCIAL PROOF & METRICS                 */}
        {/* ══════════════════════════════════════════════════════════ */}
        <header style={s.heroHeader}>
          <div style={s.heroTopPill}>
            <span style={{ fontSize: 13 }}>🎓</span>
            <span>FinanceHub Learning Curriculum</span>
          </div>
          <h1 style={s.heroTitle}>Explore Courses &amp; Learning Tracks</h1>
          <p style={s.heroSubtitle}>
            Build real financial mastery through structured, self-paced lessons. From foundational personal money management to algorithmic trading, corporate valuation, and macroeconomic policy.
          </p>

          {/* Quick Metrics Bar */}
          <div style={s.metricsBar}>
            <div style={s.metricItem}>
              <span style={s.metricIcon}>📚</span>
              <div>
                <strong style={s.metricValue}>{totalLessonsCount || 316}+</strong>
                <span style={s.metricLabel}>Published Lessons</span>
              </div>
            </div>
            <div style={s.metricDivider} />
            <div style={s.metricItem}>
              <span style={s.metricIcon}>🗺️</span>
              <div>
                <strong style={s.metricValue}>{tracks.length || 7}</strong>
                <span style={s.metricLabel}>Learning Tracks</span>
              </div>
            </div>
            <div style={s.metricDivider} />
            <div style={s.metricItem}>
              <span style={s.metricIcon}>🇮🇳</span>
              <div>
                <strong style={s.metricValue}>{totalHindiLessonsCount || 21}</strong>
                <span style={s.metricLabel}>हिंदी Lessons</span>
              </div>
            </div>
            <div style={s.metricDivider} />
            <div style={s.metricItem}>
              <span style={s.metricIcon}>⚡</span>
              <div>
                <strong style={s.metricValue}>100% Free</strong>
                <span style={s.metricLabel}>To Get Started</span>
              </div>
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 2. CONTINUE LEARNING HERO (Personalized for logged-in user)*/}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeProgressTrack && (
          <div style={s.continueLearningCard}>
            <div style={s.continueLeft}>
              <div style={s.continueIconWrap}>
                <span style={{ fontSize: 24 }}>⚡</span>
              </div>
              <div>
                <div style={s.continueSub}>CONTINUE YOUR JOURNEY</div>
                <h3 style={s.continueTitle}>{activeProgressTrack.track.title}</h3>
                <div style={s.continueProgressWrap}>
                  <div style={s.continueProgressBarBg}>
                    <div
                      style={{
                        ...s.continueProgressBarFill,
                        width: `${activeProgressTrack.pct}%`,
                        background: activeProgressTrack.track.color_hex,
                      }}
                    />
                  </div>
                  <span style={s.continuePctText}>
                    {activeProgressTrack.pct}% ({activeProgressTrack.done}/{activeProgressTrack.total} lessons)
                  </span>
                </div>
              </div>
            </div>
            <Link
              href={`/tracks/${activeProgressTrack.track.slug}`}
              style={{
                ...s.continueBtn,
                background: activeProgressTrack.track.color_hex,
              }}
            >
              Resume Track →
            </Link>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 3. DISCOVERY TOOLBAR (Search, Filters, View Modes)         */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div style={s.toolbarCard}>
          <div style={s.toolbarPrimaryRow}>
            {/* Live Search */}
            <div style={s.searchWrap}>
              <svg
                style={s.searchIcon}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#64748B"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by topic, lesson title, or keyword (e.g. SIP, Candlesticks, Tax)..."
                style={s.searchInput}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  style={s.searchClearBtn}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Toggle: Grid vs List */}
            <div style={s.viewToggleWrap}>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                style={{
                  ...s.viewBtn,
                  background: viewMode === "grid" ? "#0F3D3E" : "transparent",
                  color: viewMode === "grid" ? "#FFFFFF" : "#64748B",
                  fontWeight: viewMode === "grid" ? 700 : 500,
                }}
                title="Card Grid View"
              >
                <span>⊞</span> Grid View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                style={{
                  ...s.viewBtn,
                  background: viewMode === "list" ? "#0F3D3E" : "transparent",
                  color: viewMode === "list" ? "#FFFFFF" : "#64748B",
                  fontWeight: viewMode === "list" ? 700 : 500,
                }}
                title="Curriculum List View"
              >
                <span>☰</span> Curriculum List
              </button>
            </div>
          </div>

          {/* Filter Pills Row */}
          <div style={s.filterRow}>
            {/* Track Select */}
            <div style={s.filterGroup}>
              <label style={s.filterLabel}>Track:</label>
              <select
                value={selectedTrackFilter}
                onChange={(e) => {
                  setSelectedTrackFilter(e.target.value);
                  if (e.target.value !== "all") {
                    const target = tracks.find((t) => t.slug === e.target.value);
                    if (target) setActiveCurriculumTrackId(target.id);
                  }
                }}
                style={s.selectInput}
              >
                <option value="all">All Tracks ({tracks.length})</option>
                {tracks.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div style={s.filterGroup}>
              <label style={s.filterLabel}>Language:</label>
              <div style={s.pillButtonGroup}>
                {(["all", "en", "hi"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLangFilter(lang)}
                    style={{
                      ...s.filterPill,
                      background: langFilter === lang ? "#0F172A" : "#FFFFFF",
                      color: langFilter === lang ? "#FFFFFF" : "#475569",
                      borderColor: langFilter === lang ? "#0F172A" : "#CBD5E1",
                    }}
                  >
                    {lang === "all" ? "All" : lang === "en" ? "🇬🇧 English" : "🇮🇳 हिंदी"}
                  </button>
                ))}
              </div>
            </div>

            {/* Access Tier Filter */}
            <div style={s.filterGroup}>
              <label style={s.filterLabel}>Access:</label>
              <div style={s.pillButtonGroup}>
                {(["all", "free", "pro"] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setTierFilter(tier)}
                    style={{
                      ...s.filterPill,
                      background: tierFilter === tier ? "#0F3D3E" : "#FFFFFF",
                      color: tierFilter === tier ? "#FFFFFF" : "#475569",
                      borderColor: tierFilter === tier ? "#0F3D3E" : "#CBD5E1",
                    }}
                  >
                    {tier === "all" ? "All" : tier === "free" ? "Free Only" : "💎 Pro"}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Count summary */}
            <div style={{ marginLeft: "auto", fontSize: 12.5, color: "#64748B" }}>
              Showing <strong>{filteredTracks.length}</strong> active tracks
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 4. CONTENT AREA: TRACK DECK & CURRICULUM WORKSPACE        */}
        {/* ══════════════════════════════════════════════════════════ */}
        {loading ? (
          <div style={s.skeletonGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={s.skeletonCard} />
            ))}
          </div>
        ) : filteredTracks.length === 0 ? (
          <div style={s.noResultsCard}>
            <span style={{ fontSize: 44, marginBottom: 12 }}>🔍</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
              No lessons match your criteria
            </h3>
            <p style={{ fontSize: 13.5, color: "#64748B", margin: "0 0 16px" }}>
              Try adjusting your search query, language filter, or selecting "All Tracks".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedTrackFilter("all");
                setLangFilter("all");
                setTierFilter("all");
              }}
              style={s.resetFiltersBtn}
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* ══════════════════════════════════════════════════════════ */
          /* MODE A: EQUAL-HEIGHT TRACK DECK + FULL-WIDTH CURRICULUM   */
          /* ══════════════════════════════════════════════════════════ */
          <div>
            {/* Section Header */}
            <div style={s.sectionHeaderRow}>
              <div>
                <h2 style={s.sectionTitle}>All Learning Tracks</h2>
                <p style={s.sectionSub}>Select any track to inspect its full curriculum in the workspace below</p>
              </div>
              <span style={s.sectionCountBadge}>{filteredTracks.length} Specializations</span>
            </div>

            {/* ── Balanced Track Deck (Equal Height Cards, No Voids!) ── */}
            <div style={s.tracksDeckGrid}>
              {filteredTracks.map((track) => {
                const stats = getTrackStats(track);
                const isFocused = activeCurriculumTrackId === track.id;
                const theme = TRACK_THEMES[track.slug] || { bg: "#F1F5F9", text: "#334155" };

                return (
                  <div
                    key={track.id}
                    onClick={() => setActiveCurriculumTrackId(track.id)}
                    style={{
                      ...s.trackDeckCard,
                      borderColor: isFocused ? track.color_hex : "#E2E8F0",
                      boxShadow: isFocused ? `0 8px 24px ${track.color_hex}20` : "0 2px 6px rgba(0,0,0,0.02)",
                      transform: isFocused ? "translateY(-2px)" : "none",
                    }}
                  >
                    {/* Top Accent Strip */}
                    <div style={{ height: 4, background: track.color_hex }} />

                    <div style={s.trackDeckCardBody}>
                      {/* Top Header: Icon + Progress Ring */}
                      <div style={s.deckTopRow}>
                        <div
                          style={{
                            ...s.deckIconBubble,
                            background: `${track.color_hex}15`,
                            borderColor: `${track.color_hex}30`,
                          }}
                        >
                          <span style={{ fontSize: 24 }}>{track.icon}</span>
                        </div>

                        {/* Circular SVG Progress Ring */}
                        <ProgressRing percent={stats.pct} color={track.color_hex} />
                      </div>

                      {/* Title + Meta */}
                      <div style={s.deckMetaRow}>
                        <span style={{ ...s.deckCategoryTag, background: theme.bg, color: theme.text }}>
                          {stats.total} Lessons
                        </span>
                        <span style={s.deckTimeTag}>~{stats.approxHours} hrs</span>
                      </div>

                      <h3 style={s.deckTitle}>{track.title}</h3>
                      <p style={s.deckDesc}>{track.description}</p>

                      {/* Level Badges */}
                      <div style={s.deckLevelChips}>
                        {track.levels.map((lv) => (
                          <span key={lv.id} style={s.deckLevelChip}>
                            {lv.title} ({lv.lessons.length})
                          </span>
                        ))}
                      </div>

                      {/* Action Bar */}
                      <div style={s.deckActionRow}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCurriculumTrackId(isFocused ? null : track.id);
                          }}
                          style={{
                            ...s.deckCurriculumBtn,
                            background: isFocused ? track.color_hex : "#F8FAFC",
                            color: isFocused ? "#FFFFFF" : "#334155",
                            borderColor: isFocused ? track.color_hex : "#CBD5E1",
                          }}
                        >
                          {isFocused ? "▲ Active Curriculum" : "▼ Explore Lessons"}
                        </button>

                        <Link
                          href={`/tracks/${track.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          style={s.deckTrackLink}
                          title="Open dedicated track page"
                        >
                          →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Full-Width Active Curriculum Workspace (Zero Truncation!) ── */}
            {focusedCurriculumTrack && (
              <div style={s.fullWidthWorkspace}>
                <div style={s.workspaceHeader}>
                  <div style={s.workspaceHeaderLeft}>
                    <div
                      style={{
                        ...s.workspaceIconBubble,
                        background: `${focusedCurriculumTrack.color_hex}15`,
                        borderColor: `${focusedCurriculumTrack.color_hex}30`,
                      }}
                    >
                      <span style={{ fontSize: 28 }}>{focusedCurriculumTrack.icon}</span>
                    </div>
                    <div>
                      <div style={s.workspaceTagRow}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: `${focusedCurriculumTrack.color_hex}15`,
                            color: focusedCurriculumTrack.color_hex,
                            letterSpacing: "0.04em",
                          }}
                        >
                          ACTIVE CURRICULUM
                        </span>
                        <span style={{ fontSize: 13, color: "#64748B" }}>
                          {getTrackStats(focusedCurriculumTrack).total} Lessons across{" "}
                          {focusedCurriculumTrack.levels.length} Structured Levels
                        </span>
                      </div>
                      <h2 style={s.workspaceTitle}>{focusedCurriculumTrack.title}</h2>
                      <p style={s.workspaceDesc}>{focusedCurriculumTrack.description}</p>
                    </div>
                  </div>

                  <div style={s.workspaceHeaderRight}>
                    <Link
                      href={`/tracks/${focusedCurriculumTrack.slug}`}
                      style={{
                        ...s.workspaceTrackBtn,
                        background: focusedCurriculumTrack.color_hex,
                      }}
                    >
                      Launch Dedicated Track →
                    </Link>
                  </div>
                </div>

                {/* Untruncated Full-Width Curriculum Levels */}
                <div style={s.workspaceBody}>
                  <TrackCurriculumSection
                    track={focusedCurriculumTrack}
                    completedIds={completedIds}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════ */
          /* MODE B: COMPREHENSIVE FULL-WIDTH CURRICULUM LIST          */
          /* ══════════════════════════════════════════════════════════ */
          <div style={s.waterfallList}>
            {filteredTracks.map((track) => {
              const stats = getTrackStats(track);
              const isOpen = expandedListTracks.includes(track.id);

              return (
                <div
                  key={track.id}
                  style={{
                    ...s.waterfallTrackCard,
                    borderColor: isOpen ? track.color_hex : "#E2E8F0",
                  }}
                >
                  {/* Track Header Accordion Bar */}
                  <button
                    type="button"
                    onClick={() => toggleListTrack(track.id)}
                    style={{
                      ...s.waterfallHeaderBtn,
                      background: isOpen ? "#FAFAFA" : "#FFFFFF",
                    }}
                  >
                    <div
                      style={{
                        ...s.waterfallIconWrap,
                        background: `${track.color_hex}15`,
                        borderColor: `${track.color_hex}30`,
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{track.icon}</span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 3 }}>
                        <h2 style={s.waterfallTrackTitle}>{track.title}</h2>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: `${track.color_hex}15`,
                            color: track.color_hex,
                          }}
                        >
                          {stats.total} Lessons
                        </span>
                        {stats.pct > 0 && (
                          <span style={s.userProgressTag}>{stats.pct}% Complete</span>
                        )}
                      </div>
                      <p style={s.waterfallTrackDesc}>{track.description}</p>
                    </div>

                    {/* Progress Ring & Chevron */}
                    <div style={s.waterfallRightControls}>
                      <ProgressRing percent={stats.pct} color={track.color_hex} />
                      <span
                        style={{
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                          fontSize: 14,
                          color: "#64748B",
                          display: "inline-block",
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Expanded Lessons Table */}
                  {isOpen && (
                    <div style={s.waterfallCurriculumBody}>
                      <TrackCurriculumSection
                        track={track}
                        completedIds={completedIds}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 5. BOTTOM EDUCATIONAL CERTIFICATION & SIGNUP CTA           */}
        {/* ══════════════════════════════════════════════════════════ */}
        {!user && !loading && (
          <section style={s.ctaBanner}>
            <div style={s.ctaContent}>
              <div style={s.ctaBadge}>🏆 SAVE YOUR PROGRESS &amp; EARN BADGES</div>
              <h2 style={s.ctaTitle}>Start Your Financial Education Journey Today</h2>
              <p style={s.ctaSubtitle}>
                Create a free account to track your completed lessons, practice in virtual simulators, earn verifiable course certificates, and test your knowledge with AI exams.
              </p>
              <div style={s.ctaButtonGroup}>
                <Link href="/signup" style={s.ctaPrimaryBtn}>
                  Create Free Account →
                </Link>
                <Link href="/login" style={s.ctaSecondaryBtn}>
                  Log In to Existing Account
                </Link>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SUB-COMPONENT: FULL-WIDTH UNTRUNCATED CURRICULUM SECTION
// Generous horizontal space ($800px+) so titles NEVER truncate
// ────────────────────────────────────────────────────────────

function TrackCurriculumSection({
  track,
  completedIds,
}: {
  track: Track;
  completedIds: Set<string>;
}) {
  return (
    <div style={s.curriculumContainer}>
      {track.levels.map((level, levelIdx) => {
        const levelCompleted = level.lessons.filter((l) => completedIds.has(l.id)).length;

        return (
          <div key={level.id} style={s.levelSection}>
            {/* Level Section Header */}
            <div style={s.levelHeader}>
              <div style={s.levelHeaderLeft}>
                <span style={s.levelNumberBadge}>LEVEL 0{levelIdx + 1}</span>
                <h3 style={s.levelTitle}>{level.title}</h3>
                {level.description && (
                  <span style={s.levelDescMuted}>— {level.description}</span>
                )}
              </div>
              <span style={s.levelCountBadge}>
                {levelCompleted}/{level.lessons.length} completed
              </span>
            </div>

            {/* Individual Lesson Cards: Full width, no truncation */}
            <div style={s.lessonsList}>
              {level.lessons.map((lesson, lessonIdx) => {
                const isCompleted = completedIds.has(lesson.id);

                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/${lesson.slug}`}
                    style={{
                      ...s.lessonCard,
                      background: isCompleted ? "#F0FDF4" : "#FFFFFF",
                      borderColor: isCompleted ? "#BBF7D0" : "#E2E8F0",
                    }}
                  >
                    {/* Completion Icon or Sequence Number */}
                    <div
                      style={{
                        ...s.lessonStatusIcon,
                        background: isCompleted ? "#10B981" : "#F1F5F9",
                        color: isCompleted ? "#FFFFFF" : "#64748B",
                      }}
                    >
                      {isCompleted ? "✓" : lessonIdx + 1}
                    </div>

                    {/* Full Untruncated Lesson Title */}
                    <div style={s.lessonTitleWrap}>
                      <span
                        style={{
                          ...s.lessonTitle,
                          color: isCompleted ? "#065F46" : "#0F172A",
                        }}
                      >
                        {lesson.title}
                      </span>
                    </div>

                    {/* Metadata Badges */}
                    <div style={s.lessonMetaGroup}>
                      {/* Hindi Language Tag */}
                      {lesson.language === "hi" && (
                        <span style={s.hindiBadge}>🇮🇳 हिंदी</span>
                      )}

                      {/* Free vs Pro Tag */}
                      {lesson.is_free ? (
                        <span style={s.freeBadge}>FREE</span>
                      ) : (
                        <span style={s.proBadge}>PRO</span>
                      )}

                      {/* Duration */}
                      <span style={s.durationBadge}>
                        ⏱ {lesson.duration_minutes || 10}m
                      </span>

                      {/* Navigation Arrow */}
                      <span style={s.lessonArrow}>→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Footer Track Launcher */}
      <div style={s.curriculumFooter}>
        <span style={{ fontSize: 13, color: "#64748B" }}>
          Full curriculum for <strong>{track.title}</strong>
        </span>
        <Link
          href={`/tracks/${track.slug}`}
          style={{
            ...s.curriculumFullLink,
            color: track.color_hex,
          }}
        >
          Open Dedicated Track Page →
        </Link>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SUB-COMPONENT: CIRCULAR SVG PROGRESS RING
// Visual completion indicator for each track header
// ────────────────────────────────────────────────────────────

function ProgressRing({ percent, color }: { percent: number; color: string }) {
  const size = 46;
  const strokeWidth = 4.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 800,
          color: "#0F172A",
        }}
      >
        {percent}%
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// DESIGN TOKENS & STYLES
// Built for eye comfort, balanced visual boundaries, and responsive rhythm
// ────────────────────────────────────────────────────────────

const s: Record<string, CSSProperties> = {
  pageWrapper: {
    minHeight: "100vh",
    background: "#F8FAFC",
    fontFamily: "var(--font-ui, system-ui, -apple-system, sans-serif)",
    color: "#0F172A",
  },
  mainContainer: {
    maxWidth: 1240,
    margin: "0 auto",
    padding: "36px 24px 80px",
  },

  /* HERO HEADER */
  heroHeader: {
    marginBottom: 28,
  },
  heroTopPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    background: "#E6F3F3",
    border: "1px solid #B8E2E3",
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 700,
    color: "#0E6163",
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: "clamp(1.85rem, 3.2vw, 2.4rem)",
    fontWeight: 800,
    color: "#0F172A",
    margin: "0 0 10px",
    letterSpacing: "-0.025em",
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#475569",
    maxWidth: 820,
    margin: "0 0 20px",
    lineHeight: 1.6,
  },
  metricsBar: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: "12px 20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    flexWrap: "wrap",
  },
  metricItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  metricIcon: {
    fontSize: 20,
  },
  metricValue: {
    display: "block",
    fontSize: 15,
    fontWeight: 800,
    color: "#0F172A",
    lineHeight: 1.2,
  },
  metricLabel: {
    fontSize: 11.5,
    color: "#64748B",
  },
  metricDivider: {
    width: 1,
    height: 28,
    background: "#E2E8F0",
  },

  /* CONTINUE LEARNING CARD */
  continueLearningCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FFFFFF",
    border: "1px solid #A7F3D0",
    borderRadius: 14,
    padding: "18px 24px",
    marginBottom: 24,
    boxShadow: "0 2px 10px rgba(16, 185, 129, 0.08)",
    flexWrap: "wrap",
    gap: 16,
  },
  continueLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flex: 1,
    minWidth: 260,
  },
  continueIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  continueSub: {
    fontSize: 10.5,
    fontWeight: 800,
    color: "#059669",
    letterSpacing: "0.08em",
    marginBottom: 2,
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: 750,
    color: "#0F172A",
    margin: "0 0 6px",
  },
  continueProgressWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  continueProgressBarBg: {
    width: 140,
    height: 7,
    borderRadius: 999,
    background: "#E2E8F0",
    overflow: "hidden",
  },
  continueProgressBarFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.4s ease",
  },
  continuePctText: {
    fontSize: 12,
    fontWeight: 600,
    color: "#475569",
  },
  continueBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 18px",
    borderRadius: 9,
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },

  /* TOOLBAR CARD */
  toolbarCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 14,
    padding: "16px 20px",
    marginBottom: 28,
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  toolbarPrimaryRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  searchWrap: {
    position: "relative",
    flex: 1,
    minWidth: 280,
  },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "10px 36px 10px 42px",
    fontSize: 14,
    fontFamily: "inherit",
    borderRadius: 10,
    border: "1px solid #CBD5E1",
    background: "#F8FAFC",
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease",
  },
  searchClearBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "#E2E8F0",
    border: "none",
    borderRadius: "50%",
    width: 20,
    height: 20,
    fontSize: 11,
    fontWeight: 700,
    color: "#64748B",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  viewToggleWrap: {
    display: "flex",
    background: "#F1F5F9",
    border: "1px solid #E2E8F0",
    borderRadius: 9,
    padding: 3,
  },
  viewBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    fontSize: 12.5,
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    borderTop: "1px solid #F1F5F9",
    paddingTop: 12,
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  filterLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "#64748B",
  },
  selectInput: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    fontSize: 13,
    background: "#FFFFFF",
    color: "#1E293B",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  pillButtonGroup: {
    display: "flex",
    gap: 4,
  },
  filterPill: {
    padding: "5px 10px",
    borderRadius: 7,
    border: "1px solid",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },

  /* SECTION HEADERS */
  sectionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0F172A",
    margin: "0 0 3px",
    letterSpacing: "-0.015em",
  },
  sectionSub: {
    fontSize: 13,
    color: "#64748B",
    margin: 0,
  },
  sectionCountBadge: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "#475569",
    background: "#E2E8F0",
    padding: "3px 10px",
    borderRadius: 9999,
  },

  /* ─── GRID VIEW: BALANCED TRACK DECK (EQUAL HEIGHT) ─── */
  tracksDeckGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: 20,
    marginBottom: 32,
  },
  trackDeckCard: {
    background: "#FFFFFF",
    border: "1px solid",
    borderRadius: 16,
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
  },
  trackDeckCardBody: {
    padding: "20px 22px 22px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  deckTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  deckIconBubble: {
    width: 48,
    height: 48,
    borderRadius: 12,
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deckMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  deckCategoryTag: {
    fontSize: 11,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 6,
  },
  deckTimeTag: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: 500,
  },
  deckTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: "#0F172A",
    margin: "0 0 6px",
    letterSpacing: "-0.015em",
  },
  deckDesc: {
    fontSize: 12.5,
    color: "#64748B",
    lineHeight: 1.5,
    margin: "0 0 14px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    flex: 1,
  },
  deckLevelChips: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  deckLevelChip: {
    fontSize: 10.5,
    fontWeight: 600,
    color: "#475569",
    background: "#F1F5F9",
    padding: "2px 7px",
    borderRadius: 5,
  },
  deckActionRow: {
    display: "flex",
    gap: 8,
    marginTop: "auto",
  },
  deckCurriculumBtn: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "center",
    transition: "all 0.15s ease",
  },
  deckTrackLink: {
    width: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    background: "#F1F5F9",
    color: "#334155",
    fontSize: 15,
    fontWeight: 700,
    textDecoration: "none",
    transition: "background 0.15s ease",
  },

  /* ─── FULL-WIDTH CURRICULUM WORKSPACE (ZERO TRUNCATION) ─── */
  fullWidthWorkspace: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
    marginBottom: 40,
  },
  workspaceHeader: {
    padding: "24px 28px 20px",
    borderBottom: "1px solid #E2E8F0",
    background: "#F8FAFC",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  workspaceHeaderLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    flex: 1,
    minWidth: 300,
  },
  workspaceIconBubble: {
    width: 58,
    height: 58,
    borderRadius: 16,
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  workspaceTagRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  workspaceTitle: {
    fontSize: "clamp(1.4rem, 2.2vw, 1.75rem)",
    fontWeight: 800,
    color: "#0F172A",
    margin: "0 0 4px",
    letterSpacing: "-0.02em",
  },
  workspaceDesc: {
    fontSize: 13.5,
    color: "#475569",
    margin: 0,
    maxWidth: 720,
    lineHeight: 1.5,
  },
  workspaceHeaderRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  workspaceTrackBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 18px",
    borderRadius: 9,
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: 750,
    textDecoration: "none",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  workspaceBody: {
    padding: "20px 28px 28px",
  },

  /* ─── CURRICULUM LEVEL SECTIONS & LESSON CARDS ─── */
  curriculumContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  levelSection: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  levelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#F1F5F9",
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    padding: "10px 16px",
  },
  levelHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  levelNumberBadge: {
    fontSize: 10.5,
    fontWeight: 800,
    color: "#475569",
    background: "#E2E8F0",
    padding: "3px 7px",
    borderRadius: 5,
    letterSpacing: "0.06em",
  },
  levelTitle: {
    fontSize: 14,
    fontWeight: 750,
    color: "#0F172A",
    margin: 0,
  },
  levelDescMuted: {
    fontSize: 12.5,
    color: "#64748B",
  },
  levelCountBadge: {
    fontSize: 11.5,
    fontWeight: 600,
    color: "#64748B",
  },
  lessonsList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  lessonCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "12px 18px",
    borderRadius: 10,
    border: "1px solid",
    textDecoration: "none",
    transition: "transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease",
  },
  lessonStatusIcon: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    fontSize: 11,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  lessonTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: 650,
    display: "block",
    lineHeight: 1.45,
  },
  lessonMetaGroup: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  hindiBadge: {
    fontSize: 11,
    fontWeight: 750,
    color: "#EA580C",
    background: "#FFF7ED",
    border: "1px solid #FFEDD5",
    padding: "2px 7px",
    borderRadius: 6,
  },
  freeBadge: {
    fontSize: 10.5,
    fontWeight: 800,
    color: "#059669",
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    padding: "2px 7px",
    borderRadius: 6,
    letterSpacing: "0.04em",
  },
  proBadge: {
    fontSize: 10.5,
    fontWeight: 800,
    color: "#D97706",
    background: "#FEF3C7",
    border: "1px solid #FDE68A",
    padding: "2px 7px",
    borderRadius: 6,
    letterSpacing: "0.04em",
  },
  durationBadge: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: 500,
    fontFamily: "monospace",
  },
  lessonArrow: {
    fontSize: 14,
    color: "#94A3B8",
  },
  curriculumFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    background: "#F8FAFC",
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    marginTop: 8,
  },
  curriculumFullLink: {
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
  },

  /* ─── LIST VIEW: WATERFALL CARDS ─── */
  waterfallList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  waterfallTrackCard: {
    background: "#FFFFFF",
    border: "1px solid",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
    transition: "all 0.15s ease",
  },
  waterfallHeaderBtn: {
    width: "100%",
    padding: "18px 24px",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 16,
    transition: "background 0.15s ease",
  },
  waterfallIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  waterfallTrackTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: "#0F172A",
    margin: 0,
    letterSpacing: "-0.01em",
  },
  userProgressTag: {
    fontSize: 11,
    fontWeight: 700,
    color: "#059669",
    background: "#ECFDF5",
    padding: "2px 8px",
    borderRadius: 999,
  },
  waterfallTrackDesc: {
    fontSize: 13,
    color: "#64748B",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  waterfallRightControls: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flexShrink: 0,
  },
  waterfallCurriculumBody: {
    padding: "0 24px 24px",
    borderTop: "1px solid #F1F5F9",
  },

  /* ─── SKELETONS & EMPTY STATES ─── */
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: 20,
  },
  skeletonCard: {
    height: 250,
    borderRadius: 16,
    background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)",
    backgroundSize: "200% 100%",
  },
  noResultsCard: {
    background: "#FFFFFF",
    borderRadius: 14,
    border: "1px solid #E2E8F0",
    padding: "60px 20px",
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  resetFiltersBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    background: "#0F3D3E",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  /* ─── BOTTOM SIGNUP CTA BANNER ─── */
  ctaBanner: {
    marginTop: 48,
    borderRadius: 18,
    background: "linear-gradient(135deg, #0A1628 0%, #0D282F 60%, #0F3D3E 100%)",
    padding: "36px 32px",
    color: "#FFFFFF",
    boxShadow: "0 8px 32px rgba(10, 22, 40, 0.2)",
    textAlign: "center",
  },
  ctaContent: {
    maxWidth: 720,
    margin: "0 auto",
  },
  ctaBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 800,
    color: "#34D399",
    background: "rgba(52, 211, 153, 0.12)",
    border: "1px solid rgba(52, 211, 153, 0.3)",
    padding: "4px 12px",
    borderRadius: 999,
    letterSpacing: "0.06em",
    marginBottom: 14,
  },
  ctaTitle: {
    fontSize: "clamp(1.5rem, 2.5vw, 1.95rem)",
    fontWeight: 800,
    color: "#FFFFFF",
    margin: "0 0 10px",
    letterSpacing: "-0.02em",
  },
  ctaSubtitle: {
    fontSize: 14,
    color: "#CBD5E1",
    lineHeight: 1.6,
    margin: "0 0 24px",
  },
  ctaButtonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  ctaPrimaryBtn: {
    padding: "11px 24px",
    background: "#10B981",
    color: "#FFFFFF",
    borderRadius: 9,
    fontSize: 14,
    fontWeight: 750,
    textDecoration: "none",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
  },
  ctaSecondaryBtn: {
    padding: "11px 22px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    color: "#FFFFFF",
    borderRadius: 9,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
  },
};
