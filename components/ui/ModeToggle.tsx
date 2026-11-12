"use client";

import { useState, useEffect } from "react";

// ============================================================
// FinanceHub — ModeToggle (Full Mode Selection for Settings)
// components/ui/ModeToggle.tsx
// ============================================================

export function ModeToggle() {
  const [mode, setModeState] = useState<"light" | "dark" | "sepia" | "focus">("light");

  useEffect(() => {
    const saved = localStorage.getItem("fh_mode") as any;
    if (saved && ["light", "dark", "sepia", "focus"].includes(saved)) {
      setModeState(saved);
    } else {
      setModeState("light");
    }
  }, []);

  const apply = (m: "light" | "dark" | "sepia" | "focus") => {
    setModeState(m);
    localStorage.setItem("fh_mode", m);
    document.documentElement.setAttribute("data-mode", m);
    // Persist to Supabase if logged in
    try {
      fetch("/api/settings/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: m }),
      }).catch(() => {});
    } catch {}
  };

  const MODES = [
    {
      id: "light" as const,
      icon: "☀️",
      label: "Light",
      desc: "Clean white — default",
      preview: { bg: "#FFFFFF", text: "#0B1A2B", accent: "#0E6163" },
    },
    {
      id: "dark" as const,
      icon: "🌙",
      label: "Dark",
      desc: "Deep dark — easy at night",
      preview: { bg: "#0F172A", text: "#F1F5F9", accent: "#4DD9AC" },
    },
    {
      id: "sepia" as const,
      icon: "📜",
      label: "Sepia",
      desc: "Warm amber — best for reading",
      preview: { bg: "#F5F0E8", text: "#2C1A0A", accent: "#7A4F28" },
    },
    {
      id: "focus" as const,
      icon: "🎯",
      label: "Focus",
      desc: "Minimal — max concentration",
      preview: { bg: "#FAFAFA", text: "#1A1A1A", accent: "#0E6163" },
    },
  ];

  return (
    <div style={{ fontFamily: "var(--font-ui,system-ui)" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--mode-text)", marginBottom: 14 }}>
        Reading mode
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {MODES.map((m) => {
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => apply(m.id)}
              style={{
                padding: "14px 14px",
                borderRadius: 12,
                border: isActive ? `2px solid ${m.preview.accent}` : "1.5px solid var(--mode-border)",
                background: isActive ? m.preview.bg : "var(--mode-card-bg)",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "all 0.15s",
                boxShadow: isActive ? `0 0 0 3px ${m.preview.accent}20` : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = m.preview.accent;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = "var(--mode-border)";
              }}
            >
              {/* Mini preview */}
              <div
                style={{
                  width: "100%",
                  height: 32,
                  borderRadius: 6,
                  marginBottom: 10,
                  background: m.preview.bg,
                  border: `1px solid ${m.preview.accent}30`,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "0 8px",
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.preview.accent }} />
                <div style={{ width: 40, height: 5, borderRadius: 3, background: m.preview.text, opacity: 0.4 }} />
                <div style={{ width: 24, height: 5, borderRadius: 3, background: m.preview.text, opacity: 0.2 }} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                <span style={{ fontSize: 16 }}>{m.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? m.preview.accent : "var(--mode-text)" }}>
                  {m.label}
                </span>
                {isActive && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 10,
                      fontWeight: 700,
                      color: m.preview.accent,
                      background: `${m.preview.accent}15`,
                      padding: "1px 7px",
                      borderRadius: 10,
                    }}
                  >
                    Active
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "var(--mode-text-3)", lineHeight: 1.4 }}>{m.desc}</div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 14,
          fontSize: 11,
          color: "var(--mode-text-4)",
          lineHeight: 1.6,
          padding: "10px 12px",
          background: "var(--mode-bg-alt)",
          borderRadius: 9,
          border: "1px solid var(--mode-border)",
        }}
      >
        💡 Your mode preference is saved automatically and applies across all pages and devices.
      </div>
    </div>
  );
}

export default ModeToggle;

