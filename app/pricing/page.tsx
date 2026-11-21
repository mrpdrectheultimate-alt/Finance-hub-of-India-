"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Check, Minus, ShieldCheck, ArrowRight, 
  ChevronDown, Sparkles, BookOpen, Brain, 
  Calculator, Lock, Zap, LayoutDashboard,
  CheckCircle2, ArrowLeft, Loader2, HelpCircle,
  CreditCard, Award
} from "lucide-react";

// ============================================================
// FinanceHub — 10/10 Institutional Pricing & Membership Arena
// app/pricing/page.tsx
// Visual Polish · Conversion & Trust · Razorpay UPI Integration
// ============================================================

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then((res: any) => {
      setUser(res?.data?.user ?? null);
    });
  }, []);

  const plans = [
    {
      id: "free",
      name: "Free Core",
      badge: "Open Access",
      badgeColor: "bg-gray-100 text-gray-700 border-gray-200",
      description: "Foundational financial literacy for students and beginners.",
      monthlyPrice: 0,
      annualPrice: 0,
      annualMonthlyPrice: 0,
      cta: "Start Learning Free",
      popular: false,
      borderStyle: "border-gray-200 hover:border-gray-300",
      features: [
        "10 foundational lessons across all 8 tracks",
        "5 AI mentor queries per day",
        "Essential SIP & Loan EMI calculators",
        "Daily streak tracking & community forum",
        "100% Ad-free learning forever",
      ],
    },
    {
      id: "pro",
      name: "FinanceHub Pro",
      badge: "Most Popular",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description: "Complete mastery across all 8 Indian financial disciplines.",
      monthlyPrice: 499,
      annualPrice: 4990,
      annualMonthlyPrice: 415,
      cta: "Get FinanceHub Pro",
      popular: true,
      borderStyle: "border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/20",
      features: [
        "All 375+ structured lessons across 8 tracks",
        "Unlimited 24/7 AI Finance Mentor access",
        "All 16 interactive financial simulators & labs",
        "Verifiable completion certificates & badges",
        "Real Indian Case Studies ('Failure & Recovery Files')",
        "Curated finance book summaries library",
      ],
    },
    {
      id: "advanced",
      name: "FinanceHub Advanced",
      badge: "For Practitioners",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      description: "Designed for serious equity traders, founders, and finance professionals.",
      monthlyPrice: 999,
      annualPrice: 9990,
      annualMonthlyPrice: 832,
      cta: "Get Advanced Access",
      popular: false,
      borderStyle: "border-blue-500/60 hover:border-blue-500 shadow-lg shadow-blue-500/5",
      features: [
        "Everything included in Pro membership",
        "AI Financial Statement Explainer (10-K & P&L)",
        "Advanced Paper Trading Sandbox (₹1 Lakh virtual capital)",
        "Priority AI responses with SEBI & AMFI citations",
        "Career pathway guide & finance interview prep",
      ],
    },
  ];

  const comparisonFeatures = [
    { category: "Curriculum & Lessons", items: [
      { name: "Foundational Lessons", free: "10 Lessons", pro: "All 375+ Lessons", advanced: "All 375+ Lessons" },
      { name: "Sovereign Tracks", free: "Limited", pro: "All 8 Tracks", advanced: "All 8 Tracks" },
      { name: "Mastery Certificates", free: false, pro: true, advanced: true },
      { name: "Book Summaries Library", free: false, pro: true, advanced: true },
    ]},
    { category: "AI Finance Mentor", items: [
      { name: "Daily Question Limit", free: "5 Queries/Day", pro: "Unlimited", advanced: "Unlimited Priority" },
      { name: "Regulatory Citations (AMFI/SEBI)", free: false, pro: true, advanced: true },
      { name: "Financial Statement Explainer", free: false, pro: false, advanced: true },
    ]},
    { category: "Practice Labs & Simulators", items: [
      { name: "Basic Calculators (SIP, EMI)", free: true, pro: true, advanced: true },
      { name: "Tax Calculator FY 2025-26", free: false, pro: true, advanced: true },
      { name: "NSE/BSE Paper Trading Game", free: false, pro: true, advanced: true },
      { name: "Startup Cash Flow & Runway Lab", free: false, pro: true, advanced: true },
      { name: "Stress-Test Simulator", free: false, pro: true, advanced: true },
    ]},
  ];

  const faqs = [
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes. You can cancel from your profile settings with a single click at any time. You will retain full access until the end of your billing cycle with zero cancellation fees.",
    },
    {
      q: "How does the annual billing discount work?",
      a: "When you choose annual billing, you pay for 10 months and get 2 months completely free (approx 16% discount). You are billed once per year.",
    },
    {
      q: "What payment methods are supported in India?",
      a: "We support instant UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay cards, Indian Visa/Mastercard credit & debit cards, Net Banking across all major banks, and EMI options via Razorpay.",
    },
    {
      q: "Is FinanceHub considered financial, tax, or investment advice?",
      a: "No. FinanceHub is strictly an educational platform. Nothing here constitutes investment, tax, legal, or financial advice. We do not provide human portfolio management or stock tipping services.",
    },
    {
      q: "Do I get a refund if I am not satisfied?",
      a: "Yes. We offer an unconditional 7-day money-back guarantee on all paid plans. If you feel the platform did not deliver immense value, contact support@financehub.in for an immediate refund.",
    },
  ];

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
          color: "#10B981",
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1A1A2E] overflow-x-hidden">
      
      {/* ── Institutional Hero Header ────────────────────────────── */}
      <div className="bg-[#0A1628] text-white relative overflow-hidden border-b border-gray-800">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-6 pt-10 pb-16 relative z-10">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-400 border border-white/10 text-[12px] font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Transparent Indian Pricing · Zero Hidden Fees
            </div>

            <h1 
              className="text-[40px] md:text-[54px] font-bold text-white leading-[1.1] mb-4 tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Invest in Your Financial Literacy. <br />
              <span className="text-emerald-400">Built for India.</span>
            </h1>

            <p className="text-[17px] text-gray-300 leading-relaxed mb-8 max-w-xl mx-auto">
              Master personal finance, tax slabs, trading, and company valuations. Learn at your own pace with practical interactive tools.
            </p>

            {/* Billing Toggle (Monthly vs Annual) */}
            <div className="inline-flex items-center p-1.5 bg-[#162032] border border-white/10 rounded-2xl shadow-inner">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  billing === "monthly" 
                    ? "bg-white text-[#0A1628] shadow-sm" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  billing === "annual" 
                    ? "bg-[#10B981] text-white shadow-sm" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-extrabold tracking-wide uppercase">
                  Save 16% (2 Mo Free)
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-14">
        
        {/* ── 3-Tier Pricing Cards Grid ────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 -mt-20 relative z-20 items-stretch">
          {plans.map((plan) => {
            const price = billing === "annual" ? plan.annualMonthlyPrice : plan.monthlyPrice;
            const isFree = plan.id === "free";

            return (
              <div 
                key={plan.id}
                className={`bg-white rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${plan.borderStyle} ${
                  plan.popular ? "scale-105 z-10 border-2" : "border"
                }`}
              >
                <div>
                  {/* Top Badge & Plan Name */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                    {plan.popular && (
                      <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 fill-emerald-500" /> Recommended
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-[#0A1628] mb-2">{plan.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-6 min-h-[36px]">{plan.description}</p>

                  {/* Price Block */}
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[44px] font-bold font-mono text-[#0A1628] leading-none">
                        {isFree ? "₹0" : `₹${price}`}
                      </span>
                      {!isFree && (
                        <span className="text-xs text-gray-500 font-medium">
                          / month
                        </span>
                      )}
                    </div>
                    {!isFree && billing === "annual" && (
                      <p className="text-[11px] font-mono text-emerald-600 font-bold mt-1.5">
                        Billed annually as ₹{plan.annualPrice.toLocaleString("en-IN")}/year
                      </p>
                    )}
                    {isFree && (
                      <p className="text-[11px] text-gray-400 font-medium mt-1.5">
                        No credit card required. Free forever.
                      </p>
                    )}
                  </div>

                  {/* Feature Bullets */}
                  <div className="space-y-3.5 mb-8">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Included with {plan.name}:
                    </p>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-[13px] text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary CTA */}
                <div>
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={loadingPlan === plan.id}
                    className={`w-full py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                      plan.popular
                        ? "bg-[#10B981] hover:bg-[#059669] text-white shadow-emerald-500/20 hover:shadow-lg"
                        : plan.id === "advanced"
                        ? "bg-[#0A1628] hover:bg-[#1E293B] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-[#0A1628]"
                    }`}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Securing Checkout...</span>
                      </>
                    ) : (
                      <>
                        <span>{plan.cta}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* ── Full Feature Comparison Matrix ───────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 lg:p-12 shadow-sm mb-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 
              className="text-2xl sm:text-3xl font-bold text-[#0A1628] mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Full Feature Comparison
            </h2>
            <p className="text-xs text-gray-500">
              Clear breakdown of everything included across all three membership tiers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/2">Capabilities</th>
                  <th className="py-4 text-xs font-bold text-gray-700 text-center w-1/6">Free</th>
                  <th className="py-4 text-xs font-bold text-emerald-600 text-center w-1/6">Pro</th>
                  <th className="py-4 text-xs font-bold text-blue-600 text-center w-1/6">Advanced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparisonFeatures.map((sec, secIdx) => (
                  <tr key={secIdx} className="contents">
                    <tr className="bg-gray-50/70">
                      <td colSpan={4} className="py-2.5 px-3 text-xs font-extrabold text-[#0A1628] uppercase tracking-wider">
                        {sec.category}
                      </td>
                    </tr>
                    {sec.items.map((item, itemIdx) => (
                      <tr key={itemIdx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-3 text-xs font-medium text-gray-700">{item.name}</td>
                        <td className="py-3 px-3 text-xs text-center font-medium">
                          {typeof item.free === "boolean" ? (
                            item.free ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <Minus className="w-4 h-4 text-gray-300 mx-auto" />
                          ) : (
                            <span className="text-gray-500">{item.free}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-xs text-center font-bold text-[#0A1628]">
                          {typeof item.pro === "boolean" ? (
                            item.pro ? <Check className="w-4 h-4 text-emerald-500 mx-auto stroke-[2.5]" /> : <Minus className="w-4 h-4 text-gray-300 mx-auto" />
                          ) : (
                            <span className="text-emerald-700">{item.pro}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-xs text-center font-bold text-[#0A1628]">
                          {typeof item.advanced === "boolean" ? (
                            item.advanced ? <Check className="w-4 h-4 text-blue-600 mx-auto stroke-[2.5]" /> : <Minus className="w-4 h-4 text-gray-300 mx-auto" />
                          ) : (
                            <span className="text-blue-700">{item.advanced}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Verified Trust Guarantee Strip ───────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0A1628]">7-Day Money Back</h4>
              <p className="text-xs text-gray-500 mt-1">100% unconditional refund if you are not fully satisfied.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0A1628]">Instant UPI & Cards</h4>
              <p className="text-xs text-gray-500 mt-1">Pay with GPay, PhonePe, Paytm, RuPay, or Net Banking.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0A1628]">Bank-Grade Security</h4>
              <p className="text-xs text-gray-500 mt-1">256-bit SSL encrypted payments processed by Razorpay.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0A1628]">SEBI Compliant</h4>
              <p className="text-xs text-gray-500 mt-1">Strictly educational. Zero financial advisory conflict.</p>
            </div>
          </div>
        </div>

        {/* ── FAQ Section ──────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 
              className="text-2xl font-bold text-[#0A1628] mb-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-gray-500">Everything you need to know about plans and payments.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-bold text-[#0A1628]">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom Final Callout ─────────────────────────────────── */}
        <div className="bg-[#0A1628] rounded-3xl p-8 lg:p-12 text-center text-white relative overflow-hidden shadow-xl border border-gray-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <h3 
            className="text-2xl sm:text-3xl font-bold mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Start Building Financial Independence Today.
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto mb-6">
            Join thousands of Indian learners mastering investing, taxation, and markets with complete peace of mind.
          </p>
          <button
            onClick={() => handleCheckout("pro")}
            className="px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer inline-flex items-center gap-2"
          >
            Start with FinanceHub Pro <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
