"use client";

import Link from "next/link";
import { useState } from "react";

const tracks = [
  {
    icon: "💰",
    title: "Personal finance",
    desc: "Budgeting, saving, loans, taxes, and insurance: life skills no school taught you.",
    levels: ["Absolute beginner", "Working adult", "Wealth builder"],
    color: "#E1F5EE",
    accent: "#0F6E56",
  },
  {
    icon: "📈",
    title: "Trading and markets",
    desc: "From reading a candlestick to running a strategy, across three complete levels.",
    levels: ["Markets 101", "Technical analysis", "Advanced strategies"],
    color: "#E6F1FB",
    accent: "#185FA5",
  },
  {
    icon: "₿",
    title: "Crypto and DeFi",
    desc: "Blockchain fundamentals, wallets, DeFi protocols, and portfolio management.",
    levels: ["What is crypto", "DeFi basics", "On-chain strategies"],
    color: "#FAEEDA",
    accent: "#854F0B",
  },
  {
    icon: "🏢",
    title: "Corporate and founder finance",
    desc: "Valuation, fundraising, M&A, and unit economics for people building companies.",
    levels: ["Business basics", "Startup finance", "Advanced corporate"],
    color: "#EEEDFE",
    accent: "#534AB7",
  },
];

const audiences = [
  { label: "School student", desc: "Saving, compound interest, first bank account", icon: "🎒" },
  { label: "Working adult", desc: "Budgeting, EMIs, mutual funds, tax filing", icon: "💼" },
  { label: "Trader", desc: "Charts, risk management, derivatives, psychology", icon: "📊" },
  { label: "Founder", desc: "Cap tables, fundraising, valuation, board decks", icon: "🚀" },
  { label: "Exam aspirant", desc: "CFA, FRM, CA, and banking certification prep", icon: "📝" },
];

const stats = [
  { value: "500+", label: "Lessons" },
  { value: "5", label: "Levels per track" },
  { value: "Free", label: "Core content" },
  { value: "AI", label: "Doubt solver" },
];

const quizQuestions = [
  {
    q: "Who are you?",
    key: "who",
    options: [
      "School / college student",
      "Working professional",
      "Trader / investor",
      "Founder / business owner",
      "Preparing for finance exams",
    ],
  },
  {
    q: "What's your finance goal?",
    key: "goal",
    options: [
      "Stop living paycheck to paycheck",
      "Start investing confidently",
      "Learn trading from scratch",
      "Understand my business better",
      "Pass a finance certification",
    ],
  },
  {
    q: "How much do you know already?",
    key: "level",
    options: ["Almost nothing", "I know the basics", "Intermediate: I've started", "Advanced: I want depth"],
  },
];

const features = [
  {
    icon: "🤖",
    title: "AI tutor",
    body: "Ask anything and get explanations tuned to your level.",
  },
  {
    icon: "🎮",
    title: "Learn by doing",
    body: "Budget simulators, mock trading, and portfolio challenges.",
  },
  {
    icon: "🏆",
    title: "Streaks and XP",
    body: "Daily streaks, badges, and leaderboards for steady progress.",
  },
  {
    icon: "📜",
    title: "Certificates",
    body: "Complete a track and earn a certificate you can share.",
  },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: [
      "Beginner lessons across all tracks",
      "5 AI tutor questions/day",
      "Basic quizzes and games",
      "Progress tracking",
      "Community access",
    ],
    cta: "Get started",
    accent: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    features: [
      "Everything in Free",
      "Full beginner + intermediate content",
      "Unlimited AI tutor",
      "Exam prep modules",
      "Certificates on completion",
      "Ad-free experience",
    ],
    cta: "Start 7-day trial",
    accent: true,
  },
  {
    name: "Expert",
    price: "₹999",
    period: "/month",
    features: [
      "Everything in Pro",
      "Advanced trading strategies",
      "Corporate and founder track",
      "Live trading simulator",
      "Mock interviews",
      "Priority support",
    ],
    cta: "Start 7-day trial",
    accent: false,
  },
];

export default function FinanceHubLanding() {
  const [activeAudience, setActiveAudience] = useState(0);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const getRecommendation = () => {
    const who = quizAnswers.who || "";

    if (who.includes("School")) {
      return {
        track: "Personal finance",
        level: "Absolute beginner",
        path: "Start with money basics: saving, budgeting, and compound interest.",
      };
    }

    if (who.includes("Trader")) {
      return {
        track: "Trading and markets",
        level: "Markets 101",
        path: "Begin with how markets work, then progress to charts and strategies.",
      };
    }

    if (who.includes("Founder")) {
      return {
        track: "Corporate and founder finance",
        level: "Business basics",
        path: "Start with unit economics and cap tables, then move into fundraising.",
      };
    }

    if (who.includes("exam")) {
      return {
        track: "Exam prep",
        level: "CFA Level 1",
        path: "Use structured exam prep with mock tests, revision plans, and question banks.",
      };
    }

    return {
      track: "Personal finance",
      level: "Working adult",
      path: "Investing, taxes, and insurance: the essentials for financial independence.",
    };
  };

  const handleQuizAnswer = (key: string, val: string) => {
    setQuizAnswers((answers) => ({ ...answers, [key]: val }));

    if (quizStep < quizQuestions.length - 1) {
      setQuizStep((step) => step + 1);
    } else {
      setShowResult(true);
    }
  };

  const recommendation = getRecommendation();

  return (
    <main className="page">
      <nav className="nav" aria-label="Main navigation">
        <Link className="brand" href="/">
          <span className="mark">F</span>
          <span>FinanceHub</span>
        </Link>
        <div className="nav-links">
          <a href="#tracks">Tracks</a>
          <a href="#quiz">Find your path</a>
          <a href="#pricing">Pricing</a>
          <Link href="/dashboard">Dashboard</Link>
        </div>
        <div className="nav-actions">
          <Link className="btn" href="/auth/login">
            Log in
          </Link>
          <Link className="btn primary" href="/auth/signup">
            Start free
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="pulse" />
            Free to start, no credit card needed
          </div>
          <h1>
            FinanceHub <span>for every level.</span>
          </h1>
          <p className="hero-text">
            From your first savings account to running a fundraising round: structured lessons, games, quizzes, and an
            AI tutor that explains finance in plain language.
          </p>
          <div className="button-row">
            <Link className="btn primary" href="/onboarding">
              Find your learning path
            </Link>
            <a className="btn" href="#tracks">
              Browse all tracks
            </a>
          </div>
        </div>
        <div className="hero-visual" aria-label="FinanceHub learning workspace visual">
          <img src="/hero-financehub.png" alt="" />
        </div>
      </section>

      <section className="stats" aria-label="FinanceHub statistics">
        {stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="band">
        <div className="section">
          <div className="section-header">
            <p className="kicker">Who it's for</p>
            <h2>Finance knowledge for everyone</h2>
          </div>
          <div className="audience-tabs" role="tablist" aria-label="Audience types">
            {audiences.map((audience, index) => (
              <button
                className={`pill ${activeAudience === index ? "active" : ""}`}
                key={audience.label}
                type="button"
                role="tab"
                aria-selected={activeAudience === index}
                onClick={() => setActiveAudience(index)}
              >
                {audience.icon} {audience.label}
              </button>
            ))}
          </div>
          <div className="audience-panel">
            <div className="audience-icon">{audiences[activeAudience].icon}</div>
            <div>
              <strong>{audiences[activeAudience].label}</strong>
              <span>{audiences[activeAudience].desc}</span>
            </div>
            <Link className="btn" href="/onboarding">
              See curriculum →
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="tracks">
        <div className="section-header">
          <p className="kicker">Learning tracks</p>
          <h2>Four tracks. Infinite depth.</h2>
          <p>Each track goes from complete beginner to expert. Follow one, or combine them.</p>
        </div>
        <div className="tracks-grid">
          {tracks.map((track) => (
            <article className="track-card" key={track.title}>
              <div className="track-top" style={{ background: track.color }}>
                <div className="track-icon">{track.icon}</div>
                <h3>{track.title}</h3>
              </div>
              <div className="track-body">
                <p>{track.desc}</p>
                <div className="level-list">
                  {track.levels.map((level, index) => (
                    <span className="level" key={level}>
                      <span className="dot" style={{ background: track.accent, opacity: 0.45 + index * 0.25 }} />
                      {level}
                    </span>
                  ))}
                </div>
                <Link className="btn" href="/onboarding" style={{ color: track.accent, borderColor: track.accent }}>
                  Explore track →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dark-band">
        <div className="section">
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section quiz-shell" id="quiz">
        <p className="kicker">Personalised path</p>
        <h2>Find your starting point</h2>
        <p className="quiz-intro">3 questions. We'll tell you exactly where to begin.</p>

        {!showResult ? (
          <div>
            <div className="progress" aria-label={`Question ${quizStep + 1} of ${quizQuestions.length}`}>
              {quizQuestions.map((question, index) => (
                <span className={`bar ${index <= quizStep ? "done" : ""}`} key={question.key} />
              ))}
            </div>
            <div className="question">{quizQuestions[quizStep].q}</div>
            <div className="options">
              {quizQuestions[quizStep].options.map((option) => (
                <button
                  className="option"
                  key={option}
                  type="button"
                  onClick={() => handleQuizAnswer(quizQuestions[quizStep].key, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="result">
            <div className="result-label">Your recommended path</div>
            <h3>{recommendation.track}</h3>
            <p>Starting level: {recommendation.level}</p>
            <p>{recommendation.path}</p>
            <div className="button-row">
              <Link className="btn primary" href="/auth/signup">
                Start this path, it's free
              </Link>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setQuizStep(0);
                  setQuizAnswers({});
                  setShowResult(false);
                }}
              >
                Retake
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="pricing" id="pricing">
        <div className="section">
          <div className="section-header">
            <p className="kicker">Pricing</p>
            <h2>Start free. Upgrade when ready.</h2>
            <p>Core content is always free. Premium unlocks depth.</p>
          </div>
          <div className="pricing-grid">
            {plans.map((plan) => (
              <article className={`price-card ${plan.accent ? "featured" : ""}`} key={plan.name}>
                {plan.accent ? <div className="badge">Most popular</div> : null}
                <h3>{plan.name}</h3>
                <div className="price">
                  <strong>{plan.price}</strong>
                  <span>{plan.period}</span>
                </div>
                <ul className="feature-list">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <span className="check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link className={`btn ${plan.accent ? "primary" : ""}`} href="/auth/signup">
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="brand">
          <span className="mark">F</span>
          <span>FinanceHub</span>
        </div>
        <p>All content is educational only and does not constitute financial advice.</p>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </main>
  );
}
