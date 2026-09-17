// ============================================================
// FinanceHub — Razorpay Payment Integration
// Supports UPI, Net Banking, Indian Cards, EMI, Wallets
// app/api/payment/razorpay-order/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { requireAuth } from "@/lib/security";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
});

const PLANS = {
  pro_monthly: { amount: 49900, label: "FinanceHub Pro — Monthly" },
  pro_annual: { amount: 399900, label: "FinanceHub Pro — Annual" },
  expert_monthly: { amount: 99900, label: "FinanceHub Expert — Monthly" },
} as const;

export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  try {
    const { plan } = await req.json();
    if (!plan || !(plan in PLANS)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];

    const order = await razorpay.orders.create({
      amount: planConfig.amount, // in paise
      currency: "INR",
      receipt: `fh_${user!.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        user_id: user!.id,
        plan,
        label: planConfig.label,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: planConfig.amount,
      currency: "INR",
      label: planConfig.label,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return NextResponse.json(
      { error: "Payment initiation failed. Please try again." },
      { status: 500 }
    );
  }
}
