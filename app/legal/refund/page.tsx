"use client";

import Link from "next/link";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Mail,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <article className="space-y-8">
      {/* Title & Document Meta */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full mb-3">
          <RotateCcw className="w-3.5 h-3.5" />
          Consumer Protection Policy
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Last reviewed: October 2026 · Compliant with Indian Consumer Protection (E-Commerce) Rules
        </p>
      </div>

      {/* 1. Plain-English Executive Summary (TL;DR) */}
      <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
              The FinanceHub 7-Day Money-Back Guarantee
            </h2>
            <p className="text-sm text-emerald-900/90 dark:text-emerald-300 leading-relaxed">
              We stand behind the quality of FinanceHub. If you subscribe to our <strong>Pro</strong> or <strong>Expert</strong> plans and feel it is not right for you, email us within <strong>7 calendar days</strong> of your first payment for a <strong>100% full refund — no questions asked</strong>.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                No hidden deductions
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Original payment method credit
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Zero hassle email processing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Eligibility Matrix */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center">
            1
          </span>
          Eligibility Criteria
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Eligible */}
          <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Eligible for Full Refund
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                First-time purchase of a paid subscription (Pro or Expert plan).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                Request is timestamped within 7 calendar days of your initial payment.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                You have not previously claimed a refund on any FinanceHub account.
              </li>
            </ul>
          </div>

          {/* Not Eligible */}
          <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
              <XCircle className="w-4 h-4" />
              Not Eligible for Refund
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                Requests made after the 7-day guarantee window has lapsed.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                Subsequent recurring monthly or annual renewals.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                Accounts suspended or terminated due to Terms of Service violations.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Refund Processing Times by Gateway */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center">
              2
            </span>
            Refund Processing Timelines
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Dispatched via Razorpay / Stripe
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          FinanceHub initiates approved refunds within <strong>2 business days</strong>. The time required for funds to reflect in your bank account depends on your banking rails:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { method: "UPI / VPA", time: "1 – 3 Business Days", note: "Direct to linked bank" },
            { method: "Razorpay Wallet", time: "1 – 2 Business Days", note: "Instant wallet credit" },
            { method: "Net Banking", time: "3 – 5 Business Days", note: "Varies by bank NEFT/RTGS" },
            { method: "Credit / Debit Card", time: "5 – 7 Business Days", note: "Card issuer billing cycle" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-1"
            >
              <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <div className="text-xs font-bold text-slate-900 dark:text-white">{item.method}</div>
              <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">{item.time}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. How to Request a Refund */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center">
            3
          </span>
          How to Request Your Refund
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Email Support</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Send an email from your registered FinanceHub account to{" "}
                <a href="mailto:support@financehub.in?subject=Refund%20Request" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  support@financehub.in
                </a>{" "}
                with the subject line: <code>Refund Request — [Your Name]</code>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Provide Transaction Details</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Include your Payment Transaction ID (found in your confirmation email or bank statement) and the date of payment.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Confirmation &amp; Payout</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Our team verifies the 7-day window and initiates the refund through Razorpay/Stripe. You will receive an automated credit receipt.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Cancellation vs Refund Clarification */}
      <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-3xl p-6 sm:p-8 space-y-3">
        <h2 className="text-base font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          Important: Cancellation vs. Refund
        </h2>
        <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
          Cancelling your subscription simply prevents future automatic billing renewals. Your access continues until the end of your current paid billing period. <strong>Cancelling does not automatically trigger a refund</strong>. If you are within your first 7 days and wish to receive your money back, please email support following the instructions above.
        </p>
        <div className="pt-2">
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 underline hover:no-underline"
          >
            Manage Your Subscription in Settings →
          </Link>
        </div>
      </div>

      {/* 6. Contact & Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="space-y-0.5 text-center sm:text-left">
          <div className="text-xs font-bold text-slate-900 dark:text-white">Have a billing question?</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Our customer success team responds within 2 business days.</div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="mailto:support@financehub.in?subject=Refund%20Inquiry"
            className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Mail className="w-3.5 h-3.5" />
            Email Support
          </a>
          <Link
            href="/legal/terms"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </article>
  );
}
