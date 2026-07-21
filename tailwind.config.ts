import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", "[data-mode='dark']"],
  theme: {
    extend: {
      fontFamily: {
        ui: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        reading: ["Source Serif 4", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "Fira Code", "monospace"],
      },
      colors: {
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-light": "var(--accent-light)",
        "accent-muted": "var(--accent-muted)",
        accent2: "var(--accent2)",

        canvas: {
          light: "#F7F4EE",
          warm: "#F6F0E4",
          dark: "#111827",
        },

        ink: {
          light: "#1C2B3A",
          warm: "#2C1C0A",
          dark: "#F0EDE8",
          muted: "#718096",
        },

        teal: { DEFAULT: "#0E6163", light: "#E6F3F3", hover: "#0A4A4C" },
        sage: { DEFAULT: "#1A7A5A", light: "#E4F4EC", hover: "#135E44" },
        navy: { DEFAULT: "#1E3A8A", light: "#E8EEF8", hover: "#162D6E" },
        indigo: { DEFAULT: "#4C55C4", light: "#ECEEFF", hover: "#3A43B0" },
        violet: { DEFAULT: "#6366F1", light: "#EEEEFF", hover: "#4F52DC" },
        rose: { DEFAULT: "#C95A5A", light: "#FAE8E8", hover: "#B04848" },
        emerald: { DEFAULT: "#1F7A5A", light: "#E6F4EC", hover: "#175E44" },
        ocean: { DEFAULT: "#0369A1", light: "#E6F2FA", hover: "#025080" },
        cyan: { DEFAULT: "#0891B2", light: "#E4F4FA", hover: "#067090" },
        gold: { DEFAULT: "#C9963C", light: "#FDF3E3", hover: "#A87A28" },
        amber: { DEFAULT: "#D39A21", light: "#FDF6E3", hover: "#B07A10" },
      },
      spacing: {
        "18": "72px",
        "22": "88px",
        sidebar: "240px",
        topbar: "54px",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "28px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.05)",
        sm: "0 1px 4px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        md: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        lg: "0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)",
        xl: "0 16px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)",
        "accent-glow": "0 0 0 4px var(--accent-light)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)",
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "fade-in-fast": "fadeInFast 0.2s ease-out forwards",
        "xp-enter": "xpEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        shimmer: "shimmer 1.5s infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInFast: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        xpEnter: {
          "0%": { opacity: "0", transform: "translateY(-12px) scale(0.9)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      maxWidth: {
        reading: "68ch",
        content: "1080px",
        wide: "1280px",
        narrow: "720px",
      },
      screens: {
        xs: "375px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      lineHeight: {
        "relaxed-reading": "1.85",
        comfortable: "1.75",
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.025em",
        tight: "-0.015em",
        label: "0.06em",
        overline: "0.10em",
      },
    },
  },
  plugins: [],
};

export default config;
