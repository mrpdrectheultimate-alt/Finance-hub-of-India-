"use client";

import { useEffect, useMemo, useState, useRef, type CSSProperties } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — World-Class Finance Library
// app/library/page.tsx
// High-clarity, eye-comfort layout with cinema focus & full discovery catalog
// ============================================================

type Video = {
  id: string;
  title: string;
  channel_name: string;
  description: string | null;
  playlist_url: string | null;
  embed_id: string;
  embed_type: string | null;
  video_type: "video" | "playlist" | "short" | null;
  category: string;
  level: string;
  video_count: number | null;
  duration_hrs: number | null;
  curator_note: string | null;
  is_featured: boolean;
};

type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  key_takeaways: string[] | string | null;
  why_read: string | null;
  best_for: string[] | null;
  category: string;
  difficulty: string;
  amazon_url: string | null;
  free_pdf_url: string | null;
  is_free_legal: boolean;
};

type Tab = "videos" | "books";
type TypeFilter = "all" | "video" | "playlist";

const CATEGORIES = [
  { id: "all", label: "All Topics", mark: "ALL", bg: "#F1F5F9", text: "#334155", border: "#CBD5E1" },
  { id: "personal-finance", label: "Personal Finance", mark: "PF", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  { id: "trading-markets", label: "Stock Market", mark: "TR", bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  { id: "crypto-defi", label: "Crypto & DeFi", mark: "CR", bg: "#F5F3FF", text: "#5B21B6", border: "#DDD6FE" },
  { id: "corporate-finance", label: "Corporate Finance", mark: "CF", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  { id: "behavioral-finance", label: "Behavioral Finance", mark: "BH", bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" },
  { id: "forex-currency", label: "Forex", mark: "FX", bg: "#ECFEFF", text: "#155E75", border: "#A5F3FC" },
  { id: "technical-analysis", label: "Technical Analysis", mark: "TA", bg: "#FFF7ED", text: "#9A3412", border: "#FED7AA" },
  { id: "general", label: "Economics", mark: "GN", bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
];

const LEVELS = [
  { id: "all", label: "All Levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const DIFF_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  beginner: { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" },
  easy: { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" },
  intermediate: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  medium: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  advanced: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  all: { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" },
};

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>("videos");
  const [videos, setVideos] = useState<Video[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [bookStatus, setBookStatus] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState("");
  const [profileRole, setProfileRole] = useState("free");

  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadUser();
  }, []);

  useEffect(() => {
    if (tab === "videos") void loadVideos();
    else void loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, category, level]);

  const loadUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      const [{ data: profile }, { data: reads }] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", user.id).single(),
        supabase.from("user_book_reads" as never).select("book_id, status").eq("user_id", user.id),
      ]);

      setProfileRole((profile as { role?: string } | null)?.role || "free");

      const next: Record<string, string> = {};
      ((reads as unknown as Array<{ book_id: string; status: string }> | null) || []).forEach((row) => {
        next[row.book_id] = row.status;
      });
      setBookStatus(next);
    } catch (e) {
      console.error("Error loading user profile in library:", e);
    }
  };

  const sanitizeVideo = (v: Video): Video => {
    // Correct known data mismatch where Gold ETF video had NPS description in seed
    if (v.title && v.title.toLowerCase().includes("gold etf") && v.description && v.description.toLowerCase().includes("nps")) {
      return {
        ...v,
        description: "Comprehensive breakdown of SEBI guidelines for Gold ETFs vs Digital Gold (eGold), physical gold, tracking errors, and tax implications.",
        curator_note: "Essential comparison for understanding physical vs paper gold taxation and SEBI investor safeguards.",
      };
    }
    return v;
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("curated_playlists" as never)
        .select("*")
        .eq("is_published", true);

      if (category !== "all") query = query.eq("category", category);
      if (level !== "all") query = query.eq("level", level);

      const { data } = await query
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      const rows = ((data as unknown as Video[] | null) || []).map((video) => {
        const normalized = {
          ...video,
          video_type: video.video_type || (video.embed_type === "playlist" ? "playlist" : "video"),
        };
        return sanitizeVideo(normalized);
      });

      setVideos(rows);
      setActiveVideo((current) => {
        if (current && rows.some((video) => video.id === current.id)) return current;
        return rows.find((video) => video.is_featured) || rows[0] || null;
      });
    } catch (e) {
      console.error("Error fetching library videos:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("books" as never)
        .select("*")
        .eq("is_published", true);

      if (category !== "all") {
        const catMap: Record<string, string> = {
          "personal-finance": "personal-finance",
          "trading-markets": "investing",
          "corporate-finance": "corporate-finance",
          "behavioral-finance": "behavioral-finance",
        };
        if (catMap[category]) query = query.eq("category", catMap[category]);
      }

      const { data } = await query.order("created_at", { ascending: false });
      setBooks((data as unknown as Book[] | null) || []);
    } catch (e) {
      console.error("Error fetching library books:", e);
    } finally {
      setLoading(false);
    }
  };

  const markBookStatus = async (bookId: string, status: string) => {
    if (!userId) return;

    try {
      await supabase.from("user_book_reads" as never).upsert({
        user_id: userId,
        book_id: bookId,
        status,
        started_at: status === "reading" ? new Date().toISOString() : undefined,
        completed_at: status === "completed" ? new Date().toISOString() : undefined,
      } as never, { onConflict: "user_id,book_id" });

      setBookStatus((current) => ({ ...current, [bookId]: status }));
    } catch (e) {
      console.error("Error updating book read status:", e);
    }
  };

  const selectAndScrollToVideo = (video: Video) => {
    setActiveVideo(video);
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filteredVideos = useMemo(() => {
    const term = search.trim().toLowerCase();
    return videos.filter((video) => {
      const matchesSearch = !term ||
        video.title.toLowerCase().includes(term) ||
        video.channel_name.toLowerCase().includes(term) ||
        (video.description || "").toLowerCase().includes(term);
      const matchesType = typeFilter === "all" || normalizeVideoType(video) === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [videos, search, typeFilter]);

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return books;
    return books.filter((book) =>
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.description.toLowerCase().includes(term),
    );
  }, [books, search]);

  const featured = useMemo(() => filteredVideos.filter((video) => video.is_featured), [filteredVideos]);
  const regular = useMemo(() => filteredVideos.filter((video) => !video.is_featured), [filteredVideos]);

  const playlistCount = useMemo(() => videos.filter((v) => normalizeVideoType(v) === "playlist").length, [videos]);
  const singleVideoCount = useMemo(() => videos.filter((v) => normalizeVideoType(v) === "video").length, [videos]);

  const hasActiveFilters = category !== "all" || level !== "all" || typeFilter !== "all" || Boolean(search);

  const resetFilters = () => {
    setCategory("all");
    setLevel("all");
    setTypeFilter("all");
    setSearch("");
  };

  return (
    <AppLayout userRole={profileRole}>
      <div style={s.pageWrapper}>
        <div style={s.container}>
          
          {/* Breadcrumb Navigation */}
          <nav style={s.breadcrumbNav} aria-label="Breadcrumb">
            <Link href="/dashboard" style={s.backLink}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Dashboard
            </Link>
            <span style={s.breadcrumbDivider}>/</span>
            <span style={s.breadcrumbCurrent}>Finance Library</span>
          </nav>

          {/* ZONE 2: Hero Banner */}
          <section style={s.heroBanner}>
            <div style={s.heroGlow} />
            <div style={s.heroContent}>
              <div style={s.heroBadge}>
                <span style={s.heroBadgePulse} />
                Curated Learning Vault
              </div>
              <h1 style={s.heroTitle}>Finance Library</h1>
              <p style={s.heroSubtitle}>
                Curated videos, masterclasses, and playlists from India’s most trusted educators, plus key takeaways from essential finance books.
              </p>
              <div style={s.heroStatsRow}>
                <div style={s.heroStatChip}>
                  <span style={{ ...s.statDot, background: "#10B981" }} />
                  <strong>{singleVideoCount}</strong> Videos
                </div>
                <div style={s.heroStatChip}>
                  <span style={{ ...s.statDot, background: "#3B82F6" }} />
                  <strong>{playlistCount}</strong> Master Playlists
                </div>
                <div style={s.heroStatChip}>
                  <span style={{ ...s.statDot, background: "#8B5CF6" }} />
                  <strong>{books.length || 30}</strong> Book Summaries
                </div>
                <div style={s.heroStatChip}>
                  <span style={{ ...s.statDot, background: "#F59E0B" }} />
                  100% Free & Legal
                </div>
              </div>
            </div>
          </section>

          {/* ZONE 3: Unified Filter Hub */}
          <section style={s.filterHub}>
            {/* Primary Mode Tabs (Videos vs Books) */}
            <div style={s.modeTabs}>
              <button
                type="button"
                onClick={() => setTab("videos")}
                style={{ ...s.modeTab, ...(tab === "videos" ? s.modeTabActive : {}) }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
                </svg>
                Videos &amp; Playlists
                <span style={{ ...s.tabCountBadge, ...(tab === "videos" ? s.tabCountBadgeActive : {}) }}>
                  {videos.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTab("books")}
                style={{ ...s.modeTab, ...(tab === "books" ? s.modeTabActive : {}) }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                </svg>
                Book Summaries
                <span style={{ ...s.tabCountBadge, ...(tab === "books" ? s.tabCountBadgeActive : {}) }}>
                  {books.length || 30}
                </span>
              </button>
            </div>

            {/* Topic Category Chips */}
            <div style={s.categoryScroll}>
              {CATEGORIES.map((cat) => {
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    style={{
                      ...s.categoryChip,
                      background: isActive ? "#0F3D3E" : cat.bg,
                      color: isActive ? "#FFFFFF" : cat.text,
                      borderColor: isActive ? "#0F3D3E" : cat.border,
                      boxShadow: isActive ? "0 2px 6px rgba(15, 61, 62, 0.25)" : "none",
                    }}
                  >
                    <span style={{ ...s.categoryMark, color: isActive ? "#34D399" : cat.text }}>
                      {cat.mark}
                    </span>
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search and Secondary Filter Row */}
            <div style={s.controlsRow}>
              {/* Integrated Search Input */}
              <div style={s.searchContainer}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s.searchIcon}>
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder={tab === "videos" ? "Search videos, topics, or educators (e.g. Rachana, Warikoo, SGB)..." : "Search book titles, authors, or key ideas..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={s.searchInput}
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")} style={s.clearSearchBtn} aria-label="Clear search">
                    ✕
                  </button>
                )}
              </div>

              {/* Difficulty Dropdown */}
              <div style={s.dropdownWrap}>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  style={s.selectInput}
                  aria-label="Filter by level"
                >
                  {LEVELS.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={s.selectChevron}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {/* Media Type Filter (Videos Tab only) */}
              {tab === "videos" && (
                <div style={s.dropdownWrap}>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                    style={s.selectInput}
                    aria-label="Filter by media type"
                  >
                    <option value="all">All Formats</option>
                    <option value="video">Single Videos</option>
                    <option value="playlist">Playlists / Series</option>
                  </select>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={s.selectChevron}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              )}

              {/* Reset Filters Button */}
              {hasActiveFilters && (
                <button type="button" onClick={resetFilters} style={s.resetBtn}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 4 }}>
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                  </svg>
                  Reset
                </button>
              )}
            </div>
          </section>

          {/* TAB 1: VIDEOS & PLAYLISTS */}
          {tab === "videos" ? (
            <div style={s.tabContent}>
              
              {/* ZONE 4: Cinema Player + Up Next Queue (2-Column Layout) */}
              <div ref={playerRef} id="cinema-player" style={s.cinemaLayout}>
                
                {/* Left: Elevated Player Card (68%) */}
                <div style={s.cinemaMainCard}>
                  {activeVideo ? (
                    <div>
                      <div style={s.videoPlayerFrame}>
                        <VideoPlayer
                          videoId={activeVideo.embed_id}
                          videoType={normalizeVideoType(activeVideo)}
                          title={activeVideo.title}
                          channel={activeVideo.channel_name}
                          description={activeVideo.description}
                          curatorNote={activeVideo.curator_note}
                          externalUrl={activeVideo.playlist_url}
                          size="lg"
                        />
                      </div>

                      {/* Video Metadata Panel */}
                      <div style={s.videoMetaPanel}>
                        <div style={s.videoTitleRow}>
                          <h2 style={s.videoActiveTitle}>{activeVideo.title}</h2>
                          {activeVideo.playlist_url ? (
                            <a
                              href={activeVideo.playlist_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={s.youtubeOutLink}
                            >
                              Watch on YouTube ↗
                            </a>
                          ) : (
                            <a
                              href={`https://www.youtube.com/watch?v=${activeVideo.embed_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={s.youtubeOutLink}
                            >
                              Watch on YouTube ↗
                            </a>
                          )}
                        </div>

                        {/* Educator & Tags */}
                        <div style={s.channelRow}>
                          <div style={s.channelInfo}>
                            <span style={s.channelAvatar}>
                              {activeVideo.channel_name.charAt(0).toUpperCase()}
                            </span>
                            <span style={s.channelName}>{activeVideo.channel_name}</span>
                            <span style={s.verifiedCheck} title="Verified Educational Partner">✓</span>
                          </div>

                          <div style={s.tagsRow}>
                            <span
                              style={{
                                ...s.tagBadge,
                                background: DIFF_COLORS[activeVideo.level]?.bg || "#F1F5F9",
                                color: DIFF_COLORS[activeVideo.level]?.text || "#475569",
                                borderColor: DIFF_COLORS[activeVideo.level]?.border || "#CBD5E1",
                              }}
                            >
                              {capitalize(activeVideo.level)}
                            </span>

                            <span style={s.tagBadgeCategory}>
                              {categoryLabel(activeVideo.category)}
                            </span>

                            {normalizeVideoType(activeVideo) === "playlist" && (
                              <span style={s.tagBadgePlaylist}>
                                📚 {activeVideo.video_count || "Series"} videos {activeVideo.duration_hrs ? `· ${activeVideo.duration_hrs}h` : ""}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {activeVideo.description && (
                          <p style={s.activeDescription}>{activeVideo.description}</p>
                        )}

                        {/* Curator's Note / Tip Box */}
                        {activeVideo.curator_note && (
                          <div style={s.curatorNoteBox}>
                            <div style={s.curatorNoteHeader}>
                              <span style={s.curatorLightbulb}>💡</span>
                              <span style={s.curatorLabel}>CURATOR’S KEY TAKEAWAY</span>
                            </div>
                            <p style={s.curatorNoteText}>{activeVideo.curator_note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={s.playerEmptyState}>
                      <div style={s.emptyIconCircle}>🎬</div>
                      <h3 style={s.emptyStateTitle}>Select a Video to Begin Watching</h3>
                      <p style={s.emptyStateSub}>Choose any resource from the queue or discovery catalog below.</p>
                    </div>
                  )}
                </div>

                {/* Right: Up Next / Recommended Queue (32%) */}
                <div style={s.cinemaSidebar}>
                  <div style={s.sidebarHeader}>
                    <div style={s.sidebarTitleRow}>
                      <span style={s.sidebarTitle}>UP NEXT &amp; RECOMMENDED</span>
                      <span style={s.queueCount}>
                        {featured.length > 0 ? featured.length : filteredVideos.slice(0, 6).length} items
                      </span>
                    </div>
                    <p style={s.sidebarSub}>Handpicked for this learning path</p>
                  </div>

                  <div style={s.queueList}>
                    {loading ? (
                      <LoadingQueueSkeletons />
                    ) : (
                      (featured.length > 0 ? featured : filteredVideos.slice(0, 6)).map((item) => {
                        const isSelected = activeVideo?.id === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => selectAndScrollToVideo(item)}
                            style={{
                              ...s.queueItem,
                              ...(isSelected ? s.queueItemActive : {}),
                            }}
                          >
                            <div style={s.queueThumbContainer}>
                              <img
                                src={`https://img.youtube.com/vi/${item.embed_id}/mqdefault.jpg`}
                                alt={item.title}
                                style={s.queueThumbImg}
                                loading="lazy"
                              />
                              {isSelected ? (
                                <div style={s.playingPill}>Playing</div>
                              ) : (
                                <span style={s.queueDuration}>
                                  {normalizeVideoType(item) === "playlist" ? `${item.video_count || 1} vids` : `${item.duration_hrs || 0.3}h`}
                                </span>
                              )}
                            </div>

                            <div style={s.queueItemBody}>
                              <h4 style={{ ...s.queueItemTitle, color: isSelected ? "#0F3D3E" : "#1E293B" }}>
                                {item.title}
                              </h4>
                              <p style={s.queueItemChannel}>{item.channel_name}</p>
                              <div style={s.queueItemBottom}>
                                <span
                                  style={{
                                    ...s.queueLevelBadge,
                                    background: DIFF_COLORS[item.level]?.bg || "#F1F5F9",
                                    color: DIFF_COLORS[item.level]?.text || "#475569",
                                  }}
                                >
                                  {item.level}
                                </span>
                                {item.is_featured && <span style={s.featuredTag}>★ Featured</span>}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* ZONE 5: Full Discovery Catalog Grid (All Videos in Library) */}
              <section style={s.catalogSection}>
                <div style={s.catalogHeader}>
                  <div>
                    <h3 style={s.catalogTitle}>All Resources in Library</h3>
                    <p style={s.catalogSubtitle}>
                      Explore our complete indexed curriculum of educational videos and playlists.
                    </p>
                  </div>
                  <div style={s.catalogCounter}>
                    Showing <strong>{filteredVideos.length}</strong> of {videos.length} resources
                  </div>
                </div>

                {loading ? (
                  <LoadingGridSkeletons />
                ) : filteredVideos.length === 0 ? (
                  <div style={s.noResultsBox}>
                    <div style={s.noResultsIcon}>🔍</div>
                    <h4 style={s.noResultsTitle}>No matching videos found</h4>
                    <p style={s.noResultsSub}>Try adjusting your search terms or clearing selected topic filters.</p>
                    <button type="button" onClick={resetFilters} style={s.resetBtnLarge}>
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div style={s.catalogGrid}>
                    {filteredVideos.map((item) => {
                      const isSelected = activeVideo?.id === item.id;
                      const isPlaylist = normalizeVideoType(item) === "playlist";

                      return (
                        <div
                          key={item.id}
                          onClick={() => selectAndScrollToVideo(item)}
                          style={{
                            ...s.videoCard,
                            borderColor: isSelected ? "#10B981" : "#E2E8F0",
                            boxShadow: isSelected ? "0 0 0 2px #10B981, 0 4px 12px rgba(0,0,0,0.06)" : s.videoCard.boxShadow,
                          }}
                        >
                          {/* Thumbnail Frame */}
                          <div style={s.cardThumbWrapper}>
                            <img
                              src={`https://img.youtube.com/vi/${item.embed_id}/mqdefault.jpg`}
                              alt={item.title}
                              style={s.cardThumbImg}
                              loading="lazy"
                            />
                            <div style={s.cardPlayOverlay}>
                              <div style={s.cardPlayCircle}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                              </div>
                            </div>

                            {/* Duration Badge */}
                            <span style={s.cardDurationBadge}>
                              {isPlaylist ? `📚 ${item.video_count || 1} videos` : `⏱ ${item.duration_hrs || 0.25}h`}
                            </span>

                            {/* Level Pill */}
                            <span
                              style={{
                                ...s.cardLevelPill,
                                background: DIFF_COLORS[item.level]?.bg || "rgba(0,0,0,0.7)",
                                color: DIFF_COLORS[item.level]?.text || "#FFFFFF",
                              }}
                            >
                              {item.level}
                            </span>
                          </div>

                          {/* Content */}
                          <div style={s.cardBody}>
                            <div style={s.cardTopicRow}>
                              <span style={s.cardTopicBadge}>{categoryLabel(item.category)}</span>
                              {item.is_featured && <span style={s.cardFeaturedBadge}>Featured</span>}
                            </div>
                            <h4 style={s.cardTitle} title={item.title}>
                              {item.title}
                            </h4>
                            <p style={s.cardChannel}>{item.channel_name}</p>
                            
                            {item.description && (
                              <p style={s.cardDescription}>{truncate(item.description, 85)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

            </div>
          ) : (
            /* TAB 2: BOOK SUMMARIES */
            <section style={s.booksSection}>
              <div style={s.catalogHeader}>
                <div>
                  <h3 style={s.catalogTitle}>Essential Finance Books</h3>
                  <p style={s.catalogSubtitle}>
                    Original educational summaries and structured takeaways of timeless investment literature.
                  </p>
                </div>
                <div style={s.catalogCounter}>
                  Showing <strong>{filteredBooks.length}</strong> of {books.length} titles
                </div>
              </div>

              {loading ? (
                <LoadingGridSkeletons />
              ) : filteredBooks.length === 0 ? (
                <div style={s.noResultsBox}>
                  <div style={s.noResultsIcon}>📖</div>
                  <h4 style={s.noResultsTitle}>No books found</h4>
                  <p style={s.noResultsSub}>Try clearing your search query or choosing another category.</p>
                  <button type="button" onClick={resetFilters} style={s.resetBtnLarge}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div style={s.booksGrid}>
                  {filteredBooks.map((book) => {
                    const isOpen = expandedBook === book.id;
                    const status = bookStatus[book.id];
                    const takeaways = parseTakeaways(book.key_takeaways);

                    return (
                      <article
                        key={book.id}
                        style={{
                          ...s.bookCard,
                          borderColor: isOpen ? "#0F3D3E" : "#E2E8F0",
                        }}
                      >
                        {/* Book Header */}
                        <div style={s.bookHeader}>
                          <div style={{ ...s.bookSpineCover, background: getCoverBg(book.category) }}>
                            <span style={s.bookSpineCode}>{getCoverMark(book.category)}</span>
                          </div>
                          <div style={s.bookMetaBlock}>
                            <div style={s.bookDifficultyPill}>
                              <span
                                style={{
                                  ...s.bookDiffBadge,
                                  color: DIFF_COLORS[book.difficulty]?.text || "#475569",
                                  backgroundColor: DIFF_COLORS[book.difficulty]?.bg || "#F1F5F9",
                                  borderColor: DIFF_COLORS[book.difficulty]?.border || "#CBD5E1",
                                }}
                              >
                                {capitalize(book.difficulty)}
                              </span>
                              <span style={s.bookCategoryTag}>{categoryLabel(book.category)}</span>
                            </div>
                            <h3 style={s.bookTitle}>{book.title}</h3>
                            <p style={s.bookAuthor}>by {book.author}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <p style={s.bookDesc}>{book.description}</p>

                        {/* Why Read This Section */}
                        {book.why_read && (
                          <div style={s.whyReadCard}>
                            <span style={s.whyReadLabel}>WHY READ THIS</span>
                            <p style={s.whyReadText}>{book.why_read}</p>
                          </div>
                        )}

                        {/* Expandable Key Takeaways */}
                        <div style={s.takeawaysWrap}>
                          <button
                            type="button"
                            onClick={() => setExpandedBook(isOpen ? null : book.id)}
                            style={s.toggleTakeawaysBtn}
                          >
                            <span>Key Takeaways ({takeaways.length})</span>
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              style={{
                                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s ease",
                              }}
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>

                          {isOpen && (
                            <ul style={s.takeawaysList}>
                              {takeaways.map((point, idx) => (
                                <li key={idx} style={s.takeawayItem}>
                                  <span style={s.takeawayBullet}>✓</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* User Reading Progress Tracker */}
                        <div style={s.bookFooter}>
                          {userId ? (
                            <div style={s.statusGroup}>
                              <span style={s.statusTitle}>Reading status:</span>
                              <div style={s.statusBtns}>
                                {[
                                  { id: "want_to_read", label: "Want to read" },
                                  { id: "reading", label: "Reading" },
                                  { id: "completed", label: "Done" },
                                ].map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => void markBookStatus(book.id, item.id)}
                                    style={{
                                      ...s.statusBtn,
                                      ...(status === item.id ? s.statusBtnActive : {}),
                                    }}
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          <div style={s.externalLinksRow}>
                            {book.amazon_url && (
                              <a
                                href={book.amazon_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={s.buyBookLink}
                              >
                                View on Amazon ↗
                              </a>
                            )}
                            {book.is_free_legal && book.free_pdf_url && (
                              <a
                                href={book.free_pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={s.freePdfLink}
                              >
                                Free Public Domain PDF
                              </a>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ZONE 6: Legal & Attribution Footer */}
          <footer style={s.legalFooter}>
            <div style={s.legalContent}>
              <span style={s.legalShieldIcon}>⚖️</span>
              <div style={s.legalText}>
                <strong>Educational Use &amp; Intellectual Property Notice:</strong>
                <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 13, lineHeight: 1.6 }}>
                  All video materials are streamed directly via standard YouTube embedded players in accordance with YouTube’s Terms of Service and Indian Copyright Fair Dealing (Section 52, Indian Copyright Act 1957). All view counts, advertising revenue, and intellectual property remain strictly with original channel creators. Book summaries are original analytical syntheses prepared for educational review.
                </p>
                <Link href="/legal/copyright" style={s.legalLink}>
                  Read our full Fair Use &amp; Content Attribution Policy →
                </Link>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </AppLayout>
  );
}

// ─── Helpers ───────────────────────────────────────────────────

function normalizeVideoType(video: Video): "video" | "playlist" {
  return video.video_type === "playlist" || video.embed_type === "playlist" ? "playlist" : "video";
}

function parseTakeaways(value: Book["key_takeaways"]): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function categoryLabel(catId: string): string {
  return CATEGORIES.find((c) => c.id === catId)?.label || catId;
}

function capitalize(val: string): string {
  if (!val) return "";
  return val.charAt(0).toUpperCase() + val.slice(1);
}

function truncate(val: string, max: number): string {
  if (!val) return "";
  return val.length > max ? `${val.slice(0, max)}...` : val;
}

function getCoverBg(category: string): string {
  const colors: Record<string, string> = {
    "personal-finance": "#E1F5EE",
    investing: "#E6F1FB",
    "trading-markets": "#FAEEDA",
    "crypto-defi": "#FAECE7",
    "corporate-finance": "#EEEDFE",
    "behavioral-finance": "#FEF2F2",
  };
  return colors[category] || "#F1F5F9";
}

function getCoverMark(category: string): string {
  const marks: Record<string, string> = {
    "personal-finance": "PF",
    investing: "IN",
    "trading-markets": "TR",
    "crypto-defi": "CR",
    "corporate-finance": "CF",
    "behavioral-finance": "BH",
  };
  return marks[category] || "LIB";
}

// ─── Skeletons ─────────────────────────────────────────────────

function LoadingQueueSkeletons() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={s.queueSkeletonItem}>
          <div style={s.skeletonThumb} />
          <div style={{ flex: 1 }}>
            <div style={s.skeletonLine} />
            <div style={{ ...s.skeletonLine, width: "65%", marginTop: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingGridSkeletons() {
  return (
    <div style={s.catalogGrid}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={s.gridSkeletonCard}>
          <div style={s.gridSkeletonThumb} />
          <div style={{ padding: 16 }}>
            <div style={s.skeletonLine} />
            <div style={{ ...s.skeletonLine, width: "60%", marginTop: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── World-Class Design System Styles (Eye-Comfort & Pure White) ────────

const s: Record<string, CSSProperties> = {
  pageWrapper: {
    minHeight: "100vh",
    background: "#FFFFFF",
    color: "#0F172A",
    fontFamily: "var(--font-ui, system-ui, -apple-system, sans-serif)",
  },
  container: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "24px 24px 80px",
  },
  breadcrumbNav: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    fontSize: 13,
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    color: "#475569",
    textDecoration: "none",
    fontWeight: 500,
    transition: "color 0.15s ease",
  },
  breadcrumbDivider: {
    color: "#94A3B8",
  },
  breadcrumbCurrent: {
    color: "#0F172A",
    fontWeight: 600,
  },

  /* HERO BANNER */
  heroBanner: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 16,
    background: "linear-gradient(135deg, #0A1628 0%, #0D282F 55%, #064E3B 100%)",
    padding: "40px 36px",
    marginBottom: 28,
    boxShadow: "0 10px 30px -10px rgba(10, 22, 40, 0.2)",
  },
  heroGlow: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(0,0,0,0) 70%)",
    pointerEvents: "none",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: 800,
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 9999,
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(52, 211, 153, 0.25)",
    color: "#34D399",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 14,
  },
  heroBadgePulse: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#34D399",
    boxShadow: "0 0 8px #34D399",
  },
  heroTitle: {
    fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
    fontWeight: 800,
    color: "#FFFFFF",
    margin: "0 0 12px",
    letterSpacing: "-0.03em",
    lineHeight: 1.15,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#CBD5E1",
    lineHeight: 1.65,
    margin: "0 0 24px",
    maxWidth: 680,
  },
  heroStatsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  },
  heroStatChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 14px",
    borderRadius: 9999,
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#E2E8F0",
    fontSize: 13,
  },
  statDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
  },

  /* FILTER HUB */
  filterHub: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    padding: "20px 22px",
    marginBottom: 32,
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  modeTabs: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
    borderBottom: "1px solid #E2E8F0",
    paddingBottom: 14,
  },
  modeTab: {
    display: "inline-flex",
    alignItems: "center",
    padding: "9px 18px",
    borderRadius: 9999,
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#475569",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  modeTabActive: {
    background: "#0F3D3E",
    color: "#FFFFFF",
    borderColor: "#0F3D3E",
    boxShadow: "0 2px 8px rgba(15, 61, 62, 0.2)",
  },
  tabCountBadge: {
    marginLeft: 8,
    padding: "2px 7px",
    borderRadius: 9999,
    fontSize: 11,
    fontWeight: 700,
    background: "#F1F5F9",
    color: "#475569",
  },
  tabCountBadgeActive: {
    background: "rgba(255,255,255,0.2)",
    color: "#FFFFFF",
  },
  categoryScroll: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    paddingBottom: 8,
    marginBottom: 16,
    scrollbarWidth: "thin",
  },
  categoryChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 9999,
    border: "1px solid",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s ease",
  },
  categoryMark: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.04em",
  },
  controlsRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchContainer: {
    position: "relative",
    flex: 1,
    minWidth: 260,
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
    boxSizing: "border-box",
    padding: "10px 36px 10px 38px",
    borderRadius: 10,
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#0F172A",
    fontSize: 13.5,
    outline: "none",
    transition: "border-color 0.15s",
  },
  clearSearchBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#94A3B8",
    fontSize: 14,
    cursor: "pointer",
    padding: 4,
  },
  dropdownWrap: {
    position: "relative",
  },
  selectInput: {
    appearance: "none",
    padding: "10px 34px 10px 14px",
    borderRadius: 10,
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#334155",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    outline: "none",
  },
  selectChevron: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  resetBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "9px 14px",
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    background: "#FFFFFF",
    color: "#64748B",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  /* TAB CONTENT & CINEMA 2-COLUMN LAYOUT */
  tabContent: {
    marginTop: 8,
  },
  cinemaLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.05fr)",
    gap: 28,
    marginBottom: 48,
    alignItems: "start",
  },
  cinemaMainCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
  },
  videoPlayerFrame: {
    background: "#0A1628",
    borderRadius: "16px 16px 0 0",
    overflow: "hidden",
  },
  videoMetaPanel: {
    padding: "24px 26px 28px",
  },
  videoTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 12,
  },
  videoActiveTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0F172A",
    margin: 0,
    lineHeight: 1.35,
  },
  youtubeOutLink: {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 11px",
    borderRadius: 6,
    background: "#FEE2E2",
    color: "#DC2626",
    fontSize: 12,
    fontWeight: 600,
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  channelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: "1px solid #F1F5F9",
  },
  channelInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  channelAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#0F3D3E",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
  },
  channelName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#334155",
  },
  verifiedCheck: {
    color: "#059669",
    fontSize: 13,
    fontWeight: 800,
  },
  tagsRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  tagBadge: {
    padding: "3px 10px",
    borderRadius: 9999,
    fontSize: 11.5,
    fontWeight: 600,
    border: "1px solid",
  },
  tagBadgeCategory: {
    padding: "3px 10px",
    borderRadius: 9999,
    fontSize: 11.5,
    fontWeight: 600,
    background: "#F1F5F9",
    color: "#475569",
    border: "1px solid #CBD5E1",
  },
  tagBadgePlaylist: {
    padding: "3px 10px",
    borderRadius: 9999,
    fontSize: 11.5,
    fontWeight: 600,
    background: "#EFF6FF",
    color: "#1E40AF",
    border: "1px solid #BFDBFE",
  },
  activeDescription: {
    fontSize: 14.5,
    color: "#475569",
    lineHeight: 1.6,
    margin: "0 0 16px",
  },
  curatorNoteBox: {
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    borderLeft: "4px solid #10B981",
    borderRadius: 10,
    padding: "12px 16px",
    marginTop: 16,
  },
  curatorNoteHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  curatorLightbulb: {
    fontSize: 14,
  },
  curatorLabel: {
    fontSize: 11,
    fontWeight: 800,
    color: "#065F46",
    letterSpacing: "0.06em",
  },
  curatorNoteText: {
    fontSize: 13.5,
    color: "#064E3B",
    margin: 0,
    lineHeight: 1.5,
  },
  playerEmptyState: {
    padding: "80px 24px",
    textAlign: "center",
  },
  emptyIconCircle: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0F172A",
    margin: "0 0 6px",
  },
  emptyStateSub: {
    fontSize: 14,
    color: "#64748B",
    margin: 0,
  },

  /* CINEMA SIDEBAR QUEUE */
  cinemaSidebar: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    padding: "20px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.03)",
  },
  sidebarHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid #F1F5F9",
  },
  sidebarTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: 800,
    color: "#64748B",
    letterSpacing: "0.06em",
  },
  queueCount: {
    fontSize: 11.5,
    color: "#0F3D3E",
    fontWeight: 700,
    background: "#E6F3F3",
    padding: "2px 8px",
    borderRadius: 9999,
  },
  sidebarSub: {
    fontSize: 12.5,
    color: "#94A3B8",
    margin: "4px 0 0",
  },
  queueList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxHeight: 580,
    overflowY: "auto",
    paddingRight: 4,
  },
  queueItem: {
    display: "flex",
    gap: 12,
    padding: 10,
    borderRadius: 10,
    border: "1px solid transparent",
    background: "#F8FAFC",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  queueItemActive: {
    background: "#ECFDF5",
    borderColor: "#10B981",
    boxShadow: "0 1px 4px rgba(16, 185, 129, 0.15)",
  },
  queueThumbContainer: {
    position: "relative",
    width: 100,
    height: 60,
    borderRadius: 6,
    overflow: "hidden",
    flexShrink: 0,
    background: "#E2E8F0",
  },
  queueThumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  playingPill: {
    position: "absolute",
    bottom: 3,
    right: 3,
    background: "#10B981",
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: 800,
    padding: "1px 5px",
    borderRadius: 4,
  },
  queueDuration: {
    position: "absolute",
    bottom: 3,
    right: 3,
    background: "rgba(0,0,0,0.75)",
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: 600,
    padding: "1px 4px",
    borderRadius: 3,
  },
  queueItemBody: {
    flex: 1,
    minWidth: 0,
  },
  queueItemTitle: {
    fontSize: 13,
    fontWeight: 600,
    margin: "0 0 3px",
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  queueItemChannel: {
    fontSize: 11.5,
    color: "#64748B",
    margin: "0 0 6px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  queueItemBottom: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  queueLevelBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: "1px 6px",
    borderRadius: 4,
    textTransform: "capitalize",
  },
  featuredTag: {
    fontSize: 10,
    fontWeight: 700,
    color: "#D97706",
  },

  /* DISCOVERY CATALOG GRID */
  catalogSection: {
    marginTop: 20,
    paddingTop: 36,
    borderTop: "1px solid #E2E8F0",
  },
  catalogHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  catalogTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0F172A",
    margin: "0 0 6px",
  },
  catalogSubtitle: {
    fontSize: 14,
    color: "#64748B",
    margin: 0,
  },
  catalogCounter: {
    fontSize: 13,
    color: "#475569",
    background: "#F1F5F9",
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
  },
  catalogGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 24,
  },
  videoCard: {
    background: "#FFFFFF",
    borderRadius: 14,
    border: "1px solid #E2E8F0",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
  },
  cardThumbWrapper: {
    position: "relative",
    aspectRatio: "16/9",
    background: "#0A1628",
    overflow: "hidden",
  },
  cardThumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
  cardPlayOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0, 0, 0, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.9,
    transition: "opacity 0.2s ease",
  },
  cardPlayCircle: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#0F3D3E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  },
  cardDurationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    background: "rgba(15, 23, 42, 0.85)",
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 4,
    backdropFilter: "blur(4px)",
  },
  cardLevelPill: {
    position: "absolute",
    top: 8,
    left: 8,
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 4,
    textTransform: "capitalize",
    backdropFilter: "blur(4px)",
  },
  cardBody: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  cardTopicRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTopicBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  cardFeaturedBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: "#D97706",
    background: "#FEF3C7",
    padding: "1px 6px",
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: 700,
    color: "#0F172A",
    margin: "0 0 6px",
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardChannel: {
    fontSize: 12.5,
    color: "#64748B",
    margin: "0 0 10px",
  },
  cardDescription: {
    fontSize: 12.5,
    color: "#475569",
    margin: 0,
    lineHeight: 1.5,
    marginTop: "auto",
  },

  /* BOOK SUMMARIES */
  booksSection: {
    marginTop: 8,
  },
  booksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 24,
  },
  bookCard: {
    background: "#FFFFFF",
    borderRadius: 14,
    border: "1px solid #E2E8F0",
    padding: "22px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
  },
  bookHeader: {
    display: "flex",
    gap: 16,
    marginBottom: 16,
  },
  bookSpineCover: {
    width: 60,
    height: 84,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
    flexShrink: 0,
  },
  bookSpineCode: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0F3D3E",
  },
  bookMetaBlock: {
    flex: 1,
    minWidth: 0,
  },
  bookDifficultyPill: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    marginBottom: 6,
  },
  bookDiffBadge: {
    fontSize: 10.5,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 4,
    border: "1px solid",
  },
  bookCategoryTag: {
    fontSize: 11,
    color: "#64748B",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0F172A",
    margin: "0 0 4px",
    lineHeight: 1.3,
  },
  bookAuthor: {
    fontSize: 12.5,
    color: "#64748B",
    margin: 0,
  },
  bookDesc: {
    fontSize: 13.5,
    color: "#475569",
    lineHeight: 1.6,
    margin: "0 0 16px",
  },
  whyReadCard: {
    background: "#F8FAFC",
    borderLeft: "3px solid #0F3D3E",
    padding: "10px 14px",
    borderRadius: "0 8px 8px 0",
    marginBottom: 16,
  },
  whyReadLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: "#0F3D3E",
    letterSpacing: "0.06em",
  },
  whyReadText: {
    fontSize: 12.5,
    color: "#334155",
    margin: "4px 0 0",
    lineHeight: 1.5,
  },
  takeawaysWrap: {
    marginTop: "auto",
    borderTop: "1px solid #F1F5F9",
    paddingTop: 12,
  },
  toggleTakeawaysBtn: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    background: "none",
    border: "none",
    padding: "6px 0",
    color: "#0F3D3E",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  takeawaysList: {
    margin: "10px 0 0",
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  takeawayItem: {
    display: "flex",
    gap: 8,
    fontSize: 12.5,
    color: "#334155",
    lineHeight: 1.5,
  },
  takeawayBullet: {
    color: "#10B981",
    fontWeight: 800,
    flexShrink: 0,
  },
  bookFooter: {
    marginTop: 18,
    paddingTop: 14,
    borderTop: "1px solid #E2E8F0",
  },
  statusGroup: {
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: 600,
    display: "block",
    marginBottom: 6,
  },
  statusBtns: {
    display: "flex",
    gap: 6,
  },
  statusBtn: {
    flex: 1,
    padding: "5px 8px",
    fontSize: 11,
    fontWeight: 600,
    border: "1px solid #CBD5E1",
    borderRadius: 6,
    background: "#FFFFFF",
    color: "#475569",
    cursor: "pointer",
  },
  statusBtnActive: {
    background: "#0F3D3E",
    color: "#FFFFFF",
    borderColor: "#0F3D3E",
  },
  externalLinksRow: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  buyBookLink: {
    fontSize: 12,
    fontWeight: 600,
    color: "#2563EB",
    textDecoration: "none",
  },
  freePdfLink: {
    fontSize: 12,
    fontWeight: 600,
    color: "#059669",
    textDecoration: "none",
  },

  /* LEGAL FOOTER */
  legalFooter: {
    marginTop: 64,
    padding: "24px 28px",
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 14,
  },
  legalContent: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
  },
  legalShieldIcon: {
    fontSize: 24,
    flexShrink: 0,
  },
  legalText: {
    fontSize: 13,
    color: "#1E293B",
  },
  legalLink: {
    display: "inline-block",
    marginTop: 8,
    color: "#0F3D3E",
    fontWeight: 600,
    textDecoration: "underline",
    fontSize: 12.5,
  },

  /* EMPTY STATES & SKELETONS */
  noResultsBox: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#F8FAFC",
    borderRadius: 14,
    border: "1px dashed #CBD5E1",
  },
  noResultsIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0F172A",
    margin: "0 0 6px",
  },
  noResultsSub: {
    fontSize: 13.5,
    color: "#64748B",
    margin: "0 0 16px",
  },
  resetBtnLarge: {
    padding: "8px 18px",
    background: "#0F3D3E",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  queueSkeletonItem: {
    display: "flex",
    gap: 12,
    padding: 10,
    marginBottom: 8,
  },
  skeletonThumb: {
    width: 100,
    height: 60,
    borderRadius: 6,
    background: "#E2E8F0",
    animation: "pulse 1.5s infinite",
  },
  skeletonLine: {
    height: 14,
    background: "#E2E8F0",
    borderRadius: 4,
    width: "90%",
  },
  gridSkeletonCard: {
    background: "#FFFFFF",
    borderRadius: 14,
    border: "1px solid #E2E8F0",
    overflow: "hidden",
  },
  gridSkeletonThumb: {
    aspectRatio: "16/9",
    background: "#E2E8F0",
  },
};
