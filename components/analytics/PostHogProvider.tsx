"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

    if (!key) return;

    posthog.init(key, {
      api_host: host,
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: false,
      persistence: "localStorage",
      disable_session_recording: process.env.NODE_ENV !== "production",
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug();
      },
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function PostHogPageView() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === prevPath.current) return;
    prevPath.current = pathname;

    posthog.capture("$pageview", { $current_url: window.location.href });
  }, [pathname]);

  return null;
}
