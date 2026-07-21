import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitMemory } from "@/lib/rate-limit";
import { requireAuth, sanitizeNumber, sanitizeString } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const rl = rateLimitMemory({ key: `exam-gen:${user!.id}`, limit: 10, windowSecs: 3600 });
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: "Too many exam requests. Try again later." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 500 });
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const body = await req.json();
    const topic = sanitizeString(body.topic, 200);
    const difficulty = sanitizeString(body.difficulty || "intermediate", 20);
    const count = sanitizeNumber(body.count || 5, 1, 10);
    const lessonId = sanitizeString(body.lessonId || "", 36);
    const examType = sanitizeString(body.examType || "general", 30);
    const saveToBank = Boolean(body.saveToBank);

    if (!topic) return NextResponse.json({ error: "topic required" }, { status: 400 });

    const supabase = createServerClient();

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
    if (profile?.role === "free") {
      return NextResponse.json({ error: "AI exam generator requires Pro plan" }, { status: 403 });
    }

    let lessonContext = "";
    if (lessonId) {
      const { data: lesson } = await supabase.from("lessons").select("title, content_mdx").eq("id", lessonId).single();
      if (lesson) {
        lessonContext = `\n\nBase questions on this lesson:\nTitle: ${lesson.title}\n${(lesson.content_mdx || "").slice(0, 2500)}`;
      }
    }

    const styleGuide: Record<string, string> = {
      cfa: "Use CFA Level 1 style: scenario-based vignettes, ethical dilemmas, and quantitative calculations.",
      frm: "Use FRM style: risk-focused, quantitative, Value at Risk, and Basel concepts.",
      ca: "Use CA Final/Inter style: Indian accounting standards (Ind AS), GST, and Companies Act 2013.",
      general: "Use clear educational MCQs with plausible, educational distractors.",
    };

    const difficultyGuide =
      difficulty === "easy"
        ? "basic recall"
        : difficulty === "hard"
          ? "deep analysis and application"
          : "moderate understanding and application";

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      messages: [
        {
          role: "user",
          content: `You are an expert finance educator creating a practice exam.

Topic: ${topic}
Difficulty: ${difficulty} (${difficultyGuide})
Style: ${styleGuide[examType] || styleGuide.general}
Questions needed: ${count}
${lessonContext}

Generate exactly ${count} high-quality multiple choice questions.

STRICT JSON response only. No markdown, no preamble:
{
  "questions": [
    {
      "question": "Full question text?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correct_index": 0,
      "explanation": "A is correct because [reason]. B is wrong because [reason]. C is wrong because [reason]. D is wrong because [reason].",
      "difficulty": "easy",
      "topic_tag": "specific sub-topic name"
    }
  ]
}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    let parsed: { questions?: Array<Record<string, unknown>> };
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response. Please try again." }, { status: 500 });
    }

    if (!parsed.questions?.length) {
      return NextResponse.json({ error: "AI generated no questions. Please try again." }, { status: 500 });
    }

    if (saveToBank && lessonId) {
      const { data: quiz } = await supabase
        .from("quizzes" as never)
        .insert({ lesson_id: lessonId, title: `AI: ${topic}`, passing_score: 70 } as never)
        .select()
        .single();

      if (quiz) {
        await supabase.from("quiz_questions" as never).insert(
          parsed.questions.map((q: Record<string, unknown>, i: number) => ({
            quiz_id: (quiz as { id: string }).id,
            question_text: q.question,
            options: q.options,
            correct_index: q.correct_index,
            explanation: q.explanation,
            order_index: i + 1,
          })) as never
        );
      }
    }

    return NextResponse.json({ questions: parsed.questions, topic, difficulty, examType });
  } catch (err) {
    console.error("Exam generator error:", err);
    return NextResponse.json({ error: "Failed to generate exam" }, { status: 500 });
  }
}
