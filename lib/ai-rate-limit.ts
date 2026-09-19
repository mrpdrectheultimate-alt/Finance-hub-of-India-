// ============================================================
// FinanceHub — AI Rate Limiting (Supabase-backed)
// lib/ai-rate-limit.ts
// Replaces in-memory rate limiting that resets on cold start
// ============================================================

import { createServerClient } from "@/lib/supabase";

const LIMITS = {
  free: 5, // questions per day
  pro: 50,
  expert: 200,
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: string; // ISO date string (next day midnight IST)
  tier: string;
}

export async function checkAIRateLimit(userId: string): Promise<RateLimitResult> {
  const supabase = createServerClient();

  // Get user profile with AI usage
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, ai_questions_today, ai_reset_date")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return { allowed: false, remaining: 0, limit: 0, resetAt: "", tier: "free" };
  }

  const profileData = profile as any;
  const tier = profileData.role || profileData.subscription_tier || "free";
  const limit = LIMITS[tier as keyof typeof LIMITS] || LIMITS.free;

  // Check if reset date is today (IST)
  const todayIST = new Date().toLocaleString("en-CA", { timeZone: "Asia/Kolkata" }).split(",")[0];
  const resetDate = profileData.ai_reset_date;

  let questionsToday = profileData.ai_questions_today || 0;

  // Reset counter if it's a new day
  if (resetDate !== todayIST) {
    questionsToday = 0;
    await supabase
      .from("profiles")
      .update({
        ai_questions_today: 0,
        ai_reset_date: todayIST,
      } as any)
      .eq("id", userId);
  }

  const remaining = Math.max(0, limit - questionsToday);
  const allowed = questionsToday < limit;

  // Calculate next reset (midnight IST)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const resetAt = new Date(
    tomorrow.toLocaleString("en-CA", { timeZone: "Asia/Kolkata" }).split(",")[0]
  ).toISOString();

  return { allowed, remaining, limit, resetAt, tier };
}

export async function incrementAIUsage(userId: string): Promise<void> {
  const supabase = createServerClient();
  try {
    await (supabase as any).rpc("increment_ai_usage", { p_user_id: userId });
  } catch {
    // Fallback manual increment if RPC is not installed in database yet
    const todayIST = new Date().toLocaleString("en-CA", { timeZone: "Asia/Kolkata" }).split(",")[0];
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_questions_today, ai_reset_date")
      .eq("id", userId)
      .single();

    const currentCount = (profile as any)?.ai_questions_today || 0;
    const isToday = (profile as any)?.ai_reset_date === todayIST;

    await supabase
      .from("profiles")
      .update({
        ai_questions_today: isToday ? currentCount + 1 : 1,
        ai_reset_date: todayIST,
      } as any)
      .eq("id", userId);
  }
}

// ─── SQL function needed in Supabase ─────────────────────────
export const AI_RATE_LIMIT_SQL = `
-- Run this in Supabase SQL editor

-- 1. Add columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_questions_today INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_reset_date      TEXT;

-- 2. Create atomic increment function
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  today_ist TEXT;
BEGIN
  today_ist := TO_CHAR(NOW() AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD');

  UPDATE profiles SET
    ai_questions_today = CASE
      WHEN ai_reset_date = today_ist THEN ai_questions_today + 1
      ELSE 1
    END,
    ai_reset_date = today_ist
  WHERE id = p_user_id;
END; $$;
`;
