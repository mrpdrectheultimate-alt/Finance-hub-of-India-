import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// ============================================================
// FinanceHub — Theme Preference API Route
// app/api/settings/theme/route.ts
// Persists active theme mode to Supabase profile
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const { theme } = await req.json();
    if (!["light", "dark", "sepia", "focus"].includes(theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: true }); // anonymous — gracefully return ok
    }

    await supabase.from("profiles").update({ theme }).eq("id", user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never fail client theme save
  }
}

