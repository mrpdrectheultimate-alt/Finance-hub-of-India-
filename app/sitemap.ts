import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://financehub.in";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${APP_URL}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/explore`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)
  ) {
    return staticPages;
  }

  let supabase;
  try {
    supabase = createServerClient();
  } catch {
    return staticPages;
  }

  const { data: tracks } = await supabase
    .from("tracks")
    .select("slug, created_at")
    .eq("is_active", true);

  const trackPages: MetadataRoute.Sitemap = (tracks || []).map((track) => ({
    url: `${APP_URL}/track/${track.slug}`,
    lastModified: new Date(track.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, created_at")
    .eq("is_published", true)
    .eq("is_free", true);

  const lessonPages: MetadataRoute.Sitemap = (lessons || []).map((lesson) => ({
    url: `${APP_URL}/learn/${lesson.id}`,
    lastModified: new Date(lesson.created_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...trackPages, ...lessonPages];
}
