// ============================================================
// FinanceHub — Page Metadata Exports
// outputs/page_metadata.ts
// Add these exports to the top of each page file
// Or create a metadata.ts file next to each page
// ============================================================

// ─── HOW TO USE ───────────────────────────────────────────────
// In each page file, add at the top (before the component):
//
//   import { seo } from "@/lib/seo";
//   export const metadata = seo.explore();  // or seo.pricing() etc.
//
// For dynamic pages (lesson, track, case study):
//
//   export async function generateMetadata({ params }) {
//     const lesson = await getLesson(params.slug);
//     return seo.lesson(lesson.title, lesson.slug, lesson.meta_description);
//   }
// ─────────────────────────────────────────────────────────────

export const PAGE_METADATA_SNIPPETS = {

  // app/page.tsx (landing)
  landing: `import { seo } from "@/lib/seo";
export const metadata = seo.home();`,

  // app/explore/page.tsx
  explore: `import { seo } from "@/lib/seo";
export const metadata = seo.explore();`,

  // app/login/page.tsx
  login: `import { seo } from "@/lib/seo";
export const metadata = seo.login();`,

  // app/signup/page.tsx
  signup: `import { seo } from "@/lib/seo";
export const metadata = seo.signup();`,

  // app/pricing/page.tsx
  pricing: `import { seo } from "@/lib/seo";
export const metadata = seo.pricing();`,

  // app/library/page.tsx
  library: `import { seo } from "@/lib/seo";
export const metadata = seo.library();`,

  // app/practice/page.tsx
  practice: `import { seo } from "@/lib/seo";
export const metadata = seo.practice();`,

  // app/practice/sip/page.tsx
  sip: `import { seo } from "@/lib/seo";
export const metadata = seo.sipCalculator();`,

  // app/practice/emi/page.tsx
  emi: `import { seo } from "@/lib/seo";
export const metadata = seo.emiCalculator();`,

  // app/ai-tutor/page.tsx
  aiTutor: `import { seo } from "@/lib/seo";
export const metadata = seo.aiTutor();`,

  // app/glossary/page.tsx
  glossary: `import { seo } from "@/lib/seo";
export const metadata = seo.glossary();`,

  // app/case-studies/page.tsx
  caseStudies: `import { seo } from "@/lib/seo";
export const metadata = seo.caseStudies();`,

  // app/leaderboard/page.tsx
  leaderboard: `import { seo } from "@/lib/seo";
export const metadata = seo.leaderboard();`,

  // app/certificates/page.tsx
  certificates: `import { seo } from "@/lib/seo";
export const metadata = seo.certificates();`,

  // app/sitemap-guide/page.tsx
  sitemapGuide: `import { seo } from "@/lib/seo";
export const metadata = seo.sitemap();`,

  // app/dashboard/page.tsx  (no-index)
  dashboard: `import { seo } from "@/lib/seo";
export const metadata = seo.dashboard();`,

  // app/learn/[slug]/page.tsx  (dynamic)
  lesson: `import { seo } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from("lessons")
    .select("title, meta_description, slug")
    .eq("slug", params.slug)
    .single();
  if (!data) return seo.explore();
  return seo.lesson(data.title, data.slug, data.meta_description || data.title);
}`,

  // app/tracks/[slug]/page.tsx  (dynamic)
  track: `import { seo } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from("tracks")
    .select("name, description, slug")
    .eq("slug", params.slug)
    .single();
  if (!data) return seo.explore();
  return seo.track(data.name, data.slug, data.description);
}`,

  // app/case-studies/[slug]/page.tsx  (dynamic)
  caseStudy: `import { seo } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from("case_studies")
    .select("title, subtitle, slug")
    .eq("slug", params.slug)
    .single();
  if (!data) return seo.caseStudies();
  return seo.caseStudy(data.title, data.slug, data.subtitle);
}`,

  // app/onboarding/page.tsx
  onboarding: `import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Find Your Finance Learning Path — FinanceHub",
  description: "Answer 3 questions. Get a personalised finance learning path matched to your goal and experience level.",
  path: "/onboarding",
  noIndex: true,
});`,

  // app/review/page.tsx
  review: `import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Daily Review — Spaced Repetition — FinanceHub",
  description: "5-minute daily review using spaced repetition. Keep finance concepts sharp without re-reading entire lessons.",
  path: "/review",
});`,

  // app/profile/page.tsx
  profile: `import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "My Profile — FinanceHub",
  path: "/profile",
  noIndex: true,
});`,

  // app/notes/page.tsx
  notes: `import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "My Notes — Digital Rough Book — FinanceHub",
  description: "Your personal finance notes. Cloud-synced, organised by lesson.",
  path: "/notes",
  noIndex: true,
});`,

  // app/knowledge-map/page.tsx
  knowledgeMap: `import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Finance Knowledge Map — FinanceHub",
  description: "Visual graph of how 100+ finance concepts connect. Click any concept to explore.",
  path: "/knowledge-map",
});`,

  // app/settings/page.tsx
  settings: `import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Settings — FinanceHub",
  path: "/settings",
  noIndex: true,
});`,

  // app/legal/terms/page.tsx
  terms: `import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Terms of Service — FinanceHub",
  path: "/legal/terms",
});`,

  // app/legal/privacy/page.tsx
  privacy: `import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Privacy Policy — FinanceHub",
  path: "/legal/privacy",
});`,

  // app/legal/refund/page.tsx
  refund: `import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Refund Policy — FinanceHub",
  path: "/legal/refund",
});`,

  // app/legal/disclaimer/page.tsx
  disclaimer: `import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Disclaimer — FinanceHub",
  path: "/legal/disclaimer",
});`,

  // app/legal/cookies/page.tsx
  cookies: `import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Cookie Policy — FinanceHub",
  path: "/legal/cookies",
});`,

  // app/verify/[id]/page.tsx  (dynamic — verifiable certificates)
  verify: `import { buildMetadata } from "@/lib/seo";
export async function generateMetadata({ params }: { params: { id: string } }) {
  return buildMetadata({
    title: \`Verify Certificate \${params.id} — FinanceHub\`,
    description: "Verify this FinanceHub certificate is authentic.",
    path: \`/verify/\${params.id}\`,
  });
}`,
};

export const CORRECT_IMPORT_PATHS = {
  VideoPlayer: `import VideoPlayer from "@/components/ui/VideoPlayer";`,
};

export const LAYOUT_ADDITIONS = `
import { PostHogProvider, PostHogPageView } from "@/components/analytics/PostHogProvider";
import { organizationStructuredData }       from "@/lib/seo";
`;
