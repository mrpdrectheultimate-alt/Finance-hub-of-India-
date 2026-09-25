"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, BookOpen, Home } from "lucide-react";

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 animate-pulse">
        <WifiOff className="w-10 h-10 text-emerald-400" />
      </div>

      <h1 className="text-3xl font-extrabold text-white mb-2">You are Offline</h1>
      <p className="text-slate-400 max-w-md mb-8 text-sm leading-relaxed">
        It looks like your internet connection was lost. Don&apos;t worry! Your cached progress is safe. Check your connection and try again.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={handleReload}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white transition-colors shadow-lg shadow-emerald-900/30 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>

        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-300 border border-slate-700 transition-colors text-sm"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      <div className="mt-12 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 max-w-md w-full text-left">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
          <BookOpen className="w-4 h-4" />
          Offline Tip
        </div>
        <p className="text-xs text-slate-400">
          FinanceHub automatically caches previously visited lessons so you can continue reading even without internet.
        </p>
      </div>
    </div>
  );
}
