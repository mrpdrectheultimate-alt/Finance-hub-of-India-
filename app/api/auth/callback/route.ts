// ============================================================
// FinanceHub — Auth Callback Route
// app/api/auth/callback/route.ts
// Handles Supabase OAuth + magic link callbacks
// Ensures robust cookie attachment, profile setup, and redirection
// Never defaults to localhost in production or Vercel.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerClient as createAuthServerClient } from "@supabase/auth-helpers-nextjs";
import { createServiceClient } from "@/lib/supabase";
import { getRequestOrigin } from "@/lib/url";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = getRequestOrigin(req);
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const authError = searchParams.get("error_description") || searchParams.get("error");
  if (authError) {
    console.error("OAuth Provider Error:", authError);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(authError)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(`${origin}/login?error=missing_supabase_env`);
  }

  // Pre-prepare destination response so we can attach session cookies directly
  let targetUrl = `${origin}${safeNext}`;
  const response = NextResponse.redirect(targetUrl);

  const supabaseAuth = createAuthServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Exchange OAuth code for session
  const { data: { session }, error } = await supabaseAuth.auth.exchangeCodeForSession(code);

  if (error || !session) {
    console.error("Auth callback code exchange error:", error?.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message || "auth_failed")}`
    );
  }

  const user = session.user;
  const isNewUser =
    user.created_at === user.updated_at ||
    new Date().getTime() - new Date(user.created_at).getTime() < 10000; // within 10 seconds

  const adminClient = createServiceClient();

  if (isNewUser) {
    // ── New user setup ─────────────────────────────────────
    try {
      // 1. Create or update profile
      await (adminClient as any).from("profiles").upsert(
        {
          id: user.id,
          email: user.email,
          full_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "",
          avatar_url:
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null,
          subscription_tier: "free",
          xp_total: 50,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: new Date().toISOString().split("T")[0],
          ai_questions_today: 0,
          ai_reset_date: new Date().toISOString().split("T")[0],
          theme: "light",
          language_pref: "en",
          email_streak_reminder: true,
          email_weekly_digest: true,
          email_marketing: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      // 2. Enrol in welcome email sequence
      try {
        await enrollWelcomeSequence(adminClient, user.id);
      } catch (emailErr) {
        console.warn("Welcome sequence enrol notice:", emailErr);
      }

      // 3. Award signup XP
      await (adminClient as any).from("user_xp_log").insert({
        user_id: user.id,
        xp_amount: 50,
        action: "signup",
        description: "Welcome to FinanceHub!",
        created_at: new Date().toISOString(),
      });

      // 4. Add to current week's leaderboard
      try {
        await (adminClient as any).rpc("add_weekly_xp", {
          p_user_id: user.id,
          p_xp: 50,
          p_type: "lesson",
        });
      } catch (lbErr) {
        console.warn("Leaderboard notice:", lbErr);
      }

      // 5. Create user consent record
      await (adminClient as any).from("user_consents").upsert(
        {
          user_id: user.id,
          terms_accepted: true,
          terms_version: "v2026-09",
          terms_at: new Date().toISOString(),
          privacy_accepted: true,
          privacy_version: "v2026-09",
          privacy_at: new Date().toISOString(),
          analytics_consent: false,
          marketing_consent: false,
        },
        { onConflict: "user_id" }
      );
    } catch (dbErr) {
      console.error("New user DB initialization error:", dbErr);
    }

    // Redirect new user to onboarding
    response.headers.set("Location", `${origin}/onboarding?welcome=1`);
    return response;
  }

  // ── Returning user ───────────────────────────────────────
  try {
    await updateStreak(adminClient, user.id);
  } catch (streakErr) {
    console.warn("Streak update notice:", streakErr);
  }

  response.headers.set("Location", `${origin}${safeNext}`);
  return response;
}

// ─── Welcome sequence enrolment helper ────────────────────────
async function enrollWelcomeSequence(supabase: any, userId: string) {
  const seqId = "11111111-0001-0001-0001-000000000001";

  await (supabase as any).from("user_email_sequence_state").upsert(
    {
      user_id: userId,
      sequence_id: seqId,
      current_step: 0,
      enrolled_at: new Date().toISOString(),
      next_send_at: new Date().toISOString(),
    },
    { onConflict: "user_id,sequence_id" }
  );
}

// ─── Streak update helper ─────────────────────────────────────
async function updateStreak(supabase: any, userId: string) {
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("current_streak,longest_streak,last_activity_date,xp_total")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const today = new Date().toISOString().split("T")[0];
  const lastDate = profile.last_activity_date;

  if (lastDate === today) return; // Already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const newStreak =
    lastDate === yesterdayStr
      ? (profile.current_streak || 0) + 1
      : 1;

  const longestStreak = Math.max(newStreak, profile.longest_streak || 0);

  let streakXP = 5;
  if (newStreak === 7) streakXP = 50;
  if (newStreak === 30) streakXP = 200;
  if (newStreak === 100) streakXP = 500;
  if (newStreak === 365) streakXP = 2000;

  await (supabase as any)
    .from("profiles")
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
      xp_total: (profile.xp_total || 0) + streakXP,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  await (supabase as any).from("user_xp_log").insert({
    user_id: userId,
    xp_amount: streakXP,
    action: "daily_login",
    description: `Day ${newStreak} streak${streakXP > 5 ? ` — Milestone bonus!` : ""}`,
  });

  try {
    await (supabase as any).rpc("add_weekly_xp", {
      p_user_id: userId,
      p_xp: streakXP,
      p_type: "streak",
    });
  } catch {}
}
