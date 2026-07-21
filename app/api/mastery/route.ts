import { createServerClient } from "@/lib/supabase";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { requireAuth, sanitizeNumber, sanitizeString, sanitizeUUID } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const rateLimit = applyRateLimit(RATE_LIMITS.completeLesson(user!.id));
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const body = (await req.json()) as { topicId?: unknown; score?: unknown; passed?: unknown };
    const topicId = sanitizeUUID(body.topicId);
    const score = sanitizeNumber(body.score, 0, 100);
    const passed = Boolean(body.passed);

    if (!topicId) {
      return NextResponse.json({ error: "topicId required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase.rpc("update_mastery_after_quiz" as never, {
      p_user_id: user!.id,
      p_topic_id: topicId,
      p_score: Math.round(score),
      p_passed: passed,
    } as never);

    if (error) {
      console.error("update_mastery_after_quiz error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("mastery POST error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  try {
    const supabase = createServerClient();
    const type = sanitizeString(req.nextUrl.searchParams.get("type"), 20) || "overview";

    if (type === "weak") {
      const { data, error } = await supabase.rpc("get_weak_topics" as never, { p_user_id: user!.id } as never);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ weakTopics: data || [] });
    }

    if (type === "reviews") {
      const { data, error } = await supabase.rpc("get_due_reviews" as never, { p_user_id: user!.id } as never);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ dueReviews: data || [] });
    }

    const { data, error } = await supabase
      .from("user_mastery" as never)
      .select("*, topic:topics(title, track_slug, difficulty)")
      .eq("user_id", user!.id)
      .order("mastery_score", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const topics = (data || []) as unknown as Array<{ mastery_score: number }>;
    const totalTopics = topics.length;
    const mastered = topics.filter((topic) => topic.mastery_score >= 80).length;
    const learning = topics.filter((topic) => topic.mastery_score >= 40 && topic.mastery_score < 80).length;
    const weak = topics.filter((topic) => topic.mastery_score < 40).length;
    const avgMastery = totalTopics
      ? Math.round(topics.reduce((sum, topic) => sum + topic.mastery_score, 0) / totalTopics)
      : 0;

    return NextResponse.json({
      totalTopics,
      mastered,
      learning,
      weak,
      avgMastery,
      topics: data || [],
    });
  } catch (error) {
    console.error("mastery GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
