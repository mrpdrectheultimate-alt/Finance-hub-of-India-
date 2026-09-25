import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const lessonId = searchParams.get("lesson_id");
    const filter = searchParams.get("filter") || "all";
    const limit = parseInt(searchParams.get("limit") || "20");

    let query = supabase
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
      .eq("is_flagged", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (lessonId) {
      query = query.eq("lesson_id", lessonId);
    }

    if (filter === "unanswered") {
      query = query.eq("is_answered", false);
    } else if (filter === "pinned") {
      query = query.eq("is_pinned", true);
    }

    if (search) {
      query = query.ilike("question", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Community API GET Error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ questions: data || [] });
  } catch (err: any) {
    console.error("[Community API Exception]:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await req.json();
    const { user_id, lesson_id, question } = body;

    if (!user_id || !lesson_id || !question || question.length < 10) {
      return NextResponse.json(
        { error: "Missing required fields or question too short (min 10 characters)" },
        { status: 400 }
      );
    }

    // Insert question
    const { data: newQuestion, error: insertError } = await supabase
      .from("lesson_questions")
      .insert({
        user_id,
        lesson_id,
        question,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Community API POST Insert Error]:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Award +10 XP for community participation
    try {
      await supabase.from("user_xp_log").insert({
        user_id,
        xp_earned: 10,
        activity_type: "community_question",
        description: "Asked a lesson question",
      });
    } catch (e) {
      console.warn("Could not log XP for question:", e);
    }

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (err: any) {
    console.error("[Community API POST Exception]:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
