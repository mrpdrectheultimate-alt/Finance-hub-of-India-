// ============================================================
// FinanceHub — Next.js Middleware
// middleware.ts  (project root — runs on every request)
// Handles: Auth protection · Rate limiting · Security · Redirects
// ============================================================

import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/settings",
  "/profile",
  "/notes",
  "/review",
  "/leaderboard",
  "/certificates",
  "/knowledge-map",
  "/admin",
  "/practice/net-worth",
  "/practice/goals",
  "/onboarding",
];

// Routes only for non-authenticated users
const AUTH_ONLY_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

// API routes with rate limiting (requests per minute per IP)
const API_RATE_LIMITS: Record<string, number> = {
  "/api/ai-mentor":       10,   // 10 req/min per IP
  "/api/ai-exam":         5,
  "/api/ai-roadmap":      5,
  "/api/ai-weakness":     5,
  "/api/search":          30,
  "/api/complete-lesson": 60,
  "/api/notes":           60,
};

// Simple in-memory rate limit store (resets on edge function cold start)
const rateLimitStore = new Map<string, { count: number; reset: number }>();

function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now();
  const window = 60_000; // 1 minute
  const record = rateLimitStore.get(key);

  if (!record || now > record.reset) {
    rateLimitStore.set(key, { count: 1, reset: now + window });
    return true;
  }

  if (record.count >= limit) return false;

  record.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  // ── 1. Rate limiting on AI + API routes ─────────────────────
  for (const [route, limit] of Object.entries(API_RATE_LIMITS)) {
    if (pathname.startsWith(route)) {
      const key = `${ip}:${route}`;
      if (!checkRateLimit(key, limit)) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests. Please wait a moment." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "60",
              "X-RateLimit-Limit": limit.toString(),
            },
          }
        );
      }
    }
  }

  // ── 2. Supabase session management ──────────────────────────
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;

  // ── 3. Protect authenticated routes ─────────────────────────
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 4. Redirect logged-in users away from auth pages ────────
  const isAuthRoute = AUTH_ONLY_ROUTES.some(r => pathname.startsWith(r));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── 5. Admin route protection ────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login?next=/admin/dashboard", request.url));
    }
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim());
    if (!adminEmails.includes(session?.user?.email || "")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // ── 6. Security headers ──────────────────────────────────────
  res.headers.set("X-DNS-Prefetch-Control", "on");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

  return res;
}

export const config = {
  matcher: [
    // Match all routes except static files and Next internals
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|robots.txt|sitemap.xml).*)",
  ],
};
