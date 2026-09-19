"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface PaymentButtonProps {
  plan: "pro_monthly" | "pro_annual" | "expert_monthly";
  label: string;
  amount: string; // display string e.g. "₹499/month"
  color?: string;
  fullWidth?: boolean;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayButton({
  plan,
  label,
  amount,
  color = "#0E6163",
  fullWidth,
  onSuccess,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in to continue.");
        setLoading(false);
        return;
      }

      // 2. Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError("Payment system failed to load. Check your internet connection.");
        setLoading(false);
        return;
      }

      // 3. Create order from our API
      const res = await fetch("/api/payment/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to create order. Please try again.");
        setLoading(false);
        return;
      }

      const { orderId, amount: orderAmount, keyId } = await res.json();

      // 4. Get user profile for prefill
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      // 5. Open Razorpay checkout
      const options = {
        key: keyId,
        amount: orderAmount,
        currency: "INR",
        name: "FinanceHub",
        description: label,
        order_id: orderId,
        prefill: {
          name: profile?.full_name || "",
          email: user.email || "",
        },
        theme: { color },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled.");
          },
        },
        handler: async (response: any) => {
          // Payment successful — verify on server
          try {
            const verifyRes = await fetch("/api/payment/razorpay-verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan,
              }),
            });

            if (verifyRes.ok) {
              onSuccess?.();
              // Refresh session to get updated subscription
              await supabase.auth.refreshSession();
              window.location.href = "/dashboard?upgrade=success";
            } else {
              setError("Payment verification failed. Contact support@financehub.in");
            }
          } catch {
            setError("Payment received but verification failed. Contact support.");
          }
          setLoading(false);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ width: fullWidth ? "100%" : undefined }}>
      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          width: fullWidth ? "100%" : undefined,
          padding: "13px 28px",
          background: loading ? "#ccc" : color,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: "0.9375rem",
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "var(--font-ui, system-ui)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "all 0.2s",
          boxShadow: loading ? "none" : "0 4px 14px rgba(0,0,0,0.15)",
        }}
        type="button"
      >
        {loading ? (
          <>
            <div
              style={{
                width: 16,
                height: 16,
                border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
            Processing…
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Get {label} — {amount}
          </>
        )}
      </button>

      {/* Payment method icons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: fullWidth ? "center" : "flex-start",
          gap: 8,
          marginTop: 8,
        }}
      >
        <span style={{ fontSize: "0.6875rem", color: "#718096" }}>Pay via</span>
        {["UPI", "Cards", "Net Banking", "EMI", "Wallets"].map((method) => (
          <span
            key={method}
            style={{
              fontSize: "0.625rem",
              fontWeight: 600,
              color: "#4A5568",
              background: "#F7FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 4,
              padding: "1px 5px",
            }}
          >
            {method}
          </span>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 12px",
            background: "#FFF5F5",
            border: "1px solid #FED7D7",
            borderRadius: 8,
            fontSize: "0.8125rem",
            color: "#C53030",
            lineHeight: 1.5,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Security note */}
      <div
        style={{
          marginTop: 6,
          fontSize: "0.6875rem",
          color: "#A0AEC0",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Secured by Razorpay · 256-bit SSL encryption
      </div>
    </div>
  );
}
