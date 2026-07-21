import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { requireAuth, sanitizeString } from "@/lib/security";

type Scope = "global" | "weekly";
type ActiveSeason = {
  id: string;
  season_number: number;
  title: string;
};

export async function GET(req: NextRequest) {
  const { user, error: authError, supabase } = await requireAuth(req);
  if (authError) return authError;

  const rateLimit = applyRateLimit(RATE_LIMITS.badgeCheck(user!.id), "Too many leaderboard requests.");
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const { searchParams } = new URL(req.url);
    const scopeParam = sanitizeString(searchParams.get("scope") || "global", 20);
    const scope: Scope = scopeParam === "weekly" ? "weekly" : "global";

    const { data: leaderboard, error: leaderboardError } = await supabase.rpc("get_leaderboard" as never, {
      p_scope: scope,
      p_limit: 50,
    } as never);

    if (leaderboardError) {
      console.error("get_leaderboard RPC error:", leaderboardError);
      return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
    }

    const { data: activeSeasonData } = await supabase
      .from("seasons" as never)
      .select("id, season_number, title")
      .eq("is_active", true)
      .limit(1)
      .single();

    const activeSeason = activeSeasonData as ActiveSeason | null;
    let seasonStats: unknown = null;
    if (activeSeason?.id) {
      const { data } = await supabase
        .from("user_season_stats" as never)
        .select("season_xp, rank")
        .eq("user_id", user!.id)
        .eq("season_id", activeSeason.id)
        .maybeSingle();
      seasonStats = data;
    }

    return NextResponse.json({
      scope,
      leaderboard: leaderboard || [],
      myUserId: user!.id,
      season: activeSeason || null,
      seasonStats,
    });
  } catch (error) {
    console.error("leaderboard GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
