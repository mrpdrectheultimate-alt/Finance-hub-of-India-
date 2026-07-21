"use client";

import type { CSSProperties } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={s.page}>
      <div style={s.logoMark}>F</div>
      <h1 style={s.title}>Something went wrong</h1>
      <p style={s.desc}>
        FinanceHub hit an unexpected error. Try again, or head back to the homepage.
      </p>
      {error?.digest && <p style={s.digest}>Error ID: {error.digest}</p>}
      <div style={s.actions}>
        <button type="button" onClick={reset} style={s.primaryBtn}>Try again</button>
        <a href="/" style={s.ghostBtn}>Back to home</a>
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,-apple-system,sans-serif", padding: 24, background: "#fafafa", textAlign: "center" },
  logoMark: { width: 52, height: 52, background: "#1D9E75", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 24, marginBottom: 28 },
  title: { fontSize: 26, fontWeight: 700, color: "#0a0a0a", margin: "0 0 10px", letterSpacing: "-0.5px" },
  desc: { fontSize: 15, color: "#888", maxWidth: 420, lineHeight: 1.6, margin: "0 0 14px" },
  digest: { fontSize: 12, color: "#aaa", margin: "0 0 28px" },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" },
  primaryBtn: { padding: "12px 24px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  ghostBtn: { padding: "12px 24px", border: "0.5px solid #ddd", color: "#555", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 500 },
};
