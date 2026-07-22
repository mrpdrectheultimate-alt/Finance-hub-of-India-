"use client";

import Link from "next/link";
import { useState } from "react";

const tracks = [
  {
    code: "PF",
    title: "Personal Finance",
    slug: "personal-finance",
    desc: "Budgeting, saving, tax, insurance, investing, and wealth building from first principles.",
    levels: ["Absolute Beginner", "Intermediate", "Wealth Builder"],
    tint: "#E1F5EE",
    accent: "#0F6E56",
  },
  {
    code: "TM",
    title: "Trading and Markets",
    slug: "trading-markets",
    desc: "Market structure, charts, technical analysis, risk management, and trading psychology.",
    levels: ["Markets 101", "Technical Analysis", "Advanced Strategies"],
    tint: "#E6F1FB",
    accent: "#185FA5",
  },
  {
    code: "CR",
    title: "Crypto and DeFi",
    slug: "crypto-defi",
    desc: "Blockchain, Bitcoin, Ethereum, wallets, DeFi, security, and portfolio basics.",
    levels: ["Crypto Basics", "DeFi Basics", "On-chain Strategy"],
    tint: "#FAEEDA",
    accent: "#854F0B",
  },
  {
    code: "CF",
    title: "Corporate Finance",
    slug: "corporate-finance",
    desc: "P&L, balance sheets, unit economics, valuation, fundraising, and founder finance.",
    levels: ["Business Basics", "Startup Finance", "Advanced Corporate"],
    tint: "#EEEDFE",
    accent: "#534AB7",
  },
];

const audiences = [
  { label: "Student", desc: "Saving, compounding, first bank account, and money habits." },
  { label: "Working adult", desc: "Budgeting, SIPs, EMIs, insurance, tax planning, and goals." },
  { label: "Trader", desc: "Charts, risk, position sizing, market psychology, and execution." },
  { label: "Founder", desc: "Cash flow, unit economics, cap tables, fundraising, and runway." },
  { label: "Exam aspirant", desc: "CFA, FRM, CA, NISM, banking, and interview preparation." },
];

const stats = [
  { value: "115+", label: "Structured lessons" },
  { value: "8", label: "Learning tracks" },
  { value: "25", label: "Curated playlists" },
  { value: "AI", label: "Tutor and practice" },
];

const features = [
  {
    title: "Learn",
    body: "Four-tab lesson player with reading, videos, quizzes, comments, notes, and completion tracking.",
  },
  {
    title: "Practice",
    body: "SIP, EMI, tax, retirement, startup cash flow, forex paper trading, and crypto paper trading labs.",
  },
  {
    title: "Adapt",
    body: "Mastery tracking and spaced repetition recommend what to revise next.",
  },
  {
    title: "Grow",
    body: "Daily challenges, weekly missions, XP, leaderboards, certificates, and career roadmaps.",
  },
];

const plans = [
  {
    name: "Free",
    price: "INR 0",
    period: "forever",
    features: ["Beginner lessons", "Daily AI limit", "Quizzes", "Progress tracking", "Community access"],
    cta: "Start free",
    href: "/auth/signup",
    featured: false,
  },
  {
    name: "Pro",
    price: "INR 499",
    period: "per month",
    features: ["Intermediate content", "Unlimited AI tutor", "Exam practice", "Downloads", "Certificates"],
    cta: "Explore Pro",
    href: "/pricing",
    featured: true,
  },
  {
    name: "Expert",
    price: "INR 999",
    period: "per month",
    features: ["Advanced trading", "Founder finance", "Career prep", "Priority support", "Premium labs"],
    cta: "Explore Expert",
    href: "/pricing",
    featured: false,
  },
];

const quizQuestions = [
  {
    q: "Who are you?",
    key: "who",
    options: ["Student", "Working adult", "Trader", "Founder", "Exam aspirant"],
  },
  {
    q: "What do you want first?",
    key: "goal",
    options: ["Budget better", "Start investing", "Learn trading", "Understand business", "Prepare for exams"],
  },
  {
    q: "Current level?",
    key: "level",
    options: ["New beginner", "Know basics", "Intermediate", "Advanced"],
  },
];

export default function FinanceHubLanding() {
  const [activeAudience, setActiveAudience] = useState(0);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const recommendation = (() => {
    const who = quizAnswers.who || "";
    if (who === "Trader") return { track: "Trading and Markets", level: "Markets 101" };
    if (who === "Founder") return { track: "Corporate Finance", level: "Business Basics" };
    if (who === "Exam aspirant") return { track: "Career Hub", level: "Interview and exam prep" };
    return { track: "Personal Finance", level: who === "Working adult" ? "Intermediate" : "Absolute Beginner" };
  })();

  const answerQuestion = (key: string, value: string) => {
    setQuizAnswers((current) => ({ ...current, [key]: value }));
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep((current) => current + 1);
    } else {
      setShowResult(true);
    }
  };

  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Main navigation">
        <Link className="landing-brand" href="/">
          <span className="landing-mark">F</span>
          <span>FinanceHub</span>
        </Link>
        <div className="landing-links">
          <a href="#tracks">Tracks</a>
          <a href="#quiz">Find your path</a>
          <a href="#pricing">Pricing</a>
          <Link href="/library">Library</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
        <div className="landing-actions">
          <Link className="landing-btn" href="/auth/login">Log in</Link>
          <Link className="landing-btn primary" href="/auth/signup">Start free</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow">Free to start. Built for India. No credit card needed.</p>
          <h1>FinanceHub for every level.</h1>
          <p className="landing-lede">
            Master personal finance, investing, trading, crypto, forex, and corporate finance through structured
            lessons, AI tutoring, live simulators, and curated resources.
          </p>
          <div className="landing-button-row">
            <Link className="landing-btn primary large" href="/onboarding">Find your learning path</Link>
            <a className="landing-btn large" href="#tracks">Browse tracks</a>
          </div>
        </div>
        <div className="landing-visual" aria-hidden="true">
          <img src="/hero-financehub.png" alt="" />
        </div>
      </section>

      <section className="landing-stats" aria-label="FinanceHub statistics">
        {stats.map((stat) => (
          <div className="landing-stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="landing-section">
        <div className="landing-section-head">
          <p className="landing-kicker">Who it is for</p>
          <h2>Finance knowledge for everyone</h2>
        </div>
        <div className="landing-pill-row" role="tablist" aria-label="Audience types">
          {audiences.map((audience, index) => (
            <button
              className={`landing-pill ${activeAudience === index ? "active" : ""}`}
              key={audience.label}
              type="button"
              aria-selected={activeAudience === index}
              onClick={() => setActiveAudience(index)}
            >
              {audience.label}
            </button>
          ))}
        </div>
        <div className="landing-audience-panel">
          <div>
            <strong>{audiences[activeAudience].label}</strong>
            <p>{audiences[activeAudience].desc}</p>
          </div>
          <Link className="landing-btn" href="/onboarding">See curriculum</Link>
        </div>
      </section>

      <section className="landing-section" id="tracks">
        <div className="landing-section-head">
          <p className="landing-kicker">Learning tracks</p>
          <h2>Eight tracks. One clear path.</h2>
          <p>Start with a beginner level, then move into deeper tracks as your confidence grows.</p>
        </div>
        <div className="landing-track-grid">
          {tracks.map((track) => (
            <article className="landing-track-card" key={track.title}>
              <div className="landing-track-top" style={{ background: track.tint }}>
                <span style={{ color: track.accent }}>{track.code}</span>
                <h3>{track.title}</h3>
              </div>
              <div className="landing-track-body">
                <p>{track.desc}</p>
                <div className="landing-levels">
                  {track.levels.map((level) => (
                    <span key={level}>{level}</span>
                  ))}
                </div>
                <Link className="landing-btn" href={`/track/${track.slug}`}>Explore track</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-feature-band">
        <div className="landing-feature-grid">
          {features.map((feature) => (
            <article className="landing-feature" key={feature.title}>
              <span>{feature.title.slice(0, 2).toUpperCase()}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-quiz" id="quiz">
        <p className="landing-kicker">Personalised path</p>
        <h2>Find your starting point</h2>
        <p>Answer three quick questions and FinanceHub will suggest where to begin.</p>

        {!showResult ? (
          <div className="landing-question-card">
            <div className="landing-progress" aria-label={`Question ${quizStep + 1} of ${quizQuestions.length}`}>
              {quizQuestions.map((question, index) => (
                <span className={index <= quizStep ? "done" : ""} key={question.key} />
              ))}
            </div>
            <h3>{quizQuestions[quizStep].q}</h3>
            <div className="landing-options">
              {quizQuestions[quizStep].options.map((option) => (
                <button
                  className="landing-option"
                  key={option}
                  type="button"
                  onClick={() => answerQuestion(quizQuestions[quizStep].key, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="landing-result">
            <p className="landing-kicker">Recommended path</p>
            <h3>{recommendation.track}</h3>
            <p>Start with: {recommendation.level}</p>
            <div className="landing-button-row">
              <Link className="landing-btn primary" href="/auth/signup">Start this path</Link>
              <button
                className="landing-btn"
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

      <section className="landing-pricing" id="pricing">
        <div className="landing-section-head">
          <p className="landing-kicker">Pricing</p>
          <h2>Start free. Upgrade when ready.</h2>
          <p>Core content is free. Premium plans unlock deeper AI, downloads, certificates, and advanced labs.</p>
        </div>
        <div className="landing-price-grid">
          {plans.map((plan) => (
            <article className={`landing-price-card ${plan.featured ? "featured" : ""}`} key={plan.name}>
              {plan.featured ? <span className="landing-badge">Most popular</span> : null}
              <h3>{plan.name}</h3>
              <div className="landing-price">
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link className={`landing-btn ${plan.featured ? "primary" : ""}`} href={plan.href}>
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <Link className="landing-brand" href="/">
          <span className="landing-mark">F</span>
          <span>FinanceHub</span>
        </Link>
        <p>Educational content only. Not investment advice.</p>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
      </footer>
    </main>
  );
}
