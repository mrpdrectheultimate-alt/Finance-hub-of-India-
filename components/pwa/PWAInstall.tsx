"use client";
import { useState, useEffect } from "react";

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
    // Check if already dismissed
    if (localStorage.getItem("pwa-install-dismissed")) return;

    // Detect platform
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setPlatform("ios");
    else if (/android/.test(ua))      setPlatform("android");
    else                              setPlatform("desktop");

    // Listen for beforeinstallprompt (Chrome/Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 30 seconds of use
      setTimeout(() => setShow(true), 30000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS: show manual instructions after delay if not installed
    if (/iphone|ipad|ipod/.test(ua)) {
      const isStandalone = (window.navigator as any).standalone;
      if (!isStandalone) {
        setTimeout(() => setShow(true), 60000); // Show after 1 minute on iOS
      }
    }

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
    <div style={{
      position:    "fixed",
      bottom:      80,
      left:        16,
      right:       16,
      background:  "#1c2b3a",
      borderRadius: 16,
      padding:     "16px 18px",
      boxShadow:   "0 20px 60px rgba(0,0,0,0.3)",
      zIndex:      9999,
      fontFamily:  "var(--font-ui,system-ui)",
      border:      "1px solid rgba(255,255,255,0.1)",
      animation:   "slide-up 0.3s ease-out",
    }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* App icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 12, flexShrink: 0,
          background: "linear-gradient(135deg, #0E6163, #1D9E75)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28,
        }}>
          📚
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 }}>
            Install FinanceHub
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: 12 }}>
            {platform === "ios"
              ? "Tap Share → 'Add to Home Screen' for the best experience"
              : "Add to your home screen — works offline, loads instantly"
            }
          </div>

          {/* Benefits */}
          <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
            {[
              { icon: "⚡", text: "Faster" },
              { icon: "📴", text: "Offline" },
              { icon: "🔔", text: "Reminders" },
            ].map(b => (
              <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                <span>{b.icon}</span> {b.text}
              </div>
            ))}
          </div>

          {/* Actions */}
          {platform === "ios" ? (
            <div style={{ fontSize: 12, color: "#1D9E75", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <span>Tap</span>
              <span style={{ fontSize: 16 }}>⬆️</span>
              <span>Share → Add to Home Screen</span>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleInstall}
                style={{
                  flex: 1, padding: "9px", background: "#0E6163", color: "#fff",
                  border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "var(--font-ui,system-ui)",
                }}>
                Install App
              </button>
              <button onClick={handleDismiss}
                style={{
                  padding: "9px 14px", background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)", border: "none", borderRadius: 9,
                  fontSize: 13, cursor: "pointer", fontFamily: "var(--font-ui,system-ui)",
                }}>
                Later
              </button>
            </div>
          )}
        </div>

        <button onClick={handleDismiss}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, padding: 0, flexShrink: 0 }}>
          ✕
        </button>
      </div>
    </div>
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
