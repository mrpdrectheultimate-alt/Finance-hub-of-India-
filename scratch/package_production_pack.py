import os
import zipfile

outputs_dir = r'c:\Users\lpk naidu\OneDrive\Desktop\Finance ed hub\outputs'
prod_pack_path = os.path.join(outputs_dir, 'FinanceHub_Production_Pack.zip')

# Combine PostHogProvider + analytics into outputs/analytics.tsx
analytics_tsx_path = os.path.join(outputs_dir, 'analytics.tsx')

analytics_content = '''"use client";
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

export type AnalyticsEvent =
  | "lesson_started"
  | "lesson_completed"
  | "quiz_started"
  | "quiz_completed"
  | "quiz_passed"
  | "quiz_failed"
  | "track_started"
  | "track_completed"
  | "simulator_opened"
  | "ai_question_asked"
  | "certificate_earned"
  | "signup_completed"
  | "subscription_started"
  | "subscription_cancelled"
  | "search_performed"
  | "video_played"
  | "note_created"
  | "streak_achieved"
  | "badge_earned"
  | "sitemap_persona_clicked"
  | "sitemap_section_expanded";

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

export function track(event: AnalyticsEvent, properties?: EventProperties) {
  try {
    if (typeof window === "undefined") return;
    if (!(posthog as any).__loaded) return;
    posthog.capture(event, properties);
  } catch {}
}

export function identify(userId: string, traits?: EventProperties) {
  try {
    posthog.identify(userId, traits);
  } catch {}
}

export function reset() {
  try {
    posthog.reset();
  } catch {}
}
'''

with open(analytics_tsx_path, 'w', encoding='utf-8') as f:
    f.write(analytics_content)

files_to_pack = [
    'middleware.ts',
    'analytics.tsx',
    'seo.ts',
    'email_templates.ts'
]

with zipfile.ZipFile(prod_pack_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for filename in files_to_pack:
        filepath = os.path.join(outputs_dir, filename)
        if os.path.exists(filepath):
            zipf.write(filepath, arcname=filename)
            print(f"Added: {filename}")
        else:
            print(f"WARNING: {filename} not found!")

pack_size = os.path.getsize(prod_pack_path)
print(f"=== FinanceHub_Production_Pack.zip ===")
print(f"Created archive: {prod_pack_path} ({pack_size} bytes / {pack_size/1024:.2f} KB)")
