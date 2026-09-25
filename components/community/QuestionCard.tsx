"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Pin, CheckCircle2, BookOpen, Clock } from "lucide-react";
import VoteButton from "./VoteButton";

export interface QuestionCardProps {
  id: string;
  question: string;
  is_answered: boolean;
  is_pinned: boolean;
  upvote_count: number;
  answer_count: number;
  created_at: string;
  currentUserId?: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  } | null;
  lessons?: {
    title?: string;
    slug?: string;
  } | null;
}

export default function QuestionCard({
  id,
  question,
  is_answered,
  is_pinned,
  upvote_count,
  answer_count,
  created_at,
  currentUserId,
  profiles,
  lessons,
}: QuestionCardProps) {
  const authorName = profiles?.full_name || "Community Member";
  const authorAvatar = profiles?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`;
  const formattedDate = new Date(created_at).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      is_pinned
        ? "bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20"
        : "bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700"
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs">
          {is_pinned && (
            <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
              <Pin className="w-3 h-3" /> Pinned
            </span>
          )}
          {lessons?.title && (
            <Link
              href={`/lessons/${lessons.slug}`}
              className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 bg-slate-800 px-2 py-0.5 rounded-md font-medium truncate max-w-[200px]"
            >
              <BookOpen className="w-3 h-3 text-emerald-500" />
              {lessons.title}
            </Link>
          )}
        </div>

        {is_answered ? (
          <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Answered
          </span>
        ) : (
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">
            Unanswered
          </span>
        )}
      </div>

      <Link href={`/community/${id}`} className="block group">
        <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors leading-snug mb-3">
          {question}
        </h3>
      </Link>

      <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2.5 text-xs text-slate-400">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600"
          />
          <span className="font-medium text-slate-300">{authorName}</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3 h-3" />
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <VoteButton
            userId={currentUserId}
            targetType="question"
            targetId={id}
            initialUpvoteCount={upvote_count}
          />

          <Link
            href={`/community/${id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>{answer_count}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
