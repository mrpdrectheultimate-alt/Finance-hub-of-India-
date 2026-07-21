"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Profile = {
  id: string;
  full_name: string | null;
  role: "free" | "pro" | "expert";
};

export default function PaymentSuccessPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const emailSentRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const poll = async (attempt = 0) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", user.id)
        .single();

      if (cancelled) return;
      setProfile(prof as Profile | null);

      if (prof?.role === "pro" || prof?.role === "expert") {
        setVerified(true);
        setLoading(false);

        if (!emailSentRef.current) {
          emailSentRef.current = true;
          const { data: { session } } = await supabase.auth.getSession();
          await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ type: "welcome_pro", userId: user.id }),
          });
        }
        return;
      }

      if (attempt < 10) {
        window.setTimeout(() => void poll(attempt + 1), 1000);
      } else {
        setLoading(false);
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.spinner} />
          <h2 style={s.loadTitle}>Activating your Pro account...</h2>
          <p style={s.loadSub}>This takes a few seconds. Please do not close this page.</p>
          <div style={s.dots}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ ...s.dot, animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.pendingIcon}>...</div>
          <h2 style={s.title}>Payment received!</h2>
          <p style={s.sub}>Your account upgrade is processing. It can take up to 2 minutes. Refresh your dashboard in a moment.</p>
          <Link href="/dashboard" style={s.primaryBtn}>Go to dashboard</Link>
          <p style={s.helpText}>
            If your account does not upgrade within 5 minutes, email us at{" "}
            <a href="mailto:hello@financehub.in" style={{ color: "#1D9E75" }}>hello@financehub.in</a>
          </p>
        </div>
      </div>
    );
  }

  const isExpert = profile?.role === "expert";
  const features = isExpert
    ? [
        "All lessons across every track",
        "Advanced trading strategies",
        "Corporate and founder finance",
        "Live trading simulator",
        "Unlimited AI tutor",
        "Mock interview prep",
        "Certificates on completion",
        "Priority support",
      ]
    : [
        "Full intermediate content",
        "Unlimited AI tutor questions",
        "Exam prep: CFA L1, FRM, CA",
        "Certificates on track completion",
        "Ad-free experience",
      ];

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.celebrationIcon}>Success</div>
        <div style={s.planBadge}>{isExpert ? "Expert" : "Pro"} member</div>
        <h1 style={s.title}>Welcome to {isExpert ? "Expert" : "Pro"}!</h1>
        <p style={s.sub}>
          Hi {profile?.full_name?.split(" ")[0] || "there"}, your account is now fully upgraded.
          Everything is unlocked.
        </p>

        <div style={s.unlockedBox}>
          <div style={s.unlockedTitle}>You just unlocked</div>
          {features.map((feature) => (
            <div key={feature} style={s.unlockedItem}>
              <span style={s.checkGreen}>✓</span> {feature}
            </div>
          ))}
        </div>

        <Link href="/explore" style={s.primaryBtn}>
          Start learning - all tracks unlocked
        </Link>
        <Link href="/dashboard" style={s.ghostBtn}>
          Go to dashboard
        </Link>

        <p style={s.helpText}>
          Questions? Email <a href="mailto:hello@financehub.in" style={{ color: "#1D9E75" }}>hello@financehub.in</a>
          {" · "}Manage subscription from <Link href="/profile" style={{ color: "#1D9E75" }}>your profile</Link>
        </p>
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui,-apple-system,sans-serif" },
  card: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 16, padding: "40px 36px", maxWidth: 460, width: "100%", textAlign: "center" },
  spinner: { width: 48, height: 48, border: "3px solid #eee", borderTop: "3px solid #1D9E75", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 0.8s linear infinite" },
  loadTitle: { fontSize: 20, fontWeight: 700, color: "#0a0a0a", margin: "0 0 8px", letterSpacing: "-0.4px" },
  loadSub: { fontSize: 14, color: "#888", margin: "0 0 20px" },
  dots: { display: "flex", gap: 6, justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#1D9E75", animation: "bounce 1s infinite" },
  pendingIcon: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, background: "#FFF8E6", color: "#854F0B", borderRadius: 12, fontWeight: 800, marginBottom: 16 },
  celebrationIcon: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px 14px", background: "#E1F5EE", color: "#0F6E56", borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 14 },
  planBadge: { display: "inline-block", background: "#E1F5EE", color: "#0F6E56", fontSize: 13, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 14 },
  title: { fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", color: "#0a0a0a", margin: "0 0 10px" },
  sub: { fontSize: 15, color: "#555", lineHeight: 1.6, margin: "0 0 24px" },
  unlockedBox: { background: "#F8FEFB", border: "0.5px solid #9FE1CB", borderRadius: 12, padding: "16px 20px", marginBottom: 24, textAlign: "left" },
  unlockedTitle: { fontWeight: 600, fontSize: 13, color: "#0F6E56", marginBottom: 10 },
  unlockedItem: { fontSize: 13, color: "#444", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 },
  checkGreen: { color: "#1D9E75", fontWeight: 700, flexShrink: 0 },
  primaryBtn: { display: "block", padding: "13px 24px", background: "#1D9E75", color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600, marginBottom: 10 },
  ghostBtn: { display: "block", padding: "11px 24px", border: "0.5px solid #ddd", color: "#555", borderRadius: 10, textDecoration: "none", fontSize: 13, marginBottom: 20 },
  helpText: { fontSize: 12, color: "#aaa", lineHeight: 1.6 },
};
