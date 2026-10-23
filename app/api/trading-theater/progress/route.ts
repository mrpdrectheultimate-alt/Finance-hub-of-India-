import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const scenario_id = body.scenario_id || body.scenarioId;
    const steps_completed = body.steps_completed ?? body.completedSteps ?? 0;
    const checkpoints_correct = body.checkpoints_correct ?? body.checkpointsPassed ?? 0;
    const checkpoints_total = body.checkpoints_total ?? body.checkpointsTotal ?? 0;
    const is_completed = body.is_completed ?? body.isCompleted ?? false;
    const score_pct = body.score_pct ?? body.scorePct ?? 100;

    const supabase = createServerClient() as any;
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      user = data?.user ?? null;
    } else {
      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    }

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get scenario UUID from slug
    const { data: scenario } = await supabase
      .from("trading_scenarios")
      .select("id, xp_reward")
      .eq("slug", scenario_id)
      .maybeSingle();

    if (!scenario) return NextResponse.json({ error: "Scenario not found" }, { status: 404 });

    // Upsert progress in theater_progress
    const { error } = await supabase.from("theater_progress").upsert(
      {
        user_id: user.id,
        scenario_id: scenario.id,
        steps_completed: steps_completed || 0,
        checkpoints_correct: checkpoints_correct || 0,
        checkpoints_total: checkpoints_total || 0,
        is_completed: is_completed || false,
        score_pct: score_pct || 0,
        completed_at: is_completed ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,scenario_id" }
    );

    if (error) throw error;

    // Award XP if just completed
    if (is_completed) {
      const { data: existing } = await supabase
        .from("theater_progress")
        .select("xp_awarded")
        .eq("user_id", user.id)
        .eq("scenario_id", scenario.id)
        .single();

      if (!existing?.xp_awarded) {
        await supabase.rpc("complete_theater_scenario", {
          p_user_id: user.id,
          p_scenario_id: scenario.id,
          p_score: score_pct || 100,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Theater progress error:", err);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient() as any;
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      user = data?.user ?? null;
    } else {
      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    }

    if (!user) return NextResponse.json({ progress: [] });

    const { data } = await supabase
      .from("theater_progress")
      .select("*, trading_scenarios(slug, title)")
      .eq("user_id", user.id);

    return NextResponse.json({ progress: data || [] });
  } catch (err: any) {
    console.error("Theater progress GET error:", err);
    return NextResponse.json({ progress: [] });
  }
}
