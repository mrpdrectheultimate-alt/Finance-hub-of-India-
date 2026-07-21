import Link from "next/link";
import type { CSSProperties } from "react";

export default function NotFound() {
  return (
    <div style={s.page}>
      <div style={s.logoMark}>F</div>
      <h1 style={s.code}>404</h1>
      <h2 style={s.title}>Page not found</h2>
      <p style={s.desc}>
        This page does not exist, but your finance education journey does.
      </p>
      <div style={s.actions}>
        <Link href="/dashboard" style={s.primaryBtn}>Go to dashboard</Link>
        <Link href="/" style={s.ghostBtn}>Back to home</Link>
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,-apple-system,sans-serif", padding: 24, background: "#fafafa", textAlign: "center" },
  logoMark: { width: 52, height: 52, background: "#1D9E75", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 24, marginBottom: 28 },
  code: { fontSize: 80, fontWeight: 800, color: "#eee", letterSpacing: "-4px", margin: "0 0 -12px", lineHeight: 1 },
  title: { fontSize: 24, fontWeight: 700, color: "#0a0a0a", margin: "0 0 10px", letterSpacing: "-0.5px" },
  desc: { fontSize: 15, color: "#888", maxWidth: 380, lineHeight: 1.6, margin: "0 0 32px" },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" },
  primaryBtn: { padding: "12px 24px", background: "#1D9E75", color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600 },
  ghostBtn: { padding: "12px 24px", border: "0.5px solid #ddd", color: "#555", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 500 },
};
