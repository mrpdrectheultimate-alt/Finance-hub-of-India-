import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using FinanceHub.",
};

const sections = [
  {
    heading: "1. Acceptance of terms",
    body: "By creating an account or using FinanceHub, you agree to these Terms of Service. If you do not agree, do not use the platform. We may update these terms from time to time. Continued use constitutes acceptance.",
  },
  {
    heading: "2. Educational content disclaimer",
    body: "ALL CONTENT ON FINANCEHUB IS FOR EDUCATIONAL PURPOSES ONLY.\n\nNothing on this platform constitutes financial advice, investment advice, trading advice, tax advice, legal advice, or any other professional advice. The content is general in nature and may not be suitable for your specific situation.\n\nFinanceHub is not a SEBI-registered investment advisor. We are not a bank, broker, or financial institution. Past performance of any investment discussed does not guarantee future results.\n\nAlways consult a qualified, certified financial advisor, CA, or legal professional before making any financial decision.",
  },
  {
    heading: "3. AI tutor disclaimer",
    body: "The AI tutor feature is powered by large language models. AI responses:\n\n- May contain errors or outdated information\n- Should never be treated as financial advice\n- Are not reviewed by certified financial professionals in real time\n- May not reflect current market conditions, tax laws, or regulations\n\nEvery AI response includes a disclaimer. Users must independently verify any information before acting on it.",
  },
  {
    heading: "4. Account responsibilities",
    body: "You are responsible for:\n\n- Maintaining the confidentiality of your account credentials\n- All activity that occurs under your account\n- Providing accurate information during registration\n- Being at least 13 years of age\n\nYou must not share your account with others, use the platform for any illegal purpose, attempt to reverse-engineer or scrape the platform, or upload any harmful, misleading, or infringing content.",
  },
  {
    heading: "5. Subscriptions and payments",
    body: "Free tier: Core content is available at no cost with no credit card required.\n\nPaid subscriptions: Pro and Expert plans are billed monthly or annually via Stripe. Your subscription renews automatically until cancelled.\n\nCancellation: You may cancel at any time from your account settings. Access continues until the end of the current billing period. No partial refunds for unused time unless requested within 7 days of payment.\n\nRefunds: We offer a 7-day money-back guarantee on first-time subscriptions. Contact hello@financehub.in within 7 days of payment.",
  },
  {
    heading: "6. Intellectual property",
    body: "All content on FinanceHub, including lesson text, quizzes, illustrations, design, and code, is owned by FinanceHub and protected by copyright.\n\nYou may use the content for personal learning only. You may not copy, redistribute, resell, or republish any content without written permission.",
  },
  {
    heading: "7. Limitation of liability",
    body: "To the maximum extent permitted by law, FinanceHub is not liable for:\n\n- Any financial losses resulting from acting on platform content\n- Errors or inaccuracies in educational content\n- Downtime or interruption of the service\n- Loss of data\n- Any indirect, consequential, or punitive damages\n\nOur total liability to you for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.",
  },
  {
    heading: "8. Termination",
    body: "We reserve the right to suspend or terminate your account if you violate these terms, engage in fraudulent activity, or misuse the platform. You may delete your account at any time from your profile settings.",
  },
  {
    heading: "9. Governing law",
    body: "These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in India.",
  },
  {
    heading: "10. Contact",
    body: "For any questions about these terms:\nhello@financehub.in\n\nFinanceHub Education, India",
  },
];

export default function TermsPage() {
  return (
    <div style={s.page}>
      <div style={s.inner}>
        <Link href="/" style={s.back}>Back to FinanceHub</Link>
        <h1 style={s.title}>Terms of Service</h1>
        <p style={s.updated}>Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div style={s.disclaimer}>
          <strong>Important:</strong> All content on FinanceHub is for educational purposes only and does not constitute financial, investment, legal, or tax advice. Always consult a certified financial advisor before making financial decisions.
        </div>

        {sections.map(({ heading, body }) => (
          <div key={heading} style={s.section}>
            <h2 style={s.h2}>{heading}</h2>
            {body.split("\n\n").map((para) => (
              <p key={para} style={s.para}>{para}</p>
            ))}
          </div>
        ))}

        <div style={s.footer}>
          <Link href="/privacy" style={s.footerLink}>Privacy Policy</Link>
          <Link href="/" style={s.footerLink}>Back to FinanceHub</Link>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui,-apple-system,sans-serif", padding: "40px 24px 80px" },
  inner: { maxWidth: 680, margin: "0 auto" },
  back: { fontSize: 13, color: "#888", textDecoration: "none", display: "block", marginBottom: 28 },
  title: { fontSize: 30, fontWeight: 700, letterSpacing: "-0.6px", color: "#0a0a0a", margin: "0 0 6px" },
  updated: { fontSize: 13, color: "#aaa", margin: "0 0 24px" },
  disclaimer: { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 10, padding: "14px 18px", fontSize: 14, color: "#B91C1C", lineHeight: 1.6, marginBottom: 32 },
  section: { marginBottom: 32 },
  h2: { fontSize: 17, fontWeight: 600, color: "#0a0a0a", margin: "0 0 10px" },
  para: { fontSize: 14, color: "#555", lineHeight: 1.8, margin: "0 0 10px", whiteSpace: "pre-line" },
  footer: { display: "flex", gap: 20, paddingTop: 32, borderTop: "0.5px solid #eee", marginTop: 40 },
  footerLink: { fontSize: 13, color: "#1D9E75", textDecoration: "none" },
};
