"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, FileText, CheckCircle2, AlertCircle, Flag, ArrowLeft } from "lucide-react";
import CMSEditor from "@/components/admin/CMSEditor";
import ReportResolver from "@/components/admin/ReportResolver";

export default function AdminCMSDashboard() {
  const [activeTab, setActiveTab] = useState<"cms" | "reports">("cms");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-8">
        {/* Back Link */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Control Panel
        </Link>

        {/* Dashboard Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <LayoutDashboard className="w-4 h-4" />
              Phase 5 CMS & Moderation Engine
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Admin Content Management</h1>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("cms")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "cms"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" /> Content Drafts
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "reports"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Flag className="w-4 h-4" /> Content Reports
            </button>
          </div>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <FileText className="w-4 h-4 text-emerald-400" /> Total Lessons
            </div>
            <div className="text-2xl font-black text-white">48</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Case Studies
            </div>
            <div className="text-2xl font-black text-white">12</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <AlertCircle className="w-4 h-4 text-amber-400" /> Pending Review
            </div>
            <div className="text-2xl font-black text-amber-400">3</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Flag className="w-4 h-4 text-rose-400" /> Flagged Reports
            </div>
            <div className="text-2xl font-black text-rose-400">1</div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "cms" ? <CMSEditor /> : <ReportResolver />}
      </div>
    </div>
  );
}
