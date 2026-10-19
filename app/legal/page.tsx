import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Lock,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Cookie,
  Copyright,
  ArrowRight,
  Scale,
  Building,
  CheckCircle2,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Legal & Regulatory Compliance Hub | FinanceHub",
  description: "Official legal documentation, user terms, privacy policies, SEBI non-advisory statements, and refund policies for FinanceHub of India.",
};

const POLICIES = [
  {
    title: "Terms of Service",
    href: "/legal/terms",
    icon: FileText,
    badge: "Core Agreement",
    desc: "User responsibilities, service scope, subscription billing, and Indian jurisdiction governing law.",
  },
  {
    title: "Privacy Policy",
    href: "/legal/privacy",
    icon: Lock,
    badge: "DPDP Act 2023",
    desc: "How we protect personal learning data, zero advertising tracking, and your statutory rights to erase data.",
  },
  {
    title: "SEBI Compliance Declaration",
    href: "/legal/sebi-compliance",
    icon: ShieldCheck,
    badge: "Statutory Status",
    desc: "Formal disclosure of non-advisory status under SEBI RIA/RA regulations and NCFE literacy alignment.",
  },
  {
    title: "Refund & Cancellation Policy",
    href: "/legal/refund",
    icon: RotateCcw,
    badge: "7-Day Guarantee",
    desc: "100% money-back guarantee for first-time Pro & Expert subscribers within 7 days, no questions asked.",
  },
  {
    title: "Investment & Risk Disclaimer",
    href: "/legal/disclaimer",
    icon: AlertTriangle,
    badge: "Mandatory Risk Notice",
    desc: "Critical warnings on market volatility, SEBI 89% F&O loss data, and pedagogical use of financial examples.",
  },
  {
    title: "Cookie & Telemetry Policy",
    href: "/legal/cookies",
    icon: Cookie,
    badge: "Technical Standards",
    desc: "Zero third-party tracking pixels. Essential cookies strictly for authentication and product performance.",
  },
  {
    title: "Copyright, Sources & Fair Use",
    href: "/legal/copyright",
    icon: Copyright,
    badge: "Indian Copyright Act",
    desc: "Platform IP protections, Section 52 fair dealing educational review doctrine, and YouTube API compliance.",
  },
  {
    title: "Official Contact & Support Team",
    href: "/contact",
    icon: Mail,
    badge: "24h SLA",
    desc: "Reach our Indian support desk, student helpdesk, grievance officer, and partnership team directly.",
  },
];

export default function LegalIndexPage() {
  return (
    <div className="space-y-8">
      {/* Intro Banner */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Consumer Transparency Directory
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore Our Policies &amp; Statutory Safeguards
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          Select any document below to inspect our full statutory commitments, consumer protection standards, and regulatory frameworks operating across India.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
            <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">100% Ad-Free</div>
            <div className="text-[11px] text-emerald-800/80 dark:text-emerald-400 mt-0.5">We never sell your learning data to brokers or advertisers.</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60">
            <div className="text-xs font-bold text-blue-900 dark:text-blue-300">7-Day Guarantee</div>
            <div className="text-[11px] text-blue-800/80 dark:text-blue-400 mt-0.5">Full refunds on first-time paid plans within 7 days.</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60">
            <div className="text-xs font-bold text-amber-900 dark:text-amber-300">SEBI Compliant</div>
            <div className="text-[11px] text-amber-800/80 dark:text-amber-400 mt-0.5">Strict non-advisory educational platform.</div>
          </div>
        </div>
      </div>

      {/* Policy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {POLICIES.map((p) => {
          const Icon = p.icon;
          return (
            <Link
              key={p.href}
              href={p.href}
              className="group bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {p.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Read Full Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
