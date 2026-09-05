import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/security";

// GET /api/notes/summary - Aggregate dashboard summary
export async function GET(req: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase.rpc("get_notes_summary" as never, {
      p_user_id: user.id,
    } as never);

    if (error) {
      return NextResponse.json({ error: (error as any).message }, { status: 500 });
    }

    return NextResponse.json({ summary: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
