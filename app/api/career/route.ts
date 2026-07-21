import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { requireAuth, sanitizeString, sanitizeUUID } from "@/lib/security";

type InterviewQuestion = {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
  company_type: string | null;
  tags: string[] | null;
  upvotes: number;
};

export async function GET(req: NextRequest) {
  const { user, error: authError, supabase } = await requireAuth(req);
  if (authError) return authError;

  const rateLimit = applyRateLimit(RATE_LIMITS.badgeCheck(user!.id), "Too many career hub requests.");
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const params = new URL(req.url).searchParams;
    const category = sanitizeString(params.get("category") || "all", 50);
    const difficulty = sanitizeString(params.get("difficulty") || "all", 20);
    const search = sanitizeString(params.get("search") || "", 120).toLowerCase();

    let query = supabase
      .from("interview_questions" as never)
      .select("id, question, answer, category, difficulty, company_type, tags, upvotes")
      .eq("is_published", true)
      .order("upvotes", { ascending: false })
      .limit(100);

    if (category !== "all") query = query.eq("category", category);
    if (difficulty !== "all") query = query.eq("difficulty", difficulty);

    const { data, error } = await query;
    if (error) {
      console.error("interview_questions lookup error:", error);
      return NextResponse.json({ error: "Failed to load interview questions" }, { status: 500 });
    }

    const { data: savedData } = await supabase
      .from("user_saved_questions" as never)
      .select("question_id")
      .eq("user_id", user!.id);

    const savedIds = new Set((savedData as { question_id: string }[] | null)?.map((item) => item.question_id) || []);
    const questions = ((data as InterviewQuestion[] | null) || [])
      .filter((item) => {
        if (!search) return true;
        return (
          item.question.toLowerCase().includes(search) ||
          (item.tags || []).some((tag) => tag.toLowerCase().includes(search))
        );
      })
      .map((item) => ({
        ...item,
        tags: item.tags || [],
        saved: savedIds.has(item.id),
      }));

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("career GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error: authError, supabase } = await requireAuth(req);
  if (authError) return authError;

  const rateLimit = applyRateLimit(RATE_LIMITS.badgeCheck(user!.id), "Too many save requests.");
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const body = await req.json();
    const questionId = sanitizeUUID(body.questionId);
    const action = sanitizeString(body.action, 20);

    if (!questionId) {
      return NextResponse.json({ error: "Valid questionId required" }, { status: 400 });
    }

    if (action === "unsave") {
      const { error } = await supabase
        .from("user_saved_questions" as never)
        .delete()
        .eq("user_id", user!.id)
        .eq("question_id", questionId);

      if (error) return NextResponse.json({ error: "Failed to unsave question" }, { status: 500 });
      return NextResponse.json({ saved: false });
    }

    const { error } = await supabase
      .from("user_saved_questions" as never)
      .upsert({ user_id: user!.id, question_id: questionId } as never, {
        onConflict: "user_id,question_id",
        ignoreDuplicates: true,
      });

    if (error) return NextResponse.json({ error: "Failed to save question" }, { status: 500 });
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("career POST error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
