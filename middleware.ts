import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/learn",
  "/practice",
  "/simulators",
  "/library",
  "/profile",
  "/leaderboard",
  "/certificates",
  "/ai-tutor",
  "/ai-exam-generator",
  "/ai-roadmap-planner",
  "/ai-exam",
  "/roadmap",
  "/career",
  "/progress",
];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ONLY = ["/auth/login", "/auth/signup"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isLocalPreview = ["localhost", "127.0.0.1"].includes(req.nextUrl.hostname);
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (
    isLocalPreview &&
    [...PROTECTED, ...ADMIN_ROUTES].some((route) => path.startsWith(route))
  ) {
    return NextResponse.next();
  }

  if (!hasSupabaseEnv) {
    if ([...PROTECTED, ...ADMIN_ROUTES].some((route) => path.startsWith(route))) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const redirect = (url: URL) => {
    const redirectRes = NextResponse.redirect(url);
    res.cookies.getAll().forEach((cookie) => redirectRes.cookies.set(cookie));
    return redirectRes;
  };

  if (session && AUTH_ONLY.some((route) => path.startsWith(route))) {
    return redirect(new URL("/dashboard", req.url));
  }

  if (!session && PROTECTED.some((route) => path.startsWith(route))) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", path);
    return redirect(loginUrl);
  }

  if (ADMIN_ROUTES.some((route) => path.startsWith(route))) {
    if (!session) {
      return redirect(new URL("/auth/login", req.url));
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    if (!adminEmails.includes(session.user.email || "")) {
      return redirect(new URL("/dashboard", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/stripe-webhook).*)"],
};
