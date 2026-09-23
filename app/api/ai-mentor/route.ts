// ============================================================
// FinanceHub — AI Mentor API (Upgraded)
// app/api/ai-mentor/route.ts
// Personalised · Source-cited · Safety-aware · Learner-context
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import Anthropic                     from "@anthropic-ai/sdk";
import { createServerClient }        from "@/lib/supabase";
import { checkAIRateLimit, incrementAIUsage } from "@/lib/ai-rate-limit";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ─── Intent classifier ────────────────────────────────────────
type Intent =
  | "education"      // explain a concept
  | "calculation"    // help with a number/formula
  | "comparison"     // compare two things
  | "recommendation" // asking what to do (needs disclaimer)
  | "quiz"           // wants a practice question
  | "clarification"  // follow-up on previous answer
  | "off_topic";     // not finance related

function classifyIntent(question: string): Intent {
  const q = question.toLowerCase();
  if (/what is|explain|define|how does|tell me about|meaning of/.test(q)) return "education";
  if (/calculat|how much|formula|compute|working out/.test(q))            return "calculation";
  if (/vs|versus|difference|compare|better|which one/.test(q))            return "comparison";
  if (/should i|recommend|advice|suggest|what to do|i have.*rupee/.test(q)) return "recommendation";
  if (/quiz|test me|question|practice|ask me/.test(q))                    return "quiz";
  if (/clarif|more detail|elaborate|example|can you|could you/.test(q))   return "clarification";
  return "education"; // default — treat as education
}

// ─── Build system prompt ──────────────────────────────────────
interface LearnerContext {
  name:            string;
  tier:            string;
  primaryTrack:    string;
  completedCount:  number;
  weakAreas:       string[];
  lastLesson:      string;
  masteryAvg:      number;
}

function buildSystemPrompt(ctx: LearnerContext, intent: Intent): string {
  const SOURCES = `
AUTHORITATIVE INDIAN FINANCE SOURCES:
- Reserve Bank of India: rbi.org.in
- SEBI: sebi.gov.in
- AMFI: amfiindia.com
- NSE India: nseindia.com
- BSE India: bseindia.com
- Income Tax India: incometax.gov.in
- EPFO: epfindia.gov.in
- PFRDA (NPS): pfrda.org.in
- IRDAI (Insurance): irdai.gov.in
- NCFE (Financial Education): ncfe.org.in
- Zerodha Varsity: zerodha.com/varsity
`;

  const SAFETY_RULES = `
CRITICAL SAFETY RULES — NEVER VIOLATE:
1. NEVER recommend specific stocks, mutual funds, or financial products by name as purchases
2. NEVER give tax advice specific to someone's situation — always say "consult a CA"
3. NEVER promise or imply specific returns ("you will earn X%")
4. NEVER advise on legal matters — say "consult a lawyer"
5. ALWAYS end answers about investing/trading with the standard disclaimer
6. If asked "should I invest in X", explain factors to consider, not a yes/no answer
7. For children or minors (if apparent): keep all content age-appropriate, no speculative content
8. Never advise on F&O/derivatives trading without prominent risk warning
`;

  const STYLE_RULES = `
RESPONSE STYLE:
- Use Indian examples with ₹ amounts (not $ or generic amounts)
- Reference Indian institutions (SEBI, RBI, AMFI, NSE, BSE, EPFO, NPS, IRDAI)
- Keep explanations clear for someone who may be new to finance
- Use simple analogies to explain complex concepts
- When giving a formula, always follow it with a worked numerical example
- Maximum response length: 350 words unless complex calculation requires more
- Always cite at least one source for factual claims using format: [Source: institution/url]
- Structure: Answer → Example → Source → (Disclaimer if needed)
`;

  const LEARNER_CTX = `
LEARNER CONTEXT — personalise your response accordingly:
- Name: ${ctx.name || "Learner"}
- Subscription: ${ctx.tier}
- Primary learning track: ${ctx.primaryTrack || "Personal Finance"}
- Lessons completed: ${ctx.completedCount}
- Knowledge level: ${ctx.completedCount < 10 ? "beginner" : ctx.completedCount < 40 ? "intermediate" : "advanced"}
- Weak areas: ${ctx.weakAreas.length > 0 ? ctx.weakAreas.join(", ") : "none identified yet"}
- Last lesson studied: ${ctx.lastLesson || "unknown"}
- Average concept mastery: ${ctx.masteryAvg > 0 ? `${ctx.masteryAvg}%` : "not yet measured"}

Adjust complexity to their level. Reference their completed lessons if relevant.
If they have weak areas, gently connect explanations to strengthen those.
`;

  const INTENT_GUIDANCE: Record<Intent, string> = {
    education:      "This is an educational question. Explain clearly with structure: definition → why it matters → India example → source.",
    calculation:    "This requires a calculation. Show the formula, then walk through a numerical example step by step with Indian ₹ amounts.",
    comparison:     "Compare the two options clearly. Use a simple table format if helpful. Be balanced — don't recommend one without context.",
    recommendation: "The learner is seeking advice. DO NOT give a direct recommendation. Instead: explain the key factors to consider, common approaches, and end with 'discuss your specific situation with a SEBI-registered advisor.'",
    quiz:           "Generate a single multiple-choice question on the topic they mentioned. Give 4 options (A, B, C, D). After they answer (or if they ask), reveal the correct answer with explanation.",
    clarification:  "Provide more detail or a different angle on the previous explanation. Add a new example they haven't seen yet.",
    off_topic:      "Gently redirect. Say you specialise in finance education and suggest a finance topic you could help with instead.",
  };

  return `You are FinanceHub's AI Finance Mentor — India's most helpful finance education AI.

${LEARNER_CTX}

${SOURCES}

${SAFETY_RULES}

${STYLE_RULES}

CURRENT QUESTION INTENT: ${INTENT_GUIDANCE[intent]}

STANDARD DISCLAIMER (include when discussing investing, trading, or specific financial decisions):
"⚠️ Educational content only — not personalised financial advice. Consult a SEBI-registered advisor for decisions specific to your situation."`;
}

// ─── Main handler ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please sign in to use AI Mentor." }, { status: 401 });
    }

    // Rate limit check
    const rateLimit = await checkAIRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        error:     `Daily limit reached. You've used all ${rateLimit.limit} AI questions for today.`,
        resetAt:   rateLimit.resetAt,
        remaining: 0,
        limit:     rateLimit.limit,
        tier:      rateLimit.tier,
        upgrade:   rateLimit.tier === "free",
      }, { status: 429 });
    }

    const body = await req.json();
    const { question, conversationHistory = [], lessonContext } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: "Please enter a question." }, { status: 400 });
    }

    // Get learner context
    const [profileRes, progressRes, masteryRes] = await Promise.all([
      supabase.from("profiles")
        .select("full_name,subscription_tier,primary_track,onboarding_level")
        .eq("id", user.id).single(),

      (supabase.from("user_progress") as any)
        .select("lesson_id,lessons(title)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(50),

      supabase.from("user_concept_mastery")
        .select("mastery_score,concepts(name)")
        .eq("user_id", user.id)
        .lt("mastery_score", 50)
        .limit(5),
    ]);

    const profile   = profileRes.data as any;
    const progress  = (progressRes.data || []) as any[];
    const weakItems = (masteryRes.data || []) as any[];

    const ctx: LearnerContext = {
      name:           profile?.full_name?.split(" ")[0] || "there",
      tier:           profile?.subscription_tier || "free",
      primaryTrack:   profile?.primary_track || "personal-finance",
      completedCount: progress.length,
      weakAreas:      weakItems.map((w: any) => w.concepts?.name).filter(Boolean),
      lastLesson:     (progress[0] as any)?.lessons?.title || "",
      masteryAvg:     0,
    };

    const intent = classifyIntent(question);

    // Build conversation for Claude
    const systemPrompt = buildSystemPrompt(ctx, intent);

    // Add lesson context if available
    const enhancedQuestion = lessonContext
      ? `[Context: User is studying "${lessonContext.lessonTitle}" in ${lessonContext.trackName}]\n\n${question}`
      : question;

    // Format history for Claude
    const messages = [
      ...conversationHistory.slice(-6).map((msg: any) => ({
        role:    msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: enhancedQuestion },
    ];

    // Call Claude with streaming
    const stream = await anthropic.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 1024,
      system:     systemPrompt,
      messages,
      stream:     true,
    });

    // Increment usage atomically
    await incrementAIUsage(user.id);

    // Log the question for analytics
    (supabase as any).from("ai_question_logs").insert({
      user_id:       user.id,
      question:      question.slice(0, 500),
      intent,
      lesson_context: lessonContext?.lessonTitle,
      track_context:  ctx.primaryTrack,
      created_at:    new Date().toISOString(),
    }).then(() => {}).catch(() => {});

    // Stream response back
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            const text = chunk.delta.text;
            fullResponse += text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }

        // Send metadata at end
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          done:       true,
          remaining:  rateLimit.remaining - 1,
          limit:      rateLimit.limit,
          intent,
          tier:       ctx.tier,
        })}\n\n`));

        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type":  "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection":    "keep-alive",
        "X-Remaining":   String(rateLimit.remaining - 1),
        "X-Limit":       String(rateLimit.limit),
      },
    });

  } catch (err: any) {
    console.error("AI Mentor error:", err);
    return NextResponse.json(
      { error: "AI Mentor is temporarily unavailable. Please try again in a moment." },
      { status: 500 }
    );
  }
}
