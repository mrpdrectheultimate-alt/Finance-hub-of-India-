import Link from "next/link";
import ForexPaperTrader from "@/components/trading/ForexPaperTrader";
import { ArrowLeft, Shield, Globe, Award, Sparkles } from "lucide-react";

export const metadata = {
  title: "Forex Paper Trading Terminal | FinanceHub",
  description:
    "Practice global currency trading in real-time with ₹1,00,000 in virtual capital. Zero financial risk.",
};

export default function ForexPracticePage() {
  return (
    <main className="min-h-screen bg-[#060B14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Context Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors py-1 px-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-850 border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Finance Labs & Simulators</span>
          </Link>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Shield className="w-3.5 h-3.5" />
              100% Risk-Free Simulation
            </span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Globe className="w-3.5 h-3.5" />
              6 Global Currency Pairs
            </span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="flex items-center gap-1.5 text-teal-400">
              <Sparkles className="w-3.5 h-3.5" />
              Virtual ₹1,00,000 Included
            </span>
          </div>
        </div>

        {/* The World-Class Forex Terminal */}
        <ForexPaperTrader />

        {/* Educational Guide Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs text-slate-400">
          <div className="p-4 rounded-2xl bg-[#09101C] border border-slate-800/80 space-y-1.5">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <span>📈</span> What is a Pip?
            </h4>
            <p className="leading-relaxed text-slate-400">
              A <strong>Percentage in Point (pip)</strong> is the smallest price change in currency quotes, typically 0.0001 for pairs like EUR/USD or 0.01 for USD/JPY.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#09101C] border border-slate-800/80 space-y-1.5">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <span>⚡</span> Leverage & Margin
            </h4>
            <p className="leading-relaxed text-slate-400">
              Leverage lets you control larger positions with smaller capital. 10x leverage means ₹10,000 margin controls ₹1,00,000 worth of currency exposure.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#09101C] border border-slate-800/80 space-y-1.5">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <span>🛡️</span> Risk Management
            </h4>
            <p className="leading-relaxed text-slate-400">
              Always set Stop Loss orders before entering volatile markets to cap maximum potential downside on unexpected macroeconomic announcements.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
