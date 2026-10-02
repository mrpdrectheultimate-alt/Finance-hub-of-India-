"use client";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer style={{ background: "#060E18", padding: "64px 0 32px", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-ui, system-ui)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
        {/* Top 4 columns */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <Logo size="md" href="/" dark />
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginTop: 16, maxWidth: 260 }}>
              Master personal finance, investing, trading, crypto, forex, and corporate finance. Built for India.
            </p>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 16 }}>
              🇮🇳 Made with pride in India
            </div>
          </div>

          {/* Learn */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Learn</div>
            {["Personal Finance", "Trading & Markets", "Corporate Finance", "Crypto & DeFi", "Technical Analysis", "Forex & Currencies"].map(t => (
              <Link key={t} href="/explore" style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 10, textDecoration: "none" }}>{t}</Link>
            ))}
          </div>

          {/* Platform */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Platform</div>
            {[
              ["Finance Lab", "/practice"],
              ["AI Mentor", "/ai-tutor"],
              ["Library", "/library"],
              ["Knowledge Map", "/knowledge-map"],
              ["Leaderboard", "/leaderboard"],
              ["Settings", "/settings"],
            ].map(([l, h]) => (
              <Link key={l} href={h} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 10, textDecoration: "none" }}>{l}</Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Legal</div>
            {[
              ["Privacy Policy", "/legal/privacy"],
              ["Terms of Service", "/legal/terms"],
              ["SEBI Compliance", "/legal/sebi-compliance"],
              ["Disclaimer", "/legal/disclaimer"],
              ["Pricing", "/pricing"],
            ].map(([l, h]) => (
              <Link key={l} href={h} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 10, textDecoration: "none" }}>{l}</Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            © 2026 FinanceHub of India. All rights reserved. Educational purposes only — not investment advice.
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Privacy</Link>
            <Link href="/terms" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Terms</Link>
            <Link href="/legal/disclaimer" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
