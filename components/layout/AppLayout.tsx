"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ui/ThemeProvider";
import GlobalSearch from "@/components/layout/GlobalSearch";

const NAV_ITEMS = [
  { icon: "DB", label: "Dashboard", href: "/dashboard", group: "Learn" },
  { icon: "EX", label: "Explore", href: "/explore", group: "Learn" },
  { icon: "LIB", label: "Library", href: "/library", group: "Learn" },
  { icon: "SIM", label: "Simulators", href: "/simulators", group: "Practice" },
  { icon: "PR", label: "Practice", href: "/practice", group: "Practice" },
  { icon: "AI", label: "AI Tutor", href: "/ai-tutor", group: "Practice" },
  { icon: "EXM", label: "Practice Exam", href: "/ai-exam", group: "Practice" },
  { icon: "MAP", label: "Roadmap", href: "/roadmap", group: "Practice" },
  { icon: "CR", label: "Career Hub", href: "/career", group: "Community" },
  { icon: "LB", label: "Leaderboard", href: "/leaderboard", group: "Community" },
  { icon: "PF", label: "Profile", href: "/profile", group: "Community" },
];

const BOTTOM_NAV = [
  { icon: "DB", label: "Home", href: "/dashboard" },
  { icon: "EX", label: "Learn", href: "/explore" },
  { icon: "SIM", label: "Practice", href: "/simulators" },
  { icon: "LIB", label: "Library", href: "/library" },
  { icon: "PF", label: "Profile", href: "/profile" },
];

type ProfileSummary = {
  role: string;
  xp_total: number;
  full_name: string | null;
  streak_current: number;
};

type AppLayoutProps = {
  children: ReactNode;
  userRole?: string;
  userName?: string;
  userXP?: number;
};

export default function AppLayout({ children, userRole = "free", userName = "", userXP = 0 }: AppLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("role, xp_total, full_name, streak_current")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (mounted && data) setProfile(data);
        });
    });

    return () => {
      mounted = false;
    };
  }, []);

  const role = profile?.role || userRole;
  const xp = profile?.xp_total ?? userXP;
  const name = profile?.full_name || userName;
  const streak = profile?.streak_current || 0;
  const initials = (name || "User").slice(0, 1).toUpperCase();

  const isActive = (href: string) => {
    const cleanHref = href.split("?")[0];
    return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <div style={s.root}>
      {isMobile && sidebarOpen ? <div onClick={() => setSidebarOpen(false)} style={s.overlay} /> : null}

      <aside
        style={{
          ...s.sidebar,
          transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        }}
      >
        <div style={s.logoWrap}>
          <Link href="/dashboard" style={s.logo}>
            <div style={s.logoIcon}>F</div>
            <span style={s.logoText}>FinanceHub</span>
          </Link>
          {isMobile ? (
            <button onClick={() => setSidebarOpen(false)} style={s.closeBtn} type="button">
              Close
            </button>
          ) : null}
        </div>

        <div style={s.userCard}>
          <div style={s.userAvatar}>{initials}</div>
          <div style={s.userInfo}>
            <div style={s.userName}>{name || "Welcome"}</div>
            <div style={s.userMeta}>
              {streak > 0 ? <span style={s.streakPill}>{streak}d streak</span> : null}
              <span style={s.xpPill}>{xp.toLocaleString()} XP</span>
              {role !== "free" ? <span style={s.rolePill}>{role}</span> : null}
            </div>
          </div>
        </div>

        <nav style={s.nav}>
          {["Learn", "Practice", "Community"].map((group) => (
            <div key={group} style={s.navSection}>
              <div style={s.navSectionLabel}>{group}</div>
              {NAV_ITEMS.filter((item) => item.group === group).map((item) => (
                <NavItem key={item.href} item={item} active={isActive(item.href)} />
              ))}
            </div>
          ))}
        </nav>

        {role === "free" ? (
          <div style={s.upgradeCard}>
            <div style={s.upgradeTitle}>Upgrade to Pro</div>
            <div style={s.upgradeSub}>Unlimited AI tutor, all content, notes downloads, and advanced labs.</div>
            <Link href="/pricing" style={s.upgradeBtn}>
              Rs 499/month
            </Link>
          </div>
        ) : null}

        <div style={s.sidebarFooter}>
          <Link href="/profile" style={s.settingsLink}>
            Settings
          </Link>
          <button onClick={signOut} style={s.signOutBtn} type="button">
            Sign out
          </button>
        </div>
      </aside>

      <div style={{ ...s.main, marginLeft: isMobile ? 0 : 240 }}>
        {isMobile ? (
          <div style={s.mobileTopBar}>
            <button onClick={() => setSidebarOpen(true)} style={s.hamburger} type="button">
              Menu
            </button>
            <Link href="/dashboard" style={s.mobileLogoLink}>
              <div style={s.mobileLogoIcon}>F</div>
              <span style={s.mobileLogoText}>FinanceHub</span>
            </Link>
            <ThemeToggle />
          </div>
        ) : (
          <div style={s.desktopTopBar}>
            <GlobalSearch />
            <div style={s.topBarRight}>
              {streak > 0 ? <div style={s.topStreak}>{streak}d streak</div> : null}
              <div style={s.topXP}>{xp.toLocaleString()} XP</div>
              {role === "free" ? (
                <Link href="/pricing" style={s.topUpgradeBtn}>
                  Upgrade
                </Link>
              ) : null}
              <ThemeToggle />
              <Link href="/profile" style={s.topAvatar}>
                {initials}
              </Link>
            </div>
          </div>
        )}

        <main style={{ ...s.content, paddingBottom: isMobile ? 72 : 24 }}>{children}</main>

        {isMobile ? (
          <nav style={s.bottomNav}>
            {BOTTOM_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} style={s.bottomNavItem}>
                  <span style={{ ...s.bottomNavIcon, color: active ? "#1D9E75" : "#999" }}>{item.icon}</span>
                  <span style={{ ...s.bottomNavLabel, color: active ? "#1D9E75" : "#999", fontWeight: active ? 700 : 500 }}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </div>
  );
}

function NavItem({ item, active }: { item: (typeof NAV_ITEMS)[0]; active: boolean }) {
  return (
    <Link
      href={item.href}
      style={{
        ...s.navItem,
        color: active ? "#22C48E" : "rgba(255,255,255,0.58)",
        background: active ? "rgba(29,158,117,0.15)" : "transparent",
        fontWeight: active ? 700 : 500,
      }}
    >
      <span style={s.navIcon}>{item.icon}</span>
      <span style={s.navLabel}>{item.label}</span>
      {active ? <div style={s.activeDot} /> : null}
    </Link>
  );
}

const s: Record<string, CSSProperties> = {
  root: { display: "flex", minHeight: "100vh", background: "var(--bg-page,#fafafa)", fontFamily: "var(--font-sans,system-ui,-apple-system,sans-serif)" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 90, backdropFilter: "blur(2px)" },
  sidebar: { width: 240, background: "#0a0a0a", display: "flex", flexDirection: "column", position: "fixed", height: "100vh", zIndex: 100, transition: "transform .25s ease", overflowY: "auto" },
  logoWrap: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 16px 14px" },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" },
  logoIcon: { width: 28, height: 28, background: "#1D9E75", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 },
  logoText: { fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "-0.3px" },
  closeBtn: { color: "#777", background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: 4, fontFamily: "system-ui" },
  userCard: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)", marginBottom: 8 },
  userAvatar: { width: 32, height: 32, borderRadius: "50%", background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 12, fontWeight: 600, color: "#ddd", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  userMeta: { display: "flex", gap: 4, flexWrap: "wrap" },
  streakPill: { fontSize: 9, color: "#FAC775", background: "rgba(250,199,117,0.15)", padding: "1px 5px", borderRadius: 8 },
  xpPill: { fontSize: 9, color: "#aaa", background: "rgba(255,255,255,0.07)", padding: "1px 5px", borderRadius: 8 },
  rolePill: { fontSize: 9, color: "#22C48E", background: "rgba(34,196,142,0.12)", padding: "1px 5px", borderRadius: 8, textTransform: "capitalize" },
  nav: { flex: 1, padding: "0 10px", overflow: "hidden" },
  navSection: { marginBottom: 16 },
  navSectionLabel: { fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.24)", textTransform: "uppercase", letterSpacing: ".1em", padding: "4px 12px 6px" },
  navItem: { display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 8, fontSize: 13, textDecoration: "none", marginBottom: 2, transition: "all .15s" },
  navIcon: { width: 26, fontSize: 10, fontWeight: 800, flexShrink: 0, letterSpacing: ".02em" },
  navLabel: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  activeDot: { width: 4, height: 4, borderRadius: "50%", background: "#22C48E", marginLeft: "auto", flexShrink: 0 },
  upgradeCard: { margin: "8px 10px", background: "linear-gradient(135deg,rgba(29,158,117,0.2),rgba(29,158,117,0.08))", border: "0.5px solid rgba(29,158,117,0.3)", borderRadius: 10, padding: "13px 14px" },
  upgradeTitle: { fontSize: 12, fontWeight: 700, color: "#22C48E", marginBottom: 3 },
  upgradeSub: { fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 10 },
  upgradeBtn: { display: "block", textAlign: "center", padding: "7px", background: "#1D9E75", color: "#fff", borderRadius: 7, fontSize: 11, fontWeight: 700, textDecoration: "none" },
  sidebarFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px 20px", borderTop: "0.5px solid rgba(255,255,255,0.06)", marginTop: "auto" },
  settingsLink: { fontSize: 11, color: "#777", textDecoration: "none" },
  signOutBtn: { fontSize: 11, color: "#777", background: "none", border: "none", cursor: "pointer", fontFamily: "system-ui" },
  main: { flex: 1, display: "flex", flexDirection: "column", transition: "margin-left .25s ease", minWidth: 0 },
  mobileTopBar: { height: 52, background: "var(--bg-card,#fff)", borderBottom: "0.5px solid var(--border,#eee)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", position: "sticky", top: 0, zIndex: 50 },
  hamburger: { fontSize: 13, background: "none", border: "none", cursor: "pointer", color: "var(--text-primary,#0a0a0a)", fontWeight: 700, padding: 4, fontFamily: "system-ui" },
  mobileLogoLink: { display: "flex", alignItems: "center", gap: 6, textDecoration: "none" },
  mobileLogoIcon: { width: 24, height: 24, background: "#1D9E75", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12 },
  mobileLogoText: { fontWeight: 700, fontSize: 14, color: "var(--text-primary,#0a0a0a)" },
  desktopTopBar: { height: 52, background: "var(--bg-card,#fff)", borderBottom: "0.5px solid var(--border,#eee)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "0 22px", position: "sticky", top: 0, zIndex: 50 },
  topBarRight: { display: "flex", alignItems: "center", gap: 10 },
  topStreak: { fontSize: 12, fontWeight: 600, color: "#854F0B" },
  topXP: { fontSize: 12, fontWeight: 600, color: "#534AB7" },
  topUpgradeBtn: { padding: "6px 12px", background: "#1D9E75", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 11, fontWeight: 700 },
  topAvatar: { width: 30, height: 30, borderRadius: "50%", background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, textDecoration: "none" },
  content: { flex: 1, overflowY: "auto" },
  bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, height: 60, background: "var(--bg-card,#fff)", borderTop: "0.5px solid var(--border,#eee)", display: "flex", alignItems: "center", zIndex: 50, paddingBottom: "env(safe-area-inset-bottom)" },
  bottomNavItem: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, textDecoration: "none", padding: "6px 4px" },
  bottomNavIcon: { fontSize: 10, fontWeight: 800 },
  bottomNavLabel: { fontSize: 9 },
};
