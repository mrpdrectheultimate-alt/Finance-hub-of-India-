import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const rateLimit = applyRateLimit(RATE_LIMITS.checkout(user!.id), "Too many portal requests. Please wait.");
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 500 });
    }

    const supabase = createServerClient();
    const { data: subscription } = await supabase.from("subscriptions").select("stripe_customer_id").eq("user_id", user!.id).single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-04-10" });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Portal creation failed" }, { status: 500 });
  }
}
