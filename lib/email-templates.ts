// ============================================================
// FinanceHub — Email Templates (Resend)
// lib/email-templates.ts
// All transactional + sequence emails for the platform
// Usage: import { emails } from "@/lib/email-templates"
// ============================================================

const APP_URL  = process.env.NEXT_PUBLIC_APP_URL || "https://financehub.in";
const FROM     = process.env.RESEND_FROM_EMAIL   || "hello@financehub.in";
const NOREPLY  = "noreply@financehub.in";

// ─────────────────────────────────────────────────────────────
// HTML wrapper — consistent brand template
// ─────────────────────────────────────────────────────────────
function wrap(content: string, preheader = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>FinanceHub</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  body{margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
  .wrap{max-width:560px;margin:0 auto;padding:24px 16px}
  .card{background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb}
  .header{background:#0B1A2B;padding:28px 32px;display:flex;align-items:center;gap:12px}
  .logo{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,#0E6163,#1D9E75);display:flex;align-items:center;justify-content:center;font-size:20px}
  .logo-text{color:#fff;font-size:17px;font-weight:700;letter-spacing:-0.3px}
  .body{padding:32px}
  h1{font-size:22px;font-weight:700;color:#111827;margin:0 0 12px;line-height:1.3}
  p{font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 16px}
  .btn{display:inline-block;padding:13px 28px;background:#0E6163;color:#fff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;margin:8px 0}
  .btn-secondary{background:transparent;color:#0E6163;border:1.5px solid #0E6163}
  .divider{border:none;border-top:1px solid #e5e7eb;margin:24px 0}
  .footer{padding:20px 32px;text-align:center;font-size:12px;color:#9ca3af;line-height:1.6}
  .highlight{background:#F0F9F7;border-left:3px solid #0E6163;padding:14px 16px;border-radius:0 8px 8px 0;margin:16px 0}
  .stat{display:inline-block;text-align:center;padding:12px 20px;background:#f9fafb;border-radius:10px;margin:4px}
  .stat-val{font-size:22px;font-weight:700;color:#111827}
  .stat-lbl{font-size:11px;color:#9ca3af;margin-top:2px}
</style>
</head>
<body>
${preheader ? `<div style="display:none;max-height:0;overflow:hidden">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}
<div class="wrap">
<div class="card">
  <div class="header">
    <div class="logo">📈</div>
    <span class="logo-text">Finance<span style="color:#1D9E75">Hub</span></span>
  </div>
  <div class="body">
    ${content}
  </div>
  <div class="footer">
    <p style="margin:0 0 4px">© 2026 FinanceHub Education. All content is educational only.</p>
    <p style="margin:0">Not investment advice · <a href="${APP_URL}/legal/privacy" style="color:#9ca3af">Privacy</a> · <a href="${APP_URL}/settings" style="color:#9ca3af">Unsubscribe</a></p>
  </div>
</div>
</div>
</body></html>`;
}

// ─────────────────────────────────────────────────────────────
// Email Templates
// ─────────────────────────────────────────────────────────────

export const emails = {

  // 1. Welcome email (sent immediately after signup)
  welcome: (name: string) => ({
    from:    FROM,
    subject: `Welcome to FinanceHub, ${name.split(" ")[0]}! Here's where to start 🎓`,
    html: wrap(`
<h1>Welcome to FinanceHub! 🎉</h1>
<p>Hi ${name.split(" ")[0]},</p>
<p>You've just joined India's most complete finance education platform. Here's how to make the most of it in your first week:</p>
<div class="highlight">
  <strong>Your first step:</strong> Take the 3-question quiz to get your personalised learning path.<br>
  It takes 30 seconds and tells you exactly where to begin.
</div>
<p style="text-align:center;margin:24px 0">
  <a class="btn" href="${APP_URL}/onboarding">Find my learning path →</a>
</p>
<hr class="divider">
<p><strong>What's free forever:</strong></p>
<ul style="font-size:14px;color:#4b5563;line-height:2;padding-left:20px;margin:0 0 16px">
  <li>Personal Finance, Crypto, Hindi Finance & Behavioral Finance tracks</li>
  <li>SIP, EMI and Tax calculators</li>
  <li>5 AI Mentor questions per day</li>
  <li>Video library (157+ curated videos)</li>
  <li>Finance Glossary (200+ terms)</li>
  <li>25 real Indian case studies</li>
</ul>
<p style="font-size:13px;color:#9ca3af">Questions? Just reply to this email — we read every one.</p>
`, `Welcome to FinanceHub! Start with your personalised learning path.`),
  }),

  // 2. Streak reminder (cron: 30 18 * * * IST = 6 PM daily)
  streakReminder: (name: string, streak: number, lessonTitle: string, lessonSlug: string) => ({
    from:    NOREPLY,
    subject: `🔥 Your ${streak}-day streak is at risk, ${name.split(" ")[0]}`,
    html: wrap(`
<h1>Your streak ends in a few hours ⏰</h1>
<p>Hi ${name.split(" ")[0]},</p>
<p>You've kept a <strong>${streak}-day learning streak</strong> going. Tonight it resets at midnight IST unless you complete a lesson.</p>
<div style="text-align:center;margin:24px 0">
  <div class="stat" style="border-radius:50%;width:80px;height:80px;display:inline-flex;align-items:center;justify-content:center;flex-direction:column;background:#FFF7ED;border:2px solid #FED7AA">
    <div class="stat-val" style="color:#EA580C">🔥 ${streak}</div>
    <div class="stat-lbl">day streak</div>
  </div>
</div>
<p>Pick up where you left off:</p>
<p style="text-align:center;margin:24px 0">
  <a class="btn" href="${APP_URL}/learn/${lessonSlug}">${lessonTitle} →</a>
</p>
<p style="font-size:13px;color:#9ca3af">Or <a href="${APP_URL}/review" style="color:#0E6163">do a 5-minute review</a> to keep your streak alive with spaced repetition.</p>
`, `Your ${streak}-day streak ends tonight unless you complete a lesson.`),
  }),

  // 3. Weekly digest (cron: 0 7 * * 0 = Sunday 7 AM)
  weeklyDigest: (data: {
    name:        string;
    weekXp:      number;
    lessonsThisWeek: number;
    streak:      number;
    rank?:       number;
    nextLesson:  { title: string; slug: string };
    tipTitle:    string;
    tipBody:     string;
  }) => ({
    from:    FROM,
    subject: `📊 Your week on FinanceHub — ${data.weekXp} XP earned`,
    html: wrap(`
<h1>Your week in finance 📚</h1>
<p>Hi ${data.name.split(" ")[0]},</p>
<p>Here's what you achieved this week:</p>
<div style="text-align:center;margin:20px 0;display:flex;justify-content:center;gap:0;flex-wrap:wrap">
  <div class="stat">
    <div class="stat-val">${data.weekXp}</div>
    <div class="stat-lbl">XP this week</div>
  </div>
  <div class="stat">
    <div class="stat-val">${data.lessonsThisWeek}</div>
    <div class="stat-lbl">Lessons done</div>
  </div>
  <div class="stat">
    <div class="stat-val">🔥 ${data.streak}</div>
    <div class="stat-lbl">Day streak</div>
  </div>
  ${data.rank ? `<div class="stat"><div class="stat-val">#${data.rank}</div><div class="stat-lbl">Leaderboard</div></div>` : ""}
</div>
<hr class="divider">
<p><strong>This week's finance tip:</strong></p>
<div class="highlight">
  <strong>${data.tipTitle}</strong><br>
  <span style="font-size:14px;color:#526173">${data.tipBody}</span>
</div>
<p><strong>Continue where you left off:</strong></p>
<p style="text-align:center;margin:20px 0">
  <a class="btn" href="${APP_URL}/learn/${data.nextLesson.slug}">${data.nextLesson.title} →</a>
</p>
`, `You earned ${data.weekXp} XP this week. Keep it up!`),
  }),

  // 4. Certificate earned
  certificateEarned: (name: string, trackName: string, verificationId: string) => ({
    from:    FROM,
    subject: `🎓 Congratulations! Your ${trackName} certificate is ready`,
    html: wrap(`
<h1>You've earned a certificate! 🎓</h1>
<p>Hi ${name.split(" ")[0]},</p>
<p>You've completed the <strong>${trackName}</strong> track on FinanceHub. This is a real achievement — most people who start never finish.</p>
<div class="highlight" style="text-align:center">
  <div style="font-size:36px;margin-bottom:8px">📜</div>
  <strong>${name}</strong><br>
  <span style="font-size:14px;color:#526173">has completed the ${trackName} Track</span><br>
  <span style="font-size:12px;color:#9ca3af;font-family:monospace;margin-top:8px;display:block">ID: ${verificationId}</span>
</div>
<p style="text-align:center;margin:24px 0;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
  <a class="btn" href="${APP_URL}/api/generate-certificate?id=${verificationId}">Download Certificate →</a>
  <a class="btn btn-secondary" href="https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=FinanceHub%20${encodeURIComponent(trackName)}&organizationName=FinanceHub&certUrl=${encodeURIComponent(APP_URL+"/verify/"+verificationId)}&certId=${verificationId}">Add to LinkedIn</a>
</p>
<p style="font-size:13px;color:#9ca3af">Anyone can verify your certificate at <a href="${APP_URL}/verify/${verificationId}" style="color:#0E6163">financehub.in/verify/${verificationId}</a></p>
`, `Your ${trackName} certificate is ready. Download and share on LinkedIn.`),
  }),

  // 5. Subscription confirmation (Pro/Expert)
  subscriptionConfirmed: (name: string, plan: string, amount: string, nextDate: string) => ({
    from:    FROM,
    subject: `✅ Your FinanceHub ${plan} subscription is active`,
    html: wrap(`
<h1>You're now on ${plan}! 🚀</h1>
<p>Hi ${name.split(" ")[0]},</p>
<p>Your <strong>FinanceHub ${plan}</strong> subscription is now active. You have full access to everything.</p>
<div style="background:#f9fafb;border-radius:12px;padding:20px;margin:16px 0">
  <table style="width:100%;font-size:14px;color:#4b5563">
    <tr><td style="padding:4px 0"><strong>Plan</strong></td><td style="text-align:right">${plan}</td></tr>
    <tr><td style="padding:4px 0"><strong>Amount</strong></td><td style="text-align:right">₹${amount}/month</td></tr>
    <tr><td style="padding:4px 0"><strong>Next billing</strong></td><td style="text-align:right">${nextDate}</td></tr>
  </table>
</div>
<p><strong>Unlocked for you:</strong></p>
<ul style="font-size:14px;color:#4b5563;line-height:2;padding-left:20px;margin:0 0 16px">
  <li>All 375+ lessons across all 8 tracks</li>
  <li>Unlimited AI Mentor questions</li>
  <li>All 9 Finance Lab simulators</li>
  <li>PDF downloads and offline notes</li>
  <li>Verified certificates on completion</li>
</ul>
<p style="text-align:center;margin:24px 0">
  <a class="btn" href="${APP_URL}/dashboard">Go to my dashboard →</a>
</p>
<p style="font-size:13px;color:#9ca3af">Need to cancel? You can do it anytime from <a href="${APP_URL}/settings" style="color:#0E6163">Settings → Subscription</a>. No lock-in.</p>
`, `Your FinanceHub ${plan} subscription is active. Full access unlocked.`),
  }),

  // 6. Password reset
  passwordReset: (resetUrl: string) => ({
    from:    NOREPLY,
    subject: "Reset your FinanceHub password",
    html: wrap(`
<h1>Password reset request</h1>
<p>We received a request to reset your FinanceHub password. Click the button below to set a new one:</p>
<p style="text-align:center;margin:28px 0">
  <a class="btn" href="${resetUrl}">Reset my password →</a>
</p>
<p style="font-size:13px;color:#9ca3af">This link expires in 1 hour. If you didn't request a password reset, ignore this email — your password hasn't changed.</p>
`, "Reset your FinanceHub password. Link expires in 1 hour."),
  }),

  // 7. Re-engagement (users inactive 7+ days)
  reengagement: (name: string, lastLesson: string, lastSlug: string, streak: number) => ({
    from:    FROM,
    subject: `${name.split(" ")[0]}, your finance journey is waiting 📚`,
    html: wrap(`
<h1>It's been a while! 👋</h1>
<p>Hi ${name.split(" ")[0]},</p>
<p>We noticed you haven't been on FinanceHub in a few days. Your learning progress is saved — pick up exactly where you left off.</p>
${streak > 0 ? `<p>You had a <strong>${streak}-day streak</strong> going. There's still time to get it back.</p>` : ""}
<div class="highlight">
  <strong>Continue where you left off:</strong><br>
  <span style="font-size:14px;color:#526173">${lastLesson}</span>
</div>
<p style="text-align:center;margin:24px 0">
  <a class="btn" href="${APP_URL}/learn/${lastSlug}">Continue learning →</a>
</p>
<p style="font-size:13px;color:#9ca3af">Or explore something new in the <a href="${APP_URL}/explore" style="color:#0E6163">full course library</a>.</p>
`, `Your FinanceHub learning is waiting. Continue from ${lastLesson}.`),
  }),
};

// ─────────────────────────────────────────────────────────────
// Resend send helper
// ─────────────────────────────────────────────────────────────
export async function sendEmail({
  to,
  subject,
  html,
  from = FROM,
}: {
  to:       string;
  subject:  string;
  html:     string;
  from?:    string;
}) {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({ from, to, subject, html });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }

  return data;
}
