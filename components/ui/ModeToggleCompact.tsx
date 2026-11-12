"use client";

import { useState, useEffect } from "react";

// ============================================================
// FinanceHub — ModeToggleCompact (Navbar & Header Display Toggle)
// components/ui/ModeToggleCompact.tsx
// ============================================================

export function ModeToggleCompact() {
  const [mode, setModeState] = useState<"light" | "dark" | "sepia" | "focus">("light");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fh_mode") as any;
    if (saved && ["light", "dark", "sepia", "focus"].includes(saved)) {
      setModeState(saved);
    } else {
      setModeState("light");
    }

    // Close on outside click
    const handler = (e: MouseEvent) => {
      const el = document.getElementById("fh-mode-toggle");
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const apply = (m: "light" | "dark" | "sepia" | "focus") => {
    setModeState(m);
    setOpen(false);
    localStorage.setItem("fh_mode", m);
    document.documentElement.setAttribute("data-mode", m);
    try {
      fetch("/api/settings/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: m }),
      }).catch(() => {});
    } catch {}
  };

  const ICONS: Record<string, string> = {
    light: "☀️",
    dark: "🌙",
    sepia: "📜",
    focus: "🎯",
  };

  const MODES = [
    { id: "light" as const, icon: "☀️", label: "Light", color: "#0E6163" },
    { id: "dark" as const, icon: "🌙", label: "Dark", color: "#4DD9AC" },
    { id: "sepia" as const, icon: "📜", label: "Sepia", color: "#7A4F28" },
    { id: "focus" as const, icon: "🎯", label: "Focus", color: "#0E6163" },
  ];

  return (
    <div id="fh-mode-toggle" style={{ position: "relative" }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        type="button"
        title={`Mode: ${mode} — click to change`}
        aria-label="Toggle display mode"
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          border: "1px solid var(--mode-border)",
          background: "var(--mode-card-bg)",
          cursor: "pointer",
          fontSize: 17,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          color: "var(--mode-text)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--mode-border-focus)";
          e.currentTarget.style.background = "var(--mode-bg-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--mode-border)";
          e.currentTarget.style.background = "var(--mode-card-bg)";
        }}
      >
        {ICONS[mode] || "☀️"}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "var(--mode-card-bg)",
            border: "1px solid var(--mode-border)",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: 8,
            minWidth: 160,
            zIndex: 200,
            animation: "fadeDown 0.15s ease",
          }}
        >
          <style>{`
            @keyframes fadeDown {
              from { opacity:0; transform:translateY(-6px); }
              to   { opacity:1; transform:translateY(0); }
            }
          `}</style>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--mode-text-4)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "6px 10px 8px",
              borderBottom: "1px solid var(--mode-border)",
              marginBottom: 4,
            }}
          >
            Display mode
          </div>
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => apply(m.id)}
              style={{
                width: "100%",
                padding: "9px 10px",
                display: "flex",
                alignItems: "center",
                gap: 9,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                background: mode === m.id ? `${m.color}12` : "transparent",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => {
                if (mode !== m.id) e.currentTarget.style.background = "var(--mode-bg-hover)";
              }}
              onMouseLeave={(e) => {
                if (mode !== m.id) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 16 }}>{m.icon}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: mode === m.id ? 700 : 500,
                  color: mode === m.id ? m.color : "var(--mode-text-2)",
                }}
              >
                {m.label}
              </span>
              {mode === m.id && (
                <span style={{ marginLeft: "auto", fontSize: 16, color: m.color }}>✓</span>
              )}
            </button>
          ))}

          <div style={{ borderTop: "1px solid var(--mode-border)", marginTop: 4, padding: "8px 10px 2px" }}>
            <div style={{ fontSize: 10, color: "var(--mode-text-4)", lineHeight: 1.5 }}>
              Saved automatically · applies everywhere
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModeToggleCompact;

