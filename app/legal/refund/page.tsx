"use client";
import Logo from "@/components/ui/Logo";

export default function RefundPolicyPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px", fontFamily: "var(--font-ui,system-ui)" }}>
      <div style={{ marginBottom: 32 }}>
        <a href="/" style={{ textDecoration: "none" }}><Logo size="sm" /></a>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1c2b3a", margin: "0 0 8px", letterSpacing: "-0.4px" }}>
        Refund Policy
      </h1>
      <p style={{ fontSize: 14, color: "#718096", margin: "0 0 32px" }}>
        Last updated: September 2026
      </p>

      {[
        {
          title: "1. Our Refund Commitment",
          body: `FinanceHub offers a 7-day money-back guarantee for first-time subscribers to our Pro or Expert plans. If you are not satisfied with your subscription within 7 days of your first payment, you may request a full refund — no questions asked.

This 7-day guarantee applies only to your first subscription purchase. Renewals, plan upgrades, and repeat subscriptions are not eligible for the money-back guarantee.`,
        },
        {
          title: "2. Eligibility for Refund",
          body: `You are eligible for a refund if:
• You are a first-time subscriber to a paid plan (Pro or Expert)
• Your refund request is submitted within 7 calendar days of your initial payment
• You have not previously received a refund from FinanceHub

You are NOT eligible for a refund if:
• Your subscription has been active for more than 7 days
• You have previously received a refund from FinanceHub
• Your account was terminated due to a violation of our Terms of Service`,
        },
        {
          title: "3. How to Request a Refund",
          body: `To request a refund, email us at support@financehub.in with:
• Your registered email address
• Date of payment
• Payment transaction ID (from your payment confirmation email)
• Brief reason for the refund request (optional but helps us improve)

We will process your refund within 5-7 business days. The amount will be credited to your original payment method (UPI, card, or net banking).`,
        },
        {
          title: "4. Refund Processing Time",
          body: `Once approved, refunds are processed as follows:
• UPI payments: 1-3 business days
• Credit/Debit card: 5-7 business days (depending on your bank)
• Net banking: 3-5 business days
• Razorpay wallet: 1-2 business days

FinanceHub will initiate the refund within 2 business days of approval. Your bank's processing time is outside our control.`,
        },
        {
          title: "5. Subscription Cancellation",
          body: `Cancelling your subscription is different from requesting a refund.

You can cancel your subscription anytime from Settings → Subscription. Cancellation prevents future charges. Your access continues until the end of the current billing period.

Cancellation does not automatically trigger a refund. If you wish to cancel AND receive a refund within the 7-day window, please follow the refund request process above.`,
        },
        {
          title: "6. Annual Subscriptions",
          body: `For annual subscriptions, the 7-day money-back guarantee applies to the first payment. After 7 days, annual subscriptions are non-refundable.

If you switch from monthly to annual billing, the 7-day guarantee does not reset — it applies only to your very first payment with FinanceHub.`,
        },
        {
          title: "7. Free Plan",
          body: `The Free plan has no payment and therefore no refund policy applies. Free plan users can upgrade or downgrade at any time.`,
        },
        {
          title: "8. Contact Us",
          body: `For any questions about this refund policy, contact:
Email: support@financehub.in
Response time: Within 2 business days

Registered address: FinanceHub Education, [Address], India`,
        },
      ].map((section, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1c2b3a", margin: "0 0 10px" }}>
            {section.title}
          </h2>
          <div style={{ fontSize: 14, color: "#526173", lineHeight: 1.8, whiteSpace: "pre-line" }}>
            {section.body}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 40, padding: "16px 20px", background: "#F7F9F8", border: "1px solid #e5eaf0", borderRadius: 12, fontSize: 13, color: "#718096" }}>
        <strong>Quick links:</strong>{" "}
        <a href="/legal/terms" style={{ color: "#0E6163" }}>Terms of Service</a>{" · "}
        <a href="/legal/privacy" style={{ color: "#0E6163" }}>Privacy Policy</a>{" · "}
        <a href="/legal/disclaimer" style={{ color: "#0E6163" }}>Disclaimer</a>
      </div>
    </div>
  );
}
