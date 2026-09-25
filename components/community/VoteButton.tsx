"use client";

import React, { useState } from "react";
import { ThumbsUp } from "lucide-react";

interface VoteButtonProps {
  userId?: string;
  targetType: "question" | "answer";
  targetId: string;
  initialUpvoteCount: number;
  initialHasUpvoted?: boolean;
}

export default function VoteButton({
  userId,
  targetType,
  targetId,
  initialUpvoteCount,
  initialHasUpvoted = false,
}: VoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvoteCount);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      alert("Please sign in to upvote questions and answers.");
      return;
    }

    if (isSubmitting) return;

    // Optimistic UI update
    const previousUpvoted = hasUpvoted;
    const previousCount = upvotes;
    const nextUpvoted = !hasUpvoted;
    const nextCount = nextUpvoted ? upvotes + 1 : Math.max(0, upvotes - 1);

    setHasUpvoted(nextUpvoted);
    setUpvotes(nextCount);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/community/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          target_type: targetType,
          target_id: targetId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback on failure
        setHasUpvoted(previousUpvoted);
        setUpvotes(previousCount);
      } else if (data.result && typeof data.result.count === "number") {
        setUpvotes(data.result.count);
        setHasUpvoted(data.result.upvoted);
      }
    } catch (err) {
      setHasUpvoted(previousUpvoted);
      setUpvotes(previousCount);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={isSubmitting}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        hasUpvoted
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
          : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
      }`}
    >
      <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? "fill-emerald-400" : ""}`} />
      <span>{upvotes}</span>
    </button>
  );
}
