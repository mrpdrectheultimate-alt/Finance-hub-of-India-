// ============================================================
// FinanceHub — Email Sequence System
// app/api/email/send-sequence/route.ts
// Handles all automated email sequences via Resend
// Called by: cron job every hour
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { Resend }                    from "resend";
import { createServiceClient }       from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");
const FROM   = process.env.RESEND_FROM_EMAIL || "FinanceHub <noreply@financehub.in>";

// ─── Email templates ──────────────────────────────────────────
const TEMPLATES: Record<string, (data: Record<string,any>) => { subject: string; html: string }> = {

  welcome_day0: (d) => ({
    subject: `Welcome to FinanceHub, ${d.name}! 📚 Your first lesson awaits`,
    html: emailLayout(`
      <h1 style="font-size:24px;font-weight:800;color:#1c2b3a;margin:0 0 12px">
        Hello ${d.name}! Welcome to FinanceHub 🎉
      </h1>
      <p style="color:#4a5568;line-height:1.7;margin:0 0 16px">
        You just took the first step toward financial literacy. India needs more people like you.
      </p>
      <div style="background:#f0f9f9;border-radius:12px;padding:20px;margin:0 0 20px">
        <p style="font-weight:700;color:#0E6163;margin:0 0 10px">Your personalised path is ready:</p>
        <ul style="color:#4a5568;line-height:1.8;margin:0;padding-left:20px">
          <li>📖 ${d.lesson_count || "189"}+ lessons across 8 finance tracks</li>
          <li>🧮 7+ interactive simulators (SIP, EMI, Tax, Retirement)</li>
          <li>🤖 AI Finance Mentor — ask anything, anytime</li>
          <li>🏆 Earn XP, badges, and certificates</li>
        </ul>
      </div>
      ${ctaButton("Start Your First Lesson →", `${d.app_url}/explore`)}
      <p style="color:#718096;font-size:13px;margin-top:20px;line-height:1.6">
        <strong>Tip:</strong> The best first lesson for most people is
        <a href="${d.app_url}/learn/what-is-money" style="color:#0E6163">
        "What is Money and How Does it Work?"</a> — takes just 7 minutes.
      </p>
      ${disclaimer}
    `),
  }),

  welcome_day1: (d) => ({
    subject: `The one money rule that changes everything 💡`,
    html: emailLayout(`
      <h1 style="font-size:22px;font-weight:800;color:#1c2b3a;margin:0 0 12px">
        The 50-30-20 rule — the simplest budget you'll ever need
      </h1>
      <p style="color:#4a5568;line-height:1.7;margin:0 0 16px">
        ${d.name}, most people fail at budgeting because they make it complicated.
        The 50-30-20 rule is different:
      </p>
      <div style="background:#1c2b3a;border-radius:12px;padding:20px;margin:0 0 20px">
        ${["50% → Needs (rent, food, bills)", "30% → Wants (dining, entertainment)", "20% → Savings & investments"].map((item, i) => `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:${i<2?'12px':'0'}">
            <div style="width:36px;height:36px;border-radius:8px;background:${["#1D9E75","#185FA5","#D4A017"][i]};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">
              ${["💰","🎯","📈"][i]}
            </div>
            <span style="color:#fff;font-weight:600">${item}</span>
          </div>
        `).join("")}
      </div>
      <p style="color:#4a5568;line-height:1.7;margin:0 0 16px">
        On a ₹50,000 salary: ₹25,000 for needs, ₹15,000 for wants, ₹10,000 saved automatically.
        The key: automate the 20% on salary day so it never tempts you.
      </p>
      ${ctaButton("Learn Budgeting Properly →", `${d.app_url}/explore`)}
      ${disclaimer}
    `),
  }),

  welcome_day3: (d) => ({
    subject: `${d.name}, have you started yet? Your personalised path is waiting`,
    html: emailLayout(`
      <h1 style="font-size:22px;font-weight:800;color:#1c2b3a;margin:0 0 12px">
        Your personalised finance path is ready
      </h1>
      <p style="color:#4a5568;line-height:1.7;margin:0 0 16px">
        Based on your goal of <strong style="color:#0E6163">${d.goal || "improving your finances"}</strong>,
        here is your recommended starting track:
      </p>
      <div style="border:2px solid #0E6163;border-radius:14px;padding:20px;margin:0 0 20px">
        <div style="font-size:13px;font-weight:700;color:#0E6163;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">
          Recommended Track
        </div>
        <div style="font-size:20px;font-weight:800;color:#1c2b3a;margin-bottom:6px">
          ${d.track_name || "Personal Finance Beginner"}
        </div>
        <div style="color:#718096;font-size:14px;line-height:1.6">
          ${d.lesson_count || "22"} lessons · Start free · 7-10 min per lesson
        </div>
      </div>
      ${ctaButton("Continue Where You Left Off →", `${d.app_url}/dashboard`)}
      <p style="color:#718096;font-size:13px;margin-top:16px">
        Only 7 minutes a day builds real financial knowledge. Start with one lesson today.
      </p>
      ${disclaimer}
    `),
  }),

  welcome_day5: (d) => ({
    subject: `5 money mistakes most Indians make (and how to avoid them)`,
    html: emailLayout(`
      <h1 style="font-size:22px;font-weight:800;color:#1c2b3a;margin:0 0 16px">
        5 money mistakes most Indians make
      </h1>
      ${[
        ["No emergency fund", "89% of Indians have less than 3 months expenses saved. One medical bill can destroy years of savings."],
        ["Mixing insurance and investment", "LIC endowment plans, ULIPs — these give poor returns AND poor coverage. Buy term insurance + invest separately."],
        ["Not starting SIP early enough", "Starting at 25 vs 35 = ₹2.2 crore difference at retirement with the same ₹10,000/month investment."],
        ["Ignoring tax planning until March", "90 days of rushed 80C decisions cost thousands. Plan in April, not March."],
        ["Keeping all money in a savings account", "Savings account: 3.5%. Inflation: 6%. Your money loses value every year. Index funds: 12% historical average."],
      ].map(([title, body], i) => `
        <div style="border-left:3px solid #E53E3E;padding:10px 14px;margin-bottom:14px;background:#fff5f5;border-radius:0 8px 8px 0">
          <div style="font-weight:700;color:#C53030;margin-bottom:4px">${i+1}. ${title}</div>
          <div style="color:#4a5568;font-size:13px;line-height:1.6">${body}</div>
        </div>
      `).join("")}
      ${ctaButton("Learn How to Fix These →", `${d.app_url}/explore`)}
      ${disclaimer}
    `),
  }),

  welcome_day7: (d) => ({
    subject: `Your first week on FinanceHub — here is what is next`,
    html: emailLayout(`
      <h1 style="font-size:22px;font-weight:800;color:#1c2b3a;margin:0 0 12px">
        One week in — you're building a habit 🏆
      </h1>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:0 0 20px">
        ${[
          ["📖", d.lessons_done || "0", "Lessons completed"],
          ["⭐", d.xp_total    || "0", "XP earned"],
          ["🔥", d.streak      || "0", "Day streak"],
        ].map(([icon, val, label]) => `
          <div style="background:#f8f9fa;border-radius:12px;padding:14px;text-align:center">
            <div style="font-size:24px;margin-bottom:4px">${icon}</div>
            <div style="font-size:22px;font-weight:800;color:#1c2b3a">${val}</div>
            <div style="font-size:11px;color:#a0aec0">${label}</div>
          </div>
        `).join("")}
      </div>
      <p style="color:#4a5568;line-height:1.7;margin:0 0 16px">
        ${(d.lessons_done || 0) > 0
          ? `Great start! You've already completed ${d.lessons_done} lessons. Keep the momentum going.`
          : `Your progress is saved and waiting. Jump back in — even 7 minutes today counts.`}
      </p>
      <p style="color:#4a5568;line-height:1.7;margin:0 0 16px">
        <strong>This week's challenge:</strong> Complete 5 lessons and earn the
        <strong style="color:#D4A017">🏅 First Steps badge</strong>.
        You'll also unlock your personalised mastery dashboard.
      </p>
      ${ctaButton("Continue Learning →", `${d.app_url}/dashboard`)}
      ${disclaimer}
    `),
  }),

  streak_risk: (d) => ({
    subject: `🔥 Your ${d.streak}-day streak is at risk — 1 lesson keeps it alive`,
    html: emailLayout(`
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:56px;margin-bottom:10px">🔥</div>
        <h1 style="font-size:22px;font-weight:800;color:#1c2b3a;margin:0 0 8px">
          Your ${d.streak}-day streak ends in a few hours
        </h1>
        <p style="color:#718096;margin:0 0 20px">
          One lesson is all it takes to keep it alive.
        </p>
      </div>
      ${ctaButton("Save My Streak →", `${d.app_url}/dashboard`)}
      <p style="color:#718096;font-size:13px;text-align:center;margin-top:16px">
        Even the shortest lesson counts. Your streak is worth protecting.
      </p>
      ${disclaimer}
    `),
  }),

  streak_broken: (d) => ({
    subject: `Streaks break — that's okay. Start fresh today 💪`,
    html: emailLayout(`
      <h1 style="font-size:22px;font-weight:800;color:#1c2b3a;margin:0 0 12px">
        Streaks break. The best ones restart immediately.
      </h1>
      <p style="color:#4a5568;line-height:1.7;margin:0 0 16px">
        ${d.name}, your streak ended — but your knowledge didn't disappear.
        Every day you spend learning finance puts you further ahead than
        the 94% of Indians who never study their finances at all.
      </p>
      <div style="background:#f0f9f9;border-radius:12px;padding:16px;margin:0 0 20px">
        <p style="color:#0E6163;font-weight:700;margin:0 0 8px">Quick restart:</p>
        <p style="color:#4a5568;margin:0;font-size:14px">
          Complete one lesson today → your streak restarts at Day 1.
          Complete 7 in a row → earn the <strong>Comeback Kid 🏅</strong> badge.
        </p>
      </div>
      ${ctaButton("Restart My Streak →", `${d.app_url}/dashboard`)}
      ${disclaimer}
    `),
  }),

  winback_7d: (d) => ({
    subject: `${d.name}, we miss you at FinanceHub 👋`,
    html: emailLayout(`
      <h1 style="font-size:22px;font-weight:800;color:#1c2b3a;margin:0 0 12px">
        It's been 7 days — here is what you missed
      </h1>
      <p style="color:#4a5568;line-height:1.7;margin:0 0 16px">
        Finance doesn't pause when we do. Here are 3 things that happened
        in Indian finance this week that affect your money:
      </p>
      <div style="background:#f8f9fa;border-radius:12px;padding:16px;margin:0 0 20px">
        ${["RBI kept repo rate unchanged at 6.5% — FD rates remain attractive for now",
           "SEBI tightened F&O rules — check if your trading strategy is affected",
           "New tax regime becoming default — now is the time to understand which is better for you",
        ].map(item => `
          <div style="display:flex;gap:10px;margin-bottom:10px;align-items:flex-start">
            <span style="color:#0E6163;font-size:16px;flex-shrink:0">→</span>
            <span style="color:#4a5568;font-size:14px;line-height:1.5">${item}</span>
          </div>
        `).join("")}
      </div>
      <p style="color:#4a5568;line-height:1.7;margin:0 0 16px">
        Your learning progress is saved. Jump back in — it takes only 7 minutes.
      </p>
      ${ctaButton("Resume Learning →", `${d.app_url}/dashboard`)}
      ${disclaimer}
    `),
  }),

  winback_14d: (d) => ({
    subject: `14 days away — your finance knowledge is getting rusty 📉`,
    html: emailLayout(`
      <h1 style="font-size:22px;font-weight:800;color:#1c2b3a;margin:0 0 12px">
        The Forgetting Curve is real
      </h1>
      <p style="color:#4a5568;line-height:1.7;margin:0 0 16px">
        ${d.name}, research shows we forget 50% of new information within 24 hours
        and 80% within a week — unless we review it.
      </p>
      <p style="color:#4a5568;line-height:1.7;margin:0 0 16px">
        That is exactly why FinanceHub's spaced repetition system schedules reviews
        at the perfect time. But it only works if you show up.
      </p>
      <div style="background:#FFF5F5;border:1px solid #FEB2B2;border-radius:12px;padding:16px;margin:0 0 20px">
        <p style="color:#C53030;font-weight:700;margin:0 0 6px">⚠️ You have ${d.reviews_due || "several"} concept reviews overdue</p>
        <p style="color:#742A2A;font-size:13px;margin:0">
          10 minutes of review now saves hours of relearning later.
        </p>
      </div>
      ${ctaButton("Review What You Learned →", `${d.app_url}/review`)}
      ${disclaimer}
    `),
  }),

  winback_30d: (d) => ({
    subject: `One month gap — we saved your progress. Come back?`,
    html: emailLayout(`
      <h1 style="font-size:22px;font-weight:800;color:#1c2b3a;margin:0 0 12px">
        Your progress is still here, ${d.name}
      </h1>
      <p style="color:#4a5568;line-height:1.7;margin:0 0 16px">
        It has been a month. Life gets busy — we understand.
        But your financial future doesn't pause for busy seasons.
      </p>
      <div style="background:#1c2b3a;border-radius:14px;padding:20px;margin:0 0 20px">
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 8px">Your progress, waiting for you:</p>
        <div style="color:#fff;font-size:18px;font-weight:700">${d.lessons_done || 0} lessons completed</div>
        <div style="color:#1D9E75;font-size:14px;margin-top:4px">${d.xp_total || 0} XP earned</div>
      </div>
      <p style="color:#4a5568;line-height:1.7;margin:0 0 16px">
        You don't have to start over. Just pick up where you left off.
        One lesson. That's all.
      </p>
      ${ctaButton("Resume My Journey →", `${d.app_url}/dashboard`)}
      <p style="color:#a0aec0;font-size:12px;margin-top:16px;text-align:center">
        If you no longer want these emails,
        <a href="${d.app_url}/settings/notifications" style="color:#a0aec0">unsubscribe here</a>.
      </p>
    `),
  }),
};

// ─── Email layout wrapper ─────────────────────────────────────
const disclaimer = `
  <div style="margin-top:24px;padding:12px 14px;background:#f7fafc;border-radius:8px;font-size:11px;color:#718096;line-height:1.6">
    FinanceHub provides financial education only — not personalised financial advice.
    Always consult a SEBI-registered advisor before making investment decisions.
  </div>
`;

function ctaButton(text: string, url: string): string {
  return `
    <div style="text-align:center;margin:20px 0">
      <a href="${url}" style="display:inline-block;padding:13px 28px;background:#0E6163;color:#fff;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;font-family:system-ui,sans-serif">
        ${text}
      </a>
    </div>
  `;
}

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#f7f4ee;font-family:system-ui,-apple-system,sans-serif">
    <div style="max-width:580px;margin:0 auto;padding:24px 16px">
      <!-- Logo -->
      <div style="text-align:center;padding:20px 0">
        <a href="https://financehub.in" style="font-size:22px;font-weight:800;color:#0E6163;text-decoration:none">
          📚 FinanceHub
        </a>
      </div>
      <!-- Card -->
      <div style="background:#fff;border-radius:16px;padding:28px 28px;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
        ${content}
      </div>
      <!-- Footer -->
      <div style="text-align:center;padding:20px 0;font-size:12px;color:#a0aec0">
        <p style="margin:0 0 6px">FinanceHub Education · India</p>
        <p style="margin:0">
          <a href="https://financehub.in/legal/privacy" style="color:#a0aec0">Privacy</a> ·
          <a href="https://financehub.in/legal/terms" style="color:#a0aec0">Terms</a> ·
          <a href="https://financehub.in/settings/notifications" style="color:#a0aec0">Unsubscribe</a>
        </p>
      </div>
    </div>
  </body>
  </html>`;
}

// ─── Main handler ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now      = new Date().toISOString();
  let   sent     = 0;
  let   errors   = 0;

  // Get all due emails
  const { data: rawEmails } = await supabase
    .from("user_email_sequence_state")
    .select(`
      user_id, sequence_id, current_step,
      profiles(email, full_name, subscription_tier,
        xp_total, current_streak, onboarding_goal, primary_track,
        email_streak_reminder, email_weekly_digest, email_marketing),
      email_sequences(name),
      email_sequence_steps(subject, template_key, delay_hours)
    `)
    .lte("next_send_at", now)
    .eq("completed",    false)
    .eq("unsubscribed", false)
    .limit(50);

  const dueEmails = (rawEmails || []) as any[];

  for (const item of (dueEmails || [])) {
    const profile = (item as any).profiles;
    if (!profile?.email) continue;

    // Check email preferences
    const seqName = (item as any).email_sequences?.name;
    if (seqName === "streak_reminder" && !profile.email_streak_reminder) continue;
    if (seqName === "upgrade_nurture" && !profile.email_marketing) continue;

    const templateKey = (item as any).email_sequence_steps?.template_key;
    const template    = TEMPLATES[templateKey];
    if (!template) continue;

    const emailData = template({
      name:         profile.full_name?.split(" ")[0] || "there",
      app_url:      process.env.NEXT_PUBLIC_APP_URL || "https://financehub.in",
      streak:       profile.current_streak || 0,
      xp_total:     profile.xp_total || 0,
      lessons_done: 0,  // could fetch from user_progress if needed
      goal:         profile.onboarding_goal,
      track_name:   profile.primary_track?.replace(/-/g, " "),
      reviews_due:  3,
    });

    try {
      const { data: resendData, error: resendErr } = await resend.emails.send({
        from:    FROM,
        to:      profile.email,
        subject: emailData.subject,
        html:    emailData.html,
      });

      if (resendErr) throw resendErr;

      // Log send
      await supabase.from("email_sends").insert({
        user_id:     item.user_id,
        email:       profile.email,
        sequence_id: item.sequence_id,
        subject:     emailData.subject,
        resend_id:   resendData?.id,
        status:      "sent",
      });

      // Advance sequence state
      await supabase.from("user_email_sequence_state").update({
        current_step: (item.current_step || 0) + 1,
        last_sent_at: now,
        next_send_at: null,  // cron will recalculate
      }).eq("user_id", item.user_id).eq("sequence_id", item.sequence_id);

      sent++;
    } catch (err) {
      console.error("Email send failed:", err);
      errors++;
    }
  }

  return NextResponse.json({ sent, errors, timestamp: now });
}

// ─── Enroll user in welcome sequence ─────────────────────────
async function enrollWelcomeSequence(userId: string) {
  const supabase = createServiceClient();
  const seqId    = "11111111-0001-0001-0001-000000000001";

  await supabase.from("user_email_sequence_state").upsert({
    user_id:      userId,
    sequence_id:  seqId,
    current_step: 0,
    enrolled_at:  new Date().toISOString(),
    next_send_at: new Date().toISOString(), // send first email immediately
  }, { onConflict: "user_id,sequence_id" });
}
