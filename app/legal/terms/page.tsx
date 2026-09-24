// ============================================================
// FinanceHub — Terms of Service
// app/legal/terms/page.tsx
// India-specific · DPDP Act 2023 aware · Last updated Sept 2026
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title:       "Terms of Service — FinanceHub",
  description: "FinanceHub's Terms of Service. Please read before using the platform.",
};

const LAST_UPDATED  = "September 2026";
const EFFECTIVE_DATE = "1 October 2026";
const CONTACT_EMAIL  = "legal@financehub.in";
const COMPANY_NAME   = "FinanceHub Education Private Limited";
const COMPANY_ADDRESS = "India";

export default function TermsPage() {
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
          Legal
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 10px", fontFamily: "var(--font-ui,system-ui)" }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 14, color: "#718096", margin: 0, fontFamily: "var(--font-ui,system-ui)" }}>
          Last updated: {LAST_UPDATED} · Effective: {EFFECTIVE_DATE}
        </p>
      </div>

      {/* Important notice */}
      <div style={{
        background:   "#FFFBEB",
        border:       "1px solid #FBD38D",
        borderRadius: 10,
        padding:      "14px 18px",
        marginBottom: 32,
        fontSize:     14,
        color:        "#744210",
        lineHeight:   1.7,
        fontFamily:   "var(--font-ui,system-ui)",
      }}>
        <strong>Important:</strong> FinanceHub provides financial <em>education</em> only.
        Nothing on this platform constitutes financial advice, investment advice, tax advice,
        or legal advice. Always consult qualified professionals before making financial decisions.
      </div>

      <LegalSection title="1. Acceptance of Terms">
        <p>
          By accessing or using FinanceHub (&quot;<strong>Platform</strong>&quot;, &quot;<strong>we</strong>&quot;,
          &quot;<strong>us</strong>&quot;, or &quot;<strong>our</strong>&quot;), operated by {COMPANY_NAME},
          you agree to be bound by these Terms of Service (&quot;<strong>Terms</strong>&quot;).
        </p>
        <p>
          If you do not agree to these Terms, please do not use the Platform. These Terms
          apply to all visitors, users, and others who access the Platform.
        </p>
        <p>
          We reserve the right to update these Terms at any time. We will notify registered
          users of material changes by email. Continued use of the Platform after changes
          constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="2. Description of Service">
        <p>
          FinanceHub is an online financial education platform that provides:
        </p>
        <ul>
          <li>Structured lessons and courses on personal finance, investing, trading, corporate finance, and related topics</li>
          <li>Interactive financial calculators and simulators for educational purposes</li>
          <li>AI-powered tutoring for educational questions</li>
          <li>Quizzes, assessments, and educational certificates</li>
          <li>A curated library of financial resources, videos, and summaries</li>
          <li>Community features for learning discussion</li>
        </ul>
        <p>
          <strong>FinanceHub is an educational platform — not a financial advisor, broker,
          investment advisor, portfolio manager, or research analyst.</strong> We are not
          registered with SEBI as an investment advisor. We do not manage money, execute
          trades, or provide personalised financial recommendations.
        </p>
      </LegalSection>

      <LegalSection title="3. User Accounts">
        <p>
          To access certain features, you must create an account. You agree to:
        </p>
        <ul>
          <li>Provide accurate, current, and complete information during registration</li>
          <li>Maintain and promptly update your account information</li>
          <li>Keep your password confidential and not share it with any third party</li>
          <li>Accept responsibility for all activities that occur under your account</li>
          <li>Immediately notify us at {CONTACT_EMAIL} of any unauthorized use of your account</li>
        </ul>
        <p>
          You must be at least 18 years old to create an account. Users under 18 may use
          the Platform only with verifiable parental or guardian consent.
        </p>
        <p>
          We reserve the right to suspend or terminate accounts that violate these Terms,
          engage in abusive behaviour, or attempt to misuse the Platform.
        </p>
      </LegalSection>

      <LegalSection title="4. Subscriptions and Payments">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>4.1 Free and Paid Plans</h3>
        <p>
          FinanceHub offers both free and paid subscription plans. Free plans provide
          access to a limited set of content. Pro and Expert plans provide expanded
          access as described on our pricing page.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>4.2 Payment Processing</h3>
        <p>
          Payments are processed by Razorpay (for Indian users) and Stripe (for international
          users). These third-party processors are governed by their own terms and privacy
          policies. We do not store your complete payment card information.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>4.3 Billing</h3>
        <p>
          Subscriptions are billed monthly or annually in advance. Your subscription will
          automatically renew at the end of each billing period unless cancelled before
          the renewal date.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>4.4 Refund Policy</h3>
        <p>
          We offer a <strong>7-day refund</strong> for first-time subscribers who are
          unsatisfied with their purchase. Refund requests must be submitted to
          {" "}{CONTACT_EMAIL} within 7 days of the initial charge with a brief reason.
          Refunds are not available for renewals or after 7 days. Refunds are processed
          within 5-10 business days to the original payment method.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>4.5 Price Changes</h3>
        <p>
          We reserve the right to modify subscription prices with 30 days&apos; notice to
          existing subscribers. Price changes take effect at the next renewal date.
        </p>
      </LegalSection>

      <LegalSection title="5. Educational Disclaimer — Please Read Carefully">
        <p style={{ fontWeight: 700 }}>
          This section is critically important. Please read it carefully.
        </p>
        <p>
          All content on FinanceHub — including lessons, videos, calculators, AI responses,
          quizzes, case studies, and any other material — is provided <strong>for educational
          and informational purposes only</strong>.
        </p>
        <p>
          FinanceHub content does NOT constitute:
        </p>
        <ul>
          <li><strong>Investment advice</strong> — We do not recommend specific securities, mutual funds, or investment strategies</li>
          <li><strong>Financial advice</strong> — We do not assess your personal financial situation</li>
          <li><strong>Tax advice</strong> — Tax laws are complex and individual circumstances vary</li>
          <li><strong>Legal advice</strong> — Nothing constitutes legal counsel</li>
          <li><strong>Insurance advice</strong> — Product suitability depends on individual circumstances</li>
        </ul>
        <p>
          Past performance of any financial instrument discussed on FinanceHub does not
          guarantee future results. All investing involves risk, including potential loss
          of principal.
        </p>
        <p>
          <strong>Always consult qualified professionals</strong> — a SEBI-registered
          investment advisor, chartered accountant, or lawyer — before making financial
          decisions.
        </p>
      </LegalSection>

      <LegalSection title="6. AI Features Disclaimer">
        <p>
          FinanceHub&apos;s AI Mentor uses large language models to answer financial education
          questions. You acknowledge that:
        </p>
        <ul>
          <li>AI responses may contain errors, inaccuracies, or outdated information</li>
          <li>AI responses are educational only and not personalised financial advice</li>
          <li>AI responses should be verified against authoritative sources (RBI, SEBI, AMFI, etc.) before acting on them</li>
          <li>We monitor AI interactions for quality and safety but cannot guarantee accuracy of every response</li>
          <li>Daily question limits apply based on subscription tier</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Intellectual Property">
        <p>
          The Platform and its original content (excluding user-submitted content and
          properly licensed third-party content) are owned by {COMPANY_NAME} and protected
          by copyright, trademark, and other intellectual property laws.
        </p>
        <p>
          You may not reproduce, distribute, modify, create derivative works of, publicly
          display, or exploit any content from FinanceHub without our express written
          permission, except for personal, non-commercial educational use.
        </p>
        <p>
          Third-party content (YouTube videos, book summaries, external resources) remains
          the property of their respective owners. We link to or embed such content under
          applicable terms and fair use principles. We do not claim ownership of third-party
          intellectual property.
        </p>
      </LegalSection>

      <LegalSection title="8. User Conduct">
        <p>You agree NOT to:</p>
        <ul>
          <li>Use the Platform for any unlawful purpose or in violation of any regulations</li>
          <li>Share account credentials or allow others to access your account</li>
          <li>Scrape, crawl, or systematically extract content from the Platform</li>
          <li>Attempt to bypass, disable, or interfere with security features</li>
          <li>Post or transmit content that is harmful, offensive, or violates others&apos; rights</li>
          <li>Use the AI Mentor to seek advice that you know to be illegal</li>
          <li>Share quiz answers or circumvent the learning assessment system</li>
          <li>Misrepresent your identity or affiliation with any person or organisation</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Data Privacy">
        <p>
          Your privacy is important to us. Our collection and use of personal data is
          governed by our <a href="/legal/privacy" style={{ color: "#0E6163" }}>Privacy Policy</a>,
          which is incorporated into these Terms by reference.
        </p>
        <p>
          We comply with India&apos;s Digital Personal Data Protection Act 2023 (DPDP Act)
          and applicable data protection regulations.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitation of Liability">
        <p>
          To the fullest extent permitted by applicable law, {COMPANY_NAME} and its
          directors, employees, partners, agents, suppliers, or affiliates shall not be
          liable for any indirect, incidental, special, consequential, or punitive damages,
          including without limitation, loss of profits, data, use, goodwill, or other
          intangible losses, resulting from:
        </p>
        <ul>
          <li>Your use of or inability to use the Platform</li>
          <li>Any financial decisions made based on content viewed on the Platform</li>
          <li>Errors or inaccuracies in AI responses</li>
          <li>Unauthorised access to or alteration of your data</li>
          <li>Any bugs, viruses, or other harmful code transmitted through the Platform</li>
        </ul>
        <p>
          Our total liability to you for any cause shall not exceed the amount you have
          paid us in the 12 months preceding the claim.
        </p>
      </LegalSection>

      <LegalSection title="11. Governing Law and Disputes">
        <p>
          These Terms shall be governed by and construed in accordance with the laws of
          India. Any disputes arising from these Terms or your use of the Platform shall
          be subject to the exclusive jurisdiction of the courts of India.
        </p>
        <p>
          Before filing any legal claim, you agree to first contact us at {CONTACT_EMAIL}
          and give us 30 days to resolve the dispute informally.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact Us">
        <p>
          If you have questions about these Terms, please contact us:
        </p>
        <p>
          <strong>{COMPANY_NAME}</strong><br />
          {COMPANY_ADDRESS}<br />
          Email: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#0E6163" }}>{CONTACT_EMAIL}</a>
        </p>
      </LegalSection>

      {/* Footer navigation */}
      <div style={{
        marginTop:    48,
        paddingTop:   24,
        borderTop:    "1px solid #e2e8f0",
        display:      "flex",
        gap:          20,
        fontSize:     13,
        fontFamily:   "var(--font-ui,system-ui)",
      }}>
        <a href="/legal/privacy"     style={{ color: "#0E6163", textDecoration: "none" }}>Privacy Policy</a>
        <a href="/legal/disclaimer"  style={{ color: "#0E6163", textDecoration: "none" }}>Disclaimer</a>
        <a href="/legal/refund"      style={{ color: "#0E6163", textDecoration: "none" }}>Refund Policy</a>
        <a href="/legal/copyright"   style={{ color: "#0E6163", textDecoration: "none" }}>Copyright</a>
      </div>
    </div>
  );
}

// ─── Helper component ─────────────────────────────────────────
function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{
        fontSize:     20,
        fontWeight:   700,
        color:        "#1c2b3a",
        marginBottom: 14,
        fontFamily:   "var(--font-ui,system-ui)",
        letterSpacing:"-0.2px",
      }}>
        {title}
      </h2>
      <div style={{ fontSize: 15, color: "#2d3748", lineHeight: 1.85 }}>
        {children}
      </div>
    </section>
  );
}
