"use client";

import { useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase";

/**
 * AuthSessionHandler
 * Global safety net for Supabase OAuth and magic link authentication.
 *
 * 1. Automatically intercepts OAuth `?code=` query param on ANY route (including `/`)
 *    and seamlessly redirects to `/api/auth/callback` to establish secure session cookies.
 * 2. Automatically intercepts `#access_token=` hash fragments (when Supabase returns implicit tokens)
 *    and sets the session in the client, then redirects to `/dashboard`.
 * 3. Listens to `onAuthStateChange` so that when a user logs in, any active login/signup
 *    tab redirects directly to `/dashboard`.
 */
export function AuthSessionHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    const client = getBrowserClient();

    // ── 1. If OAuth code is at root or non-callback route, forward to callback handler ──
    if (
      search.includes("code=") &&
      !pathname.startsWith("/api/auth/callback") &&
      !pathname.startsWith("/auth/callback")
    ) {
      const params = new URLSearchParams(search);
      const code = params.get("code");
      const next = params.get("next") || "/dashboard";
      if (code) {
        window.location.href = `/api/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`;
        return;
      }
    }

    // ── 2. If Hash fragment contains access_token, let Supabase parse and establish session ──
    if (hash.includes("access_token=") || hash.includes("refresh_token=")) {
      client.auth.getSession().then(({ data: { session }, error }: any) => {
        if (session && !error) {
          // If we are on root, login, or signup, smoothly navigate to dashboard
          if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
            window.location.href = "/dashboard";
          }
        }
      });
    }

    // ── 3. Listen to auth state transitions ──
    const { data: listener } = client.auth.onAuthStateChange((event: string, session: any) => {
      if (event === "SIGNED_IN" && session) {
        if (pathname === "/login" || pathname === "/signup") {
          window.location.href = "/dashboard";
        }
      }
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  return null;
}
