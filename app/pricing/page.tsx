"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Check, Minus, ShieldCheck, ArrowRight, 
  ChevronDown, Sparkles, BookOpen, Brain, 
  Calculator, Lock, Zap, LayoutDashboard,
  CheckCircle2, ArrowLeft, Loader2
} from "lucide-react";

// ============================================================
// FinanceHub — Simple, Transparent Pricing (10/10 Synthesis)
// app/pricing/page.tsx
// Visual Polish · Conversion & Trust · Product UI Showcase
// ============================================================

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then((res: any) => {
      setUser(res?.data?.user ?? null);
    });
  }, []);

  // Pricing configuration aligned with backend and Indian tax parity
  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Start your financial journey.",
      monthlyPrice: 0,
      annualPrice: 0,
      annualMonthlyPrice: 0,
      cta: "Start Learning Free",
      popular: false,
      features: [
        "10 foundational lessons across tracks",
        "5 AI tutor queries per day",
        "2 essential calculators (SIP & EMI)",
        "Daily challenges & streak tracking",
        "Public community discussions",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      description: "Master the complete finance system.",
      monthlyPrice: 499,
      annualPrice: 4990, // Approx 16% discount (Save ₹998/yr)
      annualMonthlyPrice: 415,
      cta: "Get FinanceHub Pro",
      popular: true,
      features: [
        "All 375+ lessons across 8 tracks",
        "Unlimited AI Mentor queries 24/7",
        "All 15 interactive simulators",
        "Verifiable mastery certificates",
        "Full book library & summaries",
      ],
    },
    {
      id: "advanced", // Renamed from Expert to avoid SEBI compliance issues
      name: "Advanced",
      description: "For serious finance professionals.",
      monthlyPrice: 999,
      annualPrice: 9990, // Approx 16% discount (Save ₹1,998/yr)
      annualMonthlyPrice: 832,
      cta: "Get Advanced Access",
      popular: false,
      features: [
        "Everything in Pro included",
        "AI Financial Statement Explainer",
        "Advanced gamification & badges",
        "Priority AI responses with citations",
        "Career hub & interview prep",
      ],
    },
  ];

  const faqs = [
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes. You can cancel from your profile settings with a single click at any time. You will retain full access until the end of your current billing period with zero cancellation fees.",
    },
    {
      q: "How does the annual billing discount work?",
      a: "When you choose annual billing, you pay for 10 months and get 2 months completely free (approx 16% discount). You are billed once a year.",
    },
    {
      q: "What payment methods are supported in India?",
      a: "We support instant UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay cards, Indian Visa/Mastercard credit & debit cards, Net Banking across all major banks, and EMI options via Razorpay. International cards are supported via Stripe.",
    },
    {
      q: "Is FinanceHub considered financial, tax, or investment advice?",
      a: "No. FinanceHub is strictly an educational platform. Nothing here constitutes investment, tax, legal, or financial advice. The 'Advanced' plan provides advanced educational simulators and AI learning tools; it does NOT include human advisory or portfolio management services.",
    },
    {
      q: "Do I get a refund if I am not satisfied?",
      a: "Yes. We offer an unconditional 7-day money-back guarantee on all paid plans. If you feel the platform did not deliver value, contact our team at support@financehub.in for an immediate refund.",
    },
  ];

  // Helper to load Razorpay script
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Payment trigger handler
  const handleCheckout = async (planId: string) => {
    if (planId === "free") {
      router.push(user ? "/dashboard" : "/auth/signup");
      return;
    }

    if (!user) {
      router.push(`/login?redirect=/pricing`);
      return;
    }

    setLoadingPlan(planId);

    try {
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        // Fallback to checkout page
        router.push(`/checkout?plan=${planId}&billing=${billing}`);
        return;
      }

      const planKey = `${planId === "advanced" ? "expert" : planId}_${billing}`;
      const res = await fetch("/api/payment/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.orderId) {
        router.push(`/checkout?plan=${planId}&billing=${billing}`);
        return;
      }

      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "FinanceHub",
        description: orderData.label || `${planId.toUpperCase()} Subscription`,
        order_id: orderData.orderId,
        prefill: {
          email: user?.email || "",
          name: user?.user_metadata?.full_name || "",
        },
        theme: {
          color: "#0E6163",
        },
        handler: async (response: any) => {
          try {
            await fetch("/api/payment/razorpay-verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            router.push("/payment-success");
          } catch {
            router.push("/payment-success");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Checkout initiation failed:", err);
      router.push(`/checkout?plan=${planId}&billing=${billing}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#1A1A2E]">
      
      {/* ── Top Navigation Link ─────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-[#0E6163] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">

        {/* ── Header & Billing Toggle ─────────────────────────────── */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold tracking-widest uppercase mb-5 border border-emerald-200">
            <Sparkles className="w-4 h-4" /> Simple, Transparent Pricing
          </div>

          <h1 
            className="text-[40px] md:text-[50px] font-bold text-[#0A1628] mb-4 tracking-tight leading-[1.15]" 
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Invest in Your Financial Literacy.
          </h1>

          <p className="text-[16px] text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            Master personal finance, investing, trading, crypto, and corporate finance on one focused platform. No hidden fees. Cancel anytime.
          </p>

          {/* Monthly / Annual Billing Toggle */}
          <div className="inline-flex items-center p-1.5 bg-gray-100/90 rounded-2xl border border-gray-200 shadow-xs">
            <button 
              onClick={() => setBilling("monthly")}
              className={`px-6 py-2.5 text-[14px] font-bold rounded-xl transition-all ${
                billing === "monthly" 
                  ? "bg-white text-[#0A1628] shadow-sm" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBilling("annual")}
              className={`px-6 py-2.5 text-[14px] font-bold rounded-xl transition-all flex items-center gap-2 ${
                billing === "annual" 
                  ? "bg-white text-[#0A1628] shadow-sm" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Annual <span className="text-[10px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded-md border border-emerald-200">Save 16%</span>
            </button>
          </div>
        </div>

        {/* ── Decision Helper (Placed Above Cards) ─────────────────── */}
        <div className="mb-12">
          <h2 className="text-center text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Which plan matches your goals?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center shadow-xs">
              <p className="text-[14px] font-bold text-[#0A1628] mb-1">I am starting out</p>
              <p className="text-[12.5px] text-gray-500 leading-relaxed">Understand money, saving, budgeting, and basic investing from zero.</p>
            </div>
            <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-300 text-center shadow-xs">
              <p className="text-[14px] font-bold text-emerald-800 mb-1">I want to go deeper</p>
              <p className="text-[12.5px] text-emerald-700 leading-relaxed">Structured learning, practical simulations, and unlimited AI mentor support.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center shadow-xs">
              <p className="text-[14px] font-bold text-[#0A1628] mb-1">I need advanced tools</p>
              <p className="text-[12.5px] text-gray-500 leading-relaxed">Financial statement models, career prep, and priority AI insights.</p>
            </div>
          </div>
        </div>

        {/* ── Pricing Cards (Equal Height & Strict Hierarchy) ─────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-20 items-stretch">
          {plans.map((plan) => {
            const price = billing === "monthly" ? plan.monthlyPrice : plan.annualMonthlyPrice;
            const isPro = plan.popular;

            return (
              <div 
                key={plan.name}
                className={`relative bg-white rounded-3xl p-8 border transition-all flex flex-col justify-between ${
                  isPro 
                    ? "border-[#10B981] shadow-2xl shadow-emerald-500/10 md:-translate-y-3 ring-1 ring-[#10B981]" 
                    : "border-gray-200 shadow-xs hover:shadow-md"
                }`}
              >
                {/* Popular Pill */}
                {isPro && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#10B981] text-white text-[11px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  {/* Plan Header */}
                  <div className="mb-6">
                    <h3 className="text-[22px] font-bold text-[#0A1628] mb-1.5">{plan.name}</h3>
                    <p className="text-[13px] text-gray-500">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-7 pb-6 border-b border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[44px] font-bold text-[#0A1628] tracking-tight font-mono">
                        ₹{price}
                      </span>
                      <span className="text-[14px] text-gray-500 font-medium">/month</span>
                    </div>

                    {billing === "annual" && plan.monthlyPrice > 0 && (
                      <p className="text-[12px] text-emerald-600 font-semibold mt-1">
                        ₹{plan.annualPrice.toLocaleString("en-IN")} billed annually (2 months free)
                      </p>
                    )}
                    {billing === "monthly" && plan.monthlyPrice > 0 && (
                      <p className="text-[12px] text-gray-400 mt-1">Billed monthly • Cancel anytime</p>
                    )}
                    {plan.monthlyPrice === 0 && (
                      <p className="text-[12px] text-gray-400 mt-1">Free forever • No credit card needed</p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button 
                    onClick={() => handleCheckout(plan.id)}
                    disabled={loadingPlan === plan.id}
                    className={`w-full py-3.5 rounded-xl text-[14px] font-bold text-center transition-all mb-8 flex items-center justify-center gap-2 ${
                      isPro
                        ? "bg-[#10B981] text-white hover:bg-[#059669] shadow-lg shadow-emerald-500/20"
                        : plan.monthlyPrice === 0 
                          ? "bg-gray-100 text-[#0A1628] hover:bg-gray-200 border border-gray-200/80"
                          : "bg-[#0A1628] text-white hover:bg-[#0F3D3E]"
                    }`}
                  >
                    {loadingPlan === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>

                {/* 5 Core Features */}
                <ul className="space-y-3.5 pt-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center mt-0.5 shrink-0 border border-emerald-200/60">
                        <Check className="w-3 h-3 text-[#10B981] stroke-[2.5]" />
                      </div>
                      <span className="text-[13px] text-gray-600 leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>

              </div>
            );
          })}
        </div>

        {/* ── Product Showcase (See What You Get) ──────────────────── */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 
              className="text-[32px] md:text-[36px] font-bold text-[#0A1628] mb-3 tracking-tight" 
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              More Than Just Lessons.
            </h2>
            <p className="text-[16px] text-gray-500">
              A complete, experiential financial learning ecosystem built specifically for India.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                icon: LayoutDashboard, 
                title: "Progress Dashboard", 
                desc: "Track completed lessons, active streaks, earned XP, and monitor your personalized competency map." 
              },
              { 
                icon: Brain, 
                title: "24/7 AI Mentor", 
                desc: "Instant doubt-clearing trained on Indian tax laws, SEBI regulations, and real financial statement data." 
              },
              { 
                icon: Calculator, 
                title: "15 Risk-Free Simulators", 
                desc: "Practice with SIP calculators, tax regime break-even engines, and interactive paper trading theaters." 
              },
            ].map((item, i) => (
              <div 
                key={i} 
                className="bg-white rounded-3xl border border-gray-200 p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-center mb-5 text-[#0E6163]">
                  <item.icon className="w-7 h-7 text-[#0E6163]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#0A1628] mb-2">{item.title}</h3>
                <p className="text-[13.5px] text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feature Comparison (Strict & Clean) ──────────────────── */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 
              className="text-[32px] font-bold text-[#0A1628] mb-2 tracking-tight" 
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Compare Every Feature.
            </h2>
            <p className="text-[15px] text-gray-500">Every plan includes foundational access. Upgrade for unmetered tools.</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            {/* Table Header */}
            <div className="grid grid-cols-4 bg-gray-50/80 border-b border-gray-200 px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
              <div>Platform Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center text-[#10B981]">Pro (Recommended)</div>
              <div className="text-center">Advanced</div>
            </div>

            {/* Category 1: Learning & Content */}
            <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
              <p className="text-[12px] font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0E6163]" /> Learning & Curriculum Content
              </p>
            </div>
            {[
              { feature: "Access to Lessons", free: "10 free lessons", pro: "All 375+ lessons", expert: "All 375+ lessons" },
              { feature: "Sovereign Tracks", free: "1 preview track", pro: "All 8 tracks", expert: "All 8 tracks" },
              { feature: "Case Study Library", free: "3 preview studies", pro: "Full library (15+)", expert: "Full library (15+)" },
              { feature: "Finance Book Summaries", free: false, pro: true, expert: true },
              { feature: "Verifiable Certificates", free: false, pro: true, expert: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-4 px-6 py-4 border-b border-gray-100 text-[13px] text-gray-700 hover:bg-gray-50/70 transition-colors">
                <div className="font-medium">{row.feature}</div>
                <div className="text-center">{renderCell(row.free)}</div>
                <div className="text-center">{renderCell(row.pro)}</div>
                <div className="text-center">{renderCell(row.expert)}</div>
              </div>
            ))}

            {/* Category 2: AI Tools & Intelligence */}
            <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
              <p className="text-[12px] font-bold text-gray-800 flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#0E6163]" /> AI Tools & Personalized Learning
              </p>
            </div>
            {[
              { feature: "AI Queries per Day", free: "5 queries / day", pro: "Unlimited 24/7", expert: "Unlimited 24/7" },
              { feature: "Personalized AI Roadmap", free: false, pro: true, expert: true },
              { feature: "AI Financial Statement Explainer", free: false, pro: false, expert: true },
              { feature: "Priority Latency & Citations", free: false, pro: false, expert: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-4 px-6 py-4 border-b border-gray-100 text-[13px] text-gray-700 hover:bg-gray-50/70 transition-colors">
                <div className="font-medium">{row.feature}</div>
                <div className="text-center">{renderCell(row.free)}</div>
                <div className="text-center">{renderCell(row.pro)}</div>
                <div className="text-center">{renderCell(row.expert)}</div>
              </div>
            ))}

            {/* Category 3: Simulators & Practice */}
            <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
              <p className="text-[12px] font-bold text-gray-800 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#0E6163]" /> Simulators & Interactive Practice
              </p>
            </div>
            {[
              { feature: "Interactive Financial Calculators", free: "2 basic calculators", pro: "All 15 simulators", expert: "All 15 simulators" },
              { feature: "Trading Theater (Paper Trading)", free: false, pro: true, expert: true },
              { feature: "Corporate Valuation Models (DCF)", free: false, pro: false, expert: true },
              { feature: "Career Hub & Interview Prep", free: false, pro: false, expert: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-4 px-6 py-4 border-b border-gray-100 text-[13px] text-gray-700 hover:bg-gray-50/70 transition-colors last:border-0">
                <div className="font-medium">{row.feature}</div>
                <div className="text-center">{renderCell(row.free)}</div>
                <div className="text-center">{renderCell(row.pro)}</div>
                <div className="text-center">{renderCell(row.expert)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Trust Badges (4-Column Verifiable Grid) ─────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-20">
          {[
            { icon: ShieldCheck, title: "256-Bit SSL Encryption", desc: "Banking-grade data transmission across all interactions." },
            { icon: Lock, title: "PCI-DSS Level 1 Gateway", desc: "Razorpay & Stripe handle card data. We never store card details." },
            { icon: Zap, title: "DPDP Act 2023 Compliant", desc: "Strict Indian data protection and privacy standards applied." },
            { icon: Calculator, title: "100% Educational Academy", desc: "Strictly financial literacy. No SEBI stock tips or advisory." },
          ].map((badge, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
                <badge.icon className="w-5 h-5 text-[#10B981]" />
              </div>
              <p className="text-[13px] font-bold text-[#0A1628] mb-1">{badge.title}</p>
              <p className="text-[11.5px] text-gray-500 leading-relaxed">{badge.desc}</p>
            </div>
          ))}
        </div>

        {/* ── FAQ Section ─────────────────────────────────────────── */}
        <div className="mb-20 max-w-3xl mx-auto">
          <h2 
            className="text-[32px] font-bold text-[#0A1628] mb-8 text-center tracking-tight" 
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-[15px] font-bold text-[#0A1628] pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-[14px] text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-gray-50/30">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Final Authority CTA Banner ───────────────────────────── */}
        <div className="bg-[#0A1628] rounded-3xl p-10 md:p-14 text-center relative overflow-hidden shadow-2xl border border-gray-800">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 
              className="text-[32px] md:text-[38px] font-bold text-white mb-3 tracking-tight" 
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Start Building Your Financial Independence Today.
            </h2>
            <p className="text-[15px] text-gray-300 mb-8 leading-relaxed">
              No credit card required for the Free core. Upgrade to Pro whenever you want to unlock unmetered simulations and AI mentoring.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                href="/auth/signup" 
                className="px-8 py-3.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-[14px] font-bold shadow-md hover:shadow-lg transition-all"
              >
                Start Learning Free
              </Link>
              <Link 
                href="/explore" 
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[14px] font-bold border border-white/20 transition-all"
              >
                Browse Syllabus
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Clean helper to render comparison cell values
function renderCell(value: string | boolean) {
  if (value === true) {
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
        <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[2.5]" />
      </div>
    );
  }
  if (value === false) {
    return <Minus className="w-4 h-4 text-gray-300 mx-auto" />;
  }
  return <span className="font-semibold text-[#0A1628] text-[13px]">{value}</span>;
}
