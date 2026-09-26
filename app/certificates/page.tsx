"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CertificateCard, type Certificate } from "@/components/certificates/CertificateCard";

// ============================================================
// FinanceHub — My Certificates Page
// app/certificates/page.tsx
// ============================================================

export default function CertificatesPage() {
  const [certs,   setCerts]   = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_valid", true)
        .order("issued_at", { ascending: false });
      setCerts((data as any[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px", fontFamily: "var(--font-ui,system-ui)" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1c2b3a", margin: "0 0 6px", letterSpacing: "-0.4px" }}>
          🏆 My Certificates
        </h1>
        <p style={{ fontSize: 14, color: "#718096", margin: 0 }}>
          Earn certificates by completing all lessons in a track. Each is verified and shareable.
        </p>
      </div>

      {loading ? (
        <div style={{ height: 300, background: "linear-gradient(90deg,#f5f5f5 25%,#ebebeb 50%,#f5f5f5 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 20 }} />
      ) : certs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🎓</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1c2b3a", marginBottom: 8 }}>
            No certificates yet
          </h2>
          <p style={{ fontSize: 14, color: "#718096", marginBottom: 24, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 24px" }}>
            Complete all lessons in any track to earn your first certificate.
            Certificates include a verification ID and are shareable on LinkedIn.
          </p>
          <a href="/explore" style={{
            display: "inline-block", padding: "11px 24px",
            background: "#0E6163", color: "#fff",
            borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none",
          }}>
            Browse Tracks →
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {certs.map(cert => (
            <CertificateCard key={cert.id} cert={cert} showActions />
          ))}
        </div>
      )}

      {/* How to earn */}
      <div style={{
        marginTop: 36, background: "#f8f9fa", border: "1px solid #e2e8f0",
        borderRadius: 14, padding: "20px 22px",
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1c2b3a", marginBottom: 14 }}>
          How to earn a certificate
        </h3>
        {[
          ["Complete all lessons", "Finish every lesson in a track — all levels"],
          ["Pass the quizzes",     "Score 70%+ on track quizzes to demonstrate knowledge"],
          ["Auto-generated",       "Certificate is automatically created with a unique verification ID"],
          ["Share anywhere",       "Add to LinkedIn, share the verification link, or download as PDF"],
        ].map(([title, desc], i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 3 ? 12 : 0 }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", background: "#0E6163",
              color: "#fff", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2b3a", marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#718096" }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
