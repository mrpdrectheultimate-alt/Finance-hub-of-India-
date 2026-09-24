// ============================================================
// FinanceHub — SEBI Compliance Declaration
// app/legal/sebi-compliance/page.tsx
// Formal SEBI RIA / RA Non-Registration Statement
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:       "SEBI Regulatory Compliance — FinanceHub",
  description: "Formal SEBI compliance statement and educational platform declaration for FinanceHub.",
};

export default function SebiCompliancePage() {
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
        <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-ui,system-ui)" }}>
          Regulatory Status
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 10px", fontFamily: "var(--font-ui,system-ui)" }}>
          SEBI Compliance Declaration
        </h1>
        <p style={{ fontSize: 14, color: "#718096", margin: 0, fontFamily: "var(--font-ui,system-ui)" }}>
          Securities and Exchange Board of India (SEBI) Educational Operating Framework
        </p>
      </div>

      <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 10, padding: "16px", marginBottom: 32, fontSize: 14, color: "#065F46", fontFamily: "var(--font-ui,system-ui)" }}>
        📜 <strong>Official Statement:</strong> FinanceHub is an independent financial literacy and technology platform. We operate strictly in accordance with NCFE (National Centre for Financial Education) and SEBI guidelines promoting investor awareness without offering financial advice.
      </div>

      <Section title="1. Educational Platform Declaration">
        <p>
          FinanceHub does not issue investment advice, buy/sell targets, or model portfolio subscriptions. All calculators, backtest visualizers, and simulated paper-trading tools use mathematical formulas for conceptual illustration only.
        </p>
      </Section>

      <Section title="2. SEBI Registered Advisory Recommendation">
        <p>
          For personalized investment advisory, wealth management, or stock selection, users are urged to consult a SEBI-registered Investment Advisor (RIA) listed on the official SEBI portal (<code>sebi.gov.in</code>).
        </p>
      </Section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e2e8f0", display: "flex", gap: 20, fontSize: 13, fontFamily: "var(--font-ui,system-ui)" }}>
        <Link href="/legal/terms" style={{ color: "#0E6163", textDecoration: "none" }}>Terms of Service</Link>
        <Link href="/legal/privacy" style={{ color: "#0E6163", textDecoration: "none" }}>Privacy Policy</Link>
        <Link href="/legal/disclaimer" style={{ color: "#0E6163", textDecoration: "none" }}>Disclaimer Hub</Link>
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
