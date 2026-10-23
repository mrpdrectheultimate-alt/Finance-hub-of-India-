// ============================================================
// FinanceHub — Canonical Application URL & Origin Resolver
// lib/url.ts
// Resolves the application URL and request origin reliably across
// client, server components, and API route handlers.
// ============================================================

import { NextRequest } from "next/server";

export const CANONICAL_PRODUCTION_URL = "https://finance-hub-of-india.vercel.app";

/**
 * Returns the base URL for FinanceHub.
 * Priority:
 * 1. window.location.origin (if in browser)
 * 2. NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_SITE_URL
 * 3. VERCEL_PROJECT_PRODUCTION_URL
 * 4. VERCEL_URL
 * 5. In development: http://localhost:3000
 * 6. Fallback: https://finance-hub-of-india.vercel.app
 */
export function getAppUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  const envAppUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envAppUrl) {
    return envAppUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return CANONICAL_PRODUCTION_URL;
}

/**
 * Server-side request origin resolver.
 * Inspects forwarded reverse-proxy headers (x-forwarded-host, x-forwarded-proto)
 * ensuring accurate origin on Vercel, proxies, and local development.
 */
export function getRequestOrigin(req?: NextRequest | Request | { headers: Headers }): string {
  if (req && "headers" in req) {
    const headers = req.headers as Headers;
    const forwardedHost = headers.get("x-forwarded-host");
    const host = forwardedHost || headers.get("host");

    if (host) {
      const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
      const proto = headers.get("x-forwarded-proto") || (isLocal ? "http" : "https");

      // Guard: On Vercel edge/serverless, if internal host was somehow localhost without forward, fallback to canonical
      if (process.env.VERCEL && isLocal) {
        return CANONICAL_PRODUCTION_URL;
      }

      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }

  return getAppUrl();
}
