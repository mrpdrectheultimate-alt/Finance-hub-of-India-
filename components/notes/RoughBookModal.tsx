"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  PencilSquareIcon, 
  XMarkIcon, 
  CalculatorIcon, 
  BookmarkIcon, 
  ArrowPathIcon,
  CheckIcon,
  TagIcon,
  DocumentDuplicateIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { PinIcon } from "lucide-react";

interface Note {
  id?: string;
  title: string;
  content: string;
  note_type: string;
  tags: string[];
  color: string;
  is_pinned: boolean;
  lesson_id?: string;
  lesson_title?: string;
  track_slug?: string;
  track_icon?: string;
  updated_at?: string;
}

const COLOR_CLASSES: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  yellow: { bg: "bg-amber-500/10", border: "border-amber-500/30", badge: "bg-amber-500/20 text-amber-300", text: "text-amber-200" },
  blue:   { bg: "bg-sky-500/10",   border: "border-sky-500/30",   badge: "bg-sky-500/20 text-sky-300",   text: "text-sky-200" },
  green:  { bg: "bg-emerald-500/10", border: "border-emerald-500/30", badge: "bg-emerald-500/20 text-emerald-300", text: "text-emerald-200" },
  pink:   { bg: "bg-rose-500/10",  border: "border-rose-500/30",  badge: "bg-rose-500/20 text-rose-300",  text: "text-rose-200" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", badge: "bg-purple-500/20 text-purple-300", text: "text-purple-200" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", badge: "bg-orange-500/20 text-orange-300", text: "text-orange-200" },
  white:  { bg: "bg-slate-800/40", border: "border-slate-700/60", badge: "bg-slate-700 text-slate-300", text: "text-slate-200" },
};

export default function RoughBookModal({
  isOpen,
  onClose,
  initialLessonId,
  initialLessonTitle,
  initialTrackSlug,
  initialTrackIcon,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialLessonId?: string;
  initialLessonTitle?: string;
  initialTrackSlug?: string;
  initialTrackIcon?: string;
}) {
  const [activeTab, setActiveTab] = useState<"scratchpad" | "calculator" | "saved">("scratchpad");
  const [title, setTitle] = useState(initialLessonTitle ? `Notes: ${initialLessonTitle}` : "Rough Calculation / Note");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("yellow");
  const [noteType, setNoteType] = useState(initialLessonId ? "lesson" : "general");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedNotes, setSavedNotes] = useState<Note[]>([]);
  const [mathInput, setMathInput] = useState("");
  const [mathResult, setMathResult] = useState<string | null>(null);

  // Auto-evaluate financial math expressions
  const evaluateMath = (expr: string) => {
    try {
      if (!expr.trim()) {
        setMathResult(null);
        return;
      }
      // Clean safe math expression
      let clean = expr
        .replace(/(\d+)%/g, "($1/100)")
        .replace(/lakh/gi, "*100000")
        .replace(/crore/gi, "*10000000")
        .replace(/k/gi, "*1000")
        .replace(/,/g, "")
        .replace(/x/gi, "*")
        .replace(/\^/g, "**");

      // Validate allowed math characters only
      if (!/^[0-9+\-*/().\s*^]+$/.test(clean)) {
        setMathResult("Invalid formula");
        return;
      }

      // Safe evaluation using Function
      const res = Function(`'use strict'; return (${clean})`)();
      if (typeof res === "number" && !isNaN(res)) {
        setMathResult(res.toLocaleString("en-IN", { maximumFractionDigits: 4 }));
      } else {
        setMathResult(null);
      }
    } catch {
      setMathResult("Error");
    }
  };

  const handleSaveNote = async () => {
    if (!content.trim() && !mathInput.trim()) return;
    setIsSaving(true);
    try {
      const fullContent = mathInput.trim() 
        ? `${content}\n\n**Calculation:**\n\`${mathInput} = ${mathResult}\``
        : content;

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled note",
          content: fullContent,
          note_type: noteType,
          color,
          tags,
          is_pinned: isPinned,
          lesson_id: initialLessonId,
          lesson_title: initialLessonTitle,
          track_slug: initialTrackSlug,
          track_icon: initialTrackIcon,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
        fetchSavedNotes();
      }
    } catch (err) {
      console.error("Save note error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchSavedNotes = useCallback(async () => {
    try {
      const url = initialLessonId ? `/api/notes?lesson_id=${initialLessonId}` : "/api/notes";
      const res = await fetch(url);
      const data = await res.json();
      if (data.notes) setSavedNotes(data.notes);
    } catch (e) {
      console.error(e);
    }
  }, [initialLessonId]);

  useEffect(() => {
    if (isOpen) {
      void fetchSavedNotes();
    }
  }, [isOpen, fetchSavedNotes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <PencilSquareIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                Digital Rough Book
                {initialLessonTitle && (
                  <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    {initialLessonTitle.slice(0, 24)}...
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Scratchpad, fast financial math & permanent lesson notes</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-800 bg-slate-900/50">
          <button
            onClick={() => setActiveTab("scratchpad")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === "scratchpad" 
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <PencilSquareIcon className="w-3.5 h-3.5" />
            Note Editor
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === "calculator" 
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CalculatorIcon className="w-3.5 h-3.5" />
            Quick Math
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === "saved" 
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookmarkIcon className="w-3.5 h-3.5" />
            Saved Notes ({savedNotes.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === "scratchpad" && (
            <div className="space-y-4">
              {/* Title & Color bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="w-full sm:w-2/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />

                {/* Color choices */}
                <div className="flex items-center gap-1.5">
                  {Object.keys(COLOR_CLASSES).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition ${
                        color === c ? "border-white scale-110 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                      } ${
                        c === "yellow" ? "bg-amber-400" :
                        c === "blue"   ? "bg-sky-400" :
                        c === "green"  ? "bg-emerald-400" :
                        c === "pink"   ? "bg-rose-400" :
                        c === "purple" ? "bg-purple-400" :
                        c === "orange" ? "bg-orange-400" : "bg-slate-400"
                      }`}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Note Textarea with color background */}
              <div className={`rounded-xl border p-4 transition ${COLOR_CLASSES[color].bg} ${COLOR_CLASSES[color].border}`}>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type notes, formulas, insights, or scratch thoughts in Markdown..."
                  className="w-full bg-transparent border-none resize-none text-sm text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed font-sans"
                />
              </div>

              {/* Tag and Category Settings */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-400">
                  <TagIcon className="w-3.5 h-3.5" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim()) {
                        e.preventDefault();
                        if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
                        setTagInput("");
                      }
                    }}
                    placeholder="Add tag + Enter..."
                    className="bg-transparent border-none text-xs text-white focus:outline-none w-24"
                  />
                </div>

                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-800 text-slate-300"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                      className="text-slate-400 hover:text-white ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "calculator" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <CalculatorIcon className="w-4 h-4 text-sky-400" />
                  Quick Financial Calculator
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={mathInput}
                    onChange={(e) => {
                      setMathInput(e.target.value);
                      evaluateMath(e.target.value);
                    }}
                    placeholder="e.g. 500000 * 12% or 25000 * (1.15)^5 or 5 lakh / 12"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {mathResult !== null && (
                  <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
                    <span className="text-xs text-sky-300 font-medium">Result:</span>
                    <span className="text-lg font-bold font-mono text-sky-200">
                      ₹ {mathResult}
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                  <p>💡 <b>Shortcuts:</b> Type <code>lakh</code>, <code>crore</code>, <code>k</code>, or percentages (<code>15%</code>).</p>
                  <p>📊 <b>Compounding:</b> <code>10000 * (1.12)^10</code> calculates ₹10,000 compounded at 12% over 10 years.</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (mathResult) {
                      setContent((prev) => `${prev ? prev + "\n" : ""}${mathInput} = ₹${mathResult}`);
                      setActiveTab("scratchpad");
                    }
                  }}
                  disabled={!mathResult || mathResult === "Error"}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition disabled:opacity-50"
                >
                  Insert Result into Note
                </button>
              </div>
            </div>
          )}

          {activeTab === "saved" && (
            <div className="space-y-3">
              {savedNotes.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No notes saved yet. Write something in the scratchpad and click Save!
                </div>
              ) : (
                savedNotes.map((n) => {
                  const style = COLOR_CLASSES[n.color] || COLOR_CLASSES.yellow;
                  return (
                    <div
                      key={n.id}
                      className={`p-4 rounded-xl border transition space-y-2 ${style.bg} ${style.border}`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">{n.title}</h4>
                        <span className="text-[10px] text-slate-400">
                          {n.updated_at ? new Date(n.updated_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap font-mono line-clamp-3">
                        {n.content}
                      </p>
                      {n.tags && n.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1">
                          {n.tags.map((t) => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-300">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                isPinned ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <PinIcon className="w-3.5 h-3.5" />
              {isPinned ? "Pinned" : "Pin"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={isSaving || (!content.trim() && !mathInput.trim())}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-semibold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : savedSuccess ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5" />
                  Saved!
                </>
              ) : (
                <>
                  <PlusIcon className="w-3.5 h-3.5" />
                  Save Note
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
