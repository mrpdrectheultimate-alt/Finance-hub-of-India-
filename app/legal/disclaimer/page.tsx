import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  TrendingDown,
  BrainCircuit,
  Coins,
  Receipt,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Investment & Financial Risk Disclaimer | FinanceHub",
  description: "Comprehensive risk disclosures, SEBI F&O trading statistics, past performance disclaimers, and AI tool limitations for FinanceHub.",
};

const DISCLAIMERS = [
  {
    title: "1. Educational and Informational Content Only",
    icon: HelpCircle,
    content: `All materials, lessons, video summaries, interactive calculators, case studies, quizzes, and AI responses published on FinanceHub are provided purely for educational and informational purposes. 

Nothing on this platform constitutes a recommendation, endorsement, solicitation, or offer to buy, sell, or hold any security, derivative contract, mutual fund scheme, cryptocurrency, or financial instrument. 

Specific stocks (such as Reliance, TCS, HDFC Bank) or mutual fund categories cited in coursework are used strictly as pedagogical examples to demonstrate accounting principles, valuation ratios, or asset allocation frameworks.`,
  },
  {
    title: "2. Past Performance Does Not Guarantee Future Results",
    icon: TrendingDown,
    content: `Historical market returns, backtested data, and compounding simulations illustrated in our coursework do not predict future financial outcomes. 

Equities, debt instruments, commodities, and derivatives are subject to market volatility. The value of investments can fluctuate, and investors may lose a portion or the entirety of their invested principal. Compounding models (such as 12% equity growth) are illustrative theoretical mathematical calculations and not guaranteed returns.`,
  },
  {
    title: "3. SEBI Risk Disclosure on Derivatives (Futures & Options)",
    icon: ShieldAlert,
    content: `Trading in derivatives (Futures and Options) involves substantial risk of loss and is not suitable for all investors. 

According to SEBI's official study published in January 2023:
• 9 out of 10 individual traders in the equity Futures & Options segment incurred net losses.
• On average, active loss-making traders incurred an average net trading loss of ₹50,000.
• Loss-makers expended an additional 28% of net trading losses in transaction costs.

FinanceHub's trading modules and simulators are designed to demonstrate the mathematical risk and asymmetric loss profiles of leveraged instruments so learners avoid catastrophic losses.`,
  },
  {
    title: "4. Artificial Intelligence (AI Mentor & Tutor) Limitations",
    icon: BrainCircuit,
    content: `The AI Mentor, AI Exam Generator, and AI Roadmap Planner features utilize large language models. While trained on comprehensive financial curriculum standards:
• AI responses may occasionally generate factual inaccuracies, hallucinatory data, or outdated regulatory interpretations.
• AI responses must NEVER be treated as certified financial, tax, or legal counsel.
• AI outputs are not vetted in real-time by certified financial analysts.
• Always independently cross-reference critical data with official statutory sources (RBI, SEBI, Income Tax Department, AMFI).`,
  },
  {
    title: "5. Taxation Information & Budgetary Amendments",
    icon: Receipt,
    content: `Tax-related educational content reflects general principles of the Indian Income Tax Act 1961 (including the Old vs. New Tax Regimes under Section 115BAC). 

Tax provisions, slabs, exemptions, and capital gains rules change frequently via Union Budgets and CBDT circulars. Individual tax liability depends on your unique financial profile, residential status, and deductions. Always consult a certified Chartered Accountant (CA) before filing taxes or restructuring income.`,
  },
  {
    title: "6. Virtual Paper Trading Simulators",
    icon: Coins,
    content: `The paper trading simulators on FinanceHub allow users to practice trading strategies using virtual capital (₹1,00,000 demo funds). 

Virtual trading does not reproduce the emotional stress, slippage, order queue priority, liquidity vacuums, or margin call risks of real-money market execution. Success in simulated trading does not guarantee profitability in live broker accounts.`,
  },
  {
    title: "7. Virtual Digital Assets (Cryptocurrency)",
    icon: Coins,
    content: `Cryptocurrencies and Virtual Digital Assets (VDAs) are unregulated, highly speculative, and subject to extreme price volatility in India. 

Under the Finance Act 2022, transfer of VDAs is taxed at a flat 30% rate (plus surcharge and cess) with no set-off against other income, and a 1% TDS applies under Section 194S. Never commit capital to digital assets that you cannot afford to lose entirely.`,
  },
];

export default function DisclaimerPage() {
  return (
    <article className="space-y-8">
      {/* Title & Document Meta */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full mb-3">
          <AlertTriangle className="w-3.5 h-3.5" />
          Mandatory Risk Disclosures
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Investment &amp; Financial Disclaimer
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Statutory Risk Warnings · General Educational Scope · Last Updated: October 2026
        </p>
      </div>

      {/* Critical Highlight Alert Banner */}
      <div className="bg-rose-50/90 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-rose-950 dark:text-rose-200">
              Critical Investor Risk Warning
            </h2>
            <p className="text-sm text-rose-900/90 dark:text-rose-300 leading-relaxed">
              Securities markets are subject to high volatility and capital risk. FinanceHub provides <strong>financial education only</strong> and is not a SEBI-registered advisory entity. Never invest money based solely on educational lessons or simulated models. Always consult a certified professional (SEBI RIA / CA) for personal financial decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Risk Disclosures */}
      <div className="space-y-6">
        {DISCLAIMERS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>{item.title}</span>
              </h2>
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {item.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Regulatory Link Bar */}
      <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          Want to learn more about our statutory stance? Read our full SEBI Non-Advisory Declaration.
        </div>
        <Link
          href="/legal/sebi-compliance"
          className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl transition-all shadow-sm flex-shrink-0"
        >
          View SEBI Compliance
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
