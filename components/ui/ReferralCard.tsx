"use client";

// ============================================================
// FinanceHub — Referral Card
// components/ui/ReferralCard.tsx
// Show on: /dashboard, /profile, /settings
// ============================================================

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
        setXpEarned(xpData.reduce((s: number, r: any) => s + (r.referrer_xp || 0), 0));
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
                borderRadius:10, color:"#fff",
                fontSize:13, fontWeight:600,
                cursor:"pointer", fontFamily:"inherit",
                transition:"all 0.2s", whiteSpace:"nowrap",
              }}>
              {copied ? "✓ Copied!" : "Copy link"}
            </button>
          </div>

          {/* Share buttons */}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={shareWhatsApp}
              style={{ flex:1, padding:"9px", background:"#25D366", border:"none", borderRadius:9, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.688"/></svg>
              WhatsApp
            </button>
            <button onClick={shareTwitter}
              style={{ flex:1, padding:"9px", background:"#1DA1F2", border: "none", borderRadius:9, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X / Twitter
            </button>
            <button
              onClick={() => {
                const msg = `Join FinanceHub with my code ${code} and get 150 XP bonus! ${window.location.origin}/signup?ref=${code}`;
                if (navigator.share) {
                  navigator.share({ title:"Join FinanceHub", text:msg, url:`${window.location.origin}/signup?ref=${code}` });
                } else {
                  navigator.clipboard.writeText(msg);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              style={{ padding:"9px 14px", background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:9, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              More ↗
            </button>
          </div>

          {/* Milestone hint */}
          {referrals > 0 && referrals < 5 && (
            <div style={{ marginTop:14, fontSize:11, color:"rgba(255,255,255,0.4)", textAlign:"center" }}>
              {5 - referrals} more referrals to unlock a special badge 🏅
            </div>
          )}
        </div>
      ) : (
        <button onClick={generateCode} disabled={generating}
          style={{ width:"100%", padding:"13px", background:"#1D9E75", border:"none", borderRadius:10, color:"#fff", fontSize:14, fontWeight:700, cursor:generating?"not-allowed":"pointer", fontFamily:"inherit" }}>
          {generating ? "Generating your code…" : "Get my referral code"}
        </button>
      )}
    </div>
  );
}

export default ReferralCard;
