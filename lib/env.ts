// ============================================================
// FinanceHub — Environment Variable Schema & Validator
// lib/env.ts
// Validates required environment variables at runtime/boot
// ============================================================

export interface AppEnv {
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;

  // App & URLs
  appUrl: string;
  adminEmails: string[];

  // AI
  anthropicApiKey: string;

  // Payments
  razorpayKeyId: string;
  razorpayKeySecret: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;

  // Emails & Alerts
  resendApiKey: string;
  cronSecret: string;

  // Analytics
  posthogKey: string;
  posthogHost: string;

  isProduction: boolean;
}

export function getEnv(): AppEnv {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_anon_key",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

    appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://financehub.in",
    adminEmails: (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),

    anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",

    razorpayKeyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",

    resendApiKey: process.env.RESEND_API_KEY || "",
    cronSecret: process.env.CRON_SECRET || "",

    posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || "",
    posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",

    isProduction,
  };
}

export function validateRequiredEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  // Critical keys needed in production
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const valid = missing.length === 0;

  if (!valid && process.env.NODE_ENV === "production") {
    console.warn(`[Env Warning] Missing required production environment variables: ${missing.join(", ")}`);
  }

  return { valid, missing };
}

export const env = getEnv();
