// ============================================================
// FinanceHub — SEO Metadata Utilities
// lib/seo.ts
// ============================================================

import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://finance-hub-of-india.vercel.app";
const SITE_NAME = "FinanceHub";
const DEFAULT_DESC =
  "India's most comprehensive finance education platform. Learn personal finance, investing, trading, crypto, and corporate finance — free, in Hindi and English.";

// ─── Base site metadata ───────────────────────────────────────
export const BASE_METADATA: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${SITE_NAME} — Free Finance Education for India`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESC,
  keywords: [
    "finance education India",
    "personal finance Hindi",
    "stock market basics",
    "SIP calculator",
    "mutual fund",
    "income tax India",
    "financial literacy",
    "investing beginner",
    "crypto India",
    "forex trading",
    "technical analysis",
    "financial planning",
    "retirement planning India",
  ],
  authors: [{ name: "FinanceHub" }],
  creator: "FinanceHub",
  publisher: "FinanceHub",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Free Finance Education for India`,
    description: DEFAULT_DESC,
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "FinanceHub — Finance Education for India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@financehubindia",
    title: `${SITE_NAME} — Free Finance Education for India`,
    description: DEFAULT_DESC,
    images: [`${BASE_URL}/og-default.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

// ─── Lesson metadata generator ────────────────────────────────
interface LessonMeta {
  title: string;
  slug: string;
  content_mdx: string;
  track_name: string;
  track_slug: string;
  level_name: string;
  duration_minutes: number;
  is_free: boolean;
}

export function generateLessonMetadata(lesson: LessonMeta): Metadata {
  // Strip MDX markdown from content for description
  const cleanContent = lesson.content_mdx
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold
    .replace(/\*(.+?)\*/g, "$1") // italic
    .replace(/`(.+?)`/g, "$1") // code
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // links
    .replace(/^[-*]\s+/gm, "") // bullets
    .replace(/\n+/g, " ") // newlines
    .trim();

  const description =
    cleanContent.slice(0, 155) + (cleanContent.length > 155 ? "…" : "");

  const title = `${lesson.title} — ${lesson.track_name}`;
  const canonicalUrl = `${BASE_URL}/learn/${lesson.slug}`;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: `${BASE_URL}/api/og?title=${encodeURIComponent(lesson.title)}&track=${encodeURIComponent(lesson.track_name)}&level=${encodeURIComponent(lesson.level_name)}&free=${lesson.is_free}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    other: {
      // Article structured data hints
      "article:section": lesson.track_name,
      "article:tag": lesson.track_slug,
    },
  };
}

// ─── Track page metadata ──────────────────────────────────────
interface TrackMeta {
  name: string;
  slug: string;
  description: string;
  lesson_count: number;
  color_hex: string;
}

export function generateTrackMetadata(track: TrackMeta): Metadata {
  const title = `${track.name} — ${track.lesson_count} Free Lessons`;
  const description = `${track.description} Learn ${track.name.toLowerCase()} with ${track.lesson_count} free lessons, interactive quizzes, and AI-powered tutoring on FinanceHub.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/tracks/${track.slug}`,
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `${BASE_URL}/tracks/${track.slug}` },
  };
}

// ─── JSON-LD structured data generators ──────────────────────

// Course schema for lessons
export function lessonJsonLd(lesson: LessonMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: lesson.title,
    description: lesson.content_mdx.slice(0, 200).replace(/[#*_`]/g, ""),
    provider: {
      "@type": "Organization",
      name: "FinanceHub",
      url: BASE_URL,
    },
    url: `${BASE_URL}/learn/${lesson.slug}`,
    courseMode: "online",
    isAccessibleForFree: lesson.is_free,
    inLanguage: "en-IN",
    about: {
      "@type": "Thing",
      name: lesson.track_name,
    },
  };
}

// FAQ schema (generated from lesson content)
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Breadcrumb schema
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

// Organization schema (for homepage)
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "FinanceHub",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: DEFAULT_DESC,
    foundingDate: "2024",
    areaServed: "India",
    knowsAbout: [
      "Personal Finance",
      "Investing",
      "Stock Market",
      "Mutual Funds",
      "Cryptocurrency",
      "Forex Trading",
      "Corporate Finance",
      "Technical Analysis",
      "Behavioral Finance",
    ],
    sameAs: [
      "https://twitter.com/financehubindia",
      "https://instagram.com/financehubindia",
      "https://youtube.com/@financehubindia",
    ],
  };
}
