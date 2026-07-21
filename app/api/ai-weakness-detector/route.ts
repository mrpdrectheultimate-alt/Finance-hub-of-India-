import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitMemory } from "@/lib/rate-limit";
import { requireAuth, sanitizeString } from "@/lib/security";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type WrongAnswer = {
  question?: unknown;
  userAnswer?: unknown;
  correctAnswer?: unknown;
  explanation?: unknown;
};

export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const rl = rateLimitMemory({ key: `weakness:${user!.id}`, limit: 20, windowSecs: 3600 });
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: "Rate limit reached. Try again later." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const mode = sanitizeString(body.mode || "quiz", 20);
    const supabase = createServerClient();

    if (mode === "quiz") {
      const wrongAnswers = Array.isArray(body.wrongAnswers) ? (body.wrongAnswers as WrongAnswer[]) : [];
      const quizTitle = sanitizeString(body.quizTitle || "Practice quiz", 160);
      const lessonTitle = sanitizeString(body.lessonTitle || "Current lesson", 160);

      if (!wrongAnswers.length) {
        return NextResponse.json({ analysis: null, message: "No wrong answers to analyse" });
      }

      const wrongSummary = wrongAnswers
        .slice(0, 10)
        .map((wrong, i) => {
          const question = sanitizeString(wrong.question, 500);
          const userAnswer = sanitizeString(wrong.userAnswer, 250);
          const correctAnswer = sanitizeString(wrong.correctAnswer, 250);
          const explanation = sanitizeString(wrong.explanation, 600);

          return `Q${i + 1}: "${question}"\nUser chose: "${userAnswer}"\nCorrect answer: "${correctAnswer}"\nExplanation: "${explanation}"`;
        })
        .join("\n\n");

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        messages: [
          {
            role: "user",
            content: `You are a finance tutor analysing a student's quiz mistakes to help them learn.

Quiz: ${quizTitle}
Lesson: ${lessonTitle}

Wrong answers:
${wrongSummary}

Provide a concise, encouraging analysis in JSON:
{
  "misconceptions": ["specific misconception 1", "specific misconception 2"],
  "root_cause": "One sentence identifying the core gap in understanding",
  "targeted_explanation": "2-3 sentence explanation that directly addresses the misconceptions in simple terms",
  "memory_trick": "A memorable analogy or trick to remember the correct concept",
  "study_focus": ["topic to review 1", "topic to review 2"],
  "encouragement": "One encouraging sentence specific to their performance"
}`,
          },
        ],
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "{}";
      let analysis: unknown;
      try {
        analysis = JSON.parse(text.replace(/```json|```/g, "").trim());
      } catch {
        analysis = { targeted_explanation: text };
      }

      return NextResponse.json({ mode: "quiz", analysis });
    }

    if (mode === "scan") {
      const { data: weakTopics } = await supabase.rpc("get_weak_topics" as never, { p_user_id: user!.id } as never);
      const typedWeakTopics = (weakTopics || []) as Array<{
        topic_title?: string;
        mastery_score?: number;
        track_slug?: string;
      }>;

      if (!typedWeakTopics.length) {
        return NextResponse.json({
          mode: "scan",
          message: "No weak topics found yet. Complete more lessons and quizzes to get your weakness analysis.",
          weakTopics: [],
        });
      }

      const topicSummary = typedWeakTopics
        .slice(0, 8)
        .map((topic) => `${topic.topic_title} (mastery: ${topic.mastery_score}%, track: ${topic.track_slug})`)
        .join("\n");

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `You are a finance learning advisor. A student has these weak areas:

${topicSummary}

Analyse their weakness pattern and provide a personalised improvement plan in JSON:
{
  "pattern": "One sentence identifying the overall pattern in their weaknesses",
  "priority_topics": [
    {
      "topic": "topic name",
      "why_important": "why mastering this matters",
      "quick_tip": "one concrete tip to improve this specific topic"
    }
  ],
  "learning_sequence": ["topic 1 to study first", "topic 2", "topic 3"],
  "time_estimate": "e.g. '2 weeks of 30 min/day'",
  "daily_action": "One specific action they can take today"
}`,
          },
        ],
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "{}";
      let plan: unknown;
      try {
        plan = JSON.parse(text.replace(/```json|```/g, "").trim());
      } catch {
        plan = { pattern: text };
      }

      return NextResponse.json({ mode: "scan", plan, weakTopics: typedWeakTopics });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err) {
    console.error("Weakness detector error:", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
