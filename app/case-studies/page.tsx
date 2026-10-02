"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";
import Link from "next/link";

export default function CaseStudiesPage() {

  const [cases,   setCases]   = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [filter,  setFilter]  = useState("all");



  useEffect(() => {

    supabase.from("case_studies").select("id,title,slug,subtitle,category,difficulty,protagonist,key_lesson,duration_minutes,is_free,tags").eq("is_published",true).order("created_at",{ascending:false})

      .then(({data}) => { setCases(data||[]); setLoading(false); });

  }, []);



  const cats = ["all", ...Array.from(new Set(cases.map(c => c.category)))];

  const filtered = filter==="all" ? cases : cases.filter(c => c.category===filter);



  const DIFF_COLOR: Record<string,string> = { beginner:"#1D9E75", intermediate:"#D4A017", advanced:"#E53E3E" };



  return (

    <div style={{ maxWidth:860, margin:"0 auto", padding:"24px 20px 80px", fontFamily:"var(--font-ui,system-ui)" }}>

      <div style={{ marginBottom:24 }}>

        <h1 style={{ fontSize:26, fontWeight:800, color:"#1c2b3a", margin:"0 0 6px", letterSpacing:"-0.4px" }}>📋 Case Studies</h1>

        <p style={{ fontSize:14, color:"#718096", margin:0 }}>Real Indian stories. Real financial decisions. Real lessons.</p>

      </div>



      {/* Filter */}

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>

        {cats.map(c => (

          <button key={c} onClick={()=>setFilter(c)}

            style={{ padding:"7px 14px", fontSize:12, fontWeight:filter===c?700:400, background:filter===c?"#0E6163":"#fff", color:filter===c?"#fff":"#718096", border:`1px solid ${filter===c?"#0E6163":"#e2e8f0"}`, borderRadius:20, cursor:"pointer", textTransform:"capitalize" }}>

            {c==="all"?"All Categories":c.replace(/-/g," ")}

          </button>

        ))}

      </div>



      {loading ? (

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

          {[1,2,3].map(i=><div key={i} style={{ height:140, background:"linear-gradient(90deg,#f5f5f5 25%,#ebebeb 50%,#f5f5f5 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", borderRadius:14 }}/>)}

        </div>

      ) : (

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {filtered.map(cs => (

            <a key={cs.id} href={`/case-studies/${cs.slug}`} style={{ display:"block", background:"#fff", border:"1px solid #e2e8f0", borderRadius:14, padding:"20px 22px", textDecoration:"none", transition:"all 0.15s" }}

              onMouseEnter={e=>{e.currentTarget.style.borderColor="#0E6163";e.currentTarget.style.boxShadow="0 4px 16px rgba(14,97,99,0.1)";}}

              onMouseLeave={e=>{e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.boxShadow="none";}}>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>

                <div style={{ flex:1 }}>

                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>

                    <span style={{ fontSize:10, fontWeight:700, color:DIFF_COLOR[cs.difficulty]||"#718096", background:`${DIFF_COLOR[cs.difficulty]}18`, padding:"2px 8px", borderRadius:8, textTransform:"capitalize" }}>{cs.difficulty}</span>

                    {!cs.is_free && <span style={{ fontSize:10, fontWeight:700, color:"#553C9A", background:"#FAF5FF", padding:"2px 8px", borderRadius:8 }}>💎 Pro</span>}

                    <span style={{ fontSize:11, color:"#a0aec0" }}>⏱ {cs.duration_minutes} min read</span>

                  </div>

                  <h3 style={{ fontSize:16, fontWeight:700, color:"#1c2b3a", margin:"0 0 6px", lineHeight:1.3 }}>{cs.title}</h3>

                  <p style={{ fontSize:13, color:"#718096", lineHeight:1.6, margin:"0 0 10px" }}>{cs.subtitle}</p>

                  {cs.protagonist && <div style={{ fontSize:12, color:"#a0aec0" }}>👤 {cs.protagonist}</div>}

                </div>

                <div style={{ fontSize:24, flexShrink:0 }}>→</div>

              </div>

              {cs.key_lesson && (

                <div style={{ marginTop:12, padding:"8px 12px", background:"#f0f9f9", borderLeft:"3px solid #0E6163", borderRadius:"0 8px 8px 0", fontSize:12, color:"#0E6163", fontWeight:600 }}>

                  💡 {cs.key_lesson}

                </div>

              )}

            </a>

          ))}

          {filtered.length===0 && <div style={{ textAlign:"center", padding:"48px 20px", color:"#718096" }}>No case studies in this category yet.</div>}

        </div>

      )}

    </div>

  );

}



// ─────────────────────────────────────────────────────────────
