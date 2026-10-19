import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";
import { getRequestOrigin } from "@/lib/url";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = getRequestOrigin(req);

  try {
    const requestUrl = new URL(req.url);
    const next = requestUrl.searchParams.get("next") || "/dashboard";
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(`${origin}/login?error=missing_supabase_env`);
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const redirectTo = `${origin}/api/auth/callback?next=${encodeURIComponent(safeNext)}`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error || !data.url) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error?.message || "google_oauth_unavailable")}`
      );
    }

    return NextResponse.redirect(data.url);
  } catch (err: unknown) {
    console.error("Google Auth API Exception:", err);
    return NextResponse.redirect(`${origin}/login?error=google_oauth_exception`);
  }
}
