"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";

export default function AuthCallbackPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      if (typeof window === "undefined") return;

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const next = params.get("next") || "/dashboard";
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

      const err = params.get("error_description") || params.get("error");
      if (err) {
        window.location.href = `/login?error=${encodeURIComponent(err)}`;
        return;
      }

      if (!code) {
        window.location.href = `/login?error=missing_auth_code`;
        return;
      }

      try {
        const client = getBrowserClient();
        const { data, error } = await client.auth.exchangeCodeForSession(code);

        if (error || !data?.session) {
          console.error("Client callback code exchange error:", error);
          setErrorMsg(error?.message || "Authentication code exchange failed");
          setTimeout(() => {
            window.location.href = `/login?error=${encodeURIComponent(error?.message || "auth_failed")}`;
          }, 1500);
          return;
        }

        // Ensure profile exists for this authenticated user before landing on dashboard
        const user = data.session.user;
        if (user) {
          try {
            await (client as any).from("profiles").upsert(
              {
                id: user.id,
                email: user.email,
                full_name:
                  user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  user.email?.split("@")[0] ||
                  "Learner",
                avatar_url:
                  user.user_metadata?.avatar_url ||
                  user.user_metadata?.picture ||
                  null,
                subscription_tier: "free",
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            );
          } catch (profileErr) {
            console.warn("Client profile upsert notice:", profileErr);
          }
        }

        // Successfully authenticated! Seamlessly proceed to destination
        window.location.href = safeNext;
      } catch (e: any) {
        console.error("Auth callback unexpected exception:", e);
        window.location.href = `/login?error=${encodeURIComponent(e?.message || "auth_exception")}`;
      }
    }

    handleAuth();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F8FAFC",
        fontFamily: "var(--font-ui, system-ui, sans-serif)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 20,
          border: "2px solid #E2E8F0",
          padding: "40px",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
          <Logo size="md" href="/" />
        </div>

        {errorMsg ? (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#DC2626", marginBottom: 8 }}>
              Sign-in Notice
            </h2>
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5, marginBottom: 16 }}>
              {errorMsg}. Redirecting to login...
            </p>
          </div>
        ) : (
          <div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "3px solid #EFF6FF",
                borderTopColor: "#2563EB",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 20px",
              }}
            />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#090D16", marginBottom: 6 }}>
              Completing secure sign-in...
            </h2>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
              Connecting your learning streak and dashboard.
            </p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
