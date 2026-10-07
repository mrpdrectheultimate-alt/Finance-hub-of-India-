// ============================================================
// FinanceHub — Root Layout
// app/layout.tsx
// Wires: PWA · Analytics · Fonts · Theme · SW · Metadata
// ============================================================

import type { Metadata, Viewport } from "next";
import { Inter, Lora }             from "next/font/google";
import Script                       from "next/script";
import { PWAInstallPrompt, SWUpdateBanner, OfflineIndicator } from "@/components/pwa/PWAInstall";
import { PostHogProvider, PostHogPageView } from "@/components/analytics/PostHogProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// ─── Fonts ───────────────────────────────────────────────────
const inter = Inter({
  subsets:   ["latin"],
  variable:  "--font-ui",
  display:   "swap",
});

const lora = Lora({
  subsets:  ["latin"],
  variable: "--font-reading",
  display:  "swap",
});

// ─── Metadata ────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://financehub.in"),
  title: {
    default:  "FinanceHub — Finance Education for India",
    template: "%s | FinanceHub",
  },
  description: "India's best finance education platform. Learn personal finance, investing, trading, tax planning, and crypto. Free lessons in Hindi and English.",
  keywords:    ["personal finance India","SIP calculator","income tax India","mutual funds","stock market basics","financial planning","NIFTY","sensex","hindi finance"],
  authors:     [{ name: "FinanceHub", url: "https://financehub.in" }],
  creator:     "FinanceHub Education",
  publisher:   "FinanceHub Education Private Limited",
  manifest:    "/manifest.json",
  robots:      {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type:        "website",
    locale:      "en_IN",
    url:         "https://financehub.in",
    siteName:    "FinanceHub",
    title:       "FinanceHub — Finance Education for India",
    description: "Learn personal finance, investing, trading and more. Free in Hindi and English.",
    images:      [{ url: "/og-image.png", width: 1200, height: 630, alt: "FinanceHub" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "FinanceHub — Finance Education for India",
    description: "Free finance education in Hindi and English",
    images:      ["/og-image.png"],
    creator:     "@financehub_in",
  },
  icons: {
    icon:        [
      { url: "/icons/icon-32x32.png",  sizes: "32x32",   type: "image/png" },
      { url: "/icons/icon-192x192.png",sizes: "192x192", type: "image/png" },
    ],
    apple:       "/icons/icon-180x180.png",
    shortcut:    "/favicon.ico",
  },
  alternates: {
    canonical:   "https://financehub.in",
    languages: {
      "en-IN": "https://financehub.in",
      "hi-IN": "https://financehub.in/hi",
    },
  },
};

export const viewport: Viewport = {
  themeColor:           [
    { media: "(prefers-color-scheme: light)", color: "#0E6163" },
    { media: "(prefers-color-scheme: dark)",  color: "#0D1117" },
  ],
  width:                "device-width",
  initialScale:         1,
  viewportFit:          "cover",
};

// ─── Structured data (JSON-LD) ────────────────────────────────
const ORG_JSON_LD = {
  "@context":    "https://schema.org",
  "@type":       "EducationalOrganization",
  "name":        "FinanceHub",
  "url":         "https://financehub.in",
  "description": "India's finance education platform — personal finance, investing, trading.",
  "foundingDate":"2024",
  "areaServed":  "IN",
  "inLanguage":  ["en-IN", "hi-IN"],
  "offers": {
    "@type":        "Offer",
    "price":        "0",
    "priceCurrency":"INR",
    "description":  "Free finance education courses",
  },
  "sameAs": [
    "https://twitter.com/financehub_in",
    "https://www.linkedin.com/company/financehub-in",
  ],
};

// ─── PostHog Analytics snippet ───────────────────────────────
const POSTHOG_KEY  = process.env.NEXT_PUBLIC_POSTHOG_KEY  || "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${lora.variable}`}>
      <head>
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
      </head>

      <body style={{
        margin:          0,
        padding:         0,
        background:      "var(--bg-base, #f7f4ee)",
        color:           "var(--text-primary, #1c2b3a)",
        fontFamily:      "var(--font-ui, system-ui)",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        // Safe area insets for notched phones
        paddingTop:      "env(safe-area-inset-top, 0px)",
        paddingBottom:   "env(safe-area-inset-bottom, 0px)",
      }}>

        {/* ── PostHog analytics ── */}
        {POSTHOG_KEY && (
          <Script id="posthog-init" strategy="afterInteractive">
            {`
              !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+" (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
              posthog.init('${POSTHOG_KEY}', {api_host: '${POSTHOG_HOST}', person_profiles: 'identified_only', capture_pageview: true, persistence: 'localStorage'});
            `}
          </Script>
        )}

        {/* ── Service Worker registration ── */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js', { scope: '/' })
                  .then(function(reg) {
                    reg.addEventListener('updatefound', function() {
                      var nw = reg.installing;
                      nw.addEventListener('statechange', function() {
                        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                          window.dispatchEvent(new CustomEvent('sw-update-available'));
                        }
                      });
                    });
                  })
                  .catch(function(err) { console.warn('SW registration failed:', err); });
              });
            }
          `}
        </Script>

        {/* ── CSS variables and global styles ── */}
        <style>{`
          :root {
            /* Brand colours */
            --brand-primary:   #0E6163;
            --brand-secondary: #1D9E75;
            --brand-dark:      #1c2b3a;
            --brand-accent:    #D4A017;

            /* Backgrounds */
            --bg-base:         #f7f4ee;
            --bg-card:         #ffffff;
            --bg-subtle:       #f8f9fa;

            /* Text */
            --text-primary:    #1c2b3a;
            --text-secondary:  #4a5568;
            --text-muted:      #718096;
            --text-faint:      #a0aec0;

            /* Borders */
            --border-light:    #e2e8f0;
            --border-medium:   #cbd5e0;

            /* Semantic */
            --success:         #1D9E75;
            --warning:         #D4A017;
            --danger:          #E53E3E;
            --info:            #185FA5;

            /* Radius */
            --radius-sm:       8px;
            --radius-md:       12px;
            --radius-lg:       16px;
            --radius-xl:       20px;

            /* Font stacks */
            --font-ui:        'Inter', system-ui, -apple-system, sans-serif;
            --font-reading:   'Lora', Georgia, serif;
          }

          @media (prefers-color-scheme: dark) {
            :root:not([data-theme="light"]) {
              --bg-base:         #0D1117;
              --bg-card:         #161B22;
              --bg-subtle:       #1c2b3a;
              --text-primary:    #e6edf3;
              --text-secondary:  #8b949e;
              --text-muted:      #6e7681;
              --text-faint:      #484f58;
              --border-light:    #30363d;
              --border-medium:   #21262d;
            }
          }

          :root[data-theme="dark"] {
            --bg-base:         #0D1117;
            --bg-card:         #161B22;
            --bg-subtle:       #1c2b3a;
            --text-primary:    #e6edf3;
            --text-secondary:  #8b949e;
            --text-muted:      #6e7681;
            --text-faint:      #484f58;
            --border-light:    #30363d;
            --border-medium:   #21262d;
          }

          :root[data-theme="sepia"] {
            --bg-base:         #f5ead3;
            --bg-card:         #fdf6e3;
            --text-primary:    #433422;
            --text-secondary:  #6b5344;
            --border-light:    #ddd0b8;
          }

          /* Global resets */
          *, *::before, *::after { box-sizing: border-box; }
          html { scroll-behavior: smooth; }
          body  { min-height: 100vh; }
          img, video { max-width: 100%; }
          a { color: inherit; }
          button { font-family: inherit; }

          /* Shimmer animation for skeletons */
          @keyframes shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          /* Spin animation */
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }

          /* Slide-up animation for PWA prompt */
          @keyframes slide-up {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0); opacity: 1; }
          }

          /* Bounce animation for loading dots */
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30%            { transform: translateY(-6px); }
          }

          /* Scrollbar styling */
          ::-webkit-scrollbar       { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: var(--border-medium); border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: var(--text-faint); }

          /* Focus styles */
          :focus-visible {
            outline:        2px solid var(--brand-primary);
            outline-offset: 2px;
            border-radius:  4px;
          }

          /* Finance disclaimer standard style */
          .finance-disclaimer {
            font-size:     11px;
            color:         var(--text-muted);
            line-height:   1.6;
            padding:       8px 12px;
            background:    var(--bg-subtle);
            border-radius: var(--radius-sm);
            border:        1px solid var(--border-light);
          }

          /* MDX lesson content styles */
          .lesson-content { font-family: var(--font-reading); line-height: 1.85; color: var(--text-primary); }
          .lesson-content h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.4px; margin: 0 0 20px; }
          .lesson-content h2 { font-size: 19px; font-weight: 700; letter-spacing: -0.2px; margin: 28px 0 12px; color: var(--brand-dark); }
          .lesson-content h3 { font-size: 16px; font-weight: 700; margin: 20px 0 8px; }
          .lesson-content p  { margin: 0 0 14px; font-size: 15px; }
          .lesson-content ul, .lesson-content ol { margin: 0 0 14px; padding-left: 22px; }
          .lesson-content li { margin-bottom: 6px; font-size: 15px; }
          .lesson-content strong { font-weight: 700; color: var(--text-primary); }
          .lesson-content em { font-style: italic; }
          .lesson-content code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--bg-subtle); padding: 1px 5px; border-radius: 4px; }
          .lesson-content pre { background: var(--brand-dark); color: #e2e8f0; padding: 14px 16px; border-radius: var(--radius-md); overflow-x: auto; margin: 0 0 14px; }
          .lesson-content pre code { background: none; padding: 0; color: inherit; }
          .lesson-content blockquote { border-left: 3px solid var(--brand-primary); margin: 0 0 14px; padding: 8px 14px; background: rgba(14,97,99,0.05); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }
          .lesson-content table  { width: 100%; border-collapse: collapse; margin: 0 0 14px; font-size: 14px; }
          .lesson-content th, .lesson-content td { border: 1px solid var(--border-light); padding: 8px 12px; text-align: left; }
          .lesson-content th { background: var(--bg-subtle); font-weight: 700; }
          .lesson-content tr:nth-child(even) { background: rgba(0,0,0,0.02); }
          .lesson-content a { color: var(--brand-primary); text-decoration: underline; }
          .lesson-content hr { border: none; border-top: 1px solid var(--border-light); margin: 20px 0; }
        `}</style>

        {/* Page content */}
        <ErrorBoundary>
          <PostHogProvider>
            <PostHogPageView />
            {children}
          </PostHogProvider>
        </ErrorBoundary>

        {/* PWA components (client-side only) */}
        <PWAInstallPrompt />
        <SWUpdateBanner />
        <OfflineIndicator />

      </body>
    </html>
  );
}
