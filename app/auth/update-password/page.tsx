"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoRow}>
          <div style={s.logo}>F</div>
          <span style={s.brand}>FinanceHub</span>
        </div>

        {done ? (
          <div style={s.success}>
            <h1 style={s.title}>Password updated</h1>
            <p style={s.sub}>You can now log in with your new password.</p>
            <Link href="/auth/login" style={s.btn}>Go to login</Link>
          </div>
        ) : (
          <>
            <h1 style={s.title}>Set a new password</h1>
            <p style={s.sub}>Enter a new password for your FinanceHub account.</p>
            <form onSubmit={handleSubmit} style={s.form}>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="New password"
                required
                style={s.input}
              />
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Confirm password"
                required
                style={s.input}
              />
              {error ? <div style={s.error}>{error}</div> : null}
              <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui,-apple-system,sans-serif" },
  card: { width: "100%", maxWidth: 400, background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 16, padding: "34px 30px" },
  logoRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 24 },
  logo: { width: 28, height: 28, borderRadius: 7, background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 },
  brand: { fontWeight: 700, fontSize: 15 },
  title: { fontSize: 22, fontWeight: 700, margin: "0 0 6px", color: "#0a0a0a" },
  sub: { fontSize: 14, color: "#666", margin: "0 0 22px", lineHeight: 1.5 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { width: "100%", padding: "11px 12px", border: "0.5px solid #ddd", borderRadius: 8, fontSize: 14, boxSizing: "border-box" },
  error: { background: "#FEF2F2", border: "0.5px solid #FCA5A5", color: "#B91C1C", borderRadius: 8, padding: "10px 12px", fontSize: 13 },
  btn: { display: "block", textAlign: "center", padding: "12px", border: "none", borderRadius: 9, background: "#1D9E75", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", cursor: "pointer" },
  success: { textAlign: "center" },
};
