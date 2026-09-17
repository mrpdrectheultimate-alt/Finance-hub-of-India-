// ============================================================
// FinanceHub — Razorpay Payment Verification
// app/api/payment/razorpay-verify/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createServerClient } from "@/lib/supabase";
import { requireAuth } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment parameters" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Signature verified! Update user role in Supabase
    const supabase = createServerClient();
    const newRole = plan?.includes("expert") ? "expert" : "pro";

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update user profile role:", updateError);
      return NextResponse.json({ error: "Failed to update membership status" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      role: newRole,
      message: "Payment verified successfully. Welcome to FinanceHub Pro!",
    });
  } catch (err) {
    console.error("Razorpay verification error:", err);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
