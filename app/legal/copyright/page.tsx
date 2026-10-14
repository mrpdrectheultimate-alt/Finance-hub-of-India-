// ============================================================
// FinanceHub — Intellectual Property & Copyright Notice
// app/legal/copyright/page.tsx
// Indian Copyright Act 1957 · DMCA Compliance · Content Attribution
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copyright & Intellectual Property Notice — FinanceHub",
  description: "FinanceHub copyright policy, content ownership, third-party attribution, and copyright infringement takedown procedure.",
};

const LAST_UPDATED = "October 2026";
const EFFECTIVE_DATE = "1 October 2026";
const COPYRIGHT_EMAIL = "copyright@financehub.in";

export default function CopyrightPage() {
  return (
    <div
      style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "40px 24px 80px",
        fontFamily: "var(--font-reading, Georgia, serif)",
        color: "var(--text-primary, #1c2b3a)",
        lineHeight: 1.8,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: "2px solid #e2e8f0" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#0E6163",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            marginBottom: 8,
            fontFamily: "var(--font-ui,system-ui)",
          }}
        >
          Legal & Compliance
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            margin: "0 0 10px",
            fontFamily: "var(--font-ui,system-ui)",
          }}
        >
          Copyright & Intellectual Property Policy
        </h1>
        <p style={{ fontSize: 14, color: "#718096", margin: 0, fontFamily: "var(--font-ui,system-ui)" }}>
          Last updated: {LAST_UPDATED} · Effective: {EFFECTIVE_DATE}
        </p>
      </div>

      <LegalSection title="1. Ownership of Platform Content">
        <p>
          All proprietary course material, lesson text, interactive simulators, financial calculators, design layouts, code, quizzes, audio-visual graphics, and branding displayed on FinanceHub are the exclusive intellectual property of FinanceHub Education Private Limited, protected under the <strong>Indian Copyright Act, 1957</strong> and international intellectual property conventions.
        </p>
        <p style={{ marginTop: 12 }}>
          Unauthorized copying, reproduction, distribution, scraping, modification, public display, or commercial exploitation of any part of this platform without express prior written consent is strictly prohibited.
        </p>
      </LegalSection>

      <LegalSection title="2. Permitted Educational Use & Limited License">
        <p>
          FinanceHub grants users a personal, non-exclusive, non-transferable, revocable license to access and complete educational courses and download personal completion certificates. You may not:
        </p>
        <ul style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>Resell, redistribute, or sub-license course notes, simulator code, or test questions.</li>
          <li>Scrape or bulk download lesson repositories using automated robots or scripts.</li>
          <li>Decompile, reverse engineer, or disassemble the financial simulation engines.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Third-Party Content & YouTube Embeds">
        <p>
          FinanceHub curates external educational videos provided through standard YouTube embedded players in accordance with the <em>YouTube Terms of Service</em> and <em>YouTube API Services Terms</em>. All embedded videos, creator trademarks, and audio are the property of their respective creator channels (including Khan Academy, CA Rachana Ranade, Pranjal Kamra, Zerodha Varsity, etc.).
        </p>
        <p style={{ marginTop: 12 }}>
          FinanceHub does not host or claim ownership over third-party YouTube videos. If you are a creator and wish to have your video omitted from our curated educational index, please contact us at <a href={`mailto:${COPYRIGHT_EMAIL}`} style={{ color: "#0E6163" }}>{COPYRIGHT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection title="4. Copyright Infringement & Takedown Notices">
        <p>
          In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and international copyright standards, if you believe that your copyrighted work has been improperly copied or made accessible on FinanceHub, please send a written notification to our Grievance & Copyright Officer:
        </p>
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "16px 20px",
            marginTop: 14,
            fontSize: 14,
            fontFamily: "var(--font-ui,system-ui)",
          }}
        >
          <strong>Copyright Officer:</strong> FinanceHub Legal Operations<br />
          <strong>Email:</strong> <a href={`mailto:${COPYRIGHT_EMAIL}`} style={{ color: "#0E6163" }}>{COPYRIGHT_EMAIL}</a><br />
          <strong>Address:</strong> FinanceHub Education Private Limited, Bengaluru, Karnataka, India<br />
          <strong>Response Time:</strong> Within 36 working hours of valid notice receipt.
        </div>
      </LegalSection>

      {/* Footer Navigation */}
      <div
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          fontSize: 13,
          fontFamily: "var(--font-ui,system-ui)",
        }}
      >
        <a href="/legal/terms" style={{ color: "#0E6163", textDecoration: "none" }}>Terms of Service</a>
        <a href="/legal/privacy" style={{ color: "#0E6163", textDecoration: "none" }}>Privacy Policy</a>
        <a href="/legal/disclaimer" style={{ color: "#0E6163", textDecoration: "none" }}>Disclaimer</a>
        <a href="/legal/refund" style={{ color: "#0E6163", textDecoration: "none" }}>Refund Policy</a>
        <span style={{ color: "#718096" }}>Copyright Notice</span>
      </div>
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#1c2b3a",
          marginBottom: 14,
          fontFamily: "var(--font-ui,system-ui)",
          letterSpacing: "-0.2px",
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: 15, color: "#2d3748", lineHeight: 1.85 }}>{children}</div>
    </section>
  );
}
