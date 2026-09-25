"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, Search, Plus, Filter, Sparkles, CheckCircle2, TrendingUp, HelpCircle } from "lucide-react";
import QuestionCard, { QuestionCardProps } from "@/components/community/QuestionCard";
import AskQuestionModal from "@/components/community/AskQuestionModal";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import { supabase } from "@/lib/supabase";

export default function CommunityPage() {
  const [questions, setQuestions] = useState<QuestionCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unanswered" | "pinned">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [lessonsList, setLessonsList] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    // Get current user session
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    });

    // Fetch lessons for modal dropdown
    supabase
      .from("lessons")
      .select("id, title")
      .eq("is_published", true)
      .limit(50)
      .then(({ data }) => {
        if (data) setLessonsList(data);
      });

    fetchQuestions();
  }, [filter]);

  const fetchQuestions = async (search = searchQuery) => {
    setIsLoading(true);
    try {
      const url = new URL("/api/community", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (filter !== "all") url.searchParams.set("filter", filter);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok && data.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error("Failed to load community questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions(searchQuery);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* PWA Install Banner */}
      <PWAInstallPrompt />

      {/* Header Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800 pt-10 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <MessageSquare className="w-4 h-4" />
                FinanceHub Community Q&A
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Ask, Learn & Excel Together
              </h1>
              <p className="text-slate-400 text-sm max-w-xl mt-2 leading-relaxed">
                Connect with finance learners, tutors, and AI to resolve doubts about taxes, investing, personal finance, and trading. Earn XP for contributing!
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-xl shadow-emerald-950/50 transition-all active:scale-95 text-sm self-start md:self-auto"
            >
              <Plus className="w-5 h-5" />
              Ask a Question
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <div className="text-xs text-slate-400">Total Discussions</div>
              <div className="text-xl font-black text-white mt-1">1,240+</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <div className="text-xs text-slate-400">Answer Rate</div>
              <div className="text-xl font-black text-emerald-400 mt-1">94.8%</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-400">Community XP Awarded</div>
              <div className="text-xl font-black text-amber-400 mt-1">45,800 XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pt-8">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. LTCG, ELSS, 80C, Options)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </form>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl transition-colors ${
                filter === "all"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unanswered")}
              className={`px-4 py-2 rounded-xl transition-colors ${
                filter === "unanswered"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Unanswered
            </button>
            <button
              onClick={() => setFilter("pinned")}
              className={`px-4 py-2 rounded-xl transition-colors ${
                filter === "pinned"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pinned
            </button>
          </div>
        </div>

        {/* Questions List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-32 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Questions Found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              Be the first to ask a question! Your doubt might help hundreds of other learners.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-xs shadow-lg shadow-emerald-950/40 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ask Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                {...q}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onQuestionCreated={() => fetchQuestions()}
        userId={currentUserId}
        lessonsList={lessonsList}
      />
    </div>
  );
}
