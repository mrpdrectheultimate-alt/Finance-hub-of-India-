import type { Metadata } from "next";
import Link from "next/link";
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  Database,
  EyeOff,
  UserCheck,
  FileText,
  Mail,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | FinanceHub",
  description: "How FinanceHub protects your personal data under India's Digital Personal Data Protection (DPDP) Act 2023.",
};

const LAST_UPDATED = "October 2026";
const CONTACT_EMAIL = "privacy@financehub.in";
const COMPANY_NAME = "FinanceHub Education Private Limited";

export default function PrivacyPage() {
  return (
    <article className="space-y-8">
      {/* Title & Document Meta */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full mb-3">
          <Lock className="w-3.5 h-3.5" />
          Data Protection &amp; Privacy Charter
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Compliant with Digital Personal Data Protection (DPDP) Act 2023 · Last Updated: {LAST_UPDATED}
        </p>
      </div>

      {/* DPDP Act 2023 Commitment Box */}
      <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
              Our Privacy Guarantee to Indian Learners
            </h2>
            <p className="text-sm text-emerald-900/90 dark:text-emerald-300 leading-relaxed">
              FinanceHub acts as a <strong>Data Fiduciary</strong> under India&apos;s DPDP Act 2023. We collect only the minimum data required to deliver educational courses, track XP streaks, and process subscriptions. <strong>We never sell, rent, or trade your personal data to ad brokers, lenders, or telemarketers.</strong>
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Zero ad tracking
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                No PAN/Aadhaar stored
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Right to erase anytime
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <Section title="1. Who We Are (Data Fiduciary)" number="1">
          <p>
            {COMPANY_NAME} (&quot;<strong>FinanceHub</strong>&quot;, &quot;<strong>we</strong>&quot;, &quot;<strong>us</strong>&quot;) operates the digital educational platform at financehub.in.
          </p>
          <p>
            Under the Digital Personal Data Protection Act 2023 (DPDP Act), we are the designated <strong>Data Fiduciary</strong> responsible for the secure collection and processing of your personal learning information.
          </p>
        </Section>

        <Section title="2. Personal Data We Collect" number="2">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2.1 Information You Provide Directly</h3>
              <ul className="list-disc pl-5 text-xs sm:text-sm space-y-1 mt-1">
                <li><strong>Account registration:</strong> Name, email address, hashed passwords.</li>
                <li><strong>Learner onboarding:</strong> Experience level (Student, Pro, Trader), goal description.</li>
                <li><strong>Billing details:</strong> Transaction references managed via Razorpay/Stripe (we do not store full card numbers).</li>
                <li><strong>Curriculum interactions:</strong> Notes saved in your digital notebook and AI mentor prompts.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2.2 Automatically Collected Telemetry</h3>
              <ul className="list-disc pl-5 text-xs sm:text-sm space-y-1 mt-1">
                <li>Course completion percentages, quiz scores, XP points, and streak timestamps.</li>
                <li>Anonymized page views and feature performance metrics via PostHog.</li>
                <li>Essential authentication session tokens stored in secure browser cookies.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" />
                Data We NEVER Collect
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                We never request or store Aadhaar numbers, PAN cards, real bank account numbers, demat account balances, or broker trading PINs.
              </p>
            </div>
          </div>
        </Section>

        <Section title="3. Purpose and Legal Grounds of Processing" number="3">
          <p>We process personal data strictly on lawful grounds recognized by the DPDP Act:</p>
          <ul className="list-disc pl-5 space-y-1.5 pt-1">
            <li><strong>Contractual Performance:</strong> To maintain your learning account, compute quiz rankings, and grant subscription access.</li>
            <li><strong>Legitimate Uses:</strong> To detect system bugs, prevent platform abuse, and enhance pedagogical modules.</li>
            <li><strong>Statutory Compliance:</strong> Retaining mandatory accounting tax invoices for 7 years under Indian company laws.</li>
          </ul>
        </Section>

        <Section title="4. Third-Party Infrastructure Processors" number="4">
          <p>
            We partner only with SOC2 / ISO27001 certified technology providers:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { name: "Supabase", role: "Encrypted database hosting with Row-Level Security (RLS)" },
              { name: "Razorpay / Stripe", role: "PCI-DSS Level 1 compliant payment processing" },
              { name: "Anthropic", role: "AI model inference for AI Mentor tutoring" },
              { name: "PostHog", role: "Self-hosted, anonymized product telemetry" },
            ].map((p, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{p.role}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="5. Your Statutory Rights Under the DPDP Act 2023" number="5">
          <p>As a Data Principal, you possess statutory rights enforceable under Indian law:</p>
          <div className="space-y-3 pt-1">
            <div>
              <strong className="text-xs font-bold text-slate-900 dark:text-white">Right to Access &amp; Summary:</strong>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Request an export of all personal data and learning records associated with your account.
              </p>
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-900 dark:text-white">Right to Correction &amp; Erasure:</strong>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Update inaccurate details or permanently delete your account from Profile Settings. All learning data is purged within 30 days.
              </p>
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-900 dark:text-white">Right to Nominate:</strong>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Designate a legal nominee to manage or close your educational account in case of death or incapacity.
              </p>
            </div>
          </div>
        </Section>

        <Section title="6. Data Security Measures" number="6">
          <p>
            FinanceHub enforces multi-layered encryption protocols:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 pt-1">
            <li>TLS 1.3 encryption across all data transmissions.</li>
            <li>AES-256 encryption at rest for database volumes.</li>
            <li>PostgreSQL Row-Level Security (RLS) guaranteeing that no user can access another member&apos;s notes or progress.</li>
            <li>Salted cryptographic hashing (bcrypt) for authentication credentials.</li>
          </ul>
        </Section>

        <Section title="7. Grievance Officer &amp; Redressal Mechanism" number="7">
          <p>
            In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines) Rules 2021 and the DPDP Act 2023, queries or complaints may be directed to our designated officer:
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 mt-2">
            <div className="text-xs font-bold text-slate-900 dark:text-white">Statutory Grievance Officer</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">FinanceHub Education Private Limited</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 dark:text-emerald-400 font-bold underline">{CONTACT_EMAIL}</a>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Response Turnaround SLA: Within 30 days of receipt.</div>
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
