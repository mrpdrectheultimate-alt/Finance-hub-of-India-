import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitMemory } from "@/lib/rate-limit";
import { requireAuth, sanitizeString } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const rl = rateLimitMemory({ key: `financial-explainer:${user!.id}`, limit: 20, windowSecs: 3600 });
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: "Too many explainer requests. Try again later." }), {
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
    const companyName = sanitizeString(body.companyName || "the company", 120);
    const statementType = sanitizeString(body.statementType || "financial statement", 80);
    const financialText = sanitizeString(body.financialText || body.statementText || "", 8000);
    const question = sanitizeString(body.question || "", 500);
    const audience = sanitizeString(body.audience || "beginner", 40);

    if (!financialText) {
      return NextResponse.json({ error: "financialText required" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1600,
      messages: [
        {
          role: "user",
          content: `You are a finance professor explaining company financials in plain language.

Company: ${companyName}
Statement type: ${statementType}
Audience level: ${audience}
User question: ${question || "Explain the statement clearly and highlight what matters."}

Financial text/data:
${financialText}

Rules:
- Explain only from the data provided. Do not invent missing numbers.
- If something cannot be concluded from the data, say so.
- Keep it educational and not investment advice.
- Use simple language but preserve important finance terms.

Respond ONLY in valid JSON:
{
  "plain_english_summary": "Short explanation of what this statement says",
  "key_numbers": [
    {"label": "metric name", "value": "value from provided data", "meaning": "why it matters"}
  ],
  "strengths": ["strength visible in the data"],
  "risks_or_red_flags": ["risk visible in the data"],
  "ratios_to_check": [
    {"ratio": "ratio name", "why": "why this ratio is useful", "can_calculate_from_data": true}
  ],
  "answer_to_user_question": "Direct answer to the user's question",
  "next_questions_to_ask": ["question an analyst should ask next"],
  "disclaimer": "Educational explanation only, not financial advice."
}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    let explanation: Record<string, unknown>;
    try {
      explanation = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      explanation = {
        plain_english_summary: text,
        disclaimer: "Educational explanation only, not financial advice.",
      };
    }

    return NextResponse.json({ explanation, companyName, statementType });
  } catch (err) {
    console.error("Financial explainer error:", err);
    return NextResponse.json({ error: "Failed to explain financial statement" }, { status: 500 });
  }
}
