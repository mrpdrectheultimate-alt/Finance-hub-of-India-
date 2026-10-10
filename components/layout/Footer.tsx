// ============================================================
// FinanceHub — Global Footer
// components/layout/Footer.tsx
// 4-column · All links · Disclaimer · India-first
// ============================================================

export default function Footer() {
  const YEAR = new Date().getFullYear();

  const cols = [
    {
      title: "Learn",
      links: [
        { label: "Personal Finance",    href: "/tracks/personal-finance" },
        { label: "Trading & Markets",   href: "/tracks/trading-markets" },
        { label: "Corporate Finance",   href: "/tracks/corporate-finance" },
        { label: "Crypto & DeFi",       href: "/tracks/crypto-defi" },
        { label: "Forex & Currencies",  href: "/tracks/forex-currency" },
        { label: "Technical Analysis",  href: "/tracks/technical-analysis" },
        { label: "Behavioral Finance",  href: "/tracks/behavioral-finance" },
        { label: "हिंदी Finance",        href: "/tracks/hindi-finance" },
      ],
    },
    {
      title: "Platform",
      links: [
        { label: "Site Map",            href: "/sitemap-guide" },
        { label: "Explore Curriculum", href: "/explore" },
        { label: "Finance Lab",        href: "/practice" },
        { label: "AI Mentor",          href: "/ai-tutor" },
        { label: "Video Library",      href: "/library" },
        { label: "Glossary",           href: "/glossary" },
        { label: "Knowledge Map",      href: "/knowledge-map" },
        { label: "Leaderboard",        href: "/leaderboard" },
        { label: "Certificates",       href: "/certificates" },
        { label: "Daily Review",       href: "/review" },
        { label: "Case Studies",       href: "/case-studies" },
        { label: "Pricing",            href: "/pricing" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy",   href: "/legal/privacy" },
        { label: "Terms of Service", href: "/legal/terms" },
        { label: "Disclaimer",       href: "/legal/disclaimer" },
        { label: "Refund Policy",    href: "/legal/refund" },
        { label: "Cookie Policy",    href: "/legal/cookies" },
      ],
    },
  ];

  return (
    <footer style={{
      background:  "#060E18",
      paddingTop:  56,
      fontFamily:  "var(--font-ui, system-ui)",
    }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>

        {/* Main grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 40,
          marginBottom: 48,
        }}>
          {/* Brand column */}
          <div>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: "linear-gradient(135deg,#0E6163,#1D9E75)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(14,97,99,0.3)",
                flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <rect x="2"  y="10" width="3" height="8"  rx="1" fill="rgba(255,255,255,0.6)"/>
                  <rect x="7"  y="6"  width="3" height="12" rx="1" fill="rgba(255,255,255,0.8)"/>
                  <rect x="12" y="2"  width="3" height="16" rx="1" fill="#fff"/>
                  <path d="M2 12 L7 8 L12 4 L17 2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <circle cx="17" cy="2" r="1.5" fill="#fff"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1 }}>
                  Finance<span style={{ color: "#1D9E75" }}>Hub</span>
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1, marginTop: 2 }}>
                  of India
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, maxWidth: 260, marginBottom: 20 }}>
              Master finance. Build confidence. Shape your future. India's most complete finance education platform.
            </p>

            {/* Contact */}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
              <a href="mailto:hello@financehub.in" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                hello@financehub.in
              </a>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 14 }}>
              Support: <a href="mailto:support@financehub.in" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>support@financehub.in</a>
            </div>

            {/* Social Links */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <a
                href="https://x.com/polymerhub_"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow @polymerhub_ on X"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                  e.currentTarget.style.borderColor = "#1D9E75";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>@polymerhub_</span>
              </a>

              <a
                href="https://www.linkedin.com/in/lpk-naidu-3414153b2"
                target="_blank"
                rel="noopener noreferrer"
                title="Connect with LPK Naidu on LinkedIn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                  e.currentTarget.style.borderColor = "#0A66C2";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>

            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.04em" }}>
              🇮🇳 Built in India. Designed for the world.
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16,
              }}>
                {col.title}
              </div>
              {col.links.map(link => (
                <a key={link.href} href={link.href}
                  style={{
                    display: "block", fontSize: 13,
                    color: "rgba(255,255,255,0.45)",
                    textDecoration: "none", marginBottom: 10,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 20,
          paddingBottom: 8,
          marginBottom: 0,
        }}>
          <p style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.2)",
            lineHeight: 1.7,
            maxWidth: 800,
            margin: "0 0 16px",
          }}>
            ⚠️ All content on FinanceHub is for educational purposes only and does not constitute financial, investment, legal, or tax advice.
            Past performance is not indicative of future results. All simulators use fictional amounts — no real money is involved.
            Always consult a SEBI-registered financial advisor before making investment decisions.
            FinanceHub is not affiliated with SEBI, NSE, BSE, RBI, AMFI or any regulatory body — we only cite them as sources.
          </p>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: 20,
          paddingBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            © {YEAR} FinanceHub of India. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              ["X (@polymerhub_)", "https://x.com/polymerhub_"],
              ["LinkedIn",        "https://www.linkedin.com/in/lpk-naidu-3414153b2"],
              ["Privacy",         "/legal/privacy"],
              ["Terms",           "/legal/terms"],
              ["Refund",          "/legal/refund"],
              ["Contact",         "mailto:hello@financehub.in"],
            ].map(([l, h]) => (
              <a key={l} href={h}
                style={{
                  fontSize: 12, color: "rgba(255,255,255,0.2)",
                  textDecoration: "none", transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
