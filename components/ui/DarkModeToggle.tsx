"use client";

// ============================================================
// FinanceHub — Dark Mode Toggle
// components/ui/DarkModeToggle.tsx
// Add anywhere in the UI — settings page, navbar, dashboard
// Works with ThemeProvider (already built)
// ============================================================

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function DarkModeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">("light");

  useEffect(() => {
    const saved = localStorage.getItem("fh-theme") as "light"|"dark"|"sepia" | null;
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initial = saved || system;
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const applyTheme = (t: "light" | "dark" | "sepia") => {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("fh-theme", t);
    // Update meta theme-color for mobile browser chrome
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", t === "dark" ? "#0B1A2B" : t === "sepia" ? "#f5f0e8" : "#ffffff");
    }
  };

  const toggle = (t: "light" | "dark" | "sepia") => {
    setTheme(t);
    applyTheme(t);
    // Persist to Supabase profile if logged in
    supabase.auth.getUser().then(({ data: { user } }: any) => {
      if (user) {
        supabase.from("profiles").update({ theme: t }).eq("id", user.id);
      }
    });
  };

  if (compact) {
    // Simple icon cycle for navbar
    const icons: Record<string, string> = { light:"☀️", dark:"🌙", sepia:"📜" };
    const next: Record<string, "light"|"dark"|"sepia"> = { light:"dark", dark:"sepia", sepia:"light" };
    return (
      <button
        onClick={() => toggle(next[theme])}
        title={`Switch to ${next[theme]} mode`}
        aria-label="Toggle theme mode"
        style={{
          width:34, height:34, borderRadius:9, border:"1px solid #e2e8f0",
          background:"transparent", cursor:"pointer", fontSize:16,
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all 0.15s",
        }}
        onMouseEnter={e=>(e.currentTarget.style.background="#f8fafc")}
        onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
        {icons[theme]}
      </button>
    );
  }

  // Full toggle for settings page
  const THEMES: Array<{ id:"light"|"dark"|"sepia"; icon:string; label:string; desc:string }> = [
    { id:"light", icon:"☀️", label:"Light",  desc:"Clean white — default" },
    { id:"dark",  icon:"🌙", label:"Dark",   desc:"Easy on the eyes at night" },
    { id:"sepia", icon:"📜", label:"Sepia",  desc:"Warm tone for reading" },
  ];

  return (
    <div style={{ fontFamily:"var(--font-ui,system-ui)" }}>
      <div style={{ fontSize:13, fontWeight:600, color:"#1c2b3a", marginBottom:10 }}>
        Theme
      </div>
      <div style={{ display:"flex", gap:10 }}>
        {THEMES.map(t => (
          <button key={t.id} onClick={() => toggle(t.id)}
            type="button"
            style={{
              flex:1, padding:"12px 10px", textAlign:"center",
              border: theme===t.id ? "2px solid #0E6163" : "1px solid #e2e8f0",
              borderRadius:12, background: theme===t.id ? "#F0F9F7" : "#fafafa",
              cursor:"pointer", fontFamily:"inherit",
              transition:"all 0.15s",
            }}
            onMouseEnter={e=>{ if(theme!==t.id){ e.currentTarget.style.borderColor="#9ca3af"; }}}
            onMouseLeave={e=>{ if(theme!==t.id){ e.currentTarget.style.borderColor="#e2e8f0"; }}}>
            <div style={{ fontSize:22, marginBottom:6 }}>{t.icon}</div>
            <div style={{ fontSize:12, fontWeight:theme===t.id?700:500, color:theme===t.id?"#0E6163":"#374151" }}>
              {t.label}
            </div>
            <div style={{ fontSize:10, color:"#9ca3af", marginTop:2, lineHeight:1.4 }}>{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DarkModeToggle;
