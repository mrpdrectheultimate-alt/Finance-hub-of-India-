// ============================================================
// FinanceHub — Dynamic Sitemap
// app/sitemap.ts
// Generates XML sitemap for all published content
// Submitted to Google Search Console for SEO indexing
// ============================================================

import { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://financehub.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServiceClient();

  // Fetch all published content in parallel safely
  let lessons: any[] = [];
  let cases: any[] = [];
  let glossary: any[] = [];
  let tracks: any[] = [];

  try {
    const [lessonsRes, casesRes, glossaryRes, tracksRes] = await Promise.all([
      (supabase as any)
        .from("lessons")
        .select("slug,updated_at,is_free,language")
        .eq("is_published", true)
        .order("created_at", { ascending: false }),

      (supabase as any)
        .from("case_studies")
        .select("slug,updated_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false }),

      (supabase as any)
        .from("glossary")
        .select("slug,updated_at")
        .eq("is_published", true)
        .order("term"),

      (supabase as any)
        .from("tracks")
        .select("slug,updated_at")
        .eq("is_active", true),
    ]);

    lessons  = lessonsRes.data  || [];
    cases    = casesRes.data    || [];
    glossary = glossaryRes.data || [];
    tracks   = tracksRes.data   || [];
  } catch {
    // Fallback if DB fetch fails at build time
  }

  // ─── Static pages ─────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url:              `${BASE_URL}`,
      lastModified:     new Date(),
      changeFrequency:  "weekly",
      priority:         1.0,
    },
    {
      url:              `${BASE_URL}/explore`,
      lastModified:     new Date(),
      changeFrequency:  "weekly",
      priority:         0.9,
    },
    {
      url:              `${BASE_URL}/glossary`,
      lastModified:     new Date(),
      changeFrequency:  "weekly",
      priority:         0.8,
    },
    {
      url:              `${BASE_URL}/case-studies`,
      lastModified:     new Date(),
      changeFrequency:  "weekly",
      priority:         0.8,
    },
    {
      url:              `${BASE_URL}/practice/sip`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.8,
    },
    {
      url:              `${BASE_URL}/practice/emi`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.7,
    },
    {
      url:              `${BASE_URL}/practice/tax`,
      lastModified:     new Date(),
      changeFrequency:  "yearly",
      priority:         0.7,
    },
    {
      url:              `${BASE_URL}/practice/net-worth`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.7,
    },
    {
      url:              `${BASE_URL}/practice/goals`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.7,
    },
    {
      url:              `${BASE_URL}/leaderboard`,
      lastModified:     new Date(),
      changeFrequency:  "daily",
      priority:         0.5,
    },
    {
      url:              `${BASE_URL}/review`,
      lastModified:     new Date(),
      changeFrequency:  "daily",
      priority:         0.5,
    },
    {
      url:              `${BASE_URL}/knowledge-map`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.6,
    },
    {
      url:              `${BASE_URL}/legal/terms`,
      lastModified:     new Date(),
      changeFrequency:  "yearly",
      priority:         0.3,
    },
    {
      url:              `${BASE_URL}/legal/privacy`,
      lastModified:     new Date(),
      changeFrequency:  "yearly",
      priority:         0.3,
    },
    {
      url:              `${BASE_URL}/legal/disclaimer`,
      lastModified:     new Date(),
      changeFrequency:  "yearly",
      priority:         0.3,
    },
    {
      url:              `${BASE_URL}/pricing`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.7,
    },
  ];

  // ─── Track pages ──────────────────────────────────────────
  const trackPages: MetadataRoute.Sitemap = tracks.map(track => ({
    url:             `${BASE_URL}/track/${track.slug}`,
    lastModified:    track.updated_at ? new Date(track.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.8,
  }));

  // ─── Lesson pages ─────────────────────────────────────────
  const lessonPages: MetadataRoute.Sitemap = lessons.map(lesson => ({
    url:             `${BASE_URL}/learn/${lesson.slug}`,
    lastModified:    lesson.updated_at ? new Date(lesson.updated_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority:        lesson.is_free ? 0.8 : 0.6,
    ...(lesson.language === "hi" ? {
      alternates: {
        languages: {
          "hi": `${BASE_URL}/learn/${lesson.slug}`,
          "en": `${BASE_URL}/learn/${lesson.slug}`,
        }
      }
    } : {}),
  }));

  // ─── Case study pages ─────────────────────────────────────
  const casePages: MetadataRoute.Sitemap = cases.map(cs => ({
    url:             `${BASE_URL}/case-studies/${cs.slug}`,
    lastModified:    cs.updated_at ? new Date(cs.updated_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority:        0.7,
  }));

  // ─── Glossary pages ───────────────────────────────────────
  const glossaryPages: MetadataRoute.Sitemap = glossary.map(term => ({
    url:             `${BASE_URL}/glossary/${term.slug}`,
    lastModified:    term.updated_at ? new Date(term.updated_at) : new Date(),
    changeFrequency: "yearly" as const,
    priority:        0.6,
  }));

  return [
    ...staticPages,
    ...trackPages,
    ...lessonPages,
    ...casePages,
    ...glossaryPages,
  ];
}
