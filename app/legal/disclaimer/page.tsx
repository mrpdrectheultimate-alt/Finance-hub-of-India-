// ============================================================
// FinanceHub — Financial & Regulatory Disclaimer Hub
// app/legal/disclaimer/page.tsx
// SEBI & RBI Risk Disclosures · F&O Loss Warning · Tax & AI Rules
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:       "Financial Disclaimers — FinanceHub",
  description: "Official SEBI, RBI, F&O Risk, and AI Tutor educational disclaimers for FinanceHub.",
};

export default function DisclaimerHubPage() {
  return (
    <div style={{
      maxWidth:   820,
      margin:     "0 auto",
      padding:    "40px 24px 80px",
      fontFamily: "var(--font-reading, Georgia, serif)",
      color:      "var(--text-primary, #1c2b3a)",
      lineHeight: 1.8,
    }}>
      <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: "2px solid #e2e8f0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#D97706", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-ui,system-ui)" }}>
          Regulatory Disclosures
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 10px", fontFamily: "var(--font-ui,system-ui)" }}>
          Financial Disclaimer Hub
        </h1>
        <p style={{ fontSize: 14, color: "#718096", margin: 0, fontFamily: "var(--font-ui,system-ui)" }}>
          Explicit risk disclaimers across Equities, F&O Derivatives, Mutual Funds, Tax, and AI Tutors
        </p>
      </div>

      {/* Mandatory SEBI F&O Disclosure Box */}
      <div style={{ background: "#FEF2F2", border: "2px solid #FCA5A5", borderRadius: 12, padding: "20px", marginBottom: 32, fontFamily: "var(--font-ui,system-ui)" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#991B1B", marginBottom: 8 }}>
          ⚠️ MANDATORY SEBI RISK DISCLOSURE ON DERIVATIVES (F&O)
        </div>
        <p style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 1.6, margin: 0 }}>
          Per SEBI study on <em>Analysis of Profit and Loss of Individual Traders in Equity Derivatives Segment</em>:
          <br />
          • <strong>9 out of 10 individual traders in equity Derivatives segment incurred net losses.</strong>
          <br />
          • Average net loss of loss-makers was close to ₹50,000.
          <br />
          • Over and above the net trading losses, loss-makers incurred an additional 28% of net trading losses as transaction costs.
          <br />
          FinanceHub derivatives modules are 100% educational and do NOT recommend options or futures strategies.
        </p>
      </div>

      <Section title="1. Non-Advisory Status (SEBI)">
        <p>
          FinanceHub is an educational software platform. We are <strong>not registered with SEBI</strong> as a Research Analyst (RA), Registered Investment Advisor (RIA), or Portfolio Manager (PMS). No content on this platform should be treated as a buy/sell recommendation.
        </p>
      </Section>

      <Section title="2. Tax & Legal Guidance Notice">
        <p>
          Tax calculations on FinanceHub (Old vs New Tax Regime comparisons, Section 80C deductions, Section 112A LTCG rules) are simplified educational models. Income tax rules change via annual Finance Acts. Always consult a Chartered Accountant (CA) for personalized filing.
        </p>
      </Section>

      <Section title="3. AI Mentor Educational Limitations">
        <p>
          AI Mentor utilizes language models to explain financial concepts. AI responses do not represent professional investment advice and should be cross-verified against official regulatory guidelines (RBI, SEBI, AMFI, Income Tax India).
        </p>
      </Section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e2e8f0", display: "flex", gap: 20, fontSize: 13, fontFamily: "var(--font-ui,system-ui)" }}>
        <Link href="/legal/terms" style={{ color: "#0E6163", textDecoration: "none" }}>Terms of Service</Link>
        <Link href="/legal/privacy" style={{ color: "#0E6163", textDecoration: "none" }}>Privacy Policy</Link>
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
