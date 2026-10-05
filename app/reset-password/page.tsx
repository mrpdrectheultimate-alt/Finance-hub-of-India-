"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User arrived via email link — session is now active
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const calcStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    setStrength(s);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); }
    else setDone(true);
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
                  onBlur={e => (e.target.style.borderColor = "#d1d5db")}
                />
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
                  onFocus={e => (e.target.style.borderColor = "#0E6163")}
                  onBlur={e => (e.target.style.borderColor = confirm !== password ? "#E53E3E" : "#d1d5db")}
                />
                {confirm.length > 0 && confirm !== password && (
                  <div style={{ fontSize: 11, color: "#E53E3E", marginTop: 4 }}>Passwords do not match</div>
                )}
                {confirm.length > 0 && confirm === password && (
                  <div style={{ fontSize: 11, color: "#1D9E75", marginTop: 4 }}>✓ Passwords match</div>
                )}
              </div>

              {error && (
                <div style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "9px 12px", marginBottom: 16 }}>
                  {error}
                </div>
              )}

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
