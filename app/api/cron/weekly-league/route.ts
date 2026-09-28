import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

async function handleCron(req: NextRequest) {
  if (process.env.CRON_SECRET && req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Mark last week as not current
  await (supabase as any)
    .from("leaderboard_weeks")
    .update({ is_current: false })
    .eq("is_current", true);

  // Create new current week
  const weekStart = new Date();
  weekStart.setHours(0,0,0,0);
  while (weekStart.getDay() !== 1) weekStart.setDate(weekStart.getDate() - 1);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const { error } = await (supabase as any)
    .from("leaderboard_weeks")
    .upsert({
      week_start: weekStart.toISOString().split("T")[0],
      week_end:   weekEnd.toISOString().split("T")[0],
      is_current: true,
    }, { onConflict: "week_start" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    week_start: weekStart.toISOString().split("T")[0],
    week_end:   weekEnd.toISOString().split("T")[0],
  });
}

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}
