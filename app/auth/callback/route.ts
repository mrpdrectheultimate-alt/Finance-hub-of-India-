import { NextRequest, NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/url";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = getRequestOrigin(req);
  const { searchParams } = new URL(req.url);

  // Forward to /api/auth/callback preserving all query params (code, state, next, error)
  const forwardUrl = new URL(`${origin}/api/auth/callback`);
  searchParams.forEach((value, key) => {
    forwardUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(forwardUrl);
}
