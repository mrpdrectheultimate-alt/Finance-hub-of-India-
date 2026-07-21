import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeUUID } from "@/lib/security";
import { rateLimitMemory } from "@/lib/rate-limit";

type DownloadLesson = {
  title: string;
  content_mdx: string | null;
  duration_minutes: number | null;
  is_free: boolean;
  level: { title?: string; track?: { title?: string; icon?: string } } | null;
};

export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const rl = rateLimitMemory({ key: `pdf:${user!.id}`, limit: 20, windowSecs: 3600 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many downloads. Try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const lessonId = sanitizeUUID(body.lessonId);
    if (!lessonId) {
      return NextResponse.json({ error: "lessonId required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data: lesson, error: lessonErr } = await supabase
      .from("lessons")
      .select("*, level:levels(title, track:tracks(title, slug, icon))")
      .eq("id", lessonId)
      .eq("is_published", true)
      .single();

    if (lessonErr || !lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
    const typedLesson = lesson as DownloadLesson;

    if (!typedLesson.is_free && profile?.role === "free") {
      return NextResponse.json({ error: "Pro plan required to download this lesson" }, { status: 403 });
    }

    const rawContent = typedLesson.content_mdx || "";
    const cleanContent = stripMarkdown(rawContent);
    const headings = rawContent.match(/^#{2}\s+.+/gm)?.map((heading) => heading.replace(/^#{2}\s+/, "")) || [];
    const level = typedLesson.level;
    const trackTitle = level?.track?.title || "Finance";
    const levelTitle = level?.title || "";

    const downloadText = buildLessonDownload({
      title: typedLesson.title,
      duration: typedLesson.duration_minutes,
      trackTitle,
      levelTitle,
      headings,
      content: cleanContent,
    });

    await supabase.from("user_downloads" as never).upsert(
      { user_id: user!.id, lesson_id: lessonId, file_type: "pdf" } as never,
      { onConflict: "user_id,lesson_id,file_type" },
    );

    const safeTitle = typedLesson.title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_").slice(0, 50);

    return new Response(downloadText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="FinanceHub_${safeTitle}.txt"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Lesson download error:", err);
    return NextResponse.json({ error: "Failed to generate download" }, { status: 500 });
  }
}

function stripMarkdown(value: string) {
  return value
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`{1,3}([\s\S]*?)`{1,3}/g, "$1")
    .replace(/>\s*/gm, "")
    .replace(/^[-*+]\s+/gm, "- ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/---+/g, "------------------------------------------------------------")
    .trim();
}

function buildLessonDownload(input: {
  title: string;
  duration?: number | null;
  trackTitle: string;
  levelTitle: string;
  headings: string[];
  content: string;
}) {
  const toc = input.headings.length
    ? input.headings.map((heading, index) => `${index + 1}. ${heading}`).join("\n")
    : "Full lesson content";

  const keyTakeaways = input.headings.length
    ? input.headings.slice(0, 7).map((heading, index) => `${index + 1}. ${heading}`).join("\n")
    : "Review the lesson above for key concepts.";

  return `
FINANCEHUB
World-Class Finance Education Platform

Track: ${input.trackTitle}
Level: ${input.levelTitle}
Lesson: ${input.title}
${input.duration ? `Estimated reading time: ${input.duration} minutes` : ""}
Downloaded: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}

------------------------------------------------------------
TABLE OF CONTENTS
${toc}

------------------------------------------------------------
LESSON CONTENT

${input.content}

------------------------------------------------------------
KEY TAKEAWAYS
${keyTakeaways}

------------------------------------------------------------
REVISION NOTES
[ ] I understand the main concept of this lesson
[ ] I can explain this topic to someone else
[ ] I have completed the quiz for this lesson
[ ] I have practised in the Finance Labs

QUESTIONS I STILL HAVE:
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

------------------------------------------------------------
IMPORTANT DISCLAIMER

This material is for educational purposes only and does not
constitute financial advice, investment advice, or any other
form of professional financial service.

Always consult a SEBI-registered financial advisor or CA
before making investment, tax, or financial decisions.

Continue learning at: financehub.in
Personal study use only. Not for redistribution or commercial use.
`.trim();
}
