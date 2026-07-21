import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { requireAuth, sanitizeUUID } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireAuth(req);
  if (authError) return authError;

  const rateLimit = applyRateLimit(
    RATE_LIMITS.completeLesson(user!.id),
    "Too many lesson completions. Please slow down.",
  );
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const body = await req.json() as { lessonId?: unknown; timeSpent?: unknown };
    const lessonId = sanitizeUUID(body.lessonId);
    const timeSpent = Math.min(Number(body.timeSpent) || 0, 86400);
    if (!lessonId) return NextResponse.json({ error: "Valid lessonId required" }, { status: 400 });

    const supabase = createServerClient();
    const { data, error } = await supabase.rpc("complete_lesson" as never, {
      p_user_id: user!.id,
      p_lesson_id: lessonId,
      p_time_spent: timeSpent,
    } as never);

    if (error) {
      console.error("complete_lesson RPC error:", error);
      return NextResponse.json({ error: "Failed to record completion" }, { status: 500 });
    }

    const result = data as { track_complete?: boolean } | null;
    if (result?.track_complete) {
      const { data: lesson } = await supabase
        .from("lessons")
        .select("level:levels(track:tracks(title, slug))")
        .eq("id", lessonId)
        .single();

      if (lesson) {
        console.log("Track completed:", lesson);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("complete-lesson error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
