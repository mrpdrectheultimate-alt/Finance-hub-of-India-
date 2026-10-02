"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";
import Link from "next/link";

export default function AITutorPage() {

  const [AIM, setAIM] = useState<any>(null);

  useEffect(() => {

    import("@/components/ai/AIMentor").then(m => setAIM(() => m.default));

  }, []);



  return (

    <div style={{ maxWidth:760, margin:"0 auto", padding:"24px 20px 0", fontFamily:"var(--font-ui,system-ui)" }}>

      <div style={{ marginBottom:16 }}>

        <h1 style={{ fontSize:22, fontWeight:800, color:"#1c2b3a", margin:"0 0 4px" }}>🤖 AI Finance Mentor</h1>

        <p style={{ fontSize:13, color:"#718096", margin:0 }}>Ask anything about finance — India-specific, source-cited, personalised to your learning history.</p>

      </div>

      {AIM ? (

        <AIM />

      ) : (

        <div style={{ height:500, background:"#f8f9fa", borderRadius:14, border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", color:"#718096" }}>

          Loading AI Mentor…

        </div>

      )}

    </div>

  );

}



// ─────────────────────────────────────────────────────────────
