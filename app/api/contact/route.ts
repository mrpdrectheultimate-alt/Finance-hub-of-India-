// ============================================================
// FinanceHub — Contact Team & Support Inquiries API
// app/api/contact/route.ts
// Receives contact inquiries → saves to Supabase → sends Resend emails → returns 200
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getAppUrl } from "@/lib/url";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_key");
const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",")[0]?.trim() ||
  "mrpdrecuniverse@gmail.com";
const FROM = process.env.RESEND_FROM_EMAIL || "hello@financehub.in";
const APP_URL = getAppUrl();

const CATEGORY_LABELS: Record<string, string> = {
  general: "💬 General Inquiry",
  curriculum: "🎓 Curriculum & Learning Tracks",
  billing: "💳 Billing, Subscription & Refunds",
  bug: "🐛 Bug Report or Technical Issue",
  partnership: "🤝 College / Institutional Partnership",
  compliance: "⚖️ Legal & SEBI Compliance",
  grievance: "🛡️ Grievance Officer Escalation",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      category = "general",
      subject,
      message,
    } = body as {
      name?: string;
      email?: string;
      phone?: string;
      category?: string;
      subject?: string;
      message?: string;
    };

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }
    if (!email?.trim() || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }
    if (!subject?.trim()) {
      return NextResponse.json({ error: "Please provide a subject line." }, { status: 400 });
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: "Please enter your message." }, { status: 400 });
    }
    if (message.trim().length > 3000) {
      return NextResponse.json(
        { error: "Message is too long. Please keep it under 3,000 characters." },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();
    const cleanPhone = phone?.trim() || null;
    const categoryLabel = CATEGORY_LABELS[category] || category;
    const timestamp = new Date().toISOString();
    const istTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "short",
    });

    // 1. Save to Supabase (feedback table for immediate admin dashboard visibility)
    try {
      const { createServiceClient } = await import("@/lib/supabase");
      const supabase = createServiceClient();

      // Map to feedback type: bug | question | feature | other
      const feedbackType =
        category === "bug"
          ? "bug"
          : category === "billing" || category === "curriculum"
          ? "question"
          : "other";

      const formattedMessage = [
        `[CONTACT INQUIRY — ${categoryLabel}]`,
        `Subject: ${cleanSubject}`,
        `From: ${cleanName} <${cleanEmail}>${cleanPhone ? ` | Phone: ${cleanPhone}` : ""}`,
        `Time: ${istTime}`,
        "----------------------------------------",
        cleanMessage,
      ].join("\n");

      // Save into standard feedback table (accessible in /admin/feedback)
      await supabase.from("feedback").insert({
        type: feedbackType,
        page: "/contact",
        message: formattedMessage.slice(0, 1000), // ensure fits feedback limit
        email: cleanEmail,
        url: "/contact",
        status: "new",
        created_at: timestamp,
      } as any);

      // Attempt saving to contact_inquiries table if it exists
      try {
        await supabase.from("contact_inquiries" as any).insert({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          category,
          subject: cleanSubject,
          message: cleanMessage,
          status: "new",
          created_at: timestamp,
        } as any);
      } catch {
        // Table might not exist yet; safe to ignore as feedback table captured it
      }
    } catch (dbErr) {
      console.warn("DB insert notice:", dbErr);
    }

    // 2. Email Admin via Resend
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("placeholder")) {
      try {
        const adminEmailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
  .card { background: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .head { background: linear-gradient(135deg, #0A192F 0%, #0E4B4C 100%); padding: 24px; color: #ffffff; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: rgba(255,255,255,0.15); color: #34d399; margin-bottom: 8px; }
  .title { margin: 0; font-size: 18px; font-weight: 700; }
  .body { padding: 24px; }
  .field { margin-bottom: 16px; }
  .label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
  .value { font-size: 14px; color: #0f172a; font-weight: 500; }
  .message-box { background: #f8fafc; border-left: 4px solid #0E6163; padding: 16px; border-radius: 0 12px 12px 0; font-size: 14px; line-height: 1.7; white-space: pre-wrap; color: #334155; margin-top: 16px; }
  .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }
  .btn { display: inline-block; padding: 10px 20px; background: #0E6163; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px; margin-top: 16px; }
</style></head>
<body>
  <div class="card">
    <div class="head">
      <div class="badge">${categoryLabel}</div>
      <h1 class="title">New Contact Inquiry from ${cleanName}</h1>
      <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.8;">Received: ${istTime}</p>
    </div>
    <div class="body">
      <div class="field">
        <div class="label">Sender Name & Email</div>
        <div class="value">${cleanName} &lt;<a href="mailto:${cleanEmail}">${cleanEmail}</a>&gt;</div>
      </div>
      ${cleanPhone ? `<div class="field"><div class="label">Phone</div><div class="value">${cleanPhone}</div></div>` : ""}
      <div class="field">
        <div class="label">Subject</div>
        <div class="value" style="font-weight: 700; color: #0E6163;">${cleanSubject}</div>
      </div>
      <div class="field">
        <div class="label">Message Content</div>
        <div class="message-box">${cleanMessage}</div>
      </div>
      <a href="mailto:${cleanEmail}?subject=Re: [FinanceHub] ${encodeURIComponent(cleanSubject)}" class="btn">Reply to ${cleanName}</a>
    </div>
    <div class="footer">FinanceHub of India · Automated Inbound Inquiry Notification</div>
  </div>
</body>
</html>`;

        await resend.emails.send({
          from: `FinanceHub Contact <${FROM}>`,
          to: ADMIN_EMAIL,
          reply_to: cleanEmail,
          subject: `[Contact] ${cleanSubject} — ${cleanName}`,
          html: adminEmailHtml,
        });

        // 3. Send User Confirmation Email
        const userConfirmationHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
  .card { background: #ffffff; max-width: 560px; margin: 0 auto; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
  .head { background: #0A192F; padding: 24px; color: #ffffff; text-align: center; }
  .logo { font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 4px; }
  .body { padding: 28px 24px; }
  .message-summary { background: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #e2e8f0; font-size: 13px; color: #475569; }
  .footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center; }
</style></head>
<body>
  <div class="card">
    <div class="head">
      <div class="logo">Finance<span style="color:#34d399">Hub</span></div>
      <p style="margin: 0; font-size: 13px; color: #94a3b8;">Inquiry Received &amp; Ticket Opened</p>
    </div>
    <div class="body">
      <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Hi ${cleanName},</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Thank you for contacting FinanceHub of India. We have successfully logged your inquiry regarding <strong>"${cleanSubject}"</strong>.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Our team reviews inquiries continuously and will respond to this email address within <strong>24 business hours</strong> (typically much faster during standard IST business hours).
      </p>
      <div class="message-summary">
        <strong>Inquiry Category:</strong> ${categoryLabel}<br>
        <strong>Subject:</strong> ${cleanSubject}<br>
        <strong>Submitted:</strong> ${istTime}
      </div>
      <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
        If your request is time-sensitive or pertains to a statutory SEBI/DPDP inquiry, please contact our grievance officer directly at <a href="mailto:grievance@financehub.in" style="color: #0E6163; font-weight: 600;">grievance@financehub.in</a>.
      </p>
    </div>
    <div class="footer">
      © 2026 FinanceHub of India. All rights reserved.<br>
      Educational content only · Not SEBI-registered financial advisory.
    </div>
  </div>
</body>
</html>`;

        await resend.emails.send({
          from: `FinanceHub Team <${FROM}>`,
          to: cleanEmail,
          subject: `We've received your message: "${cleanSubject}" — FinanceHub`,
          html: userConfirmationHtml,
        });
      } catch (emailErr) {
        console.warn("Resend email dispatch notice:", emailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you! Your message has been received. Our team will get back to you within 24 hours.",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again or email hello@financehub.in directly." },
      { status: 500 }
    );
  }
}
