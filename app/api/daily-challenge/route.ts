import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { requireAuth, sanitizeUUID } from "@/lib/security";

export async function GET(req: NextRequest) {
  const { user, error: authError, supabase } = await requireAuth(req);
  if (authError) return authError;

  const rateLimit = applyRateLimit(RATE_LIMITS.badgeCheck(user!.id), "Too many challenge requests.");
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const { data, error } = await supabase.rpc("get_daily_challenges" as never, {
      p_user_id: user!.id,
    } as never);

    if (error) {
      console.error("get_daily_challenges RPC error:", error);
      return NextResponse.json({ error: "Failed to load daily challenges" }, { status: 500 });
    }

    return NextResponse.json({ challenges: data || [] });
  } catch (error) {
    console.error("daily-challenge GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error: authError, supabase } = await requireAuth(req);
  if (authError) return authError;

  const rateLimit = applyRateLimit(RATE_LIMITS.badgeCheck(user!.id), "Too many challenge completions.");
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const body = await req.json();
    const challengeId = sanitizeUUID(body.challengeId);

    if (!challengeId) {
      return NextResponse.json({ error: "Valid challengeId required" }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("complete_daily_challenge" as never, {
      p_user_id: user!.id,
      p_challenge_id: challengeId,
    } as never);

    if (error) {
      console.error("complete_daily_challenge RPC error:", error);
      return NextResponse.json({ error: "Failed to complete challenge" }, { status: 500 });
    }

    return NextResponse.json(data || { success: false });
  } catch (error) {
    console.error("daily-challenge POST error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
