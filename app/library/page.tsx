"use client";

import { useEffect, useMemo, useState, useRef, type CSSProperties } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { supabase } from "@/lib/supabase";
import {
  BookOpen,
  Search,
  ExternalLink,
  ChevronDown,
  Check,
  Sparkles,
  Bookmark,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Share2,
  Star,
  Flame,
  Award,
} from "lucide-react";

// ============================================================
// FinanceHub — World-Class Finance Library
// app/library/page.tsx
// Curated Book Vault & Masterclasses · 15 Verified Book Covers
// Split-Header Card Anatomy · Responsive Filters · Zero Toolbar Overlap
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

import { type Book, VERIFIED_LIBRARY_BOOKS } from "@/lib/booksData";

type Tab = "books" | "videos";
type TypeFilter = "all" | "video" | "playlist";
type SortOption = "recommended" | "popular" | "difficulty-asc" | "difficulty-desc" | "title-asc" | "author-asc";

// Category Definitions with color tokens and icons
const CATEGORIES = [
  { id: "all", label: "All Topics", icon: "📚", color: "#0E6163" },
  { id: "personal-finance", label: "Personal Finance", icon: "💰", color: "#059669" },
  { id: "investing", label: "Stock Market & Investing", icon: "📈", color: "#2563EB" },
  { id: "trading-markets", label: "Trading & Markets", icon: "⚡", color: "#DC2626" },
  { id: "corporate-finance", label: "Corporate Finance & Startups", icon: "🏢", color: "#7C3AED" },
  { id: "behavioral-finance", label: "Behavioral Finance", icon: "🧠", color: "#D97706" },
  { id: "crypto-defi", label: "Global Macro & Crypto", icon: "💱", color: "#0891B2" },
];

const QUICK_DISCOVERY_TAGS = [
  { id: "all", label: "All Titles" },
  { id: "beginner", label: "🌱 Beginner-Friendly" },
  { id: "investing", label: "📈 Investing Essentials" },
  { id: "trading", label: "⚡ Trading & Technicals" },
  { id: "behavioral", label: "🧠 Mindset & Biases" },
  { id: "india", label: "🇮🇳 Indian Context" },
  { id: "founder", label: "🚀 Startups & Founders" },
  { id: "macro", label: "🌐 Macro & Monetary" },
];

const DIFFICULTY_CONFIG: Record<string, { label: string; text: string; bg: string; border: string }> = {
  easy: { label: "Beginner", text: "#047857", bg: "#ECFDF5", border: "#A7F3D0" },
  medium: { label: "Intermediate", text: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  advanced: { label: "Advanced", text: "#4338CA", bg: "#EEF2FF", border: "#C7D2FE" },
};

// ─── Resilient Book Cover Component ───────────────────────────

function BookCoverThumbnail({
  title,
  author,
  coverUrl,
  category,
}: {
  title: string;
  author: string;
  coverUrl?: string | null;
  category: string;
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Gradient selection based on category for photorealistic tactile fallback
  const fallbackGradients: Record<string, string> = {
    "personal-finance": "linear-gradient(145deg, #064E3B 0%, #065F46 60%, #047857 100%)",
    investing: "linear-gradient(145deg, #1E3A8A 0%, #1E40AF 60%, #2563EB 100%)",
    "trading-markets": "linear-gradient(145deg, #7F1D1D 0%, #991B1B 60%, #DC2626 100%)",
    "behavioral-finance": "linear-gradient(145deg, #78350F 0%, #92400E 60%, #B45309 100%)",
    "corporate-finance": "linear-gradient(145deg, #4C1D95 0%, #5B21B6 60%, #6D28D9 100%)",
  };

  const bgGradient = fallbackGradients[category] || "linear-gradient(145deg, #0A1628 0%, #0F3D3E 100%)";

  return (
    <div className="relative w-[100px] min-w-[100px] h-[150px] sm:w-[110px] sm:min-w-[110px] sm:h-[165px] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-[1.03] group-hover:shadow-xl bg-slate-100 flex-shrink-0">
      {/* 3D Book Spine Left Shadow */}
      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 to-transparent z-20 pointer-events-none" />
      {/* Glossy top-right sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 z-10 pointer-events-none" />

      {coverUrl && !imgError ? (
        <>
          <img
            src={coverUrl}
            alt={`Book cover of ${title}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {!imgLoaded && (
            <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center text-slate-400">
              <BookOpen className="w-6 h-6" />
            </div>
          )}
        </>
      ) : (
        /* Tactile Embossed Fallback Book Cover */
        <div
          style={{ background: bgGradient }}
          className="w-full h-full p-2.5 flex flex-col justify-between text-white select-none relative"
        >
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-emerald-300 font-bold opacity-80">
              FinanceHub
            </div>
            <h5 className="text-[11px] font-bold leading-tight line-clamp-3 text-amber-100">
              {title}
            </h5>
          </div>
          <div className="pt-2 border-t border-white/20">
            <p className="text-[9px] text-white/80 font-medium truncate">{author}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Library Page Component ───────────────────────────────

export default function FinanceLibraryPage() {
  const [tab, setTab] = useState<Tab>("books");
  const [books, setBooks] = useState<Book[]>(VERIFIED_LIBRARY_BOOKS);
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  // Filters & Search
  const [category, setCategory] = useState("all");
  const [discoveryFilter, setDiscoveryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  // Interaction State
  const [expandedTakeaways, setExpandedTakeaways] = useState<Record<string, boolean>>({});
  const [bookStatus, setBookStatus] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState("");
  const [profileRole, setProfileRole] = useState("free");
  const [loading, setLoading] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load: User & Progress
  useEffect(() => {
    async function initUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);
        const [{ data: profile }, { data: reads }] = await Promise.all([
          supabase.from("profiles").select("role").eq("id", user.id).single(),
          supabase.from("user_book_reads" as never).select("book_id, status").eq("user_id", user.id),
        ]);

        setProfileRole((profile as { role?: string } | null)?.role || "free");

        const statusMap: Record<string, string> = {};
        ((reads as unknown as Array<{ book_id: string; status: string }> | null) || []).forEach((row) => {
          statusMap[row.book_id] = row.status;
        });
        setBookStatus(statusMap);
      } catch (err) {
        console.error("Error loading user in library:", err);
      }
    }
    initUser();
  }, []);

  // 2. Fetch Books & Videos from Supabase
  useEffect(() => {
    if (tab === "videos") {
      loadVideos();
    } else {
      loadBooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("books" as never)
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const dbList = data as unknown as Book[];
        const dbMap = new Map(dbList.map((b) => [b.title.toLowerCase(), b]));

        // Merge DB data with local verified rich metadata
        const mergedVerified = VERIFIED_LIBRARY_BOOKS.map((vb) => {
          const dbBook = dbMap.get(vb.title.toLowerCase());
          if (!dbBook) return vb;
          return {
            ...vb,
            ...dbBook,
            cover_url: dbBook.cover_url || vb.cover_url,
            pages: dbBook.pages || vb.pages,
            year_published: dbBook.year_published || vb.year_published,
            badge: dbBook.badge || vb.badge,
            key_takeaways: (dbBook.key_takeaways ?? vb.key_takeaways) as string[] | string | null,
            why_read: dbBook.why_read ?? vb.why_read,
          };
        });

        // Any DB books that are not in verified list
        const extraDbBooks = dbList.filter(
          (db) => !VERIFIED_LIBRARY_BOOKS.some((vb) => vb.title.toLowerCase() === db.title.toLowerCase())
        );

        setBooks([...mergedVerified, ...extraDbBooks]);
      } else {
        setBooks(VERIFIED_LIBRARY_BOOKS);
      }
    } catch (e) {
      console.warn("Using verified local books repository:", e);
      setBooks(VERIFIED_LIBRARY_BOOKS);
    }
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("curated_playlists" as never)
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      const rows = (data as unknown as Video[]) || [];
      setVideos(rows);
      setActiveVideo((cur) => {
        if (cur && rows.some((v) => v.id === cur.id)) return cur;
        return rows.find((v) => v.is_featured) || rows[0] || null;
      });
    } catch (e) {
      console.error("Error loading videos:", e);
    } finally {
      setLoading(false);
    }
  };

  // 3. Update Book Reading Status
  const handleMarkStatus = async (bookId: string, status: string) => {
    if (!userId) return;
    try {
      await supabase.from("user_book_reads" as never).upsert(
        {
          user_id: userId,
          book_id: bookId,
          status,
          started_at: status === "reading" ? new Date().toISOString() : undefined,
          completed_at: status === "completed" ? new Date().toISOString() : undefined,
        } as never,
        { onConflict: "user_id,book_id" }
      );
      setBookStatus((prev) => ({ ...prev, [bookId]: status }));
    } catch (e) {
      console.error("Error updating book read status:", e);
    }
  };

  // 4. Toggle Accordion Takeaways
  const toggleTakeaways = (bookId: string) => {
    setExpandedTakeaways((prev) => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  };

  // 5. Parse Takeaways helper
  const getParsedTakeaways = (takeaways: Book["key_takeaways"]): string[] => {
    if (Array.isArray(takeaways)) return takeaways;
    if (!takeaways) return [];
    try {
      const parsed = JSON.parse(takeaways);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // 6. Filter & Sort Books Logic
  const filteredAndSortedBooks = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = books.filter((b) => {
      // Category filter
      if (category !== "all") {
        if (b.category !== category) {
          return false;
        }
      }

      // Difficulty filter
      if (difficultyFilter !== "all" && b.difficulty !== difficultyFilter) {
        return false;
      }

      // Quick discovery tag filter
      if (discoveryFilter === "beginner" && b.difficulty !== "easy") return false;
      if (discoveryFilter === "investing" && b.category !== "investing") return false;
      if (discoveryFilter === "trading" && b.category !== "trading-markets") return false;
      if (discoveryFilter === "behavioral" && b.category !== "behavioral-finance") return false;
      if (discoveryFilter === "macro" && b.category !== "crypto-defi") return false;
      if (
        discoveryFilter === "india" &&
        !(
          b.badge?.includes("🇮🇳") ||
          b.title.toLowerCase().includes("let's talk money") ||
          b.title.toLowerCase().includes("coffee can") ||
          b.title.toLowerCase().includes("diamonds in the dust") ||
          b.author.toLowerCase().includes("halan") ||
          b.author.toLowerCase().includes("mukherjea")
        )
      ) {
        return false;
      }
      if (
        discoveryFilter === "founder" &&
        b.category !== "corporate-finance" &&
        !b.best_for?.includes("founder")
      ) {
        return false;
      }

      // Search term
      if (term) {
        const matchesTitle = b.title.toLowerCase().includes(term);
        const matchesAuthor = b.author.toLowerCase().includes(term);
        const matchesDesc = b.description.toLowerCase().includes(term);
        const matchesWhy = (b.why_read || "").toLowerCase().includes(term);
        if (!matchesTitle && !matchesAuthor && !matchesDesc && !matchesWhy) return false;
      }

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === "title-asc") return a.title.localeCompare(b.title);
      if (sortBy === "author-asc") return a.author.localeCompare(b.author);
      if (sortBy === "difficulty-asc") {
        const order: Record<string, number> = { easy: 1, medium: 2, advanced: 3 };
        return (order[a.difficulty] || 2) - (order[b.difficulty] || 2);
      }
      if (sortBy === "difficulty-desc") {
        const order: Record<string, number> = { easy: 1, medium: 2, advanced: 3 };
        return (order[b.difficulty] || 2) - (order[a.difficulty] || 2);
      }
      return 0; // Default recommended order
    });
  }, [books, category, difficultyFilter, discoveryFilter, search, sortBy]);

  // Video Filtering
  const filteredVideos = useMemo(() => {
    const term = search.trim().toLowerCase();
    return videos.filter((v) => {
      const matchesSearch =
        !term ||
        v.title.toLowerCase().includes(term) ||
        v.channel_name.toLowerCase().includes(term) ||
        (v.description || "").toLowerCase().includes(term);
      const matchesType = typeFilter === "all" || v.video_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [videos, search, typeFilter]);

  const playlistCount = useMemo(
    () => videos.filter((v) => v.video_type === "playlist" || v.embed_type === "playlist").length,
    [videos]
  );
  const singleVideoCount = useMemo(
    () => videos.filter((v) => v.video_type !== "playlist" && v.embed_type !== "playlist").length,
    [videos]
  );

  const resetFilters = () => {
    setCategory("all");
    setDiscoveryFilter("all");
    setDifficultyFilter("all");
    setSearch("");
    setSortBy("recommended");
  };

  const hasActiveFilters =
    category !== "all" ||
    discoveryFilter !== "all" ||
    difficultyFilter !== "all" ||
    Boolean(search) ||
    sortBy !== "recommended";

  return (
    <AppLayout userRole={profileRole}>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 antialiased">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

          {/* ══════════════════════════════════════════════════════════ */}
          {/* BREADCRUMBS                                                */}
          {/* ══════════════════════════════════════════════════════════ */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
            <Link
              href="/dashboard"
              className="hover:text-emerald-700 transition-colors flex items-center gap-1.5"
            >
              <span>←</span> Back to Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">Finance Library</span>
          </nav>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* HERO BANNER WITH EDITORIAL DEPTH                           */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div
            className="relative rounded-3xl overflow-hidden mb-10 p-8 sm:p-12 text-white shadow-xl shadow-slate-900/10"
            style={{
              background:
                "linear-gradient(135deg, #0A192F 0%, #0E4B4C 50%, #0A2E2F 100%)",
            }}
          >
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold tracking-wider uppercase mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  Curated Knowledge Vault
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white leading-tight">
                  Finance Library
                </h1>

                <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  Master the timeless mental models of history’s greatest investors, founders, and economists — distilled into actionable insights, verified covers, and structured breakdowns.
                </p>

                {/* Live Stat Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <strong>{books.length}</strong> Curated Books
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-100">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <strong>115</strong> Curated Videos
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-100">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <strong>4</strong> Master Playlists
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                    100% Free Core
                  </span>
                </div>
              </div>

              {/* Decorative Floating 3D Book Graphic */}
              <div className="hidden lg:flex items-center justify-center relative pr-4">
                <div className="relative w-36 h-48 bg-gradient-to-br from-emerald-800 to-slate-900 rounded-xl shadow-2xl border border-white/20 transform rotate-6 hover:rotate-3 transition-transform duration-300 p-3 flex flex-col justify-between">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-300">
                    Vault Selection
                  </div>
                  <div className="text-center font-serif text-sm font-bold text-amber-100">
                    The Psychology of Money
                  </div>
                  <div className="text-[9px] text-right text-slate-400">Morgan Housel</div>
                </div>
                <div className="absolute -left-6 top-6 w-32 h-44 bg-gradient-to-br from-blue-900 to-slate-900 rounded-xl shadow-2xl border border-white/20 transform -rotate-6 hover:-rotate-3 transition-transform duration-300 p-3 flex flex-col justify-between">
                  <div className="text-[9px] uppercase font-mono tracking-wider text-blue-300">
                    Classic
                  </div>
                  <div className="text-center font-serif text-xs font-bold text-slate-100">
                    The Intelligent Investor
                  </div>
                  <div className="text-[9px] text-right text-slate-400">Benjamin Graham</div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* PRIMARY TABS: BOOK SUMMARIES VS VIDEOS & PLAYLISTS         */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div className="flex items-center gap-2 mb-8 bg-slate-200/80 p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setTab("books")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                tab === "books"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Book Summaries</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-semibold">
                {books.length}
              </span>
            </button>

            <button
              onClick={() => setTab("videos")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                tab === "videos"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🎬</span>
              <span>Videos &amp; Playlists</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-semibold">
                {videos.length || 115}
              </span>
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 1: BOOK SUMMARIES VIEW                                */}
          {/* ══════════════════════════════════════════════════════════ */}
          {tab === "books" && (
            <div className="space-y-6">

              {/* Search Bar + Controls */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search books by title, author, or keyword (e.g., 'compounding', 'Graham', 'insurance')..."
                      className="w-full h-12 pl-11 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-teal-700 focus:bg-white transition-all text-slate-900"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Difficulty Select */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-teal-700 cursor-pointer"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">Easy / Beginner</option>
                      <option value="medium">Medium / Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>

                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-teal-700 cursor-pointer"
                    >
                      <option value="recommended">Sort: Recommended</option>
                      <option value="difficulty-asc">Difficulty: Easy → Hard</option>
                      <option value="difficulty-desc">Difficulty: Hard → Easy</option>
                      <option value="title-asc">Title: A → Z</option>
                      <option value="author-asc">Author: A → Z</option>
                    </select>
                  </div>
                </div>

                {/* Topic Filter Pills (Responsive Wrapping, Zero Clipping) */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Topics:
                  </span>
                  {CATEGORIES.map((cat) => {
                    const isActive = category === cat.id;
                    const count =
                      cat.id === "all"
                        ? books.length
                        : books.filter((b) => b.category === cat.id).length;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isActive
                            ? "bg-[#0E6163] text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isActive ? "bg-white/20 text-white" : "bg-white text-slate-500 font-semibold"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Discovery Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Filter:</span>
                  {QUICK_DISCOVERY_TAGS.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => setDiscoveryFilter(tag.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        discoveryFilter === tag.id
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Header Strip */}
              <div className="flex items-center justify-between px-1">
                <div className="text-xs sm:text-sm font-semibold text-slate-600">
                  Showing <strong className="text-slate-900">{filteredAndSortedBooks.length}</strong> of {books.length} curated finance books
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                  >
                    <span>✕</span> Reset all filters
                  </button>
                )}
              </div>

              {/* ════════════════════════════════════════════════════════ */}
              {/* BOOK CARDS GRID (3-COLUMN RESPONSIVE LAYOUT)             */}
              {/* ════════════════════════════════════════════════════════ */}
              {filteredAndSortedBooks.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center my-8">
                  <div className="text-5xl mb-3">📖</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No matching books found</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-md mx-auto">
                    We could not find any books matching your current filters or search query. Try broadening your criteria.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-2.5 rounded-xl bg-[#0E6163] text-white text-xs font-bold hover:bg-[#0A4A4C] transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedBooks.map((book) => {
                    const isExpanded = Boolean(expandedTakeaways[book.id]);
                    const takeaways = getParsedTakeaways(book.key_takeaways);
                    const status = bookStatus[book.id];
                    const diffInfo = DIFFICULTY_CONFIG[book.difficulty] || DIFFICULTY_CONFIG.medium;

                    return (
                      <article
                        key={book.id}
                        className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#0E6163]/40 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col overflow-hidden group"
                      >
                        {/* ── TOP SECTION: Book Cover + Meta ── */}
                        <div className="p-5 flex gap-4 bg-gradient-to-b from-slate-50/50 to-white border-b border-slate-100">
                          {/* 2:3 Portrait Book Cover Thumbnail */}
                          <BookCoverThumbnail
                            title={book.title}
                            author={book.author}
                            coverUrl={book.cover_url}
                            category={book.category}
                          />

                          {/* Metadata, Title, and Author */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                              {/* Difficulty Pill */}
                              <span
                                style={{
                                  backgroundColor: diffInfo.bg,
                                  color: diffInfo.text,
                                  borderColor: diffInfo.border,
                                }}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wide uppercase font-mono"
                              >
                                {diffInfo.label}
                              </span>

                              {/* Curated Special Badge */}
                              {book.badge && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                  {book.badge}
                                </span>
                              )}
                            </div>

                            {/* Book Title */}
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-[#0E6163] transition-colors mb-1 line-clamp-2">
                              {book.title}
                            </h3>

                            {/* Author */}
                            <p className="text-xs font-medium text-slate-500 mb-2 truncate">
                              by <strong className="text-slate-700 font-semibold">{book.author}</strong>
                            </p>

                            {/* Specs (Year & Pages) */}
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                              {book.year_published && <span>Yr: {book.year_published}</span>}
                              {book.pages && <span>• {book.pages} pages</span>}
                              <span>• {takeaways.length} insights</span>
                            </div>
                          </div>
                        </div>

                        {/* ── CARD BODY: Description & Quote ── */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          {/* Description */}
                          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-3">
                            {book.description}
                          </p>

                          {/* "Why Read This" Editorial Quote Callout */}
                          {book.why_read && (
                            <div className="p-3.5 rounded-xl bg-teal-50/50 border-l-4 border-[#0E6163] text-xs text-slate-700 space-y-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-[#0E6163] flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Why Read This
                              </div>
                              <p className="italic leading-relaxed text-slate-800 font-serif">
                                "{book.why_read}"
                              </p>
                            </div>
                          )}

                          {/* ── KEY TAKEAWAYS ACCORDION WITH INLINE PREVIEW ── */}
                          {takeaways.length > 0 && (
                            <div className="pt-2 border-t border-slate-100">
                              {/* Always Visible Key Insight #1 */}
                              {!isExpanded && (
                                <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 mb-2 flex items-start gap-2">
                                  <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                                  <span className="line-clamp-2 leading-relaxed">
                                    <strong className="text-slate-900 font-semibold">Key Insight:</strong>{" "}
                                    {takeaways[0]}
                                  </span>
                                </div>
                              )}

                              {/* Expand/Collapse Toggle Button */}
                              <button
                                type="button"
                                onClick={() => toggleTakeaways(book.id)}
                                className="w-full flex items-center justify-between text-xs font-bold text-[#0E6163] hover:text-[#0A4A4C] transition-colors py-1 group/btn"
                              >
                                <span className="flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  <span>
                                    {isExpanded
                                      ? "Hide Detailed Takeaways"
                                      : `View All ${takeaways.length} Key Insights`}
                                  </span>
                                </span>
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform duration-200 ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </button>

                              {/* Expanded Full Takeaways List */}
                              {isExpanded && (
                                <ul className="space-y-2 pt-3 pb-1">
                                  {takeaways.map((point, pIdx) => (
                                    <li
                                      key={pIdx}
                                      className="text-xs text-slate-700 leading-relaxed flex items-start gap-2 bg-slate-50/70 p-2 rounded-lg border border-slate-100"
                                    >
                                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                        {pIdx + 1}
                                      </span>
                                      <span className="flex-1">{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}

                          {/* ── CARD FOOTER ACTIONS ── */}
                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                            {/* Purchase or Read Link */}
                            {book.is_free_legal && book.free_pdf_url ? (
                              <a
                                href={book.free_pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                              >
                                <span>Read Free PDF</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : book.amazon_url ? (
                              <a
                                href={book.amazon_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E6163] hover:text-[#0A4A4C] hover:underline bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                              >
                                <span>Find Book</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <div />
                            )}

                            {/* Reading Status Selector for Logged-In Users */}
                            {userId ? (
                              <div className="flex items-center gap-1">
                                {[
                                  { id: "want_to_read", label: "Want", icon: "🔖" },
                                  { id: "reading", label: "Reading", icon: "📖" },
                                  { id: "completed", label: "Done", icon: "✅" },
                                ].map((st) => {
                                  const isSelected = status === st.id;
                                  return (
                                    <button
                                      key={st.id}
                                      onClick={() => handleMarkStatus(book.id, st.id)}
                                      title={st.label}
                                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                                        isSelected
                                          ? "bg-[#0E6163] text-white shadow-xs"
                                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                      }`}
                                    >
                                      <span>{st.icon}</span>
                                      <span className="hidden sm:inline">{st.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <Link
                                href="/auth/login"
                                className="text-[11px] font-semibold text-slate-400 hover:text-[#0E6163]"
                              >
                                Log in to track
                              </Link>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 2: VIDEOS & PLAYLISTS (FULL PRESERVATION)              */}
          {/* ══════════════════════════════════════════════════════════ */}
          {tab === "videos" && (
            <div className="space-y-8">
              {/* Cinema Player Section */}
              <div ref={playerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main Video Embed (8 cols) */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md p-6">
                  {activeVideo ? (
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase font-mono">
                          {activeVideo.level}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {activeVideo.category}
                        </span>
                      </div>
                      <VideoPlayer
                        videoId={activeVideo.embed_id}
                        videoType={activeVideo.embed_type === "playlist" ? "playlist" : "video"}
                        title={activeVideo.title}
                        channel={activeVideo.channel_name}
                        description={activeVideo.description}
                        curatorNote={activeVideo.curator_note}
                        externalUrl={activeVideo.playlist_url}
                        size="lg"
                      />
                    </div>
                  ) : (
                    <div className="p-16 text-center text-slate-400">
                      <div className="text-5xl mb-3">🎬</div>
                      <h3 className="text-base font-bold text-slate-700">Select a Video to Begin Watching</h3>
                    </div>
                  )}
                </div>

                {/* Queue / Recommended Playlist (4 cols) */}
                <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-md space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Up Next &amp; Recommended
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">
                      {filteredVideos.slice(0, 8).length} videos
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {filteredVideos.slice(0, 10).map((v) => {
                      const isSelected = activeVideo?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => {
                            setActiveVideo(v);
                            playerRef.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                            isSelected
                              ? "bg-teal-50/80 border-teal-600 shadow-sm"
                              : "bg-white border-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <div className="relative w-20 h-14 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                            <img
                              src={`https://img.youtube.com/vi/${v.embed_id}/mqdefault.jpg`}
                              alt={v.title}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-teal-900/60 flex items-center justify-center text-white text-[10px] font-bold">
                                Playing
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-xs font-bold leading-snug line-clamp-2 mb-1 ${
                                isSelected ? "text-teal-900" : "text-slate-800"
                              }`}
                            >
                              {v.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">{v.channel_name}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* LEGAL NOTICE & FAIR USE ATTRIBUTION FOOTER                */}
          {/* ══════════════════════════════════════════════════════════ */}
          <footer className="mt-16 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="text-2xl shrink-0">⚖️</span>
              <div className="text-xs text-slate-500 leading-relaxed space-y-1.5">
                <strong className="text-slate-800 font-semibold block text-sm">
                  Educational Use &amp; Intellectual Property Notice:
                </strong>
                <p>
                  All video materials are embedded directly via standard YouTube embedded players in compliance with YouTube Terms of Service and Indian Copyright Fair Dealing (Section 52, Indian Copyright Act 1957). All view counts, advertising revenue, and intellectual property remain strictly with original content creators.
                </p>
                <p>
                  Book summaries are original analytical syntheses prepared for private educational review. All book titles, covers, and original excerpts belong to their respective authors and publishing houses.
                </p>
                <div className="pt-2">
                  <Link
                    href="/legal/copyright"
                    className="text-teal-700 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Read full Fair Use &amp; Content Attribution Policy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </AppLayout>
  );
}
