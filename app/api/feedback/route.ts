// ============================================================
// FinanceHub — Feedback API Route
// app/api/feedback/route.ts
// Receives feedback → saves to DB → emails admin → 200 OK
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { Resend }                    from "resend";

const resend     = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",")[0]?.trim()
                  || "mrpdrecuniverse@gmail.com";
const FROM        = process.env.RESEND_FROM_EMAIL || "hello@financehub.in";
const APP_URL     = process.env.NEXT_PUBLIC_APP_URL || "https://financehub.in";

type FeedbackType = "rating"|"bug"|"feature"|"question"|"content"|"other";

const TYPE_LABELS: Record<FeedbackType, string> = {
  rating:  "⭐ Website Rating",
  bug:     "🐛 Bug Report",
  feature: "💡 Feature Request",
  question:"❓ Question",
  content: "📚 Content Issue",
  other:   "💬 General Feedback",
};

const TYPE_URGENCY: Record<FeedbackType, string> = {
  bug:     "🔴 HIGH — needs investigation",
  content: "🟡 MEDIUM — content review needed",
  rating:  "🟢 LOW",
  feature: "🟢 LOW",
  question:"🟡 MEDIUM — reply needed",
  other:   "🟢 LOW",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type     = "other",
      rating   = null,
      page     = null,
      message,
      email    = null,
      url      = null,
      ts       = new Date().toISOString(),
    } = body as {
      type?:    FeedbackType;
      rating?:  number | null;
      page?:    string | null;
      message:  string;
      email?:   string | null;
      url?:     string | null;
      ts?:      string;
    };

    // Validate
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    if (message.length > 1000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    // Save to Supabase feedback table
    try {
      const { createServiceClient } = await import("@/lib/supabase");
      const supabase = createServiceClient();
      await supabase.from("feedback").insert({
        type,
        rating,
        page,
        message: message.trim(),
        email,
        url,
        status: "new",
        created_at: ts,
      } as any);
    } catch (dbErr) {
      console.warn("DB insert fallback:", dbErr);
    }

    // Build email HTML for admin
    const typeLabel   = TYPE_LABELS[type as FeedbackType]   || "💬 Feedback";
    const urgency     = TYPE_URGENCY[type as FeedbackType]  || "🟢 LOW";
    const ratingStars = rating ? "★".repeat(rating) + "☆".repeat(5-rating) : null;
    const submittedAt = new Date(ts).toLocaleString("en-IN", {
      timeZone:"Asia/Kolkata", dateStyle:"full", timeStyle:"short",
    });

    const adminHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f4f6;margin:0;padding:20px}
  .card{background:#fff;max-width:560px;margin:0 auto;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb}
  .head{background:#0B1A2B;padding:20px 24px;display:flex;align-items:center;gap:10px}
  .logo{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#0E6163,#1D9E75);display:flex;align-items:center;justify-content:center;font-size:16px}
  .head h1{color:#fff;font-size:16px;font-weight:600;margin:0}
  .head p{color:rgba(255,255,255,0.5);font-size:12px;margin:0}
  .body{padding:24px}
  .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;margin-bottom:16px}
  .badge-bug{background:#FEF2F2;color:#991B1B}
  .badge-rating{background:#FFFBEB;color:#92400E}
  .badge-feature{background:#F0FDF4;color:#166534}
  .badge-question{background:#EFF6FF;color:#1E40AF}
  .badge-content{background:#FDF4FF;color:#6B21A8}
  .badge-other{background:#F1F5F9;color:#475569}
  .meta{background:#f8fafc;border-radius:10px;padding:16px;margin-bottom:20px;font-size:13px}
  .meta-row{display:flex;gap:8px;padding:4px 0;border-bottom:1px solid #f1f5f9}
  .meta-row:last-child{border:none}
  .meta-key{color:#9ca3af;width:80px;flex-shrink:0;font-size:12px}
  .meta-val{color:#1c2b3a;font-weight:500}
  .message-box{background:#f8fafc;border-left:3px solid #0E6163;padding:14px 16px;border-radius:0 8px 8px 0;font-size:14px;color:#374151;line-height:1.75;white-space:pre-wrap;margin-bottom:20px}
  .urgency{font-size:12px;color:#6b7280;margin-bottom:16px}
  .actions{display:flex;gap:8px;flex-wrap:wrap}
  .btn{display:inline-block;padding:9px 18px;border-radius:9px;font-size:13px;font-weight:600;text-decoration:none}
  .btn-primary{background:#0E6163;color:#fff}
  .btn-secondary{background:#f1f5f9;color:#374151}
  .footer{padding:16px 24px;border-top:1px solid #f0f0f0;font-size:11px;color:#9ca3af;text-align:center}
  .stars{font-size:18px;color:#F59E0B;letter-spacing:1px}
</style></head>
<body>
<div class="card">
  <div class="head">
    <div class="logo">📈</div>
    <div>
      <h1>New Feedback — FinanceHub</h1>
      <p>${submittedAt} IST</p>
    </div>
  </div>
  <div class="body">
    <span class="badge badge-${type}">${typeLabel}</span>

    <div class="urgency">Priority: ${urgency}</div>

    <div class="meta">
      ${ratingStars ? `<div class="meta-row"><span class="meta-key">Rating</span><span class="meta-val stars">${ratingStars}</span></div>` : ""}
      ${page ? `<div class="meta-row"><span class="meta-key">Page</span><span class="meta-val">${page}</span></div>` : ""}
      ${url  ? `<div class="meta-row"><span class="meta-key">URL</span><span class="meta-val" style="font-family:monospace;font-size:11px">${url}</span></div>` : ""}
      ${email ? `<div class="meta-row"><span class="meta-key">From</span><span class="meta-val"><a href="mailto:${email}" style="color:#0E6163">${email}</a></span></div>` : ""}
      <div class="meta-row"><span class="meta-key">Time</span><span class="meta-val">${submittedAt}</span></div>
    </div>

    <div style="font-size:12px;font-weight:600;color:#6b7280;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Message</div>
    <div class="message-box">${message.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>

    <div class="actions">
      ${email ? `<a href="mailto:${email}?subject=Re: Your FinanceHub feedback&body=Hi,%0A%0AThank you for your feedback about FinanceHub.%0A%0A----%0A${encodeURIComponent(message.slice(0,100))}" class="btn btn-primary">Reply to ${email.split("@")[0]}</a>` : ""}
      <a href="${APP_URL}/admin/dashboard" class="btn btn-secondary">Open admin</a>
    </div>
  </div>
  <div class="footer">
    This is an automated notification from FinanceHub feedback system · <a href="${APP_URL}" style="color:#0E6163">financehub.in</a>
  </div>
</div>
</body></html>`;

    // Send admin notification email
    const emailSubject = `[${type.toUpperCase()}] FinanceHub feedback${email ? ` from ${email}` : ""}${rating ? ` — ${rating}/5 stars` : ""}`;

    const { error: emailError } = await resend.emails.send({
      from:    FROM,
      to:      ADMIN_EMAIL,
      reply_to: email || undefined,
      subject: emailSubject,
      html:    adminHtml,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      // Don't fail the request — feedback is still valid even if email fails
    }

    // Optionally send confirmation to user
    if (email) {
      const userSubject = `Got your feedback — FinanceHub`;
      const userHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f4f6;margin:0;padding:20px}
  .card{background:#fff;max-width:500px;margin:0 auto;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb}
  .head{background:#0B1A2B;padding:20px 24px}
  .head h1{color:#fff;font-size:17px;font-weight:600;margin:0 0 4px}
  .head p{color:rgba(255,255,255,0.5);font-size:12px;margin:0}
  .body{padding:24px}
  p{font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 14px}
  .quote{background:#f8fafc;border-left:3px solid #0E6163;padding:12px 16px;border-radius:0 8px 8px 0;font-size:13px;color:#6b7280;font-style:italic;margin:16px 0}
  .footer{padding:14px 24px;border-top:1px solid #f0f0f0;font-size:11px;color:#9ca3af;text-align:center}
</style></head>
<body>
<div class="card">
  <div class="head">
    <h1>We got your message 📬</h1>
    <p>FinanceHub · Feedback confirmation</p>
  </div>
  <div class="body">
    <p>Thank you for taking the time to share your feedback with us. We read every single message.</p>
    <div class="quote">"${message.slice(0, 200).replace(/</g,"&lt;")}${message.length > 200 ? "…" : ""}"</div>
    <p>We'll get back to you within 24 hours if a response is needed.</p>
    <p style="font-size:13px;color:#9ca3af">If you have anything urgent, email us directly at <a href="mailto:support@financehub.in" style="color:#0E6163">support@financehub.in</a></p>
  </div>
  <div class="footer">FinanceHub Education · <a href="${APP_URL}" style="color:#0E6163">financehub.in</a></div>
</div>
</body></html>`;

      await resend.emails.send({
        from:    FROM,
        to:      email,
        subject: userSubject,
        html:    userHtml,
      }).catch(console.error); // Never fail the main request for this
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: any) {
    console.error("Feedback API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
