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
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>
              Support: <a href="mailto:support@financehub.in" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>support@financehub.in</a>
            </div>

            {/* Social icons */}
            <div style={{ display:"flex", gap:10, marginTop:20, marginBottom:16 }}>
              {/* X / Twitter — @polymerhub_ */}
              <a
                href="https://x.com/polymerhub_"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow @polymerhub_ on X"
                title="Follow @polymerhub_ on X (Twitter)"
                style={{
                  width:36, height:36, borderRadius:9,
                  background:"rgba(255,255,255,0.07)",
                  border:"1px solid rgba(255,255,255,0.12)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  textDecoration:"none", transition:"all 0.18s", flexShrink:0,
                }}
                onMouseEnter={e=>{
                  e.currentTarget.style.background="rgba(255,255,255,0.18)";
                  e.currentTarget.style.borderColor="rgba(255,255,255,0.3)";
                  e.currentTarget.style.transform="translateY(-2px)";
                  e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.background="rgba(255,255,255,0.07)";
                  e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";
                  e.currentTarget.style.transform="translateY(0)";
                  e.currentTarget.style.boxShadow="none";
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/lpk-naidu-3414153b2"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect on LinkedIn"
                title="Connect with us on LinkedIn"
                style={{
                  width:36, height:36, borderRadius:9,
                  background:"rgba(255,255,255,0.07)",
                  border:"1px solid rgba(255,255,255,0.12)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  textDecoration:"none", transition:"all 0.18s", flexShrink:0,
                }}
                onMouseEnter={e=>{
                  e.currentTarget.style.background="#0A66C2";
                  e.currentTarget.style.borderColor="#0A66C2";
                  e.currentTarget.style.transform="translateY(-2px)";
                  e.currentTarget.style.boxShadow="0 4px 12px rgba(10,102,194,0.4)";
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.background="rgba(255,255,255,0.07)";
                  e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";
                  e.currentTarget.style.transform="translateY(0)";
                  e.currentTarget.style.boxShadow="none";
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
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
              ["Privacy", "/legal/privacy"],
              ["Terms",   "/legal/terms"],
              ["Refund",  "/legal/refund"],
              ["Contact", "mailto:hello@financehub.in"],
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
