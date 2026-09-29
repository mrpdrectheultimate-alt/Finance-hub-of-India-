// ============================================================
// FinanceHub — Auth Callback Route
// app/api/auth/callback/route.ts
// Handles Supabase OAuth + magic link callbacks
// Wires: welcome email · onboarding · profile creation · XP
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerClient }        from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code     = searchParams.get("code");
  const next     = searchParams.get("next") ?? "/dashboard";
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL || "https://financehub.in";

  if (!code) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=missing_code`);
  }

  const supabase = createServerClient();

  // Exchange code for session
  const { data: { session }, error } = await (supabase.auth as any).exchangeCodeForSession(code);

  if (error || !session) {
    console.error("Auth callback error:", error?.message);
    return NextResponse.redirect(`${appUrl}/auth/login?error=auth_failed`);
  }

  const user      = session.user;
  const isNewUser = user.created_at === user.updated_at ||
    (new Date().getTime() - new Date(user.created_at).getTime()) < 5000; // within 5 seconds

  if (isNewUser) {
    // ── New user setup ─────────────────────────────────────

    // 1. Create or update profile
    await (supabase as any).from("profiles").upsert({
      id:                   user.id,
      email:                user.email,
      full_name:            user.user_metadata?.full_name ||
                            user.user_metadata?.name || "",
      avatar_url:           user.user_metadata?.avatar_url ||
                            user.user_metadata?.picture || null,
      subscription_tier:    "free",
      xp_total:             0,
      current_streak:       0,
      longest_streak:       0,
      ai_questions_today:   0,
      ai_reset_date:        new Date().toISOString().split("T")[0],
      theme:                "light",
      language_pref:        "en",
      email_streak_reminder: true,
      email_weekly_digest:   true,
      email_marketing:       false,
      created_at:           new Date().toISOString(),
      updated_at:           new Date().toISOString(),
    }, { onConflict: "id" });

    // 2. Enrol in welcome email sequence
    try {
      await enrollWelcomeSequence(supabase, user.id);
    } catch (emailErr) {
      console.error("Welcome sequence enrol failed:", emailErr);
      // Non-fatal — don't block login
    }

    // 3. Award signup XP
    await (supabase as any).from("user_xp_log").insert({
      user_id:     user.id,
      xp_amount:   50,
      action:      "signup",
      description: "Welcome to FinanceHub!",
      created_at:  new Date().toISOString(),
    });

    await (supabase as any).from("profiles")
      .update({ xp_total: 50 })
      .eq("id", user.id);

    // 4. Add to current week's leaderboard
    await (supabase as any).rpc("add_weekly_xp", {
      p_user_id: user.id,
      p_xp:      50,
      p_type:    "lesson",
    });

    // 5. Create user consent record
    await (supabase as any).from("user_consents").upsert({
      user_id:         user.id,
      terms_accepted:  true,
      terms_version:   "v2026-09",
      terms_at:        new Date().toISOString(),
      privacy_accepted: true,
      privacy_version: "v2026-09",
      privacy_at:      new Date().toISOString(),
      analytics_consent: false,
      marketing_consent: false,
    }, { onConflict: "user_id" });

    // 6. Redirect new users to onboarding
    return NextResponse.redirect(`${appUrl}/onboarding?welcome=1`);
  }

  // ── Returning user ───────────────────────────────────────

  // Update streak
  await updateStreak(supabase, user.id);

  // Redirect to intended destination or dashboard
  const redirectTo = next.startsWith("/") ? `${appUrl}${next}` : appUrl + "/dashboard";
  return NextResponse.redirect(redirectTo);
}

// ─── Welcome sequence enrolment helper ────────────────────────
async function enrollWelcomeSequence(supabase: any, userId: string) {
  const seqId = "11111111-0001-0001-0001-000000000001";

  await (supabase as any).from("user_email_sequence_state").upsert({
    user_id:      userId,
    sequence_id:  seqId,
    current_step: 0,
    enrolled_at:  new Date().toISOString(),
    next_send_at: new Date().toISOString(), // send first email immediately
  }, { onConflict: "user_id,sequence_id" });
}

// ─── Streak update helper ─────────────────────────────────────
async function updateStreak(supabase: any, userId: string) {
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("current_streak,longest_streak,last_activity_date,xp_total")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const today     = new Date().toISOString().split("T")[0];
  const lastDate  = profile.last_activity_date;

  if (lastDate === today) return; // Already counted today

  const yesterday  = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const newStreak = lastDate === yesterdayStr
    ? (profile.current_streak || 0) + 1  // Consecutive day
    : 1;                                   // Streak broken — restart

  const longestStreak = Math.max(newStreak, profile.longest_streak || 0);

  // Streak XP milestones
  let streakXP = 5; // Base streak XP
  if (newStreak === 7)   streakXP = 50;   // 1 week
  if (newStreak === 30)  streakXP = 200;  // 1 month
  if (newStreak === 100) streakXP = 500;  // 100 days
  if (newStreak === 365) streakXP = 2000; // 1 year

  await (supabase as any).from("profiles").update({
    current_streak:     newStreak,
    longest_streak:     longestStreak,
    last_activity_date: today,
    xp_total:           (profile.xp_total || 0) + streakXP,
    updated_at:         new Date().toISOString(),
  }).eq("id", userId);

  // Log streak XP
  await (supabase as any).from("user_xp_log").insert({
    user_id:     userId,
    xp_amount:   streakXP,
    action:      "daily_login",
    description: `Day ${newStreak} streak${streakXP > 5 ? ` — Milestone bonus!` : ""}`,
  });

  // Add to weekly leaderboard
  await (supabase as any).rpc("add_weekly_xp", {
    p_user_id: userId,
    p_xp:      streakXP,
    p_type:    "streak",
  });
}
