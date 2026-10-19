// ============================================================
// FinanceHub — Canonical Application URL & Origin Resolver
// lib/url.ts
// Resolves the production URL (https://finance-hub-of-india.vercel.app)
// reliably across client, server components, and API route handlers.
// ============================================================

import { NextRequest } from "next/server";

export const CANONICAL_PRODUCTION_URL = "https://finance-hub-of-india.vercel.app";

/**
 * Returns the canonical base URL for FinanceHub.
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL (if explicitly set and not localhost in production)
 * 2. NEXT_PUBLIC_SITE_URL
 * 3. VERCEL_PROJECT_PRODUCTION_URL (Vercel automatic production domain)
 * 4. VERCEL_URL (Vercel deployment URL)
 * 5. Fallback: https://finance-hub-of-india.vercel.app
 */
export function getAppUrl(): string {
  // If in browser, use current window origin unless running on localhost in non-dev
  if (typeof window !== "undefined" && window.location.origin) {
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return window.location.origin.replace(/\/$/, "");
    }
  }

  const envAppUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envAppUrl && !envAppUrl.includes("localhost") && !envAppUrl.includes("127.0.0.1")) {
    return envAppUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  return CANONICAL_PRODUCTION_URL;
}

/**
 * Server-side request origin resolver.
 * Inspects forwarded reverse-proxy headers (x-forwarded-host, x-forwarded-proto)
 * ensuring Vercel serverless functions never resolve to internal localhost:3000.
 */
export function getRequestOrigin(req?: NextRequest | Request | { headers: Headers }): string {
  if (req && "headers" in req) {
    const headers = req.headers as Headers;
    const proto = headers.get("x-forwarded-proto") || "https";
    const host = headers.get("x-forwarded-host") || headers.get("host");

    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }

  return getAppUrl();
}
