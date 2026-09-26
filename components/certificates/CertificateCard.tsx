"use client";
import { useState, useEffect, useRef } from "react";

// ============================================================
// FinanceHub — Certificate Card Component
// components/certificates/CertificateCard.tsx
// ============================================================

export type Certificate = {
  id:              string;
  verification_id: string;
  track_name:      string;
  user_name:       string;
  issued_at:       string;
  skills:          string[];
  lesson_count:    number;
  quiz_avg_score:  number;
  is_valid:        boolean;
};

// ─── Certificate card component ───────────────────────────────
export function CertificateCard({
  cert,
  showActions = true,
}: { cert: Certificate; showActions?: boolean }) {
  const cardRef     = useRef<HTMLDivElement>(null);
  const [copying,   setCopying]   = useState(false);
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareLink(`${window.location.origin}/verify/${cert.verification_id}`);
    }
  }, [cert.verification_id]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const downloadPDF = async () => {
    // Call the certificate PDF generation API
    const res = await fetch(`/api/generate-certificate?id=${cert.verification_id}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `FinanceHub-Certificate-${cert.verification_id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const TRACK_GRADIENTS: Record<string, string> = {
    "Personal Finance":    "linear-gradient(135deg, #1D9E75 0%, #0E6163 100%)",
    "Trading & Markets":   "linear-gradient(135deg, #185FA5 0%, #0D3B82 100%)",
    "Corporate Finance":   "linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)",
    "Technical Analysis":  "linear-gradient(135deg, #854F0B 0%, #4D2D06 100%)",
    "Behavioral Finance":  "linear-gradient(135deg, #D4A017 0%, #927009 100%)",
    "Forex & Currencies":  "linear-gradient(135deg, #0E6163 0%, #064749 100%)",
    "Crypto & DeFi":       "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
  };

  const gradient = TRACK_GRADIENTS[cert.track_name] || "linear-gradient(135deg, #1c2b3a 0%, #0E6163 100%)";

  return (
    <div>
      {/* Certificate visual */}
      <div ref={cardRef} style={{
        background:   gradient,
        borderRadius: 20,
        padding:      "36px 40px",
        position:     "relative",
        overflow:     "hidden",
        marginBottom: showActions ? 16 : 0,
        boxShadow:    "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Decorative circles */}
        {[[-60, -60, 200], [350, -40, 150], [-30, 220, 100]].map(([x, y, size], i) => (
          <div key={i} style={{
            position: "absolute", left: x, top: y,
            width: size, height: size, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)", pointerEvents: "none",
          }} />
        ))}

        {/* Logo + badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: "0.02em" }}>
            📚 FinanceHub
          </div>
          <div style={{
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
            borderRadius: 20, padding: "4px 14px",
            fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            CERTIFICATE OF COMPLETION
          </div>
        </div>

        {/* Main content */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>
            This certifies that
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 8, lineHeight: 1.2 }}>
            {cert.user_name}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
            has successfully completed the
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6, letterSpacing: "-0.3px" }}>
            {cert.track_name} Track
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
            on FinanceHub — Finance Education Platform
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
          {[
            { label: "Lessons Completed", value: cert.lesson_count },
            { label: "Avg Quiz Score",    value: `${Math.round(cert.quiz_avg_score)}%` },
            { label: "Skills Verified",   value: (cert.skills || []).length },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: ".06em" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>
            Skills Demonstrated
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(cert.skills || []).map(skill => (
              <span key={skill} style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 12, color: "rgba(255,255,255,0.9)",
              }}>
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Footer: date + verification ID */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Issued on</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
              {new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>Verification ID</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontFamily: "monospace", letterSpacing: ".1em" }}>
              {cert.verification_id}
            </div>
          </div>
        </div>

        {/* Seal */}
        <div style={{
          position: "absolute", bottom: 24, right: 100,
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          border: "2px solid rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28,
        }}>
          🏆
        </div>

        {/* QR placeholder */}
        <div style={{
          position: "absolute", bottom: 20, right: 24,
          width: 68, height: 68, background: "#fff",
          borderRadius: 8, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 11, color: "#a0aec0",
          flexDirection: "column", textAlign: "center", padding: 4,
        }}>
          <div style={{ fontSize: 28, lineHeight: 1 }}>▣</div>
          <div style={{ fontSize: 8, color: "#a0aec0", marginTop: 2 }}>Scan to verify</div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={downloadPDF}
            style={{
              flex: 1, padding: "11px", background: "#1c2b3a", color: "#fff",
              border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "var(--font-ui,system-ui)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
            ⬇️ Download PDF
          </button>
          <button onClick={copyLink}
            style={{
              flex: 1, padding: "11px",
              background: copying ? "#1D9E75" : "#fff",
              color: copying ? "#fff" : "#0E6163",
              border: "1.5px solid #0E6163", borderRadius: 10,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--font-ui,system-ui)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.2s",
            }}>
            {copying ? "✅ Link Copied!" : "🔗 Share Certificate"}
          </button>
          <a href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=FinanceHub%20${encodeURIComponent(cert.track_name)}&organizationName=FinanceHub&issueYear=${new Date(cert.issued_at).getFullYear()}&issueMonth=${new Date(cert.issued_at).getMonth()+1}&certUrl=${encodeURIComponent(shareLink)}&certId=${cert.verification_id}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              padding: "11px 16px",
              background: "#0077B5", color: "#fff",
              border: "none", borderRadius: 10,
              fontSize: 13, fontWeight: 600, textDecoration: "none",
              display: "flex", alignItems: "center", gap: 6,
              whiteSpace: "nowrap",
            }}>
            in Add to LinkedIn
          </a>
        </div>
      )}
    </div>
  );
}
