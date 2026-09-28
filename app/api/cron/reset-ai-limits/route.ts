import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

async function handleCron(req: NextRequest) {
  // Verify cron secret
  if (process.env.CRON_SECRET && req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const today    = new Date().toISOString().split("T")[0];

  // Reset ai_questions_today for all users whose reset date is not today
  const { error, count } = await (supabase as any)
    .from("profiles")
    .update({ ai_questions_today: 0, ai_reset_date: today })
    .neq("ai_reset_date", today);

  if (error) {
    console.error("AI limit reset error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reset: count, date: today });
}

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}
