import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured yet." }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-04-10" });
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServerClient();
  const getUserId = (metadata?: Stripe.Metadata | null) => metadata?.supabase_user_id || null;

  const getPlan = (priceId: string): "pro" | "expert" => {
    const proPriceIds = [process.env.STRIPE_PRO_MONTHLY_PRICE_ID, process.env.STRIPE_PRO_ANNUAL_PRICE_ID];
    return proPriceIds.includes(priceId) ? "pro" : "expert";
  };

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = getUserId(subscription.metadata);
      if (!userId) break;

      const priceId = subscription.items.data[0]?.price.id || "";
      const plan = getPlan(priceId);
      const status = subscription.status;
      const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          plan,
          status,
          current_period_end: periodEnd,
        },
        { onConflict: "stripe_subscription_id" },
      );

      if (status === "active" || status === "trialing") {
        await supabase.from("profiles").update({ role: plan }).eq("id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = getUserId(subscription.metadata);
      if (!userId) break;

      await supabase.from("subscriptions").update({ status: "canceled" }).eq("stripe_subscription_id", subscription.id);
      await supabase.from("profiles").update({ role: "free" }).eq("id", userId);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : null;
      const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;
      if (!subscription) break;

      const userId = getUserId(subscription.metadata);
      if (!userId) break;

      const priceId = subscription.items.data[0]?.price.id || "";
      const plan = getPlan(priceId);

      await supabase.from("profiles").update({ role: plan }).eq("id", userId);
      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : null;
      const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;
      if (!subscription) break;

      const userId = getUserId(subscription.metadata);
      if (!userId) break;

      await supabase.from("subscriptions").update({ status: "past_due" }).eq("stripe_subscription_id", subscription.id);
      break;
    }

    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
