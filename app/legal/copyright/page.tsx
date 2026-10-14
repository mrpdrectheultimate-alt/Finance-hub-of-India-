// ============================================================
// FinanceHub — Intellectual Property, Copyright & Sources Policy
// app/legal/copyright/page.tsx
// Indian Copyright Act 1957 · IT Act 2000 · IT Rules 2021 · DMCA
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copyright, Sources & Intellectual Property Policy — FinanceHub",
  description: "Comprehensive copyright statement, third-party source attribution, fair dealing doctrine, nominative trademark use, and statutory takedown procedure for FinanceHub of India.",
};

const LAST_UPDATED = "October 2026";
const EFFECTIVE_DATE = "1 October 2026";
const GRIEVANCE_EMAIL = "grievance@financehub.in";
const COPYRIGHT_EMAIL = "copyright@financehub.in";
const COMPANY_NAME = "FinanceHub Education Private Limited";

export default function CopyrightPage() {
  return (
    <div
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "40px 24px 80px",
        fontFamily: "var(--font-reading, Georgia, serif)",
        color: "var(--text-primary, #1c2b3a)",
        lineHeight: 1.85,
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
          Legal & Regulatory Compliance
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
          Copyright, Sources &amp; Fair Use Policy
        </h1>
        <p style={{ fontSize: 14, color: "#718096", margin: 0, fontFamily: "var(--font-ui,system-ui)" }}>
          Statutory Compliance under the Indian Copyright Act (1957), Information Technology Act (2000), and Trade Marks Act (1999)
          <br />
          Last updated: {LAST_UPDATED} · Effective: {EFFECTIVE_DATE}
        </p>
      </div>

      {/* Primary Statement */}
      <div
        style={{
          background: "#F0FDF4",
          border: "1px solid #BBF7D0",
          borderRadius: 10,
          padding: "16px 20px",
          marginBottom: 32,
          fontSize: 14,
          color: "#166534",
          lineHeight: 1.7,
          fontFamily: "var(--font-ui,system-ui)",
        }}
      >
        <strong>Legal Declaration:</strong> FinanceHub is an independent educational platform committed to the highest standards of intellectual property integrity. All proprietary software, lesson text, interactive simulators, and assessment engines are original creations of {COMPANY_NAME}. Where external educational resources, citations, and government regulations are referenced, they are curated strictly in compliance with statutory fair dealing, official embedding APIs, and nominative fair use principles.
      </div>

      <LegalSection title="1. Ownership of Platform Intellectual Property">
        <p>
          Except where expressly attributed to third parties, all original content appearing on FinanceHub — including but not limited to course curriculum, written lesson modules, interactive financial calculators, paper trading engines, quiz questions, graphic illustrations, UI code, design tokens, and digital completion certificates — is the exclusive intellectual property of <strong>{COMPANY_NAME}</strong>, protected under the <strong>Indian Copyright Act, 1957</strong> and international copyright treaties (including the Berne Convention and TRIPS).
        </p>
        <p style={{ marginTop: 12 }}>
          Users are granted a limited, personal, non-exclusive, revocable license to access, view, and complete learning materials for personal, non-commercial education. Unauthorized reproduction, automated scraping, commercial reselling, or redistribution of our course material without prior written consent is strictly prohibited.
        </p>
      </LegalSection>

      <LegalSection title="2. Curated Video Library & YouTube Terms of Service Compliance">
        <p>
          FinanceHub curates educational video lectures and playlists created by reputable finance educators (such as Khan Academy, CA Rachana Ranade, Pranjal Kamra, Zerodha Varsity, Asset Yogi, and others). We strictly adhere to the following principles:
        </p>
        <ul style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>
            <strong>Official Embeds Only:</strong> All videos are delivered strictly via standard YouTube embedded player iframes in accordance with <strong>Section 4.C and Section 5.B of the YouTube Terms of Service</strong>.
          </li>
          <li>
            <strong>No File Hosting or Streaming:</strong> FinanceHub does not download, rip, store, host, re-encode, or transmit video or audio media on our servers. All video traffic flows directly between the user&apos;s browser and YouTube&apos;s servers.
          </li>
          <li>
            <strong>Preservation of Creator Rights &amp; Attribution:</strong> Channel names, original video titles, and verified creator branding are prominently displayed on every video card. YouTube views, advertising impressions, and creator revenue accrue directly and unimpeded to the respective YouTube creator channels.
          </li>
          <li>
            <strong>Creator Opt-Out Protocol:</strong> If you are a creator and prefer that your public YouTube video not be indexed in our educational catalog, simply email <a href={`mailto:${COPYRIGHT_EMAIL}`} style={{ color: "#0E6163" }}>{COPYRIGHT_EMAIL}</a> with the video URL, and our operations team will unpublish the index link within 24 hours.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Book Summaries & Fair Dealing Doctrine (Section 52)">
        <p>
          FinanceHub provides educational chapter takeaways and conceptual reviews of foundational finance literature (such as <em>The Psychology of Money</em>, <em>The Intelligent Investor</em>, and <em>Let&apos;s Talk Money</em>).
        </p>
        <p style={{ marginTop: 12 }}>
          These summaries are entirely original analytical syntheses created by our editorial team. Under <strong>Section 52(1)(a)(ii) of the Indian Copyright Act, 1957</strong>, fair dealing with any literary work for the purpose of <strong>criticism, review, commentary, or teaching</strong> does not constitute an infringement of copyright. FinanceHub does not reproduce the text of the underlying books and provides direct official purchase links to encourage users to acquire the authors&apos; complete original works.
        </p>
      </LegalSection>

      <LegalSection title="4. Public Statutes, Regulatory Circulars & Government Information">
        <p>
          FinanceHub educates users on Indian personal finance, income tax regimes, retirement regulations, and securities laws by citing official documents published by statutory bodies including:
        </p>
        <ul style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>Reserve Bank of India (RBI) — monetary policy, repo rates, banking regulations</li>
          <li>Securities and Exchange Board of India (SEBI) — securities markets, RIA guidelines, risk disclosures</li>
          <li>Central Board of Direct Taxes (CBDT) &amp; Ministry of Finance — Income Tax Act (1961), Union Budget provisions</li>
          <li>Pension Fund Regulatory and Development Authority (PFRDA) — NPS guidelines</li>
          <li>Employees&apos; Provident Fund Organisation (EPFO) — EPF/EPS rules</li>
          <li>Insurance Regulatory and Development Authority of India (IRDAI) — insurance norms</li>
          <li>Association of Mutual Funds in India (AMFI) — mutual fund categorization</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Pursuant to <strong>Section 52(1)(q) of the Indian Copyright Act, 1957</strong>, the reproduction of Acts of the legislature, official government notifications, committee reports, and statutory circulars is expressly permitted for public awareness and education.
        </p>
      </LegalSection>

      <LegalSection title="5. Mathematical Models, Financial Formulas & Simulators">
        <p>
          All interactive simulators on FinanceHub (including the SIP Compounder, EMI Calculator, Retirement Planner, Income Tax Regime Comparator, and Startup Runway Estimator) utilize universally recognized mathematical, actuarial, and compounding formulas (e.g. compound interest, annuity amortization, and standard safe withdrawal rates).
        </p>
        <p style={{ marginTop: 12 }}>
          Under established intellectual property jurisprudence and Section 3(k) of the Patents Act 1970, mathematical algorithms and formulas are fundamental scientific principles and cannot be owned or monopolized. The interactive frontend software code executing these formulas is original code authored by FinanceHub.
        </p>
      </LegalSection>

      <LegalSection title="6. Nominative Fair Use of Third-Party Trademarks">
        <p>
          Trademarks, trade names, and logos of third-party institutions (such as RBI, SEBI, NSE, BSE, AMFI, Zerodha, Khan Academy, Stripe, Razorpay, etc.) referenced on FinanceHub belong entirely to their respective statutory or corporate owners.
        </p>
        <p style={{ marginTop: 12 }}>
          The reference to these marks on FinanceHub is strictly for <strong>nominative identification and educational source attribution</strong> under <strong>Section 30(2)(d) of the Trade Marks Act, 1999</strong>. Such nominative references do not indicate or imply any affiliation, sponsorship, endorsement, or commercial partnership between FinanceHub and the respective trademark owners.
        </p>
      </LegalSection>

      <LegalSection title="7. Intermediary Safe Harbour & User Content (IT Act 2000)">
        <p>
          FinanceHub hosts community learning discussions, public Q&amp;A forums, and user study notes. Pursuant to <strong>Section 79 of the Information Technology Act, 2000</strong>, FinanceHub operates as an intermediary with respect to user-posted content and is shielded from liability for third-party submissions, provided we exercise statutory due diligence and expeditiously remove content upon receipt of valid notice.
        </p>
      </LegalSection>

      <LegalSection title="8. Statutory Takedown Procedure & Grievance Officer">
        <p>
          In accordance with the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>, if you are a copyright owner or an authorized representative and believe that any content hosted or referenced on FinanceHub infringes your intellectual property, please submit a written notification containing:
        </p>
        <ol style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>Identification of the copyrighted work claimed to have been infringed.</li>
          <li>Exact URL or specific location on FinanceHub where the material is displayed.</li>
          <li>Your contact information (legal name, address, telephone number, and email address).</li>
          <li>A statement that you have a good-faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.</li>
          <li>A statement under penalty of perjury that the information in the notification is accurate and that you are authorized to act on behalf of the owner.</li>
        </ol>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "16px 20px",
            marginTop: 16,
            fontSize: 14,
            fontFamily: "var(--font-ui,system-ui)",
          }}
        >
          <strong>Designated Grievance &amp; Copyright Officer:</strong><br />
          <strong>Name:</strong> Grievance Officer, FinanceHub Operations<br />
          <strong>Company:</strong> {COMPANY_NAME}<br />
          <strong>Email:</strong> <a href={`mailto:${GRIEVANCE_EMAIL}`} style={{ color: "#0E6163" }}>{GRIEVANCE_EMAIL}</a> / <a href={`mailto:${COPYRIGHT_EMAIL}`} style={{ color: "#0E6163" }}>{COPYRIGHT_EMAIL}</a><br />
          <strong>Location:</strong> Bengaluru, Karnataka, India<br />
          <strong>Statutory Turnaround:</strong> Acknowledgment within 24 hours; preliminary action/takedown within 36 hours; final grievance disposal within 15 days.
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
        <a href="/legal/sebi-compliance" style={{ color: "#0E6163", textDecoration: "none" }}>SEBI Compliance</a>
        <a href="/legal/refund" style={{ color: "#0E6163", textDecoration: "none" }}>Refund Policy</a>
        <a href="/legal/cookies" style={{ color: "#0E6163", textDecoration: "none" }}>Cookie Policy</a>
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
