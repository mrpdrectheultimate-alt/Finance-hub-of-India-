"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";
import Link from "next/link";

export default function SettingsPage() {

  const [profile, setProfile] = useState<any>(null);

  const [saving,  setSaving]  = useState(false);

  const [saved,   setSaved]   = useState(false);

  const [tab,     setTab]     = useState<"account"|"notifications"|"privacy"|"danger">("account");



  useEffect(() => {

    (async () => {

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) { window.location.href="/login"; return; }

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();

      setProfile({ ...data, email: user.email });

    })();

  }, []);



  const save = async () => {

    if (!profile) return;

    setSaving(true);

    await supabase.from("profiles").update({

      full_name:             profile.full_name,

      theme:                 profile.theme,

      font_size:             profile.font_size,

      language_pref:         profile.language_pref,

      email_streak_reminder: profile.email_streak_reminder,

      email_weekly_digest:   profile.email_weekly_digest,

      email_marketing:       profile.email_marketing,

      notification_push:     profile.notification_push,

    }).eq("id", profile.id);

    setSaving(false); setSaved(true);

    setTimeout(() => setSaved(false), 2500);

  };



  const deleteAccount = async () => {

    if (!confirm("Are you absolutely sure? This cannot be undone. All your progress, notes and certificates will be deleted permanently.")) return;

    await supabase.auth.signOut();

    window.location.href = "/";

  };



  const TABS = [

    { id:"account",       label:"Account" },

    { id:"notifications", label:"Notifications" },

    { id:"privacy",       label:"Privacy" },

    { id:"danger",        label:"Danger Zone" },

  ] as const;



  if (!profile) return <div style={{ padding:40, textAlign:"center", color:"#718096" }}>Loading…</div>;



  return (

    <div style={{ maxWidth:720, margin:"0 auto", padding:"32px 20px 80px", fontFamily:"var(--font-ui,system-ui)" }}>

      <h1 style={{ fontSize:24, fontWeight:800, color:"#1c2b3a", margin:"0 0 28px" }}>⚙️ Settings</h1>



      {/* Tabs */}

      <div style={{ display:"flex", gap:4, borderBottom:"2px solid #e2e8f0", marginBottom:28 }}>

        {TABS.map(t => (

          <button key={t.id} onClick={() => setTab(t.id)}

            style={{ padding:"9px 16px", fontSize:13, fontWeight:tab===t.id?700:400, color:tab===t.id?"#0E6163":"#718096", background:"none", border:"none", borderBottom:tab===t.id?"2px solid #0E6163":"2px solid transparent", marginBottom:-2, cursor:"pointer", fontFamily:"inherit" }}>

            {t.label}

          </button>

        ))}

      </div>



      {/* ACCOUNT TAB */}

      {tab === "account" && (

        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

          {[

            { label:"Full Name", key:"full_name", type:"text", placeholder:"Your full name" },

            { label:"Email",     key:"email",     type:"email", placeholder:"", disabled:true },

          ].map(f => (

            <div key={f.key}>

              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#4a5568", marginBottom:6 }}>{f.label}</label>

              <input type={f.type} value={profile[f.key] || ""} placeholder={f.placeholder}

                disabled={f.disabled}

                onChange={e => !f.disabled && setProfile((p: any) => ({ ...p, [f.key]: e.target.value }))}

                style={{ width:"100%", padding:"10px 14px", border:"1px solid #e2e8f0", borderRadius:9, fontSize:14, outline:"none", boxSizing:"border-box" as any, background:f.disabled?"#f7fafc":"#fff", color:f.disabled?"#a0aec0":"#1c2b3a" }} />

            </div>

          ))}



          <div>

            <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#4a5568", marginBottom:6 }}>Theme</label>

            <select value={profile.theme||"light"} onChange={e=>setProfile((p:any)=>({...p,theme:e.target.value}))}

              style={{ width:"100%", padding:"10px 14px", border:"1px solid #e2e8f0", borderRadius:9, fontSize:14, outline:"none" }}>

              <option value="light">☀️ Light</option>

              <option value="dark">🌙 Dark</option>

              <option value="sepia">📜 Sepia</option>

            </select>

          </div>



          <div>

            <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#4a5568", marginBottom:6 }}>Reading Font Size</label>

            <select value={profile.font_size||"medium"} onChange={e=>setProfile((p:any)=>({...p,font_size:e.target.value}))}

              style={{ width:"100%", padding:"10px 14px", border:"1px solid #e2e8f0", borderRadius:9, fontSize:14, outline:"none" }}>

              {["small","medium","large","xl"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}

            </select>

          </div>



          <div>

            <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#4a5568", marginBottom:6 }}>Language Preference</label>

            <select value={profile.language_pref||"en"} onChange={e=>setProfile((p:any)=>({...p,language_pref:e.target.value}))}

              style={{ width:"100%", padding:"10px 14px", border:"1px solid #e2e8f0", borderRadius:9, fontSize:14, outline:"none" }}>

              <option value="en">🇬🇧 English</option>

              <option value="hi">🇮🇳 Hindi</option>

            </select>

          </div>

        </div>

      )}



      {/* NOTIFICATIONS TAB */}

      {tab === "notifications" && (

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

          {[

            { key:"email_streak_reminder", label:"Daily streak reminder", desc:"Email when your streak is about to break" },

            { key:"email_weekly_digest",   label:"Weekly digest",         desc:"Summary of your progress every Sunday" },

            { key:"email_marketing",       label:"Product updates",       desc:"New features, tracks and content announcements" },

            { key:"notification_push",     label:"Push notifications",    desc:"Browser notifications for reminders (requires PWA)" },

          ].map(n => (

            <div key={n.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"#f8f9fa", border:"1px solid #e2e8f0", borderRadius:10 }}>

              <div>

                <div style={{ fontSize:14, fontWeight:600, color:"#1c2b3a" }}>{n.label}</div>

                <div style={{ fontSize:12, color:"#718096", marginTop:2 }}>{n.desc}</div>

              </div>

              <button onClick={() => setProfile((p:any) => ({ ...p, [n.key]: !p[n.key] }))}

                style={{ width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", background:profile[n.key]?"#1D9E75":"#CBD5E0", position:"relative", transition:"background 0.2s", flexShrink:0 }}>

                <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:profile[n.key]?23:3, transition:"left 0.2s" }}/>

              </button>

            </div>

          ))}

        </div>

      )}



      {/* PRIVACY TAB */}

      {tab === "privacy" && (

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          <div style={{ background:"#EBF8FF", border:"1px solid #BEE3F8", borderRadius:12, padding:"16px 18px" }}>

            <div style={{ fontSize:14, fontWeight:700, color:"#2C5282", marginBottom:6 }}>Your rights under DPDP Act 2023</div>

            <div style={{ fontSize:13, color:"#2C5282", lineHeight:1.7 }}>You have the right to access, correct, and erase your personal data. Contact us at privacy@financehub.in to exercise your rights.</div>

          </div>

          {[

            { label:"Download my data", desc:"Get a copy of all your data — progress, notes, quiz scores", action:"Request export", href:"mailto:privacy@financehub.in?subject=Data Export Request" },

            { label:"Erase my data",    desc:"Delete all your personal data except legally required records", action:"Request erasure", href:"mailto:privacy@financehub.in?subject=Data Erasure Request" },

          ].map(item => (

            <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 18px", background:"#fff", border:"1px solid #e2e8f0", borderRadius:12 }}>

              <div>

                <div style={{ fontSize:14, fontWeight:600, color:"#1c2b3a" }}>{item.label}</div>

                <div style={{ fontSize:12, color:"#718096", marginTop:2 }}>{item.desc}</div>

              </div>

              <a href={item.href} style={{ padding:"7px 14px", background:"#f7fafc", border:"1px solid #e2e8f0", borderRadius:8, fontSize:12, fontWeight:600, color:"#0E6163", textDecoration:"none", flexShrink:0, marginLeft:12 }}>{item.action}</a>

            </div>

          ))}

        </div>

      )}



      {/* DANGER ZONE */}

      {tab === "danger" && (

        <div>

          <div style={{ background:"#FFF5F5", border:"1px solid #FC8181", borderRadius:12, padding:"20px" }}>

            <h3 style={{ fontSize:16, fontWeight:700, color:"#C53030", margin:"0 0 8px" }}>⚠️ Delete Account</h3>

            <p style={{ fontSize:14, color:"#742A2A", lineHeight:1.7, margin:"0 0 16px" }}>

              This permanently deletes your account, all progress, notes, quiz scores and certificates. This cannot be undone.

            </p>

            <button onClick={deleteAccount}

              style={{ padding:"10px 20px", background:"#E53E3E", color:"#fff", border:"none", borderRadius:9, fontSize:14, fontWeight:600, cursor:"pointer" }}>

              Delete my account permanently

            </button>

          </div>



          <div style={{ marginTop:16, padding:"14px 18px", background:"#f7fafc", border:"1px solid #e2e8f0", borderRadius:10 }}>

            <div style={{ fontSize:13, fontWeight:600, color:"#1c2b3a", marginBottom:4 }}>Cancel subscription</div>

            <div style={{ fontSize:12, color:"#718096", marginBottom:10 }}>You can cancel anytime. Your access continues until the end of the billing period.</div>

            <a href="mailto:support@financehub.in?subject=Cancel Subscription" style={{ fontSize:13, color:"#0E6163", fontWeight:600 }}>Contact support to cancel →</a>

          </div>

        </div>

      )}



      {/* Save button */}

      {tab !== "danger" && (

        <div style={{ marginTop:28 }}>

          <button onClick={save} disabled={saving}

            style={{ padding:"11px 28px", background:saved?"#1D9E75":"#0E6163", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", transition:"background 0.3s" }}>

            {saving ? "Saving…" : saved ? "✅ Saved!" : "Save changes"}

          </button>

        </div>

      )}

    </div>

  );

}



// ─────────────────────────────────────────────────────────────
