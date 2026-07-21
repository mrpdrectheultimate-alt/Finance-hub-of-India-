"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";

type Playlist = {
  id: string;
  title: string;
  channel_name: string;
  description: string | null;
  playlist_url: string;
  embed_id: string;
  embed_type: string;
  category: string;
  level: string;
  video_count: number;
  duration_hrs: number | null;
  curator_note: string | null;
  is_featured: boolean;
};

type Book = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
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

type Tab = "playlists" | "books";

const CATEGORIES = [
  { id: "all", label: "All", mark: "ALL" },
  { id: "personal-finance", label: "Personal Finance", mark: "PF" },
  { id: "trading-markets", label: "Trading", mark: "TR" },
  { id: "crypto-defi", label: "Crypto", mark: "CR" },
  { id: "corporate-finance", label: "Corporate", mark: "CF" },
  { id: "behavioral-finance", label: "Behavioral", mark: "BH" },
  { id: "general", label: "General", mark: "GN" },
];

const LEVELS = ["all", "beginner", "intermediate", "advanced"];

const DIFF_COLOR: Record<string, string> = {
  easy: "#1D9E75",
  medium: "#854F0B",
  advanced: "#B91C1C",
};

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>("playlists");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [bookStatus, setBookStatus] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState("");
  const [profileRole, setProfileRole] = useState("free");

  useEffect(() => {
    void loadUser();
  }, []);

  useEffect(() => {
    if (tab === "playlists") void loadPlaylists();
    else void loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, category, level]);

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);
    const [{ data: profile }, { data: reads }] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      supabase.from("user_book_reads" as never).select("book_id, status").eq("user_id", user.id),
    ]);

    setProfileRole(profile?.role || "free");
    const next: Record<string, string> = {};
    ((reads as { book_id: string; status: string }[] | null) || []).forEach((row) => {
      next[row.book_id] = row.status;
    });
    setBookStatus(next);
  };

  const loadPlaylists = async () => {
    setLoading(true);
    let query = supabase
      .from("curated_playlists" as never)
      .select("*")
      .eq("is_published", true);

    if (category !== "all") query = query.eq("category", category);
    if (level !== "all") query = query.eq("level", level);

    const { data } = await query
      .order("is_featured", { ascending: false })
      .order("view_count", { ascending: false });

    setPlaylists((data as Playlist[] | null) || []);
    setLoading(false);
  };

  const loadBooks = async () => {
    setLoading(true);
    let query = supabase
      .from("books" as never)
      .select("*")
      .eq("is_published", true);

    if (category !== "all") query = query.eq("category", category);
    if (level !== "all") {
      query = query.eq("difficulty", level === "beginner" ? "easy" : level === "intermediate" ? "medium" : "advanced");
    }

    const { data } = await query.order("created_at", { ascending: false });
    setBooks((data as Book[] | null) || []);
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

  const filteredPlaylists = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return playlists;
    return playlists.filter((playlist) =>
      playlist.title.toLowerCase().includes(term) ||
      playlist.channel_name.toLowerCase().includes(term) ||
      (playlist.description || "").toLowerCase().includes(term),
    );
  }, [playlists, search]);

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return books;
    return books.filter((book) =>
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.description.toLowerCase().includes(term),
    );
  }, [books, search]);

  return (
    <AppLayout userRole={profileRole}>
      <div style={s.page}>
        <Link href="/dashboard" style={s.back}>Dashboard</Link>

        <section style={s.hero}>
          <div style={s.heroBadge}>LIB</div>
          <h1 style={s.heroTitle}>Finance Library</h1>
          <p style={s.heroSub}>
            Curated video playlists from trusted educators plus the essential finance reading list.
          </p>
          <div style={s.heroStats}>
            <Stat num="25+" label="Curated playlists" />
            <div style={s.heroStatDivider} />
            <Stat num="500+" label="Free video hours" />
            <div style={s.heroStatDivider} />
            <Stat num="30" label="Essential books" />
          </div>
        </section>

        <div style={s.tabRow}>
          <button onClick={() => setTab("playlists")} style={{ ...s.tabBtn, ...(tab === "playlists" ? s.tabBtnActive : {}) }} type="button">
            Video Playlists
          </button>
          <button onClick={() => setTab("books")} style={{ ...s.tabBtn, ...(tab === "books" ? s.tabBtnActive : {}) }} type="button">
            Book Library
          </button>
        </div>

        <div style={s.filters}>
          <div style={s.catTabs}>
            {CATEGORIES.map((item) => (
              <button key={item.id} onClick={() => setCategory(item.id)} style={{ ...s.catBtn, ...(category === item.id ? s.catBtnActive : {}) }} type="button">
                <span style={s.catMark}>{item.mark}</span>
                {item.label}
              </button>
            ))}
          </div>
          <div style={s.filterRow}>
            <input
              placeholder={`Search ${tab}...`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={s.searchInput}
            />
            <div style={s.levelTabs}>
              {LEVELS.map((item) => (
                <button key={item} onClick={() => setLevel(item)} style={{ ...s.levelBtn, ...(level === item ? s.levelBtnActive : {}) }} type="button">
                  {capitalize(item)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {tab === "playlists" ? (
          <PlaylistsView loading={loading} playlists={filteredPlaylists} />
        ) : (
          <BooksView
            loading={loading}
            books={filteredBooks}
            expanded={expanded}
            setExpanded={setExpanded}
            userId={userId}
            bookStatus={bookStatus}
            markBookStatus={markBookStatus}
          />
        )}
      </div>
    </AppLayout>
  );
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div style={s.heroStat}>
      <span style={s.heroStatNum}>{num}</span>
      <span style={s.heroStatLabel}>{label}</span>
    </div>
  );
}

function PlaylistsView({ loading, playlists }: { loading: boolean; playlists: Playlist[] }) {
  const featured = playlists.filter((playlist) => playlist.is_featured);

  return (
    <div>
      {featured.length > 0 ? (
        <section style={s.section}>
          <div style={s.sectionTitle}>Editor's picks</div>
          <div style={s.featuredGrid}>
            {featured.slice(0, 3).map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} featured />)}
          </div>
        </section>
      ) : null}

      <section style={s.section}>
        <div style={s.sectionTitle}>All playlists ({playlists.length})</div>
        {loading ? <LoadingGrid /> : playlists.length === 0 ? <Empty msg="No playlists found for these filters." /> : (
          <div style={s.grid}>
            {playlists.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}
          </div>
        )}
      </section>

      <div style={s.disclaimer}>
        Videos are embedded from YouTube. FinanceHub does not host or download external video content.
      </div>
    </div>
  );
}

function PlaylistCard({ playlist, featured = false }: { playlist: Playlist; featured?: boolean }) {
  const [showEmbed, setShowEmbed] = useState(false);
  const levelColor: Record<string, string> = { beginner: "#1D9E75", intermediate: "#854F0B", advanced: "#B91C1C", all: "#185FA5" };

  const embedUrl = playlist.embed_type === "playlist"
    ? `https://www.youtube.com/embed/videoseries?list=${playlist.embed_id}&rel=0`
    : `https://www.youtube.com/embed/${playlist.embed_id}?rel=0`;

  return (
    <article style={{ ...s.playlistCard, ...(featured ? s.playlistCardFeatured : {}) }}>
      {playlist.is_featured ? <div style={s.featuredBadge}>Editor's pick</div> : null}
      <div style={s.plMeta}>
        <span style={{ ...s.plLevel, color: levelColor[playlist.level] || "#888", background: `${levelColor[playlist.level] || "#888"}18` }}>
          {playlist.level}
        </span>
        <span style={s.plVideos}>{playlist.video_count} videos / {playlist.duration_hrs || 0}h</span>
      </div>
      <h3 style={s.plTitle}>{playlist.title}</h3>
      <p style={s.plChannel}>{playlist.channel_name}</p>
      <p style={s.plDesc}>{truncate(playlist.description || "", 120)}</p>
      {playlist.curator_note ? <div style={s.curatorNote}>{playlist.curator_note}</div> : null}

      {showEmbed ? (
        <div style={s.embedWrap}>
          <iframe
            src={embedUrl}
            style={s.iframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title={playlist.title}
          />
          <button onClick={() => setShowEmbed(false)} style={s.hideBtn} type="button">Hide player</button>
        </div>
      ) : (
        <div style={s.plBtns}>
          <button onClick={() => setShowEmbed(true)} style={s.watchHereBtn} type="button">Watch here</button>
          <a href={playlist.playlist_url} target="_blank" rel="noopener noreferrer" style={s.ytBtn}>Open on YouTube</a>
        </div>
      )}
    </article>
  );
}

function BooksView({
  loading,
  books,
  expanded,
  setExpanded,
  userId,
  bookStatus,
  markBookStatus,
}: {
  loading: boolean;
  books: Book[];
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  userId: string;
  bookStatus: Record<string, string>;
  markBookStatus: (bookId: string, status: string) => Promise<void>;
}) {
  return (
    <section style={s.section}>
      <div style={s.sectionTitle}>{books.length} essential finance books</div>
      {loading ? <LoadingGrid /> : books.length === 0 ? <Empty msg="No books found for these filters." /> : (
        <div style={s.booksGrid}>
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isOpen={expanded === book.id}
              setExpanded={setExpanded}
              userId={userId}
              status={bookStatus[book.id]}
              markBookStatus={markBookStatus}
            />
          ))}
        </div>
      )}
      <div style={s.disclaimer}>
        FinanceHub provides summaries and purchase links only. Free PDF links should only be used for legally free books.
      </div>
    </section>
  );
}

function BookCard({
  book,
  isOpen,
  setExpanded,
  userId,
  status,
  markBookStatus,
}: {
  book: Book;
  isOpen: boolean;
  setExpanded: (id: string | null) => void;
  userId: string;
  status?: string;
  markBookStatus: (bookId: string, status: string) => Promise<void>;
}) {
  const takeaways = parseTakeaways(book.key_takeaways);

  return (
    <article style={{ ...s.bookCard, ...(isOpen ? s.bookCardOpen : {}) }}>
      <div style={s.bookHeader}>
        <div style={{ ...s.bookCover, background: getCoverColor(book.category) }}>
          <span style={s.coverIcon}>{getCoverMark(book.category)}</span>
        </div>
        <div style={s.bookInfo}>
          <div style={s.bookMeta}>
            <span style={{ ...s.diffBadge, color: DIFF_COLOR[book.difficulty] || "#888", background: `${DIFF_COLOR[book.difficulty] || "#888"}18` }}>
              {book.difficulty}
            </span>
            <span style={s.catBadge}>{book.category.replaceAll("-", " ")}</span>
          </div>
          <h3 style={s.bookTitle}>{book.title}</h3>
          <p style={s.bookAuthor}>by {book.author}</p>
          <p style={s.bookDesc}>{truncate(book.description, 140)}</p>
        </div>
      </div>

      <button onClick={() => setExpanded(isOpen ? null : book.id)} style={s.expandBtn} type="button">
        {isOpen ? "Show less" : "Key takeaways and why read"}
      </button>

      {isOpen ? (
        <div style={s.bookExpanded}>
          {book.why_read ? (
            <div style={s.whyRead}>
              <div style={s.whyReadTitle}>Why read this</div>
              <p style={s.whyReadText}>{book.why_read}</p>
            </div>
          ) : null}
          <div style={s.takeawaysTitle}>Key takeaways</div>
          <ul style={s.takeawaysList}>
            {takeaways.map((item, index) => (
              <li key={`${book.id}-${index}`} style={s.takeawayItem}>
                <span style={s.takeawayBullet}>-</span>
                <span style={s.takeawayText}>{item}</span>
              </li>
            ))}
          </ul>
          {book.best_for?.length ? (
            <div style={s.bestFor}>
              Best for:
              {book.best_for.map((item) => <span key={item} style={s.bestForTag}>{item}</span>)}
            </div>
          ) : null}
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
              <button
                key={item.id}
                onClick={() => void markBookStatus(book.id, item.id)}
                style={{ ...s.statusBtn, ...(status === item.id ? s.statusBtnActive : {}) }}
                type="button"
              >
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
}

function Empty({ msg }: { msg: string }) {
  return <div style={s.empty}>{msg}</div>;
}

function LoadingGrid() {
  return (
    <div style={s.grid}>
      {Array.from({ length: 6 }).map((_, index) => <div key={index} style={s.skeleton} />)}
    </div>
  );
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

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getCoverColor(category: string) {
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
  page: { minHeight: "100vh", background: "var(--bg-page, #fafafa)", fontFamily: "system-ui,-apple-system,sans-serif", padding: "24px 24px 60px", maxWidth: 1120, margin: "0 auto" },
  back: { fontSize: 13, color: "var(--text-muted, #888)", textDecoration: "none", display: "block", marginBottom: 16 },
  hero: { background: "#0a0a0a", borderRadius: 16, padding: "36px 32px", marginBottom: 24, textAlign: "center" },
  heroBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 11, background: "#1D9E75", color: "#fff", fontWeight: 800, fontSize: 12, marginBottom: 12 },
  heroTitle: { fontSize: 30, fontWeight: 800, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.7px" },
  heroSub: { fontSize: 15, color: "#aaa", margin: "0 auto 24px", maxWidth: 620, lineHeight: 1.6 },
  heroStats: { display: "flex", justifyContent: "center", gap: 0, flexWrap: "wrap" },
  heroStat: { display: "flex", flexDirection: "column", alignItems: "center", padding: "0 24px" },
  heroStatNum: { fontSize: 26, fontWeight: 800, color: "#1D9E75", letterSpacing: "-0.5px" },
  heroStatLabel: { fontSize: 11, color: "#777", marginTop: 2 },
  heroStatDivider: { width: 1, background: "#333", margin: "4px 0" },
  tabRow: { display: "flex", gap: 8, marginBottom: 16 },
  tabBtn: { padding: "10px 22px", fontSize: 13, fontWeight: 700, border: "0.5px solid var(--border, #ddd)", borderRadius: 24, background: "var(--bg-card, #fff)", color: "var(--text-secondary, #666)", cursor: "pointer", fontFamily: "system-ui" },
  tabBtnActive: { background: "var(--text-primary, #0a0a0a)", color: "var(--bg-card, #fff)", border: "0.5px solid var(--text-primary, #0a0a0a)" },
  filters: { marginBottom: 20 },
  catTabs: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 },
  catBtn: { display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 12, border: "0.5px solid var(--border, #ddd)", borderRadius: 20, background: "var(--bg-card, #fff)", color: "var(--text-secondary, #666)", cursor: "pointer", fontFamily: "system-ui" },
  catMark: { fontSize: 9, fontWeight: 800, color: "#1D9E75" },
  catBtnActive: { background: "var(--text-primary, #0a0a0a)", color: "var(--bg-card, #fff)", border: "0.5px solid var(--text-primary, #0a0a0a)" },
  filterRow: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: 240, padding: "9px 14px", fontSize: 13, border: "0.5px solid var(--border, #ddd)", borderRadius: 9, outline: "none", fontFamily: "system-ui" },
  levelTabs: { display: "flex", gap: 4, flexWrap: "wrap" },
  levelBtn: { padding: "7px 12px", fontSize: 11, fontWeight: 600, border: "0.5px solid var(--border, #ddd)", borderRadius: 20, background: "var(--bg-card, #fff)", color: "var(--text-secondary, #666)", cursor: "pointer", fontFamily: "system-ui" },
  levelBtnActive: { background: "#1D9E75", color: "#fff", border: "0.5px solid #1D9E75" },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "var(--text-secondary, #555)", marginBottom: 14 },
  featuredGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: 14, marginBottom: 28 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 14 },
  playlistCard: { background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 14, padding: 18 },
  playlistCardFeatured: { border: "1.5px solid #1D9E75" },
  featuredBadge: { fontSize: 10, fontWeight: 800, color: "#1D9E75", background: "#E1F5EE", padding: "2px 8px", borderRadius: 10, display: "inline-block", marginBottom: 8 },
  plMeta: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 },
  plLevel: { fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 12 },
  plVideos: { fontSize: 11, color: "var(--text-muted, #888)" },
  plTitle: { fontSize: 15, fontWeight: 750, color: "var(--text-primary, #0a0a0a)", margin: "0 0 4px", letterSpacing: "-0.3px" },
  plChannel: { fontSize: 12, color: "var(--text-muted, #888)", margin: "0 0 6px" },
  plDesc: { fontSize: 12, color: "var(--text-secondary, #666)", lineHeight: 1.5, margin: "0 0 10px" },
  curatorNote: { background: "#F0FAF6", borderRadius: 8, padding: "8px 10px", marginBottom: 12, fontSize: 11, color: "#0F6E56", lineHeight: 1.5 },
  embedWrap: { borderRadius: 10, overflow: "hidden", marginBottom: 10 },
  iframe: { width: "100%", aspectRatio: "16/9", border: "none", display: "block" },
  hideBtn: { width: "100%", padding: 8, fontSize: 11, color: "#888", background: "#fafafa", border: "0.5px solid #eee", borderRadius: "0 0 10px 10px", cursor: "pointer", fontFamily: "system-ui" },
  plBtns: { display: "flex", gap: 8, flexWrap: "wrap" },
  watchHereBtn: { flex: 1, padding: 9, fontSize: 12, fontWeight: 700, border: "none", borderRadius: 9, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  ytBtn: { padding: "9px 14px", fontSize: 12, fontWeight: 600, border: "0.5px solid var(--border, #ddd)", borderRadius: 9, color: "var(--text-secondary, #555)", textDecoration: "none", display: "flex", alignItems: "center" },
  booksGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px,1fr))", gap: 14 },
  bookCard: { background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #e5e5e5)", borderRadius: 14, padding: 18, transition: "border-color .2s" },
  bookCardOpen: { border: "1.5px solid #1D9E75" },
  bookHeader: { display: "flex", gap: 14, marginBottom: 12 },
  bookCover: { width: 64, height: 80, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  coverIcon: { fontSize: 13, fontWeight: 800, color: "#0a0a0a" },
  bookInfo: { flex: 1, minWidth: 0 },
  bookMeta: { display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" },
  diffBadge: { fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 12 },
  catBadge: { fontSize: 10, color: "#888", background: "#f0f0f0", padding: "2px 8px", borderRadius: 12 },
  bookTitle: { fontSize: 14, fontWeight: 750, color: "var(--text-primary, #0a0a0a)", margin: "0 0 3px", letterSpacing: "-0.2px" },
  bookAuthor: { fontSize: 12, color: "var(--text-muted, #888)", margin: "0 0 5px" },
  bookDesc: { fontSize: 12, color: "var(--text-secondary, #666)", lineHeight: 1.5, margin: 0 },
  expandBtn: { width: "100%", padding: 8, fontSize: 12, color: "#1D9E75", background: "#F0FAF6", border: "0.5px solid #9FE1CB", borderRadius: 8, cursor: "pointer", fontFamily: "system-ui", fontWeight: 700, marginBottom: 10 },
  bookExpanded: { background: "var(--bg-surface, #fafafa)", borderRadius: 9, padding: 14, marginBottom: 12 },
  whyRead: { marginBottom: 12 },
  whyReadTitle: { fontSize: 10, fontWeight: 800, color: "var(--text-muted, #888)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 5 },
  whyReadText: { fontSize: 13, color: "var(--text-secondary, #333)", lineHeight: 1.6, margin: 0 },
  takeawaysTitle: { fontSize: 10, fontWeight: 800, color: "var(--text-muted, #888)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 },
  takeawaysList: { listStyle: "none", padding: 0, margin: "0 0 12px" },
  takeawayItem: { display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7 },
  takeawayBullet: { color: "#1D9E75", fontWeight: 800, flexShrink: 0, fontSize: 12, marginTop: 1 },
  takeawayText: { fontSize: 13, color: "var(--text-secondary, #444)", lineHeight: 1.5 },
  bestFor: { fontSize: 11, color: "var(--text-muted, #888)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  bestForTag: { background: "var(--bg-surface, #eee)", padding: "2px 8px", borderRadius: 10, fontSize: 10 },
  bookFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  statusBtns: { display: "flex", gap: 5 },
  statusBtn: { padding: "5px 9px", fontSize: 10, fontWeight: 600, border: "0.5px solid var(--border, #ddd)", borderRadius: 8, background: "var(--bg-card, #fff)", color: "var(--text-secondary, #666)", cursor: "pointer", fontFamily: "system-ui" },
  statusBtnActive: { background: "#1D9E75", color: "#fff", border: "0.5px solid #1D9E75" },
  bookLinks: { display: "flex", gap: 8 },
  buyLink: { fontSize: 11, fontWeight: 700, color: "#185FA5", textDecoration: "none" },
  freeLink: { fontSize: 11, fontWeight: 700, color: "#1D9E75", textDecoration: "none", background: "#E1F5EE", padding: "3px 9px", borderRadius: 8 },
  disclaimer: { background: "var(--bg-card, #fff)", border: "0.5px solid var(--border, #eee)", borderRadius: 10, padding: "12px 14px", fontSize: 11, color: "var(--text-muted, #888)", lineHeight: 1.6, marginTop: 20 },
  skeleton: { height: 220, background: "var(--bg-surface, #eee)", borderRadius: 12 },
  empty: { textAlign: "center", padding: 40, color: "var(--text-muted, #888)", fontSize: 14 },
};
