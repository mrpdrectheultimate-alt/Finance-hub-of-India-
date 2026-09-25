"use client";

import React, { useState } from "react";
import { Save, Eye, Edit3, Check, RefreshCw, FileText } from "lucide-react";

export default function CMSEditor() {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [title, setTitle] = useState("Understanding Tax Deductions under Section 80C");
  const [slug, setSlug] = useState("understanding-80c-tax-deductions");
  const [contentMdx, setContentMdx] = useState(
    `# Understanding Section 80C Tax Deductions\n\nSection 80C of the Income Tax Act allows Indian taxpayers to claim deductions up to ₹1,50,000 per financial year.\n\n## Eligible Investments\n- **ELSS Mutual Funds**: 3-year lock-in\n- **EPF & PPF**: Long-term risk-free compounding\n- **NPS**: Additional ₹50,000 under 80CCD(1B)`
  );
  const [draftStatus, setDraftStatus] = useState<"draft" | "review" | "approved">("draft");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // Simulate save draft
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Lesson CMS Draft Editor</h3>
            <p className="text-xs text-slate-400">Draft, review, and publish lesson content live</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "edit" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Write
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "preview" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white shadow-md shadow-emerald-950/40 transition-colors disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" /> Saved!
              </>
            ) : isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Draft
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
          <select
            value={draftStatus}
            onChange={(e) => setDraftStatus(e.target.value as any)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="draft">🟡 Draft</option>
            <option value="review">🔵 Ready for Review</option>
            <option value="approved">🟢 Approved & Published</option>
          </select>
        </div>
      </div>

      {/* Write or Preview */}
      {activeTab === "edit" ? (
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Markdown Content</label>
          <textarea
            value={contentMdx}
            onChange={(e) => setContentMdx(e.target.value)}
            rows={12}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-4 text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
          />
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 min-h-[300px] prose prose-invert max-w-none text-slate-200">
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <div className="text-xs text-slate-400 font-mono mb-4">slug: /{slug}</div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{contentMdx}</div>
        </div>
      )}
    </div>
  );
}
