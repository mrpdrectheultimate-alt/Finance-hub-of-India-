import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Scale,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | FinanceHub",
  description: "Terms and conditions for using FinanceHub. Indian Contract Act 1872 and DPDP Act 2023 compliant.",
};

const LAST_UPDATED = "October 2026";
const EFFECTIVE_DATE = "1 October 2026";
const CONTACT_EMAIL = "legal@financehub.in";
const COMPANY_NAME = "FinanceHub Education Private Limited";
const COMPANY_ADDRESS = "India";

export default function TermsPage() {
  return (
    <article className="space-y-8">
      {/* Title & Document Meta */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full mb-3">
          <FileText className="w-3.5 h-3.5" />
          User Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Last updated: {LAST_UPDATED} · Effective: {EFFECTIVE_DATE}
        </p>
      </div>

      {/* Important Notice Banner */}
      <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-amber-950 dark:text-amber-200">
              Important Educational Notice
            </h2>
            <p className="text-sm text-amber-900/90 dark:text-amber-300 leading-relaxed">
              FinanceHub provides financial <strong>education and simulation tools only</strong>. Nothing on this platform constitutes financial, investment, tax, or legal advice. FinanceHub is NOT registered with SEBI as an investment adviser. Always consult certified professionals before making financial decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="space-y-6">
        <Section title="1. Acceptance of Terms" number="1">
          <p>
            By accessing or using FinanceHub (&quot;<strong>Platform</strong>&quot;, &quot;<strong>we</strong>&quot;, &quot;<strong>us</strong>&quot;, or &quot;<strong>our</strong>&quot;), operated by {COMPANY_NAME}, you agree to be bound by these Terms of Service (&quot;<strong>Terms</strong>&quot;).
          </p>
          <p>
            If you do not agree to these Terms, please do not use the Platform. These Terms apply to all visitors, registered members, and institutional subscribers.
          </p>
          <p>
            We reserve the right to update these Terms at any time. We will notify registered users of material changes via email or in-app notification. Continued use after revisions constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="2. Description of Service" number="2">
          <p>
            FinanceHub is an online financial literacy platform that provides:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 pt-2">
            <li>Structured lessons and courses on personal finance, stock investing, technical analysis, and corporate finance.</li>
            <li>Interactive financial calculators, compounding visualizers, and virtual paper trading simulators.</li>
            <li>AI-powered learning mentor answering conceptual questions based on curriculum benchmarks.</li>
            <li>Quizzes, diagnostic exams, and verifiable certificates of completion.</li>
            <li>Curated book summaries and educational multimedia content.</li>
          </ul>
          <p className="pt-2">
            <strong>FinanceHub is an educational platform — not a broker, investment adviser, or portfolio manager.</strong> We do not hold client funds, manage wealth, or execute live market transactions.
          </p>
        </Section>

        <Section title="3. User Accounts and Security" number="3">
          <p>
            When registering an account on FinanceHub, you agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 pt-2">
            <li>Provide accurate, current, and complete information during registration.</li>
            <li>Maintain the confidentiality of your account credentials.</li>
            <li>Accept sole responsibility for all activities that occur under your account.</li>
            <li>Immediately notify us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 dark:text-emerald-400 font-bold underline">{CONTACT_EMAIL}</a> if you detect any unauthorized access.</li>
          </ul>
          <p className="pt-2">
            Users must be at least 18 years old or possess verifiable parental consent to access paid subscriptions.
          </p>
        </Section>

        <Section title="4. Subscriptions, Payments & 7-Day Guarantee" number="4">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">4.1 Free &amp; Paid Plans</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Core educational content is available free. Pro and Expert tiers offer expanded features, higher AI limits, and diagnostic exams.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">4.2 Payment Gateways</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Payments are securely processed by Razorpay (India) and Stripe (Global). We do not store complete credit card or debit card numbers on our servers.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">4.3 7-Day Money-Back Guarantee</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                We provide a <strong>7-day full refund</strong> for first-time subscribers to Pro and Expert plans upon written request within 7 calendar days of purchase. Refer to our <Link href="/legal/refund" className="text-emerald-600 dark:text-emerald-400 font-bold underline">Refund Policy</Link> for full details.
              </p>
            </div>
          </div>
        </Section>

        <Section title="5. Educational Disclaimer & Non-Advisory Nature" number="5">
          <p className="font-semibold text-rose-700 dark:text-rose-400">
            All content on FinanceHub is provided purely for informational and educational purposes.
          </p>
          <p>
            FinanceHub does NOT provide individualized investment advice, securities analysis, buy/sell calls, tax filing advice, or legal counsel. Past market performance is not indicative of future returns. Always seek the advice of certified RIAs, CAs, and legal counsels for personal financial decisions.
          </p>
        </Section>

        <Section title="6. Artificial Intelligence Tools (AI Mentor)" number="6">
          <p>
            FinanceHub incorporates AI assistance for student queries. You acknowledge that AI responses:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 pt-2">
            <li>May occasionally contain factual errors, hallucinatory text, or outdated regulatory interpretations.</li>
            <li>Should never be relied upon as certified financial advice.</li>
            <li>Are subject to daily usage limits based on your subscription tier.</li>
            <li>Must be cross-referenced with authoritative official sources (SEBI, RBI, Income Tax Dept).</li>
          </ul>
        </Section>

        <Section title="7. Intellectual Property & Fair Use" number="7">
          <p>
            All original lessons, UI designs, code, quizzes, and multimedia authored by {COMPANY_NAME} are protected under the Indian Copyright Act 1957.
          </p>
          <p>
            Content is licensed for personal, non-commercial educational study only. You may not scrape, copy, redistribute, resell, or publicly display platform materials without prior written consent.
          </p>
        </Section>

        <Section title="8. Prohibited User Conduct" number="8">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1.5 pt-2">
            <li>Systematically scrape, mirror, or extract data from the Platform using bots or automated scripts.</li>
            <li>Attempt to bypass security features, rate limits, or subscription paywalls.</li>
            <li>Post or transmit malicious, defamatory, or unlawful content in community forums.</li>
            <li>Share quiz answer keys or compromise assessment integrity.</li>
          </ul>
        </Section>

        <Section title="9. Limitation of Liability" number="9">
          <p>
            To the maximum extent permitted by applicable Indian law, {COMPANY_NAME}, its directors, and staff shall not be liable for any direct, indirect, incidental, or consequential losses resulting from:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 pt-2">
            <li>Any investment decisions made or financial losses incurred from content on the Platform.</li>
            <li>Inaccuracies or oversights in curriculum modules or AI responses.</li>
            <li>Temporary service interruptions or technical downtime.</li>
          </ul>
          <p className="pt-2">
            Our aggregate liability for any claim shall not exceed the amount paid by you to FinanceHub in the 12 months preceding the claim.
          </p>
        </Section>

        <Section title="10. Governing Law & Dispute Resolution" number="10">
          <p>
            These Terms shall be governed by and construed under the laws of the Republic of India. Any legal dispute shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
          <p>
            Parties agree to attempt good-faith informal resolution for 30 days by emailing <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 dark:text-emerald-400 font-bold underline">{CONTACT_EMAIL}</a> before initiating statutory arbitration or litigation.
          </p>
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
