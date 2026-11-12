"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, ArrowRight, ArrowLeft, Clock, ShieldCheck, 
  Lock, ArrowUpRight, TrendingDown, TrendingUp, AlertTriangle, X
} from "lucide-react";

// ============================================================
// FinanceHub — Real Indian Case Studies (10/10 Synthesis)
// app/case-studies/page.tsx
// Outcome-First Hook · Editorial Polish · Strict Color Discipline
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
    outcomeValue: "₹6.37L",
    outcomeLabel: "Out of Pocket",
    summary: "How a single room-rent sub-limit and a missing pre-authorization turned a ₹6.8L bill into a financial nightmare.",
    lesson: "Room rent sub-limits and co-pay clauses slash surgeon and OT fees proportionally. Always check the fine print.",
    pro: false,
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
    outcomeLabel: "Purchasing Power",
    summary: "How 20 years of 'safe' fixed deposits silently destroyed ₹10 lakh of purchasing power while appearing to grow.",
    lesson: "After 7% inflation and 30% slab tax, the real compounded return on standard fixed deposits is negative.",
    pro: false,
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
    outcomeLabel: "Total Capital",
    summary: "A young software professional turned ₹5 lakh into ₹50 lakh in F&O during a bull run, then lost it all in 3 weeks.",
    lesson: "Leverage works both ways. SEBI verified that 89% of individual retail derivative traders lose money.",
    pro: true,
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
    outcomeLabel: "CAGR over 20 Years",
    summary: "A classic Indian investing experiment: buying 10 clean, high-ROCE cash-flow generating businesses and never touching them.",
    lesson: "Patience is the ultimate edge. High-quality businesses compound wealth when you remove emotional meddling.",
    pro: false,
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
    outcomeLabel: "Illiquid Tax Bill",
    summary: "Neha exercised unlisted unicorn options and was hit with ₹28 lakhs in Section 17(2) perquisite tax with zero secondary liquidity.",
    lesson: "Never exercise private startup options without guaranteed secondary liquidity or an official company buyback.",
    pro: true,
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
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#1A1A2E]">
      
      {/* ── Top Navigation Link ─────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-6 pt-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-[#0E6163] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        
        {/* ── Page Header ────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold tracking-widest uppercase mb-4">
            <ShieldCheck className="w-4 h-4" /> Real People. Real Decisions. Real Consequences.
          </div>
          <h1 
            className="text-[38px] md:text-[46px] font-bold text-[#0A1628] leading-[1.15] mb-3 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            The Reality of Money in the Real World.
          </h1>
          <p className="text-[16px] text-gray-500 max-w-2xl leading-relaxed">
            Every financial disaster began with an innocent assumption. Explore authentic Indian case studies to master the hard-won lessons before the market charges you tuition.
          </p>
        </div>

        {/* ── Search & Modern Category Filter Tabs ─────────────────── */}
        <div className="mb-10 bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-xs">
          
          {/* Search Box */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by protagonist, company, financial loss, or key topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-10 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0E6163] focus:ring-4 focus:ring-[#0E6163]/10 text-[14px] text-[#0A1628] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                    active
                      ? "bg-[#0E6163] text-white shadow-xs"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent hover:border-gray-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>

        {/* ── Featured Hero Case Study (Bloomberg Style) ──────────── */}
        {(!searchQuery || "zara".includes(searchQuery.toLowerCase()) || "insurance".includes(searchQuery.toLowerCase())) &&
          (activeCategory === "All" || activeCategory === "Health Insurance") && (
            <div className="mb-12">
              <div className="bg-[#0A1628] rounded-3xl overflow-hidden flex flex-col lg:flex-row relative shadow-2xl border border-gray-800">
                
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* Left: Story */}
                <div className="flex-1 p-8 lg:p-12 relative z-10">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                      Featured Investigation
                    </span>
                    <span className="px-2.5 py-1 bg-white/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-500/30">
                      Health Insurance
                    </span>
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] font-bold rounded">
                      -91.2% Claim Rejection
                    </span>
                  </div>

                  <h2 
                    className="text-[28px] md:text-[34px] font-bold text-white leading-tight mb-4" 
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Zara's Health Insurance Rejection — How a ₹5 Lakh Policy Paid Only ₹42,100 on a ₹6.8 Lakh Hospital Bill
                  </h2>

                  <p className="text-[15px] text-gray-300 leading-relaxed mb-6 max-w-xl">
                    A single room-rent sub-limit and a missing pre-authorization turned a standard hospital admission into a devastating financial wipeout.
                  </p>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 max-w-xl">
                    <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      The Real Takeaway
                    </p>
                    <p className="text-[14px] text-white italic leading-relaxed">
                      "Room rent sub-limits trigger proportionate deduction clauses that slash your surgeon, ICU, and nursing fees by the exact same percentage. Always insist on zero room-rent capping."
                    </p>
                  </div>

                  <Link
                    href="/case-studies/zaras-health-insurance-rejection"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-[14px] font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Investigate This Case <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Right: Terminal Financial Data */}
                <div className="lg:w-[400px] bg-[#070D18] p-8 lg:p-12 border-t lg:border-t-0 lg:border-l border-white/10 relative z-10 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Hospital Bill
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
                      <p className="text-[32px] font-bold text-red-500 font-mono tracking-tight">
                        ₹6,37,900
                      </p>
                      <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
                        Paid out-of-pocket by draining family emergency funds and swiping high-interest credit cards.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        {/* ── Case Study Grid (Outcome-First Architecture) ─────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudies
            .filter((s) => s.id !== "1" || searchQuery.length > 0)
            .map((study) => {
              // Strict Semantic Color Discipline
              const accentColor =
                study.outcomeType === "loss"
                  ? "#EF4444"
                  : study.outcomeType === "gain"
                  ? "#10B981"
                  : "#3B82F6";

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
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all group flex flex-col relative"
                >
                  {/* Left Outcome Color Strip */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ background: accentColor }}
                  />

                  {/* Card Header: Subtle Category & Difficulty */}
                  <div className="pl-6 pr-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/40">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {study.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {study.pro && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Pro
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded border border-gray-200/60">
                        {study.level}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 pl-7 flex-1 flex flex-col">
                    
                    {/* Outcome Number (The Hook) */}
                    <div className="flex items-center gap-3 mb-3.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{
                          background: `${accentColor}15`,
                          border: `1px solid ${accentColor}30`,
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: accentColor }} />
                      </div>
                      <div>
                        <p
                          className="text-[22px] font-bold leading-none font-mono tracking-tight"
                          style={{ color: accentColor }}
                        >
                          {study.outcomeValue}
                        </p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">
                          {study.outcomeLabel}
                        </p>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-[18px] font-bold text-[#0A1628] leading-snug mb-2 group-hover:text-[#0E6163] transition-colors line-clamp-2">
                      {study.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-[13.5px] text-gray-500 leading-relaxed mb-6 flex-1 line-clamp-2">
                      {study.summary}
                    </p>

                    {/* Key Takeaway Quote */}
                    <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 mb-6">
                      <p
                        className="text-[10px] font-bold uppercase tracking-wider mb-1"
                        style={{ color: accentColor }}
                      >
                        Key Takeaway
                      </p>
                      <p className="text-[13px] text-gray-800 italic leading-snug">
                        "{study.lesson}"
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
                        <Clock className="w-3.5 h-3.5" /> {study.time}
                      </div>
                      <span className="flex items-center gap-1 text-[12px] font-bold text-[#0E6163] group-hover:text-[#10B981] group-hover:underline transition-colors">
                        Read Case Study{" "}
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>

                  </div>
                </Link>
              );
            })}
        </div>

        {/* Empty State */}
        {filteredStudies.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto my-12">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center text-2xl mx-auto mb-4">
              📂
            </div>
            <h3 className="text-lg font-bold text-[#0A1628] mb-1">No case studies found</h3>
            <p className="text-sm text-gray-500 mb-6">Try searching for another topic or resetting the category filter.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
              className="px-5 py-2.5 bg-[#0E6163] text-white rounded-xl text-sm font-bold shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ── Bottom Institutional CTA ─────────────────────────────── */}
        <div className="mt-16 bg-[#0A1628] rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-xl border border-gray-800">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 
                className="text-[28px] md:text-[34px] font-bold text-white mb-3" 
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Don't Let the Market Charge You Tuition.
              </h2>
              <p className="text-[15px] text-gray-400 leading-relaxed mb-2 max-w-lg">
                Learn from the real mistakes of others. Master the core pillars of risk, tax, and capital allocation before you deploy real money.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/explore/personal-finance"
                className="flex-1 px-6 py-4 bg-white/10 text-white rounded-xl text-[14px] font-bold hover:bg-white/20 transition-all border border-white/20 text-center"
              >
                Master Personal Finance
              </Link>
              <Link 
                href="/simulators"
                className="flex-1 px-6 py-4 bg-[#10B981] text-white rounded-xl text-[14px] font-bold hover:bg-[#059669] transition-all text-center"
              >
                Try Risk Simulators
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
