import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const requestUrl = new URL(req.url);
    const next = requestUrl.searchParams.get("next") || "/dashboard";
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("error", "missing_supabase_env");
      return NextResponse.redirect(loginUrl);
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const redirectTo = new URL(`/auth/callback?next=${encodeURIComponent(safeNext)}`, req.url).toString();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("error", error?.message || "google_oauth_unavailable");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.redirect(data.url);
  } catch (err: unknown) {
    console.error("Google Auth API Error:", err);
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("error", "google_oauth_exception");
    return NextResponse.redirect(loginUrl);
  }
}
