import posthog from "posthog-js";

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
  } catch {
    // Never let analytics crash the app
  }
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
