"use client";
// ============================================================
// FinanceHub — ThemeProvider (FIXED v2)
// components/ui/ThemeProvider.tsx
//
// REMOVED: auto track-based theming (was causing color chaos)
// REMOVED: data-theme per-route changes
// KEPT: light / dark / sepia / focus modes only
// FIXED: ModeToggleCompact exported from here (use in Navbar)
// FIXED: Single CSS variable system (data-mode only)
// BACKWARD-COMPAT: Safe static track color map & no-op setTheme
// ============================================================

import {
  createContext, useContext, useEffect,
  useState, useCallback, ReactNode,
} from "react";

export type Mode     = "light" | "dark" | "sepia" | "focus";
export type TextSize = "default" | "large" | "larger";

export type Theme =
  | "default"
  | "personal-finance"
  | "investing"
  | "trading"
  | "crypto"
  | "behavioral"
  | "corporate"
  | "forex"
  | "technical";

export const TRACK_THEMES: Record<string, string> = {
  "personal-finance":   "personal-finance",
  "trading-markets":    "trading",
  "crypto-defi":        "crypto",
  "corporate-finance":  "corporate",
  "behavioral-finance": "behavioral",
  "forex-currency":     "forex",
  "technical-analysis": "technical",
  "investing":          "investing",
};

export const THEME_CONFIG: Record<string, { accent: string; label: string; icon: string }> = {
  "default":          { accent: "#0E6163", label: "FinanceHub",         icon: "📚" },
  "personal-finance": { accent: "#1A7A5A", label: "Personal Finance",   icon: "💰" },
  "investing":        { accent: "#1E3A8A", label: "Investing",          icon: "📈" },
  "trading":          { accent: "#4C55C4", label: "Trading",            icon: "📊" },
  "crypto":           { accent: "#6366F1", label: "Crypto & DeFi",      icon: "₿"  },
  "behavioral":       { accent: "#C95A5A", label: "Behavioral Finance", icon: "🧠" },
  "corporate":        { accent: "#1F7A5A", label: "Corporate Finance",  icon: "🏢" },
  "forex":            { accent: "#0369A1", label: "Forex",              icon: "💱" },
  "technical":        { accent: "#0891B2", label: "Technical Analysis", icon: "📉" },
};

interface ThemeCtx {
  mode:        Mode;
  textSize:    TextSize;
  setMode:     (m: Mode) => void;
  setTextSize: (s: TextSize) => void;
  toggleMode:  () => void;
  theme:       Theme;
  setTheme:    (t: any) => void;
  resetToAuto: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) {
    return {
      mode: "light" as Mode,
      textSize: "default" as TextSize,
      setMode: () => {},
      setTextSize: () => {},
      toggleMode: () => {},
      theme: "default" as Theme,
      setTheme: () => {},
      resetToAuto: () => {},
    };
  }
  return c;
}

// ── Provider ─────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode,     setModeState]     = useState<Mode>("light");
  const [textSize, setTextSizeState] = useState<TextSize>("default");

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("fh_mode") as Mode | null;
      const savedSize = localStorage.getItem("fh_textsize") as TextSize | null;
      if (savedMode && ["light", "dark", "sepia", "focus"].includes(savedMode)) {
        setModeState(savedMode);
      } else {
        setModeState("light");
      }
      if (savedSize && ["default", "large", "larger"].includes(savedSize)) {
        setTextSizeState(savedSize);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    // ONLY data-mode — NO track-based data-theme changes
    root.setAttribute("data-mode", mode);
    root.setAttribute("data-size", textSize);
    root.classList.toggle("dark", mode === "dark");
    document.body.style.background = "var(--mode-bg, #ffffff)";
    document.body.style.color      = "var(--mode-text, #090D16)";
    document.body.style.transition = "background 0.2s ease, color 0.15s ease";
  }, [mode, textSize]);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    try { localStorage.setItem("fh_mode", m); } catch {}
  }, []);

  const setTextSize = useCallback((s: TextSize) => {
    setTextSizeState(s);
    try { localStorage.setItem("fh_textsize", s); } catch {}
  }, []);

  const CYCLE: Mode[] = ["light", "dark", "sepia", "focus"];
  const toggleMode = useCallback(() => {
    setMode(CYCLE[(CYCLE.indexOf(mode) + 1) % CYCLE.length]);
  }, [mode, setMode]);

  const setTheme = useCallback(() => {
    // No-op: page background never changes by track
  }, []);

  const resetToAuto = useCallback(() => {
    // No-op
  }, []);

  return (
    <Ctx.Provider value={{
      mode, textSize, setMode, setTextSize, toggleMode,
      theme: "default", setTheme, resetToAuto,
    }}>
      {children}
    </Ctx.Provider>
  );
}

// ── Full ThemeSwitcher (Settings page) ───────────────────────
export function ThemeSwitcher() {
  const { mode, textSize, setMode, setTextSize } = useTheme();

  const MODES = [
    { id: "light" as Mode, icon: "☀️", label: "Light",  desc: "Clean white — default" },
    { id: "dark"  as Mode, icon: "🌙", label: "Dark",   desc: "Easy on eyes at night" },
    { id: "sepia" as Mode, icon: "📜", label: "Sepia",  desc: "Warm amber — best for reading" },
    { id: "focus" as Mode, icon: "🎯", label: "Focus",  desc: "Minimal — max concentration" },
  ];

  const SIZES = [
    { id: "default" as TextSize, label: "A",  px: 14 },
    { id: "large"   as TextSize, label: "A",  px: 17 },
    { id: "larger"  as TextSize, label: "A",  px: 20 },
  ];

  return (
    <div style={{ fontFamily: "inherit" }}>
      <div style={{
        fontSize: 12, fontWeight: 600, color: "var(--mode-text-3)",
        letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 12,
      }}>
        Display Mode
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {MODES.map(m => {
          const active = mode === m.id;
          return (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{
                padding: "12px", borderRadius: 11, cursor: "pointer",
                fontFamily: "inherit", textAlign: "left" as const,
                border: active ? "2px solid var(--mode-accent)" : "1.5px solid var(--mode-border)",
                background: active ? "var(--mode-bg-active)" : "var(--mode-card-bg, #ffffff)",
                transition: "all 0.15s",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 18 }}>{m.icon}</span>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: active ? "var(--mode-accent)" : "var(--mode-text)",
                }}>
                  {m.label}
                </span>
                {active && (
                  <span style={{
                    marginLeft: "auto", fontSize: 10, fontWeight: 700,
                    color: "var(--mode-accent)", background: "var(--mode-accent-light)",
                    padding: "1px 7px", borderRadius: 9,
                  }}>Active</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "var(--mode-text-3)" }}>{m.desc}</div>
            </button>
          );
        })}
      </div>

      <div style={{
        fontSize: 12, fontWeight: 600, color: "var(--mode-text-3)",
        letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 10,
      }}>
        Text Size
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {SIZES.map(s => {
          const active = textSize === s.id;
          return (
            <button key={s.id} onClick={() => setTextSize(s.id)}
              style={{
                flex: 1, padding: "10px", borderRadius: 9, cursor: "pointer",
                fontFamily: "inherit", textAlign: "center" as const,
                fontSize: s.px, fontWeight: 700,
                border: active ? "2px solid var(--mode-accent)" : "1.5px solid var(--mode-border)",
                background: active ? "var(--mode-bg-active)" : "var(--mode-card-bg, #ffffff)",
                color: active ? "var(--mode-accent)" : "var(--mode-text-2)",
                transition: "all 0.15s",
              }}>
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { ThemeSwitcher as ThemeToggle, ThemeSwitcher as ModeToggle };

// ── ModeToggleCompact — Navbar button ─────────────────────────
export function ModeToggleCompact() {
  const { mode, setMode } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const el = document.getElementById("fh-mode-btn");
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const MODES = [
    { id: "light" as Mode, icon: "☀️", label: "Light"  },
    { id: "dark"  as Mode, icon: "🌙", label: "Dark"   },
    { id: "sepia" as Mode, icon: "📜", label: "Sepia"  },
    { id: "focus" as Mode, icon: "🎯", label: "Focus"  },
  ];

  const icons: Record<Mode, string> = { light: "☀️", dark: "🌙", sepia: "📜", focus: "🎯" };

  return (
    <div id="fh-mode-btn" style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        title={`Mode: ${mode}`}
        style={{
          width: 36, height: 36, borderRadius: 8,
          border: "1px solid var(--mode-border)",
          background: "var(--mode-card-bg, #ffffff)",
          cursor: "pointer", fontSize: 17,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "var(--mode-accent)";
          e.currentTarget.style.background = "var(--mode-bg-hover)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "var(--mode-border)";
          e.currentTarget.style.background = "var(--mode-card-bg, #ffffff)";
        }}>
        {icons[mode]}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "var(--mode-card-bg, #ffffff)",
          border: "1px solid var(--mode-border)",
          borderRadius: 12, padding: 6, minWidth: 155,
          boxShadow: "0 8px 24px rgba(0,0,0,0.14)", zIndex: 999,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: "var(--mode-text-4)",
            letterSpacing: "0.1em", textTransform: "uppercase" as const,
            padding: "5px 10px 7px", borderBottom: "1px solid var(--mode-border)", marginBottom: 4,
          }}>
            Display mode
          </div>
          {MODES.map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setOpen(false); }}
              style={{
                width: "100%", padding: "9px 10px",
                display: "flex", alignItems: "center", gap: 9,
                border: "none", borderRadius: 8, cursor: "pointer",
                fontFamily: "inherit", textAlign: "left" as const,
                background: mode === m.id ? "var(--mode-bg-active)" : "transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (mode !== m.id) e.currentTarget.style.background = "var(--mode-bg-hover)"; }}
              onMouseLeave={e => { if (mode !== m.id) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ fontSize: 16 }}>{m.icon}</span>
              <span style={{
                fontSize: 13, fontWeight: mode === m.id ? 700 : 500,
                color: mode === m.id ? "var(--mode-accent)" : "var(--mode-text-2)",
              }}>
                {m.label}
              </span>
              {mode === m.id && (
                <span style={{ marginLeft: "auto", color: "var(--mode-accent)", fontSize: 14 }}>✓</span>
              )}
            </button>
          ))}
          <div style={{
            borderTop: "1px solid var(--mode-border)", marginTop: 4,
            padding: "6px 10px 2px", fontSize: 10, color: "var(--mode-text-4)",
          }}>
            Applies to entire website
          </div>
        </div>
      )}
    </div>
  );
}
