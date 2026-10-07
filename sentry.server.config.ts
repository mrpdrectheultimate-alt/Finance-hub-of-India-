import * as Sentry from "@sentry/nextjs";
import { SENTRY_CONFIG } from "@/lib/sentry";

Sentry.init({
  ...SENTRY_CONFIG,
});
