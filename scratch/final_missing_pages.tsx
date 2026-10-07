// ============================================================
// FinanceHub — Final Missing Pages
// Split on deploy:
//
// RefundPolicyPage   → app/legal/refund/page.tsx
// ResetPasswordPage  → app/reset-password/page.tsx
// CookiePolicyPage   → app/legal/cookies/page.tsx
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Logo         from "@/components/ui/Logo";

// ─────────────────────────────────────────────────────────────
// 1. REFUND POLICY
// app/legal/refund/page.tsx
// ─────────────────────────────────────────────────────────────
export function RefundPolicyPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px", fontFamily: "var(--font-ui,system-ui)" }}>
      <div style={{ marginBottom: 32 }}>
        <a href="/" style={{ textDecoration: "none" }}><Logo size="sm" /></a>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1c2b3a", margin: "0 0 8px", letterSpacing: "-0.4px" }}>
        Refund Policy
      </h1>
      <p style={{ fontSize: 14, color: "#718096", margin: "0 0 32px" }}>
        Last updated: September 2026
      </p>

      {[
        {
          title: "1. Our Refund Commitment",
          body: `FinanceHub offers a 7-day money-back guarantee for first-time subscribers to our Pro or Expert plans. If you are not satisfied with your subscription within 7 days of your first payment, you may request a full refund — no questions asked.

This 7-day guarantee applies only to your first subscription purchase. Renewals, plan upgrades, and repeat subscriptions are not eligible for the money-back guarantee.`,
        },
        {
          title: "2. Eligibility for Refund",
          body: `You are eligible for a refund if:
• You are a first-time subscriber to a paid plan (Pro or Expert)
• Your refund request is submitted within 7 calendar days of your initial payment
• You have not previously received a refund from FinanceHub

You are NOT eligible for a refund if:
• Your subscription has been active for more than 7 days
• You have previously received a refund from FinanceHub
• Your account was terminated due to a violation of our Terms of Service`,
        },
        {
          title: "3. How to Request a Refund",
          body: `To request a refund, email us at support@financehub.in with:
• Your registered email address
• Date of payment
• Payment transaction ID (from your payment confirmation email)
• Brief reason for the refund request (optional but helps us improve)

We will process your refund within 5-7 business days. The amount will be credited to your original payment method (UPI, card, or net banking).`,
        },
        {
          title: "4. Refund Processing Time",
          body: `Once approved, refunds are processed as follows:
• UPI payments: 1-3 business days
• Credit/Debit card: 5-7 business days (depending on your bank)
• Net banking: 3-5 business days
• Razorpay wallet: 1-2 business days

FinanceHub will initiate the refund within 2 business days of approval. Your bank's processing time is outside our control.`,
        },
        {
          title: "5. Subscription Cancellation",
          body: `Cancelling your subscription is different from requesting a refund.

You can cancel your subscription anytime from Settings → Subscription. Cancellation prevents future charges. Your access continues until the end of the current billing period.

Cancellation does not automatically trigger a refund. If you wish to cancel AND receive a refund within the 7-day window, please follow the refund request process above.`,
        },
        {
          title: "6. Annual Subscriptions",
          body: `For annual subscriptions, the 7-day money-back guarantee applies to the first payment. After 7 days, annual subscriptions are non-refundable.

If you switch from monthly to annual billing, the 7-day guarantee does not reset — it applies only to your very first payment with FinanceHub.`,
        },
        {
          title: "7. Free Plan",
          body: `The Free plan has no payment and therefore no refund policy applies. Free plan users can upgrade or downgrade at any time.`,
        },
        {
          title: "8. Contact Us",
          body: `For any questions about this refund policy, contact:
Email: support@financehub.in
Response time: Within 2 business days

Registered address: FinanceHub Education, [Address], India`,
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

      <div style={{ marginTop: 40, padding: "16px 20px", background: "#F7F9F8", border: "1px solid #e5eaf0", borderRadius: 12, fontSize: 13, color: "#718096" }}>
        <strong>Quick links:</strong>{" "}
        <a href="/legal/terms" style={{ color: "#0E6163" }}>Terms of Service</a>{" · "}
        <a href="/legal/privacy" style={{ color: "#0E6163" }}>Privacy Policy</a>{" · "}
        <a href="/legal/disclaimer" style={{ color: "#0E6163" }}>Disclaimer</a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. RESET PASSWORD PAGE
// app/reset-password/page.tsx
// Called after user clicks the email reset link
// ─────────────────────────────────────────────────────────────
export function ResetPasswordPage() {
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState("");
  const [strength,  setStrength]  = useState(0);

  // Supabase puts the recovery token in the URL fragment
  // The onAuthStateChange picks it up automatically
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event: any) => {
      if (event === "PASSWORD_RECOVERY") {
        // User arrived via email link — session is now active
        // They can now submit a new password
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const calcStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8)                        s++;
    if (/[A-Z]/.test(p))                      s++;
    if (/[0-9]/.test(p))                      s++;
    if (/[^A-Za-z0-9]/.test(p))              s++;
    setStrength(s);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8)      { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm)     { setError("Passwords do not match."); return; }
    setLoading(true); setError("");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); }
    else       setDone(true);
  };

  const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
  const STRENGTH_COLORS = ["", "#E53E3E", "#D4A017", "#1D9E75", "#0E6163"];

  return (
    <div style={{
      minHeight: "100vh", background: "#f3f4f6",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: "var(--font-ui,system-ui)",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "36px 40px",
        width: "100%", maxWidth: 420,
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      }}>
        <div style={{ marginBottom: 28 }}><Logo size="md" href="/" /></div>

        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1c2b3a", marginBottom: 8 }}>
              Password updated!
            </h2>
            <p style={{ fontSize: 14, color: "#718096", marginBottom: 24, lineHeight: 1.6 }}>
              Your password has been changed successfully. You can now log in with your new password.
            </p>
            <a href="/login" style={{
              display: "inline-block", padding: "11px 28px",
              background: "#0E6163", color: "#fff",
              borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              Go to Login →
            </a>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>
              Set new password
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>
              Choose a strong password for your FinanceHub account.
            </p>

            <form onSubmit={handleSubmit}>
              {/* New password */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  New password
                </label>
                <input
                  type="password" value={password} autoComplete="new-password"
                  onChange={e => { setPassword(e.target.value); calcStrength(e.target.value); }}
                  placeholder="Min. 8 characters"
                  style={{
                    width: "100%", padding: "10px 14px", border: "1px solid #d1d5db",
                    borderRadius: 9, fontSize: 14, outline: "none",
                    fontFamily: "var(--font-ui,system-ui)", boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#0E6163")}
                  onBlur={e  => (e.target.style.borderColor = "#d1d5db")}
                />
                {/* Strength indicator */}
                {password.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 2,
                          background: i <= strength ? STRENGTH_COLORS[strength] : "#e5e7eb",
                          transition: "background 0.2s",
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: STRENGTH_COLORS[strength], fontWeight: 600 }}>
                      {STRENGTH_LABELS[strength]}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Confirm new password
                </label>
                <input
                  type="password" value={confirm} autoComplete="new-password"
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your new password"
                  style={{
                    width: "100%", padding: "10px 14px",
                    border: `1px solid ${confirm.length > 0 && confirm !== password ? "#E53E3E" : "#d1d5db"}`,
                    borderRadius: 9, fontSize: 14, outline: "none",
                    fontFamily: "var(--font-ui,system-ui)", boxSizing: "border-box",
                  }}
                  onFocus={e  => (e.target.style.borderColor = "#0E6163")}
                  onBlur={e   => (e.target.style.borderColor = confirm !== password ? "#E53E3E" : "#d1d5db")}
                />
                {confirm.length > 0 && confirm !== password && (
                  <div style={{ fontSize: 11, color: "#E53E3E", marginTop: 4 }}>Passwords do not match</div>
                )}
                {confirm.length > 0 && confirm === password && (
                  <div style={{ fontSize: 11, color: "#1D9E75", marginTop: 4 }}>✓ Passwords match</div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "9px 12px", marginBottom: 16 }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading || password !== confirm || password.length < 8}
                style={{
                  width: "100%", padding: "12px",
                  background: loading || password !== confirm || password.length < 8 ? "#9ca3af" : "#0E6163",
                  color: "#fff", border: "none", borderRadius: 10,
                  fontSize: 15, fontWeight: 600,
                  cursor: loading || password !== confirm || password.length < 8 ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-ui,system-ui)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                {loading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Updating…
                  </>
                ) : "Update Password"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280", margin: "16px 0 0" }}>
              <a href="/login" style={{ color: "#0E6163", fontWeight: 600 }}>Back to login</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. COOKIE POLICY
// app/legal/cookies/page.tsx
// ─────────────────────────────────────────────────────────────
export function CookiePolicyPage() {
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