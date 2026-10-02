"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";
import Link from "next/link";

export default function ForgotPasswordPage() {

  const [email,   setEmail]   = useState("");

  const [sent,    setSent]    = useState(false);

  const [loading, setLoading] = useState(false);

  const [error,   setError]   = useState("");



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!email.trim()) { setError("Please enter your email."); return; }

    setLoading(true); setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {

      redirectTo: `${window.location.origin}/reset-password`,

    });

    if (error) { setError(error.message); setLoading(false); }

    else setSent(true);

  };



  return (

    <div style={{ minHeight:"100vh", background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"var(--font-ui,system-ui)" }}>

      <div style={{ background:"#fff", borderRadius:16, padding:"36px 40px", width:"100%", maxWidth:420, boxShadow:"0 4px 24px rgba(0,0,0,0.07)" }}>

        <div style={{ marginBottom:28 }}><Logo size="md" href="/" /></div>



        {sent ? (

          <div style={{ textAlign:"center" }}>

            <div style={{ fontSize:48, marginBottom:16 }}>📧</div>

            <h2 style={{ fontSize:20, fontWeight:700, color:"#111827", marginBottom:8 }}>Check your email</h2>

            <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.6 }}>

              We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the link.

            </p>

            <a href="/login" style={{ display:"inline-block", marginTop:20, fontSize:14, color:"#0E6163", fontWeight:600 }}>Back to login</a>

          </div>

        ) : (

          <>

            <h1 style={{ fontSize:22, fontWeight:700, color:"#111827", margin:"0 0 6px" }}>Reset your password</h1>

            <p style={{ fontSize:14, color:"#6b7280", margin:"0 0 24px" }}>Enter your email and we'll send a reset link.</p>

            <form onSubmit={handleSubmit}>

              <label style={{ display:"block", fontSize:13, fontWeight:500, color:"#374151", marginBottom:6 }}>Email address</label>

              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="rahul@example.com"

                style={{ width:"100%", padding:"10px 14px", border:"1px solid #d1d5db", borderRadius:9, fontSize:14, outline:"none", marginBottom:16, boxSizing:"border-box" as any }}

                onFocus={e=>(e.target.style.borderColor="#0E6163")} onBlur={e=>(e.target.style.borderColor="#d1d5db")} />

              {error && <div style={{ fontSize:13, color:"#dc2626", background:"#fef2f2", borderRadius:8, padding:"8px 12px", marginBottom:14 }}>{error}</div>}

              <button type="submit" disabled={loading}

                style={{ width:"100%", padding:12, background:"#0E6163", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer" }}>

                {loading ? "Sending…" : "Send reset link"}

              </button>

            </form>

            <p style={{ textAlign:"center", fontSize:14, color:"#6b7280", marginTop:16 }}>

              <a href="/login" style={{ color:"#0E6163", fontWeight:600 }}>Back to login</a>

            </p>

          </>

        )}

      </div>

    </div>

  );

}



// ─────────────────────────────────────────────────────────────
