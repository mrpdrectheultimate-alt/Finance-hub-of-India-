import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const questionId = params.id;
    const body = await req.json();
    const { user_id, answer, is_staff, is_ai } = body;

    if (!user_id || !answer || answer.length < 10) {
      return NextResponse.json(
        { error: "Missing required fields or answer too short (min 10 characters)" },
        { status: 400 }
      );
    }

    // Insert Answer
    const { data: newAnswer, error: insertError } = await supabase
      .from("question_answers")
      .insert({
        question_id: questionId,
        user_id,
        answer,
        is_staff: Boolean(is_staff),
        is_ai: Boolean(is_ai),
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Community Answer POST Insert Error]:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Increment answer_count & set is_answered = true on lesson_questions
    const { data: qData } = await supabase
      .from("lesson_questions")
      .select("answer_count")
      .eq("id", questionId)
      .single();

    const newCount = (qData?.answer_count || 0) + 1;

    await supabase
      .from("lesson_questions")
      .update({
        answer_count: newCount,
        is_answered: true,
      })
      .eq("id", questionId);

    // Award +25 XP for providing an answer
    try {
      await supabase.from("user_xp_log").insert({
        user_id,
        xp_earned: 25,
        activity_type: "community_answer",
        description: "Answered a community question",
      });
    } catch (e) {
      console.warn("Could not log XP for answer:", e);
    }

    return NextResponse.json({ success: true, answer: newAnswer });
  } catch (err: any) {
    console.error("[Community Answer POST Exception]:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
