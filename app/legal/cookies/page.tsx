"use client";
import Logo from "@/components/ui/Logo";

export default function CookiePolicyPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px", fontFamily: "var(--font-ui,system-ui)" }}>
      <div style={{ marginBottom: 32 }}>
        <a href="/" style={{ textDecoration: "none" }}><Logo size="sm" /></a>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1c2b3a", margin: "0 0 8px", letterSpacing: "-0.4px" }}>
        Cookie Policy
      </h1>
      <p style={{ fontSize: 14, color: "#718096", margin: "0 0 32px" }}>Last updated: September 2026</p>

      {[
        {
          title: "1. What Are Cookies",
          body: `Cookies are small text files placed on your device when you visit a website. They help websites remember your preferences and understand how you use them.

FinanceHub uses cookies and similar technologies (local storage, session storage) to provide our service.`,
        },
        {
          title: "2. Cookies We Use",
          body: `Essential cookies (always active):
• Authentication: Keeps you logged in during your session
• CSRF protection: Security cookies to prevent cross-site request forgery
• Preferences: Your selected theme (light/dark/sepia), language preference

Analytics cookies (optional — you can disable):
• PostHog analytics: Understanding how you use the platform to improve it
• We use anonymised, aggregated data only

We do NOT use advertising cookies or sell data to third parties.`,
        },
        {
          title: "3. Managing Cookies",
          body: `You can control cookies through your browser settings. Note that disabling essential cookies may break login and core functionality.

In your FinanceHub account Settings → Privacy, you can disable analytics cookies.

Most modern browsers allow you to:
• View cookies stored
• Delete individual or all cookies
• Block cookies from specific sites
• Block third-party cookies`,
        },
        {
          title: "4. Local Storage",
          body: `FinanceHub uses browser local storage for:
• Offline lesson caching (PWA feature)
• UI preferences (sidebar state, expanded sections)
• Draft quiz answers (so you don't lose progress if you reload)

Local storage data stays on your device and is not transmitted to our servers.`,
        },
        {
          title: "5. Contact",
          body: `Questions about our cookie policy: privacy@financehub.in`,
        },
      ].map((section, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1c2b3a", margin: "0 0 10px" }}>
            {section.title}
          </h2>
          <div style={{ fontSize: 14, color: "#526173", lineHeight: 1.8, whiteSpace: "pre-line" }}>
            {section.body}
          </div>
        </div>
      ))}
    </div>
  );
}
