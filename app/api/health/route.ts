// ============================================================
// FinanceHub — System Health & Readiness API
// app/api/health/route.ts
// Standard probe for uptime monitors, Kubernetes/Vercel probes
// ============================================================

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "connected";
  let dbLatencyMs = 0;
  let healthy = true;

  try {
    const supabase = createServerClient();
    const dbStart = Date.now();
    
    // Quick probe to verify database connectivity and read access
    const { error } = await supabase
      .from("tracks")
      .select("id")
      .limit(1);

    dbLatencyMs = Date.now() - dbStart;

    if (error) {
      dbStatus = `error: ${error.message}`;
      healthy = false;
    }
  } catch (err: any) {
    dbStatus = `unreachable: ${err?.message || "connection timeout"}`;
    healthy = false;
  }

  const payload = {
    status: healthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    latencyMs: Date.now() - startTime,
    services: {
      api: "operational",
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    },
    version: "1.0.0",
    environment: process.env.NODE_ENV || "production",
  };

  return NextResponse.json(payload, {
    status: healthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
