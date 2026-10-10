"use client";

// ============================================================

// FinanceHub — Referral Card + Dark Mode Toggle

// Split on deploy:

//

// ReferralCard     → components/ui/ReferralCard.tsx

// DarkModeToggle   → components/ui/DarkModeToggle.tsx

// ============================================================



import { useState, useEffect } from "react";

import { supabase } from "@/lib/supabase";



// ─────────────────────────────────────────────────────────────

// REFERRAL CARD

// components/ui/ReferralCard.tsx

// Show on: /dashboard, /profile, /settings

// ─────────────────────────────────────────────────────────────

export function ReferralCard() {

  const [code,        setCode]        = useState<string | null>(null);

  const [referrals,   setReferrals]   = useState(0);

  const [xpEarned,    setXpEarned]    = useState(0);

  const [copied,      setCopied]      = useState(false);

  const [loading,     setLoading]     = useState(true);

  const [generating,  setGenerating]  = useState(false);



  useEffect(() => {

    (async () => {

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;



      // Fetch existing code

      const { data: codeData } = await supabase

        .from("referral_codes")

        .select("code, uses_count")

        .eq("user_id", user.id)

        .single();



      if (codeData) {

        setCode(codeData.code);

        setReferrals(codeData.uses_count);

      }



      // Fetch total XP earned from referrals

      const { data: xpData } = await supabase

        .from("referrals")

        .select("referrer_xp")

        .eq("referrer_id", user.id)

        .eq("status", "rewarded");



      if (xpData) {

        setXpEarned(xpData.reduce((s, r) => s + r.referrer_xp, 0));

      }



      setLoading(false);

    })();

  }, []);



  const generateCode = async () => {

    setGenerating(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;



    const { data } = await supabase.rpc("generate_referral_code", { p_user_id: user.id });

    if (data) {

      setCode(data);

      // Refresh

      const { data: cd } = await supabase

        .from("referral_codes").select("code,uses_count").eq("user_id", user.id).single();

      if (cd) { setCode(cd.code); setReferrals(cd.uses_count); }

    }

    setGenerating(false);

  };



  const copyLink = () => {

    const link = `${window.location.origin}/signup?ref=${code}`;

    navigator.clipboard.writeText(link);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);

  };



  const shareWhatsApp = () => {

    const msg = `Join me on FinanceHub — India's best free finance education platform! Use my referral code *${code}* to get 150 XP bonus when you sign up. Learn SIP, mutual funds, tax, trading and more. ${window.location.origin}/signup?ref=${code}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");

  };



  const shareTwitter = () => {

    const msg = `I've been learning finance on @FinanceHubIn — India's most complete finance education platform. Join free using my code ${code} and get a 150 XP bonus! ${window.location.origin}/signup?ref=${code} #PersonalFinance #Investing #India`;

    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}`, "_blank");

  };



  if (loading) return (

    <div style={{ height:180, background:"#f8fafc", borderRadius:14, border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", color:"#9ca3af", fontSize:13 }}>

      Loading referral info…

    </div>

  );



  return (

    <div style={{

      background:    "linear-gradient(135deg, #0B1A2B 0%, #0E6163 100%)",

      borderRadius:  16,

      padding:       "24px",

      color:         "#fff",

      fontFamily:    "var(--font-ui,system-ui)",

    }}>

      {/* Header */}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>

        <div>

          <div style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>🎁 Invite friends — earn XP</div>

          <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)", lineHeight:1.6 }}>

            You get <strong style={{ color:"#1D9E75" }}>+100 XP</strong> · Your friend gets <strong style={{ color:"#1D9E75" }}>+150 XP</strong>

          </div>

        </div>

        {/* Stats */}

        <div style={{ display:"flex", gap:16, textAlign:"center" }}>

          <div>

            <div style={{ fontSize:22, fontWeight:800, lineHeight:1 }}>{referrals}</div>

            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2 }}>Friends joined</div>

          </div>

          <div>

            <div style={{ fontSize:22, fontWeight:800, lineHeight:1, color:"#1D9E75" }}>{xpEarned}</div>

            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2 }}>XP earned</div>

          </div>

        </div>

      </div>



      {/* Code display */}

      {code ? (

        <div>

          <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:8, letterSpacing:"0.05em", textTransform:"uppercase" }}>

            Your referral code

          </div>

          <div style={{ display:"flex", gap:8, marginBottom:16 }}>

            <div style={{

              flex:1, padding:"12px 16px",

              background:"rgba(255,255,255,0.1)",

              border:"1px solid rgba(255,255,255,0.2)",

              borderRadius:10,

              fontSize:20, fontWeight:800, letterSpacing:"0.15em",

              color:"#fff", fontFamily:"monospace",

              display:"flex", alignItems:"center",

            }}>

              {code}

            </div>

            <button

              onClick={copyLink}

              style={{

                padding:"12px 18px",

                background: copied ? "#1D9E75" : "rgba(255,255,255,0.15)",

                border:"1px solid rgba(255,255,255,0.2)",

