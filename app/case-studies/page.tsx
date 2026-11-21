"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, ArrowRight, ArrowLeft, Clock, ShieldCheck, 
  Lock, ArrowUpRight, TrendingDown, TrendingUp, AlertTriangle, X,
  Sparkles, Layers, BookOpen, FileText, CheckCircle2
} from "lucide-react";

// ============================================================
// FinanceHub — Real Indian Case Studies (10/10 Editorial Standard)
// app/case-studies/page.tsx
// "The Failure & Recovery Files" · Forensic Outcome-First Architecture
// ============================================================

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  category: "Personal Finance" | "Trading & Markets" | "Health Insurance" | "Investing" | "Corporate Finance";
  level: "Beginner" | "Intermediate" | "Advanced";
  time: string;
  outcomeType: "loss" | "gain" | "systemic";
  outcomeValue: string;
  outcomeLabel: string;
  summary: string;
  lesson: string;
  pro: boolean;
  accentColor: string;
  tagColor: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "1",
    slug: "zaras-health-insurance-rejection",
    title: "Zara's Health Insurance Rejection",
    category: "Health Insurance",
    level: "Beginner",
    time: "12 min read",
    outcomeType: "loss",
    outcomeValue: "₹6.38L",
    outcomeLabel: "Paid Out of Pocket",
    summary: "How a single room-rent sub-limit and a missing pre-authorization turned a ₹6.8L hospital bill into a financial nightmare.",
    lesson: "Room rent sub-limits slash surgeon and OT fees proportionately. Always insist on policies with zero room-rent capping.",
    pro: false,
    accentColor: "#EF4444",
    tagColor: "bg-red-50 text-red-700 border-red-200",
  },
  {
    id: "2",
    slug: "rahuls-fd-illusion",
    title: "Rahul's FD Illusion: The Hidden Inflation Tax",
    category: "Personal Finance",
    level: "Beginner",
    time: "10 min read",
    outcomeType: "loss",
    outcomeValue: "-60%",
    outcomeLabel: "Real Purchasing Power",
    summary: "How 20 years of 'safe' bank fixed deposits silently destroyed ₹10 lakh of purchasing power while appearing to grow.",
    lesson: "After 7% real inflation and 30% slab tax, the net compounded real return on standard bank FDs is mathematically negative.",
    pro: false,
    accentColor: "#EF4444",
    tagColor: "bg-red-50 text-red-700 border-red-200",
  },
  {
    id: "3",
    slug: "the-50-lakh-fo-trap",
    title: "The ₹50 Lakh F&O Trap: From Hero to Zero",
    category: "Trading & Markets",
    level: "Advanced",
    time: "15 min read",
    outcomeType: "loss",
    outcomeValue: "-₹50L",
    outcomeLabel: "Total Capital Lost",
    summary: "A young software professional turned ₹5 lakh into ₹50 lakh in index options during a bull run, then lost it all in 3 weeks.",
    lesson: "Leverage works both ways. SEBI verified that 89% of individual retail derivative traders incur significant net losses.",
    pro: true,
    accentColor: "#EF4444",
    tagColor: "bg-red-50 text-red-700 border-red-200",
  },
  {
    id: "4",
    slug: "the-coffee-can-portfolio",
    title: "The Coffee Can Portfolio: Compounding in Peace",
    category: "Investing",
    level: "Intermediate",
    time: "8 min read",
    outcomeType: "gain",
    outcomeValue: "+14.2%",
    outcomeLabel: "CAGR Over 20 Years",
    summary: "A classic Indian investing experiment: buying 10 clean, high-ROCE cash-flow generating businesses and never touching them.",
    lesson: "Patience is the ultimate edge. High-quality businesses compound wealth when you eliminate emotional meddling.",
    pro: false,
    accentColor: "#10B981",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "5",
    slug: "the-ilfs-liquidity-crisis",
    title: "The IL&FS Liquidity Crisis: When AAA Failed",
    category: "Corporate Finance",
    level: "Advanced",
    time: "20 min read",
    outcomeType: "systemic",
    outcomeValue: "₹91,000 Cr",
    outcomeLabel: "Defaulted Debt",
    summary: "How the sudden collapse of a AAA-rated infrastructure giant froze the Indian credit market and tanked debt mutual funds.",
    lesson: "Credit ratings are opinions, not guarantees. Always scrutinize asset-liability duration mismatches.",
    pro: true,
    accentColor: "#F59E0B",
    tagColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "6",
    slug: "the-esop-tax-shock",
    title: "The ESOP Tax Shock: Cashless Tax Demand",
    category: "Corporate Finance",
    level: "Advanced",
    time: "14 min read",
    outcomeType: "loss",
    outcomeValue: "₹28L",
    outcomeLabel: "Illiquid Tax Demand",
    summary: "Neha exercised unlisted unicorn options and was hit with ₹28 lakhs in Section 17(2) perquisite tax with zero secondary liquidity.",
    lesson: "Never exercise private startup options without guaranteed secondary liquidity or an official company buyback program.",
    pro: true,
    accentColor: "#EF4444",
    tagColor: "bg-red-50 text-red-700 border-red-200",
  },
  {
    id: "7",
    slug: "priya-emergency-fund-mistake",
    title: "Priya's ₹50,000 Laptop Emergency Mistake",
    category: "Personal Finance",
    level: "Beginner",
    time: "10 min read",
    outcomeType: "loss",
    outcomeValue: "-₹3.6L",
    outcomeLabel: "Compounding Loss",
    summary: "How one unexpected laptop breakdown forced premature equity redemption at a market trough, costing years of gains.",
    lesson: "Build a 6-month liquid emergency reserve before allocating a single rupee into long-term equity SIPs.",
    pro: false,
    accentColor: "#EF4444",
    tagColor: "bg-red-50 text-red-700 border-red-200",
  },
  {
    id: "8",
    slug: "step-up-sip-compounding",
    title: "The 10% Step-Up SIP: Beating Active Funds",
    category: "Investing",
    level: "Beginner",
    time: "9 min read",
    outcomeType: "gain",
    outcomeValue: "+₹1.42 Cr",
    outcomeLabel: "30-Year Surplus",
    summary: "Starting with just ₹5,000/month and increasing by 10% each year created ₹1.42 Cr more than a flat ₹10,000 SIP.",
    lesson: "Step-up SIPs capture salary increments automatically and overcome the psychological drag of market timing.",
    pro: false,
    accentColor: "#10B981",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "9",
    slug: "the-builder-delay-ravis-wait",
    title: "The Builder Delay: Ravi's 7-Year Pre-EMI Drain",
    category: "Personal Finance",
    level: "Intermediate",
    time: "13 min read",
    outcomeType: "loss",
    outcomeValue: "₹24.5L",
    outcomeLabel: "Pre-EMI & Rent Drain",
    summary: "How an under-construction Noida flat was delayed by 7 years, forcing Ravi to pay double rent and interest concurrently.",
    lesson: "Under-construction projects carry massive completion risks. Enforce RERA Section 18 compensation immediately.",
    pro: false,
    accentColor: "#EF4444",
    tagColor: "bg-red-50 text-red-700 border-red-200",
  },
];

const CATEGORIES = [
  "All",
  "Personal Finance",
  "Trading & Markets",
  "Health Insurance",
  "Investing",
  "Corporate Finance",
] as const;

export default function CaseStudiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredStudies = useMemo(() => {
    return CASE_STUDIES.filter((study) => {
      const matchesCategory = activeCategory === "All" || study.category === activeCategory;
      const matchesSearch =
        study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.lesson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.outcomeValue.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1A1A2E] overflow-x-hidden">
      
      {/* ── Institutional Hero Header ────────────────────────────── */}
      <div className="bg-[#0A1628] text-white relative overflow-hidden border-b border-gray-800">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-6 pt-10 pb-16 relative z-10">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-400 border border-white/10 text-[12px] font-bold uppercase tracking-wider mb-6">
              <ShieldCheck className="w-3.5 h-3.5" /> Real Indian Case Studies · The Failure & Recovery Files
            </div>

            <h1 
              className="text-[40px] md:text-[54px] font-bold text-white leading-[1.1] mb-4 tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              The Reality of Money in the <span className="text-emerald-400">Real World.</span>
            </h1>

            <p className="text-[17px] text-gray-300 leading-relaxed mb-8 max-w-2xl">
              Every financial disaster began with an innocent assumption. Dissect authentic Indian case studies to master the hard-won lessons before the market charges you tuition.
            </p>

            {/* Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl pt-6 border-t border-white/10">
              <div>
                <p className="text-2xl font-bold font-mono text-white">9</p>
                <p className="text-xs text-gray-400 font-medium">Deep Investigations</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-red-400">-₹50 Lakh</p>
                <p className="text-xs text-gray-400 font-medium">F&O Disaster Dissected</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-emerald-400">+₹1.42 Cr</p>
                <p className="text-xs text-gray-400 font-medium">Disciplined SIP Edge</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-amber-400">₹91k Cr</p>
                <p className="text-xs text-gray-400 font-medium">Corporate Default File</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12">

        {/* ── Search & Modern Category Filter Bar ──────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by person, company, financial disaster, or concept (e.g. F&O, Zara, Health Insurance, FD)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[14px] text-[#0A1628] outline-none focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-[#0A1628] text-white shadow-sm"
                      : "bg-[#F8FAFC] text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>

        {/* ── Featured Hero Case Study (Forensic Breakdown) ───────── */}
        {(!searchQuery || "zara".includes(searchQuery.toLowerCase()) || "insurance".includes(searchQuery.toLowerCase())) &&
          (activeCategory === "All" || activeCategory === "Health Insurance") && (
            <div className="mb-14">
              <div className="bg-[#0A1628] rounded-3xl overflow-hidden flex flex-col lg:flex-row relative shadow-2xl border border-gray-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* Left: Story Content */}
                <div className="flex-1 p-8 lg:p-12 relative z-10">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                      Featured Forensic Investigation
                    </span>
                    <span className="px-2.5 py-1 bg-white/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-500/30">
                      Health Insurance Fine Print
                    </span>
                    <span className="px-2.5 py-1 bg-red-500/20 text-red-300 text-[10px] font-bold rounded">
                      -93.8% Claim Rejection
                    </span>
                  </div>

                  <h2 
                    className="text-[26px] md:text-[34px] font-bold text-white leading-tight mb-4" 
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Zara's Health Insurance Rejection — How a ₹5 Lakh Policy Paid Only ₹42,100 on a ₹6.8 Lakh Hospital Bill
                  </h2>

                  <p className="text-[15px] text-gray-300 leading-relaxed mb-6 max-w-xl">
                    A single room-rent sub-limit and missing pre-authorization turned a standard hospital admission into a devastating financial wipeout.
                  </p>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 max-w-xl">
                    <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      The Real Takeaway
                    </p>
                    <p className="text-[13.5px] text-white italic leading-relaxed">
                      "Room rent sub-limits trigger proportionate deduction clauses that slash your surgeon, ICU, and nursing fees by the exact same percentage. Always insist on policies with zero room-rent capping."
                    </p>
                  </div>

                  <Link
                    href="/case-studies/zaras-health-insurance-rejection"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-[14px] font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Investigate Full Breakdown <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Right: Terminal Financial Ledger */}
                <div className="lg:w-[380px] bg-[#070D18] p-8 lg:p-12 border-t lg:border-t-0 lg:border-l border-white/10 relative z-10 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Total Hospital Bill
                      </p>
                      <p className="text-[28px] font-bold text-white font-mono tracking-tight">
                        ₹6,80,000
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Insurance Approved
                      </p>
                      <p className="text-[28px] font-bold text-emerald-400 font-mono tracking-tight">
                        ₹42,100
                      </p>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-1">
                        The Real Cost (Out of Pocket)
                      </p>
                      <p className="text-[34px] font-bold text-red-500 font-mono tracking-tight">
                        ₹6,37,900
                      </p>
                      <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
                        Paid out-of-pocket by draining family emergency funds and high-interest credit cards.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        {/* ── 9 Case Studies Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudies
            .filter((s) => s.id !== "1" || searchQuery.length > 0)
            .map((study) => {
              const Icon =
                study.outcomeType === "loss"
                  ? TrendingDown
                  : study.outcomeType === "gain"
                  ? TrendingUp
                  : AlertTriangle;

              return (
                <Link
                  key={study.id}
                  href={`/case-studies/${study.slug}`}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative"
                >
                  {/* Left Outcome Color Accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ background: study.accentColor }}
                  />

                  {/* Card Header: Category & Level */}
                  <div className="pl-6 pr-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {study.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {study.pro && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Pro
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-mono font-bold uppercase rounded border border-gray-200/60">
                        {study.level}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 pl-7 flex-1 flex flex-col">
                    
                    {/* Outcome Number Hook */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{
                          background: `${study.accentColor}15`,
                          border: `1px solid ${study.accentColor}30`,
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: study.accentColor }} />
                      </div>
                      <div>
                        <p
                          className="text-[24px] font-bold leading-none font-mono tracking-tight"
                          style={{ color: study.accentColor }}
                        >
                          {study.outcomeValue}
                        </p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">
                          {study.outcomeLabel}
                        </p>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-[18px] font-bold text-[#0A1628] leading-snug mb-2 group-hover:text-[#2563EB] transition-colors line-clamp-2">
                      {study.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-[13px] text-gray-500 leading-relaxed mb-5 flex-1 line-clamp-2">
                      {study.summary}
                    </p>

                    {/* Key Takeaway Quote */}
                    <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 mb-5">
                      <p
                        className="text-[10px] font-bold uppercase tracking-wider mb-1"
                        style={{ color: study.accentColor }}
                      >
                        Forensic Takeaway
                      </p>
                      <p className="text-[12.5px] text-gray-800 italic leading-snug">
                        "{study.lesson}"
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-gray-400" /> {study.time}
                      </div>
                      <span 
                        className="flex items-center gap-1 text-[12px] font-bold group-hover:translate-x-1 transition-transform"
                        style={{ color: study.accentColor }}
                      >
                        Read Investigation <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                  </div>
                </Link>
              );
            })}
        </div>

        {/* Empty Search State */}
        {filteredStudies.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto my-12">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center text-2xl mx-auto mb-4">
              📂
            </div>
            <h3 className="text-lg font-bold text-[#0A1628] mb-1">No case studies found</h3>
            <p className="text-sm text-gray-500 mb-6">Try searching for broader terms or reset the category filter.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
              className="px-6 py-2.5 bg-[#0A1628] text-white rounded-xl text-xs font-bold hover:bg-[#1E293B] transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
