import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Scale,
  ExternalLink,
  BookOpen,
  Info,
  CheckCircle2,
  FileCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "SEBI Regulatory Compliance & Non-Advisory Declaration | FinanceHub",
  description: "Formal SEBI compliance statement, educational operating framework, and RIA non-registration disclosure for FinanceHub of India.",
};

export default function SebiCompliancePage() {
  return (
    <article className="space-y-8">
      {/* Title & Document Meta */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Statutory Regulatory Declaration
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          SEBI Compliance Declaration
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Securities and Exchange Board of India (SEBI) Non-Advisory Operational Disclosure · Last Updated: October 2026
        </p>
      </div>

      {/* Official Executive Declaration */}
      <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Scale className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
              Formal Non-Advisory Operating Statement
            </h2>
            <p className="text-sm text-emerald-900/90 dark:text-emerald-300 leading-relaxed">
              FinanceHub (operated by <strong>FinanceHub Education Private Limited</strong>) is an independent financial technology and investor literacy platform. 
              <strong> FinanceHub is NOT registered with the Securities and Exchange Board of India (SEBI) as an Investment Adviser (RIA), Research Analyst (RA), Portfolio Manager (PMS), or Stock Broker.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 1. Educational Scope & Boundary */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center">
            1
          </span>
          Scope of Operations: Investor Education Only
        </h2>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          FinanceHub operates strictly within the educational and investor awareness guidelines established by SEBI and the National Centre for Financial Education (NCFE). 
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              What FinanceHub Provides
            </div>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <li>• Structured educational modules on personal budgeting, taxation, and markets.</li>
              <li>• Conceptual mathematical financial calculators (SIP, CAGR, EMI, Retirement).</li>
              <li>• Risk-free paper trading simulators using delayed or hypothetical market data.</li>
              <li>• AI-assisted study mentors answering conceptual curriculum questions.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 space-y-2">
            <div className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              What FinanceHub NEVER Does
            </div>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <li>• Never provides personalized investment recommendations or stock tips.</li>
              <li>• Never recommends buying, selling, or shorting specific equities or contracts.</li>
              <li>• Never manages user funds, executes live orders, or collects advisory fees.</li>
              <li>• Never guarantees financial returns or capital preservation.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Recommendation to Consult SEBI Registered Intermediaries */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center">
            2
          </span>
          Consulting Certified SEBI Intermediaries
        </h2>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          For any individualized investment advice, financial planning, portfolio restructuring, or tax filing, you should consult a licensed professional registered with the appropriate statutory authority:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white">SEBI Registered RIA</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">For fee-only personalized investment and asset allocation advice.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white">Chartered Accountant (CA)</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">For individual income tax computation, audit, and filing.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white">AMFI Registered MFD</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">For mutual fund scheme execution and distributor services.</p>
          </div>
        </div>

        <div className="pt-2">
          <a
            href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            Verify SEBI Registered Investment Advisers on sebi.gov.in
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 3. Warning on Unregistered Financial Influencers & Tipsters */}
      <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-3xl p-6 sm:p-8 space-y-3">
        <h2 className="text-base font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          SEBI Advisory on Unregistered Financial Tipsters
        </h2>
        <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
          SEBI cautions investors against dealing with unregistered entities, Telegram channels, WhatsApp groups, or social media handles promising guaranteed returns or algorithmic profits. FinanceHub will never solicit money for stock tips, intraday signals, or managed accounts. Report any impersonator immediately to{" "}
          <a href="mailto:security@financehub.in" className="font-bold underline">security@financehub.in</a>.
        </p>
      </div>

      {/* 4. Investor Grievance Mechanism (SEBI SCORES) */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center">
            3
          </span>
          Statutory Investor Grievance Redressal
        </h2>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          For complaints regarding financial market intermediaries, investors can lodge grievances directly on SEBI&apos;s centralized portal <strong>SCORES (SEBI Complaints Redress System)</strong>:
        </p>

        <div className="flex flex-wrap gap-4 pt-1">
          <a
            href="https://scores.sebi.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-sm"
          >
            Access SEBI SCORES Portal
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://smartodr.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-all"
          >
            SMART ODR (Online Dispute Resolution)
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
