// ============================================================
// FinanceHub — PostHog Analytics Setup
// lib/analytics.ts
// ============================================================

import posthog from "posthog-js";

let isInitialised = false;

export function initAnalytics() {
  if (isInitialised || typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    capture_pageview: false, // We'll do this manually
    capture_pageleave: true,
    autocapture: false, // Manual event tracking for cleaner data
    persistence: "localStorage",
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") ph.debug();
    },
  });

  isInitialised = true;
}

export function identifyUser(
  userId: string,
  props?: {
    email?: string;
    name?: string;
    tier?: string;
    track?: string;
  }
) {
  if (typeof window === "undefined") return;
  posthog.identify(userId, {
    email: props?.email,
    name: props?.name,
    subscription_tier: props?.tier || "free",
    primary_track: props?.track,
  });
}

// ─── Core events to track ─────────────────────────────────────
export const track = {
  // Page views
  pageView: (path: string, props?: Record<string, any>) =>
    posthog.capture("$pageview", { $current_url: path, ...props }),

  // Lesson events
  lessonStarted: (lessonId: string, title: string, trackName: string) =>
    posthog.capture("lesson_started", {
      lesson_id: lessonId,
      lesson_title: title,
      track: trackName,
    }),

  lessonCompleted: (lessonId: string, title: string, trackName: string, duration: number) =>
    posthog.capture("lesson_completed", {
      lesson_id: lessonId,
      lesson_title: title,
      track: trackName,
      duration_seconds: duration,
    }),

  lessonAbandoned: (lessonId: string, scrollPercent: number) =>
    posthog.capture("lesson_abandoned", { lesson_id: lessonId, scroll_percent: scrollPercent }),

  // Quiz events
  quizStarted: (quizId: string, lessonTitle: string) =>
    posthog.capture("quiz_started", { quiz_id: quizId, lesson_title: lessonTitle }),

  quizCompleted: (quizId: string, score: number, passed: boolean) =>
    posthog.capture("quiz_completed", { quiz_id: quizId, score, passed }),

  // Video events
  videoPlayed: (videoId: string, title: string, channel: string) =>
    posthog.capture("video_played", { video_id: videoId, video_title: title, channel }),

  // Notes events
  noteCreated: (lessonId?: string) =>
    posthog.capture("note_created", { has_lesson_context: Boolean(lessonId) }),

  // Simulator events
  simulatorUsed: (name: string) => posthog.capture("simulator_used", { simulator_name: name }),

  simulatorCompleted: (name: string, inputs: Record<string, any>) =>
    posthog.capture("simulator_completed", { simulator_name: name, ...inputs }),

  // AI events
  aiQuestionAsked: (context: string) => posthog.capture("ai_question_asked", { context }),

  aiRateLimitHit: () => posthog.capture("ai_rate_limit_hit", {}),

  // Payment events
  upgradeClicked: (plan: string, location: string) =>
    posthog.capture("upgrade_clicked", { plan, location }),

  paymentStarted: (plan: string, provider: string) =>
    posthog.capture("payment_started", { plan, provider }),

  paymentCompleted: (plan: string, provider: string, amount: number) =>
    posthog.capture("payment_completed", { plan, provider, amount }),

  paymentFailed: (plan: string, reason: string) =>
    posthog.capture("payment_failed", { plan, reason }),

  // Search events
  searchPerformed: (query: string, resultsCount: number) =>
    posthog.capture("search_performed", { query, results_count: resultsCount }),

  searchResultClicked: (query: string, resultType: string, resultTitle: string) =>
    posthog.capture("search_result_clicked", {
      query,
      result_type: resultType,
      result_title: resultTitle,
    }),

  // Onboarding events
  onboardingStarted: () => posthog.capture("onboarding_started"),
  onboardingCompleted: (goal: string, level: string) =>
    posthog.capture("onboarding_completed", { goal, level }),

  // Certificate events
  certificateGenerated: (trackName: string) =>
    posthog.capture("certificate_generated", { track_name: trackName }),
};
