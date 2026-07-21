import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { requireAuth, sanitizeNumber, sanitizeUUID } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireAuth(req);
  if (authError) return authError;

  const rateLimit = applyRateLimit(
    RATE_LIMITS.completeLesson(user!.id),
    "Too many quiz submissions. Please slow down.",
  );
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const body = await req.json() as { lessonId?: unknown; quizId?: unknown; score?: unknown; passed?: unknown };
    const lessonId = sanitizeUUID(body.lessonId);
    const quizId = sanitizeUUID(body.quizId);
    const score = sanitizeNumber(body.score, 0, 100);
    const passed = Boolean(body.passed);

    if (!lessonId || !quizId) return NextResponse.json({ error: "Valid lessonId and quizId required" }, { status: 400 });

    const supabase = createServerClient();
    const { data, error } = await supabase.rpc("complete_quiz" as never, {
      p_user_id: user!.id,
      p_lesson_id: lessonId,
      p_quiz_id: quizId,
      p_score: Math.round(score),
      p_passed: passed,
    } as never);

    if (error) {
      console.error("complete_quiz RPC error:", error);
      return NextResponse.json({ error: "Failed to save quiz result" }, { status: 500 });
    }

    const { data: lessonTopics, error: lessonTopicsError } = await supabase
      .from("lesson_topics" as never)
      .select("topic_id")
      .eq("lesson_id", lessonId)
      .eq("is_primary", true);

    if (lessonTopicsError) {
      console.error("lesson_topics lookup error:", lessonTopicsError);
    }

    const masteryUpdates = await Promise.allSettled(
      ((lessonTopics || []) as unknown as Array<{ topic_id: string }>).map((lessonTopic) =>
        supabase.rpc("update_mastery_after_quiz" as never, {
          p_user_id: user!.id,
          p_topic_id: lessonTopic.topic_id,
          p_score: Math.round(score),
          p_passed: passed,
        } as never),
      ),
    );

    const masteryErrors = masteryUpdates.filter(
      (result) => result.status === "rejected" || (result.status === "fulfilled" && result.value.error),
    );

    if (masteryErrors.length > 0) {
      console.error("mastery update errors:", masteryErrors);
    }

    return NextResponse.json({
      ...(data && typeof data === "object" ? data : { result: data }),
      mastery_updated: masteryUpdates.length - masteryErrors.length,
    });
  } catch (error) {
    console.error("submit-quiz error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
