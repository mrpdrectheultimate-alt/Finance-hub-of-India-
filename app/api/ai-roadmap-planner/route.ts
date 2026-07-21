import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitMemory } from "@/lib/rate-limit";
import { requireAuth, sanitizeString } from "@/lib/security";

type WeakTopic = {
  topic_title?: string;
};

export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const rl = rateLimitMemory({ key: `roadmap:${user!.id}`, limit: 5, windowSecs: 3600 });
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: "Too many roadmap requests. Try again in an hour." }), {
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
    const goal = sanitizeString(body.goal, 500);
    const timeframe = sanitizeString(body.timeframe || "30", 10);
    const hoursPerDay = Math.min(Math.max(Number(body.hoursPerDay) || 1, 0.25), 4);
    const persona = sanitizeString(body.persona || "professional", 20);
    const examTarget = sanitizeString(body.examTarget || "", 50);

    if (!goal) return NextResponse.json({ error: "goal required" }, { status: 400 });

    const supabase = createServerClient();

    const [{ data: profile }, { data: progress }, { data: weakTopics }, { data: tracks }] = await Promise.all([
      supabase.from("profiles").select("role, xp_total, streak_current").eq("id", user!.id).single(),
      supabase.from("user_progress").select("lesson_id").eq("user_id", user!.id),
      supabase.rpc("get_weak_topics" as never, { p_user_id: user!.id } as never),
      supabase.from("tracks").select("title, slug").eq("is_active", true),
    ]);

    const completedCount = progress?.length || 0;
    const typedWeakTopics = (weakTopics || []) as WeakTopic[];
    const weakList = typedWeakTopics
      .slice(0, 5)
      .map((topic) => topic.topic_title)
      .filter(Boolean)
      .join(", ");
    const trackList = (tracks || []).map((track) => `${track.title} (${track.slug})`).join(", ");
    const parsedDays = Number.parseInt(timeframe, 10);
    const days = Number.isFinite(parsedDays) ? Math.min(Math.max(parsedDays, 7), 180) : 30;
    const totalHours = days * hoursPerDay;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are a world-class finance learning advisor creating a personalised study roadmap.

Student profile:
- Goal: ${goal}
- Persona: ${persona}
- Timeframe: ${days} days
- Daily study time: ${hoursPerDay} hour(s)
- Total study hours available: ${totalHours}
- Lessons completed: ${completedCount}
- Current weak areas: ${weakList || "none identified yet"}
- Exam target (if any): ${examTarget || "none"}
- Plan: ${profile?.role || "free"}
- XP: ${profile?.xp_total || 0}
- Current streak: ${profile?.streak_current || 0}

Available tracks on FinanceHub:
${trackList}

Create a realistic, detailed ${days}-day learning roadmap.
Assume 45 minutes per lesson. Factor in weak areas and revisit them.
For exam targets, emphasise relevant tracks.

Respond ONLY in this JSON format:
{
  "overview": "2-sentence summary of the plan and expected outcome",
  "weekly_schedule": [
    {
      "week": 1,
      "theme": "Week theme name",
      "focus_track": "track-slug",
      "daily_plan": [
        {
          "day": "Monday",
          "tasks": [
            {"type": "lesson", "topic": "specific topic name", "duration_mins": 45},
            {"type": "quiz", "topic": "quiz on same topic", "duration_mins": 15},
            {"type": "review", "topic": "weak area to revisit", "duration_mins": 20}
          ],
          "total_mins": 80
        }
      ],
      "milestone": "What you will be able to do by end of week"
    }
  ],
  "key_milestones": [
    {"day": 7, "milestone": "milestone description"},
    {"day": 30, "milestone": "milestone description"}
  ],
  "exam_focus": ${examTarget ? '"Specific exam preparation tips"' : "null"},
  "daily_habit": "One daily habit to build for the entire period",
  "success_metric": "How to measure if the plan is working"
}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    let roadmap: Record<string, unknown>;
    try {
      roadmap = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      return NextResponse.json({ error: "Failed to generate roadmap. Please try again." }, { status: 500 });
    }

    await supabase.from("user_learning_paths" as never).upsert(
      {
        user_id: user!.id,
        goal,
        persona,
        ai_reasoning: String(roadmap.overview || ""),
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id" }
    );

    return NextResponse.json({
      roadmap,
      meta: { goal, timeframe: days, hoursPerDay, examTarget, totalHours },
    });
  } catch (err) {
    console.error("Roadmap planner error:", err);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}
