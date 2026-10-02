"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";
import Link from "next/link";

export default function KnowledgeMapPage() {

  // Dynamically import to avoid SSR issues with SVG

  const [KG, setKG] = useState<any>(null);

  useEffect(() => {

    import("@/components/learn/KnowledgeGraph").then(m => setKG(() => m.default));

  }, []);



  return (

    <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px 80px", fontFamily:"var(--font-ui,system-ui)" }}>

      <div style={{ marginBottom:24 }}>

        <h1 style={{ fontSize:26, fontWeight:800, color:"#1c2b3a", margin:"0 0 6px", letterSpacing:"-0.4px" }}>

          🗺️ Finance Knowledge Map

        </h1>

        <p style={{ fontSize:14, color:"#718096", margin:0 }}>

          See how every finance concept connects. Click a node to explore. Drag to pan, scroll to zoom.

        </p>

      </div>

      {KG ? <KG height={620} showLegend /> : (

        <div style={{ height:620, background:"#f8f9fa", borderRadius:14, border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", color:"#718096" }}>

          Loading knowledge graph…

        </div>

      )}

    </div>

  );

}



// ─────────────────────────────────────────────────────────────
