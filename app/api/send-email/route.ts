import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { requireAuth, sanitizeNumber, sanitizeString } from "@/lib/security";

const FROM = process.env.RESEND_FROM_EMAIL || "hello@financehub.in";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://financehub.in";

type EmailTemplate = {
  subject: string;
  html: string;
};

function welcomeEmail(name: string): EmailTemplate {
  return {
    subject: "Welcome to FinanceHub - your learning path is ready",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:0.5px solid #e5e5e5">
    <div style="background:#1D9E75;padding:32px 36px;text-align:center">
      <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px">
        <span style="color:#fff;font-size:24px;font-weight:700">F</span>
      </div>
      <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0;letter-spacing:-0.5px">Welcome to FinanceHub</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:15px">Your finance education journey starts now</p>
    </div>
    <div style="padding:32px 36px">
      <p style="font-size:16px;color:#333;margin:0 0 20px">Hi ${name},</p>
      <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 24px">
        You have unlocked access to world-class finance education: structured, level-by-level, with an AI tutor available whenever you have a doubt.
      </p>
      <div style="background:#f8f8f8;border-radius:12px;padding:20px 24px;margin-bottom:24px">
        <p style="font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.06em;margin:0 0 14px">What's waiting for you</p>
        ${[
          ["Personal Finance", "Budgeting, saving, investing basics - free"],
          ["Trading and Markets", "From zero to reading charts - free to start"],
          ["Crypto and DeFi", "Blockchain basics, wallets, DeFi - free"],
          ["AI Finance Tutor", "Ask any doubt, get clear explanations"],
        ]
          .map(
            ([title, desc]) => `
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
            <span style="width:8px;height:8px;background:#1D9E75;border-radius:999px;flex-shrink:0"></span>
            <div>
              <div style="font-weight:600;font-size:14px;color:#0a0a0a">${title}</div>
              <div style="font-size:12px;color:#888">${desc}</div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
      <div style="text-align:center;margin-bottom:28px">
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#1D9E75;color:#fff;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none">
          Start learning
        </a>
      </div>
      <div style="border-left:3px solid #1D9E75;padding-left:16px;margin-bottom:20px">
        <p style="font-size:13px;color:#555;line-height:1.6;margin:0">
          <strong>Quick tip:</strong> Start with Personal Finance - Absolute Beginner, even if you think you know the basics. The foundation matters more than most people realise.
        </p>
      </div>
      <p style="font-size:14px;color:#888;margin:0">Happy learning,<br><strong style="color:#1D9E75">The FinanceHub Team</strong></p>
    </div>
    <div style="background:#fafafa;border-top:0.5px solid #eee;padding:16px 36px;text-align:center">
      <p style="font-size:11px;color:#ccc;margin:0;line-height:1.6">
        All content is educational only and does not constitute financial advice.<br>
        <a href="${APP_URL}/unsubscribe" style="color:#ccc">Unsubscribe</a> |
        <a href="${APP_URL}/privacy" style="color:#ccc">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}

function welcomeProEmail(name: string): EmailTemplate {
  return {
    subject: "Welcome to FinanceHub Pro - everything is unlocked",
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#fafafa;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:0.5px solid #e5e5e5">
    <div style="background:#1D9E75;padding:32px 36px;text-align:center">
      <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0">Welcome to FinanceHub Pro</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px">Your upgraded learning experience is ready</p>
    </div>
    <div style="padding:32px 36px">
      <p style="font-size:16px;color:#333;margin:0 0 18px">Hi ${name},</p>
      <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 22px">
        Your FinanceHub account has been upgraded. You now have access to premium lessons, unlimited AI tutor questions, certificates, and advanced modules.
      </p>
      <div style="background:#F8FEFB;border:0.5px solid #9FE1CB;border-radius:12px;padding:18px 22px;margin-bottom:24px">
        ${[
          "Full intermediate content",
          "Unlimited AI tutor access",
          "Exam prep modules",
          "Certificates on completion",
          "Ad-free experience",
        ].map((item) => `<div style="font-size:14px;color:#0F6E56;margin-bottom:8px">✓ ${item}</div>`).join("")}
      </div>
      <div style="text-align:center;margin-bottom:20px">
        <a href="${APP_URL}/explore" style="display:inline-block;background:#1D9E75;color:#fff;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none">
          Explore premium tracks
        </a>
      </div>
      <p style="font-size:13px;color:#888;line-height:1.6;margin:0">
        Educational only. For personal financial decisions, consult a certified advisor.
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}

function streakReminderEmail(name: string, streakDays: number): EmailTemplate {
  return {
    subject: `${name}, your ${streakDays}-day streak is at risk`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#fafafa;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:0.5px solid #e5e5e5">
    <div style="background:#0a0a0a;padding:28px 36px;text-align:center">
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0">Do not break your streak</h1>
      <p style="color:#aaa;margin:8px 0 0;font-size:14px">${streakDays} days and counting</p>
    </div>
    <div style="padding:28px 36px">
      <p style="font-size:15px;color:#333;margin:0 0 16px">Hi ${name},</p>
      <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 24px">
        You have not logged in today and your <strong>${streakDays}-day learning streak</strong> is at risk of resetting to zero. It only takes one lesson to keep it going.
      </p>
      <div style="background:#FFF8E6;border:0.5px solid #FAC775;border-radius:10px;padding:16px 20px;margin-bottom:24px;text-align:center">
        <div style="font-size:24px;font-weight:800;color:#854F0B;letter-spacing:-0.5px">${streakDays} day streak</div>
        <div style="font-size:13px;color:#854F0B;margin-top:4px">Keep it alive - log in before midnight</div>
      </div>
      <div style="text-align:center;margin-bottom:20px">
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#1D9E75;color:#fff;font-weight:600;font-size:15px;padding:13px 28px;border-radius:10px;text-decoration:none">
          Continue learning
        </a>
      </div>
      <p style="font-size:13px;color:#aaa;text-align:center;margin:0">Takes less than 5 minutes | One lesson is enough</p>
    </div>
    <div style="background:#fafafa;border-top:0.5px solid #eee;padding:14px 36px;text-align:center">
      <p style="font-size:11px;color:#ccc;margin:0">
        <a href="${APP_URL}/unsubscribe" style="color:#ccc">Unsubscribe from reminders</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}

function certificateEmail(name: string, trackTitle: string, certId: string): EmailTemplate {
  return {
    subject: `Your FinanceHub certificate is ready - ${trackTitle}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#fafafa;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:0.5px solid #e5e5e5">
    <div style="background:#1D9E75;padding:32px 36px;text-align:center">
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0">Certificate Earned</h1>
    </div>
    <div style="padding:28px 36px">
      <p style="font-size:15px;color:#333">Hi ${name},</p>
      <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 20px">
        Congratulations - you have completed the <strong>${trackTitle}</strong> track on FinanceHub. That takes real commitment and we are proud of you.
      </p>
      <div style="border:2px solid #1D9E75;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px">
        <div style="font-size:12px;color:#1D9E75;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px">Certificate of Completion</div>
        <div style="font-size:20px;font-weight:700;color:#0a0a0a;margin-bottom:4px">${name}</div>
        <div style="font-size:14px;color:#555;margin-bottom:8px">${trackTitle}</div>
        <div style="font-size:11px;color:#aaa;font-family:monospace">ID: ${certId}</div>
      </div>
      <div style="text-align:center;margin-bottom:16px">
        <a href="${APP_URL}/certificates" style="display:inline-block;background:#1D9E75;color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:9px;text-decoration:none">
          Download PDF certificate
        </a>
      </div>
      <p style="font-size:13px;color:#888;text-align:center">Add it to LinkedIn | Share on social | Print it out</p>
    </div>
  </div>
</body>
</html>`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { type?: unknown; userId?: unknown; data?: Record<string, unknown> };
    const type = sanitizeString(body.type, 30);
    const requestedUserId = sanitizeString(body.userId, 36);
    const data = body.data || {};
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return NextResponse.json({ error: "RESEND_API_KEY is not configured" }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);
    const supabase = createServerClient();
    const internalSecret = req.headers.get("x-internal-secret");
    const isInternal = Boolean(process.env.INTERNAL_SECRET && internalSecret === process.env.INTERNAL_SECRET);

    let callerId: string | null = null;

    if (!isInternal) {
      const { user, error: authErr } = await requireAuth(req);
      if (authErr) return authErr;

      const rateLimit = applyRateLimit(RATE_LIMITS.sendEmail(user!.id), "Email rate limit reached. Please wait before sending more.");
      if (!rateLimit.allowed) return rateLimit.response!;

      callerId = user!.id;
    }

    const targetId = isInternal ? requestedUserId : callerId;
    if (!targetId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    const [{ data: profile }, { data: authUser }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", targetId).single(),
      supabase.auth.admin.getUserById(targetId),
    ]);

    const email = authUser?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "No email found" }, { status: 404 });
    }

    const name = profile?.full_name?.split(" ")[0] || "there";
    let template: EmailTemplate;

    switch (type) {
      case "welcome":
        template = welcomeEmail(name);
        break;
      case "welcome_pro":
        template = welcomeProEmail(name);
        break;
      case "streak_reminder":
        template = streakReminderEmail(name, sanitizeNumber(data.streakDays, 1, 365));
        break;
      case "certificate":
        template = certificateEmail(
          name,
          sanitizeString(data.trackTitle, 120) || "Finance",
          sanitizeString(data.certId, 80),
        );
        break;
      default:
        return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
    }

    const result = await resend.emails.send({
      from: `FinanceHub <${FROM}>`,
      to: email,
      subject: template.subject,
      html: template.html,
    });

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email failed";
    console.error("Email error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
