import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase";
import type { Json } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { requireAuth, sanitizeString } from "@/lib/security";

const FREE_DAILY_LIMIT = 5;

const PERSONA_PROMPTS: Record<string, string> = {
  student: "You are explaining to a school or college student. Use simple language, relatable everyday analogies like pocket money and school fees, and avoid jargon. Keep answers under 150 words unless the student asks to go deeper.",
  professional: "You are explaining to a working professional in India. Be practical, use INR amounts, reference Indian financial products such as SIPs, PPF, NPS, and EPF, and focus on actionable takeaways. Keep answers concise.",
  trader: "You are explaining to an active trader or investor. You can use technical terms such as RSI, MACD, support/resistance, and options Greeks. Be precise and quantitative. Reference NIFTY and Indian market context where useful.",
  founder: "You are explaining to a startup founder or business owner. Focus on business implications: cash flow, unit economics, valuation, fundraising, and burn rate. Use startup examples and VC context.",
  default: "You are a patient, world-class finance tutor. Explain clearly at an intermediate level. Use real-world Indian examples where relevant.",
};

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type AiTutorRequest = {
  messages?: ChatMessage[];
  lessonTitle?: string;
  lessonContent?: string;
  userRole?: "free" | "pro" | "expert";
  persona?: string;
  lessonId?: string;
};

export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const rateLimit = applyRateLimit(RATE_LIMITS.aiTutor(user!.id), "Too many AI requests. Please wait a moment.");
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const { messages, lessonTitle, lessonContent, userRole, persona, lessonId } = (await req.json()) as AiTutorRequest;

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages are required." }, { status: 400 });
    }

    const supabase = createServerClient();
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI tutor is not configured yet." }, { status: 500 });
    }

    // Rate limit using atomic DB functions so page refreshes cannot reset usage.
    if (userRole === "free") {
      const { data: usageCount } = await supabase.rpc("get_ai_usage_today" as never, { p_user_id: user!.id } as never);
      if (((usageCount as number | null) || 0) >= FREE_DAILY_LIMIT) {
        return NextResponse.json(
          {
            error: "daily_limit_reached",
            message: "You've used your 5 free questions today. Upgrade to Pro for unlimited access.",
            upgradeUrl: "/pricing",
          },
          { status: 429 },
        );
      }
    }

    // Hydrate lesson context from DB when lessonId is provided but content is absent.
    const safeLessonId = sanitizeString(lessonId, 36);
    const safeLessonTitle = sanitizeString(lessonTitle, 200);
    let contextContent = sanitizeString(lessonContent, 4000);
    if (safeLessonId && !contextContent) {
      const { data: lesson } = await supabase
        .from("lessons")
        .select("content_mdx")
        .eq("id", safeLessonId)
        .single();

      contextContent = lesson?.content_mdx || "";
    }

    const safePersona = sanitizeString(persona, 20) || "default";
    const personaPrompt = PERSONA_PROMPTS[safePersona] || PERSONA_PROMPTS.default;
    const lessonContext = contextContent
      ? `\n\nCURRENT LESSON: "${safeLessonTitle || "Finance lesson"}"\nLESSON CONTENT:\n${contextContent.slice(0, 3000)}`
      : safeLessonTitle
        ? `\n\nCURRENT TOPIC: "${safeLessonTitle}"`
        : "";

    const systemPrompt = `You are an AI finance tutor for FinanceHub, a world-class finance education platform.

${personaPrompt}${lessonContext}

STRICT RULES:
1. Only answer finance, money, investing, trading, business, or economics questions.
2. If asked about anything else: "I'm your finance tutor - let's focus on financial topics!"
3. Never give direct quiz answers - guide thinking instead.
4. Add disclaimer for specific guidance: "Educational only. For personal decisions, consult a SEBI-registered advisor or CA."
5. Use **bold** for key terms. Keep answers focused - 2-4 paragraphs unless more depth is requested.
6. Never make up specific prices or returns - say "check current rates" instead.
7. Ground answers in lesson content above when relevant. Do not hallucinate.`;

    const claudeMessages = messages
      .filter((message) => message.role === "user" || message.role === "assistant")
      .slice(-10)
      .map((message) => ({
        role: message.role as "user" | "assistant",
        content: sanitizeString(message.content, 2000),
      }));

    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 700,
      system: systemPrompt,
      messages: claudeMessages,
    });

    const reply = response.content[0]?.type === "text" ? response.content[0].text : "";

    // Increment usage atomically after a successful response.
    await supabase.rpc("increment_ai_usage" as never, { p_user_id: user!.id } as never);

    await supabase.from("ai_conversations").insert({
      user_id: user!.id,
      lesson_id: safeLessonId || null,
      messages: messages as unknown as Json,
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI tutor error:", error);
    if (typeof error === "object" && error && "status" in error && error.status === 529) {
      return NextResponse.json({ error: "AI is temporarily busy. Please try again in a moment." }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to get AI response. Please try again." }, { status: 500 });
  }
}
