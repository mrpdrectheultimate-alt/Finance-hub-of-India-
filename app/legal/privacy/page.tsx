// ============================================================
// FinanceHub — Privacy Policy
// app/legal/privacy/page.tsx
// DPDP Act 2023 compliant · India-specific · Last updated Sept 2026
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title:       "Privacy Policy — FinanceHub",
  description: "How FinanceHub collects, uses, and protects your personal data. DPDP Act 2023 compliant.",
};

const LAST_UPDATED   = "September 2026";
const CONTACT_EMAIL  = "privacy@financehub.in";
const COMPANY_NAME   = "FinanceHub Education Private Limited";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: "#718096", margin: 0, fontFamily: "var(--font-ui,system-ui)" }}>
          Last updated: {LAST_UPDATED} · We protect your data under India&apos;s DPDP Act 2023
        </p>
      </div>

      {/* DPDP notice */}
      <div style={{
        background: "#EBF8FF", border: "1px solid #BEE3F8",
        borderRadius: 10, padding: "14px 18px", marginBottom: 32,
        fontSize: 14, color: "#2C5282", lineHeight: 1.7,
        fontFamily: "var(--font-ui,system-ui)",
      }}>
        <strong>Your Rights Under DPDP Act 2023:</strong> You have the right to access,
        correct, and erase your personal data. Contact us at {CONTACT_EMAIL} to exercise
        these rights. We respond within 30 days.
      </div>

      <LegalSection title="1. Who We Are">
        <p>
          {COMPANY_NAME} (&quot;<strong>FinanceHub</strong>&quot;, &quot;<strong>we</strong>&quot;,
          &quot;<strong>us</strong>&quot;) operates the FinanceHub platform at financehub.in.
        </p>
        <p>
          We are the Data Fiduciary for the personal data you provide to us,
          as defined under the Digital Personal Data Protection Act 2023 (DPDP Act).
        </p>
      </LegalSection>

      <LegalSection title="2. Data We Collect">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>2.1 Data You Provide Directly</h3>
        <ul>
          <li><strong>Account information:</strong> Name, email address, password (hashed)</li>
          <li><strong>Profile information:</strong> Onboarding preferences, learning goals, primary track</li>
          <li><strong>Payment information:</strong> Billing details (processed by Razorpay/Stripe — we do not store card numbers)</li>
          <li><strong>Notes content:</strong> Notes and highlights you create in the Digital Rough Book</li>
          <li><strong>AI questions:</strong> Questions submitted to AI Mentor (stored for quality and safety)</li>
          <li><strong>Feedback:</strong> Survey responses, support messages, error reports</li>
        </ul>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>2.2 Data Collected Automatically</h3>
        <ul>
          <li><strong>Learning progress:</strong> Lessons completed, quiz scores, time spent</li>
          <li><strong>Usage analytics:</strong> Pages visited, features used, clicks (via PostHog)</li>
          <li><strong>Device information:</strong> Browser type, device type, operating system</li>
          <li><strong>IP address:</strong> Used for security and approximate location (city level)</li>
          <li><strong>Cookies:</strong> Session cookies for authentication; analytics cookies (with consent)</li>
        </ul>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>2.3 Data We Do NOT Collect</h3>
        <ul>
          <li>We do not collect Aadhaar numbers, PAN numbers, or other government IDs</li>
          <li>We do not collect bank account details or actual portfolio information</li>
          <li>We do not access your financial accounts</li>
          <li>We do not collect sensitive personal data as defined under DPDP Act beyond what is necessary</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How We Use Your Data">
        <p>We use your personal data to:</p>
        <ul>
          <li><strong>Provide the service:</strong> Authenticate your account, track learning progress, personalise content</li>
          <li><strong>Process payments:</strong> Manage subscriptions and billing</li>
          <li><strong>Improve the platform:</strong> Understand which content works, fix bugs, develop new features</li>
          <li><strong>Communicate:</strong> Send learning reminders, feature updates, and important notices</li>
          <li><strong>Safety and security:</strong> Detect fraud, prevent abuse, monitor AI safety</li>
          <li><strong>Legal compliance:</strong> Meet regulatory obligations under Indian law</li>
        </ul>
        <p>
          We process your data based on: (a) contract performance — necessary to provide the service;
          (b) legitimate interests — improving the platform; (c) legal obligation — regulatory compliance;
          and (d) your consent — for optional analytics and marketing communications.
        </p>
      </LegalSection>

      <LegalSection title="4. Data Sharing">
        <p>
          We do not sell your personal data. We share data only with:
        </p>
        <ul>
          <li><strong>Supabase:</strong> Database and authentication provider (data stored in their infrastructure)</li>
          <li><strong>Razorpay / Stripe:</strong> Payment processing (governed by their privacy policies)</li>
          <li><strong>Anthropic:</strong> AI processing for AI Mentor responses (questions are processed by their API)</li>
          <li><strong>PostHog:</strong> Analytics (anonymised usage data)</li>
          <li><strong>Resend:</strong> Email delivery for transactional messages</li>
          <li><strong>Vercel:</strong> Platform hosting</li>
          <li><strong>Legal authorities:</strong> When required by law, court order, or to protect rights</li>
        </ul>
        <p>
          All third-party processors are contractually required to protect your data and
          use it only for the specified purpose.
        </p>
      </LegalSection>

      <LegalSection title="5. Your Rights Under DPDP Act 2023">
        <p>As a Data Principal under the DPDP Act 2023, you have the right to:</p>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>5.1 Right to Access</h3>
        <p>
          Request a summary of your personal data we hold and how we have processed it.
          Access your data in your account Settings → &quot;My Data&quot;.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>5.2 Right to Correction</h3>
        <p>
          Request correction of inaccurate or incomplete personal data.
          Update most information directly in your profile settings.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>5.3 Right to Erasure</h3>
        <p>
          Request deletion of your personal data. You can delete your account from
          Settings → &quot;Delete Account&quot;. We will erase your data within 30 days, except
          where retention is required by law (e.g., financial records for 7 years under
          Indian accounting standards).
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>5.4 Right to Grievance Redressal</h3>
        <p>
          If you have a complaint about how we handle your data, contact our Data
          Protection Officer at {CONTACT_EMAIL}. We respond within 30 days.
          If unsatisfied, you may approach the Data Protection Board of India.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>5.5 Right to Nominate</h3>
        <p>
          Under the DPDP Act, you may nominate another person to exercise your rights
          in the event of your death or incapacity. Contact {CONTACT_EMAIL} to set up
          a nominee.
        </p>
      </LegalSection>

      <LegalSection title="6. Data Retention">
        <p>We retain your data for the following periods:</p>
        <ul>
          <li><strong>Account data:</strong> Until account deletion + 30 days</li>
          <li><strong>Learning progress:</strong> Until account deletion</li>
          <li><strong>Payment records:</strong> 7 years (required by Indian financial law)</li>
          <li><strong>AI interaction logs:</strong> 90 days (for quality and safety monitoring)</li>
          <li><strong>Analytics data:</strong> 24 months (aggregated, anonymised)</li>
          <li><strong>Support communications:</strong> 3 years</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>We use the following types of cookies:</p>
        <ul>
          <li><strong>Essential cookies:</strong> Required for authentication and basic functionality. Cannot be disabled.</li>
          <li><strong>Analytics cookies:</strong> Help us understand how the Platform is used (PostHog). Can be disabled in Settings → Privacy.</li>
          <li><strong>Preference cookies:</strong> Remember your theme, language, and display preferences.</li>
        </ul>
        <p>
          You can manage cookies through your browser settings. Disabling essential cookies
          will prevent you from using the Platform.
        </p>
      </LegalSection>

      <LegalSection title="8. Children&apos;s Privacy">
        <p>
          FinanceHub is designed for users 18 years and older. Users between 13-17 may
          use the Platform only with verifiable parental consent. We do not knowingly
          collect personal data from children under 13.
        </p>
        <p>
          If you believe a child under 13 has created an account, please contact us at
          {" "}{CONTACT_EMAIL} immediately and we will delete the account.
        </p>
      </LegalSection>

      <LegalSection title="9. Data Security">
        <p>We implement industry-standard security measures including:</p>
        <ul>
          <li>TLS encryption for all data in transit</li>
          <li>Encryption at rest for sensitive data</li>
          <li>Row-Level Security (RLS) in our database — users can only access their own data</li>
          <li>Bcrypt hashing for passwords (we never store plaintext passwords)</li>
          <li>Regular security audits and penetration testing</li>
          <li>Access controls limiting employee access to personal data</li>
        </ul>
        <p>
          Despite these measures, no system is completely secure. In the event of a
          data breach affecting your rights, we will notify you as required by the DPDP Act.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact and Grievances">
        <p>
          <strong>Data Protection Officer / Grievance Officer:</strong><br />
          {COMPANY_NAME}<br />
          Email: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#0E6163" }}>{CONTACT_EMAIL}</a><br />
          Response time: Within 30 days of receipt
        </p>
        <p>
          For escalated grievances, you may contact the Data Protection Board of India
          at their official website once it is operational.
        </p>
      </LegalSection>

      {/* Footer navigation */}
      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e2e8f0", display: "flex", gap: 20, fontSize: 13, fontFamily: "var(--font-ui,system-ui)" }}>
        <a href="/legal/terms"      style={{ color: "#0E6163", textDecoration: "none" }}>Terms of Service</a>
        <a href="/legal/disclaimer" style={{ color: "#0E6163", textDecoration: "none" }}>Disclaimer</a>
        <a href="/legal/refund"     style={{ color: "#0E6163", textDecoration: "none" }}>Refund Policy</a>
        <a href="/legal/copyright"  style={{ color: "#0E6163", textDecoration: "none" }}>Copyright</a>
      </div>
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1c2b3a", marginBottom: 14, fontFamily: "var(--font-ui,system-ui)", letterSpacing: "-0.2px" }}>
        {title}
      </h2>
      <div style={{ fontSize: 15, color: "#2d3748", lineHeight: 1.85 }}>{children}</div>
    </section>
  );
}
