import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeUUID } from "@/lib/security";

// GET /api/notes/[id] - Get specific note
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const noteId = sanitizeUUID(params.id);
    if (!noteId) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("user_notes" as never)
      .select("*")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ note: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/notes/[id] - Update a note (auto-save support)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const noteId = sanitizeUUID(params.id);
    if (!noteId) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const body = await req.json();
    const allowedFields = [
      "title",
      "content",
      "content_html",
      "note_type",
      "tags",
      "color",
      "is_pinned",
      "is_archived",
      "lesson_id",
      "lesson_title",
      "track_slug",
      "track_icon",
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("user_notes" as never)
      .update(updates as never)
      .eq("id", noteId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: (error as any).message }, { status: 500 });
    }

    return NextResponse.json({ note: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const noteId = sanitizeUUID(params.id);
    if (!noteId) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from("user_notes" as never)
      .delete()
      .eq("id", noteId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: (error as any).message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
