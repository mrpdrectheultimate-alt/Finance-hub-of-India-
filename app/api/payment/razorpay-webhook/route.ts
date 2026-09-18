// ============================================================
// FinanceHub — Razorpay Webhook Handler
// Verifies payment signature → updates subscription in Supabase
// app/api/payment/razorpay-webhook/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

  if (!secret) {
    console.warn("RAZORPAY_WEBHOOK_SECRET is not configured");
  }

  // ── 1. Verify signature ──────────────────────────────────
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (secret && expected !== signature) {
    console.error("Razorpay webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // ── 2. Handle payment.captured ───────────────────────────
  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    const notes = payment?.notes || {};
    const userId = notes.user_id;
    const plan = notes.plan as string;

    if (!userId || !plan) {
      return NextResponse.json({ error: "Missing user_id or plan" }, { status: 400 });
    }

    // Map plan → subscription_tier / role
    const tier = plan.startsWith("pro") ? "pro" : "expert";

    // Update profiles (sets role and optional subscription fields)
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        role: tier,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", userId);

    if (updateErr) {
      console.error("Profile update error:", updateErr);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    console.log(`✅ Razorpay payment captured: user=${userId} plan=${plan} tier=${tier}`);
    return NextResponse.json({ success: true });
  }

  // ── 3. Handle payment.failed ─────────────────────────────
  if (event.event === "payment.failed") {
    const payment = event.payload?.payment?.entity;
    console.log(`⚠️ Razorpay payment failed: id=${payment?.id}`);
    return NextResponse.json({ received: true });
  }

  // ── 4. Handle subscription.charged (recurring) ───────────
  if (event.event === "subscription.charged") {
    const sub = event.payload?.subscription?.entity;
    const userId = sub?.notes?.user_id;

    if (userId) {
      await supabase.from("profiles").update({
        updated_at: new Date().toISOString(),
      } as any).eq("id", userId);
    }
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
