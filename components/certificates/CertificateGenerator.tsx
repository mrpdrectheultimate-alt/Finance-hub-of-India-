"use client";

import { useState, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

interface CertData {
  recipientName: string;
  trackTitle: string;
  issueDate: string;
  certificateId: string;
  verifyUrl: string;
}

interface CertificateGeneratorProps {
  trackSlug: string;
  trackTitle: string;
  onClose: () => void;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

export default function CertificateGenerator({ trackSlug, trackTitle, onClose }: CertificateGeneratorProps) {
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [certData, setCertData] = useState<CertData | null>(null);
  const [error, setError] = useState("");

  const requestCertificate = async () => {
    setState("loading");
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("Please log in");
      setState("error");
      return;
    }

    const response = await fetch("/api/generate-certificate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ trackSlug }),
    });

    const data = (await response.json()) as { certData?: CertData; error?: string };
    if (!response.ok || !data.certData) {
      setError(data.error || "Failed to generate certificate");
      setState("error");
      return;
    }

    setCertData(data.certData);
    setState("ready");
  };

  const downloadPDF = async () => {
    if (!certData) return;

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const width = 297;
    const height = 210;

    doc.setFillColor(250, 250, 248);
    doc.rect(0, 0, width, height, "F");

    doc.setDrawColor(29, 158, 117);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, width - 20, height - 20);
    doc.setLineWidth(0.3);
    doc.rect(13, 13, width - 26, height - 26);

    [
      [14, 14],
      [width - 14, 14],
      [14, height - 14],
      [width - 14, height - 14],
    ].forEach(([x, y]) => {
      doc.setFillColor(29, 158, 117);
      doc.circle(x, y, 2, "F");
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(29, 158, 117);
    doc.text("F  FinanceHub", width / 2, 30, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("CERTIFICATE OF COMPLETION", width / 2, 42, { align: "center" });

    doc.setDrawColor(29, 158, 117);
    doc.setLineWidth(0.5);
    doc.line(60, 47, width - 60, 47);

    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.text("This certifies that", width / 2, 60, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(10, 10, 10);
    doc.text(certData.recipientName, width / 2, 80, { align: "center" });

    const nameWidth = doc.getTextWidth(certData.recipientName);
    doc.setDrawColor(29, 158, 117);
    doc.setLineWidth(0.8);
    doc.line((width - nameWidth) / 2, 83, (width + nameWidth) / 2, 83);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("has successfully completed the", width / 2, 96, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(4, 52, 44);
    doc.text(certData.trackTitle, width / 2, 110, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("learning track on FinanceHub, demonstrating proficiency in finance education.", width / 2, 122, { align: "center" });

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(30, 148, width - 30, 148);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("DATE OF ISSUE", 50, 158, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(certData.issueDate, 50, 165, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(29, 158, 117);
    doc.text("FinanceHub", width / 2, 160, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Authorised by FinanceHub Education", width / 2, 166, { align: "center" });

    doc.setFontSize(9);
    doc.text("CERTIFICATE ID", width - 50, 158, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text(certData.certificateId, width - 50, 165, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Verify at ${certData.verifyUrl}/${certData.certificateId} - Educational purposes only`, width / 2, height - 16, { align: "center" });

    doc.save(`FinanceHub_Certificate_${certData.certificateId}.pdf`);
  };

  const shareUrl = certData ? `${appUrl || certData.verifyUrl}/verify/${certData.certificateId}` : "";

  return (
    <div style={s.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.certIcon}>F</div>
            <div>
              <div style={s.title}>Certificate of Completion</div>
              <div style={s.sub}>{trackTitle}</div>
            </div>
          </div>
          <button onClick={onClose} style={s.closeBtn} type="button">
            x
          </button>
        </div>

        {state === "idle" ? (
          <div style={s.body}>
            <div style={s.previewBox}>
              <div style={s.previewFrame}>
                <div style={s.previewLogo}>F FinanceHub</div>
                <div style={s.previewLabel}>CERTIFICATE OF COMPLETION</div>
                <div style={s.previewDivider} />
                <div style={s.previewSmall}>This certifies that</div>
                <div style={s.previewName}>Your Name</div>
                <div style={s.previewSmall}>has successfully completed</div>
                <div style={s.previewTrack}>{trackTitle}</div>
              </div>
            </div>
            <p style={s.desc}>Your certificate is a professionally designed PDF you can download, share on LinkedIn, add to your resume, or print.</p>
            <div style={s.features}>
              {["Unique certificate ID", "Verifiable online", "PDF format - print or share", "Designed for portfolio sharing"].map((feature) => (
                <div key={feature} style={s.feature}>
                  <span style={s.checkGreen}>✓</span> {feature}
                </div>
              ))}
            </div>
            <button onClick={requestCertificate} style={s.generateBtn} type="button">
              Generate my certificate →
            </button>
          </div>
        ) : null}

        {state === "loading" ? (
          <div style={s.center}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Generating your certificate...</p>
          </div>
        ) : null}

        {state === "ready" && certData ? (
          <div style={s.body}>
            <div style={s.successBox}>
              <div style={s.successTitle}>Your certificate is ready.</div>
              <div style={s.certIdRow}>
                <span style={s.certIdLabel}>Certificate ID:</span>
                <span style={s.certId}>{certData.certificateId}</span>
              </div>
            </div>

            <div style={s.certDetails}>
              {[
                { label: "Recipient", val: certData.recipientName },
                { label: "Track completed", val: certData.trackTitle },
                { label: "Issue date", val: certData.issueDate },
              ].map(({ label, val }) => (
                <div key={label} style={s.certRow}>
                  <span style={s.certLabel}>{label}</span>
                  <span style={s.certVal}>{val}</span>
                </div>
              ))}
            </div>

            <button onClick={downloadPDF} style={s.downloadBtn} type="button">
              Download PDF certificate
            </button>

            <div style={s.shareRow}>
              <div style={s.shareLabel}>Share your achievement</div>
              <div style={s.shareBtns}>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`I completed ${certData.trackTitle} on FinanceHub!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={s.linkedinBtn}
                >
                  Share on LinkedIn
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(`I completed ${certData.trackTitle} on FinanceHub. Certificate: ${shareUrl}`)}
                  style={s.copyBtn}
                  type="button"
                >
                  Copy link
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {state === "error" ? (
          <div style={s.body}>
            <div style={s.errorBox}>
              <div style={s.errorTitle}>{error}</div>
              {error.includes("Complete all") ? <p style={s.errorSub}>Finish all lessons in this track before claiming your certificate.</p> : null}
              {error.includes("Pro") ? (
                <a href="/pricing" style={s.upgradeLink}>
                  Upgrade to Pro →
                </a>
              ) : null}
            </div>
            <button onClick={() => setState("idle")} style={s.retryBtn} type="button">
              Try again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20, backdropFilter: "blur(3px)" },
  modal: { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", fontFamily: "system-ui, -apple-system, sans-serif" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "0.5px solid #eee" },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  certIcon: { width: 32, height: 32, borderRadius: 8, background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 },
  title: { fontWeight: 700, fontSize: 16, color: "#0a0a0a" },
  sub: { fontSize: 12, color: "#888", marginTop: 2 },
  closeBtn: { fontSize: 16, color: "#aaa", background: "none", border: "none", cursor: "pointer" },
  body: { padding: "22px 24px 28px" },
  previewBox: { background: "#fafafa", border: "0.5px solid #e5e5e5", borderRadius: 10, padding: 16, marginBottom: 16 },
  previewFrame: { border: "2px solid #1D9E75", borderRadius: 6, padding: "16px 20px", textAlign: "center", background: "#fff" },
  previewLogo: { fontSize: 12, fontWeight: 700, color: "#1D9E75", marginBottom: 4 },
  previewLabel: { fontSize: 9, color: "#aaa", letterSpacing: ".1em", marginBottom: 8 },
  previewDivider: { height: 1, background: "#eee", margin: "0 20px 8px" },
  previewSmall: { fontSize: 10, color: "#aaa", marginBottom: 4 },
  previewName: { fontSize: 18, fontWeight: 700, color: "#0a0a0a", marginBottom: 4 },
  previewTrack: { fontSize: 13, fontWeight: 600, color: "#0F6E56" },
  desc: { fontSize: 13, color: "#555", lineHeight: 1.6, margin: "0 0 14px" },
  features: { display: "flex", flexDirection: "column", gap: 7, marginBottom: 20 },
  feature: { fontSize: 13, color: "#444", display: "flex", gap: 8 },
  checkGreen: { color: "#1D9E75", fontWeight: 700 },
  generateBtn: { width: "100%", padding: "13px", fontSize: 14, fontWeight: 600, border: "none", borderRadius: 10, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, gap: 16 },
  spinner: { width: 36, height: 36, border: "3px solid #eee", borderTop: "3px solid #1D9E75", borderRadius: "50%" },
  loadingText: { fontSize: 14, color: "#888" },
  successBox: { background: "#E1F5EE", border: "0.5px solid #9FE1CB", borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 16 },
  successTitle: { fontWeight: 700, fontSize: 16, color: "#04342C", marginBottom: 8 },
  certIdRow: { display: "flex", gap: 8, justifyContent: "center", alignItems: "center" },
  certIdLabel: { fontSize: 12, color: "#0F6E56" },
  certId: { fontSize: 13, fontWeight: 700, color: "#0F6E56", fontFamily: "monospace" },
  certDetails: { background: "#fafafa", borderRadius: 10, padding: "12px 16px", marginBottom: 16 },
  certRow: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 7, gap: 12 },
  certLabel: { color: "#aaa" },
  certVal: { fontWeight: 600, color: "#333", textAlign: "right" },
  downloadBtn: { width: "100%", padding: "13px", fontSize: 14, fontWeight: 600, border: "none", borderRadius: 10, background: "#0a0a0a", color: "#fff", cursor: "pointer", fontFamily: "system-ui", marginBottom: 16 },
  shareRow: { background: "#fafafa", borderRadius: 10, padding: "14px 16px" },
  shareLabel: { fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 10 },
  shareBtns: { display: "flex", gap: 8 },
  linkedinBtn: { flex: 1, padding: "9px", fontSize: 12, fontWeight: 600, background: "#0A66C2", color: "#fff", borderRadius: 8, textDecoration: "none", textAlign: "center" },
  copyBtn: { flex: 1, padding: "9px", fontSize: 12, fontWeight: 600, background: "#fff", color: "#333", border: "0.5px solid #ddd", borderRadius: 8, cursor: "pointer", fontFamily: "system-ui" },
  errorBox: { background: "#FEF2F2", border: "0.5px solid #FCA5A5", borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 16 },
  errorTitle: { fontWeight: 600, fontSize: 14, color: "#B91C1C", marginBottom: 6 },
  errorSub: { fontSize: 13, color: "#B91C1C", margin: "0 0 10px" },
  upgradeLink: { display: "inline-block", color: "#1D9E75", fontWeight: 600, fontSize: 13 },
  retryBtn: { width: "100%", padding: "11px", fontSize: 13, fontWeight: 600, border: "0.5px solid #ddd", borderRadius: 9, background: "#fff", color: "#333", cursor: "pointer", fontFamily: "system-ui" },
};
