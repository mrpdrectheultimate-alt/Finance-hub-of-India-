"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

// ============================================================
// FinanceHub — PWA Install Prompt + SW Registration
// components/pwa/PWAInstall.tsx
// Shows install prompt on mobile, registers service worker
// ============================================================

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ─── Service worker registration ──────────────────────────────
export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("SW registered:", registration.scope);

      // Check for updates every hour
      setInterval(() => registration.update(), 60 * 60 * 1000);

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New version available — show update banner
            window.dispatchEvent(new CustomEvent("sw-update-available"));
          }
        });
      });
    } catch (err) {
      console.warn("SW registration failed:", err);
    }
  });
}

// ─── Install prompt component ─────────────────────────────────
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show,           setShow]           = useState(false);
  const [platform,       setPlatform]       = useState<"android" | "ios" | "desktop" | null>(null);
  const [dismissed,      setDismissed]      = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Do not show if already accepted or running as installed PWA (standalone)
    if (localStorage.getItem("pwa-install-accepted")) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((window.navigator as any).standalone) return;

    // 2. Check if dismissed recently (suppress for 7 days)
    const dismissedAt = localStorage.getItem("pwa-install-dismissed");
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (!isNaN(elapsed) && elapsed < 7 * 24 * 60 * 60 * 1000) return;
    }

    // 3. Detect platform
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform("ios");
      // On iOS: show manual instructions after 15 seconds
      const timer = setTimeout(() => setShow(true), 15000);
      return () => clearTimeout(timer);
    } else if (/android/.test(ua)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    // 4. Listen for beforeinstallprompt (Chrome / Android / Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 12 seconds
      setTimeout(() => setShow(true), 12000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
        localStorage.setItem("pwa-install-accepted", "true");
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (!show || dismissed) return null;

  return (
    <>
      <style>{`
        @keyframes pwaSlideUpIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (max-width: 640px) {
          .fh-pwa-prompt-box {
            left: 16px !important;
            right: 16px !important;
            bottom: 16px !important;
            max-width: calc(100vw - 32px) !important;
          }
        }
      `}</style>
      <aside
        className="fh-pwa-prompt-box"
        role="region"
        aria-label="Install FinanceHub Web App"
        style={{
          position:       "fixed",
          bottom:         24,
          left:           24,
          width:          "100%",
          maxWidth:       340,
          background:     "linear-gradient(145deg, #101c28 0%, #0c141d 100%)",
          borderRadius:   16,
          padding:        "14px 16px",
          boxShadow:      "0 18px 45px -8px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)",
          zIndex:         9990,
          fontFamily:     "var(--font-ui, system-ui, -apple-system, sans-serif)",
          border:         "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(16px)",
          animation:      "pwaSlideUpIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Top Header Row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
          {/* App icon */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              flexShrink: 0,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#060d14",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src="/app-icon-dark.png"
              alt="FinanceHub"
              width={40}
              height={40}
              style={{ width: 40, height: 40, objectFit: "cover" }}
            />
          </div>

          {/* Title & subtitle */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#ffffff", lineHeight: 1.25, letterSpacing: "-0.2px" }}>
              Install FinanceHub
            </div>
            <div style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.35, marginTop: 2 }}>
              {platform === "ios"
                ? "Tap Share → Add to Home Screen"
                : "Fast, offline-ready & instant access"}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            aria-label="Close install prompt"
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.45)",
              cursor: "pointer",
              fontSize: 16,
              padding: "2px 4px",
              lineHeight: 1,
              transition: "color 0.15s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
          >
            ✕
          </button>
        </div>

        {/* Benefits Micro-Pills */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {[
            { icon: "⚡", label: "2x Faster" },
            { icon: "📴", label: "Offline" },
            { icon: "🔔", label: "Reminders" },
          ].map(badge => (
            <span
              key={badge.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 10.5,
                fontWeight: 500,
                color: "#cbd5e1",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "2px 7px",
                borderRadius: 6,
                letterSpacing: "-0.1px",
              }}
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </span>
          ))}
        </div>

        {/* Action Row */}
        {platform === "ios" ? (
          <div
            style={{
              fontSize: 11.5,
              color: "#34d399",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              padding: "6px 10px",
              borderRadius: 8,
            }}
          >
            <span>Tap</span>
            <span style={{ fontSize: 13 }}>⬆️</span>
            <span>Share → &quot;Add to Home Screen&quot;</span>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleInstall}
              style={{
                flex: 1,
                padding: "7px 12px",
                background: "#0E6163",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(14, 97, 99, 0.4)",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#127678")}
              onMouseLeave={e => (e.currentTarget.style.background = "#0E6163")}
            >
              Install App
            </button>
            <button
              onClick={handleDismiss}
              style={{
                padding: "7px 12px",
                background: "rgba(255,255,255,0.08)",
                color: "#cbd5e1",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            >
              Later
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

// ─── SW Update Banner ─────────────────────────────────────────
export function SWUpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener("sw-update-available", handler);
    return () => window.removeEventListener("sw-update-available", handler);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position:   "fixed",
      top:        16,
      left:       "50%",
      transform:  "translateX(-50%)",
      background: "#1c2b3a",
      color:      "#fff",
      borderRadius: 12,
      padding:    "10px 20px",
      boxShadow:  "0 10px 30px rgba(0,0,0,0.3)",
      zIndex:     9999,
      display:    "flex",
      alignItems: "center",
      gap:        12,
      fontSize:   13,
      fontFamily: "var(--font-ui,system-ui)",
      whiteSpace: "nowrap",
    }}>
      <span>🔄 New version available</span>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "5px 12px", background: "#0E6163", color: "#fff",
          border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
          cursor: "pointer", fontFamily: "var(--font-ui,system-ui)",
        }}>
        Update now
      </button>
      <button onClick={() => setShow(false)}
        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 16, padding: 0 }}>
        ✕
      </button>
    </div>
  );
}

// ─── Offline indicator ────────────────────────────────────────
export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const goOffline = () => setOffline(true);
    const goOnline  = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online",  goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online",  goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div style={{
      position:   "fixed",
      bottom:     0,
      left:       0,
      right:      0,
      background: "#744210",
      color:      "#fff",
      padding:    "10px 20px",
      textAlign:  "center",
      fontSize:   13,
      fontFamily: "var(--font-ui,system-ui)",
      zIndex:     9998,
      display:    "flex",
      alignItems: "center",
      justifyContent: "center",
      gap:        8,
    }}>
      <span>📴</span>
      <span>You&apos;re offline. Your progress will sync when you reconnect.</span>
    </div>
  );
}
