"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";
import Link from "next/link";

export default function VerifyPage({ params }: { params: { id: string } }) {

  const [cert,    setCert]    = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [found,   setFound]   = useState(true);



  useEffect(() => {

    supabase.from("certificates").select("*").eq("verification_id", params.id).single()

      .then(({data}) => { if(data){setCert(data);setFound(true);}else setFound(false); setLoading(false); });

  }, [params.id]);



  if (loading) return <div style={{ textAlign:"center", padding:80, fontFamily:"var(--font-ui,system-ui)", color:"#718096" }}>Verifying certificate…</div>;



  return (

    <div style={{ maxWidth:640, margin:"0 auto", padding:"40px 20px 80px", fontFamily:"var(--font-ui,system-ui)" }}>

      {!found ? (

        <div style={{ textAlign:"center" }}>

          <div style={{ fontSize:60, marginBottom:16 }}>❌</div>

          <h1 style={{ fontSize:22, fontWeight:700, color:"#1c2b3a", marginBottom:8 }}>Certificate not found</h1>

          <p style={{ color:"#718096" }}>The ID <code style={{ background:"#f7fafc", padding:"2px 8px", borderRadius:6 }}>{params.id}</code> does not match any certificate.</p>

          <a href="/" style={{ display:"inline-block", marginTop:20, color:"#0E6163", fontWeight:600 }}>Go to FinanceHub →</a>

        </div>

      ) : (

        <div>

          <div style={{ background:"#F0FFF4", border:"1px solid #C6F6D5", borderRadius:12, padding:"14px 18px", marginBottom:24, display:"flex", gap:12, alignItems:"center" }}>

            <div style={{ fontSize:28 }}>✅</div>

            <div>

              <div style={{ fontSize:15, fontWeight:700, color:"#22543D" }}>Certificate Verified</div>

              <div style={{ fontSize:12, color:"#276749" }}>This certificate is authentic, issued by FinanceHub on {new Date(cert.issued_at).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div>

            </div>

          </div>

          <div style={{ background:"linear-gradient(135deg,#0E6163,#1D9E75)", borderRadius:16, padding:"32px", color:"#fff", marginBottom:20 }}>

            <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBottom:6 }}>CERTIFICATE OF COMPLETION</div>

            <div style={{ fontSize:28, fontWeight:800, marginBottom:4 }}>{cert.user_name}</div>

            <div style={{ fontSize:14, color:"rgba(255,255,255,0.7)", marginBottom:16 }}>has successfully completed</div>

            <div style={{ fontSize:22, fontWeight:700, marginBottom:20 }}>{cert.track_name} Track</div>

            <div style={{ display:"flex", gap:16 }}>

              {[{l:"Lessons",v:cert.lesson_count},{l:"Avg Score",v:`${cert.quiz_avg_score}%`},{l:"Skills",v:cert.skills?.length||0}].map(s=>(

                <div key={s.l}><div style={{ fontSize:18, fontWeight:700 }}>{s.v}</div><div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", textTransform:"uppercase" }}>{s.l}</div></div>

              ))}

            </div>

            <div style={{ marginTop:20, fontSize:11, color:"rgba(255,255,255,0.5)", fontFamily:"monospace", letterSpacing:"0.1em" }}>ID: {cert.verification_id}</div>

          </div>

          <div style={{ textAlign:"center" }}>

            <a href="/signup" style={{ display:"inline-block", padding:"11px 24px", background:"#0E6163", color:"#fff", borderRadius:10, fontSize:14, fontWeight:600, textDecoration:"none" }}>

              Earn your own certificate →

            </a>

          </div>

        </div>

      )}

    </div>

  );

}



// ─────────────────────────────────────────────────────────────
