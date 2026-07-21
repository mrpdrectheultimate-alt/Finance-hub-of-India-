import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-webhook-secret");
    if (!process.env.SUPABASE_WEBHOOK_SECRET || secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const user = body?.record;

    if (!user?.id || !user?.email) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    await fetch(`${appUrl}/api/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.INTERNAL_SECRET || "",
      },
      body: JSON.stringify({
        type: "welcome",
        userId: user.id,
        data: { name: profile?.full_name || "there" },
      }),
    });

    const { data: badge } = await supabase.from("badges").select("id").eq("slug", "early-bird").single();
    if (badge) {
      await supabase.from("user_badges").upsert({ user_id: user.id, badge_id: badge.id });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signup webhook failed";
    console.error("Signup webhook error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
