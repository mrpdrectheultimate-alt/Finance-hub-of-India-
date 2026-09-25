import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await req.json();
    const { user_id, target_type, target_id } = body;

    if (!user_id || !target_type || !target_id) {
      return NextResponse.json(
        { error: "Missing required fields (user_id, target_type, target_id)" },
        { status: 400 }
      );
    }

    if (target_type !== "question" && target_type !== "answer") {
      return NextResponse.json(
        { error: "Invalid target_type. Must be 'question' or 'answer'" },
        { status: 400 }
      );
    }

    // Call stored procedure RPC function `toggle_upvote`
    const { data, error } = await supabase.rpc("toggle_upvote", {
      p_user_id: user_id,
      p_type: target_type,
      p_target_id: target_id,
    });

    if (error) {
      console.error("[Vote API RPC Error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, result: data });
  } catch (err: any) {
    console.error("[Vote API Exception]:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
