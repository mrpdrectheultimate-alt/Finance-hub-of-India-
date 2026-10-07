export const SENTRY_CONFIG = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",

  // Sample rates
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  // Filter out noise
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Failed to fetch",
    "Load failed",
    "NetworkError",
    "AuthSessionMissingError",
    "AbortError",
  ],

  beforeSend(event: any) {
    // Strip PII from error events
    if (event.user) {
      delete event.user.email;
      delete event.user.name;
    }
    return event;
  },
};
