"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import VideoPlayer from "@/components/video/VideoPlayer";
import { supabase } from "@/lib/supabase";

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
  { id: "all", label: "All", mark: "ALL" },
  { id: "personal-finance", label: "Personal Finance", mark: "PF" },
  { id: "trading-markets", label: "Stock Market", mark: "TR" },
  { id: "crypto-defi", label: "Crypto", mark: "CR" },
  { id: "corporate-finance", label: "Corporate", mark: "CF" },
  { id: "behavioral-finance", label: "Behavioral", mark: "BH" },
  { id: "forex-currency", label: "Forex", mark: "FX" },
  { id: "technical-analysis", label: "Technical", mark: "TA" },
  { id: "general", label: "Economics", mark: "GN" },
];

const LEVELS = [
  { id: "all", label: "All levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const DIFF_COLOR: Record<string, string> = {
  easy: "#1D9E75",
  medium: "#854F0B",
  advanced: "#B91C1C",
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

  useEffect(() => {
    void loadUser();
  }, []);

  useEffect(() => {
    if (tab === "videos") void loadVideos();
    else void loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, category, level]);

  const loadUser = async () => {
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
  };

  const loadVideos = async () => {
    setLoading(true);
    let query = supabase
      .from("curated_playlists" as never)
      .select("*")
      .eq("is_published", true);

    if (category !== "all") query = query.eq("category", category);
    if (level !== "all") query = query.eq("level", level);

    const { data } = await query
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    const rows = ((data as unknown as Video[] | null) || []).map((video) => ({
      ...video,
      video_type: video.video_type || (video.embed_type === "playlist" ? "playlist" : "video"),
    }));

    setVideos(rows);
    setActiveVideo((current) => {
      if (current && rows.some((video) => video.id === current.id)) return current;
      return rows.find((video) => video.is_featured) || rows[0] || null;
    });
    setLoading(false);
  };

  const loadBooks = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const markBookStatus = async (bookId: string, status: string) => {
    if (!userId) return;

    await supabase.from("user_book_reads" as never).upsert({
      user_id: userId,
      book_id: bookId,
      status,
      started_at: status === "reading" ? new Date().toISOString() : undefined,
      completed_at: status === "completed" ? new Date().toISOString() : undefined,
    } as never, { onConflict: "user_id,book_id" });

    setBookStatus((current) => ({ ...current, [bookId]: status }));
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

  const featured = filteredVideos.filter((video) => video.is_featured);
  const regular = filteredVideos.filter((video) => !video.is_featured);
  const playlistCount = filteredVideos.filter((video) => normalizeVideoType(video) === "playlist").length;
  const videoCount = filteredVideos.filter((video) => normalizeVideoType(video) === "video").length;

  return (
    <AppLayout userRole={profileRole}>
      <div style={s.page}>
        <Link href="/dashboard" style={s.back}>Dashboard</Link>

        <section style={s.hero}>
          <div style={s.heroBadge}>Free learning resources</div>
          <h1 style={s.heroTitle}>Finance Library</h1>
          <p style={s.heroSub}>
            Curated videos and playlists from trusted educators, plus summaries of essential finance books.
          </p>
          <div style={s.heroStats}>
            <HeroStat value={videoCount.toString()} label="videos" color="#1D9E75" />
            <div style={s.heroStatDot} />
            <HeroStat value={playlistCount.toString()} label="playlists" color="#185FA5" />
            <div style={s.heroStatDot} />
            <HeroStat value="30" label="books" color="#7C3AED" />
          </div>
        </section>

        <div style={s.mainTabs}>
          <button onClick={() => setTab("videos")} style={{ ...s.mainTab, ...(tab === "videos" ? s.mainTabActive : {}) }} type="button">
            Videos & Playlists
          </button>
          <button onClick={() => setTab("books")} style={{ ...s.mainTab, ...(tab === "books" ? s.mainTabActive : {}) }} type="button">
            Book Summaries
          </button>
        </div>

        <div style={s.filtersWrap}>
          <div style={s.categoryRow}>
            {CATEGORIES.map((item) => (
              <button key={item.id} onClick={() => setCategory(item.id)} style={{ ...s.catPill, ...(category === item.id ? s.catPillActive : {}) }} type="button">
                <span style={s.catMark}>{item.mark}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div style={s.filterRow}>
            <input
              placeholder={`Search ${tab === "videos" ? "videos or channels" : "books or authors"}...`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={s.searchInput}
            />
            <div style={s.levelRow}>
              {LEVELS.map((item) => (
                <button key={item.id} onClick={() => setLevel(item.id)} style={{ ...s.levelBtn, ...(level === item.id ? s.levelBtnActive : {}) }} type="button">
                  {item.label}
                </button>
              ))}
            </div>
            {tab === "videos" ? (
              <div style={s.typeRow}>
                {(["all", "video", "playlist"] as TypeFilter[]).map((item) => (
                  <button key={item} onClick={() => setTypeFilter(item)} style={{ ...s.typeBtn, ...(typeFilter === item ? s.typeBtnActive : {}) }} type="button">
                    {capitalize(item)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {tab === "videos" ? (
          <div style={s.videosLayout}>
            <main style={s.playerCol}>
              {activeVideo ? (
                <div style={s.playerWrap}>
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
                  <div style={s.videoBadges}>
                    <span style={s.levelBadge}>{activeVideo.level}</span>
                    <span style={s.catBadge}>{categoryLabel(activeVideo.category)}</span>
                    {normalizeVideoType(activeVideo) === "playlist" ? (
                      <span style={s.countBadge}>{activeVideo.video_count || 1} videos - {activeVideo.duration_hrs || 0}h</span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div style={s.playerEmpty}>
                  <div style={s.playerEmptyTitle}>Select a video to watch</div>
                  <div style={s.playerEmptySub}>Choose any video from the list.</div>
                </div>
              )}
              <div style={s.disclaimer}>
                Videos are embedded from YouTube. FinanceHub does not host external video content.
              </div>
            </main>

            <aside style={s.listCol}>
              {loading ? <LoadingList /> : filteredVideos.length === 0 ? (
                <Empty title="No videos found" subtitle="Try a different category, level, or search term." />
              ) : (
                <>
                  {featured.length > 0 && !search && typeFilter === "all" ? (
                    <VideoSection title="Featured" videos={featured} activeVideo={activeVideo} onSelect={setActiveVideo} />
                  ) : null}
                  <VideoSection
                    title={search || typeFilter !== "all" ? `Results (${filteredVideos.length})` : `All videos (${filteredVideos.length})`}
                    videos={search || typeFilter !== "all" ? filteredVideos : regular}
                    activeVideo={activeVideo}
                    onSelect={setActiveVideo}
                  />
                </>
              )}
            </aside>
          </div>
        ) : (
          <BooksTab
            loading={loading}
            books={filteredBooks}
            expandedBook={expandedBook}
            setExpandedBook={setExpandedBook}
            userId={userId}
            bookStatus={bookStatus}
            markBookStatus={markBookStatus}
          />
        )}
      </div>
    </AppLayout>
  );
}

function HeroStat({ value, label, color }: { value: string; label: string; color: string }) {
  return <div style={s.heroStat}><strong style={{ color }}>{value}</strong> {label}</div>;
}

function VideoSection({
  title,
  videos,
  activeVideo,
  onSelect,
}: {
  title: string;
  videos: Video[];
  activeVideo: Video | null;
  onSelect: (video: Video) => void;
}) {
  if (videos.length === 0) return null;
  return (
    <section style={s.listSection}>
      <div style={s.listSectionTitle}>{title}</div>
      {videos.map((video) => (
        <VideoListItem key={video.id} video={video} active={activeVideo?.id === video.id} onClick={() => onSelect(video)} />
      ))}
    </section>
  );
}

function VideoListItem({ video, active, onClick }: { video: Video; active: boolean; onClick: () => void }) {
  const levelColor: Record<string, string> = {
    beginner: "#1D9E75",
    intermediate: "#854F0B",
    advanced: "#B91C1C",
    all: "#185FA5",
  };
  const isPlaylist = normalizeVideoType(video) === "playlist";

  return (
    <button onClick={onClick} style={{ ...s.videoItem, ...(active ? s.videoItemActive : {}) }} type="button">
      <div style={{ ...s.thumb, ...(isPlaylist ? s.thumbPlaylist : { backgroundImage: `url(https://img.youtube.com/vi/${video.embed_id}/default.jpg)` }) }}>
        <span style={s.thumbPlay}>{isPlaylist ? "PL" : "PLAY"}</span>
        {isPlaylist ? <span style={s.thumbCount}>{video.video_count || 1}</span> : null}
      </div>
      <div style={s.videoItemInfo}>
        <div style={{ ...s.videoItemTitle, color: active ? "var(--accent, #0e6163)" : "var(--text-primary, #1c2b3a)" }}>
          {video.title}
        </div>
        <div style={s.videoItemChannel}>{video.channel_name}</div>
        <div style={s.videoItemMeta}>
          <span style={{ ...s.smallLevel, color: levelColor[video.level] || "#888", background: `${levelColor[video.level] || "#888"}18` }}>
            {video.level}
          </span>
          <span>{isPlaylist ? `${video.video_count || 1} videos` : `${video.duration_hrs || 0.2}h`}</span>
        </div>
      </div>
    </button>
  );
}

function BooksTab({
  loading,
  books,
  expandedBook,
  setExpandedBook,
  userId,
  bookStatus,
  markBookStatus,
}: {
  loading: boolean;
  books: Book[];
  expandedBook: string | null;
  setExpandedBook: (id: string | null) => void;
  userId: string;
  bookStatus: Record<string, string>;
  markBookStatus: (bookId: string, status: string) => Promise<void>;
}) {
  if (loading) {
    return (
      <div style={s.booksGrid}>
        {Array.from({ length: 6 }).map((_, index) => <div key={index} style={s.bookSkeleton} />)}
      </div>
    );
  }

  if (books.length === 0) return <Empty title="No books found" />;

  return (
    <div>
      <div style={s.booksGrid}>
        {books.map((book) => {
          const isOpen = expandedBook === book.id;
          const status = bookStatus[book.id];
          const takeaways = parseTakeaways(book.key_takeaways);

          return (
            <article key={book.id} style={{ ...s.bookCard, ...(isOpen ? s.bookCardOpen : {}) }}>
              <div style={s.bookHeader}>
                <div style={{ ...s.bookCover, background: getCoverBg(book.category) }}>
                  <span style={s.bookCoverMark}>{getCoverMark(book.category)}</span>
                </div>
                <div style={s.bookInfo}>
                  <div style={s.bookMeta}>
                    <span style={{ ...s.diffBadge, color: DIFF_COLOR[book.difficulty] || "#888", background: `${DIFF_COLOR[book.difficulty] || "#888"}18` }}>
                      {book.difficulty}
                    </span>
                  </div>
                  <h3 style={s.bookTitle}>{book.title}</h3>
                  <p style={s.bookAuthor}>by {book.author}</p>
                  <p style={s.bookDesc}>{truncate(book.description, 120)}</p>
                </div>
              </div>

              <button onClick={() => setExpandedBook(isOpen ? null : book.id)} style={s.expandBtn} type="button">
                {isOpen ? "Show less" : "Key takeaways"}
              </button>

              {isOpen ? (
                <div style={s.bookExpanded}>
                  {book.why_read ? (
                    <div style={s.whyRead}>
                      <div style={s.takeawaysTitle}>Why read this</div>
                      <p style={s.whyReadText}>{book.why_read}</p>
                    </div>
                  ) : null}
                  <div style={s.takeawaysTitle}>Key takeaways</div>
                  <ul style={s.takeawaysList}>
                    {takeaways.slice(0, 5).map((item, index) => (
                      <li key={index} style={s.takeawayItem}>
                        <span style={s.takeawayBullet}>-</span>
                        <span style={s.takeawayText}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div style={s.bookFooter}>
                {userId ? (
                  <div style={s.statusBtns}>
                    {[
                      { id: "want_to_read", label: "Want" },
                      { id: "reading", label: "Reading" },
                      { id: "completed", label: "Done" },
                    ].map((item) => (
                      <button key={item.id} onClick={() => void markBookStatus(book.id, item.id)} style={{ ...s.statusBtn, ...(status === item.id ? s.statusBtnActive : {}) }} type="button">
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div style={s.bookLinks}>
                  {book.amazon_url ? <a href={book.amazon_url} target="_blank" rel="noopener noreferrer" style={s.buyLink}>Buy</a> : null}
                  {book.is_free_legal && book.free_pdf_url ? <a href={book.free_pdf_url} target="_blank" rel="noopener noreferrer" style={s.freeLink}>Free PDF</a> : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div style={s.disclaimer}>
        FinanceHub provides summaries and purchase links only. Free PDF links are only shown for legally free books.
      </div>
    </div>
  );
}

function LoadingList() {
  return (
    <div>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} style={s.loadingVideoItem}>
          <div style={s.loadingThumb} />
          <div style={s.loadingCopy}>
            <div style={s.loadingLine} />
            <div style={{ ...s.loadingLine, width: "58%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={s.empty}>
      <div style={s.emptyTitle}>{title}</div>
      {subtitle ? <div style={s.emptySub}>{subtitle}</div> : null}
    </div>
  );
}

function normalizeVideoType(video: Video): "video" | "playlist" {
  return video.video_type === "playlist" || video.embed_type === "playlist" ? "playlist" : "video";
}

function parseTakeaways(value: Book["key_takeaways"]) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function categoryLabel(category: string) {
  return CATEGORIES.find((item) => item.id === category)?.label || category;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function getCoverBg(category: string) {
  const colors: Record<string, string> = {
    "personal-finance": "#E1F5EE",
    investing: "#E6F1FB",
    "trading-markets": "#FAEEDA",
    "crypto-defi": "#FAECE7",
    "corporate-finance": "#EEEDFE",
    "behavioral-finance": "#FEF2F2",
  };
  return colors[category] || "#F5F5F3";
}

function getCoverMark(category: string) {
  const marks: Record<string, string> = {
    "personal-finance": "PF",
    investing: "IN",
    "trading-markets": "TR",
    "crypto-defi": "CR",
    "corporate-finance": "CF",
    "behavioral-finance": "BH",
  };
  return marks[category] || "BK";
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "var(--bg-page, #f7f4ee)", fontFamily: "var(--font-ui, system-ui)", padding: "20px 22px 60px", maxWidth: 1280, margin: "0 auto" },
  back: { fontSize: 13, color: "var(--text-muted, #718096)", textDecoration: "none", display: "block", marginBottom: 16 },
  hero: { background: "linear-gradient(135deg, #0D1117 0%, #1A2A40 60%, #0E6163 100%)", borderRadius: 16, padding: "32px 28px", marginBottom: 22 },
  heroBadge: { fontSize: 11, fontWeight: 700, color: "#1D9E75", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 },
  heroTitle: { fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 800, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.6px" },
  heroSub: { fontSize: 14, color: "#d1d5db", lineHeight: 1.7, margin: "0 0 18px", maxWidth: 620 },
  heroStats: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  heroStat: { fontSize: 14, color: "#d1d5db" },
  heroStatDot: { width: 3, height: 3, borderRadius: "50%", background: "#6b7280" },
  mainTabs: { display: "flex", gap: 6, marginBottom: 16 },
  mainTab: { padding: "9px 20px", fontSize: 13, fontWeight: 600, border: "1.5px solid var(--border, #e2ddd5)", borderRadius: 24, background: "var(--bg-card, #fff)", color: "var(--text-muted, #718096)", cursor: "pointer", fontFamily: "var(--font-ui, system-ui)", transition: "all 0.15s" },
  mainTabActive: { background: "#0a0a0a", color: "#fff", border: "1.5px solid #0a0a0a" },
  filtersWrap: { marginBottom: 20 },
  categoryRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 },
  catPill: { display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", fontSize: 12, border: "1px solid var(--border, #e2ddd5)", borderRadius: 20, background: "var(--bg-card, #fff)", color: "var(--text-muted, #718096)", cursor: "pointer", fontFamily: "var(--font-ui, system-ui)", transition: "all 0.15s" },
  catPillActive: { background: "#0a0a0a", color: "#fff", border: "1px solid #0a0a0a" },
  catMark: { fontSize: 9, fontWeight: 800, color: "#1D9E75" },
  filterRow: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: 220, padding: "8px 14px", fontSize: 13, border: "1px solid var(--border, #e2ddd5)", borderRadius: 9, outline: "none", fontFamily: "var(--font-ui, system-ui)", background: "var(--bg-card, #fff)", color: "var(--text-primary, #1c2b3a)" },
  levelRow: { display: "flex", gap: 4, background: "var(--bg-surface, #f5f5f3)", border: "1px solid var(--border, #e2ddd5)", borderRadius: 9, padding: 3, flexWrap: "wrap" },
  levelBtn: { padding: "5px 11px", fontSize: 11, fontWeight: 500, border: "none", borderRadius: 7, background: "transparent", color: "var(--text-muted, #718096)", cursor: "pointer", fontFamily: "var(--font-ui, system-ui)" },
  levelBtnActive: { background: "var(--bg-card, #fff)", color: "var(--text-primary, #1c2b3a)", fontWeight: 600, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  typeRow: { display: "flex", gap: 4, background: "var(--bg-surface, #f5f5f3)", border: "1px solid var(--border, #e2ddd5)", borderRadius: 9, padding: 3 },
  typeBtn: { padding: "5px 11px", fontSize: 11, fontWeight: 500, border: "none", borderRadius: 7, background: "transparent", color: "var(--text-muted, #718096)", cursor: "pointer", fontFamily: "var(--font-ui, system-ui)" },
  typeBtnActive: { background: "var(--bg-card, #fff)", color: "var(--text-primary, #1c2b3a)", fontWeight: 600, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  videosLayout: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 24, alignItems: "start" },
  playerCol: { position: "sticky", top: 80 },
  playerWrap: { background: "var(--bg-card, #fff)", border: "1px solid var(--border, #e2ddd5)", borderRadius: 14, padding: 18 },
  videoBadges: { display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" },
  playerEmpty: { background: "var(--bg-card, #fff)", border: "1.5px dashed var(--border, #e2ddd5)", borderRadius: 14, padding: "40px 20px", textAlign: "center" },
  playerEmptyTitle: { fontWeight: 600, fontSize: 15, color: "var(--text-secondary, #4a5568)", marginBottom: 6 },
  playerEmptySub: { fontSize: 13, color: "var(--text-muted, #718096)" },
  levelBadge: { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: "#E1F5EE", color: "#1D9E75" },
  catBadge: { fontSize: 10, color: "var(--text-muted, #718096)", background: "var(--bg-surface, #f5f5f3)", padding: "2px 8px", borderRadius: 12 },
  countBadge: { fontSize: 10, color: "var(--text-muted, #718096)", background: "var(--bg-surface, #f5f5f3)", padding: "2px 8px", borderRadius: 12 },
  disclaimer: { fontSize: 11, color: "var(--text-muted, #718096)", background: "var(--bg-surface, #f5f5f3)", borderRadius: 9, padding: "10px 14px", lineHeight: 1.6, marginTop: 14 },
  listCol: { background: "var(--bg-card, #fff)", border: "1px solid var(--border, #e2ddd5)", borderRadius: 14, padding: "10px 8px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" },
  listSection: { marginBottom: 16 },
  listSectionTitle: { fontSize: 11, fontWeight: 700, color: "var(--text-muted, #718096)", textTransform: "uppercase", letterSpacing: ".07em", padding: "4px 12px 8px", borderBottom: "1px solid var(--bg-surface, #f5f5f3)", marginBottom: 6 },
  videoItem: { width: "100%", display: "flex", gap: 10, textAlign: "left", padding: "10px 12px", borderRadius: "var(--radius-md, 10px)", cursor: "pointer", background: "transparent", border: "1.5px solid transparent", transition: "all 0.15s", marginBottom: 4, fontFamily: "var(--font-ui, system-ui)" },
  videoItemActive: { background: "var(--accent-light, #e6f3f3)", border: "1.5px solid var(--accent-muted, #6bb5b6)" },
  thumb: { width: 80, height: 52, borderRadius: 6, overflow: "hidden", flexShrink: 0, backgroundColor: "#0a0a0a", backgroundSize: "cover", backgroundPosition: "center", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" },
  thumbPlaylist: { background: "linear-gradient(135deg, #0f172a, #0e6163)" },
  thumbPlay: { color: "#fff", background: "rgba(0,0,0,0.5)", fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 4 },
  thumbCount: { position: "absolute", bottom: 2, right: 2, background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 4px", borderRadius: 3 },
  videoItemInfo: { flex: 1, minWidth: 0 },
  videoItemTitle: { fontSize: 13, fontWeight: 600, lineHeight: 1.4, marginBottom: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  videoItemChannel: { fontSize: 11, color: "var(--text-muted, #718096)", marginBottom: 4 },
  videoItemMeta: { display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", fontSize: 10, color: "var(--text-muted, #718096)" },
  smallLevel: { fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 10 },
  empty: { textAlign: "center", padding: "40px 20px", color: "var(--text-muted, #718096)" },
  emptyTitle: { fontWeight: 600, fontSize: 15, color: "var(--text-secondary, #4a5568)", marginBottom: 6 },
  emptySub: { fontSize: 13 },
  loadingVideoItem: { display: "flex", gap: 10, padding: "10px 12px", marginBottom: 4 },
  loadingThumb: { width: 80, height: 52, borderRadius: 6, background: "#eee", flexShrink: 0 },
  loadingCopy: { flex: 1, paddingTop: 4 },
  loadingLine: { height: 12, background: "#eee", borderRadius: 4, marginBottom: 7 },
  booksGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 },
  bookSkeleton: { height: 210, background: "var(--bg-surface, #f5f5f3)", borderRadius: 12 },
  bookCard: { background: "var(--bg-card, #fff)", border: "1px solid var(--border, #e2ddd5)", borderRadius: 14, padding: 18, transition: "border-color 0.2s" },
  bookCardOpen: { border: "1.5px solid var(--accent, #0e6163)" },
  bookHeader: { display: "flex", gap: 14, marginBottom: 12 },
  bookCover: { width: 60, height: 76, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  bookCoverMark: { fontSize: 13, fontWeight: 800, color: "#0a0a0a" },
  bookInfo: { flex: 1, minWidth: 0 },
  bookMeta: { marginBottom: 5 },
  diffBadge: { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12 },
  bookTitle: { fontSize: 14, fontWeight: 700, color: "var(--text-primary, #1c2b3a)", margin: "0 0 3px", letterSpacing: "-0.2px" },
  bookAuthor: { fontSize: 12, color: "var(--text-muted, #718096)", margin: "0 0 5px" },
  bookDesc: { fontSize: 12, color: "var(--text-secondary, #4a5568)", lineHeight: 1.5, margin: 0 },
  expandBtn: { width: "100%", padding: 7, fontSize: 12, color: "var(--accent, #0e6163)", background: "var(--accent-light, #e6f3f3)", border: "1px solid var(--accent-muted, #6bb5b6)", borderRadius: 8, cursor: "pointer", fontFamily: "var(--font-ui, system-ui)", fontWeight: 600, marginBottom: 10 },
  bookExpanded: { background: "var(--bg-surface, #f5f5f3)", borderRadius: 9, padding: 14, marginBottom: 12 },
  whyRead: { marginBottom: 12 },
  whyReadText: { fontSize: 13, color: "var(--text-secondary, #4a5568)", lineHeight: 1.6, margin: 0 },
  takeawaysTitle: { fontSize: 10, fontWeight: 700, color: "var(--text-muted, #718096)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 },
  takeawaysList: { listStyle: "none", padding: 0, margin: "0 0 12px" },
  takeawayItem: { display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" },
  takeawayBullet: { color: "var(--accent, #0e6163)", fontWeight: 700, flexShrink: 0, fontSize: 12, marginTop: 2 },
  takeawayText: { fontSize: 13, color: "var(--text-secondary, #4a5568)", lineHeight: 1.5 },
  bookFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  statusBtns: { display: "flex", gap: 5 },
  statusBtn: { padding: "4px 9px", fontSize: 10, fontWeight: 500, border: "1px solid var(--border, #e2ddd5)", borderRadius: 8, background: "var(--bg-card, #fff)", color: "var(--text-muted, #718096)", cursor: "pointer", fontFamily: "var(--font-ui, system-ui)" },
  statusBtnActive: { background: "var(--accent, #0e6163)", color: "#fff", border: "1px solid var(--accent, #0e6163)" },
  bookLinks: { display: "flex", gap: 8 },
  buyLink: { fontSize: 11, fontWeight: 600, color: "#185FA5", textDecoration: "none" },
  freeLink: { fontSize: 11, fontWeight: 600, color: "var(--accent, #0e6163)", textDecoration: "none", background: "var(--accent-light, #e6f3f3)", padding: "3px 9px", borderRadius: 8 },
};
