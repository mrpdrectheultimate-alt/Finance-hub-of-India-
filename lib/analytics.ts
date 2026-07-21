import posthog from "posthog-js";

type UserProps = {
  email?: string;
  name?: string;
  role?: string;
  createdAt?: string;
};

type AnalyticsContext = Record<string, unknown>;

function canTrack() {
  return typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

function capture(event: string, properties?: Record<string, unknown>) {
  if (!canTrack()) return;
  posthog.capture(event, properties);
}

export function initAnalytics() {
  if (!canTrack()) return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: false,
    session_recording: { maskAllInputs: true },
    persistence: "localStorage",
    bootstrap: {
      distinctID: undefined,
    },
  });
}

export function identifyUser(userId: string, props: UserProps) {
  if (!canTrack()) return;

  posthog.identify(userId, {
    email: props.email,
    name: props.name,
    plan: props.role || "free",
    created_at: props.createdAt,
  });
}

export const track = {
  onboardingStarted: () => capture("onboarding_started"),
  onboardingCompleted: (trackName: string) => capture("onboarding_completed", { track: trackName }),

  lessonOpened: (lessonId: string, lessonTitle: string, trackTitle: string) =>
    capture("lesson_opened", { lesson_id: lessonId, lesson_title: lessonTitle, track: trackTitle }),
  lessonCompleted: (lessonId: string, lessonTitle: string, timeSpentSeconds: number) =>
    capture("lesson_completed", { lesson_id: lessonId, lesson_title: lessonTitle, time_spent: timeSpentSeconds }),
  lessonDropped: (lessonId: string, scrollDepthPct: number) =>
    capture("lesson_dropped", { lesson_id: lessonId, scroll_depth: scrollDepthPct }),

  quizStarted: (quizId: string, lessonId: string) => capture("quiz_started", { quiz_id: quizId, lesson_id: lessonId }),
  quizCompleted: (quizId: string, score: number, passed: boolean) =>
    capture("quiz_completed", { quiz_id: quizId, score, passed }),
  quizAbandoned: (quizId: string, questionNum: number) =>
    capture("quiz_abandoned", { quiz_id: quizId, question_num: questionNum }),

  aiQuestionAsked: (lessonId: string | null, persona: string, questionLength: number) =>
    capture("ai_question_asked", { lesson_id: lessonId, persona, question_length: questionLength }),
  aiLimitReached: () => capture("ai_limit_reached"),

  xpEarned: (amount: number, reason: string) => capture("xp_earned", { amount, reason }),
  badgeUnlocked: (badgeSlug: string) => capture("badge_unlocked", { badge_slug: badgeSlug }),
  streakUpdated: (streakDays: number) => capture("streak_updated", { streak_days: streakDays }),

  pricingPageViewed: () => capture("pricing_page_viewed"),
  upgradeClicked: (plan: string, billing: string) => capture("upgrade_clicked", { plan, billing }),
  checkoutStarted: (plan: string) => capture("checkout_started", { plan }),
  paymentSucceeded: (plan: string) => capture("payment_succeeded", { plan }),
  paymentFailed: (plan: string) => capture("payment_failed", { plan }),

  pageViewed: (path: string) => capture("$pageview", { $current_url: path }),
  signedOut: () => {
    capture("signed_out");
    if (canTrack()) posthog.reset();
  },

  searchPerformed: (query: string, resultCount: number) =>
    capture("search_performed", { query, result_count: resultCount }),
  searchResultClicked: (lessonId: string, position: number) =>
    capture("search_result_clicked", { lesson_id: lessonId, position }),

  simulatorStarted: (simName: string) => capture("simulator_started", { simulator: simName }),
  simulatorCompleted: (simName: string, score: number) =>
    capture("simulator_completed", { simulator: simName, score }),

  certificateGenerated: (trackSlug: string) => capture("certificate_generated", { track_slug: trackSlug }),
};

export function captureError(error: Error, context?: AnalyticsContext) {
  console.error("[FinanceHub Error]", error.message, context);
  capture("error_occurred", {
    error_message: error.message,
    error_name: error.name,
    ...context,
  });
  // Add @sentry/nextjs and call Sentry.captureException(error, { extra: context }) here when ready.
}
