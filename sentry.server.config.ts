import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  beforeSend(event) {
    if (event.extra) {
      const sanitised = { ...event.extra };
      ["ANTHROPIC_API_KEY", "STRIPE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"].forEach((key) => {
        delete sanitised[key];
      });
      event.extra = sanitised;
    }
    return event;
  },
});
