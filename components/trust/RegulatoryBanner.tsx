"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegulatoryBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div style={s.banner}>
      <div style={s.content}>
        <span style={s.icon}>⚠️</span>
        <span style={s.text}>
          <strong>Educational Platform Only:</strong> FinanceHub is not a SEBI-registered advisor. Content is for learning purposes only, not financial advice.
        </span>
        <Link href="/legal/disclaimer" style={s.link}>
          Read Disclaimers →
        </Link>
      </div>
      <button onClick={() => setVisible(false)} style={s.closeBtn} aria-label="Close disclaimer">
        ✕
      </button>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  banner: {
    background: "#FFFBEB",
    borderBottom: "1px solid #FCD34D",
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#92400E",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  content: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  icon: {
    fontSize: "14px",
  },
  text: {
    lineHeight: "1.4",
  },
  link: {
    color: "#B45309",
    fontWeight: 700,
    textDecoration: "underline",
    marginLeft: "4px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#92400E",
    cursor: "pointer",
    fontSize: "14px",
    padding: "2px 6px",
  },
};
