"use client";

import type React from "react";

// ============================================================
// FinanceHub — Financial Disclaimers System
// components/ui/FinanceDisclaimer.tsx
// ============================================================

type DisclaimerType =
  | "general"
  | "investing"
  | "trading"
  | "crypto"
  | "tax"
  | "insurance"
  | "ai"
  | "simulator"
  | "forex";

const DISCLAIMERS: Record<DisclaimerType, { text: string; icon: string }> = {
  general: {
    icon: "ℹ️",
    text: "This content is for educational purposes only and does not constitute financial advice. Consult a SEBI-registered financial advisor before making investment decisions.",
  },
  investing: {
    icon: "📊",
    text: "Past performance does not guarantee future returns. All investments carry risk including potential loss of principal. This is educational content, not investment advice.",
  },
  trading: {
    icon: "⚠️",
    text: "Trading in equities and derivatives involves substantial risk. SEBI data shows 89% of individual F&O traders lose money. This content is educational — not a trading recommendation.",
  },
  crypto: {
    icon: "⚠️",
    text: "Cryptocurrency is highly volatile and largely unregulated. Invest only what you can afford to lose completely. This is educational content, not financial advice.",
  },
  tax: {
    icon: "📋",
    text: "Tax laws change frequently. The information here is based on current rules and may not reflect the latest amendments. Consult a qualified CA for personalised tax advice.",
  },
  insurance: {
    icon: "🛡️",
    text: "Insurance products vary by insurer, age, and health conditions. Compare policies independently and consult an IRDAI-registered advisor before purchasing.",
  },
  ai: {
    icon: "🤖",
    text: "AI responses are educational only and may contain errors. Always verify financial information from official sources (RBI, SEBI, AMFI). This is not personalised financial advice.",
  },
  simulator: {
    icon: "🧮",
    text: "Calculator results are estimates based on assumed rates and conditions. Actual returns may vary significantly. Use these as planning tools, not guarantees.",
  },
  forex: {
    icon: "💱",
    text: "Currency trading involves significant risk. Indian residents may only trade currency derivatives on SEBI-regulated exchanges (NSE/BSE). Offshore forex trading may violate FEMA regulations.",
  },
};

interface FinanceDisclaimerProps {
  type?: DisclaimerType;
  types?: DisclaimerType[]; // Multiple disclaimers
  compact?: boolean; // One-line version
  style?: React.CSSProperties;
}

export function FinanceDisclaimer({
  type = "general",
  types,
  compact = false,
  style,
}: FinanceDisclaimerProps) {
  const disclaimerList = types ? types.map((t) => DISCLAIMERS[t]) : [DISCLAIMERS[type]];

  if (compact) {
    return (
      <div
        style={{
          fontSize: 11,
          color: "#718096",
          padding: "6px 10px",
          background: "#F7FAFC",
          borderLeft: "3px solid #CBD5E0",
          borderRadius: "0 6px 6px 0",
          lineHeight: 1.5,
          fontFamily: "var(--font-ui, system-ui)",
          ...style,
        }}
      >
        ⚠️ {disclaimerList[0].text}
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 20,
        fontFamily: "var(--font-ui, system-ui)",
        ...style,
      }}
    >
      {disclaimerList.map((d, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 8,
            padding: "10px 14px",
            background: "#F7FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 9,
            marginBottom: i < disclaimerList.length - 1 ? 6 : 0,
          }}
        >
          <span style={{ flexShrink: 0, fontSize: 14 }}>{d.icon}</span>
          <p
            style={{
              fontSize: 12,
              color: "#4A5568",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {d.text}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Track-to-disclaimer mapping ─────────────────────────────
export const TRACK_DISCLAIMERS: Record<string, DisclaimerType[]> = {
  "personal-finance": ["general", "tax"],
  "trading-markets": ["investing", "trading"],
  "crypto-defi": ["crypto", "investing"],
  "corporate-finance": ["general", "investing"],
  "behavioral-finance": ["general"],
  "forex-currency": ["forex", "trading"],
  "technical-analysis": ["trading", "investing"],
};

export function TrackDisclaimer({ trackSlug }: { trackSlug: string }) {
  const types = TRACK_DISCLAIMERS[trackSlug] || ["general"];
  return <FinanceDisclaimer types={types} compact />;
}

// ─── AI disclaimer (shown after every AI response) ───────────
export function AIDisclaimer() {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "8px 12px",
        background: "#FFFBEB",
        border: "1px solid #FBD38D",
        borderRadius: 8,
        marginTop: 12,
        fontFamily: "var(--font-ui, system-ui)",
      }}
    >
      <span style={{ flexShrink: 0, fontSize: 13 }}>🤖</span>
      <p style={{ fontSize: 11, color: "#744210", lineHeight: 1.5, margin: 0 }}>
        AI responses are educational only and may contain errors. Always verify from official sources
        (RBI, SEBI, AMFI, Income Tax India). This is not personalised financial or legal advice.
      </p>
    </div>
  );
}

// ─── Simulator disclaimer ─────────────────────────────────────
export function SimulatorDisclaimer({ calculatorName }: { calculatorName: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: "#718096",
        lineHeight: 1.5,
        marginTop: 16,
        padding: "8px 12px",
        background: "#F7FAFC",
        borderRadius: 8,
        fontFamily: "var(--font-ui, system-ui)",
      }}
    >
      🧮 {calculatorName} results are estimates based on your inputs and assumed constant returns.
      Actual market returns vary. Use for planning purposes only. Past market performance does not
      guarantee future returns.
    </div>
  );
}
