"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Rocket,
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  Award,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Flame,
  Zap,
  Check,
  Share2,
  Compass,
  CheckCircle,
  Circle,
  PlayCircle,
  BarChart2,
  FileText,
  Layers,
  ArrowRight,
} from "lucide-react";

// ==========================================
// CONSTANTS & PRESETS
// ==========================================

export const PERSONAS = [
  {
    id: "student",
    label: "Student",
    roleDesc: "College / Higher Education",
    icon: GraduationCap,
    accent: "from-blue-500/20 to-indigo-500/20 text-blue-600",
    badge: "Academic & Foundations",
  },
  {
    id: "professional",
    label: "Professional",
    roleDesc: "Working Salaried / Corporate",
    icon: Briefcase,
    accent: "from-emerald-500/20 to-teal-500/20 text-emerald-600",
    badge: "Wealth & Tax Optimization",
  },
  {
    id: "trader",
    label: "Active Trader",
    roleDesc: "Equities, F&O & Technicals",
    icon: TrendingUp,
    accent: "from-amber-500/20 to-orange-500/20 text-amber-600",
    badge: "Risk & Execution Alpha",
  },
  {
    id: "founder",
    label: "Founder / CEO",
    roleDesc: "Entrepreneur & Business Owner",
    icon: Rocket,
    accent: "from-purple-500/20 to-pink-500/20 text-purple-600",
    badge: "Corporate Finance & Capital",
  },
];

export const TIMEFRAMES = [
  {
    days: "30",
    label: "30 Days",
    tagline: "Quick Sprint",
    intensity: "Fast & Focused",
    desc: "Build rock-solid foundations and kickstart daily financial habits.",
  },
  {
    days: "60",
    label: "60 Days",
    tagline: "Steady Build",
    intensity: "Recommended Pace",
    desc: "Deep-dive into portfolio construction, derivatives, and risk management.",
  },
  {
    days: "90",
    label: "90 Days",
    tagline: "Deep Mastery",
    intensity: "Institutional Grade",
    desc: "Comprehensive curriculum designed for career switches, CFA prep, or active trading.",
  },
];

export const QUICK_GOALS = [
  {
    title: "Stock Market & Index Investing",
    text: "Master the Indian stock market (NSE/BSE), understand valuation, and set up an automated monthly index fund SIP strategy with tax optimization.",
    badge: "Most Popular",
  },
  {
    title: "Options & Derivatives Trading",
    text: "Learn options fundamentals, Greeks (Delta, Theta, Gamma), implied volatility, and build systematic non-directional hedging strategies.",
    badge: "Advanced",
  },
  {
    title: "Personal Wealth & Tax Blueprint",
    text: "Optimize Old vs New Tax Regime, build an emergency corpus, plan health/term insurance, and allocate across mutual funds, gold, and debt.",
    badge: "Foundational",
  },
  {
    title: "CFA & Financial Statement Analysis",
    text: "Master Three-Statement Financial Modeling, DCF valuation, ratio analysis, and corporate finance concepts for institutional finance roles.",
    badge: "Career Ready",
  },
];

export const EXAM_TARGETS = [
  { id: "", label: "No Exam (Practical Wealth & Investing)" },
  { id: "CFA L1", label: "CFA Level 1 (Chartered Financial Analyst)" },
  { id: "FRM Part 1", label: "FRM Part 1 (Financial Risk Manager)" },
  { id: "NISM Series VIII", label: "NISM Series VIII (Equity Derivatives)" },
  { id: "NISM Series X-A", label: "NISM Series X-A (Investment Advisor)" },
  { id: "CA Foundation", label: "CA Foundation / Intermediate Finance" },
  { id: "MBA Finance", label: "MBA Finance Core Curriculum" },
];

export type TaskItem = {
  type: "lesson" | "quiz" | "exercise" | "review";
  topic: string;
  duration_mins: number;
  link?: string;
};

export type DailyPlan = {
  day: string;
  dayNumber?: number;
  theme?: string;
  tasks: TaskItem[];
  total_mins: number;
};

export type WeeklySchedule = {
  week: number;
  theme: string;
  focus_track: string;
  milestone: string;
  daily_plan: DailyPlan[];
};

export type RoadmapData = {
  overview: string;
  goalTitle?: string;
  timeframeDays?: number;
  hoursPerDay?: number;
  totalHours?: number;
  persona?: string;
  weekly_schedule: WeeklySchedule[];
  key_milestones: { day: number; milestone: string }[];
  daily_habit: string;
  success_metric: string;
  exam_focus?: string | null;
};

// ==========================================
// HIGH-YIELD CURRICULUM FALLBACK GENERATOR
// ==========================================

function generateTailoredCurriculum(
  goal: string,
  persona: string,
  timeframeStr: string,
  hoursPerDay: number,
  examTarget: string
): RoadmapData {
  const days = parseInt(timeframeStr, 10) || 30;
  const weeksCount = Math.max(1, Math.round(days / 7));
  const totalHours = Math.round(days * hoursPerDay);

  const goalLower = goal.toLowerCase();
  const isOptions = goalLower.includes("option") || goalLower.includes("derivative") || goalLower.includes("greek") || persona === "trader";
  const isTaxOrPersonal = goalLower.includes("tax") || goalLower.includes("sip") || goalLower.includes("personal") || goalLower.includes("salary");
  const isExam = Boolean(examTarget) || goalLower.includes("cfa") || goalLower.includes("frm") || goalLower.includes("nism");

  let domainThemes: { theme: string; focus: string; milestone: string; topics: string[] }[] = [];

  if (isOptions) {
    domainThemes = [
      {
        theme: "Market Microstructure & Derivatives Core",
        focus: "derivatives-basics",
        milestone: "Understand Call/Put payoff diagrams, moneyness, and contract sizing on NSE.",
        topics: [
          "Futures vs Options: Mechanics & Margins",
          "Call Options: Buyer vs Seller Asymmetry",
          "Put Options: Hedging Downside vs Speculation",
          "NSE Option Chain: Spot vs Strike Analysis",
          "Open Interest (OI) & PCR Interpretation",
        ],
      },
      {
        theme: "Option Greeks & Volatility Dynamics",
        focus: "option-greeks",
        milestone: "Master Delta, Gamma, Theta decay, Vega and Implied Volatility (IV).",
        topics: [
          "Delta: Directional Exposure & Hedge Ratio",
          "Theta & Time Decay: Capitalizing on Weeklies",
          "Vega & Implied Volatility Percentile (IVP)",
          "Black-Scholes-Merton Pricing Assumptions",
          "Gamma Risk: Managing Expiry Explosions",
        ],
      },
      {
        theme: "Systematic Multi-Leg Strategies & Spreads",
        focus: "advanced-options",
        milestone: "Deploy Bull Call, Bear Put Spreads, and Iron Condors with defined risk.",
        topics: [
          "Vertical Spreads: Debit vs Credit Mechanics",
          "Iron Condors & Iron Butterflies in Rangebound Markets",
          "Calendar Spreads: Trading the Volatility Skew",
          "Risk-Reward Profiling & Maximum Drawdown Limits",
          "Adjusting Losing Trades Without Over-Leveraging",
        ],
      },
      {
        theme: "Live Paper Trading & Risk Management Architecture",
        focus: "trading-simulators",
        milestone: "Execute 10 risk-defined simulator trades with disciplined stop-loss rules.",
        topics: [
          "Setting Up Paper Trading on FinanceHub Simulator",
          "Position Sizing: Never Risk >1.5% Per Trade",
          "Trading Psychology: Overcoming FOMO and Revenge Trades",
          "Post-Trade Journaling & Expectancy Calculation",
          "Execution Mastery & Slippage Minimization",
        ],
      },
    ];
  } else if (isTaxOrPersonal) {
    domainThemes = [
      {
        theme: "Cash Flow Mastery, Budgeting & Debt Immunity",
        focus: "personal-finance",
        milestone: "Establish a 6-month emergency fund and eliminate high-interest liabilities.",
        topics: [
          "The 50/30/20 Rule adapted to Indian Incomes",
          "Building a High-Yield Liquid Emergency Fund",
          "Credit Cards vs UPI: Credit Score (CIBIL >780) Blueprint",
          "Debt Snowball vs Avalanche: Clearing Personal Loans",
          "Inflation-Adjusted Net Worth Auditing",
        ],
      },
      {
        theme: "Tax Regimes & Section-Wise Optimization",
        focus: "tax-planning",
        milestone: "Calculate Old vs New Regime take-home pay and claim eligible exemptions.",
        topics: [
          "Old vs New Tax Regime: The Exact Breakeven Math",
          "Section 80C, 80D (Health Insurance) & 80CCD (NPS)",
          "House Rent Allowance (HRA) & Home Loan Deductions",
          "Capital Gains Tax: STCG vs LTCG on Equities and Debt",
          "Tax-Efficient Withdrawal Strategies & Advance Tax",
        ],
      },
      {
        theme: "Long-Term Mutual Fund Portfolio & Asset Allocation",
        focus: "mutual-funds",
        milestone: "Construct an automated SIP portfolio across Nifty 50, Midcap, and International indices.",
        topics: [
          "Active vs Passive Funds: Why Expense Ratios Matter",
          "Large Cap vs Nifty Next 50 vs Flexi Cap Strategies",
          "Debt Funds vs Fixed Deposits in a High-Rate Environment",
          "Sovereign Gold Bonds (SGB) & Real Estate Realities",
          "Annual Portfolio Rebalancing: Mechanics & Rules",
        ],
      },
      {
        theme: "Retirement Math, Estate Planning & Wealth Transfer",
        focus: "wealth-management",
        milestone: "Compute your FIRE (Financial Independence) target and establish essential nominations.",
        topics: [
          "Calculating Your FIRE Number: The 25x / 30x Rule",
          "NPS (Tier 1 vs Tier 2): Pension and Annuity Math",
          "Term Insurance vs ULIP: Avoiding Financial Traps",
          "Health Insurance Super Top-Up: Protecting Against Medical Inflation",
          "Wills, Nominations, and Family Financial Documentation",
        ],
      },
    ];
  } else if (isExam) {
    domainThemes = [
      {
        theme: "Ethical Standards & Quantitative Methods Core",
        focus: "exam-foundations",
        milestone: "Solve 100+ Time Value of Money and Hypothesis Testing diagnostic questions.",
        topics: [
          "Time Value of Money: Compounding, Annuities & Perpetuities",
          "Statistical Concepts: Variance, Skewness, Kurtosis",
          "Probability Distributions & Central Limit Theorem",
          "Hypothesis Testing: T-tests, Z-tests & P-values",
          "Ethical & Professional Standards Framework",
        ],
      },
      {
        theme: "Financial Statement Analysis & Ratio Mastery",
        focus: "financial-reporting",
        milestone: "Deconstruct Balance Sheets, Income Statements, and Cash Flows with DuPont Analysis.",
        topics: [
          "Revenue Recognition & Quality of Earnings",
          "Inventory Accounting: FIFO vs Weighted Average Cost",
          "Long-Lived Assets, Depreciation & Impairment",
          "DuPont 3-Step & 5-Step Return on Equity Decomposition",
          "Cash Flow Statement: CFO, CFI, CFF Quality Checks",
        ],
      },
      {
        theme: "Corporate Issuers & Equity Valuation Models",
        focus: "corporate-finance",
        milestone: "Calculate WACC, Cost of Equity (CAPM), and Gordon Growth Intrinsic Value.",
        topics: [
          "Capital Structure & Weighted Average Cost of Capital (WACC)",
          "Cost of Equity: Capital Asset Pricing Model (CAPM)",
          "Discounted Cash Flow (DCF) & Dividend Discount Model (DDM)",
          "Market Multiples: P/E, EV/EBITDA, P/B Comparative Analysis",
          "Industry Lifecycle & Porter's Five Forces in Valuation",
        ],
      },
      {
        theme: "Fixed Income, Derivatives & Mock Exam Simulations",
        focus: "fixed-income-derivatives",
        milestone: "Score >75% in a full-length timed diagnostic exam across key competencies.",
        topics: [
          "Bond Pricing, Yield to Maturity (YTM) & Spot Rates",
          "Macaulay & Modified Duration: Interest Rate Sensitivity",
          "Credit Spreads & Default Risk Assessment",
          "Derivative Forward Commitments & Option Payoffs",
          "Timed Exam Simulation & Weak-Topic Flashcard Sprint",
        ],
      },
    ];
  } else {
    domainThemes = [
      {
        theme: "Financial Foundation & Market Architecture",
        focus: "basics",
        milestone: "Understand primary vs secondary markets, order types, and regulatory safety (SEBI).",
        topics: [
          "How Stock Exchanges Work: NSE, BSE, CDSL & NSDL",
          "Market Cap Classification: Large, Mid, Small Cap Stocks",
          "Order Types: Market, Limit, Stop-Loss, and GTT",
          "Reading a Stock Ticker: Price, Volume & Market Depth",
          "The Magic of Compounding: Rule of 72 & Long-term Growth",
        ],
      },
      {
        theme: "Fundamental Analysis & Valuation Principles",
        focus: "fundamental-analysis",
        milestone: "Read an Annual Report, compute P/E and ROCE, and evaluate debt-to-equity ratios.",
        topics: [
          "Income Statement: Revenue, Operating Margin & Net Profit",
          "Balance Sheet: Debt, Reserves & Working Capital",
          "Key Ratios: P/E, P/B, ROCE, ROE, and Debt/Equity",
          "Economic Moats: Brand, Network Effects, and Cost Advantages",
          "Management Quality & Corporate Governance Red Flags",
        ],
      },
      {
        theme: "Portfolio Construction & Smart Asset Allocation",
        focus: "portfolio-strategy",
        milestone: "Build an all-weather 3-fund asset allocation across Index Funds, Gold, and Liquid Debt.",
        topics: [
          "Asset Allocation: Equities vs Fixed Income vs Gold",
          "Index Investing: Why 85% of Active Funds Underperform Nifty 50",
          "Systematic Investment Plan (SIP) vs Lump Sum Averaging",
          "Managing Market Volatility: Bear Market Playbook",
          "Rebalancing Triggers: Calendar vs Percentage Rebalancing",
        ],
      },
      {
        theme: "Risk Management, Psychology & Long-Term Execution",
        focus: "psychology-execution",
        milestone: "Draft a personalized Investment Policy Statement (IPS) and track real positions.",
        topics: [
          "Behavioral Biases: Loss Aversion, Herd Mentality & Recency Bias",
          "Position Sizing: Risk per Position & Portfolio Concentration Limits",
          "Tax Efficiency: STCG vs LTCG Long-Term Optimization",
          "Simulated Portfolio Tracking on FinanceHub",
          "Building Your Lifelong Wealth Compounding Routine",
        ],
      },
    ];
  }

  // Build weekly schedule
  const weekly_schedule: WeeklySchedule[] = [];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for (let w = 1; w <= weeksCount; w++) {
    const themeIdx = (w - 1) % domainThemes.length;
    const currentTheme = domainThemes[themeIdx];
    const weekDailyPlan: DailyPlan[] = [];

    // Daily breakdown for this week
    for (let d = 0; d < 6; d++) {
      const topicIndex = d % currentTheme.topics.length;
      const topicName = currentTheme.topics[topicIndex];
      const isQuizDay = d === 2 || d === 5;
      const isSimDay = d === 4;

      const tasks: TaskItem[] = [
        {
          type: "lesson",
          topic: `${topicName} — Core Framework`,
          duration_mins: Math.round(hoursPerDay * 35),
          link: "/learn",
        },
      ];

      if (isQuizDay) {
        tasks.push({
          type: "quiz",
          topic: `Knowledge Check: ${topicName} Practice Quiz`,
          duration_mins: Math.round(hoursPerDay * 15),
          link: "/quiz",
        });
      } else if (isSimDay) {
        tasks.push({
          type: "exercise",
          topic: `Practical Simulator: ${topicName} Real-World Case`,
          duration_mins: Math.round(hoursPerDay * 20),
          link: "/simulators",
        });
      } else {
        tasks.push({
          type: "review",
          topic: `Flashcard & Concept Review: ${topicName}`,
          duration_mins: Math.round(hoursPerDay * 15),
          link: "/explore",
        });
      }

      const totalMins = tasks.reduce((sum, t) => sum + t.duration_mins, 0);

      weekDailyPlan.push({
        day: daysOfWeek[d],
        dayNumber: (w - 1) * 7 + (d + 1),
        theme: topicName,
        tasks,
        total_mins: totalMins,
      });
    }

    weekly_schedule.push({
      week: w,
      theme: currentTheme.theme,
      focus_track: currentTheme.focus,
      milestone: currentTheme.milestone,
      daily_plan: weekDailyPlan,
    });
  }

  // Milestones
  const key_milestones = [
    {
      day: Math.max(7, Math.round(days * 0.25)),
      milestone: `Complete foundational modules and pass the initial diagnostic check on ${domainThemes[0].theme}.`,
    },
    {
      day: Math.max(14, Math.round(days * 0.5)),
      milestone: `Execute first structured case analysis and build your quantitative spreadsheet / simulator position.`,
    },
    {
      day: Math.max(21, Math.round(days * 0.75)),
      milestone: `Pass advanced strategy review with >80% accuracy and complete mock risk assessment.`,
    },
    {
      day: days,
      milestone: `Deliver your end-to-end investment strategy capstone project and achieve certified readiness.`,
    },
  ];

  return {
    overview: `Your personalized ${days}-day roadmap is precision-calibrated for your profile as a ${persona}. Spending ${hoursPerDay}h daily (${totalHours} total hours) provides structured mastery across theory, hands-on simulation, and rigorous quizzes without burnout.`,
    goalTitle: goal.slice(0, 90) + (goal.length > 90 ? "..." : ""),
    timeframeDays: days,
    hoursPerDay,
    totalHours,
    persona,
    weekly_schedule,
    key_milestones,
    daily_habit: `Spend the first ${Math.round(hoursPerDay * 20)} minutes reading the daily core lesson, followed by hands-on simulator tracking and 10 minutes of evening market review.`,
    success_metric: `Targeting 80%+ quiz scores, completing all weekly milestone check-ins, and executing at least 5 paper portfolio trades.`,
    exam_focus: examTarget ? `Aligned with key weighting matrices for ${examTarget}.` : null,
  };
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function AiRoadmapPlanner() {
  const [goal, setGoal] = useState("");
  const [persona, setPersona] = useState("professional");
  const [timeframe, setTimeframe] = useState("30");
  const [hoursPerDay, setHoursPerDay] = useState(1);
  const [examTarget, setExamTarget] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [activeWeek, setActiveWeek] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  // Restore saved roadmap & checked tasks from localStorage on initial load
  useEffect(() => {
    try {
      const savedRoadmap = localStorage.getItem("financehub_saved_roadmap");
      if (savedRoadmap) {
        const parsed = JSON.parse(savedRoadmap);
        if (parsed && parsed.weekly_schedule) {
          setRoadmap(parsed);
          if (parsed.timeframeDays) setTimeframe(String(parsed.timeframeDays));
          if (parsed.hoursPerDay) setHoursPerDay(parsed.hoursPerDay);
        }
      }
      const savedTasks = localStorage.getItem("financehub_roadmap_tasks");
      if (savedTasks) {
        setCompletedTasks(JSON.parse(savedTasks));
      }
    } catch {
      // LocalStorage access non-fatal
    }
  }, []);

  // Sync completed tasks to localStorage
  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      try {
        localStorage.setItem("financehub_roadmap_tasks", JSON.stringify(next));
      } catch {
        // Ignored
      }
      return next;
    });
  };

  // Rotating loading steps for high-fidelity feel
  useEffect(() => {
    if (!generating) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, [generating]);

  const loadingMessages = [
    "Analyzing your financial learning goal & background...",
    "Calibrating daily study duration & milestone difficulty...",
    "Mapping interactive FinanceHub tracks, quizzes & simulators...",
    "Finalizing your personalized day-by-day mastery blueprint...",
  ];

  const totalCalculatedHours = useMemo(() => {
    const days = parseInt(timeframe, 10) || 30;
    return Math.round(days * hoursPerDay);
  }, [timeframe, hoursPerDay]);

  // Overall progress statistics when roadmap is active
  const progressStats = useMemo(() => {
    if (!roadmap || !roadmap.weekly_schedule) return { total: 0, completed: 0, percent: 0 };
    let total = 0;
    let completed = 0;

    roadmap.weekly_schedule.forEach((w) => {
      w.daily_plan?.forEach((d) => {
        d.tasks?.forEach((t, i) => {
          total++;
          const id = `${w.week}-${d.dayNumber ?? d.day}-${i}-${t.topic}`;
          if (completedTasks[id]) completed++;
        });
      });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [roadmap, completedTasks]);

  // Handle roadmap generation
  const handleGenerate = async () => {
    if (!goal.trim()) {
      setError("Please describe what you would like to achieve or pick one of the quick-start topics below.");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      let session = null;
      try {
        const authRes = await supabase.auth.getSession();
        session = authRes.data.session;
      } catch {
        // Supabase offline / guest mode
      }

      let generatedRoadmap: RoadmapData | null = null;

      // If user is authenticated, attempt live Anthropic Claude generation
      if (session?.access_token) {
        try {
          const res = await fetch("/api/ai-roadmap-planner", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              goal,
              persona,
              timeframe,
              hoursPerDay,
              examTarget,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.roadmap && data.roadmap.weekly_schedule) {
              generatedRoadmap = {
                ...data.roadmap,
                goalTitle: goal,
                timeframeDays: parseInt(timeframe, 10) || 30,
                hoursPerDay,
                totalHours: totalCalculatedHours,
                persona,
              };
            }
          }
        } catch {
          // Fall back gracefully
        }
      }

      // If guest mode or API is rate-limited / unavailable, assemble the tailored curriculum
      if (!generatedRoadmap) {
        await new Promise((resolve) => setTimeout(resolve, 1800));
        generatedRoadmap = generateTailoredCurriculum(goal, persona, timeframe, hoursPerDay, examTarget);
      }

      setRoadmap(generatedRoadmap);
      setActiveWeek(0);
      try {
        localStorage.setItem("financehub_saved_roadmap", JSON.stringify(generatedRoadmap));
      } catch {
        // Ignore
      }
    } catch {
      setError("Unable to build roadmap right now. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const resetRoadmap = () => {
    if (confirm("Reset current roadmap to configure a new learning plan?")) {
      setRoadmap(null);
      try {
        localStorage.removeItem("financehub_saved_roadmap");
        localStorage.removeItem("financehub_roadmap_tasks");
      } catch {
        // Ignore
      }
      setCompletedTasks({});
    }
  };

  const taskTypeStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
    lesson: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200/80",
      label: "Lesson",
    },
    quiz: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200/80",
      label: "Quiz",
    },
    exercise: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200/80",
      label: "Simulator",
    },
    review: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200/80",
      label: "Review",
    },
  };

  // ==========================================
  // RENDER: ACTIVE GENERATED ROADMAP VIEW
  // ==========================================
  if (roadmap) {
    const currentWeekData = roadmap.weekly_schedule[activeWeek] || roadmap.weekly_schedule[0];

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Breadcrumb & Quick Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 shadow-sm transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                {copiedLink ? "Link Copied!" : "Share"}
              </button>
              <button
                onClick={handlePrint}
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Print / PDF
              </button>
              <button
                onClick={resetRoadmap}
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl border border-rose-200 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
                New Plan
              </button>
            </div>
          </div>

          {/* Executive Header Banner */}
          <div className="bg-[#0A1628] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Personalized AI Roadmap
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  {roadmap.timeframeDays || timeframe} Days Sprint
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  {roadmap.hoursPerDay || hoursPerDay}h / day ({roadmap.totalHours || totalCalculatedHours}h total)
                </span>
                {roadmap.persona && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-300 capitalize">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    {roadmap.persona} Track
                  </span>
                )}
                {examTarget && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Target className="w-3.5 h-3.5" />
                    {examTarget}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  {roadmap.goalTitle || "Your Financial Mastery Roadmap"}
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl">
                  {roadmap.overview}
                </p>
              </div>

              {/* Progress Bar & Metric */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 mt-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Curriculum Progress
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-400">
                    {progressStats.completed} of {progressStats.total} Tasks Completed ({progressStats.percent}%)
                  </div>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, progressStats.percent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Daily Habit & Success Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-300 flex items-center justify-center flex-shrink-0 text-amber-700">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Daily Habit Anchor
                </span>
                <p className="text-xs sm:text-sm font-medium text-amber-950 leading-relaxed">
                  {roadmap.daily_habit}
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-300 flex items-center justify-center flex-shrink-0 text-emerald-700">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Success Benchmark
                </span>
                <p className="text-xs sm:text-sm font-medium text-emerald-950 leading-relaxed">
                  {roadmap.success_metric}
                </p>
              </div>
            </div>
          </div>

          {/* Milestone Timeline Strip */}
          {roadmap.key_milestones && roadmap.key_milestones.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Key Mastery Milestones
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  {roadmap.key_milestones.length} Strategic Checkpoints
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {roadmap.key_milestones.map((m, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-emerald-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800 mb-2">
                        Day {m.day} Checkpoint
                      </span>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {m.milestone}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Phase {i + 1}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Interactive Curriculum */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  Structured Weekly Curriculum
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Click on any task to mark completion and jump straight to the lesson or simulator.
                </p>
              </div>

              {/* Week Pill Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {roadmap.weekly_schedule.map((w, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveWeek(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                      activeWeek === idx
                        ? "bg-[#0A1628] text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>Week {w.week}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Active Week Banner */}
            {currentWeekData && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">
                      Week {currentWeekData.week} Focus Track
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                      {currentWeekData.theme}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      Goal: {currentWeekData.milestone}
                    </p>
                  </div>

                  <Link
                    href={`/learn`}
                    className="inline-flex items-center justify-center gap-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl transition-all flex-shrink-0"
                  >
                    Open Track
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Day-by-Day Task Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentWeekData.daily_plan?.map((dayPlan, dIdx) => (
                    <div
                      key={dIdx}
                      className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all"
                    >
                      <div>
                        {/* Day Header */}
                        <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                              {dIdx + 1}
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                {dayPlan.day}
                              </h4>
                              {dayPlan.theme && (
                                <p className="text-[11px] text-slate-500 line-clamp-1">
                                  {dayPlan.theme}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {dayPlan.total_mins} mins
                          </span>
                        </div>

                        {/* Task List */}
                        <div className="space-y-2">
                          {dayPlan.tasks?.map((task, tIdx) => {
                            const taskId = `${currentWeekData.week}-${dayPlan.dayNumber ?? dayPlan.day}-${tIdx}-${task.topic}`;
                            const isDone = Boolean(completedTasks[taskId]);
                            const style = taskTypeStyles[task.type] || taskTypeStyles.lesson;

                            return (
                              <div
                                key={tIdx}
                                className={`group p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                                  isDone
                                    ? "bg-slate-100/80 border-slate-200 opacity-60"
                                    : "bg-white border-slate-200 hover:border-emerald-300"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleTask(taskId)}
                                  className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                                >
                                  {isDone ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 flex-shrink-0 transition-colors" />
                                  )}

                                  <div className="min-w-0">
                                    <p
                                      className={`text-xs font-medium truncate ${
                                        isDone ? "line-through text-slate-400" : "text-slate-800"
                                      }`}
                                    >
                                      {task.topic}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span
                                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${style.bg} ${style.text} ${style.border}`}
                                      >
                                        {style.label}
                                      </span>
                                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        {task.duration_mins}m
                                      </span>
                                    </div>
                                  </div>
                                </button>

                                {task.link && (
                                  <Link
                                    href={task.link}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all flex-shrink-0"
                                    title="Open interactive module"
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                  </Link>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Day bottom status */}
                      <div className="mt-3 pt-2 text-right">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {dayPlan.tasks?.length} module items
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Link
              href="/simulators"
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all group flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Paper Trading Simulators
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Test your roadmap strategies risk-free with virtual capital.
                </p>
              </div>
            </Link>

            <Link
              href="/ai-exam"
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all group flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  AI Diagnostic Exams
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Generate mock exams matching CFA, NISM, and CA standards.
                </p>
              </div>
            </Link>

            <Link
              href="/explore"
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all group flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Explore Knowledge Library
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  100+ curated finance book summaries and deep-dive articles.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: PLANNER STUDIO (INPUT / PREVIEW MODE)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Curriculum Engine 2.0</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pt-2 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            PERSONALIZED LEARNING PLANNER
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Build Your Learning Roadmap
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Get an intelligent, day-by-day financial mastery curriculum tailored to your goal, schedule, and experience level.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-medium text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Zero Information Overload
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Tailored to Your Time
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Interactive Lesson Links
            </span>
          </div>
        </div>

        {/* Main 2-Column Command Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: 3-STEP INTERACTIVE PLANNER (7 COLS / 58%)     */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-7">
            {/* Step 1: Learning Goal */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  What is your learning goal? <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {goal.length}/500
                </span>
              </div>

              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Example: I want to understand the stock market well enough to start investing monthly in index funds, analyze corporate balance sheets, and plan my taxes."
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all leading-relaxed resize-none"
              />

              {/* Clickable Quick-Start Chips */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Or pick a popular focus area:
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_GOALS.map((qg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGoal(qg.text)}
                      className="text-left text-xs bg-slate-100/80 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 border border-slate-200/80 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Zap className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium text-slate-700">{qg.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Learner Persona */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                I am a...
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PERSONAS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = persona === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPersona(p.id)}
                      className={`p-3 rounded-2xl text-left border transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-600 shadow-sm ring-1 ring-emerald-600"
                          : "bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-xs border ${
                            isSelected ? "border-emerald-200 text-emerald-700" : "border-slate-200 text-slate-600"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{p.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                          {p.roleDesc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Pace & Availability */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                Target Timeframe & Daily Schedule
              </label>

              {/* Timeframe Cards */}
              <div className="grid grid-cols-3 gap-2.5">
                {TIMEFRAMES.map((tf) => {
                  const isSelected = timeframe === tf.days;
                  return (
                    <button
                      key={tf.days}
                      type="button"
                      onClick={() => setTimeframe(tf.days)}
                      className={`p-3.5 rounded-2xl text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-600 shadow-sm ring-1 ring-emerald-600"
                          : "bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900">{tf.label}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isSelected ? "bg-emerald-200/60 text-emerald-900" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {tf.tagline}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Hours Slider with Dynamic Commitment Calculation */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800">
                      Study Time Available Per Day
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Total Commitment: <strong className="text-emerald-700">{totalCalculatedHours} Hours</strong> over {timeframe} days
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-[#0A1628] text-emerald-400">
                    {hoursPerDay} {hoursPerDay === 1 ? "Hour" : "Hours"} / day
                  </span>
                </div>

                <input
                  type="range"
                  min={0.5}
                  max={4}
                  step={0.5}
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />

                <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
                  <span>30m</span>
                  <span>1h</span>
                  <span>1.5h</span>
                  <span>2h</span>
                  <span>3h</span>
                  <span>4h</span>
                </div>
              </div>

              {/* Optional Exam Target */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-slate-400" />
                  Targeting a Specific Exam? <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <select
                    value={examTarget}
                    onChange={(e) => setExamTarget(e.target.value)}
                    className="w-full h-11 px-4 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:border-emerald-600 focus:bg-white appearance-none cursor-pointer"
                  >
                    {EXAM_TARGETS.map((et) => (
                      <option key={et.id} value={et.id}>
                        {et.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Error Message if Any */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                {error}
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className={`w-full py-4 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                  generating
                    ? "bg-slate-800 text-slate-300 cursor-wait shadow-none"
                    : "bg-gradient-to-r from-[#0F3D3E] via-teal-800 to-emerald-600 text-white shadow-emerald-900/20 hover:shadow-emerald-900/30 hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>{loadingMessages[loadingStep]}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Generate My {timeframe}-Day Personalized Roadmap</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2.5">
                Instant generation • Works for all members & guests • Real-time curriculum sync
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: DYNAMIC PREVIEW & VALUE CARD (5 COLS / 42%)  */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
            {/* Live Interactive Sample Output Preview */}
            <div className="bg-[#0A1628] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl border border-slate-800">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
                    Sample Roadmap Structure
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {timeframe} Days • {hoursPerDay}h/day
                </span>
              </div>

              {/* Dynamic Sample Phases */}
              <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-emerald-400">Week 1: Days 1 – 7</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                      Foundation Track
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    Core Mechanics & Financial Statements
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Learn balance sheets, cash flows, and market microstructure.
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-emerald-400" />
                      5 Lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-indigo-400" />
                      2 Quizzes
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart2 className="w-3 h-3 text-amber-400" />
                      1 Simulator Run
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 opacity-75">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-300">
                      Week 2: Days 8 – {Math.min(14, parseInt(timeframe, 10))}
                    </span>
                    <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                      Applied Strategy
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 mb-1">
                    Asset Allocation & Quantitative Valuation
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    DCF models, index fund strategies, and risk-adjusted return ratios.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 opacity-40">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-400">
                      Final Phase: Days {Math.max(15, parseInt(timeframe, 10) - 7)} – {timeframe}
                    </span>
                    <span className="text-[10px] bg-white/10 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                      Mastery Capstone
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-300 mb-1">
                    Live Execution & Certified Capstone
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Comprehensive mock exam and real-time simulator portfolio review.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Structured Daily Checklist
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Milestone Badges
                </span>
              </div>
            </div>

            {/* Why AI Learning Roadmaps Work */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                Why AI Roadmaps Accelerate Learning
              </h3>

              <div className="space-y-3.5">
                {[
                  {
                    title: "No More Guesswork",
                    desc: "Eliminates random browsing with a curated, day-by-day sequence.",
                    icon: CheckCircle2,
                  },
                  {
                    title: "Adapts to Your Actual Schedule",
                    desc: "Whether you have 30 minutes or 3 hours, daily tasks scale to match your time.",
                    icon: Clock,
                  },
                  {
                    title: "Deep FinanceHub Ecosystem Linkage",
                    desc: "Every milestone links directly to our paper trading simulators and quizzes.",
                    icon: BookOpen,
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
