"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowRight, BookOpen, Clock, CheckCircle2, Sparkles, Filter, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Explore Courses & Learning Tracks (Discovery Hub)
// app/explore/page.tsx
// Phase 1: Pure Discovery Hub · 7 Sovereign Master Tracks
// ============================================================

export interface ExploreTrack {
  id: string;
  slug: string;
  title: string;
  icon: string;
  lessons: number;
  completedLessons?: number;
  color: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
}

const DEFAULT_TRACKS: ExploreTrack[] = [
  {
    id: "personal-finance",
    slug: "personal-finance",
    title: "Personal Finance",
    icon: "💰",
    lessons: 73,
    color: "#10B981",
    level: "Beginner",
    description: "Budgeting, emergency funds, SIP investing, debt reduction, and life-stage financial planning.",
  },
  {
    id: "trading-markets",
    slug: "trading-markets",
    title: "Trading & Markets",
    icon: "📈",
    lessons: 51,
    color: "#3B82F6",
    level: "Intermediate",
    description: "From reading candlestick price action to understanding derivatives and running disciplined risk management.",
  },
  {
    id: "crypto-defi",
    slug: "crypto-defi",
    title: "Crypto & DeFi",
    icon: "₿",
    lessons: 36,
    color: "#8B5CF6",
    level: "Beginner",
    description: "Blockchain fundamentals, private keys, self-custody wallets, DeFi liquidity, and Indian crypto tax.",
  },
  {
    id: "corporate-finance",
    slug: "corporate-finance",
    title: "Corporate Finance",
    icon: "🏢",
    lessons: 43,
    color: "#F59E0B",
    level: "Advanced",
    description: "Financial statements, DCF business valuation, startup fundraising, burn rate analysis, and ESOPs.",
  },
  {
    id: "behavioral-finance",
    slug: "behavioral-finance",
    title: "Behavioral Finance",
    icon: "🧠",
    lessons: 23,
    color: "#EC4899",
    level: "Intermediate",
    description: "Understand FOMO, loss aversion, sunk-cost fallacies, and the emotional biases that sabotage wealth.",
  },
  {
    id: "forex-currency",
    slug: "forex-currency",
    title: "Forex & Currency",
    icon: "💱",
    lessons: 26,
    color: "#06B6D4",
    level: "Advanced",
    description: "Master the dynamics of the world's largest financial market ($7.5 trillion daily volume) and currency pairs.",
  },
  {
    id: "technical-analysis",
    slug: "technical-analysis",
    title: "Technical Analysis",
    icon: "📊",
    lessons: 44,
    color: "#F97316",
    level: "Intermediate",
    description: "Chart patterns, support/resistance, RSI, MACD, and volume confirmation to time entries with mathematical edge.",
  },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");
  const [tracks, setTracks] = useState<ExploreTrack[]>(DEFAULT_TRACKS);
  const [user, setUser] = useState<any>(null);

  // Fetch live stats & user progress from Supabase
  useEffect(() => {
    let mounted = true;

    async function loadLiveData() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (mounted) setUser(currentUser);

        // Fetch tracks with their actual lessons count
        const { data: dbTracks } = await supabase
          .from("tracks")
          .select(`
            id, slug, title, description, icon, color_hex,
            levels (
              id,
              lessons ( id, is_published )
            )
          `);

        // Fetch user progress if logged in
        let completedLessonIds = new Set<string>();
        if (currentUser) {
          const { data: prog } = await supabase
            .from("user_progress")
            .select("lesson_id")
            .eq("user_id", currentUser.id)
            .or("completed.eq.true,quiz_score.gt.0");
          if (prog) {
            completedLessonIds = new Set(prog.map((p: any) => p.lesson_id));
          }
        }

        if (dbTracks && dbTracks.length > 0 && mounted) {
          const merged = DEFAULT_TRACKS.map((defTrack) => {
            const match = dbTracks.find(
              (dt: any) => dt.slug === defTrack.slug || dt.id === defTrack.id || dt.title?.toLowerCase() === defTrack.title.toLowerCase()
            );

            if (!match) return defTrack;

            let liveLessonCount = 0;
            let liveCompleted = 0;

            if (match.levels) {
              match.levels.forEach((lv: any) => {
                const publishedLessons = (lv.lessons || []).filter((l: any) => l.is_published !== false);
                liveLessonCount += publishedLessons.length;
                publishedLessons.forEach((l: any) => {
                  if (completedLessonIds.has(l.id)) liveCompleted++;
                });
              });
            }

            return {
              ...defTrack,
              id: match.slug || defTrack.id,
              lessons: liveLessonCount > 0 ? liveLessonCount : defTrack.lessons,
              completedLessons: liveCompleted,
            };
          });

          setTracks(merged);
        }
      } catch (err) {
        console.error("Failed to load live tracks:", err);
      }
    }

    loadLiveData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filtered tracks based on search & level
  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLevel = levelFilter === "All" || t.level === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [tracks, searchQuery, levelFilter]);

  const totalLessons = useMemo(() => {
    return tracks.reduce((sum, t) => sum + t.lessons, 0);
  }, [tracks]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#1A1A2E]">
      
      {/* ── Header & Stats Banner ────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Structured Financial Academies
          </div>

          <h1
            className="text-[38px] md:text-[46px] font-bold text-[#0A1628] leading-[1.15] mb-3 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Explore Courses & Learning Tracks
          </h1>
          <p className="text-[16px] text-gray-500 max-w-2xl mb-8 leading-relaxed">
            Build true financial mastery through structured, self-paced curriculum. Choose your discipline below to inspect the syllabus.
          </p>

          <div className="flex flex-wrap items-center gap-6 text-[14px] font-medium text-gray-600 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#10B981]" />
              <strong>{totalLessons}+</strong> Structured Lessons
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#10B981]" />
              <strong>{tracks.length}</strong> Sovereign Tracks
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              <strong>100% Free</strong> Open-Access Core
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Discovery Content ───────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by topic, e.g. SIP, Candlesticks, Taxes, Valuation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-13 pl-12 pr-10 rounded-2xl bg-white border border-gray-200 text-[15px] text-[#0A1628] outline-none focus:border-[#0E6163] focus:ring-4 focus:ring-[#0E6163]/10 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Level Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Level:
            </span>
            {(["All", "Beginner", "Intermediate", "Advanced"] as const).map((lvl) => {
              const active = levelFilter === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all ${
                    active
                      ? "bg-[#0E6163] text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

        </div>

        {/* Empty Search State */}
        {filteredTracks.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto my-12">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center text-2xl mx-auto mb-4">
              🔍
            </div>
            <h3 className="text-lg font-bold text-[#0A1628] mb-1">No courses match your search</h3>
            <p className="text-sm text-gray-500 mb-6">Try clearing your search query or switching the level filter.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setLevelFilter("All");
              }}
              className="px-5 py-2.5 bg-[#0E6163] text-white rounded-xl text-sm font-bold shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ── Track Grid (Coursera / Masterclass Cards) ─────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredTracks.map((track) => {
            const hasProgress = track.completedLessons !== undefined && track.completedLessons > 0;
            const progressPercent = hasProgress
              ? Math.min(100, Math.round((track.completedLessons! / track.lessons) * 100))
              : 0;

            return (
              <Link 
                key={track.id} 
                href={`/explore/${track.id}`}
                className="group bg-white rounded-3xl border border-gray-200 hover:border-[#10B981] hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col overflow-hidden"
              >
                {/* Top Border Accent */}
                <div className="h-1.5 w-full" style={{ background: track.color }} />
                
                <div className="p-7 flex-1 flex flex-col">
                  
                  {/* Icon & Level Badge */}
                  <div className="flex items-start justify-between mb-5">
                    <div 
                      className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shadow-xs" 
                      style={{ background: `${track.color}15`, border: `1px solid ${track.color}30` }}
                    >
                      {track.icon}
                    </div>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-gray-200/60">
                      {track.level}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-[21px] font-bold text-[#0A1628] mb-2.5 group-hover:text-[#0E6163] transition-colors leading-snug">
                    {track.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[14px] text-gray-500 leading-relaxed mb-6 flex-1">
                    {track.description}
                  </p>

                  {/* Progress Bar (if user has progress) */}
                  {hasProgress && (
                    <div className="mb-4 pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-1.5">
                        <span>Progress</span>
                        <span className="text-[#10B981]">{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-[13px] font-bold text-gray-700">
                      {track.lessons} Lessons
                    </span>
                    <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#0E6163] group-hover:text-[#10B981] transition-colors">
                      View Syllabus <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </span>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
