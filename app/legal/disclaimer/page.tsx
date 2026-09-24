// ============================================================
// FinanceHub — Investment Disclaimer
// app/legal/disclaimer/page.tsx
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title:       "Investment Disclaimer — FinanceHub",
  description: "Important disclaimer about financial education content on FinanceHub.",
};

export default function DisclaimerPage() {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px 80px", fontFamily: "var(--font-reading,Georgia,serif)", color: "#1c2b3a", lineHeight: 1.8 }}>
      <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: "2px solid #e2e8f0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#B91C1C", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-ui,system-ui)" }}>
          Important Notice
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 10px", fontFamily: "var(--font-ui,system-ui)" }}>
          Investment &amp; Financial Disclaimer
        </h1>
        <p style={{ fontSize: 14, color: "#718096", margin: 0, fontFamily: "var(--font-ui,system-ui)" }}>
          Please read this disclaimer carefully before using FinanceHub
        </p>
      </div>

      <div style={{ background: "#FFF5F5", border: "2px solid #FC8181", borderRadius: 12, padding: "20px 22px", marginBottom: 36, fontFamily: "var(--font-ui,system-ui)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#C53030", margin: "0 0 10px" }}>⚠️ Critical Disclaimer</h2>
        <p style={{ fontSize: 15, color: "#742A2A", lineHeight: 1.7, margin: 0 }}>
          FinanceHub provides <strong>financial education only</strong>. Nothing on this platform
          constitutes financial advice, investment advice, tax advice, or any form of personalised
          recommendation. FinanceHub is NOT registered with SEBI as an Investment Adviser under
          the SEBI (Investment Advisers) Regulations 2013.
        </p>
      </div>

      {[
        {
          title: "Not Investment Advice",
          content: `All content on FinanceHub — including lessons, videos, AI responses, calculators, 
          case studies, quizzes, and any other material — is provided purely for educational and 
          informational purposes. None of this content should be construed as a recommendation to 
          buy, sell, or hold any security, mutual fund, cryptocurrency, or any other financial instrument.
          
          Specific securities, mutual funds, or financial products mentioned in educational content 
          are cited as examples only. Their mention does not constitute a recommendation or endorsement.`
        },
        {
          title: "Past Performance Disclaimer",
          content: `Past performance of any financial instrument, index, or investment strategy 
          discussed on FinanceHub does not guarantee or predict future results. Historical returns 
          cited in lessons and examples are for illustrative purposes only. All investments carry risk, 
          including the potential loss of the entire principal amount invested.`
        },
        {
          title: "Market Risk",
          content: `Investments in equities, derivatives, commodities, cryptocurrencies, and other 
          financial instruments are subject to market risks. SEBI data indicates that a significant 
          majority of individual F&O traders (89% per SEBI's 2023 study) lose money. 
          Options, futures, and leveraged instruments carry the risk of losing more than the invested amount.`
        },
        {
          title: "AI Responses Disclaimer",
          content: `The AI Mentor feature uses artificial intelligence to answer financial education 
          questions. AI responses may contain errors, inaccuracies, or outdated information. 
          AI responses are not a substitute for advice from a qualified financial professional. 
          Always verify AI-provided information from authoritative sources (RBI, SEBI, AMFI, etc.) 
          before taking any financial action.`
        },
        {
          title: "Tax Disclaimer",
          content: `Tax information on FinanceHub reflects general principles under Indian tax law. 
          Tax laws change frequently (budget announcements, regulatory amendments). Individual tax 
          liability depends on specific circumstances that only a qualified Chartered Accountant can 
          assess. The information provided is based on laws as of the last review date. 
          Always consult a CA for personalised tax advice.`
        },
        {
          title: "Regulatory Disclaimer",
          content: `FinanceHub is an educational platform. We are not:
          • A SEBI-registered Investment Adviser
          • A SEBI-registered Research Analyst
          • A SEBI-registered Stock Broker
          • An IRDAI-registered Insurance Agent or Broker
          • A PFRDA-registered Point of Presence (NPS)
          • An AMFI-registered Mutual Fund Distributor
          
          Any financial decisions you make are entirely your own responsibility.`
        },
        {
          title: "Crypto and Digital Assets",
          content: `Cryptocurrency and digital assets are highly volatile, speculative, and 
          largely unregulated in India. Indian residents are subject to specific tax rules 
          (30% flat tax on VDA gains, 1% TDS) and regulatory requirements. 
          Crypto content on FinanceHub is educational only. Never invest more in 
          cryptocurrency than you can afford to lose entirely.`
        },
        {
          title: "Consult a Professional",
          content: `Before making any financial decision, please consult:
          • A SEBI-registered Investment Adviser for investment decisions
          • A Chartered Accountant (CA) for tax planning
          • A SEBI-registered Research Analyst for stock research
          • An IRDAI-registered advisor for insurance decisions
          • A lawyer for legal and succession planning matters
          
          Find SEBI-registered advisers at sebi.gov.in. Find registered CAs at icai.org.`
        },
      ].map(section => (
        <section key={section.title} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1c2b3a", marginBottom: 10, fontFamily: "var(--font-ui,system-ui)" }}>
            {section.title}
          </h2>
          <p style={{ fontSize: 15, color: "#2d3748", lineHeight: 1.85, whiteSpace: "pre-line" }}>
            {section.content}
          </p>
        </section>
      ))}

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e2e8f0", display: "flex", gap: 20, fontSize: 13, fontFamily: "var(--font-ui,system-ui)" }}>
        <a href="/legal/terms"   style={{ color: "#0E6163", textDecoration: "none" }}>Terms of Service</a>
        <a href="/legal/privacy" style={{ color: "#0E6163", textDecoration: "none" }}>Privacy Policy</a>
        <a href="/legal/refund"  style={{ color: "#0E6163", textDecoration: "none" }}>Refund Policy</a>
      </div>
    </div>
  );
}
