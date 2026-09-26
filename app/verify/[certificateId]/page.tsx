"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CertificateCard, type Certificate } from "@/components/certificates/CertificateCard";

// ============================================================
// FinanceHub — Public Certificate Verification Page
// app/verify/[certificateId]/page.tsx
// ============================================================

export default function CertificateVerifyPage({ params }: { params: { certificateId: string } }) {
  const [cert,    setCert]    = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [found,   setFound]   = useState(true);

  const verificationId = params.certificateId;

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .eq("verification_id", verificationId)
        .single();

      if (data) { setCert(data as any); setFound(true); }
      else        setFound(false);
      setLoading(false);
    })();
  }, [verificationId]);

  if (loading) return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 20px", textAlign: "center", fontFamily: "var(--font-ui,system-ui)" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#0E6163", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
    </div>
  );

  if (!found || !cert) return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 20px", textAlign: "center", fontFamily: "var(--font-ui,system-ui)" }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>❌</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1c2b3a", marginBottom: 8 }}>Certificate not found</h1>
      <p style={{ color: "#718096" }}>The verification ID <code style={{ background: "#f7fafc", padding: "2px 8px", borderRadius: 6 }}>{verificationId}</code> does not match any certificate.</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px", fontFamily: "var(--font-ui,system-ui)" }}>
      {/* Verification badge */}
      <div style={{
        display: "flex", gap: 12, alignItems: "center",
        background: "#F0FFF4", border: "1px solid #C6F6D5",
        borderRadius: 12, padding: "14px 18px", marginBottom: 24,
      }}>
        <div style={{ fontSize: 28 }}>✅</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#22543D" }}>Certificate Verified</div>
          <div style={{ fontSize: 12, color: "#276749" }}>
            This certificate is authentic and was issued by FinanceHub on{" "}
            {new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      <CertificateCard cert={cert} showActions={false} />

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <a href="/explore" style={{
          display: "inline-block", padding: "11px 24px",
          background: "#0E6163", color: "#fff",
          borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none",
        }}>
          Earn Your Own Certificate →
        </a>
      </div>
    </div>
  );
}
