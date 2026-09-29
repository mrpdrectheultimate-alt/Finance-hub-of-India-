// ============================================================
// FinanceHub — Lesson Completion API
// app/api/complete-lesson/route.ts
// Wires: progress · XP · weekly league · streak · certificate trigger
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerClient }        from "@/lib/supabase";

const XP_TABLE = {
  lesson:    10,
  quiz_pass: 25,
  quiz_fail:  5,
  review:    10,
  simulator:  5,
  note:       2,
};

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await (supabase.auth as any).getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { lessonId, timeSpentSeconds, quizScore, quizPassed, isReview } = body;

  if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 400 });

  const today = new Date().toISOString().split("T")[0];

  // ── 1. Mark lesson as complete ────────────────────────────
  const { data: existing } = await (supabase as any)
    .from("user_progress")
    .select("id, completed, completed_at")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .single();

  const alreadyCompleted = existing?.completed;

  await (supabase as any).from("user_progress").upsert({
    user_id:          user.id,
    lesson_id:        lessonId,
    completed:        true,
    completed_at:     new Date().toISOString(),
    time_spent_secs:  timeSpentSeconds || 0,
    quiz_score:       quizScore || null,
    last_accessed:    new Date().toISOString(),
  }, { onConflict: "user_id,lesson_id" });

  // ── 2. Calculate XP ───────────────────────────────────────
  let xpEarned = 0;
  const xpBreakdown: { action: string; xp: number }[] = [];

  // Only award lesson XP once (not on re-reads)
  if (!alreadyCompleted) {
    xpEarned += XP_TABLE.lesson;
    xpBreakdown.push({ action: "lesson", xp: XP_TABLE.lesson });
  }

  // Quiz XP (always awarded for attempt)
  if (quizScore !== undefined && quizScore !== null) {
    const quizXP = quizPassed ? XP_TABLE.quiz_pass : XP_TABLE.quiz_fail;
    xpEarned += quizXP;
    xpBreakdown.push({ action: quizPassed ? "quiz_pass" : "quiz_fail", xp: quizXP });
  }

  // Review bonus
  if (isReview) {
    xpEarned += XP_TABLE.review;
    xpBreakdown.push({ action: "review", xp: XP_TABLE.review });
  }

  // ── 3. Get lesson info ────────────────────────────────────
  const { data: lessonData } = await (supabase as any)
    .from("lessons")
    .select(`
      title, level_id,
      levels!inner(track_id, tracks!inner(id, name, slug))
    `)
    .eq("id", lessonId)
    .single();

  const trackId   = (lessonData as any)?.levels?.track_id;
  const trackName = (lessonData as any)?.levels?.tracks?.name || "";
  const trackSlug = (lessonData as any)?.levels?.tracks?.slug || "";

  // ── 4. Update profile XP and streak ──────────────────────
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("xp_total, current_streak, longest_streak, last_activity_date")
    .eq("id", user.id)
    .single();

  const lastDate   = profile?.last_activity_date;
  const yesterday  = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const newStreak = lastDate === today
    ? (profile?.current_streak || 1)        // Already active today
    : lastDate === yesterdayStr
      ? (profile?.current_streak || 0) + 1  // Consecutive day
      : 1;                                   // Streak broken

  const isStreakMilestone = [7, 30, 100, 365].includes(newStreak) && lastDate !== today;
  if (isStreakMilestone) {
    const milestoneXP = newStreak === 7 ? 50 : newStreak === 30 ? 200 : newStreak === 100 ? 500 : 2000;
    xpEarned += milestoneXP;
    xpBreakdown.push({ action: "streak_milestone", xp: milestoneXP });
  }

  // ── 5. Persist XP ────────────────────────────────────────
  if (xpEarned > 0) {
    await (supabase as any).from("profiles").update({
      xp_total:           (profile?.xp_total || 0) + xpEarned,
      current_streak:     lastDate !== today ? newStreak : profile?.current_streak || 1,
      longest_streak:     Math.max(newStreak, profile?.longest_streak || 0),
      last_activity_date: today,
      updated_at:         new Date().toISOString(),
    }).eq("id", user.id);

    // Log each XP component
    await (supabase as any).from("user_xp_log").insert(
      xpBreakdown.map(({ action, xp }) => ({
        user_id:     user.id,
        xp_amount:   xp,
        action,
        description: `${lessonData?.title || "Lesson"} — ${action.replace("_", " ")}`,
        lesson_id:   lessonId,
      }))
    );

    // Add to weekly leaderboard
    await (supabase as any).rpc("add_weekly_xp", {
      p_user_id: user.id,
      p_xp:      xpEarned,
      p_type:    quizScore !== undefined ? "quiz" : "lesson",
    });
  }

  // ── 6. Check for track completion + certificate ───────────
  let certificateId: string | null = null;
  if (trackId && !alreadyCompleted) {
    const { data: levelRes } = await (supabase as any)
      .from("levels")
      .select("id")
      .eq("track_id", trackId);

    const levelIds = (levelRes || []).map((l: any) => l.id);

    const { data: trackLessons } = levelIds.length > 0 ? await (supabase as any)
      .from("lessons")
      .select("id")
      .eq("is_published", true)
      .in("level_id", levelIds) : { data: [] };

    const lessonIds = (trackLessons || []).map((l: any) => l.id);

    const { data: completedInTrack } = lessonIds.length > 0 ? await (supabase as any)
      .from("user_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("completed", true)
      .in("lesson_id", lessonIds) : { data: [] };

    const totalInTrack    = trackLessons?.length || 0;
    const completedCount  = completedInTrack?.length || 0;

    if (totalInTrack > 0 && completedCount >= totalInTrack) {
      // Track complete — generate certificate
      try {
        const { data: verifyId } = await (supabase as any).rpc("generate_certificate", {
          p_user_id:  user.id,
          p_track_id: trackId,
        });
        certificateId = verifyId;
      } catch (certErr) {
        console.error("Certificate generation failed:", certErr);
      }
    }
  }

  // ── 7. Update concept mastery if lesson has concepts ─────
  const { data: lessonConcepts } = await (supabase as any)
    .from("concept_lessons")
    .select("concept_id")
    .eq("lesson_id", lessonId);

  if (lessonConcepts?.length) {
    for (const { concept_id } of lessonConcepts) {
      await (supabase as any).rpc("update_concept_mastery", {
        p_user_id:    user.id,
        p_concept_id: concept_id,
        p_quality:    quizScore ? Math.round(quizScore / 20) : 3,
      });
    }
  }

  // ── 8. Return summary ────────────────────────────────────
  return NextResponse.json({
    success:          true,
    xp_earned:        xpEarned,
    xp_breakdown:     xpBreakdown,
    new_streak:       newStreak,
    streak_milestone: isStreakMilestone ? newStreak : null,
    track_completed:  !!certificateId,
    certificate_id:   certificateId,
    track_name:       trackName,
    first_completion: !alreadyCompleted,
  });
}
