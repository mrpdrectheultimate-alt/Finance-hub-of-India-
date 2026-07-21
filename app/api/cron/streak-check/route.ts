import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  let emailsSent = 0;
  let streaksReset = 0;

  try {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const { data: brokenStreaks } = await supabase
      .from("profiles")
      .select("id, streak_current")
      .lt("last_active_date", yesterday)
      .gt("streak_current", 0);

    if (brokenStreaks && brokenStreaks.length > 0) {
      const ids = brokenStreaks.map((user) => user.id);
      await supabase
        .from("profiles")
        .update({ streak_current: 0 })
        .in("id", ids);
      streaksReset = brokenStreaks.length;
    }

    const { data: atRiskUsers } = await supabase
      .from("profiles")
      .select("id, full_name, streak_current")
      .eq("last_active_date", yesterday)
      .gt("streak_current", 2);

    if (atRiskUsers && atRiskUsers.length > 0) {
      for (const user of atRiskUsers.slice(0, 500)) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": process.env.INTERNAL_SECRET || "",
            },
            body: JSON.stringify({
              type: "streak_reminder",
              userId: user.id,
              data: { streakDays: user.streak_current },
            }),
          });
          emailsSent += 1;
        } catch (error) {
          console.error(`Failed to send streak email to ${user.id}:`, error);
        }
      }
    }

    console.log(`Streak cron: reset=${streaksReset}, emails=${emailsSent}`);
    return NextResponse.json({
      success: true,
      streaksReset,
      emailsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Streak cron failed";
    console.error("Streak cron error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
