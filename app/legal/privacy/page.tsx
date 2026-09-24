// ============================================================
// FinanceHub — Privacy Policy
// app/legal/privacy/page.tsx
// India DPDP Act 2023 Compliant · Last updated Sept 2026
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:       "Privacy Policy — FinanceHub",
  description: "FinanceHub's Data Privacy Policy under India's Digital Personal Data Protection Act (DPDP) 2023.",
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{
      maxWidth:   820,
      margin:     "0 auto",
      padding:    "40px 24px 80px",
      fontFamily: "var(--font-reading, Georgia, serif)",
      color:      "var(--text-primary, #1c2b3a)",
      lineHeight: 1.8,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: "2px solid #e2e8f0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#0E6163", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-ui,system-ui)" }}>
          Legal & Compliance
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 10px", fontFamily: "var(--font-ui,system-ui)" }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: "#718096", margin: 0, fontFamily: "var(--font-ui,system-ui)" }}>
          Compliant with India&apos;s Digital Personal Data Protection (DPDP) Act 2023 · Effective Oct 2026
        </p>
      </div>

      <div style={{ background: "#EBF8FF", border: "1px solid #BEE3F8", borderRadius: 10, padding: "14px 18px", marginBottom: 32, fontSize: 14, color: "#2B6CB0", fontFamily: "var(--font-ui,system-ui)" }}>
        🔒 <strong>Data Protection Guarantee:</strong> Your personal data is encrypted in transit and at rest. We never sell your personal or financial inputs to third-party brokers or advertisers.
      </div>

      <Section title="1. Information We Collect">
        <p>Under DPDP Act 2023 principles, we collect only minimal personal data required to deliver educational services:</p>
        <ul>
          <li><strong>Account Data:</strong> Name, email address, password hash, and optional profile image.</li>
          <li><strong>Learning Data:</strong> Course progress, quiz scores, concept mastery data, and AI Mentor interaction logs.</li>
          <li><strong>Simulator Inputs:</strong> Financial parameters entered into calculators (stored locally or in encrypted user snapshots).</li>
          <li><strong>Payment Information:</strong> Billing status handled securely by Razorpay or Stripe (we store zero credit card numbers).</li>
        </ul>
      </Section>

      <Section title="2. Purpose of Data Processing">
        <p>We process your data strictly for legitimate educational purposes:</p>
        <ul>
          <li>To personalize your financial learning track and spaced-repetition review cards.</li>
          <li>To enforce daily question rate limits on AI Mentor.</li>
          <li>To issue verifiable learning completion certificates.</li>
        </ul>
      </Section>

      <Section title="3. Your Rights Under DPDP Act 2023">
        <p>As a Data Principal in India, you hold explicit rights regarding your personal data:</p>
        <ul>
          <li><strong>Right to Access:</strong> Request a summary of personal data being processed.</li>
          <li><strong>Right to Correction & Erasure:</strong> Correct inaccurate data or request complete account deletion.</li>
          <li><strong>Right to Grievance Redressal:</strong> Contact our designated Data Protection Officer at <code>dpo@financehub.in</code>.</li>
        </ul>
      </Section>

      <Section title="4. Data Retention & Security">
        <p>
          We retain active account data only for as long as your account remains active. Account deletion requests are executed within 30 days across all database backups. All data transmissions use TLS 1.3 encryption.
        </p>
      </Section>

      {/* Footer Nav */}
      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e2e8f0", display: "flex", gap: 20, fontSize: 13, fontFamily: "var(--font-ui,system-ui)" }}>
        <Link href="/legal/terms" style={{ color: "#0E6163", textDecoration: "none" }}>Terms of Service</Link>
        <Link href="/legal/disclaimer" style={{ color: "#0E6163", textDecoration: "none" }}>Disclaimer Hub</Link>
        <Link href="/legal/sebi-compliance" style={{ color: "#0E6163", textDecoration: "none" }}>SEBI Compliance</Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1c2b3a", marginBottom: 14, fontFamily: "var(--font-ui,system-ui)" }}>{title}</h2>
      <div style={{ fontSize: 15, color: "#2d3748", lineHeight: 1.85 }}>{children}</div>
    </section>
  );
}
