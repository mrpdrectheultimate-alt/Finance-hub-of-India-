import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface ProgressPayload {
  scenarioId: string;
  completedSteps?: number;
  totalSteps?: number;
  checkpointsPassed?: number;
  checkpointsTotal?: number;
  isCompleted?: boolean;
  lastStepIndex?: number;
  quizAnswers?: Record<string, number>;
}

// ── GET: Fetch user's trading progress ─────────────────────────
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();

    // Check auth from cookie or Bearer token
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

    if (!user) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        progress: [],
      });
    }

    // Use service client with any-cast for newly introduced tables
    const serviceClient = createServiceClient() as any;
    const { data, error } = await serviceClient
      .from("user_trading_progress")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      // Table may not have been migrated yet in Supabase SQL editor
      return NextResponse.json({
        success: true,
        authenticated: true,
        progress: [],
        tableReady: false,
        notice: "Table user_trading_progress pending SQL execution in Supabase",
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      progress: data || [],
      tableReady: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// ── POST: Record/Upsert trading scenario progress ───────────────
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProgressPayload;
    const {
      scenarioId,
      completedSteps = 0,
      totalSteps = 1,
      checkpointsPassed = 0,
      checkpointsTotal = 0,
      isCompleted = false,
      lastStepIndex = 0,
      quizAnswers = {},
    } = body;

    if (!scenarioId || typeof scenarioId !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing scenarioId" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
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

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          authenticated: false,
        },
        { status: 401 }
      );
    }

    const serviceClient = createServiceClient() as any;

    // Check if previously completed before upserting
    let newlyCompleted = false;
    if (isCompleted) {
      const { data: existing } = await serviceClient
        .from("user_trading_progress")
        .select("is_completed")
        .eq("user_id", user.id)
        .eq("scenario_id", scenarioId)
        .maybeSingle();

      if (!existing || !existing.is_completed) {
        newlyCompleted = true;
      }
    }

    const upsertData: Record<string, unknown> = {
      user_id: user.id,
      scenario_id: scenarioId,
      completed_steps: completedSteps,
      total_steps: totalSteps,
      checkpoints_passed: checkpointsPassed,
      checkpoints_total: checkpointsTotal,
      is_completed: isCompleted,
      last_step_index: lastStepIndex,
      quiz_answers: quizAnswers,
      updated_at: new Date().toISOString(),
    };

    if (isCompleted) {
      upsertData.completed_at = new Date().toISOString();
    }

    const { error: upsertError } = await serviceClient
      .from("user_trading_progress")
      .upsert(upsertData, { onConflict: "user_id,scenario_id" });

    if (upsertError) {
      return NextResponse.json({
        success: true,
        localOnly: true,
        notice: "Table user_trading_progress pending in Supabase. Progress saved locally.",
      });
    }

    // Award XP if newly completed
    let xpAwarded = 0;
    if (newlyCompleted) {
      try {
        xpAwarded = 40; // 40 XP per completed scenario
        const { data: profile } = await serviceClient
          .from("profiles")
          .select("xp_total")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          await serviceClient
            .from("profiles")
            .update({
              xp_total: (profile.xp_total || 0) + xpAwarded,
              last_activity_date: new Date().toISOString().split("T")[0],
            })
            .eq("id", user.id);
        }
      } catch {
        // XP award is non-fatal
      }
    }

    return NextResponse.json({
      success: true,
      scenarioId,
      isCompleted,
      xpAwarded,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
