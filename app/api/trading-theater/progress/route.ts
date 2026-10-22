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
  scorePct?: number;
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

    const serviceClient = createServiceClient() as any;

    // 1. First check official theater_progress table joined with trading_scenarios
    try {
      const { data: tpData, error: tpError } = await serviceClient
        .from("theater_progress")
        .select(`
          id,
          user_id,
          scenario_id,
          steps_completed,
          checkpoints_correct,
          checkpoints_total,
          is_completed,
          score_pct,
          completed_at,
          trading_scenarios (
            id,
            slug,
            title
          )
        `)
        .eq("user_id", user.id);

      if (!tpError && Array.isArray(tpData) && tpData.length > 0) {
        const progressList = tpData.map((item: any) => ({
          scenario_id: item.trading_scenarios?.slug || item.scenario_id,
          completed_steps: item.steps_completed || 0,
          checkpoints_passed: item.checkpoints_correct || 0,
          checkpoints_total: item.checkpoints_total || 0,
          is_completed: Boolean(item.is_completed),
          score_pct: item.score_pct || 100,
          completed_at: item.completed_at,
        }));

        return NextResponse.json({
          success: true,
          authenticated: true,
          progress: progressList,
          tableReady: true,
          schema: "theater_progress",
        });
      }
    } catch {
      // Fallback
    }

    // 2. Check user_trading_progress fallback table
    try {
      const { data: utpData, error: utpError } = await serviceClient
        .from("user_trading_progress")
        .select("*")
        .eq("user_id", user.id);

      if (!utpError && Array.isArray(utpData) && utpData.length > 0) {
        const progressList = utpData.map((item: any) => ({
          scenario_id: item.scenario_id,
          completed_steps: item.completed_steps || 0,
          checkpoints_passed: item.checkpoints_passed || 0,
          checkpoints_total: item.checkpoints_total || 0,
          is_completed: Boolean(item.is_completed),
          score_pct: 100,
          completed_at: item.completed_at,
        }));

        return NextResponse.json({
          success: true,
          authenticated: true,
          progress: progressList,
          tableReady: true,
          schema: "user_trading_progress",
        });
      }
    } catch {
      // Fallback
    }

    // Default empty when user has not completed any scenarios yet
    return NextResponse.json({
      success: true,
      authenticated: true,
      progress: [],
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
      scorePct = 100,
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
    let savedToTheaterProgress = false;
    let rpcResponse = null;

    // 1. Try resolving scenario UUID from trading_scenarios
    try {
      const { data: scData } = await serviceClient
        .from("trading_scenarios")
        .select("id, xp_reward, title")
        .eq("slug", scenarioId)
        .maybeSingle();

      if (scData?.id) {
        // If completed, invoke complete_theater_scenario RPC
        if (isCompleted) {
          try {
            const { data: rpcData } = await serviceClient.rpc(
              "complete_theater_scenario",
              {
                p_user_id: user.id,
                p_scenario_id: scData.id,
                p_score: scorePct,
              }
            );
            rpcResponse = rpcData;
            savedToTheaterProgress = true;
          } catch {
            // Fallback to direct upsert
          }
        }

        // Direct upsert to theater_progress
        const { error: tpErr } = await serviceClient
          .from("theater_progress")
          .upsert(
            {
              user_id: user.id,
              scenario_id: scData.id,
              steps_completed: completedSteps,
              checkpoints_correct: checkpointsPassed,
              checkpoints_total: checkpointsTotal,
              is_completed: isCompleted,
              score_pct: scorePct,
              completed_at: isCompleted ? new Date().toISOString() : null,
            },
            { onConflict: "user_id,scenario_id" }
          );

        if (!tpErr) {
          savedToTheaterProgress = true;
        }
      }
    } catch {
      // Ignore and proceed to fallback
    }

    // 2. Also save to user_trading_progress for backwards compatibility
    try {
      await serviceClient
        .from("user_trading_progress")
        .upsert(
          {
            user_id: user.id,
            scenario_id: scenarioId,
            completed_steps: completedSteps,
            total_steps: totalSteps,
            checkpoints_passed: checkpointsPassed,
            checkpoints_total: checkpointsTotal,
            is_completed: isCompleted,
            last_step_index: lastStepIndex,
            quiz_answers: quizAnswers,
            completed_at: isCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,scenario_id" }
        );
    } catch {
      // Non-fatal
    }

    // 3. Award XP directly to profiles if newly completed and RPC wasn't executed
    let xpAwarded = isCompleted ? 50 : 0;
    if (isCompleted && !rpcResponse) {
      try {
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
        // Non-fatal
      }
    }

    return NextResponse.json({
      success: true,
      scenarioId,
      isCompleted,
      xpAwarded,
      savedToTheaterProgress,
      rpcResponse,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
