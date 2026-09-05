"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import RoughBook from "@/components/notes/RoughBook";

export default function DigitalNotesPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>📕</span> Digital Rough Book
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Take study notes, organize by lesson, tag key formulas, and download for offline review.
            </p>
          </div>
        </div>

        {/* Embedded Full Feature Rough Book Studio */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <RoughBook mode="page" />
        </div>
      </div>
    </AppLayout>
  );
}
