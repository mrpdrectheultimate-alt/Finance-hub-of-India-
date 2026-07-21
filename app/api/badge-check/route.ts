import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { requireAuth, sanitizeString } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const rateLimit = applyRateLimit(RATE_LIMITS.badgeCheck(user!.id), "Too many badge checks.");
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const { event } = (await req.json()) as { event?: unknown };
    const safeEvent = sanitizeString(event, 50);
    if (!safeEvent) return NextResponse.json({ error: "event required" }, { status: 400 });

    const supabase = createServerClient();
    const awarded: string[] = [];

    const awardBadge = async (slug: string) => {
      const { data: badge } = await supabase.from("badges").select("id, title").eq("slug", slug).single();
      if (!badge) return;

      const { error } = await supabase
        .from("user_badges")
        .upsert({ user_id: user!.id, badge_id: badge.id }, { onConflict: "user_id,badge_id", ignoreDuplicates: true });

      if (!error) awarded.push(badge.title);
    };

    if (safeEvent === "lesson_complete") {
      const { count } = await supabase.from("user_progress").select("*", { count: "exact", head: true }).eq("user_id", user!.id);

      if (count === 1) await awardBadge("first-step");
      if (count && count % 10 === 0) await awardBadge("level-up");
    }

    if (safeEvent === "quiz_perfect") {
      await awardBadge("quiz-ace");
    }

    if (safeEvent === "streak_update") {
      const { data: profile } = await supabase.from("profiles").select("streak_current").eq("id", user!.id).single();
      const streak = profile?.streak_current || 0;

      if (streak >= 3) await awardBadge("streak-3");
      if (streak >= 7) await awardBadge("streak-7");
      if (streak >= 30) await awardBadge("streak-30");
    }

    if (safeEvent === "streak_3") {
      await awardBadge("streak-3");
    }

    if (safeEvent === "streak_7") {
      await awardBadge("streak-7");
    }

    if (safeEvent === "streak_30") {
      await awardBadge("streak-30");
    }

    if (safeEvent === "track_complete") {
      await awardBadge("track-master");
    }

    if (safeEvent === "ai_question") {
      const { count } = await supabase.from("ai_conversations").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      if (count === 1) await awardBadge("ai-explorer");
    }

    if (safeEvent === "crypto_complete") {
      await awardBadge("crypto-curious");
    }

    if (safeEvent === "budget_sim") {
      await awardBadge("budget-master");
    }

    if (safeEvent === "paper_trade") {
      await awardBadge("first-trade");
    }

    return NextResponse.json({ awarded, count: awarded.length });
  } catch (error) {
    console.error("Badge check error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
