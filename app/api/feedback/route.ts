// ============================================================
// FinanceHub — Feedback API Route
// app/api/feedback/route.ts
// Handles user ratings, bug reports, feature requests & questions
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { Resend }                     from "resend";
import { createServiceClient }       from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy");
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",")[0]?.trim() || "hello@financehub.in";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, rating, page, message, email, url, ts } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // 1. Log to database (silently fail if table doesn't exist yet)
    try {
      await supabase.from("user_feedback").insert({
        type,
        rating,
        page,
        message: message.trim(),
        user_email: email ? email.trim() : null,
        url,
        created_at: ts || new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn("Feedback DB log fallback:", dbErr);
    }

    // 2. Dispatch email notification via Resend if API key configured
    if (process.env.RESEND_API_KEY) {
      const typeLabels: Record<string, string> = {
        rating:  "⭐ Rating",
        bug:     "🐛 Bug Report",
        feature: "💡 Feature Request",
        question:"❓ Question",
        content: "📚 Content Issue",
        other:   "💬 Feedback",
      };

      await resend.emails.send({
        from:    process.env.RESEND_FROM_EMAIL || "hello@financehub.in",
        to:      [ADMIN_EMAIL],
        subject: `[FinanceHub Feedback] ${typeLabels[type] || "New Feedback"} from ${email || "Anonymous User"}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #0E6163; margin-top: 0;">New Feedback Received</h2>
            <table style="width: 100%; text-align: left; border-collapse: collapse;">
              <tr><td style="padding: 8px; font-weight: bold; width: 120px;">Category:</td><td style="padding: 8px;">${typeLabels[type] || type}</td></tr>
              ${rating ? `<tr><td style="padding: 8px; font-weight: bold;">Rating:</td><td style="padding: 8px;">${"★".repeat(rating)}${"☆".repeat(5 - rating)} (${rating}/5)</td></tr>` : ""}
              ${page ? `<tr><td style="padding: 8px; font-weight: bold;">Page Context:</td><td style="padding: 8px;">${page}</td></tr>` : ""}
              <tr><td style="padding: 8px; font-weight: bold;">URL:</td><td style="padding: 8px;"><a href="${url}">${url}</a></td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">User Email:</td><td style="padding: 8px;">${email ? `<a href="mailto:${email}">${email}</a>` : "Not provided"}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Timestamp:</td><td style="padding: 8px;">${ts || new Date().toISOString()}</td></tr>
            </table>
            <div style="margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #1D9E75;">
              <h4 style="margin: 0 0 8px; color: #374151;">Message:</h4>
              <p style="margin: 0; white-space: pre-wrap; color: #111827; line-height: 1.6;">${message.trim()}</p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Feedback API error:", err);
    return NextResponse.json({ error: "Failed to process feedback" }, { status: 500 });
  }
}
