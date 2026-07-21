import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/security";

export const dynamic = "force-dynamic";

type WeeklyMissionRow = {
  id: string;
  theme: string;
  description: string;
  missions: unknown;
  xp_multiplier: number;
  week_start: string;
};

type UserWeeklyMissionRow = {
  progress: Record<string, number> | null;
  completed: boolean;
  xp_earned: number;
};

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  const { user, error: authError, supabase } = await requireAuth(req);
  if (authError) return authError;

  const rateLimit = applyRateLimit(RATE_LIMITS.badgeCheck(user!.id), "Too many weekly mission requests.");
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const weekStart = getWeekStart();

    const { data: missionData, error: missionError } = await supabase
      .from("weekly_missions" as never)
      .select("id, theme, description, missions, xp_multiplier, week_start")
      .eq("week_start", weekStart)
      .eq("is_active", true)
      .maybeSingle();

    if (missionError) {
      console.error("weekly_missions lookup error:", missionError);
      return NextResponse.json({ error: "Failed to load weekly mission" }, { status: 500 });
    }

    const mission = missionData as WeeklyMissionRow | null;
    if (!mission) {
      return NextResponse.json({ mission: null, progress: null, daysLeft: getDaysLeft(weekStart) });
    }

    const { data: progressData, error: progressError } = await supabase
      .from("user_weekly_missions" as never)
      .select("progress, completed, xp_earned")
      .eq("user_id", user!.id)
      .eq("mission_id", mission.id)
      .maybeSingle();

    if (progressError) {
      console.error("user_weekly_missions lookup error:", progressError);
      return NextResponse.json({ error: "Failed to load weekly progress" }, { status: 500 });
    }

    const progress = (progressData as UserWeeklyMissionRow | null) || {
      progress: {},
      completed: false,
      xp_earned: 0,
    };

    return NextResponse.json({
      mission,
      progress,
      daysLeft: getDaysLeft(weekStart),
    });
  } catch (error) {
    console.error("weekly-mission GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function getDaysLeft(weekStart: string) {
  const now = new Date();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return Math.max(0, Math.ceil((weekEnd.getTime() - now.getTime()) / 86400000));
}
