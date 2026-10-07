// ============================================================
// FinanceHub — Stripe Webhook
// app/api/stripe-webhook/route.ts
// Handles: checkout.session.completed, customer.subscription.*
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import Stripe                        from "stripe";
import { createServiceClient }       from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

const PRICE_TO_TIER: Record<string, string> = {
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID  || ""]: "pro",
  [process.env.STRIPE_PRO_ANNUAL_PRICE_ID   || ""]: "pro",
  [process.env.STRIPE_EXPERT_MONTHLY_PRICE_ID || ""]: "expert",
};

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Stripe webhook signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {

      // ── Checkout completed → activate subscription ──────────
      case "checkout.session.completed": {
        const session   = event.data.object as Stripe.Checkout.Session;
        const userId    = session.metadata?.user_id;
        const priceId   = session.metadata?.price_id;
        const tier      = PRICE_TO_TIER[priceId || ""] || "pro";

        if (!userId) break;

        await supabase.from("profiles").update({
          subscription_tier:    tier,
          stripe_customer_id:   session.customer as string,
          stripe_subscription_id: session.subscription as string,
          subscription_status:  "active",
          subscription_start:   new Date().toISOString(),
          updated_at:           new Date().toISOString(),
        } as any).eq("id", userId);

        // Log payment
        await supabase.from("payment_logs").insert({
          user_id:      userId,
          provider:     "stripe",
          amount:       (session.amount_total || 0) / 100,
          currency:     session.currency?.toUpperCase() || "USD",
          status:       "paid",
          session_id:   session.id,
          customer_id:  session.customer as string,
          subscription_id: session.subscription as string,
          tier,
          created_at:   new Date().toISOString(),
        } as any);

        // Award Pro upgrade XP
        await supabase.from("user_xp_log").insert({
          user_id:     userId,
          xp_amount:   200,
          action:      "subscription_upgrade",
          description: `Upgraded to ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
        } as any);

        await supabase.from("profiles")
          .update({ xp_total: (supabase as any).rpc("increment_xp", { amount: 200 }) } as any)
          .eq("id", userId);

        console.log(`✅ Stripe: ${tier} activated for user ${userId}`);
        break;
      }

      // ── Subscription renewed ─────────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice      = event.data.object as Stripe.Invoice;
        const customerId   = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        if (!customerId || invoice.billing_reason !== "subscription_cycle") break;

        await supabase.from("profiles").update({
          subscription_status: "active",
          updated_at:          new Date().toISOString(),
        } as any).eq("stripe_customer_id" as any, customerId);

        await supabase.from("payment_logs").insert({
          provider:       "stripe",
          amount:         (invoice.amount_paid || 0) / 100,
          currency:       invoice.currency?.toUpperCase() || "USD",
          status:         "paid",
          customer_id:    customerId,
          subscription_id: subscriptionId,
          invoice_id:     invoice.id,
          created_at:     new Date().toISOString(),
        } as any);

        console.log(`✅ Stripe: renewal processed for customer ${customerId}`);
        break;
      }

      // ── Payment failed ───────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice    = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await supabase.from("profiles").update({
          subscription_status: "past_due",
          updated_at:          new Date().toISOString(),
        } as any).eq("stripe_customer_id" as any, customerId);

        console.warn(`⚠️ Stripe: payment failed for customer ${customerId}`);
        break;
      }

      // ── Subscription cancelled ───────────────────────────────
      case "customer.subscription.deleted": {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabase.from("profiles").update({
          subscription_tier:   "free",
          subscription_status: "cancelled",
          updated_at:          new Date().toISOString(),
        } as any).eq("stripe_customer_id" as any, customerId);

        console.log(`ℹ️ Stripe: subscription cancelled for customer ${customerId}`);
        break;
      }

      // ── Subscription updated (upgrade/downgrade) ─────────────
      case "customer.subscription.updated": {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const priceId    = sub.items.data[0]?.price?.id || "";
        const tier       = PRICE_TO_TIER[priceId] || "free";

        await supabase.from("profiles").update({
          subscription_tier:   tier,
          subscription_status: sub.status,
          updated_at:          new Date().toISOString(),
        } as any).eq("stripe_customer_id" as any, customerId);

        console.log(`✅ Stripe: subscription updated to ${tier} for customer ${customerId}`);
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (err: any) {
    console.error("Webhook handler error:", err.message);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
