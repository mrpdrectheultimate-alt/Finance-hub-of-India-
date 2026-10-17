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

type Book = {
  id: string;
  title: string;
  author: string;
  cover_url?: string | null;
  description: string;
  key_takeaways: string[] | string | null;
  why_read: string | null;
  best_for: string[] | null;
  category: string;
  difficulty: "easy" | "medium" | "advanced" | string;
  amazon_url: string | null;
  free_pdf_url: string | null;
  is_free_legal: boolean;
  pages?: number;
  year_published?: number;
  badge?: string;
};

type Tab = "books" | "videos";
type TypeFilter = "all" | "video" | "playlist";
type SortOption = "recommended" | "popular" | "difficulty-asc" | "difficulty-desc" | "title-asc" | "author-asc";

// ─── Verified 15 Classic Finance Books ─────────────────────────

const VERIFIED_LIBRARY_BOOKS: Book[] = [
  {
    id: "book-1",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    cover_url: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
    description: "Financial success is about behaviour, not intelligence. Housel uses 19 short stories to show how people think about money in ways that are often irrational but deeply human.",
    key_takeaways: [
      "Wealth is what you do not spend — it is invisible by definition.",
      "Room for error is the most underappreciated force in personal finance.",
      "Getting rich and staying rich are two entirely different skills requiring different mindsets.",
      "Reasonable beats rational — a plan you can stick to beats a theoretically optimal one you abandon.",
      "Compounding works best when you do not interrupt it unnecessarily.",
      "Save without a specific goal — savings is your insurance hedge against life's unpredictable surprises."
    ],
    why_read: "The single most important finance book for anyone starting out. It reframes money decisions as human behaviour, not maths.",
    best_for: ["beginner", "investor", "professional"],
    category: "behavioral-finance",
    difficulty: "easy",
    amazon_url: "https://www.amazon.in/Psychology-Money-Morgan-Housel/dp/9390166268",
    free_pdf_url: null,
    is_free_legal: false,
    pages: 256,
    year_published: 2020,
    badge: "Must Read",
  },
  {
    id: "book-2",
    title: "The Intelligent Investor",
    author: "Benjamin Graham",
    cover_url: "https://covers.openlibrary.org/b/isbn/9780062312686-L.jpg",
    description: "The definitive guide to value investing, written by Warren Buffett's mentor. Teaches the principles of investing with a margin of safety, controlling emotions, and understanding market volatility.",
    key_takeaways: [
      "The stock market is a voting machine in the short term, but a weighing machine in the long term.",
      "Margin of safety is the three most important words in investing.",
      "Mr. Market is your servant, not your guide.",
      "The investor's chief problem — and even his worst enemy — is likely to be himself.",
      "Never buy a stock immediately after a substantial rise or sell one immediately after a substantial drop."
    ],
    why_read: "Required reading for anyone who wants to invest in stocks rather than speculate. Dense but transformative.",
    best_for: ["investor", "advanced"],
    category: "investing",
    difficulty: "advanced",
    amazon_url: "https://www.amazon.in/Intelligent-Investor-Benjamin-Graham/dp/0062312685",
    free_pdf_url: null,
    is_free_legal: false,
    pages: 640,
    year_published: 1949,
    badge: "Value Classic",
  },
  {
    id: "book-3",
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    cover_url: "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg",
    description: "Contrasts the financial philosophies of two fathers — one highly educated but financially poor, one a dropout who became rich — to teach the difference between working for money vs making money work for you.",
    key_takeaways: [
      "The rich do not work for money — money works for them.",
      "Financial literacy is more important than academic education for building durable wealth.",
      "Your house is a liability, not an asset, if it takes money out of your pocket every month.",
      "The rich acquire assets; the poor and middle class acquire liabilities that they think are assets.",
      "Taxes and inflation consistently erode the wealth of traditional salaried employees."
    ],
    why_read: "Despite debate around some ideas, this is the most-read financial book globally because it fundamentally transforms how people view income, liabilities, and assets.",
    best_for: ["beginner", "entrepreneur"],
    category: "personal-finance",
    difficulty: "easy",
    amazon_url: "https://www.amazon.in/Rich-Dad-Poor-Middle-Anniversary/dp/1612681131",
    free_pdf_url: null,
    is_free_legal: false,
    pages: 336,
    year_published: 1997,
    badge: "Global Bestseller",
  },
  {
    id: "book-4",
    title: "Zero to One",
    author: "Peter Thiel",
    cover_url: "https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg",
    description: "Notes on startups and how to build the future. Thiel argues that the next big innovation is not copying existing ideas but creating truly new ones — going from zero to one.",
    key_takeaways: [
      "Competition is for losers — monopoly with high margins is the true engine of business profit.",
      "Every great business is built around a secret that others don't see.",
      "The most contrarian thing is not to oppose the crowd but to think for yourself.",
      "A startup messed up at its foundation cannot be fixed later.",
      "Sales and distribution are as critical to success as the product itself."
    ],
    why_read: "Essential for anyone building a business or evaluating high-growth early-stage equity investments.",
    best_for: ["founder", "investor"],
    category: "corporate-finance",
    difficulty: "medium",
    amazon_url: "https://www.amazon.in/Zero-One-Notes-Startups-Future/dp/0804139296",
    free_pdf_url: null,
    is_free_legal: false,
    pages: 224,
    year_published: 2014,
    badge: "Founders",
  },
  {
    id: "book-5",
    title: "One Up on Wall Street",
    author: "Peter Lynch",
    cover_url: "https://covers.openlibrary.org/b/isbn/9780743200400-L.jpg",
    description: "Lynch, one of the most successful fund managers in history (Fidelity Magellan), explains how ordinary retail investors can beat Wall Street professionals by investing in businesses they observe in everyday life.",
    key_takeaways: [
      "Invest in what you understand — your everyday observations as a consumer are valuable research.",
      "Retail investors have an informational edge over Wall Street analysts if they use their eyes.",
      "The P/E ratio must be contextualized with earnings growth (PEG ratio).",
      "Never invest in any business model that you cannot illustrate simply with a crayon.",
      "Know why you own every stock in your portfolio — be able to explain it in 2 minutes."
    ],
    why_read: "A practical guide to stock picking from history's most celebrated fund manager. Highly accessible and engaging.",
    best_for: ["investor", "intermediate"],
    category: "investing",
    difficulty: "medium",
    amazon_url: "https://www.amazon.in/One-Up-Wall-Street-Already/dp/0743200403",
    free_pdf_url: null,
    is_free_legal: false,
    pages: 304,
    year_published: 1989,
    badge: "Stock Picking",
  },
  {
    id: "book-6",
    title: "The Almanack of Naval Ravikant",
    author: "Eric Jorgenson",
    cover_url: "https://covers.openlibrary.org/b/isbn/9781544514215-L.jpg",
    description: "Compiled wisdom of Naval Ravikant on wealth, happiness, and building modern leverage. Covers how to build wealth without relying on luck — through code, media, capital, and labor.",
    key_takeaways: [
      "Seek wealth, not money or status. Wealth is owning assets that earn while you sleep.",
      "Learn to sell, learn to build. If you can do both, you will be unstoppable.",
      "Specific knowledge cannot be taught in school — it is found by pursuing your genuine curiosity.",
      "Permissionless leverage (code and media) is the modern equalizer for wealth creation.",
      "Compound yourself — your compounding knowledge and reputation matter more than salary."
    ],
    why_read: "Modern essential reading for builders and knowledge workers thinking about wealth creation in the internet era.",
    best_for: ["founder", "entrepreneur", "investor"],
    category: "corporate-finance",
    difficulty: "easy",
    amazon_url: "https://www.navalmanack.com/",
    free_pdf_url: "https://www.navalmanack.com/",
    is_free_legal: true,
    pages: 244,
    year_published: 2020,
    badge: "100% Free Legal PDF",
  },
  {
    id: "book-7",
    title: "Let's Talk Money",
    author: "Monika Halan",
    cover_url: "https://covers.openlibrary.org/b/isbn/9780008302825-L.jpg",
    description: "India's most practical personal finance book. Halan explains how to protect your money, grow it, and plan for your family's future specifically in the Indian financial and regulatory context.",
    key_takeaways: [
      "Secure adequate pure term life insurance and family health insurance before investing a single rupee.",
      "A 3-bank-account money box system (Income, Spend, and Emergency) brings total financial clarity.",
      "Low-cost broad index mutual funds beat the vast majority of active mutual funds over 10+ years.",
      "Real estate is not universally a great investment when factoring illiquidity, registry taxes, and maintenance.",
      "Define your financial milestones first before selecting any financial product."
    ],
    why_read: "The gold-standard personal finance playbook written specifically for Indian families and working professionals. Zero jargon.",
    best_for: ["beginner", "professional"],
    category: "personal-finance",
    difficulty: "easy",
    amazon_url: "https://www.amazon.in/Lets-Talk-Money-Monika-Halan/dp/0008302820",
    free_pdf_url: null,
    is_free_legal: false,
    pages: 240,
    year_published: 2018,
    badge: "🇮🇳 Indian Context",
  },
  {
    id: "book-8",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    cover_url: "https://covers.openlibrary.org/b/isbn/9780374275631-L.jpg",
    description: "Nobel laureate Daniel Kahneman unpacks the human brain's dual cognitive operating systems: intuitive, emotional System 1 and deliberative, logical System 2 — and why they distort financial decisions.",
    key_takeaways: [
      "System 1 thinking creates predictable cognitive biases: overconfidence, anchoring, and loss aversion.",
      "Loss aversion: psychological pain of losing ₹10,000 is twice as intense as the joy of winning ₹10,000.",
      "The planning fallacy consistently tricks investors into underestimating risk, costs, and timeline.",
      "Availability heuristic causes us to overweight recent dramatic news over long-term base rates.",
      "Hindsight bias tricks us into believing market crashes were obvious in advance."
    ],
    why_read: "Understanding your internal psychological biases is as vital as analyzing cash flows. Essential for every market participant.",
    best_for: ["investor", "professional"],
    category: "behavioral-finance",
    difficulty: "advanced",
    amazon_url: "https://www.amazon.in/Thinking-Fast-Slow-Daniel-Kahneman/dp/0141033576",
    free_pdf_url: null,
    is_free_legal: false,
    pages: 512,
    year_published: 2011,
    badge: "Nobel Prize",
  },
  {
    id: "book-9",
    title: "The Warren Buffett Way",
    author: "Robert G. Hagstrom",
    cover_url: "https://covers.openlibrary.org/b/isbn/9781118503256-L.jpg",
    description: "Deconstructs Warren Buffett's investment playbook through his historic portfolio allocations (Coca-Cola, American Express, Geico), articulating his management, financial, and market tenets.",
    key_takeaways: [
      "Only buy equity in businesses whose economic engines you thoroughly understand.",
      "Look for durable competitive advantages — economic moats that protect return on invested capital.",
      "Price is what you pay; intrinsic value is what you receive.",
      "Be fearful when others are greedy, and greedy only when others are fearful.",
      "Holding period: if you aren't willing to own a stock for 10 years, do not even think about owning it for 10 minutes."
    ],
    why_read: "The clearest, most structured breakdown of how Buffett evaluates balance sheets and competitive moats.",
    best_for: ["investor", "advanced"],
    category: "investing",
    difficulty: "medium",
    amazon_url: "https://www.amazon.in/Warren-Buffett-Way-Robert-Hagstrom/dp/1118503252",
    free_pdf_url: null,
    is_free_legal: false,
    pages: 320,
    year_published: 1994,
    badge: "Buffett Tenets",
  },
  {
    id: "book-10",
    title: "Flash Boys",
    author: "Michael Lewis",
    cover_url: "https://covers.openlibrary.org/b/isbn/9780393244663-L.jpg",
    description: "Lewis exposes how High-Frequency Trading (HFT) algorithms and dark pools exploit microsecond latency advantages to front-run ordinary retail orders on modern electronic exchanges.",
    key_takeaways: [
      "Modern electronic exchanges are wired with hidden complexities that favor algorithmic latency arbitrage.",
      "Microsecond speed is the primary weapon in modern order routing.",
      "Complexity in financial exchange architecture often benefits predatory insiders at the expense of retail investors.",
      "Market reform requires transparent matching engines and alignment of incentives."
    ],
    why_read: "A thrilling, investigative dive into the physical infrastructure, fiber cables, and dark pools of Wall Street.",
    best_for: ["trader", "investor", "advanced"],
    category: "trading-markets",
    difficulty: "medium",
    amazon_url: "https://www.amazon.in/Flash-Boys-Michael-Lewis/dp/0393351599",
    free_pdf_url: null,
    is_free_legal: false,
    pages: 320,
    year_published: 2014,
    badge: "Market Plumbing",
  },
  {
    id: "book-11",
    title: "The Lean Startup",
    author: "Eric Ries",
    cover_url: "https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg",
    description: "The definitive blueprint for launching and financing new ventures under extreme uncertainty using validated learning, scientific experimentation, and the Build-Measure-Learn cycle.",
    key_takeaways: [
      "The Build-Measure-Learn loop: ship the Minimum Viable Product (MVP) fast, measure truth, adapt quickly.",
      "Validated customer learning is infinitely more valuable than executing a 5-year business plan.",
      "Vanity metrics (pageviews, app downloads) deceive; actionable metrics reveal genuine customer value.",
      "The discipline to pivot or persevere based on real customer data rather than founder ego."
    ],
    why_read: "Mandatory reading for founders and corporate capital allocators before deploying capital on new business ventures.",
    best_for: ["founder", "entrepreneur"],
    category: "corporate-finance",
    difficulty: "easy",
    amazon_url: "https://www.amazon.in/Lean-Startup-Eric-Ries/dp/0670921602",
    free_pdf_url: null,
    is_free_legal: false,
    pages: 336,
    year_published: 2011,
    badge: "Startups",
  },
  {
    id: "book-12",
    title: "Poor Charlie's Almanack",
    author: "Charles T. Munger",
    cover_url: "https://covers.openlibrary.org/b/isbn/9781578645015-L.jpg",
    description: "The wit, wisdom, and multidisciplinary mental models of Berkshire Hathaway's legendary Vice Chairman, Charlie Munger — spanning psychology, mathematics, physics, and investing.",
    key_takeaways: [
      "Invert, always invert: to solve hard problems, analyze what would guarantee catastrophe and avoid it.",
      "Build a latticework of mental models from primary disciplines rather than relying on a single specialization.",
      "The big money is not in buying or selling, but in waiting for extreme mispricings.",
      "Avoid psychological misjudgments: commitment bias, authority bias, and incentive-caused bias.",
      "Consistently attempting to be 'not stupid' yields superior long-term results than trying to be very brilliant."
    ],
    why_read: "The pinnacle of intellectual rigor in capital allocation. Munger's mental models apply universally across life and wealth.",
    best_for: ["investor", "founder", "advanced"],
    category: "investing",
    difficulty: "advanced",
    amazon_url: "https://www.amazon.in/Poor-Charlies-Almanack-Charles-Munger/dp/1578645018",
    free_pdf_url: null,
    is_free_legal: false,
    pages: 548,
    year_published: 2005,
    badge: "Mental Models",
  },
  {
    id: "book-13",
    title: "Shoe Dog",
    author: "Phil Knight",
    cover_url: "https://covers.openlibrary.org/b/isbn/9781501135910-L.jpg",
    description: "Nike founder Phil Knight's candid memoir detailing the harrowing financial crises, import hurdles, bank credit rejections, and liquidity shortages that almost destroyed Nike before it became a $30B+ global empire.",
    key_takeaways: [
      "Cash flow is the lifeblood of a growing business — rapid sales growth demands massive working capital.",
      "Revenue is vanity, profit is sanity, but cash in the bank is absolute reality.",
      "Perseverance through repeated near-bankruptcy events defines enduring company builders.",
      "Authentic corporate culture and relentless customer focus become unassailable balance sheet assets."
    ],
    why_read: "The most honest, gripping memoir ever written on the raw financial pressure and cash flow terror of entrepreneurship.",
    best_for: ["founder", "entrepreneur"],
    category: "corporate-finance",
    difficulty: "easy",
    amazon_url: "https://www.amazon.in/Shoe-Dog-Memoir-Creator-NIKE/dp/1471146723",
    free_pdf_url: null,
    is_free_legal: false,
    pages: 400,
    year_published: 2016,
    badge: "Inspiring Memoir",
  },
  {
    id: "book-14",
    title: "A Random Walk Down Wall Street",
    author: "Burton Malkiel",
    cover_url: "https://covers.openlibrary.org/b/isbn/9780393358384-L.jpg",
    description: "The intellectual cornerstone of passive index investing. Princeton economist Burton Malkiel proves that short-term price movements follow a random walk and active stock pickers fail to beat the index net of fees.",
    key_takeaways: [
      "Short-term stock prices behave like a random walk — technical chart patterns lack predictive power.",
      "Broad low-cost index funds consistently outperform the majority of active fund managers over 15+ years.",
      "Asset allocation and diversification are the only true 'free lunches' in capital markets.",
      "The compound interest arithmetic heavily rewards minimizing expense ratios and starting as young as possible."
    ],
    why_read: "The foundational academic and empirical evidence for why passive index investing is the highest-probability wealth strategy.",
    best_for: ["investor", "beginner", "professional"],
    category: "investing",
    difficulty: "medium",
    amazon_url: "https://www.amazon.in/Random-Walk-Down-Wall-Street/dp/0393358380",
    free_pdf_url: null,
    is_free_legal: false,
    pages: 456,
    year_published: 1973,
    badge: "Index Pioneer",
  },
  {
    id: "book-15",
    title: "Security Analysis",
    author: "Benjamin Graham & David Dodd",
    cover_url: "https://covers.openlibrary.org/b/isbn/9780071592536-L.jpg",
    description: "The 1934 bible of fundamental securities valuation. Established the rigorous mathematical discipline of financial statement analysis, fixed income evaluation, balance sheet liquidation value, and margin of safety.",
    key_takeaways: [
      "An investment operation is one which, upon thorough analysis, promises safety of principal and an adequate return.",
      "A securities analyst must look beyond reported accounting earnings to calculate true normalized owner earnings.",
      "The margin of safety is essential to protect capital against unforeseen structural shifts and human analytical error.",
      "Distinguish rigorously between investment and speculation in every market environment."
    ],
    why_read: "For professional and serious investors seeking the uncompromising intellectual foundation of value investing and credit analysis.",
    best_for: ["investor", "advanced"],
    category: "investing",
    difficulty: "advanced",
    amazon_url: "https://www.amazon.in/Security-Analysis-Foreword-Buffett-Editions/dp/0071592539",
    free_pdf_url: null,
    is_free_legal: false,
    pages: 725,
    year_published: 1934,
    badge: "The Bible of Value",
  },
];

// Category Definitions with color tokens and icons
const CATEGORIES = [
  { id: "all", label: "All Topics", icon: "📚", color: "#0E6163" },
  { id: "personal-finance", label: "Personal Finance", icon: "💰", color: "#059669" },
  { id: "investing", label: "Stock Market & Investing", icon: "📈", color: "#2563EB" },
  { id: "behavioral-finance", label: "Behavioral Finance", icon: "🧠", color: "#D97706" },
  { id: "corporate-finance", label: "Corporate Finance & Startups", icon: "🏢", color: "#7C3AED" },
  { id: "trading-markets", label: "Trading & Markets", icon: "⚡", color: "#DC2626" },
  { id: "crypto-defi", label: "Crypto & DeFi", icon: "₿", color: "#0891B2" },
];

const QUICK_DISCOVERY_TAGS = [
  { id: "all", label: "All Titles" },
  { id: "beginner", label: "🌱 Beginner-Friendly" },
  { id: "investing", label: "📈 Investing Essentials" },
  { id: "behavioral", label: "🧠 Mindset & Biases" },
  { id: "india", label: "🇮🇳 Indian Context" },
  { id: "founder", label: "🚀 Startups & Founders" },
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
        // Merge Supabase books with verified covers and rich takeaways
        const merged = (data as unknown as Book[]).map((dbBook) => {
          const verified = VERIFIED_LIBRARY_BOOKS.find(
            (vb) => vb.title.toLowerCase() === dbBook.title.toLowerCase()
          );
          return {
            ...dbBook,
            cover_url: dbBook.cover_url || verified?.cover_url,
            pages: dbBook.pages || verified?.pages,
            year_published: dbBook.year_published || verified?.year_published,
            badge: verified?.badge,
            key_takeaways: (dbBook.key_takeaways ?? verified?.key_takeaways ?? null) as string[] | string | null,
            why_read: dbBook.why_read ?? verified?.why_read ?? null,
          };
        });
        setBooks(merged);
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
        if (category === "investing") {
          if (b.category !== "investing" && b.category !== "trading-markets") return false;
        } else if (b.category !== category) {
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
      if (discoveryFilter === "behavioral" && b.category !== "behavioral-finance") return false;
      if (discoveryFilter === "india" && !b.title.toLowerCase().includes("let's talk money")) return false;
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
                    <strong>15</strong> Book Summaries
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
                        : books.filter((b) =>
                            cat.id === "investing"
                              ? b.category === "investing" || b.category === "trading-markets"
                              : b.category === cat.id
                          ).length;

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
