import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function requireAuth(req: NextRequest): Promise<{
  user: any;
  error: NextResponse | null;
  supabase: any;
}> {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return {
      user: null,
      error: NextResponse.json({ error: "Authorization header required" }, { status: 401 }),
      supabase: null,
    };
  }

  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
      supabase,
    };
  }

  return { user, error: null, supabase };
}

export async function requireAdmin(req: NextRequest) {
  const { user, error, supabase } = await requireAuth(req);
  if (error) return { user: null, error, supabase };

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (!adminEmails.includes(user!.email || "")) {
    return {
      user: null,
      error: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
      supabase,
    };
  }

  return { user, error: null, supabase };
}

export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
}

export function sanitizeNumber(input: unknown, min = 0, max = 100): number {
  const value = Number(input);
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export function sanitizeUUID(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(input) ? input : null;
}

export const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://app.posthog.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://app.posthog.com https://js.stripe.com",
  "frame-src https://js.stripe.com https://www.youtube.com https://youtube.com",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export function secureHeaders(): HeadersInit {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}

export function validateWebhookOrigin(req: NextRequest): boolean {
  const stripeSignature = req.headers.get("stripe-signature");
  const supabaseWebhookSecret = req.headers.get("x-webhook-secret");

  if (req.url.includes("stripe-webhook")) return Boolean(stripeSignature);

  if (req.url.includes("webhook-signup")) {
    return supabaseWebhookSecret === process.env.SUPABASE_WEBHOOK_SECRET;
  }

  return true;
}

export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}
