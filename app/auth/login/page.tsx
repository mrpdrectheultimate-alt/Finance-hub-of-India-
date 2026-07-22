"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
  };

  const handleForgot = async () => {
    if (!form.email) {
      setError("Enter your email address first.");
      return;
    }

    await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setError("");
    alert(`Password reset email sent to ${form.email}`);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoMark}>F</div>
          <span style={styles.logoText}>FinanceHub</span>
        </div>

        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.sub}>Continue your learning streak.</p>

        <button onClick={handleGoogle} style={styles.googleBtn} type="button">
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 8, flexShrink: 0 }}>
            <path
              fill="#FFC107"
              d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.6 16 19 12 24 12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8L6 33.2C9.4 39.7 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C36.9 36.4 44 30.9 44 24c0-1.3-.1-2.7-.4-3.9z"
            />
          </svg>
          Continue with Google
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or log in with email</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={styles.label}>Email address</label>
            <input
              required
              placeholder="rahul@example.com"
              style={styles.input}
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={styles.label}>Password</label>
              <button onClick={handleForgot} style={styles.forgotBtn} type="button">
                Forgot password?
              </button>
            </div>
            <input
              required
              placeholder="Your password"
              style={styles.input}
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </div>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <button disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }} type="submit">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p style={styles.switchText}>
          No account yet?{" "}
          <Link href="/auth/signup" style={styles.link}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#fafafa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "#fff",
    border: "0.5px solid #e5e5e5",
    borderRadius: 16,
    padding: "36px 32px",
    width: "100%",
    maxWidth: 420,
  },
  logoRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 28 },
  logoMark: {
    width: 28,
    height: 28,
    background: "#1D9E75",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
  },
  logoText: { fontWeight: 600, fontSize: 16, letterSpacing: 0 },
  title: { fontSize: 22, fontWeight: 700, letterSpacing: 0, margin: "0 0 6px", color: "#0a0a0a" },
  sub: { fontSize: 14, color: "#666", margin: "0 0 24px" },
  googleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px 16px",
    fontSize: 14,
    fontWeight: 500,
    border: "0.5px solid #ddd",
    borderRadius: 9,
    background: "#fff",
    cursor: "pointer",
    color: "#333",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  divider: { textAlign: "center", position: "relative", margin: "20px 0", borderTop: "0.5px solid #eee" },
  dividerText: {
    position: "absolute",
    top: -10,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#fff",
    padding: "0 12px",
    fontSize: 12,
    color: "#aaa",
  },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#333" },
  forgotBtn: {
    fontSize: 12,
    color: "#1D9E75",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    fontFamily: "system-ui",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    border: "0.5px solid #ddd",
    borderRadius: 8,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  errorBox: {
    background: "#FEF2F2",
    border: "0.5px solid #FCA5A5",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#B91C1C",
  },
  submitBtn: {
    padding: "12px",
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    borderRadius: 9,
    background: "#1D9E75",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  link: { color: "#1D9E75", textDecoration: "none" },
  switchText: { textAlign: "center", fontSize: 13, color: "#666", marginTop: 20 },
};
