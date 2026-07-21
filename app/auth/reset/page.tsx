"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoRow}>
          <div style={s.logoMark}>F</div>
          <span style={s.logoText}>FinanceHub</span>
        </div>

        {!sent ? (
          <>
            <h1 style={s.title}>Reset your password</h1>
            <p style={s.sub}>Enter your email and we will send a reset link.</p>
            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={s.label}>Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="rahul@example.com"
                  style={s.input}
                />
              </div>
              {error ? <div style={s.errorBox}>{error}</div> : null}
              <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        ) : (
          <div style={s.successBox}>
            <div style={s.successTitle}>Check your email</div>
            <p style={s.successDesc}>
              We sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
            </p>
          </div>
        )}

        <p style={s.footer}>
          Remembered it?{" "}
          <Link href="/auth/login" style={s.link}>
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui,-apple-system,sans-serif" },
  card: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 400 },
  logoRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 28 },
  logoMark: { width: 28, height: 28, background: "#1D9E75", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 },
  logoText: { fontWeight: 600, fontSize: 16, letterSpacing: 0 },
  title: { fontSize: 22, fontWeight: 700, letterSpacing: 0, margin: "0 0 6px", color: "#0a0a0a" },
  sub: { fontSize: 14, color: "#666", margin: "0 0 24px" },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#333", marginBottom: 5 },
  input: { width: "100%", padding: "10px 12px", fontSize: 14, border: "0.5px solid #ddd", borderRadius: 8, outline: "none", boxSizing: "border-box", fontFamily: "system-ui" },
  errorBox: { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#B91C1C" },
  btn: { padding: 12, fontSize: 14, fontWeight: 600, border: "none", borderRadius: 9, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  successBox: { background: "#E1F5EE", border: "0.5px solid #9FE1CB", borderRadius: 12, padding: "28px 20px", textAlign: "center" },
  successTitle: { fontWeight: 600, fontSize: 16, color: "#04342C", marginBottom: 8 },
  successDesc: { fontSize: 14, color: "#0F6E56", lineHeight: 1.6, margin: 0 },
  footer: { textAlign: "center", fontSize: 13, color: "#666", marginTop: 20 },
  link: { color: "#1D9E75", textDecoration: "none" },
};
