"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";

// ============================================================
// FinanceHub — Global Navbar
// components/layout/Navbar.tsx
// Auth-aware · Sticky · Mobile hamburger · XP display
// ============================================================

type Profile = {
  full_name:         string;
  subscription_tier: string;
  xp_total:          number;
  current_streak:    number;
  avatar_url:        string | null;
};

export default function Navbar() {
  const [user,       setUser]       = useState<any>(null);
  const [profile,    setProfile]    = useState<Profile | null>(null);
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu,   setUserMenu]   = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }: any) => {
      setUser(u);
      if (u) {
        supabase.from("profiles")
          .select("full_name,subscription_tier,xp_total,current_streak,avatar_url")
          .eq("id", u.id).single()
          .then(({ data }: any) => setProfile(data));
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_: any, session: any) => {
      setUser(session?.user || null);
    });
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const TIER_BADGE: Record<string, { label: string; color: string; bg: string }> = {
    pro:    { label: "Pro",    color: "#185FA5", bg: "#EBF8FF" },
    expert: { label: "Expert", color: "#553C9A", bg: "#FAF5FF" },
    free:   { label: "Free",   color: "#718096", bg: "#F7FAFC" },
  };
  const tier = TIER_BADGE[profile?.subscription_tier || "free"];

  const NAV_LINKS = [
    { label: "Explore",     href: "/explore" },
    { label: "Finance Lab", href: "/practice" },
    { label: "Library",     href: "/library" },
    { label: "AI Mentor",   href: "/ai-tutor" },
    { label: "Site Map",    href: "/sitemap-guide" },
  ];

  return (
    <>
      <nav style={{
        position:       "sticky",
        top:            0,
        zIndex:         200,
        background:     scrolled ? "rgba(255,255,255,0.97)" : "#ffffff",
        borderBottom:   `1px solid ${scrolled ? "#e5eaf0" : "#f0f0f0"}`,
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition:     "all 0.25s",
        fontFamily:     "var(--font-ui, system-ui)",
      }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto",
          padding: "0 24px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          height: 60,
        }}>

          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: "linear-gradient(135deg,#0E6163,#1D9E75)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(14,97,99,0.3)",
            }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="2"  y="10" width="3" height="8"  rx="1" fill="rgba(255,255,255,0.6)"/>
                <rect x="7"  y="6"  width="3" height="12" rx="1" fill="rgba(255,255,255,0.8)"/>
                <rect x="12" y="2"  width="3" height="16" rx="1" fill="#fff"/>
                <path d="M2 12 L7 8 L12 4 L17 2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <circle cx="17" cy="2" r="1.5" fill="#fff"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px", color: "#0B1A2B", lineHeight: 1 }}>
                Finance<span style={{ color: "#0E6163" }}>Hub</span>
              </div>
              <div style={{ fontSize: 8, fontWeight: 600, color: "#a0aec0", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1 }}>
                of India
              </div>
            </div>
          </a>

          {/* Desktop nav links */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}
            className="hide-on-mobile">
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href}
                style={{
                  padding: "6px 12px", fontSize: 13, fontWeight: 500,
                  color: "#526173", borderRadius: 8, textDecoration: "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#F7F9F8";
                  e.currentTarget.style.color = "#0B1A2B";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#526173";
                }}>
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <DarkModeToggle compact />

            {/* Streak (logged in) */}
            {profile && profile.current_streak > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 10px", background: "#FFFFF0",
                border: "1px solid #FBD38D", borderRadius: 20,
                fontSize: 12, fontWeight: 700, color: "#D4A017",
              }}>
                🔥 {profile.current_streak}
              </div>
            )}

            {user ? (
              /* Logged-in user menu */
              <div style={{ position: "relative" }}>
                <button onClick={() => setUserMenu(v => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "5px 10px", background: "#F7F9F8",
                    border: "1px solid #e5eaf0", borderRadius: 10,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                  {/* Avatar */}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg,#0E6163,#1D9E75)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#fff",
                    overflow: "hidden",
                  }}>
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                      : (profile?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()
                    }
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0B1A2B", lineHeight: 1 }}>
                      {profile?.full_name?.split(" ")[0] || "Account"}
                    </div>
                    <div style={{ fontSize: 10, color: "#a0aec0", lineHeight: 1, marginTop: 1 }}>
                      ⭐ {(profile?.xp_total || 0).toLocaleString("en-IN")} XP
                    </div>
                  </div>
                  {/* Tier badge */}
                  {profile && (
                    <span style={{
                      fontSize: 9, fontWeight: 700,
                      color: tier.color, background: tier.bg,
                      padding: "1px 6px", borderRadius: 8,
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      {tier.label}
                    </span>
                  )}
                  <span style={{ fontSize: 10, color: "#a0aec0" }}>▾</span>
                </button>

                {/* Dropdown */}
                {userMenu && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setUserMenu(false)} />
                    <div style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0,
                      background: "#fff", border: "1px solid #e5eaf0",
                      borderRadius: 12, padding: "6px", zIndex: 100,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                      minWidth: 200,
                    }}>
                      {[
                        { label: "📊 Dashboard",      href: "/dashboard" },
                        { label: "📖 My Learning",    href: "/explore" },
                        { label: "🏆 Certificates",   href: "/certificates" },
                        { label: "📝 Notes",          href: "/notes" },
                        { label: "🗺️ Knowledge Map",  href: "/knowledge-map" },
                        { label: "⚙️ Settings",       href: "/settings" },
                      ].map(item => (
                        <a key={item.href} href={item.href}
                          style={{
                            display: "block", padding: "9px 12px",
                            fontSize: 13, color: "#1c2b3a",
                            textDecoration: "none", borderRadius: 8,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#F7F9F8")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          {item.label}
                        </a>
                      ))}

                      {profile?.subscription_tier === "free" && (
                        <a href="/pricing" style={{
                          display: "block", padding: "9px 12px", margin: "4px 0",
                          fontSize: 13, fontWeight: 600, color: "#0E6163",
                          background: "#F0F9F7", borderRadius: 8, textDecoration: "none",
                        }}>
                          💎 Upgrade to Pro
                        </a>
                      )}

                      <div style={{ borderTop: "1px solid #f0f0f0", margin: "4px 0" }} />
                      <button onClick={handleSignOut}
                        style={{
                          width: "100%", padding: "9px 12px", textAlign: "left",
                          fontSize: 13, color: "#E53E3E", background: "transparent",
                          border: "none", borderRadius: 8, cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#FFF5F5")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Guest CTAs */
              <>
                <a href="/login"
                  style={{
                    padding: "7px 14px", fontSize: 13, fontWeight: 500,
                    color: "#526173", border: "1px solid #e5eaf0",
                    borderRadius: 8, textDecoration: "none",
                  }}>
                  Log in
                </a>
                <a href="/signup"
                  style={{
                    padding: "7px 16px", fontSize: 13, fontWeight: 600,
                    background: "#0B1A2B", color: "#fff",
                    borderRadius: 8, textDecoration: "none",
                  }}>
                  Start free
                </a>
              </>
            )}

            {/* Hamburger — mobile */}
            <button onClick={() => setMobileOpen(v => !v)}
              style={{
                display: "none", padding: "6px 8px",
                background: "transparent", border: "1px solid #e5eaf0",
                borderRadius: 8, cursor: "pointer",
                flexDirection: "column", gap: 4,
              }}
              className="show-on-mobile">
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 18, height: 2, background: "#526173", borderRadius: 1 }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            borderTop: "1px solid #f0f0f0",
            background: "#fff",
            padding: "12px 24px 20px",
          }}>
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href}
                style={{
                  display: "block", padding: "11px 0",
                  fontSize: 15, fontWeight: 500, color: "#0B1A2B",
                  textDecoration: "none",
                  borderBottom: "1px solid #f5f5f5",
                }}>
                {link.label}
              </a>
            ))}
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              {user ? (
                <>
                  <a href="/dashboard" style={{ flex: 1, textAlign: "center", padding: "10px", background: "#0E6163", color: "#fff", borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Dashboard</a>
                  <button onClick={handleSignOut} style={{ flex: 1, padding: "10px", background: "#f7fafc", color: "#E53E3E", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Sign out</button>
                </>
              ) : (
                <>
                  <a href="/login" style={{ flex: 1, textAlign: "center", padding: "10px", background: "#f7fafc", color: "#0B1A2B", border: "1px solid #e5eaf0", borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Log in</a>
                  <a href="/signup" style={{ flex: 1, textAlign: "center", padding: "10px", background: "#0B1A2B", color: "#fff", borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Start free</a>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* CSS for mobile */}
      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-on-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
