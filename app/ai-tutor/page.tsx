"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import AIMentor from "@/components/ai/AIMentor";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — AI Finance Mentor Page
// app/ai-tutor/page.tsx
// Frontier-grade interactive financial learning companion
// ============================================================

export default function AITutorPage() {
  const [profileRole, setProfileRole] = useState("free");

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select("role, subscription_tier")
          .eq("id", user.id)
          .single();

        if (data) {
          const p = data as any;
          setProfileRole(p.subscription_tier || p.role || "free");
        }
      } catch (err) {
        console.error("Error fetching profile role for AI Tutor:", err);
      }
    })();
  }, []);

  return (
    <AppLayout userRole={profileRole}>
      <div style={{ width: "100%", height: "calc(100vh - 54px)", overflow: "hidden", background: "#FFFFFF" }}>
        <AIMentor />
      </div>
    </AppLayout>
  );
}
