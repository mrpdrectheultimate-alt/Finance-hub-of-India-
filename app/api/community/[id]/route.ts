import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const questionId = params.id;

    if (!questionId) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
    }

    // Fetch Question Detail
    const { data: question, error: qError } = await supabase
      .from("lesson_questions")
      .select(`
        id,
        lesson_id,
        user_id,
        question,
        is_answered,
        is_pinned,
        upvote_count,
        answer_count,
        created_at,
        profiles (
          full_name,
          avatar_url
        ),
        lessons (
          title,
          slug
        )
      `)
      .eq("id", questionId)
      .single();

    if (qError || !question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Fetch Answers for this Question
    const { data: answers, error: aError } = await supabase
      .from("question_answers")
      .select(`
        id,
        question_id,
        user_id,
        answer,
        is_accepted,
        is_staff,
        is_ai,
        upvote_count,
        created_at,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq("question_id", questionId)
      .eq("is_flagged", false)
      .order("is_accepted", { ascending: false })
      .order("upvote_count", { ascending: false })
      .order("created_at", { ascending: true });

    if (aError) {
      console.error("[Community Detail Answers Error]:", aError);
    }

    return NextResponse.json({
      question,
      answers: answers || [],
    });
  } catch (err: any) {
    console.error("[Community Question Detail Exception]:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
