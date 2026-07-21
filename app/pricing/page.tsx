"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Billing = "monthly" | "annual";
type PlanId = "free" | "pro" | "expert";

type Plan = {
  id: PlanId;
  name: string;
  price: { monthly: number; annualMonthly: number };
  color: string;
  bg: string;
  icon: string;
  tagline: string;
  popular?: boolean;
  features: string[];
  locked: string[];
  cta: string;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, annualMonthly: 0 },
    color: "#666",
    bg: "#f5f5f3",
    icon: "FREE",
    tagline: "Start your finance journey",
    features: [
      "10 free lessons across all tracks",
      "5 AI tutor questions per day",
      "Budget and SIP calculators",
      "Leaderboard access",
      "Daily challenges",
      "Finance library with playlists and books",
      "Community discussions",
    ],
    locked: [
      "Full lesson library with 55+ lessons",
      "Unlimited AI tutor",
      "Forex and crypto paper trading",
      "AI exam generator",
      "AI roadmap planner",
      "Lesson notes downloads",
      "Career hub and interview Q&A",
    ],
    cta: "Current plan",
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 499, annualMonthly: 399 },
    color: "#1D9E75",
    bg: "#E1F5EE",
    icon: "PRO",
    tagline: "Everything you need to master finance",
    popular: true,
    features: [
      "All 55+ lessons across 4 tracks",
      "Unlimited AI tutor with 5 personas",
      "Forex paper trading with 6 pairs",
      "Crypto paper trading with 6 assets",
      "AI exam generator for General, CFA, FRM, and CA styles",
      "AI weakness detector",
      "AI roadmap planner for 30, 60, and 90 days",
      "Lesson notes downloads",
      "Finance simulators: SIP, EMI, Tax, Retirement, Startup",
      "Career hub with 50 interview Q&A",
      "Mastery tracking and spaced repetition",
      "Daily challenges and weekly missions",
      "Season rankings and leaderboard",
      "Certificate on track completion",
    ],
    locked: [],
    cta: "Get Pro",
  },
  {
    id: "expert",
    name: "Expert",
    price: { monthly: 999, annualMonthly: 799 },
    color: "#534AB7",
    bg: "#EEEDFE",
    icon: "EXP",
    tagline: "For serious finance professionals",
    features: [
      "Everything in Pro",
      "AI financial statement explainer",
      "Advanced gamification and exclusive badges",
      "Priority AI responses",
      "Expert badge on leaderboard",
      "Early access to new features",
      "Priority support",
    ],
    locked: [],
    cta: "Get Expert",
  },
];

const FAQ = [
  { q: "Can I cancel anytime?", a: "Yes. Cancel from your profile settings at any time. You keep access until the end of your billing period." },
  { q: "Is there a free trial?", a: "Pro and Expert plans include a 7-day free trial. No credit card charges until the trial ends." },
  { q: "What payment methods are accepted?", a: "All major credit and debit cards through Stripe. UPI support can be enabled later." },
  { q: "Is this financial advice?", a: "No. FinanceHub is an educational platform only. Nothing here is investment, tax, or financial advice." },
  { q: "Can I switch plans?", a: "Yes. Upgrade or downgrade anytime from your profile. Billing is handled by Stripe." },
  { q: "Are there student discounts?", a: "Email hello@financehub.in with your student ID for discount options." },
];

const COMPARISON = [
  { feature: "Lessons", free: "10 free", pro: "55+", expert: "55+" },
  { feature: "AI tutor questions", free: "5/day", pro: "Unlimited", expert: "Unlimited" },
  { feature: "AI tutor personas", free: "1", pro: "5", expert: "5" },
  { feature: "Forex paper trading", free: "No", pro: "Yes", expert: "Yes" },
  { feature: "Crypto paper trading", free: "No", pro: "Yes", expert: "Yes" },
  { feature: "Finance calculators", free: "2", pro: "All", expert: "All" },
  { feature: "AI exam generator", free: "No", pro: "Yes", expert: "Yes" },
  { feature: "AI roadmap planner", free: "No", pro: "Yes", expert: "Yes" },
  { feature: "AI financial explainer", free: "No", pro: "No", expert: "Yes" },
  { feature: "Lesson notes downloads", free: "Free lessons", pro: "All lessons", expert: "All lessons" },
  { feature: "YouTube and book library", free: "Yes", pro: "Yes", expert: "Yes" },
  { feature: "Career hub and interview Q&A", free: "No", pro: "Yes", expert: "Yes" },
  { feature: "Mastery tracking", free: "No", pro: "Yes", expert: "Yes" },
  { feature: "Certificates", free: "No", pro: "Yes", expert: "Yes" },
  { feature: "Support", free: "Community", pro: "Email", expert: "Priority" },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [error, setError] = useState("");

  const handleCheckout = async (plan: Plan) => {
    if (plan.id === "free") {
      window.location.href = "/dashboard";
      return;
    }

    setLoading(plan.id);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/auth/login?redirect=/pricing";
      return;
    }

    const response = await fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ plan: plan.id, billing }),
    });

    const data = (await response.json()) as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
      return;
    }

    setError(data.error || "Checkout failed. Please try again.");
    setLoading(null);
  };

  const savings = Math.round(((499 - 399) / 499) * 100);

  return (
    <div style={s.page}>
      <Link href="/dashboard" style={s.back}>
        Back to dashboard
      </Link>

      <section style={s.hero}>
        <div style={s.heroBadge}>Simple, honest pricing</div>
        <h1 style={s.heroTitle}>Invest in your financial education</h1>
        <p style={s.heroSub}>
          Master personal finance, investing, trading, crypto, and corporate finance in one focused platform.
        </p>

        <div style={s.billingToggle}>
          <button onClick={() => setBilling("monthly")} style={{ ...s.billingBtn, ...(billing === "monthly" ? s.billingBtnActive : {}) }} type="button">
            Monthly
          </button>
          <button onClick={() => setBilling("annual")} style={{ ...s.billingBtn, ...(billing === "annual" ? s.billingBtnActive : {}) }} type="button">
            Annual
            <span style={s.savingsBadge}>Save {savings}%</span>
          </button>
        </div>
      </section>

      {error ? <div style={s.errorBox}>{error}</div> : null}

      <section style={s.plansGrid}>
        {PLANS.map((plan) => {
          const price = billing === "annual" ? plan.price.annualMonthly : plan.price.monthly;
          const isFree = plan.id === "free";
          const isLoading = loading === plan.id;

          return (
            <div key={plan.id} style={{ ...s.planCard, ...(plan.popular ? s.planCardPopular : {}), borderColor: plan.popular ? plan.color : "#e5e5e5" }}>
              {plan.popular ? <div style={{ ...s.popularBadge, background: plan.color }}>Most popular</div> : null}

              <div style={s.planHeader}>
                <div style={{ ...s.planIcon, background: plan.bg, color: plan.color }}>{plan.icon}</div>
                <div>
                  <div style={{ ...s.planName, color: plan.color }}>{plan.name}</div>
                  <div style={s.planTagline}>{plan.tagline}</div>
                </div>
              </div>

              <div style={s.planPrice}>
                {isFree ? (
                  <span style={s.priceFree}>Free forever</span>
                ) : (
                  <>
                    <span style={s.priceAmount}>Rs {price}</span>
                    <span style={s.pricePeriod}>/month</span>
                    {billing === "annual" ? <div style={s.annualNote}>Billed Rs {price * 12}/year</div> : null}
                  </>
                )}
              </div>

              {!isFree ? <div style={s.trialNote}>7-day free trial. Cancel anytime.</div> : null}

              <button
                onClick={() => void handleCheckout(plan)}
                disabled={isLoading}
                style={{ ...s.ctaBtn, background: isFree ? "#f0f0f0" : plan.color, color: isFree ? "#555" : "#fff", opacity: isLoading ? 0.7 : 1 }}
                type="button"
              >
                {isLoading ? "Loading..." : plan.cta}
              </button>

              <div style={s.featureList}>
                {plan.features.map((feature) => (
                  <div key={feature} style={s.featureItem}>
                    <span style={{ ...s.featureCheck, color: plan.color }}>Yes</span>
                    <span style={s.featureText}>{feature}</span>
                  </div>
                ))}
                {plan.locked.map((feature) => (
                  <div key={feature} style={{ ...s.featureItem, opacity: 0.45 }}>
                    <span style={s.featureCheck}>No</span>
                    <span style={s.featureText}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section style={s.comparison}>
        <h2 style={s.compTitle}>Full feature comparison</h2>
        <div style={s.compTable}>
          <div style={s.compHeader}>
            <div style={s.compFeatureCol}>Feature</div>
            <div style={s.compPlanCol}>Free</div>
            <div style={s.compPlanCol}>Pro</div>
            <div style={s.compPlanCol}>Expert</div>
          </div>
          {COMPARISON.map((row, index) => (
            <div key={row.feature} style={{ ...s.compRow, background: index % 2 === 0 ? "#fafafa" : "#fff" }}>
              <div style={s.compFeatureCell}>{row.feature}</div>
              <div style={s.compCell}>{row.free}</div>
              <div style={{ ...s.compCell, color: "#1D9E75", fontWeight: 600 }}>{row.pro}</div>
              <div style={{ ...s.compCell, color: "#534AB7", fontWeight: 600 }}>{row.expert}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.faq}>
        <h2 style={s.faqTitle}>Frequently asked questions</h2>
        <div style={s.faqGrid}>
          {FAQ.map((item) => (
            <div key={item.q} style={s.faqItem}>
              <div style={s.faqQ}>{item.q}</div>
              <div style={s.faqA}>{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.finalCta}>
        <div style={s.finalCtaTitle}>Start for free today</div>
        <p style={s.finalCtaSub}>No credit card required. Upgrade whenever you are ready.</p>
        <div style={s.finalCtaBtns}>
          <Link href="/auth/signup" style={s.finalCtaPrimary}>
            Get started free
          </Link>
          <Link href="/explore" style={s.finalCtaSecondary}>
            Browse lessons first
          </Link>
        </div>
        <p style={s.disclaimer}>
          FinanceHub is an educational platform. Content is for learning only and does not constitute financial, investment, or tax advice.
        </p>
      </section>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui,-apple-system,sans-serif", padding: "24px 24px 60px", maxWidth: 1060, margin: "0 auto" },
  back: { fontSize: 13, color: "#888", textDecoration: "none", display: "block", marginBottom: 20 },
  hero: { textAlign: "center", marginBottom: 32 },
  heroBadge: { fontSize: 11, fontWeight: 700, color: "#1D9E75", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 },
  heroTitle: { fontSize: 32, fontWeight: 800, color: "#0a0a0a", margin: "0 0 12px", letterSpacing: "-0.8px" },
  heroSub: { fontSize: 15, color: "#888", lineHeight: 1.7, margin: "0 auto 24px", maxWidth: 540 },
  billingToggle: { display: "inline-flex", background: "#eee", borderRadius: 12, padding: 4, gap: 4 },
  billingBtn: { padding: "8px 20px", fontSize: 13, fontWeight: 500, border: "none", borderRadius: 9, background: "transparent", color: "#666", cursor: "pointer", fontFamily: "system-ui", display: "flex", alignItems: "center", gap: 6 },
  billingBtnActive: { background: "#fff", color: "#0a0a0a", fontWeight: 600, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" },
  savingsBadge: { fontSize: 10, fontWeight: 700, color: "#1D9E75", background: "#E1F5EE", padding: "1px 6px", borderRadius: 8 },
  errorBox: { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#B91C1C", marginBottom: 16, textAlign: "center" },
  plansGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 48 },
  planCard: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 16, padding: "24px", position: "relative" },
  planCardPopular: { border: "2px solid", boxShadow: "0 4px 24px rgba(29,158,117,0.15)" },
  popularBadge: { position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", fontSize: 11, fontWeight: 700, color: "#fff", padding: "3px 14px", borderRadius: 20 },
  planHeader: { display: "flex", gap: 12, alignItems: "center", marginBottom: 16 },
  planIcon: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 },
  planName: { fontSize: 18, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 2 },
  planTagline: { fontSize: 11, color: "#888", lineHeight: 1.4 },
  planPrice: { marginBottom: 6 },
  priceFree: { fontSize: 20, fontWeight: 700, color: "#555" },
  priceAmount: { fontSize: 36, fontWeight: 800, color: "#0a0a0a", letterSpacing: "-1px" },
  pricePeriod: { fontSize: 14, color: "#aaa", marginLeft: 2 },
  annualNote: { fontSize: 11, color: "#aaa", marginTop: 2 },
  trialNote: { fontSize: 11, color: "#1D9E75", marginBottom: 14 },
  ctaBtn: { width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, border: "none", borderRadius: 11, cursor: "pointer", fontFamily: "system-ui", marginBottom: 20, transition: "opacity .2s" },
  featureList: { display: "flex", flexDirection: "column", gap: 9 },
  featureItem: { display: "flex", alignItems: "flex-start", gap: 8 },
  featureCheck: { width: 24, flexShrink: 0, fontSize: 11, fontWeight: 800, marginTop: 2 },
  featureText: { fontSize: 13, color: "#444", lineHeight: 1.4 },
  comparison: { marginBottom: 48 },
  compTitle: { fontSize: 20, fontWeight: 700, color: "#0a0a0a", marginBottom: 16, letterSpacing: "-0.4px" },
  compTable: { border: "0.5px solid #eee", borderRadius: 12, overflow: "hidden" },
  compHeader: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 16px", background: "#0a0a0a", fontWeight: 600, fontSize: 12, color: "#aaa" },
  compFeatureCol: { color: "#aaa" },
  compPlanCol: { textAlign: "center", color: "#aaa" },
  compRow: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "11px 16px", borderBottom: "0.5px solid #f0f0f0" },
  compFeatureCell: { fontSize: 12, color: "#555" },
  compCell: { fontSize: 12, color: "#888", textAlign: "center" },
  faq: { marginBottom: 48 },
  faqTitle: { fontSize: 20, fontWeight: 700, color: "#0a0a0a", marginBottom: 20, letterSpacing: "-0.4px" },
  faqGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  faqItem: { background: "#fff", border: "0.5px solid #eee", borderRadius: 12, padding: "16px 18px" },
  faqQ: { fontSize: 14, fontWeight: 600, color: "#0a0a0a", marginBottom: 7 },
  faqA: { fontSize: 13, color: "#666", lineHeight: 1.7 },
  finalCta: { background: "#0a0a0a", borderRadius: 16, padding: "36px 32px", textAlign: "center" },
  finalCtaTitle: { fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.6px" },
  finalCtaSub: { fontSize: 14, color: "#888", margin: "0 0 24px", lineHeight: 1.6 },
  finalCtaBtns: { display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 },
  finalCtaPrimary: { padding: "12px 28px", background: "#1D9E75", color: "#fff", borderRadius: 11, textDecoration: "none", fontSize: 14, fontWeight: 700 },
  finalCtaSecondary: { padding: "12px 28px", border: "0.5px solid #333", color: "#aaa", borderRadius: 11, textDecoration: "none", fontSize: 14, fontWeight: 500 },
  disclaimer: { fontSize: 10, color: "#555", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" },
};
