"use client";

import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";

interface AnswerFormProps {
  questionId: string;
  userId?: string;
  onAnswerAdded: () => void;
}

export default function AnswerForm({ questionId, userId, onAnswerAdded }: AnswerFormProps) {
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userId) {
      setErrorMsg("You must be signed in to submit an answer.");
      return;
    }

    if (!answerText || answerText.trim().length < 10) {
      setErrorMsg("Answer must be at least 10 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/community/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          answer: answerText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit answer");
      }

      setAnswerText("");
      onAnswerAdded();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-200">Your Answer</h4>
        <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> +25 XP
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {errorMsg}
        </div>
      )}

      <textarea
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
        placeholder="Provide a clear, detailed answer to help fellow learners..."
        rows={4}
        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          {isSubmitting ? "Submitting..." : "Post Answer"}
        </button>
      </div>
    </form>
  );
}
