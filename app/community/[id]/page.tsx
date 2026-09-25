"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, CheckCircle2, ShieldCheck, Bot, Clock, BookOpen } from "lucide-react";
import VoteButton from "@/components/community/VoteButton";
import AnswerForm from "@/components/community/AnswerForm";
import { supabase } from "@/lib/supabase";

interface QuestionDetail {
  id: string;
  question: string;
  is_answered: boolean;
  is_pinned: boolean;
  upvote_count: number;
  answer_count: number;
  created_at: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  } | null;
  lessons?: {
    title?: string;
    slug?: string;
  } | null;
}

interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  answer: string;
  is_accepted: boolean;
  is_staff: boolean;
  is_ai: boolean;
  upvote_count: number;
  created_at: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  } | null;
}

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    });

    fetchThread();
  }, [params.id]);

  const fetchThread = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/community/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setQuestion(data.question);
        setAnswers(data.answers || []);
      }
    } catch (err) {
      console.error("Failed to load question thread:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Question Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">The question you are looking for may have been removed.</p>
        <Link
          href="/community"
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
        >
          Back to Community
        </Link>
      </div>
    );
  }

  const authorName = question.profiles?.full_name || "Learner";
  const authorAvatar = question.profiles?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${question.id}`;
  const formattedDate = new Date(question.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-8">
        {/* Back Link */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Community Q&A
        </Link>

        {/* Main Question Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl mb-8">
          <div className="flex items-center justify-between gap-3 mb-4">
            {question.lessons?.title && (
              <Link
                href={`/lessons/${question.lessons.slug}`}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                {question.lessons.title}
              </Link>
            )}

            {question.is_answered && (
              <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Answered
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-6">
            {question.question}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"
              />
              <div>
                <div className="text-xs font-semibold text-slate-200">{authorName}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formattedDate}
                </div>
              </div>
            </div>

            <VoteButton
              userId={currentUserId}
              targetType="question"
              targetId={question.id}
              initialUpvoteCount={question.upvote_count}
            />
          </div>
        </div>

        {/* Answers Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Answers ({answers.length})
          </h3>
        </div>

        {/* Answers List */}
        <div className="space-y-4 mb-8">
          {answers.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
              <p className="text-slate-400 text-sm">No answers yet. Be the first to answer!</p>
            </div>
          ) : (
            answers.map((a) => {
              const ansAuthor = a.profiles?.full_name || "Community Member";
              const ansAvatar = a.profiles?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${a.id}`;
              const ansDate = new Date(a.created_at).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={a.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    a.is_accepted
                      ? "bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/30"
                      : "bg-slate-900/60 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={ansAvatar}
                        alt={ansAuthor}
                        className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                          {ansAuthor}
                          {a.is_staff && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3" /> Staff
                            </span>
                          )}
                          {a.is_ai && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                              <Bot className="w-3 h-3" /> AI Tutor
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{ansDate}</div>
                      </div>
                    </div>

                    {a.is_accepted && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accepted Answer
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap mb-4">
                    {a.answer}
                  </p>

                  <div className="flex justify-end pt-3 border-t border-slate-800/60">
                    <VoteButton
                      userId={currentUserId}
                      targetType="answer"
                      targetId={a.id}
                      initialUpvoteCount={a.upvote_count}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Answer Form */}
        <AnswerForm
          questionId={question.id}
          userId={currentUserId}
          onAnswerAdded={() => fetchThread()}
        />
      </div>
    </div>
  );
}
