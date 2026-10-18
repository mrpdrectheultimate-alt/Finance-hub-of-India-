import type { Metadata } from "next";
import {
  Cookie,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sliders,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie & Telemetry Policy | FinanceHub",
  description: "Learn how FinanceHub uses essential and analytical cookies to safeguard your learning experience without tracking ads.",
};

export default function CookiePolicyPage() {
  return (
    <article className="space-y-8">
      {/* Title & Document Meta */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full mb-3">
          <Cookie className="w-3.5 h-3.5" />
          Technical Telemetry Standards
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Cookie &amp; Storage Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Transparent Telemetry &amp; LocalStorage Usage · Last Updated: October 2026
        </p>
      </div>

      {/* Zero Ad Tracking Commitment */}
      <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
              Zero Third-Party Advertising Cookies
            </h2>
            <p className="text-sm text-emerald-900/90 dark:text-emerald-300 leading-relaxed">
              FinanceHub is an ad-free educational environment. We <strong>never allow third-party marketing trackers, retargeting pixels (such as Meta Pixel or Google Ads), or behavioral profiling beacons</strong> on our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Cookie Classification Matrix */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center">
            1
          </span>
          Types of Cookies &amp; Storage We Use
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Essential Auth</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Always Active
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Maintains your Supabase session token so you stay logged in securely as you navigate lessons.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Local Preferences</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                Functional
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Stores theme mode (dark/light), simulated paper trading balances, and offline learning cache.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Anonymized Telemetry</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                Performance
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              PostHog analytics to identify slow loading pages, broken simulator charts, and high-dropoff quizzes.
            </p>
          </div>
        </div>
      </div>

      {/* Browser Controls */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center">
            2
          </span>
          Managing Your Cookie Settings
        </h2>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          You can restrict or block cookies through your browser settings (Chrome, Safari, Firefox, Edge). 
          Please note that disabling essential cookies will prevent you from authenticating into your FinanceHub account and tracking course progress.
        </p>
      </div>
    </article>
  );
}
