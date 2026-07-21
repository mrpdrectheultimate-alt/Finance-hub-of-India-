import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitMemory } from "@/lib/rate-limit";
import { requireAuth, sanitizeString } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const rateLimit = rateLimitMemory({ key: `cert:${user!.id}`, limit: 10, windowSecs: 3600 });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many certificate requests. Try again later." }, { status: 429 });
  }

  try {
    const body = (await req.json()) as { trackSlug?: unknown };
    const trackSlug = sanitizeString(body.trackSlug, 50);
    if (!trackSlug) return NextResponse.json({ error: "trackSlug required" }, { status: 400 });

    const supabase = createServerClient();
    const [{ data: profile }, { data: track }] = await Promise.all([
      supabase.from("profiles").select("full_name, role").eq("id", user!.id).single(),
      supabase.from("tracks").select("id, title").eq("slug", trackSlug).single(),
    ]);

    if (!profile || !track) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (profile.role === "free") {
      return NextResponse.json({ error: "Certificates require Pro or Expert plan" }, { status: 403 });
    }

    const { data: levels } = await supabase.from("levels").select("id").eq("track_id", track.id);
    const levelIds = levels?.map((level) => level.id) || [];

    const { data: allLessons } = levelIds.length
      ? await supabase.from("lessons").select("id").in("level_id", levelIds).eq("is_published", true)
      : { data: [] };

    const { data: completed } = await supabase.from("user_progress").select("lesson_id").eq("user_id", user!.id);
    const completedIds = new Set(completed?.map((item) => item.lesson_id) || []);
    const allComplete = allLessons?.every((lesson) => completedIds.has(lesson.id));

    if (!allComplete && allLessons && allLessons.length > 0) {
      return NextResponse.json(
        {
          error: "Complete all lessons in this track first",
          completedCount: allLessons.filter((lesson) => completedIds.has(lesson.id)).length,
          totalCount: allLessons.length,
        },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const certData = {
      recipientName: profile.full_name || "Learner",
      trackTitle: track.title,
      issueDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      certificateId: `FH-${Date.now().toString(36).toUpperCase()}`,
      verifyUrl: `${appUrl}/verify`,
    };

    await supabase.from("user_xp_log").insert({
      user_id: user!.id,
      xp_amount: 0,
      reason: `certificate_issued:${trackSlug}`,
    });

    return NextResponse.json({ certData });
  } catch (error) {
    console.error("Certificate error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Certificate generation failed" }, { status: 500 });
  }
}
