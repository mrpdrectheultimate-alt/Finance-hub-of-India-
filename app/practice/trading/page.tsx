import Link from "next/link";
import ForexPaperTrader from "@/components/trading/ForexPaperTrader";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Live Paper Trading Terminal | FinanceHub",
  description: "Real-time simulated currency paper trading with virtual capital and zero risk.",
};

export default function TradingPracticePage() {
  return (
    <main className="min-h-screen bg-[#060B14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors py-1 px-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-850 border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Finance Labs & Simulators</span>
          </Link>
        </div>
        <ForexPaperTrader />
      </div>
    </main>
  );
}
