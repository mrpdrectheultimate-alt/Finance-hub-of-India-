"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RazorpayButton from "@/components/payment/RazorpayButton";
import {
  Check,
  X,
  ArrowRight,
  ChevronDown,
  Sparkles,
  BookOpen,
  Brain,
  Calculator,
  Award,
  ShieldCheck,
  Lock,
  CreditCard,
  Building2,
  TrendingUp,
  HelpCircle,
  Zap,
  Users,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

type Billing = "monthly" | "annual";
type PlanId = "free" | "pro" | "expert";

// Exact pricing aligned with backend (app/api/payment/razorpay-order/route.ts)
// Pro: 499/mo or 3,999/yr (effective 333/mo, save 33% / Rs 1,989)
// Expert: 999/mo or 7,999/yr (effective 666/mo, save 33% / Rs 3,989)
const PRICING = {
  free: {
    monthly: 0,
    annualTotal: 0,
    annualMonthly: 0,
    savingsText: "Free forever",
  },
  pro: {
    monthly: 499,
    annualTotal: 3999,
    annualMonthly: 333,
    savingsText: "Save ₹1,989 (33% off)",
  },
  expert: {
    monthly: 999,
    annualTotal: 7999,
    annualMonthly: 666,
    savingsText: "Save ₹3,989 (33% off)",
  },
} as const;

interface ComparisonItem {
  feature: string;
  tooltip?: string;
  free: string | boolean;
  pro: string | boolean;
  expert: string | boolean;
}

interface ComparisonCategory {
  title: string;
  icon: any;
  items: ComparisonItem[];
}

const COMPARISON_CATEGORIES: ComparisonCategory[] = [
  {
    title: "Curriculum & Lessons",
    icon: BookOpen,
    items: [
      {
        feature: "Curriculum Tracks",
        tooltip: "Personal Finance, Trading, Stock Market, Crypto, Corporate, Behavioral, Forex, Technical Analysis",
        free: "1 Preview Track",
        pro: "All 8 Tracks",
        expert: "All 8 Tracks",
      },
      {
        feature: "Full Lesson Library",
        tooltip: "Bite-sized, step-by-step masterclasses with practical Indian case studies",
        free: "10 free lessons",
        pro: "All 375+ lessons",
        expert: "All 375+ lessons",
      },
      {
        feature: "Lesson PDF Notes & Downloads",
        tooltip: "Downloadable revision cheatsheets and formula summaries",
        free: "Selected free only",
        pro: "Unlimited downloads",
        expert: "Unlimited downloads",
      },
      {
        feature: "Verifiable Certificates",
        tooltip: "Tamper-proof verifiable completion certificate for your resume & LinkedIn",
        free: false,
        pro: "Included on track finish",
        expert: "Included + VIP badge",
      },
      {
        feature: "Curated Finance Library",
        tooltip: "Masterclass book summaries and video master playlists",
        free: "Standard access",
        pro: "Full library",
        expert: "Full library + VIP picks",
      },
    ],
  },
  {
    title: "AI Mentorship & Intelligence",
    icon: Brain,
    items: [
      {
        feature: "Daily AI Mentor Queries",
        tooltip: "Context-aware AI tutor powered by deep Indian regulatory and market knowledge",
        free: "5 queries / day",
        pro: "50 queries / day",
        expert: "200 queries / day",
      },
      {
        feature: "Specialist AI Personas",
        tooltip: "Switch between Value Investor, Day Trader, Tax Strategist, Quant Analyst & CFO",
        free: "1 general persona",
        pro: "5 specialist personas",
        expert: "5 personas + VIP reasoning",
      },
      {
        feature: "AI Study Roadmap Planner",
        tooltip: "Personalized 30, 60, and 90-day structured financial mastery schedules",
        free: false,
        pro: true,
        expert: true,
      },
      {
        feature: "AI Exam Generator",
        tooltip: "Adaptive practice exams modeled on CFA, FRM, CA and NISM formats",
        free: false,
        pro: true,
        expert: true,
      },
      {
        feature: "AI Financial Statement Explainer",
        tooltip: "Upload or paste any company's 10-K or Annual Report for instant plain-English balance sheet breakdown",
        free: false,
        pro: false,
        expert: true,
      },
      {
        feature: "Inference Speed & Latency",
        tooltip: "Dedicated low-latency compute queue for real-time prompt generation",
        free: "Standard queue",
        pro: "Fast priority queue",
        expert: "Ultra-fast VIP queue",
      },
    ],
  },
  {
    title: "Simulators & Practical Labs",
    icon: Calculator,
    items: [
      {
        feature: "Financial Calculators",
        tooltip: "Interactive tools for SIP, EMI, Tax, DCF, Retirement, CAGR, and Startup runway",
        free: "2 basic calculators",
        pro: "All 15 interactive tools",
        expert: "All 15 interactive tools",
      },
      {
        feature: "3D Trading Academy & Theater",
        tooltip: "Interactive 3D candlestick animations, order-book depth, and decision checkpoints",
        free: "Preview scenario",
        pro: "10 Full Scenarios",
        expert: "10 Scenarios + Advanced",
      },
      {
        feature: "Forex Paper Trading",
        tooltip: "Live simulated foreign exchange order execution across 6 major currency pairs",
        free: false,
        pro: "6 global pairs",
        expert: "6 global pairs",
      },
      {
        feature: "Crypto Paper Trading",
        tooltip: "Risk-free paper trading with real-time order books across 6 digital assets",
        free: false,
        pro: "6 crypto assets",
        expert: "6 crypto assets",
      },
    ],
  },
  {
    title: "Career Hub & Professional Mastery",
    icon: Award,
    items: [
      {
        feature: "Corporate Finance Interview Vault",
        tooltip: "50+ curated interview questions and real-world case study answers for investment banking and equity research",
        free: false,
        pro: true,
        expert: true,
      },
      {
        feature: "Spaced-Repetition Mastery Tracking",
        tooltip: "Algorithmic recall scheduling to ensure long-term retention of financial formulas",
        free: "Basic tracking",
        pro: "Full adaptive engine",
        expert: "Full adaptive engine",
      },
    ],
  },
  {
    title: "Community & Gamification",
    icon: Users,
    items: [
      {
        feature: "Daily Quizzes & Challenges",
        tooltip: "Earn XP, badges, and maintain daily learning streaks",
        free: true,
        pro: true,
        expert: true,
      },
      {
        feature: "Global Leaderboards",
        tooltip: "Compete with fellow finance learners across India",
        free: "General board",
        pro: "Track-specific boards",
        expert: "Track boards + VIP badge",
      },
      {
        feature: "Community Discussion Forums",
        tooltip: "Collaborate, ask peer questions, and discuss market concepts",
        free: "Read & comment",
        pro: "Full posting privileges",
        expert: "Verified Expert profile",
      },
    ],
  },
  {
    title: "Support & Account Care",
    icon: HelpCircle,
    items: [
      {
        feature: "Customer Support Level",
        tooltip: "Direct assistance from the FinanceHub educational support team",
        free: "Community discord",
        pro: "Priority email (< 24h)",
        expert: "VIP 1-on-1 (< 6h)",
      },
      {
        feature: "Early Access to New Features",
        tooltip: "Be the first to test upcoming simulations, calculators, and new tracks",
        free: false,
        pro: false,
        expert: true,
      },
    ],
  },
];

const FAQS = [
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, absolutely. You can cancel your subscription with a single click at any time from your Account Settings. There are no cancellation fees, lock-in periods, or hidden clauses. You will retain full premium access until the end of your prepaid billing cycle.",
  },
  {
    q: "What payment methods are supported in India and internationally?",
    a: "We support all major Indian payment methods via our PCI-DSS certified Razorpay gateway: UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay, Indian Visa/Mastercard credit & debit cards, and Net Banking across 50+ Indian banks. For international learners, we support all major global credit cards through Stripe.",
  },
  {
    q: "Is there a free trial for the paid plans?",
    a: "Yes. When checking out through Stripe international card billing, Pro and Expert plans come with an automatic 7-day free trial. If using direct Indian UPI or Net Banking via Razorpay, you receive immediate full access with an instant tax receipt.",
  },
  {
    q: "How does the annual billing discount work?",
    a: "With annual billing, you pay once for the full year and save 33% compared to monthly billing—equivalent to getting 4 full months free. For example, Pro is ₹3,999/year (just ₹333/month, saving ₹1,989), and Expert is ₹7,999/year (just ₹666/month, saving ₹3,989).",
  },
  {
    q: "Can I switch between Pro and Expert later?",
    a: "Yes, you can upgrade or downgrade anytime. If you upgrade from Pro to Expert, your remaining balance will be prorated automatically so you only pay the difference for the remainder of your billing cycle.",
  },
  {
    q: "Is FinanceHub of India considered financial or investment advice?",
    a: "No. FinanceHub is strictly an educational platform. Nothing taught on this platform constitutes investment, tax, legal, or financial advice. We provide simulations, curriculum, and mental models to help you understand markets and build independent financial literacy.",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<Billing>("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "free" | "pro" | "expert">("all");
  const [user, setUser] = useState<any>(null);
  
  // Checkout Drawer / Modal State
  const [checkoutModal, setCheckoutModal] = useState<{
    open: boolean;
    plan: "pro" | "expert";
    billing: Billing;
  } | null>(null);

  const [stripeLoading, setStripeLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then((res: any) => {
      setUser(res?.data?.user || null);
    });
  }, []);

  const handleOpenCheckout = (planId: "pro" | "expert") => {
    if (!user) {
      router.push(`/login?redirect=/pricing`);
      return;
    }
    setErrorMsg("");
    setCheckoutModal({
      open: true,
      plan: planId,
      billing,
    });
  };

  const handleStripeCheckout = async (plan: "pro" | "expert", currentBilling: Billing) => {
    setStripeLoading(true);
    setErrorMsg("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/login?redirect=/pricing`);
        return;
      }

      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan, billing: currentBilling }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setErrorMsg(data.error || "Stripe checkout could not be initialized.");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setStripeLoading(false);
    }
  };

  const proPrice = billing === "annual" ? PRICING.pro.annualMonthly : PRICING.pro.monthly;
  const expertPrice = billing === "annual" ? PRICING.expert.annualMonthly : PRICING.expert.monthly;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-ui antialiased selection:bg-emerald-100 selection:text-emerald-900 pb-24">
      {/* ─── Top Context Navigation ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 hover:text-slate-900 transition-colors uppercase"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50/80 border border-emerald-200/60 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Guaranteed Safe & Secure Checkout</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════ */}
      {/* 01 · TRUST & VALUE HERO */}
      {/* ══════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] font-bold tracking-widest uppercase mb-5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>India&apos;s Premier National Financial Academy</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0A1628] tracking-tight mb-4 leading-[1.15]">
          Invest in Your Financial Literacy. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#0E6163] via-[#10B981] to-[#2563EB] bg-clip-text text-transparent">
            Built for India.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Master personal finance, trading algorithms, options simulators, and corporate valuation with 375+ lessons, 15 interactive tools, and an AI mentor.
        </p>

        {/* Segmented Billing Switcher */}
        <div className="inline-flex items-center p-1.5 bg-slate-200/70 backdrop-blur-sm rounded-2xl border border-slate-300/60 shadow-inner">
          <button
            onClick={() => setBilling("monthly")}
            type="button"
            className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 ${
              billing === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBilling("annual")}
            type="button"
            className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 ${
              billing === "annual"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-2 py-0.5 rounded-full shadow-xs tracking-wide">
              SAVE 33% · 4 MOS FREE
            </span>
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 02 · THREE UNIFIED MASTER PLAN CARDS */}
      {/* ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* ── CARD 1: FREE FOREVER ── */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  Foundation Tier
                </span>
                <span className="text-xs font-semibold text-slate-400">Zero Commitment</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-1">Free Forever</h2>
              <p className="text-xs sm:text-sm text-slate-500 min-h-[38px] leading-relaxed">
                Explore foundational personal finance lessons and test the interactive tools.
              </p>

              {/* Price Block */}
              <div className="mt-6 mb-8 pb-6 border-b border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">₹0</span>
                  <span className="text-sm font-medium text-slate-500">forever</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">No credit card or payment required.</p>
              </div>

              {/* Top 5 Benefits */}
              <div className="space-y-3.5 mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Includes:</p>
                {[
                  "10 foundational lessons across all 8 tracks",
                  "5 AI Tutor queries per day",
                  "2 Essential Calculators (SIP & EMI)",
                  "Community discussions & peer forums",
                  "Daily challenges & standard leaderboard",
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={user ? "/dashboard" : "/signup"}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-center bg-slate-100 text-slate-800 hover:bg-slate-200 transition-all border border-slate-200/80 shadow-xs block"
            >
              {user ? "Continue Free Learning" : "Start Learning Free"}
            </Link>
          </div>

          {/* ── CARD 2: PRO (THE HERO PLAN) ── */}
          <div className="relative bg-white rounded-3xl p-8 border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 flex flex-col justify-between lg:-translate-y-3 transition-all duration-200">
            {/* Pill Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0E6163] to-emerald-600 text-white text-[11px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Most Popular · 94% Choose Pro</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Skill Mastery
                </span>
                <span className="text-xs font-semibold text-emerald-600">Complete Platform Access</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-1">FinanceHub Pro</h2>
              <p className="text-xs sm:text-sm text-slate-500 min-h-[38px] leading-relaxed">
                Everything you need to master personal wealth, trading setups, and practical finance.
              </p>

              {/* Price Block */}
              <div className="mt-6 mb-8 pb-6 border-b border-emerald-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                    ₹{proPrice}
                  </span>
                  <span className="text-sm font-medium text-slate-500">/month</span>
                </div>
                {billing === "annual" ? (
                  <p className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Billed annually at ₹3,999/yr · Save ₹1,989 (33% off)</span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-2">Billed monthly · Cancel anytime without penalty</p>
                )}
              </div>

              {/* Top 6 Benefits */}
              <div className="space-y-3.5 mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Everything in Free, plus:</p>
                {[
                  "All 375+ lessons across all 8 learning tracks",
                  "3D Animated Trading Academy & simulator walkthroughs",
                  "Generous AI Mentor: 50 questions/day (5 specialist personas)",
                  "All 15 Interactive Financial Simulators & tools",
                  "Forex & Crypto paper trading with live order books",
                  "Verifiable Track Completion Certificates for resume",
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 font-medium">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleOpenCheckout("pro")}
              type="button"
              className="w-full py-4 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#0E6163] via-emerald-600 to-teal-600 hover:from-[#0A4B4D] hover:to-emerald-700 transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get FinanceHub Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* ── CARD 3: EXPERT (CAREER & PROFESSIONAL) ── */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                  Institutional & Career
                </span>
                <span className="text-xs font-semibold text-indigo-600">Advanced Analysts</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-1">FinanceHub Expert</h2>
              <p className="text-xs sm:text-sm text-slate-500 min-h-[38px] leading-relaxed">
                For finance professionals, CA/CFA/FRM aspirants, and serious equity analysts.
              </p>

              {/* Price Block */}
              <div className="mt-6 mb-8 pb-6 border-b border-indigo-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                    ₹{expertPrice}
                  </span>
                  <span className="text-sm font-medium text-slate-500">/month</span>
                </div>
                {billing === "annual" ? (
                  <p className="text-xs font-bold text-indigo-700 mt-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Billed annually at ₹7,999/yr · Save ₹3,989 (33% off)</span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-2">Billed monthly · Cancel anytime without penalty</p>
                )}
              </div>

              {/* Top 6 Benefits */}
              <div className="space-y-3.5 mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-800">Everything in Pro, plus:</p>
                {[
                  "AI Financial Statement Explainer (Upload Balance Sheets/10-K)",
                  "High-Volume AI Access: 200 questions/day with VIP latency",
                  "AI Exam Generator (CFA, FRM, CA & NISM styles)",
                  "Career Hub & Interview Vault (50+ curated corporate finance Q&A)",
                  "Early access to newly released simulations & tracks",
                  "VIP Expert community badge & priority 1-on-1 mentorship",
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleOpenCheckout("expert")}
              type="button"
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-indigo-950 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get FinanceHub Expert</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 03 · "WHICH PLAN IS RIGHT FOR ME?" MATRIX */}
      {/* ══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Decision Helper</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Which plan matches your goals?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Choose Free if...</div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium mb-3">
              You are completely new to money management and want to understand personal budgeting and compound interest with zero financial risk.
            </p>
            <div className="text-xs text-slate-400">Target: High schoolers, college students, beginners.</div>
          </div>

          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200 shadow-xs">
            <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 mb-2">Choose Pro if...</div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium mb-3">
              You want to master all 8 domains—from equity investing and technical analysis to crypto and tax optimization—with interactive simulations and daily AI guidance.
            </p>
            <div className="text-xs text-emerald-700 font-semibold">Target: Working professionals, retail investors, active traders.</div>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-200 shadow-xs">
            <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 mb-2">Choose Expert if...</div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium mb-3">
              You are targeting a top-tier finance career, preparing for CFA/FRM/CA exams, or analyzing corporate annual reports and balance sheets professionally.
            </p>
            <div className="text-xs text-indigo-700 font-semibold">Target: Equity research analysts, finance graduates, chartered accountants.</div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 04 · CATEGORIZED FULL COMPARISON MATRIX */}
      {/* ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Detailed Breakdown</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Full Feature Comparison</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mt-2">
            Every feature, simulator, and AI capability clearly mapped across all three plans.
          </p>
        </div>

        {/* Desktop View Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hidden md:block">
          {/* Sticky Table Header */}
          <div className="grid grid-cols-12 bg-slate-50/90 border-b border-slate-200 px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
            <div className="col-span-5">Features & Capabilities</div>
            <div className="col-span-2 text-center">Free Forever</div>
            <div className="col-span-3 text-center text-emerald-700 bg-emerald-50/60 -my-4 py-4 border-x border-emerald-200/50">
              FinanceHub Pro
            </div>
            <div className="col-span-2 text-center text-indigo-700">FinanceHub Expert</div>
          </div>

          {/* Categories */}
          {COMPARISON_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="border-b border-slate-100 last:border-b-0">
                {/* Category Header */}
                <div className="px-6 py-3.5 bg-slate-100/70 border-y border-slate-200/60 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{cat.title}</span>
                </div>

                {/* Rows */}
                {cat.items.map((row, rIdx) => (
                  <div
                    key={rIdx}
                    className={`grid grid-cols-12 px-6 py-3.5 items-center text-xs transition-colors hover:bg-slate-50/50 ${
                      rIdx !== cat.items.length - 1 ? "border-b border-slate-100" : ""
                    }`}
                  >
                    <div className="col-span-5 pr-4">
                      <span className="font-semibold text-slate-800 block text-sm">{row.feature}</span>
                      {row.tooltip && (
                        <span className="text-slate-400 text-xs mt-0.5 line-clamp-1">{row.tooltip}</span>
                      )}
                    </div>
                    <div className="col-span-2 text-center font-medium text-slate-600">
                      {renderComparisonValue(row.free, "free")}
                    </div>
                    <div className="col-span-3 text-center font-semibold text-emerald-900 bg-emerald-50/30 -my-3.5 py-3.5 border-x border-emerald-100">
                      {renderComparisonValue(row.pro, "pro")}
                    </div>
                    <div className="col-span-2 text-center font-semibold text-indigo-900">
                      {renderComparisonValue(row.expert, "expert")}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Mobile View: Clean Categorized Accordion Cards (No horizontal spreadsheet mess) */}
        <div className="space-y-6 md:hidden">
          {/* Plan Selector for Mobile */}
          <div className="flex items-center justify-center p-1 bg-slate-200/80 rounded-xl mb-4">
            {(["all", "free", "pro", "expert"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-all ${
                  activeTab === tab ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {COMPARISON_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <Icon className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{cat.title}</h3>
                </div>

                <div className="space-y-4">
                  {cat.items.map((row, rIdx) => (
                    <div key={rIdx} className="border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                      <div className="font-semibold text-slate-800 text-xs mb-1">{row.feature}</div>
                      {row.tooltip && <div className="text-[11px] text-slate-400 mb-2">{row.tooltip}</div>}

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        {(activeTab === "all" || activeTab === "free") && (
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Free</span>
                            {renderComparisonValue(row.free, "free")}
                          </div>
                        )}
                        {(activeTab === "all" || activeTab === "pro") && (
                          <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                            <span className="text-[10px] text-emerald-700 uppercase font-bold block mb-1">Pro</span>
                            {renderComparisonValue(row.pro, "pro")}
                          </div>
                        )}
                        {(activeTab === "all" || activeTab === "expert") && (
                          <div className="bg-indigo-50/60 p-2 rounded-lg border border-indigo-100">
                            <span className="text-[10px] text-indigo-700 uppercase font-bold block mb-1">Expert</span>
                            {renderComparisonValue(row.expert, "expert")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 05 · INSTITUTIONAL TRUST & REGULATORY STRIP */}
      {/* ══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">256-Bit SSL Encryption</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  TLS 1.3 banking-grade secure data transmission across all devices.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">PCI-DSS Level 1 Gateway</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Verified Razorpay UPI & NetBanking + Stripe international compliance.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">DPDP Act 2023 Compliant</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Strict Indian data privacy standards with zero commercial user selling.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Educational Mandate</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Strictly learning & simulations. We do not provide SEBI investment advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 06 · INTERACTIVE FAQ ACCORDION */}
      {/* ══════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Clear Answers</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto mt-2">
            Everything you need to know about payments, billing intervals, cancellation, and curriculum access.
          </p>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:border-slate-300"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  type="button"
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 pr-4">{faq.q}</span>
                  <div
                    className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-emerald-50 text-emerald-700" : "text-slate-500"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* 07 · HIGH-CONFIDENCE FINAL CTA BANNER */}
      {/* ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-[#0A1628] rounded-3xl p-10 sm:p-14 text-center overflow-hidden border border-slate-800 shadow-2xl">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 right-10 w-[400px] h-[300px] bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Begin Your Journey</span>
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Start Building Your Financial Independence Today.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 mb-8 font-normal leading-relaxed">
              Join thousands of Indian learners mastering investing, risk management, and trading. Start free — upgrade when you&apos;re ready.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-extrabold text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <span>{user ? "Go to Dashboard" : "Start Learning Free"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/explore"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Browse All 8 Tracks</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-[11px] text-slate-500 mt-8 max-w-lg mx-auto leading-relaxed">
              FinanceHub is strictly an educational platform. Content is for academic learning and simulation only and does not constitute investment, tax, or financial advice.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/* UNIFIED CHECKOUT MODAL (RAZORPAY + STRIPE) */}
      {/* ══════════════════════════════════════════ */}
      {checkoutModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-scale-in">
            <button
              onClick={() => setCheckoutModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors text-sm font-bold"
              aria-label="Close checkout"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Instant Safe Checkout
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                Upgrade to FinanceHub {checkoutModal.plan === "pro" ? "Pro" : "Expert"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {checkoutModal.billing === "annual"
                  ? "Annual Billing (Save 33% · 4 Months Free)"
                  : "Monthly Billing (Cancel Anytime)"}
              </p>
            </div>

            {/* Price Confirmation Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Amount to Pay
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {checkoutModal.billing === "annual"
                    ? `₹${checkoutModal.plan === "pro" ? "3,999" : "7,999"}`
                    : `₹${checkoutModal.plan === "pro" ? "499" : "999"}`}
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  {checkoutModal.billing === "annual" ? "for 1 full year" : "per month"}
                </span>
              </div>
              <div className="text-right">
                <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                  {checkoutModal.billing === "annual" ? "33% Discount Applied" : "No Lock-in"}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 text-center font-medium">
                {errorMsg}
              </div>
            )}

            {/* Indian & UPI Payment (Razorpay) */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Option 1: Recommended for India (UPI, RuPay, NetBanking, Cards)
                </span>
                <RazorpayButton
                  plan={`${checkoutModal.plan}_${checkoutModal.billing}` as any}
                  label={`FinanceHub ${checkoutModal.plan.toUpperCase()} (${checkoutModal.billing})`}
                  amount={
                    checkoutModal.billing === "annual"
                      ? `₹${checkoutModal.plan === "pro" ? "3,999" : "7,999"}/yr`
                      : `₹${checkoutModal.plan === "pro" ? "499" : "999"}/mo`
                  }
                  color={checkoutModal.plan === "pro" ? "#0E6163" : "#1E1B4B"}
                  fullWidth
                  onSuccess={() => {
                    setCheckoutModal(null);
                  }}
                />
              </div>

              {/* International Cards (Stripe) */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Option 2: International Cards (Stripe with 7-Day Trial)
                </span>
                <button
                  onClick={() => handleStripeCheckout(checkoutModal.plan, checkoutModal.billing)}
                  disabled={stripeLoading}
                  type="button"
                  className="w-full py-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                  <span>{stripeLoading ? "Redirecting to Stripe..." : "Pay with Stripe (International Cards)"}</span>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>256-bit encrypted</span>
              </span>
              <span>Instant GST/Tax invoice sent via email</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to render checkmarks, crosses, or informative tags
function renderComparisonValue(value: string | boolean, plan: "free" | "pro" | "expert") {
  if (value === true) {
    const color =
      plan === "pro"
        ? "text-emerald-700 bg-emerald-100"
        : plan === "expert"
        ? "text-indigo-700 bg-indigo-100"
        : "text-slate-700 bg-slate-100";
    return (
      <div className={`w-5 h-5 rounded-full ${color} flex items-center justify-center mx-auto shadow-2xs`}>
        <Check className="w-3 h-3 stroke-[3]" />
      </div>
    );
  }
  if (value === false) {
    return <span className="text-slate-300 font-bold text-sm select-none">—</span>;
  }
  return <span className="text-xs font-semibold">{value}</span>;
}
