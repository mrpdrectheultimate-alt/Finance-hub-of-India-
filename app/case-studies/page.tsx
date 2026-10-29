"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Search,
  X,
  ArrowRight,
  Clock,
  User,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Building2,
  Coins,
  ShieldAlert,
  Scale,
  FileText,
  CheckCircle2,
  Zap,
  BookOpen,
  Calculator,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";

export interface CaseStudyItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced" | string;
  protagonist: string;
  key_lesson: string;
  duration_minutes: number;
  is_free: boolean;
  tags?: string[];
  financial_stakes?: string;
  archetype?: "trap" | "compounding" | "systemic";
}

// ─────────────────────────────────────────────────────────────────
// FLAGSHIP CURATED DATA (Instant hydration + resilient fallback)
// ─────────────────────────────────────────────────────────────────
const FLAGSHIP_CASE_STUDIES: CaseStudyItem[] = [
  {
    id: "cs-01",
    slug: "zaras-health-insurance-rejection",
    title: "Zara's Health Insurance Rejection — How a ₹5 Lakh Policy Paid ₹42,000 on a ₹4.8 Lakh Bill",
    subtitle: "Room rent sub-limits, proportionate deductions, and the fine print that wipes out Indian hospital claims.",
    category: "personal-finance",
    difficulty: "intermediate",
    protagonist: "Zara, 28, Senior Product Designer in Bengaluru",
    key_lesson: "Never buy health insurance with room rent limits. Upgrading your room causes insurers to slash surgeon, OT, and nursing fees by the same proportion.",
    financial_stakes: "CLAIM: ₹4.8 LAKH | PAID: ₹42,100 | LOSS: ₹4.38 LAKH",
    archetype: "trap",
    duration_minutes: 12,
    is_free: true,
    tags: ["health-insurance", "sub-limits", "proportionate-deduction", "irdai"],
  },
  {
    id: "cs-02",
    slug: "nikhils-intraday-addiction",
    title: "Nikhil's Intraday Addiction — How ₹18 Lakhs Vanished in 18 Months of 'Work from Home'",
    subtitle: "The hidden psychology of high-frequency retail trading, margin calls, and revenge trading.",
    category: "trading-markets",
    difficulty: "advanced",
    protagonist: "Nikhil, 29, Software Engineer in Pune",
    key_lesson: "Intraday trading is an institutionally dominated zero-sum game with transaction costs and leverage creating guaranteed negative expected value.",
    financial_stakes: "LOSS: ₹18 LAKH OVER 18 MONTHS",
    archetype: "trap",
    duration_minutes: 15,
    is_free: true,
    tags: ["intraday", "trading", "fno", "psychology", "risk"],
  },
  {
    id: "cs-03",
    slug: "the-esop-tax-shock",
    title: "The ESOP Tax Shock — Neha Exercised Unicorn Options and Owed ₹28 Lakhs in Tax with Zero Cash",
    subtitle: "How Section 17(2) perquisite tax treats illiquid private shares as taxable salary income on the day of exercise.",
    category: "taxation",
    difficulty: "advanced",
    protagonist: "Neha, 33, VP of Product at a Bengaluru Unicorn",
    key_lesson: "Never exercise private startup ESOPs without guaranteed secondary liquidity or an employer buyback program.",
    financial_stakes: "TAX DEMAND: ₹28 LAKH ON ILLIQUID SHARES",
    archetype: "trap",
    duration_minutes: 14,
    is_free: true,
    tags: ["esop", "startups", "taxation", "section-17", "income-tax"],
  },
  {
    id: "cs-04",
    slug: "the-builder-delay-ravis-wait",
    title: "The Builder Delay — Ravi's 7-Year Wait and How RERA Turned the Tables",
    subtitle: "Under-construction real estate pitfalls: double rent + pre-EMI drain, and how to enforce Section 18 compensation.",
    category: "real-estate",
    difficulty: "intermediate",
    protagonist: "Ravi, 36, Corporate Finance Manager in Noida",
    key_lesson: "Buy ready-to-move properties or hold developers strictly accountable under RERA Section 18 for interest on delayed possession.",
    financial_stakes: "DELAY: 7 YEARS | PRE-EMI DRAIN: ₹19.6 LAKH",
    archetype: "systemic",
    duration_minutes: 15,
    is_free: true,
    tags: ["real-estate", "rera", "home-loan", "emi", "property"],
  },
  {
    id: "cs-05",
    slug: "fd-vs-inflation-rameshs-story",
    title: "FD vs Inflation — Why Ramesh's 'Safe' ₹10 Lakh FD Lost 62% of Its Real Value in 20 Years",
    subtitle: "Nominal safety vs purchasing power reality: how taxes and inflation silently destroy fixed deposit wealth.",
    category: "personal-finance",
    difficulty: "beginner",
    protagonist: "Ramesh, 64, Retired Senior School Teacher in Jaipur",
    key_lesson: "Fixed deposits provide nominal safety, but guarantee purchasing power loss after accounting for 30% tax and 6.5% inflation.",
    financial_stakes: "PURCHASING POWER EROSION: -62% OVER 20 YRS",
    archetype: "trap",
    duration_minutes: 10,
    is_free: true,
    tags: ["fixed-deposit", "inflation", "retirement", "debt-funds"],
  },
  {
    id: "cs-06",
    slug: "priya-emergency-fund-mistake",
    title: "The ₹50,000 Mistake: What Priya Learned About Emergency Funds",
    subtitle: "How one unexpected laptop breakdown derailed a year of careful index fund investing.",
    category: "personal-finance",
    difficulty: "beginner",
    protagonist: "Priya, 28, UX Designer in Bengaluru earning ₹85k/mo",
    key_lesson: "Always build 3-6 months of liquid emergency reserves in a savings or liquid fund BEFORE allocating capital to equity SIPs.",
    financial_stakes: "COMPOUNDING LOSS: ₹3.6 LAKH OVER 15 YEARS",
    archetype: "trap",
    duration_minutes: 10,
    is_free: true,
    tags: ["emergency-fund", "sip", "liquid-fund", "budgeting"],
  },
  {
    id: "cs-07",
    slug: "rahul-fo-disaster",
    title: "Rahul's F&O Disaster — How ₹2 Lakh Became ₹0 in 3 Months",
    subtitle: "A software engineer discovers why 89% of F&O traders lose money — the hard way.",
    category: "trading-markets",
    difficulty: "intermediate",
    protagonist: "Rahul, 31, Software Engineer in Pune",
    key_lesson: "Buying naked out-of-the-money options means paying daily time-decay rent (Theta) to option sellers with a near-zero statistical edge.",
    financial_stakes: "CAPITAL: ₹2 LAKH → ₹0 IN 3 MONTHS",
    archetype: "trap",
    duration_minutes: 12,
    is_free: true,
    tags: ["fno", "options", "theta", "leverage", "sebi"],
  },
  {
    id: "cs-08",
    slug: "amit-vijay-compounding-comparison",
    title: "The Cost of Waiting: Amit and Vijay's ₹2.21 Crore Divide",
    subtitle: "Two colleagues, identical ₹80k salaries, identical ₹10,000 monthly SIPs — one 10-year start gap.",
    category: "personal-finance",
    difficulty: "beginner",
    protagonist: "Amit (starts at 25) vs Vijay (starts at 35) in Hyderabad",
    key_lesson: "Starting 10 years earlier produces 2.7x more wealth due to compounding's exponential hockey stick curve.",
    financial_stakes: "WEALTH DIFFERENCE: ₹2.21 CRORE AT RETIREMENT",
    archetype: "compounding",
    duration_minutes: 8,
    is_free: true,
    tags: ["compounding", "sip", "retirement", "time-value"],
  },
  {
    id: "cs-09",
    slug: "meera-ipo-fomo",
    title: "The FOMO IPO — Meera Applied to 12 IPOs and Lost on 9 of Them",
    subtitle: "Grey market premiums (GMP), anchor investor lock-ins, and the retail hype cycle.",
    category: "trading-markets",
    difficulty: "beginner",
    protagonist: "Meera, 26, Marketing Manager in Mumbai",
    key_lesson: "Oversubscription is an indicator of speculative demand, not business quality. Always read the DRHP and evaluate valuation multiples.",
    financial_stakes: "12 IPOs APPLIED | 9 DISASTROUS LISTING LOSSES",
    archetype: "trap",
    duration_minutes: 8,
    is_free: true,
    tags: ["ipo", "gmp", "primary-market", "valuation"],
  },
  {
    id: "cs-10",
    slug: "vikram-late-retirement",
    title: "Vikram at 45 — Starting Retirement Planning 20 Years Late",
    subtitle: "What happens when you realize at 45 that your total retirement savings stand at just ₹23 Lakh.",
    category: "personal-finance",
    difficulty: "intermediate",
    protagonist: "Vikram, 45, Bank Manager in Lucknow",
    key_lesson: "Catch-up retirement planning requires aggressive step-up SIPs, maximizing employer NPS tax deductions, and avoiding lifestyle inflation.",
    financial_stakes: "RETIREMENT GAP: ₹2.06 CRORE DEFICIT AT 45",
    archetype: "compounding",
    duration_minutes: 10,
    is_free: true,
    tags: ["retirement", "step-up-sip", "asset-allocation", "nps"],
  },
  {
    id: "cs-11",
    slug: "ananya-first-home",
    title: "Ananya Buys Her First Home — The Real Cost of Real Estate in India",
    subtitle: "A ₹65 Lakh flat that actually costs ₹1.4 Crore — understanding the full financial reality of home ownership.",
    category: "real-estate",
    difficulty: "intermediate",
    protagonist: "Ananya, 32, Product Manager in Bengaluru",
    key_lesson: "Registration, stamp duty, GST, interior overruns, and loan interest make total home acquisition cost 2.2x to 2.5x the headline price.",
    financial_stakes: "UNSEEN ACQUISITION OVERRUN: ₹24.5 LAKH",
    archetype: "trap",
    duration_minutes: 10,
    is_free: false,
    tags: ["real-estate", "stamp-duty", "home-loan", "maintenance"],
  },
  {
    id: "cs-12",
    slug: "arjun-startup-cashflow",
    title: "Arjun's Startup Cash Flow Crisis — Profitable on Paper, Dying in Reality",
    subtitle: "Why accrual revenue does not pay payroll: managing the deadly 90-day B2B accounts receivable cycle.",
    category: "corporate-finance",
    difficulty: "advanced",
    protagonist: "Arjun, 34, B2B SaaS Founder in Hyderabad",
    key_lesson: "Profit is an accounting opinion; cash in the bank is reality. Never scale enterprise contracts without strict payment milestones.",
    financial_stakes: "CASH SHORTFALL: ₹45 LAKH RUNWAY EMERGENCY",
    archetype: "systemic",
    duration_minutes: 10,
    is_free: false,
    tags: ["working-capital", "cash-flow", "startups", "receivables"],
  },
  {
    id: "cs-13",
    slug: "pooja-crypto-lesson",
    title: "Pooja's Crypto Lesson — From ₹3 Lakh Profit to ₹1 Lakh Loss in 6 Months",
    subtitle: "Altcoin chasing, algorithmic stablecoins, and the psychological illusion of unrealized gains.",
    category: "crypto-defi",
    difficulty: "beginner",
    protagonist: "Pooja, 27, Graphic Designer in Ahmedabad",
    key_lesson: "Never mistake a speculative macro bull run for personal trading genius. Take systematic profits into hard assets on the way up.",
    financial_stakes: "₹3 LAKH GAIN ERASED → ₹1 LAKH NET LOSS",
    archetype: "trap",
    duration_minutes: 9,
    is_free: true,
    tags: ["crypto", "altcoins", "risk-management", "volatility"],
  },
  {
    id: "cs-14",
    slug: "acquisition-value-destruction",
    title: "The Acquisition That Destroyed Value — A Case Study in M&A Failure",
    subtitle: "Why 70% of corporate acquisitions destroy shareholder capital — and how to spot executive hubris.",
    category: "corporate-finance",
    difficulty: "advanced",
    protagonist: "Executive Board of a Listed Indian FMCG Giant",
    key_lesson: "Acquisitions frequently transfer wealth from acquiring shareholders to target founders. Synergy forecasts are notoriously inflated.",
    financial_stakes: "M&A WRITEDOWN: ₹420 CRORE GOODWILL LOSS",
    archetype: "systemic",
    duration_minutes: 11,
    is_free: false,
    tags: ["mergers-acquisitions", "corporate-finance", "goodwill", "valuation"],
  },
  {
    id: "cs-15",
    slug: "covid-crash-panic-sell",
    title: "The Investor Who Sold in the COVID Crash — And What It Cost Him",
    subtitle: "March 2020 panic, locking in paper losses, and missing the fastest 100% recovery in Indian equity history.",
    category: "behavioral-finance",
    difficulty: "beginner",
    protagonist: "Ramesh, 48, School Principal in Coimbatore",
    key_lesson: "Volatility is the admission ticket for long-term equity returns. Selling during a market crash transforms temporary paper declines into permanent loss.",
    financial_stakes: "PANIC LOSS: ₹26.6 LAKH LOST OVER 4 YEARS",
    archetype: "trap",
    duration_minutes: 8,
    is_free: true,
    tags: ["behavioral-finance", "market-crash", "panic-selling", "sip"],
  },
  {
    id: "cs-16",
    slug: "meera-tax-planning-transformation",
    title: "Meera's Tax Planning: From Paying ₹1.8 Lakh to ₹31,000 in One Year",
    subtitle: "A software engineer discovers that tax planning is not evasion — it is using the law correctly.",
    category: "taxation",
    difficulty: "intermediate",
    protagonist: "Meera, 30, Senior Developer in Pune earning ₹18L CTC",
    key_lesson: "Structuring salary deductions through 80C, 80CCD(1B) NPS, and Section 80D health insurance legally shields lakhs in personal tax.",
    financial_stakes: "TAX SAVINGS: ₹1.89 LAKH SAVED ANNUALLY",
    archetype: "compounding",
    duration_minutes: 14,
    is_free: false,
    tags: ["tax", "80c", "nps", "hra", "income-tax"],
  },
  {
    id: "cs-17",
    slug: "rohan-esop-decision",
    title: "The Startup Equity Trap: Why Rohan Chose Wrong in His ESOP Decision",
    subtitle: "When a startup employee must choose between exercising options and financial safety.",
    category: "corporate-finance",
    difficulty: "advanced",
    protagonist: "Rohan, 34, Senior Product Manager at Series B Startup",
    key_lesson: "Paper wealth is not cash. Exercising illiquid startup shares triggers immediate taxable perquisites that can bankrupt employees.",
    financial_stakes: "LOSS: ₹14.2 LAKH (EXERCISE + TAX PENALTY)",
    archetype: "trap",
    duration_minutes: 15,
    is_free: false,
    tags: ["esop", "startup", "equity", "tax", "perquisite"],
  },
];

// Helper to determine archetype & stakes if missing from live Supabase record
function enrichCaseStudy(item: any): CaseStudyItem {
  const titleLow = (item.title || "").toLowerCase();
  const subLow = (item.subtitle || "").toLowerCase();
  const lessonLow = (item.key_lesson || "").toLowerCase();

  let archetype: "trap" | "compounding" | "systemic" = item.archetype || "trap";
  if (!item.archetype) {
    if (
      titleLow.includes("compounding") ||
      titleLow.includes("waiting") ||
      titleLow.includes("transformation") ||
      subLow.includes("retirement") ||
      lessonLow.includes("wealth")
    ) {
      archetype = "compounding";
    } else if (
      titleLow.includes("acquisition") ||
      titleLow.includes("cashflow") ||
      titleLow.includes("builder") ||
      titleLow.includes("startup") ||
      subLow.includes("rera")
    ) {
      archetype = "systemic";
    }
  }

  let financial_stakes = item.financial_stakes;
  if (!financial_stakes) {
    if (titleLow.includes("42,000") || titleLow.includes("4.8 lakh")) {
      financial_stakes = "CLAIM: ₹4.8 LAKH | LOSS: ₹4.38 LAKH";
    } else if (titleLow.includes("18 lakh")) {
      financial_stakes = "LOSS: ₹18 LAKH OVER 18 MONTHS";
    } else if (titleLow.includes("28 lakh")) {
      financial_stakes = "TAX DEMAND: ₹28 LAKH ON ILLIQUID ESOPs";
    } else if (titleLow.includes("builder") || titleLow.includes("7-year")) {
      financial_stakes = "DELAY: 7 YEARS | PRE-EMI DRAIN: ₹19.6 LAKH";
    } else if (titleLow.includes("fd") || titleLow.includes("inflation")) {
      financial_stakes = "PURCHASING POWER EROSION: -62%";
    } else if (titleLow.includes("2 lakh") || titleLow.includes("f&o")) {
      financial_stakes = "CAPITAL: ₹2 LAKH → ₹0 IN 3 MONTHS";
    } else if (titleLow.includes("2.21 crore")) {
      financial_stakes = "WEALTH GAP: ₹2.21 CRORE DIFFERENCE";
    } else if (titleLow.includes("65 lakh") || titleLow.includes("home")) {
      financial_stakes = "UNSEEN OVERRUN: ₹24.5 LAKH ON ₹65L FLAT";
    } else if (titleLow.includes("cash flow") || titleLow.includes("startup")) {
      financial_stakes = "CASH SHORTFALL: ₹45 LAKH RUNWAY GAP";
    } else if (titleLow.includes("covid") || titleLow.includes("panic")) {
      financial_stakes = "PANIC LOSS: ₹26.6 LAKH LOST OVER 4 YRS";
    } else if (titleLow.includes("tax planning") || titleLow.includes("1.8 lakh")) {
      financial_stakes = "TAX SAVINGS: ₹1.89 LAKH SAVED ANNUALLY";
    } else {
      financial_stakes = "REAL-WORLD FINANCIAL IMPACT ANALYZED";
    }
  }

  return {
    ...item,
    archetype,
    financial_stakes,
    duration_minutes: item.duration_minutes || 10,
    is_free: item.is_free !== undefined ? item.is_free : true,
    difficulty: item.difficulty || "intermediate",
  };
}

export default function CaseStudiesPage() {
  const [cases, setCases] = useState<CaseStudyItem[]>(FLAGSHIP_CASE_STUDIES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArchetype, setSelectedArchetype] = useState<"all" | "trap" | "compounding" | "systemic">("all");

  // Load published case studies from Supabase, seamlessly merging with curated flagship list
  useEffect(() => {
    let isMounted = true;
    async function fetchCases() {
      try {
        const { data, error } = await supabase
          .from("case_studies")
          .select("id,title,slug,subtitle,category,difficulty,protagonist,key_lesson,duration_minutes,is_free,tags")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0 && isMounted) {
          // Merge Supabase cases with fallback curated list, keyed by slug
          const slugMap = new Map<string, CaseStudyItem>();
          FLAGSHIP_CASE_STUDIES.forEach((c) => slugMap.set(c.slug, c));
          data.forEach((dbItem: any) => {
            const enriched = enrichCaseStudy(dbItem);
            slugMap.set(dbItem.slug, {
              ...slugMap.get(dbItem.slug),
              ...enriched,
            });
          });
          setCases(Array.from(slugMap.values()));
        }
      } catch (err) {
        console.warn("Supabase fetch fallback to curated list:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCases();
    return () => {
      isMounted = false;
    };
  }, []);

  // Normalization helper for category
  const normalizeCategory = (cat: string) => {
    if (!cat) return "personal-finance";
    const c = cat.toLowerCase();
    if (c === "trading" || c.includes("market") || c.includes("trading")) return "trading-markets";
    if (c === "crypto" || c.includes("defi") || c.includes("web3")) return "crypto-defi";
    if (c.includes("tax")) return "taxation";
    if (c.includes("real-estate") || c.includes("property")) return "real-estate";
    if (c.includes("corporate") || c.includes("startup")) return "corporate-finance";
    if (c.includes("behavior")) return "behavioral-finance";
    return c;
  };

  const CATEGORIES = [
    { id: "all", label: "All Categories" },
    { id: "personal-finance", label: "Personal Finance" },
    { id: "trading-markets", label: "Trading & Markets" },
    { id: "corporate-finance", label: "Corporate Finance" },
    { id: "real-estate", label: "Real Estate" },
    { id: "taxation", label: "Taxation & Legal" },
    { id: "crypto-defi", label: "Crypto & Web3" },
    { id: "behavioral-finance", label: "Behavioral Finance" },
  ];

  // Filtering engine across search query, category, and archetype
  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      // 1. Category match
      if (selectedCategory !== "all") {
        const norm = normalizeCategory(item.category);
        if (norm !== selectedCategory) return false;
      }

      // 2. Archetype match
      if (selectedArchetype !== "all") {
        if (item.archetype !== selectedArchetype) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSubtitle = (item.subtitle || "").toLowerCase().includes(q);
        const inProtagonist = (item.protagonist || "").toLowerCase().includes(q);
        const inLesson = (item.key_lesson || "").toLowerCase().includes(q);
        const inTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inSubtitle && !inProtagonist && !inLesson && !inTags) {
          return false;
        }
      }

      return true;
    });
  }, [cases, selectedCategory, selectedArchetype, searchQuery]);

  const hasActiveFilters = searchQuery.trim() !== "" || selectedCategory !== "all" || selectedArchetype !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedArchetype("all");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-ui antialiased selection:bg-emerald-100 selection:text-emerald-900 pb-28">
      {/* ─── Top Breadcrumb Navigation ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 hover:text-slate-900 transition-colors uppercase"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>30+ Indian Case Investigations · SEBI, IRDAI & RERA Grounded</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 01 · EDITORIAL COMMAND HERO & IMPACT METRICS STRIP        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-widest uppercase mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Real People · Real Decisions · Real Consequences</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0A1628] tracking-tight leading-[1.15] mb-4">
            The Reality of Money <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#0E6163] via-emerald-600 to-blue-600 bg-clip-text text-transparent">
              in the Real World.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8">
            Every financial disaster began with an innocent assumption. Every generational fortune began with a disciplined choice.
            Explore authentic Indian case investigations to learn the hard lessons before the market charges you tuition.
          </p>
        </div>

        {/* ── Impact Metrics Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="border-r border-slate-100 last:border-r-0 pr-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">30+</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Case Files</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">Audited court rulings, hospital claims & trade logs</p>
          </div>
          <div className="border-r border-slate-100 last:border-r-0 pr-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">₹100 Cr+</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Capital Analyzed</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">Cumulative wealth won, saved, or destroyed</p>
          </div>
          <div className="border-r border-slate-100 last:border-r-0 pr-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">8</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Asset Disciplines</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">Insurance, F&O, Tax, Real Estate, Startups & Debt</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0E6163] tracking-tight">100%</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Regulatory Grounded</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">Verified against SEBI, IRDAI, RBI & RERA acts</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 02 · HEADLINE INVESTIGATION (Featured Hero Card)           */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1628] via-[#0F1E36] to-[#0A1628] text-white p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-xl">
          {/* Subtle Ambient Glow Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Headline Investigation
              </span>
              <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-rose-300" />
                Hidden Sub-Limit Trap
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> 12 min investigation
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-md ml-auto">
                Free Case Study
              </span>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug mb-3 max-w-4xl">
              Zara&apos;s Health Insurance Rejection — How a ₹5 Lakh Policy Paid Only ₹42,000 on a ₹4.8 Lakh Hospital Bill
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed mb-6">
              Room rent sub-limits, proportionate deductions, and non-disclosure clauses: the anatomy of an Indian medical billing nightmare,
              and why an upgraded hospital room wiped out 91% of an IT professional&apos;s claim.
            </p>

            <div className="text-xs text-slate-400 mb-6 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Protagonist: Zara, 28, Senior Product Designer in Bengaluru earning ₹14 Lakh/year</span>
            </div>

            {/* Financial Stakes Callout Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hospital Bill</span>
                <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">₹4,80,000</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Emergency Appendectomy</span>
              </div>
              <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Insurer Paid</span>
                <span className="text-lg sm:text-xl font-extrabold text-emerald-300 tracking-tight">₹42,100</span>
                <span className="text-[10px] text-emerald-400/80 block mt-0.5">8.8% Coverage Ratio</span>
              </div>
              <div className="bg-slate-900/80 border border-rose-500/40 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Out-Of-Pocket Drain</span>
                <span className="text-lg sm:text-xl font-extrabold text-rose-300 tracking-tight">₹4,37,900</span>
                <span className="text-[10px] text-rose-400/80 block mt-0.5">Paid via Emergency Debt</span>
              </div>
              <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">The Fatal Clause</span>
                <span className="text-xs sm:text-sm font-bold text-amber-200 leading-tight block mt-1">1% Room Cap & 44% Deduction</span>
                <span className="text-[10px] text-amber-300/70 block mt-0.5">Proportionate Slashes</span>
              </div>
            </div>

            {/* Pull Quote Lesson */}
            <div className="bg-slate-800/60 border-l-4 border-rose-500 rounded-r-xl p-4 mb-6 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              💡 <span className="font-bold text-white">The Fatal Lesson:</span> Never buy health insurance with a room rent limit. Upgrading your room doesn&apos;t just cost the bed difference—hospitals tier doctor fees, surgery costs, and nursing by room category, and the insurer slashes the entire bill proportionately.
            </div>

            {/* Action CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/case-studies/zaras-health-insurance-rejection"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-[#0E6163] hover:bg-teal-700 text-white shadow-lg transition-all"
              >
                <span>Investigate Full Case Study</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-slate-400 text-center sm:text-left">
                Includes full mathematical bill breakdown, TPA rejection codes & the 6-point policy buying checklist.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 03 · INTELLIGENT DISCOVERY & FILTER SUITE                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
          {/* Top Row: Search Input + Archetype Switcher */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Live Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by protagonist, company, concept (e.g. 'Zara', 'F&O', 'ESOP', 'RERA', 'Tax', 'Nikhil')..."
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E6163]/20 focus:border-[#0E6163] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Archetype Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto shrink-0">
              <button
                onClick={() => setSelectedArchetype("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedArchetype === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Stories
              </button>
              <button
                onClick={() => setSelectedArchetype("trap")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  selectedArchetype === "trap" ? "bg-white text-rose-700 shadow-xs" : "text-slate-600 hover:text-rose-700"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Traps & Disasters</span>
              </button>
              <button
                onClick={() => setSelectedArchetype("compounding")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  selectedArchetype === "compounding" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-emerald-700"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Compounding & Triumphs</span>
              </button>
              <button
                onClick={() => setSelectedArchetype("systemic")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  selectedArchetype === "systemic" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-indigo-700"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Corporate & Systemic</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" /> Track:
            </span>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? "bg-[#0E6163] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Active Filter Counter & Reset Action */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Showing <strong className="text-slate-900">{filteredCases.length}</strong> of{" "}
              <strong className="text-slate-900">{cases.length}</strong> verified case investigations
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[#0E6163] font-bold hover:underline"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 04 · MULTI-RHYTHM 3-COLUMN EDITORIAL MAGAZINE GRID       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        {filteredCases.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No case studies match your filter</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              We couldn&apos;t find any case studies matching &ldquo;{searchQuery || selectedCategory}&rdquo;. Try resetting your filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0E6163] text-white hover:bg-teal-700 transition-all shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((cs) => {
              const isTrap = cs.archetype === "trap";
              const isCompounding = cs.archetype === "compounding";
              const isSystemic = cs.archetype === "systemic";

              // Visual styling mapping per archetype
              let archetypeBadge = {
                label: "Costly Mistake",
                icon: AlertTriangle,
                className: "bg-rose-50 text-rose-700 border-rose-200/80",
                stakesClass: "bg-rose-50/80 text-rose-950 border-rose-200 font-bold",
                lessonBorder: "border-rose-400 bg-rose-50/30 text-rose-950",
              };

              if (isCompounding) {
                archetypeBadge = {
                  label: "Compounding",
                  icon: TrendingUp,
                  className: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
                  stakesClass: "bg-emerald-50/80 text-emerald-950 border-emerald-200 font-bold",
                  lessonBorder: "border-emerald-400 bg-emerald-50/30 text-emerald-950",
                };
              } else if (isSystemic) {
                archetypeBadge = {
                  label: "Institutional",
                  icon: Building2,
                  className: "bg-indigo-50 text-indigo-800 border-indigo-200/80",
                  stakesClass: "bg-indigo-50/80 text-indigo-950 border-indigo-200 font-bold",
                  lessonBorder: "border-indigo-400 bg-indigo-50/30 text-indigo-950",
                };
              }

              const ArchetypeIcon = archetypeBadge.icon;

              return (
                <Link
                  key={cs.id || cs.slug}
                  href={`/case-studies/${cs.slug}`}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#0E6163] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-6 flex flex-col justify-between group block text-left"
                >
                  <div>
                    {/* Top Row: Archetype Badge + Difficulty + Pro pill */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${archetypeBadge.className}`}
                        >
                          <ArchetypeIcon className="w-3 h-3 stroke-[2.5]" />
                          <span>{archetypeBadge.label}</span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md capitalize">
                          {cs.difficulty}
                        </span>
                      </div>
                      {!cs.is_free ? (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                          💎 Pro
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Free
                        </span>
                      )}
                    </div>

                    {/* Financial Stakes Callout Pill */}
                    {cs.financial_stakes && (
                      <div
                        className={`text-[11px] px-3 py-1.5 rounded-lg border mb-3.5 tracking-tight flex items-center justify-between gap-2 ${archetypeBadge.stakesClass}`}
                      >
                        <span className="truncate">{cs.financial_stakes}</span>
                      </div>
                    )}

                    {/* Story Title */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0E6163] transition-colors leading-snug line-clamp-2 mb-2">
                      {cs.title}
                    </h3>

                    {/* Protagonist Badge */}
                    {cs.protagonist && (
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-2.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{cs.protagonist}</span>
                      </div>
                    )}

                    {/* Narrative Subtitle */}
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {cs.subtitle}
                    </p>

                    {/* Key Lesson Pull-Quote */}
                    {cs.key_lesson && (
                      <div
                        className={`p-3 rounded-xl text-xs leading-relaxed font-medium mb-5 border-l-2 ${archetypeBadge.lessonBorder}`}
                      >
                        💡 <strong className="text-slate-900">Key Takeaway:</strong> {cs.key_lesson}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Duration + CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {cs.duration_minutes || 10} min read
                    </span>
                    <span className="font-bold text-[#0E6163] group-hover:text-teal-700 flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                      <span>Read Case Study</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 05 · 'THE REALITY CHECK' CURRICULUM BRIDGE                */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full inline-block mb-3">
              The Reality Check Bridge
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Don&apos;t Let the Market Charge You Tuition.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every disaster in our case studies corresponds directly to an interactive masterclass or simulator in the
              FinanceHub curriculum. Learn the theory, run the numbers, and build immunity against financial shocks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bridge 1: Health Insurance */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Health Insurance Masterclass</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Learn how room rent sub-limits, proportionate deductions, and Section 45 moratorium rules work under IRDAI guidelines so your claims are settled 100%.
                </p>
              </div>
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors uppercase tracking-wider"
              >
                <span>Explore Insurance Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Bridge 2: F&O Simulators */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Risk-Free Options Simulator</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Experience Theta decay, delta exposure, and margin calls in simulated NIFTY option markets with zero risk to your real bank account before trading.
                </p>
              </div>
              <Link
                href="/simulators"
                className="inline-flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider"
              >
                <span>Launch Trading Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Bridge 3: Tax Planning */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Tax & ESOP Decision Engine</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Model Section 17(2) perquisite liabilities, calculate capital gains tax across old and new regimes, and optimize salary deductions with real calculators.
                </p>
              </div>
              <Link
                href="/practice/tax"
                className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
              >
                <span>Open Tax Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 06 · INSTITUTIONAL TRUST & REGULATORY FRAMEWORK STRIP     */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Institutional Mandate
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Grounding Financial Literacy in Indian Regulatory Precedents
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                SEBI Investor Protection
              </span>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                IRDAI Health Circular 2024
              </span>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                RBI Retail Credit Guidelines
              </span>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                RERA Section 18 Compliance
              </span>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-500 leading-relaxed">
            <p>
              FinanceHub of India operates strictly as an educational academy. Every case study in this library is reverse-engineered from published court decisions, Securities Appellate Tribunal (SAT) orders, SEBI research papers, National Consumer Disputes Redressal Commission (NCDRC) judgments, and audited company filings.
            </p>
            <p>
              Protagonist names and minor details are altered to respect privacy while preserving exact monetary calculations, policy clauses, and mathematical outcomes. Nothing contained in these investigations constitutes formal legal, tax, or investment advice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
