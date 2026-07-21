import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase";
import { rateLimitMemory } from "@/lib/rate-limit";
import { requireAuth, sanitizeString } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

type WeakTopic = {
  topic_title?: string;
};

export async function GET(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  try {
    const supabase = createServerClient();
    const trackSlug = sanitizeString(req.nextUrl.searchParams.get("track"), 80) || null;

    const [{ data: dashboard }, { data: weakTopics }, { data: dueReviews }, { data: nextLesson }] =
      await Promise.all([
        supabase.rpc("get_dashboard_data" as never, { p_user_id: user!.id } as never),
        supabase.rpc("get_weak_topics" as never, { p_user_id: user!.id } as never),
        supabase.rpc("get_due_reviews" as never, { p_user_id: user!.id } as never),
        supabase.rpc("get_next_recommended_lesson" as never, {
          p_user_id: user!.id,
          p_track_slug: trackSlug,
        } as never),
      ]);

    return NextResponse.json({
      dashboard,
      weakTopics: weakTopics || [],
      dueReviews: dueReviews || [],
      nextLesson: Array.isArray(nextLesson) ? nextLesson[0] || null : null,
    });
  } catch (error) {
    console.error("recommendations GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const rateLimit = rateLimitMemory({ key: `ai-path:${user!.id}`, limit: 3, windowSecs: 3600 });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many path requests. Try again in an hour." }, { status: 429 });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI recommendations are not configured yet." }, { status: 500 });
    }

    const body = (await req.json()) as { goal?: unknown };
    const goal = sanitizeString(body.goal, 300);
    if (!goal) return NextResponse.json({ error: "goal required" }, { status: 400 });

    const supabase = createServerClient();
    const [{ data: profile }, { data: progress }, { data: weakTopics }] = await Promise.all([
      supabase.from("profiles").select("role, xp_total, streak_current").eq("id", user!.id).single(),
      supabase.from("user_progress").select("lesson_id").eq("user_id", user!.id),
      supabase.rpc("get_weak_topics" as never, { p_user_id: user!.id } as never),
    ]);

    const weakList = ((weakTopics || []) as WeakTopic[])
      .slice(0, 5)
      .map((topic) => topic.topic_title)
      .filter(Boolean)
      .join(", ");

    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: `You are a personalised finance learning advisor at FinanceHub.
Available tracks: personal-finance, trading-markets, crypto-defi, corporate-finance.
User: completed ${progress?.length || 0} lessons, weak in: ${weakList || "none"}, XP: ${profile?.xp_total || 0}, plan: ${profile?.role || "free"}.
Respond ONLY in valid JSON (no markdown):
{"summary":"2-sentence intro","primary_track":"slug","recommended_tracks":["slug1","slug2"],"weekly_plan":[{"day":"Monday","focus":"topic","why":"reason"}],"encouragement":"one sentence"}`,
      messages: [{ role: "user", content: `My goal: ${goal}` }],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      parsed = { summary: text };
    }

    const path = parsed as {
      summary?: string;
      recommended_tracks?: string[];
    };

    await supabase.from("user_learning_paths" as never).upsert({
      user_id: user!.id,
      goal,
      recommended_tracks: path.recommended_tracks || [],
      ai_reasoning: path.summary || "",
      updated_at: new Date().toISOString(),
    } as never, { onConflict: "user_id" });

    return NextResponse.json({ path: parsed });
  } catch (error) {
    console.error("recommendations POST error:", error);
    return NextResponse.json({ error: "Failed to generate path" }, { status: 500 });
  }
}
