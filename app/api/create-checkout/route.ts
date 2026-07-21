import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { requireAuth, sanitizeString } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const rateLimit = applyRateLimit(RATE_LIMITS.checkout(user!.id), "Too many checkout attempts. Please wait.");
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const body = (await req.json()) as {
      billing?: "monthly" | "annual";
      priceId?: string;
      plan?: "pro" | "expert";
    };
    const billing = body.billing === "annual" ? "annual" : "monthly";
    const requestPriceId = sanitizeString(body.priceId, 100);
    const plan = body.plan === "pro" || body.plan === "expert" ? body.plan : null;

    if (!plan) {
      return NextResponse.json({ error: "Missing checkout params" }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 500 });
    }

    const supabase = createServerClient();
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-04-10" });
    const priceId =
      requestPriceId ||
      (plan === "pro"
        ? billing === "annual"
          ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID
          : process.env.STRIPE_PRO_MONTHLY_PRICE_ID
        : billing === "annual"
          ? process.env.STRIPE_EXPERT_ANNUAL_PRICE_ID
          : process.env.STRIPE_EXPERT_MONTHLY_PRICE_ID);

    if (!priceId) {
      return NextResponse.json({ error: "Stripe price is not configured yet." }, { status: 500 });
    }

    const [{ data: profile }, { data: subscription }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user!.id).single(),
      supabase.from("subscriptions").select("stripe_customer_id").eq("user_id", user!.id).single(),
    ]);

    let customerId = subscription?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user!.email,
        name: profile?.full_name || undefined,
        metadata: { supabase_user_id: user!.id },
      });
      customerId = customer.id;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { supabase_user_id: user!.id, plan },
      },
      success_url: `${appUrl}/payment-success`,
      cancel_url: `${appUrl}/pricing?cancelled=true`,
      metadata: { supabase_user_id: user!.id, plan },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_update: { address: "auto" },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout failed" }, { status: 500 });
  }
}
