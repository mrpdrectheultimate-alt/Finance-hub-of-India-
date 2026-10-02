"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";
import Link from "next/link";

export default function TrackPage({ params }: { params: { slug: string } }) {

  const [track,   setTrack]   = useState<any>(null);

  const [levels,  setLevels]  = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [expanded,setExpanded]= useState<string[]>([]);



  useEffect(() => {

    (async () => {

      const { data: t } = await supabase.from("tracks").select("*").eq("slug", params.slug).single();

      if (!t) { setLoading(false); return; }

      setTrack(t);

      const { data: lvls } = await supabase.from("levels")

        .select("id,name,slug,order_index,lessons(id,title,slug,duration_minutes,is_free,is_published)")

        .eq("track_id", t.id).order("order_index");

      setLevels(lvls||[]);

      if (lvls?.length) setExpanded([lvls[0].id]);

      setLoading(false);

    })();

  }, [params.slug]);



  if (loading) return <div style={{ padding:40, textAlign:"center", color:"#718096" }}>Loading track…</div>;

  if (!track)  return <div style={{ padding:40, textAlign:"center", color:"#718096" }}>Track not found.</div>;



  const totalLessons = levels.reduce((s,lv)=>s+lv.lessons.filter((l:any)=>l.is_published).length,0);

  const color = track.color_hex || "#0E6163";



  return (

    <div style={{ fontFamily:"var(--font-ui,system-ui)" }}>

      {/* Hero */}

      <div style={{ background:`linear-gradient(135deg,${color}18,${color}08)`, borderBottom:"1px solid #e2e8f0", padding:"48px 20px 40px" }}>

        <div style={{ maxWidth:860, margin:"0 auto" }}>

          <div style={{ fontSize:48, marginBottom:12 }}>{track.icon_emoji||"📚"}</div>

          <h1 style={{ fontSize:32, fontWeight:800, color:"#1c2b3a", margin:"0 0 10px", letterSpacing:"-0.5px" }}>{track.name}</h1>

          <p style={{ fontSize:16, color:"#718096", maxWidth:560, lineHeight:1.7, margin:"0 0 20px" }}>{track.description}</p>

          <div style={{ display:"flex", gap:20, fontSize:13, color:"#718096" }}>

            <span>📖 {totalLessons} lessons</span>

            <span>🎓 {levels.length} levels</span>

          </div>

          <a href="/signup" style={{ display:"inline-block", marginTop:20, padding:"11px 24px", background:color, color:"#fff", borderRadius:10, fontSize:14, fontWeight:600, textDecoration:"none" }}>

            Start this track free →

          </a>

        </div>

      </div>



      {/* Levels + lessons */}

      <div style={{ maxWidth:860, margin:"0 auto", padding:"32px 20px 80px" }}>

        {levels.map(lv => {

          const isOpen = expanded.includes(lv.id);

          const published = lv.lessons.filter((l:any)=>l.is_published);

          return (

            <div key={lv.id} style={{ marginBottom:12, border:"1px solid #e2e8f0", borderRadius:14, overflow:"hidden" }}>

              <button onClick={()=>setExpanded(e=>isOpen?e.filter(id=>id!==lv.id):[...e,lv.id])}

                style={{ width:"100%", padding:"16px 20px", background:isOpen?"#f0f9f9":"#fff", border:"none", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"inherit" }}>

                <div style={{ textAlign:"left" }}>

                  <div style={{ fontSize:15, fontWeight:700, color:"#1c2b3a" }}>{lv.name}</div>

                  <div style={{ fontSize:12, color:"#a0aec0", marginTop:2 }}>{published.length} lessons</div>

                </div>

                <span style={{ color:"#a0aec0", fontSize:18, transition:"transform 0.2s", transform:isOpen?"rotate(180deg)":"none" }}>↓</span>

              </button>

              {isOpen && published.map((l:any,i:number)=>(

                <a key={l.id} href={`/learn/${l.slug}`}

                  style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 20px", borderTop:"1px solid #f5f5f5", textDecoration:"none", background:"transparent" }}

                  onMouseEnter={e=>(e.currentTarget.style.background="#f8f9fa")}

                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>

                  <div style={{ width:22, height:22, borderRadius:"50%", background:"#EDF2F7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#a0aec0", flexShrink:0 }}>{i+1}</div>

                  <div style={{ flex:1, fontSize:14, fontWeight:500, color:"#1c2b3a" }}>{l.title}</div>

                  <div style={{ display:"flex", gap:8, fontSize:11, color:"#a0aec0" }}>

                    {l.is_free && <span style={{ color:"#1D9E75", fontWeight:600 }}>Free</span>}

                    <span>{l.duration_minutes}m</span>

                  </div>

                </a>

              ))}

            </div>

          );

        })}

      </div>

    </div>

  );

}
