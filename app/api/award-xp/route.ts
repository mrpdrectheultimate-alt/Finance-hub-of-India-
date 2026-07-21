import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

type Activity = "budget_sim" | "paper_trade";

const ACTIVITY_BADGES: Record<Activity, string> = {
  budget_sim: "budget-master",
  paper_trade: "first-trade",
};

function getXp(activity: Activity, score?: number) {
  if (activity === "paper_trade") return 30;
  if (activity === "budget_sim") {
    if (typeof score !== "number" || score < 70) return 0;
    return score >= 90 ? 75 : 50;
  }
  return 0;
}

export async function POST(req: NextRequest) {
  try {
    const { activity, score } = await req.json() as { activity?: Activity; score?: number };

    if (activity !== "budget_sim" && activity !== "paper_trade") {
      return NextResponse.json({ error: "Invalid activity" }, { status: 400 });
    }

    const xpAmount = getXp(activity, score);
    if (xpAmount <= 0) {
      return NextResponse.json({ success: true, xp_earned: 0, badge_earned: null });
    }

    const supabase = createServerClient();
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const badgeSlug = ACTIVITY_BADGES[activity];
    const { data: badge } = await supabase.from("badges").select("id, title").eq("slug", badgeSlug).single();

    if (badge) {
      const { data: existing } = await supabase
        .from("user_badges")
        .select("id")
        .eq("user_id", user.id)
        .eq("badge_id", badge.id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ success: true, xp_earned: 0, badge_earned: null, already_awarded: true });
      }

      await supabase.from("user_badges").insert({ user_id: user.id, badge_id: badge.id });
    }

    await supabase.from("user_xp_log").insert({ user_id: user.id, xp_amount: xpAmount, reason: activity });

    const { data: profile } = await supabase.from("profiles").select("xp_total").eq("id", user.id).single();
    const newXpTotal = (profile?.xp_total || 0) + xpAmount;
    await supabase.from("profiles").update({ xp_total: newXpTotal }).eq("id", user.id);

    return NextResponse.json({
      success: true,
      xp_earned: xpAmount,
      new_xp_total: newXpTotal,
      badge_earned: badge?.title || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
