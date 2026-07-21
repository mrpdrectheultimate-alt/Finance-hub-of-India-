"use client";

import Link from "next/link";

interface PremiumGateProps {
  lessonTitle: string;
}

export default function PremiumGate({ lessonTitle }: PremiumGateProps) {
  return (
    <div style={s.wrap}>
      <div style={s.blurredPreview}>
        <div style={s.fakeLine} />
        <div style={{ ...s.fakeLine, width: "75%" }} />
        <div style={{ ...s.fakeLine, width: "90%" }} />
        <div style={{ ...s.fakeLine, width: "60%" }} />
        <div style={{ ...s.fakeLine, width: "85%" }} />
        <div style={{ ...s.fakeLine, width: "70%" }} />
      </div>

      <div style={s.gate}>
        <div style={s.lockIcon}>🔒</div>
        <h2 style={s.gateTitle}>This lesson is for Pro members</h2>
        <p style={s.gateSub}>
          <strong>&quot;{lessonTitle}&quot;</strong> is part of the intermediate track. Upgrade to unlock this and all
          advanced content.
        </p>

        <div style={s.featureList}>
          {[
            "✓ Full beginner + intermediate content",
            "✓ Unlimited AI tutor questions",
            "✓ Exam prep modules (CFA, FRM, CA)",
            "✓ Certificates on track completion",
            "✓ Advanced trading strategies",
            "✓ Ad-free experience",
          ].map((feature, index) => (
            <div key={index} style={s.feature}>
              {feature}
            </div>
          ))}
        </div>

        <Link href="/pricing" style={s.upgradeBtn}>
          Upgrade to Pro — ₹499/mo
        </Link>

        <div style={s.trialNote}>7-day free trial · Cancel anytime</div>

        <Link href="/dashboard" style={s.backLink}>
          ← Back to free content
        </Link>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { position: "relative", minHeight: 500, display: "flex", alignItems: "center", justifyContent: "center" },
  blurredPreview: { position: "absolute", inset: 0, padding: "40px 48px", filter: "blur(6px)", opacity: 0.4, pointerEvents: "none" },
  fakeLine: { height: 14, background: "#ddd", borderRadius: 4, marginBottom: 14, width: "100%" },
  gate: {
    position: "relative",
    background: "#fff",
    border: "0.5px solid #e5e5e5",
    borderRadius: 16,
    padding: "36px 32px",
    maxWidth: 420,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
    zIndex: 1,
  },
  lockIcon: { fontSize: 40, marginBottom: 14 },
  gateTitle: { fontSize: 20, fontWeight: 700, color: "#0a0a0a", margin: "0 0 10px", letterSpacing: 0 },
  gateSub: { fontSize: 14, color: "#555", lineHeight: 1.6, margin: "0 0 20px" },
  featureList: { display: "flex", flexDirection: "column", gap: 8, textAlign: "left", marginBottom: 24 },
  feature: { fontSize: 13, color: "#444", padding: "0 4px" },
  upgradeBtn: {
    display: "block",
    padding: "13px",
    fontSize: 15,
    fontWeight: 600,
    background: "#1D9E75",
    color: "#fff",
    borderRadius: 10,
    textDecoration: "none",
    marginBottom: 10,
  },
  trialNote: { fontSize: 12, color: "#aaa", marginBottom: 16 },
  backLink: { fontSize: 13, color: "#888", textDecoration: "none" },
};
