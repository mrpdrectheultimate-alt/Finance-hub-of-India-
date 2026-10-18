import type { Metadata } from "next";
import Link from "next/link";
import {
  Copyright,
  ShieldCheck,
  Video,
  BookOpen,
  Landmark,
  Scale,
  Mail,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Copyright, Sources & Fair Use Policy | FinanceHub",
  description: "Intellectual property statement, statutory fair dealing doctrine under Indian Copyright Act 1957, YouTube API terms compliance, and DMCA takedown protocol.",
};

const LAST_UPDATED = "October 2026";
const EFFECTIVE_DATE = "1 October 2026";
const GRIEVANCE_EMAIL = "grievance@financehub.in";
const COPYRIGHT_EMAIL = "copyright@financehub.in";
const COMPANY_NAME = "FinanceHub Education Private Limited";

export default function CopyrightPage() {
  return (
    <article className="space-y-8">
      {/* Title & Document Meta */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full mb-3">
          <Copyright className="w-3.5 h-3.5" />
          Intellectual Property &amp; Attribution
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Copyright, Sources &amp; Fair Use Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Indian Copyright Act (1957) · Information Technology Act (2000) · Last Updated: {LAST_UPDATED}
        </p>
      </div>

      {/* Primary IP Statement */}
      <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Scale className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
              Commitment to Intellectual Property Integrity
            </h2>
            <p className="text-sm text-emerald-900/90 dark:text-emerald-300 leading-relaxed">
              FinanceHub is dedicated to radical legal integrity. All proprietary platform code, interactive paper-trading engines, quizzes, and written lesson texts are original creations of {COMPANY_NAME}. Where external educational literature, video lectures, and statutory circulars are cited, they operate strictly within Indian statutory Fair Dealing provisions, YouTube embedding terms, and nominative fair use.
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <Section title="1. Platform Intellectual Property Ownership" number="1">
          <p>
            Except where explicitly attributed to third parties, all course curricula, pedagogical text, UI design tokens, assessment question banks, and simulator algorithms are the exclusive intellectual property of <strong>{COMPANY_NAME}</strong>, protected under the <strong>Indian Copyright Act, 1957</strong> and international conventions (Berne Convention &amp; TRIPS).
          </p>
          <p>
            Members receive a limited, personal, non-exclusive license to consume content for individual financial study. Commercial duplication, unauthorized mirroring, or automated harvesting of platform material is strictly prohibited.
          </p>
        </Section>

        <Section title="2. Educational Video Library & YouTube API Compliance" number="2">
          <div className="space-y-3">
            <p>
              FinanceHub curates high-yield video lectures authored by reputable financial educators (Khan Academy, Zerodha Varsity, CA Rachana Ranade, Asset Yogi, and others). We strictly abide by the following:
            </p>
            <ul className="list-disc pl-5 text-xs sm:text-sm space-y-1.5 pt-1">
              <li><strong>Official Iframes Only:</strong> All videos are delivered strictly via standard YouTube embedded player iframes pursuant to Sections 4.C and 5.B of the YouTube Terms of Service.</li>
              <li><strong>Zero Video Hosting:</strong> We never download, rip, re-encode, or host media files on our infrastructure. Traffic streams directly from YouTube to the student.</li>
              <li><strong>Full Creator Attribution &amp; Monetization:</strong> Channel branding, subscriber badges, and official links are displayed on every card. All advertising monetization and view counts flow unhindered to the original creators.</li>
              <li><strong>Creator Removal Protocol:</strong> Any creator wishing to unindex their public video can email <a href={`mailto:${COPYRIGHT_EMAIL}`} className="text-emerald-600 dark:text-emerald-400 font-bold underline">{COPYRIGHT_EMAIL}</a> for 24-hour unpublishing.</li>
            </ul>
          </div>
        </Section>

        <Section title="3. Book Summaries & Fair Dealing Doctrine (Section 52)" number="3">
          <p>
            Our Finance Library contains conceptual chapter summaries and critical takeaways of celebrated finance literature (such as <em>The Psychology of Money</em> and <em>The Intelligent Investor</em>).
          </p>
          <p>
            These are original editorial syntheses. Under <strong>Section 52(1)(a)(ii) of the Indian Copyright Act, 1957</strong>, fair dealing with any literary work for purposes of <strong>criticism, review, commentary, or teaching</strong> does not constitute copyright infringement. We provide verified purchase links to encourage students to purchase the complete published editions.
          </p>
        </Section>

        <Section title="4. Public Statutes & Regulatory Circulars" number="4">
          <p>
            To educate citizens on taxation, mutual fund classifications, and market architecture, FinanceHub quotes and references official public circulars issued by:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {["SEBI", "RBI", "CBDT (Income Tax)", "AMFI", "IRDAI", "PFRDA", "EPFO", "NSE / BSE"].map((auth, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                {auth}
              </div>
            ))}
          </div>
          <p className="pt-2">
            Under <strong>Section 52(1)(q) of the Indian Copyright Act 1957</strong>, the reproduction of legislative enactments, government notifications, and statutory circulars is expressly permitted in the interest of public education.
          </p>
        </Section>

        <Section title="5. Statutory Notice & Takedown Protocol" number="5">
          <p>
            In compliance with Section 79 of the Information Technology Act 2000 and the IT Rules 2021, if you believe any material on FinanceHub infringes upon your copyright, submit a formal notice to our Grievance Officer:
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 mt-2">
            <div className="text-xs font-bold text-slate-900 dark:text-white">Copyright Grievance Officer</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">FinanceHub Education Private Limited</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Email: <a href={`mailto:${GRIEVANCE_EMAIL}`} className="text-emerald-600 dark:text-emerald-400 font-bold underline">{GRIEVANCE_EMAIL}</a>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Takedown Review SLA: Within 36 hours of receipt of statutory notice.</div>
          </div>
        </Section>
      </div>
    </article>
  );
}

function Section({ title, number, children }: { title: string; number: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center flex-shrink-0">
          {number}
        </span>
        <span>{title}</span>
      </h2>
      <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}
