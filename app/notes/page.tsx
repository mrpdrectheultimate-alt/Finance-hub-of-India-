"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";
import Link from "next/link";

export default function NotesPage() {

  const [RB, setRB] = useState<any>(null);

  useEffect(() => {

    import("@/components/notes/RoughBook").then(m => setRB(() => m.default)).catch(() => {});

  }, []);



  return (

    <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 20px 80px", fontFamily:"var(--font-ui,system-ui)" }}>

      <div style={{ marginBottom:24 }}>

        <h1 style={{ fontSize:26, fontWeight:800, color:"#1c2b3a", margin:"0 0 6px", letterSpacing:"-0.4px" }}>

          📝 Digital Rough Book

        </h1>

        <p style={{ fontSize:14, color:"#718096", margin:0 }}>

          Your personal finance notes — organised by lesson, tagged and cloud-synced.

        </p>

      </div>

      {RB ? <RB /> : (

        <div style={{ padding:40, textAlign:"center", color:"#718096", background:"#f8f9fa", borderRadius:14, border:"1px solid #e2e8f0" }}>

          Loading your notes…

        </div>

      )}

    </div>

  );

}



// ─────────────────────────────────────────────────────────────
