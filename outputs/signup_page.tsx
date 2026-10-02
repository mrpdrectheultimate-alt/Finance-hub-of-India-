"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Logo        from "@/components/ui/Logo";

// ============================================================
// FinanceHub — Sign Up Page
// app/signup/page.tsx
// ============================================================

export default function SignupPage() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Get plan from URL params e.g. /signup?plan=pro
  const plan = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("plan") || "free"
    : "free";

  const handleGoogle = async () => {
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options:  { redirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim())    { setError("Please enter your name."); return; }
    if (!email.trim())   { setError("Please enter your email."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError("");

    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: name.trim(), selected_plan: plan },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
      },
    });

    if (error) { setError(error.message); setLoading(false); }
    else        window.location.href = "/onboarding?welcome=1";
  };

  const inputStyle: React.CSSProperties = {
    width:"100%", padding:"10px 14px",
    border:"1px solid #d1d5db", borderRadius:9,
    fontSize:14, color:"#111827",
    fontFamily:"var(--font-ui, system-ui)",
    outline:"none", boxSizing:"border-box",
    transition:"border-color 0.15s",
  };

  return (
    <div style={{
      minHeight:"100vh", background:"#f3f4f6",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"20px", fontFamily:"var(--font-ui, system-ui)",
    }}>
      <div style={{
        background:"#fff", borderRadius:16, padding:"36px 40px",
        width:"100%", maxWidth:420,
        boxShadow:"0 4px 24px rgba(0,0,0,0.07)",
      }}>
        {/* Logo */}
        <div style={{ marginBottom:28 }}>
          <Logo size="md" href="/" />
        </div>

        <h1 style={{ fontSize:22, fontWeight:700, color:"#111827", margin:"0 0 6px", letterSpacing:"-0.2px" }}>
          Create your account
        </h1>
        <p style={{ fontSize:14, color:"#6b7280", margin:"0 0 24px" }}>
          {plan !== "free"
            ? `Start your ${plan.charAt(0).toUpperCase()+plan.slice(1)} plan — 7-day free trial`
            : "Free forever. No credit card required."}
        </p>

        {/* Google */}
        <button onClick={handleGoogle} disabled={loading}
          style={{ width:"100%", padding:"11px 16px", background:"#fff", border:"1px solid #d1d5db", borderRadius:10, fontSize:14, fontWeight:500, color:"#374151", cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, fontFamily:"inherit", marginBottom:20 }}
          onMouseEnter={e=>(e.currentTarget.style.borderColor="#9ca3af")}
          onMouseLeave={e=>(e.currentTarget.style.borderColor="#d1d5db")}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:1, background:"#e5e7eb" }}/>
          <span style={{ fontSize:12, color:"#9ca3af" }}>or sign up with email</span>
          <div style={{ flex:1, height:1, background:"#e5e7eb" }}/>
        </div>

        <form onSubmit={handleSignup}>
          {/* Name */}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:500, color:"#374151", marginBottom:6 }}>Full name</label>
            <input value={name} onChange={e=>setName(e.target.value)}
              placeholder="Rahul Sharma" autoComplete="name" style={inputStyle}
              onFocus={e=>(e.target.style.borderColor="#0E6163")}
              onBlur={e=>(e.target.style.borderColor="#d1d5db")} />
          </div>

          {/* Email */}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:500, color:"#374151", marginBottom:6 }}>Email address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="rahul@example.com" autoComplete="email" style={inputStyle}
              onFocus={e=>(e.target.style.borderColor="#0E6163")}
              onBlur={e=>(e.target.style.borderColor="#d1d5db")} />
          </div>

          {/* Password */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:500, color:"#374151", marginBottom:6 }}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="Min. 8 characters" autoComplete="new-password" style={inputStyle}
              onFocus={e=>(e.target.style.borderColor="#0E6163")}
              onBlur={e=>(e.target.style.borderColor="#d1d5db")} />
            <div style={{ fontSize:11, color:"#9ca3af", marginTop:5 }}>
              {password.length > 0 && (
                <span style={{ color: password.length >= 8 ? "#1D9E75" : "#e53e3e" }}>
                  {password.length >= 8 ? "✓ Strong enough" : `${8-password.length} more characters needed`}
                </span>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ fontSize:13, color:"#dc2626", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"9px 12px", marginBottom:16 }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{ width:"100%", padding:"12px", background:loading?"#6b9e99":"#0E6163", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {loading ? (
              <><div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/> Creating account…</>
            ) : "Create free account"}
          </button>
        </form>

        {/* Terms notice */}
        <p style={{ fontSize:11, color:"#9ca3af", textAlign:"center", margin:"16px 0 0", lineHeight:1.6 }}>
          By signing up you agree to our{" "}
          <a href="/legal/terms" style={{ color:"#0E6163" }}>Terms</a> and{" "}
          <a href="/legal/privacy" style={{ color:"#0E6163" }}>Privacy Policy</a>.
        </p>

        {/* Login link */}
        <p style={{ textAlign:"center", fontSize:14, color:"#6b7280", margin:"16px 0 0" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color:"#0E6163", fontWeight:600 }}>Log in</a>
        </p>
      </div>
    </div>
  );
}
