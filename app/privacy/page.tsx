import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How FinanceHub collects, uses, and protects your data.",
};

const sections = [
  {
    heading: "1. What we collect",
    body: "When you sign up, we collect your name and email address. As you use the platform, we store your learning progress, XP points, streak data, quiz scores, and subscription status. We also log AI tutor conversations to enforce usage limits and improve the experience.",
  },
  {
    heading: "2. How we use your data",
    body: "Your data is used exclusively to provide the FinanceHub service: personalising your learning path, tracking your progress, awarding XP and badges, enforcing free/premium access, and sending transactional emails such as welcome emails, streak reminders, and certificate delivery. We do not sell your data. We do not share it with advertisers.",
  },
  {
    heading: "3. Third-party services",
    body: "We use the following third-party services to operate FinanceHub:\n\n- Supabase: database and authentication (supabase.com)\n- Stripe: payment processing (stripe.com)\n- Anthropic: AI tutor responses (anthropic.com)\n- Resend: transactional email delivery (resend.com)\n- Vercel: hosting and infrastructure (vercel.com)\n- PostHog: anonymous usage analytics (posthog.com)\n\nEach service has its own privacy policy. We only share the minimum data necessary for each service to function.",
  },
  {
    heading: "4. Cookies",
    body: "FinanceHub uses essential cookies for authentication, including the Supabase session token, and basic analytics, including the PostHog anonymous ID. We do not use advertising cookies or third-party tracking cookies.",
  },
  {
    heading: "5. Data retention",
    body: "Your account data is retained as long as your account is active. If you delete your account, all personal data is permanently deleted within 30 days. Anonymised usage statistics may be retained for analytics purposes.",
  },
  {
    heading: "6. Your rights",
    body: "You have the right to access, correct, or delete your personal data at any time. To exercise these rights, email us at privacy@financehub.in. For GDPR requests, we will respond within 30 days.",
  },
  {
    heading: "7. Security",
    body: "All data is encrypted in transit with HTTPS/TLS and at rest through Supabase encryption. Row-level security policies ensure users can only access their own data. Payment data is handled entirely by Stripe. We never store card numbers or payment details.",
  },
  {
    heading: "8. Children",
    body: "FinanceHub is intended for users aged 13 and above. We do not knowingly collect data from children under 13. If you believe a child under 13 has created an account, please contact us immediately.",
  },
  {
    heading: "9. Changes to this policy",
    body: "We may update this policy from time to time. We will notify you of material changes by email or by a prominent notice in the app. Continued use of FinanceHub after a policy update constitutes acceptance of the new terms.",
  },
  {
    heading: "10. Contact",
    body: "For any privacy questions or requests, contact us at:\nprivacy@financehub.in\n\nFinanceHub Education\nIndia",
  },
];

export default function PrivacyPage() {
  return (
    <div style={s.page}>
      <div style={s.inner}>
        <Link href="/" style={s.back}>Back to FinanceHub</Link>
        <h1 style={s.title}>Privacy Policy</h1>
        <p style={s.updated}>Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

        {sections.map(({ heading, body }) => (
          <div key={heading} style={s.section}>
            <h2 style={s.h2}>{heading}</h2>
            {body.split("\n\n").map((para) => (
              <p key={para} style={s.para}>{para}</p>
            ))}
          </div>
        ))}

        <div style={s.footer}>
          <Link href="/terms" style={s.footerLink}>Terms of Service</Link>
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
  updated: { fontSize: 13, color: "#aaa", margin: "0 0 40px" },
  section: { marginBottom: 32 },
  h2: { fontSize: 17, fontWeight: 600, color: "#0a0a0a", margin: "0 0 10px" },
  para: { fontSize: 14, color: "#555", lineHeight: 1.8, margin: "0 0 10px", whiteSpace: "pre-line" },
  footer: { display: "flex", gap: 20, paddingTop: 32, borderTop: "0.5px solid #eee", marginTop: 40 },
  footerLink: { fontSize: 13, color: "#1D9E75", textDecoration: "none" },
};
