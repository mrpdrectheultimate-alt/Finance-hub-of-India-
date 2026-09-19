// ============================================================
// FinanceHub — Global Search API
// app/api/search/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { applyRateLimit, getClientIp } from "@/lib/rate-limit";

// Hardcoded simulators (they don't live in DB)
const SIMULATORS = [
  { name: "SIP Calculator", url: "/practice/sip", keywords: ["sip", "systematic", "invest", "mutual fund", "compounding", "monthly"] },
  { name: "EMI Calculator", url: "/practice/emi", keywords: ["emi", "loan", "home loan", "car loan", "interest", "repay"] },
  { name: "Tax Calculator", url: "/practice/tax", keywords: ["tax", "income tax", "itr", "regime", "old new", "slab"] },
  { name: "Retirement Planner", url: "/practice/retirement", keywords: ["retire", "retirement", "corpus", "fire", "pension", "60"] },
  { name: "Budget Planner", url: "/practice/budget", keywords: ["budget", "expense", "spending", "50 30 20", "plan"] },
  { name: "Startup Cash Flow", url: "/practice/startup-cash-flow", keywords: ["startup", "runway", "burn rate", "cashflow", "founder"] },
  { name: "Crypto Paper Trading", url: "/practice/crypto", keywords: ["crypto", "bitcoin", "ethereum", "paper trading", "virtual"] },
  { name: "Forex Paper Trading", url: "/practice/trading", keywords: ["forex", "currency", "usd inr", "paper trading", "fx"] },
  { name: "Compound Interest", url: "/practice/sip", keywords: ["compound interest", "power of compounding", "interest"] },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim().toLowerCase() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "8", 10), 20);

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [], query: "" });
  }

  const clientIp = getClientIp(req);
  const rl = applyRateLimit(
    { key: `search:${clientIp}`, limit: 60, windowSecs: 60 },
    "Too many search requests."
  );
  if (!rl.allowed && rl.response) return rl.response as NextResponse;

  const supabase = createServerClient();

  // Run searches in parallel
  const [lessonsRes, videosRes] = await Promise.all([
    // Lessons — title + slug full-text
    supabase
      .from("lessons")
      .select(`
        id, title, slug, duration_minutes, is_free, order_index,
        level:levels(title, slug, track:tracks(title, slug, color_hex))
      `)
      .or(`title.ilike.%${query}%,slug.ilike.%${query.replace(/ /g, "-")}%`)
      .eq("is_published", true)
      .limit(limit),

    // Videos
    supabase
      .from("curated_playlists")
      .select("id, title, channel_name, embed_id, video_type, category")
      .or(`title.ilike.%${query}%,channel_name.ilike.%${query}%,category.ilike.%${query}%`)
      .eq("is_published", true)
      .limit(4),
  ]);

  // Match simulators
  const matchedSimulators = SIMULATORS.filter(
    (s) =>
      s.keywords.some((k) => k.includes(query) || query.includes(k)) ||
      s.name.toLowerCase().includes(query)
  ).slice(0, 3);

  const formattedLessons = ((lessonsRes.data || []) as any[]).map((l: any) => ({
    type: "lesson",
    id: l.id,
    title: l.title,
    slug: l.slug,
    url: `/learn/${l.id}`,
    meta: `${l.level?.track?.title || "Track"} · ${l.duration_minutes} min · ${l.is_free ? "Free" : "Pro"}`,
    color: l.level?.track?.color_hex || "#0E6163",
    icon: "📖",
  }));

  const formattedVideos = ((videosRes.data || []) as any[]).map((v: any) => ({
    type: "video",
    id: v.id,
    title: v.title,
    url: `/library?v=${v.id}`,
    meta: `${v.channel_name || "FinanceHub"} · ${v.video_type === "playlist" ? "Playlist" : "Video"}`,
    icon: "▶",
  }));

  const formattedSimulators = matchedSimulators.map((s) => ({
    type: "simulator",
    title: s.name,
    url: s.url,
    meta: "Interactive simulator",
    icon: "🧮",
  }));

  const totalCount = formattedLessons.length + formattedVideos.length + formattedSimulators.length;

  return NextResponse.json({
    lessons: formattedLessons,
    videos: formattedVideos,
    simulators: formattedSimulators,
    query,
    total: totalCount,
  });
}
