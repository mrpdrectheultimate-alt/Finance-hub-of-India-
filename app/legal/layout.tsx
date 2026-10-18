"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ShieldCheck,
  FileText,
  Lock,
  RotateCcw,
  AlertTriangle,
  Cookie,
  Copyright,
  ArrowLeft,
  Printer,
  Share2,
  Check,
  Building,
  Mail,
  Scale,
  ExternalLink,
} from "lucide-react";

const LEGAL_TABS = [
  {
    href: "/legal/terms",
    label: "Terms of Service",
    shortLabel: "Terms",
    icon: FileText,
    badge: "Core Agreement",
  },
  {
    href: "/legal/privacy",
    label: "Privacy Policy",
    shortLabel: "Privacy",
    icon: Lock,
    badge: "DPDP Act 2023",
  },
  {
    href: "/legal/sebi-compliance",
    label: "SEBI Compliance",
    shortLabel: "SEBI Status",
    icon: ShieldCheck,
    badge: "Non-Advisory",
  },
  {
    href: "/legal/refund",
    label: "Refund Policy",
    shortLabel: "Refunds",
    icon: RotateCcw,
    badge: "7-Day Guarantee",
  },
  {
    href: "/legal/disclaimer",
    label: "Investment Disclaimer",
    shortLabel: "Disclaimer",
    icon: AlertTriangle,
    badge: "Risk Notice",
  },
  {
    href: "/legal/cookies",
    label: "Cookie Policy",
    shortLabel: "Cookies",
    icon: Cookie,
    badge: "Telemetry",
  },
  {
    href: "/legal/copyright",
    label: "Copyright & IP",
    shortLabel: "Copyright",
    icon: Copyright,
    badge: "Fair Dealing",
  },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E17] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Compliance Bar */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#0D121F]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to FinanceHub</span>
            <span className="sm:hidden">Home</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Compliance Hub
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Copy current document URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Print document or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D121F] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Scale className="w-3.5 h-3.5" />
              Statutory Transparency &amp; Consumer Trust
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              FinanceHub Education Private Limited
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Legal &amp; Regulatory Compliance Center
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            FinanceHub is an investor education and financial technology platform. Review our operating terms, strict SEBI non-advisory compliance, DPDP Act 2023 consumer privacy safeguards, and 7-day money-back guarantee.
          </p>

          {/* Compliance framework tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              "SEBI Educational Framework",
              "Digital Personal Data Protection (DPDP) Act 2023",
              "Indian Contract Act 1872",
              "Information Technology Act 2000",
              "Consumer Protection (E-Commerce) Rules",
            ].map((rule, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80"
              >
                {rule}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Document Switcher Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-[#080C14] sticky top-14 z-30 overflow-x-auto scrollbar-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-2 min-w-max" aria-label="Legal Tabs">
            {LEGAL_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white dark:bg-[#1E293B] text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700 ring-1 ring-emerald-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                      isActive
                        ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Document Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>

      {/* Statutory Redressal & Grievance Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D121F] py-10 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Building className="w-4 h-4 text-emerald-600" />
              Registered Entity
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              FinanceHub Education Private Limited<br />
              Corporate Identity / Operating in India<br />
              Digital Educational Services Platform
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Mail className="w-4 h-4 text-emerald-600" />
              Statutory Grievance Officer
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Email: <a href="mailto:grievance@financehub.in" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">grievance@financehub.in</a><br />
              Official Turnaround SLA: Within 30 days under IT Rules 2021 &amp; DPDP Act 2023.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              SEBI Investor Notice
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              FinanceHub is not a SEBI registered investment adviser. Educational simulations do not predict actual trading returns. Invest with certified RIAs.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} FinanceHub Education Private Limited. All statutory rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="https://www.sebi.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 flex items-center gap-1">
              SEBI Portal <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://www.ncfe.org.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 flex items-center gap-1">
              NCFE India <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
