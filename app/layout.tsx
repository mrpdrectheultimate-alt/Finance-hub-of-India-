import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import PWAContainer from "@/components/pwa/PWAContainer";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://financehub.in";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "FinanceHub - World-Class Finance Education",
    template: "%s | FinanceHub",
  },
  description:
    "Master personal finance, investing, trading, crypto, forex, and corporate finance through structured lessons, AI tutoring, live simulators, and curated resources.",
  keywords: [
    "finance education",
    "investing",
    "personal finance India",
    "stock market",
    "crypto trading",
    "forex",
    "mutual funds",
    "SIP calculator",
    "financial literacy",
  ],
  authors: [{ name: "FinanceHub" }],
  creator: "FinanceHub",
  publisher: "FinanceHub",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: "FinanceHub",
    title: "FinanceHub - World-Class Finance Education",
    description: "Master finance through lessons, AI tutoring, and live simulators.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FinanceHub - Finance Education Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FinanceHub - World-Class Finance Education",
    description: "Master finance through lessons, AI tutoring, and live simulators.",
    images: ["/og-image.png"],
    creator: "@financehub_in",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png" }],
    shortcut: [{ url: "/icon.svg" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F4EE" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sourceSerif.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {supabaseUrl ? <link rel="preconnect" href={supabaseUrl} /> : null}
        {posthogKey ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+" (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
                posthog.init('${posthogKey}', { api_host: '${posthogHost}' });
              `,
            }}
          />
        ) : null}
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <ThemeProvider>
          <div id="main-content">{children}</div>
          <PWAContainer />
        </ThemeProvider>

        <div id="modal-root" />
      </body>
    </html>
  );
}
