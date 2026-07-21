"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import SeasonProgress from "@/components/gamification/SeasonProgress";
import { supabase } from "@/lib/supabase";

export default function LeaderboardPage() {
  const [userRole, setUserRole] = useState<"free" | "pro" | "expert">("free");

  useEffect(() => {
    const loadRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setUserRole(profile?.role || "free");
    };

    void loadRole();
  }, []);

  return (
    <AppLayout userRole={userRole}>
      <main style={s.page}>
        <div style={s.header}>
          <Link href="/dashboard" style={s.back}>
            Back to dashboard
          </Link>
          <div>
            <h1 style={s.title}>Leaderboard</h1>
            <p style={s.sub}>Season ranks, weekly momentum, and all-time XP leaders.</p>
          </div>
        </div>

        <SeasonProgress />
      </main>
    </AppLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100%",
    background: "var(--bg-page, #fafafa)",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "28px 24px 60px",
    maxWidth: 760,
    margin: "0 auto",
  },
  header: { marginBottom: 24 },
  back: { fontSize: 13, color: "var(--text-muted, #888)", textDecoration: "none", display: "block", marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 750, letterSpacing: "-0.4px", margin: "0 0 4px", color: "var(--text-primary, #0a0a0a)" },
  sub: { fontSize: 13, color: "var(--text-muted, #888)", margin: 0 },
};
