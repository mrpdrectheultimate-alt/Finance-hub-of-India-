import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, sanitizeNumber } from "@/lib/security";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { user, error: authError, supabase } = await requireAdmin(req);
  if (authError) return authError;

  const rateLimit = applyRateLimit(RATE_LIMITS.badgeCheck(user!.id), "Too many analytics requests.");
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const params = new URL(req.url).searchParams;
    const days = sanitizeNumber(params.get("days") || 30, 1, 3650);

    const { data, error } = await supabase.rpc("get_admin_analytics" as never, {
      p_days: days,
    } as never);

    if (error) {
      console.error("get_admin_analytics error:", error);
      return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
    }

    return NextResponse.json({ analytics: data });
  } catch (error) {
    console.error("admin analytics error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
