"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { usePathname } from "next/navigation";

export const TRACK_THEMES: Record<string, Theme> = {
  "personal-finance": "personal-finance",
  "trading-markets": "trading",
  "crypto-defi": "crypto",
  "corporate-finance": "corporate",
  "behavioral-finance": "behavioral",
  "forex-currency": "forex",
  "technical-analysis": "technical",
  investing: "investing",
};

const ROUTE_THEMES: { pattern: RegExp; theme: Theme }[] = [
  { pattern: /\/track\/personal-finance/, theme: "personal-finance" },
  { pattern: /\/track\/trading-markets/, theme: "trading" },
  { pattern: /\/track\/crypto-defi/, theme: "crypto" },
  { pattern: /\/track\/corporate-finance/, theme: "corporate" },
  { pattern: /\/track\/behavioral-finance/, theme: "behavioral" },
  { pattern: /\/track\/forex-currency/, theme: "forex" },
  { pattern: /\/track\/technical-analysis/, theme: "technical" },
  { pattern: /\/simulators/, theme: "trading" },
  { pattern: /\/practice/, theme: "trading" },
  { pattern: /\/library/, theme: "personal-finance" },
  { pattern: /\/career/, theme: "investing" },
  { pattern: /\/admin/, theme: "default" },
  { pattern: /\/pricing/, theme: "default" },
];

export type Mode = "light" | "dark" | "sepia";
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

type ThemeContextValue = {
  theme: Theme;
  mode: Mode;
  textSize: TextSize;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
  setTextSize: (size: TextSize) => void;
  toggleMode: () => void;
  resetToAuto: () => void;
  isAutoTheme: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const THEME_CONFIG: Record<Theme, { accent: string; label: string; icon: string }> = {
  default: { accent: "#0E6163", label: "FinanceHub", icon: "FH" },
  "personal-finance": { accent: "#1A7A5A", label: "Personal Finance", icon: "PF" },
  investing: { accent: "#1E3A8A", label: "Investing", icon: "IN" },
  trading: { accent: "#4C55C4", label: "Trading", icon: "TR" },
  crypto: { accent: "#6366F1", label: "Crypto and DeFi", icon: "CR" },
  behavioral: { accent: "#C95A5A", label: "Behavioral Finance", icon: "BF" },
  corporate: { accent: "#1F7A5A", label: "Corporate Finance", icon: "CF" },
  forex: { accent: "#0369A1", label: "Forex", icon: "FX" },
  technical: { accent: "#0891B2", label: "Technical Analysis", icon: "TA" },
};

function getAutoTheme(pathname: string | null): Theme {
  for (const routeTheme of ROUTE_THEMES) {
    if (routeTheme.pattern.test(pathname || "")) return routeTheme.theme;
  }
  return "default";
}

function isMode(value: string | null): value is Mode {
  return value === "light" || value === "dark" || value === "sepia";
}

function isTextSize(value: string | null): value is TextSize {
  return value === "default" || value === "large" || value === "larger";
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mode, setModeState] = useState<Mode>("light");
  const [textSize, setTextSizeState] = useState<TextSize>("default");
  const [manualTheme, setManualTheme] = useState<Theme | null>(null);

  const autoTheme = getAutoTheme(pathname);
  const theme = manualTheme || autoTheme;
  const isAutoTheme = manualTheme === null;

  useEffect(() => {
    const savedMode = localStorage.getItem("fh_mode");
    const savedSize = localStorage.getItem("fh_textsize");

    if (isMode(savedMode)) {
      setModeState(savedMode);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setModeState("dark");
    }

    if (isTextSize(savedSize)) setTextSizeState(savedSize);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-mode", mode);
    root.setAttribute("data-size", textSize);

    if (mode === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme, mode, textSize]);

  const setMode = useCallback((nextMode: Mode) => {
    setModeState(nextMode);
    localStorage.setItem("fh_mode", nextMode);
  }, []);

  const setTextSize = useCallback((nextSize: TextSize) => {
    setTextSizeState(nextSize);
    localStorage.setItem("fh_textsize", nextSize);
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    setManualTheme(nextTheme);
  }, []);

  const resetToAuto = useCallback(() => {
    setManualTheme(null);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "dark" ? "light" : mode === "light" ? "sepia" : "light");
  }, [mode, setMode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, textSize, setTheme, setMode, setTextSize, toggleMode, resetToAuto, isAutoTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { mode, textSize, setMode, setTextSize } = useTheme();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? 8 : 12, flexWrap: "wrap" }}>
      <div style={s.modeToggle}>
        {[
          { id: "light" as const, label: "Light", short: "LT" },
          { id: "sepia" as const, label: "Reading", short: "RD" },
          { id: "dark" as const, label: "Dark", short: "DK" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            title={`${item.label} mode`}
            style={{ ...s.modeBtn, ...(mode === item.id ? s.modeBtnActive : {}) }}
            type="button"
          >
            <span style={s.shortLabel}>{item.short}</span>
            {!compact ? <span style={s.buttonLabel}>{item.label}</span> : null}
          </button>
        ))}
      </div>

      {!compact ? (
        <div style={s.sizeToggle}>
          {[
            { id: "default" as const, label: "A", fontSize: 13 },
            { id: "large" as const, label: "A", fontSize: 15 },
            { id: "larger" as const, label: "A", fontSize: 17 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTextSize(item.id)}
              title={`Text size: ${item.id}`}
              style={{ ...s.sizeBtn, fontSize: item.fontSize, ...(textSize === item.id ? s.sizeBtnActive : {}) }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ThemeToggle() {
  const { mode, toggleMode } = useTheme();
  const label = mode === "dark" ? "Dark" : mode === "sepia" ? "Read" : "Light";

  return (
    <button onClick={toggleMode} title={`Theme mode: ${label}. Click to cycle.`} style={s.toggleButton} type="button">
      <span style={s.shortLabel}>{label}</span>
    </button>
  );
}

const s: Record<string, CSSProperties> = {
  modeToggle: {
    display: "flex",
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: 3,
    gap: 2,
  },
  modeBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 10px",
    border: "none",
    borderRadius: "var(--radius-sm)",
    background: "transparent",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontFamily: "var(--font-ui)",
    transition: "all 0.15s",
  },
  modeBtnActive: {
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    boxShadow: "var(--shadow-xs)",
  },
  sizeToggle: {
    display: "flex",
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: 3,
    gap: 2,
  },
  sizeBtn: {
    padding: "4px 10px",
    border: "none",
    borderRadius: "var(--radius-sm)",
    background: "transparent",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontFamily: "var(--font-ui)",
    fontWeight: 700,
    transition: "all 0.15s",
    lineHeight: 1.2,
  },
  sizeBtnActive: {
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    boxShadow: "var(--shadow-xs)",
  },
  toggleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 52,
    padding: "6px 10px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    fontFamily: "var(--font-ui)",
    fontSize: 12,
    fontWeight: 700,
    transition: "all 0.15s",
  },
  shortLabel: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.04em",
  },
  buttonLabel: {
    fontSize: 11,
    fontWeight: 600,
  },
};
