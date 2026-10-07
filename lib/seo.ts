// ============================================================
// FinanceHub — SEO Utilities
// lib/seo.ts
// generateMetadata() for every page type
// Structured data (JSON-LD) for Google rich results
// ============================================================

import type { Metadata } from "next";

const APP_URL  = process.env.NEXT_PUBLIC_APP_URL || "https://financehub.in";
const APP_NAME = "FinanceHub";
const DEFAULT_DESC = "India's best finance education platform. Learn personal finance, investing, trading, tax and crypto through structured lessons, AI mentoring and interactive simulators. Free in Hindi and English.";

// ─────────────────────────────────────────────────────────────
// Core metadata builder
// ─────────────────────────────────────────────────────────────
export function buildMetadata({
  title,
  description = DEFAULT_DESC,
  path         = "/",
  image,
  noIndex      = false,
  type         = "website",
  keywords     = [],
}: {
  title:        string;
  description?: string;
  path?:        string;
  image?:       string;
  noIndex?:     boolean;
  type?:        "website" | "article";
  keywords?:    string[];
}): Metadata {
  const url     = `${APP_URL}${path}`;
  const ogImage = image || `${APP_URL}/api/og?title=${encodeURIComponent(title)}`;

  const baseKeywords = [
    "personal finance India",
    "mutual funds",
    "SIP calculator",
    "income tax India",
    "stock market basics",
    "financial planning",
    "investing India",
    "FinanceHub",
  ];

  return {
    title,
    description,
    keywords: [...baseKeywords, ...keywords].join(", "),
    metadataBase: new URL(APP_URL),
    alternates:   { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title,
      description,
      url,
      siteName: APP_NAME,
      type,
      locale:   "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [ogImage],
      creator:     "@FinanceHubIn",
      site:        "@FinanceHubIn",
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Page-specific metadata generators
// ─────────────────────────────────────────────────────────────

export const seo = {
  home: () => buildMetadata({
    title:       "FinanceHub — Finance Education for India",
    description: DEFAULT_DESC,
    path:        "/",
    keywords:    ["finance education India","free finance course","hindi finance"],
  }),

  explore: () => buildMetadata({
    title:       "Explore Finance Courses — FinanceHub",
    description: "Browse 375+ finance lessons across 8 tracks. Personal finance, trading, crypto, corporate finance — free in Hindi and English.",
    path:        "/explore",
    keywords:    ["finance course India","free finance lessons","trading course","personal finance course"],
  }),

  lesson: (title: string, slug: string, desc: string) => buildMetadata({
    title:       `${title} — FinanceHub`,
    description: desc,
    path:        `/learn/${slug}`,
    type:        "article",
    keywords:    [title.toLowerCase(), "finance lesson India"],
  }),

  track: (name: string, slug: string, desc: string) => buildMetadata({
    title:       `${name} Track — FinanceHub`,
    description: `Learn ${name} from scratch. ${desc}`,
    path:        `/tracks/${slug}`,
    keywords:    [name.toLowerCase(), "finance course India", slug.replace(/-/g," ")],
  }),

  caseStudy: (title: string, slug: string, subtitle: string) => buildMetadata({
    title:       `${title} — FinanceHub Case Study`,
    description: subtitle,
    path:        `/case-studies/${slug}`,
    type:        "article",
    keywords:    ["finance case study India","real money mistakes India"],
  }),

  practice: () => buildMetadata({
    title:       "Finance Lab — SIP, EMI, Tax Calculators — FinanceHub",
    description: "9 free finance calculators and simulators. SIP calculator, EMI calculator, income tax calculator, retirement planner, and paper trading. No real money.",
    path:        "/practice",
    keywords:    ["SIP calculator India","EMI calculator","income tax calculator India 2024","retirement calculator"],
  }),

  sipCalculator: () => buildMetadata({
    title:       "SIP Calculator India 2026 — FinanceHub",
    description: "Free SIP calculator. See how ₹5,000/month grows over 20 years. Compare rates, start ages, and frequencies. Compound interest visualised.",
    path:        "/practice/sip",
    keywords:    ["SIP calculator India","mutual fund SIP returns","compound interest calculator India"],
  }),

  emiCalculator: () => buildMetadata({
    title:       "EMI Calculator 2026 — Home, Car, Personal Loan — FinanceHub",
    description: "Free EMI calculator for any loan. See total interest paid, amortisation schedule and prepayment impact.",
    path:        "/practice/emi",
    keywords:    ["EMI calculator India","home loan EMI calculator","personal loan calculator India"],
  }),

  library: () => buildMetadata({
    title:       "Finance Library — Videos, Books, PDFs — FinanceHub",
    description: "157+ curated finance videos, 30+ book summaries, PDFs and research. From CA Rachana Ranade, Zerodha Varsity, ET Money and more.",
    path:        "/library",
    keywords:    ["finance videos India","CA Rachana Ranade","Zerodha Varsity","finance books India"],
  }),

  aiTutor: () => buildMetadata({
    title:       "AI Finance Mentor — Ask Anything — FinanceHub",
    description: "Ask your finance questions and get India-specific answers with RBI, SEBI and AMFI sources cited. 5 questions free per day.",
    path:        "/ai-tutor",
    keywords:    ["AI finance tutor","finance question India","RBI SEBI explained"],
  }),

  pricing: () => buildMetadata({
    title:       "Pricing — Free, Pro ₹499, Expert ₹999 — FinanceHub",
    description: "Free forever plan with 100+ lessons. Pro at ₹499/month for full access. Expert at ₹999/month for advanced tracks. 7-day free trial.",
    path:        "/pricing",
    keywords:    ["FinanceHub pricing","finance course price India","online finance course subscription"],
  }),

  glossary: () => buildMetadata({
    title:       "Finance Glossary — 200+ Terms Explained Simply — FinanceHub",
    description: "A to Z finance terms explained in plain English with India-specific examples. SIP, ELSS, NPS, SEBI, NAV and 200+ more.",
    path:        "/glossary",
    keywords:    ["finance terms India","financial glossary","SIP meaning","NAV meaning","ELSS meaning"],
  }),

  caseStudies: () => buildMetadata({
    title:       "Case Studies — Real Indian Financial Stories — FinanceHub",
    description: "25 real Indian financial case studies. Trading mistakes, retirement planning, home buying, startup finance. Learn from real decisions.",
    path:        "/case-studies",
    keywords:    ["finance case study India","money mistakes India","investing mistakes","retirement planning India"],
  }),

  leaderboard: () => buildMetadata({
    title:       "Finance Learning Leaderboard — FinanceHub",
    description: "Compete weekly on FinanceHub's leaderboard. Earn XP by completing lessons. Rise through Bronze, Silver, Gold, Diamond and Master leagues.",
    path:        "/leaderboard",
    noIndex:     false,
    keywords:    ["finance learning gamification","XP leaderboard","finance quiz competition"],
  }),

  certificates: () => buildMetadata({
    title:       "Finance Certificates — Verify Your Knowledge — FinanceHub",
    description: "Earn verified finance certificates by completing tracks on FinanceHub. Each certificate has a unique ID and can be shared on LinkedIn.",
    path:        "/certificates",
    keywords:    ["finance certificate India","online finance certification","investing certification India"],
  }),

  sitemap: () => buildMetadata({
    title:       "Site Map — All Pages and Features — FinanceHub",
    description: "Complete guide to everything on FinanceHub. Every page, every feature, what's free, what's paid, and personalised learning paths.",
    path:        "/sitemap-guide",
    keywords:    ["FinanceHub guide","how to use FinanceHub","finance learning path India"],
  }),

  login: () => buildMetadata({
    title:       "Log In — FinanceHub",
    description: "Sign in to your FinanceHub account.",
    path:        "/login",
    noIndex:     true,
  }),

  signup: () => buildMetadata({
    title:       "Sign Up Free — FinanceHub",
    description: "Create your free FinanceHub account. No credit card required. Start learning finance in 30 seconds.",
    path:        "/signup",
    keywords:    ["free finance course signup","FinanceHub register"],
  }),

  dashboard: () => buildMetadata({
    title:       "My Dashboard — FinanceHub",
    noIndex:     true,
    path:        "/dashboard",
  }),
};

// ─────────────────────────────────────────────────────────────
// Structured Data (JSON-LD) for Google Rich Results
// ─────────────────────────────────────────────────────────────

export function courseStructuredData(lesson: {
  title:      string;
  description:string;
  slug:       string;
  track:      string;
  duration:   number;
  isFree:     boolean;
}) {
  return {
    "@context":   "https://schema.org",
    "@type":      "Course",
    name:         lesson.title,
    description:  lesson.description,
    url:          `${APP_URL}/learn/${lesson.slug}`,
    provider: {
      "@type": "Organization",
      name:    "FinanceHub",
      url:     APP_URL,
    },
    educationalLevel:   lesson.track,
    timeRequired:       `PT${lesson.duration}M`,
    inLanguage:         "en-IN",
    isAccessibleForFree: lesson.isFree,
    offers: lesson.isFree ? undefined : {
      "@type":    "Offer",
      price:      "499",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };
}

export function faqStructuredData(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type":    "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type":          "Question",
      name:             f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text:    f.a,
      },
    })),
  };
}

export function organizationStructuredData() {
  return {
    "@context":     "https://schema.org",
    "@type":        "EducationalOrganization",
    name:           "FinanceHub",
    alternateName:  "FinanceHub of India",
    url:            APP_URL,
    logo:           `${APP_URL}/icons/icon-512.png`,
    description:    DEFAULT_DESC,
    address: {
      "@type":         "PostalAddress",
      addressCountry:  "IN",
    },
    sameAs: [
      "https://twitter.com/FinanceHubIn",
      "https://www.linkedin.com/company/financehub-india",
      "https://www.youtube.com/@FinanceHubIndia",
    ],
    contactPoint: {
      "@type":       "ContactPoint",
      contactType:   "customer support",
      email:         "support@financehub.in",
      availableLanguage: ["English", "Hindi"],
    },
  };
}

export function breadcrumbStructuredData(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type":   "ListItem",
      position:  i + 1,
      name:      item.name,
      item:      `${APP_URL}${item.path}`,
    })),
  };
}
