"use client";

import { useState } from "react";
import Link from "next/link";

interface AdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicName?: string;
}

export default function AdvisorDisclaimerModal({ isOpen, onClose, topicName = "High-Risk Derivatives / Trading" }: AdvisorModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.header}>
          <span style={s.warnIcon}>⚠️</span>
          <h3 style={s.title}>Educational Risk Disclosure</h3>
        </div>

        <p style={s.body}>
          You are about to access educational content on <strong>{topicName}</strong>.
          <br /><br />
          SEBI statistics reveal that <strong>89% of individual traders in F&O derivatives lose money</strong>.
          This tool is for conceptual understanding only and does NOT constitute trade calls or financial advice.
        </p>

        <div style={s.checkboxRow}>
          <input
            type="checkbox"
            id="ack"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            style={s.checkbox}
          />
          <label htmlFor="ack" style={s.label}>
            I understand this is educational software, not trading or investment advice.
          </label>
        </div>

        <div style={s.actions}>
          <Link href="/legal/disclaimer" style={s.secondaryBtn}>
            View Disclaimer Policy
          </Link>
          <button
            onClick={() => {
              if (acknowledged) onClose();
            }}
            disabled={!acknowledged}
            style={{
              ...s.primaryBtn,
              opacity: acknowledged ? 1 : 0.5,
              cursor: acknowledged ? "pointer" : "not-allowed",
            }}
          >
            Proceed to Lesson
          </button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  modal: {
    background: "#FFFFFF",
    borderRadius: "16px",
    maxWidth: "500px",
    width: "100%",
    padding: "24px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
  },
  warnIcon: {
    fontSize: "24px",
  },
  title: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#111827",
    margin: 0,
  },
  body: {
    fontSize: "14px",
    color: "#4B5563",
    lineHeight: "1.6",
    marginBottom: "18px",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    background: "#F9FAFB",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  checkbox: {
    marginTop: "2px",
    cursor: "pointer",
  },
  label: {
    fontSize: "12px",
    color: "#374151",
    lineHeight: "1.4",
  },
  actions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  secondaryBtn: {
    padding: "10px 14px",
    fontSize: "13px",
    color: "#6B7280",
    textDecoration: "none",
    fontWeight: 600,
  },
  primaryBtn: {
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#FFFFFF",
    background: "#0F766E",
    border: "none",
    borderRadius: "8px",
  },
};
