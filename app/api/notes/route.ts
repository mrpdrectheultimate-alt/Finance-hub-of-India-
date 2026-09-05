import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeString, sanitizeUUID } from "@/lib/security";
import { applyRateLimit } from "@/lib/rate-limit";

// ─── GET: fetch notes (all / by lesson / search) ──────────────
export async function GET(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const lessonId  = searchParams.get("lessonId") || searchParams.get("lesson_id");
  const search    = searchParams.get("search")?.trim().slice(0, 100) || "";
  const tag       = searchParams.get("tag")?.trim().slice(0, 50)    || "";
  const pinned    = searchParams.get("pinned") === "true";
  const archived  = searchParams.get("archived") === "true";
  const noteType  = searchParams.get("type")  || "";
  const limit     = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset    = parseInt(searchParams.get("offset") || "0");

  const supabase = createServerClient();

  let q = supabase
    .from("user_notes" as never)
    .select("*", { count: "exact" })
    .eq("user_id", user!.id)
    .eq("is_archived", archived)
    .order("is_pinned", { ascending: false })
    .order("updated_at",  { ascending: false })
    .range(offset, offset + limit - 1);

  if (lessonId) q = q.eq("lesson_id", lessonId);
  if (pinned)   q = q.eq("is_pinned", true);
  if (noteType) q = q.eq("note_type", noteType);
  if (search)   q = q.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  if (tag)      q = q.contains("tags", [tag]);

  const { data, error, count } = await q;
  if (error) return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });

  return NextResponse.json({ notes: data, total: count });
}

// ─── POST: create note ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const rl = applyRateLimit({ key: `notes:${user!.id}`, limit: 60, windowSecs: 60 },
    "Too many note operations. Please slow down.");
  if (!rl.allowed) return rl.response!;

  try {
    const body = await req.json();

    const title       = sanitizeString(body.title || "Untitled note", 200);
    const content     = sanitizeString(body.content || "", 50000);
    const noteType    = ["general","lesson","video","concept","formula","quiz","todo"]
                          .includes(body.note_type) ? body.note_type : "general";
    const color       = ["yellow","blue","green","pink","purple","orange","white"]
                          .includes(body.color) ? body.color : "yellow";
    const tags        = Array.isArray(body.tags)
                          ? body.tags.map((t: any) => sanitizeString(String(t), 30)).slice(0, 10)
                          : [];
    const lessonId    = sanitizeUUID(body.lesson_id || body.lessonId);
    const lessonTitle = sanitizeString(body.lesson_title || body.lessonTitle || "", 200);
    const trackSlug   = sanitizeString(body.track_slug   || body.trackSlug || "", 80);
    const trackIcon   = sanitizeString(body.track_icon   || body.trackIcon || "", 10);

    const supabase = createServerClient();
    const { data, error } = await supabase.from("user_notes" as never).insert({
      user_id:      user!.id,
      title, content, note_type: noteType, color, tags,
      lesson_id:    lessonId    || null,
      lesson_title: lessonTitle || null,
      track_slug:   trackSlug   || null,
      track_icon:   trackIcon   || null,
    } as never).select().single();

    if (error) return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
    return NextResponse.json({ note: data }, { status: 201 });

  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// ─── PATCH: update note ────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  try {
    const body   = await req.json();
    const noteId = sanitizeUUID(body.id);
    if (!noteId) return NextResponse.json({ error: "Note ID required" }, { status: 400 });

    const updates: Record<string, any> = {};

    if (body.title     !== undefined) updates.title     = sanitizeString(body.title, 200);
    if (body.content   !== undefined) updates.content   = sanitizeString(body.content, 50000);
    if (body.note_type !== undefined &&
        ["general","lesson","video","concept","formula","quiz","todo"].includes(body.note_type))
                                      updates.note_type = body.note_type;
    if (body.color !== undefined &&
        ["yellow","blue","green","pink","purple","orange","white"].includes(body.color))
                                      updates.color     = body.color;
    if (body.tags     !== undefined)  updates.tags      = Array.isArray(body.tags)
      ? body.tags.map((t: any) => sanitizeString(String(t), 30)).slice(0, 10) : [];
    if (body.is_pinned  !== undefined) updates.is_pinned  = Boolean(body.is_pinned);
    if (body.is_archived !== undefined) updates.is_archived = Boolean(body.is_archived);

    if (Object.keys(updates).length === 0)
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

    const supabase = createServerClient();
    const { data, error } = await supabase.from("user_notes" as never)
      .update(updates as never)
      .eq("id", noteId)
      .eq("user_id", user!.id)
      .select().single();

    if (error) return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
    return NextResponse.json({ note: data });

  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// ─── DELETE: delete note ───────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const { user, error: authErr } = await requireAuth(req);
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const noteId = sanitizeUUID(searchParams.get("id"));
  if (!noteId) return NextResponse.json({ error: "Note ID required" }, { status: 400 });

  const supabase = createServerClient();
  const { error } = await supabase.from("user_notes" as never)
    .delete()
    .eq("id", noteId)
    .eq("user_id", user!.id);

  if (error) return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  return NextResponse.json({ success: true });
}
