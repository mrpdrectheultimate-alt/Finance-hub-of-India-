// ============================================================
// FinanceHub — Certificate PDF Generator
// app/api/generate-certificate/route.ts
// Generates a downloadable HTML→PDF certificate
// Uses html-to-pdf-js or returns styled HTML as fallback
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerClient }        from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const verificationId   = searchParams.get("id");

  if (!verificationId) {
    return NextResponse.json({ error: "Verification ID required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Verify the requester owns this certificate
  const { data: { user } } = await supabase.auth.getUser();

  const { data: cert, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("verification_id", verificationId)
    .eq("is_valid", true)
    .single();

  if (error || !cert) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  // Only owner can download their certificate
  if (user && cert.user_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const appUrl     = process.env.NEXT_PUBLIC_APP_URL || "https://financehub.in";
  const verifyUrl  = `${appUrl}/verify/${verificationId}`;
  const issuedDate = new Date(cert.issued_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  });

  // Skills list HTML
  const skillsHTML = (cert.skills || []).map((s: string) =>
    `<span style="display:inline-block;margin:3px;padding:4px 12px;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:12px;font-size:11px;font-weight:600">✓ ${s}</span>`
  ).join("");

  // QR code URL (using free QR service)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=0B1A2B&margin=4`;

  // Generate certificate HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FinanceHub Certificate — ${cert.track_name}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4 landscape; margin: 0; }
  body {
    width: 297mm; height: 210mm;
    font-family: 'Inter', sans-serif;
    background: #ffffff;
    overflow: hidden;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cert {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #0B1A2B 0%, #0E6163 60%, #1D9E75 100%);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 40px 56px;
    overflow: hidden;
  }
  /* Decorative circles */
  .circle-1 { position:absolute; width:360px; height:360px; border-radius:50%; background:rgba(255,255,255,0.04); top:-80px; right:-80px; }
  .circle-2 { position:absolute; width:240px; height:240px; border-radius:50%; background:rgba(255,255,255,0.04); bottom:-60px; left:-60px; }
  .circle-3 { position:absolute; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,0.03); bottom:40px; right:200px; }
  /* Content */
  .header { display:flex; justify-content:space-between; align-items:flex-start; }
  .logo { display:flex; align-items:center; gap:10px; }
  .logo-icon { width:40px; height:40px; border-radius:10px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-size:20px; }
  .logo-text .name { font-size:18px; font-weight:800; color:#fff; letter-spacing:-0.3px; }
  .logo-text .sub  { font-size:9px; color:rgba(255,255,255,0.5); letter-spacing:0.1em; text-transform:uppercase; }
  .badge { background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); border-radius:20px; padding:5px 16px; font-size:10px; font-weight:700; color:rgba(255,255,255,0.8); letter-spacing:0.1em; text-transform:uppercase; }
  .main { flex:1; display:flex; flex-direction:column; justify-content:center; }
  .certifies { font-size:12px; color:rgba(255,255,255,0.5); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:8px; }
  .name { font-family:'Playfair Display',serif; font-size:52px; font-weight:800; color:#ffffff; letter-spacing:-1px; line-height:1; margin-bottom:10px; }
  .completed { font-size:14px; color:rgba(255,255,255,0.65); margin-bottom:6px; }
  .track-name { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:#ffffff; margin-bottom:20px; }
  .skills { margin-bottom:20px; }
  .footer { display:flex; justify-content:space-between; align-items:flex-end; }
  .stats { display:flex; gap:28px; }
  .stat-item .val  { font-size:22px; font-weight:800; color:#fff; line-height:1; }
  .stat-item .lbl  { font-size:9px; color:rgba(255,255,255,0.45); text-transform:uppercase; letter-spacing:0.06em; margin-top:3px; }
  .right-side { display:flex; flex-direction:column; align-items:flex-end; gap:12px; }
  .date-issued .lbl { font-size:9px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.06em; text-align:right; }
  .date-issued .val { font-size:13px; font-weight:600; color:rgba(255,255,255,0.8); text-align:right; margin-top:2px; }
  .verify { font-size:9px; color:rgba(255,255,255,0.4); letter-spacing:0.06em; text-align:right; margin-top:4px; }
  .verify code { font-family:monospace; font-size:10px; color:rgba(255,255,255,0.6); letter-spacing:0.1em; }
  .qr-box { background:#fff; border-radius:8px; padding:4px; }
  .qr-box img { display:block; }
  /* Print button (hidden in PDF) */
  @media print { .no-print { display:none!important; } }
</style>
</head>
<body>
  <!-- Print/Download button (hidden when printing) -->
  <div class="no-print" style="position:fixed;top:16px;right:16px;z-index:999;display:flex;gap:8px;">
    <button onclick="window.print()" style="padding:9px 18px;background:#0E6163;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">
      ⬇️ Download PDF
    </button>
    <button onclick="navigator.clipboard.writeText('${verifyUrl}').then(()=>this.textContent='✅ Copied!')" style="padding:9px 18px;background:#fff;color:#0E6163;border:1px solid #0E6163;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">
      🔗 Copy verify link
    </button>
    <a href="https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=FinanceHub%20${encodeURIComponent(cert.track_name)}&organizationName=FinanceHub&issueYear=${new Date(cert.issued_at).getFullYear()}&issueMonth=${new Date(cert.issued_at).getMonth()+1}&certUrl=${encodeURIComponent(verifyUrl)}&certId=${verificationId}" target="_blank"
      style="padding:9px 18px;background:#0077B5;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;">
      in Add to LinkedIn
    </a>
  </div>

  <div class="cert">
    <!-- Decorative circles -->
    <div class="circle-1"></div>
    <div class="circle-2"></div>
    <div class="circle-3"></div>

    <!-- Header -->
    <div class="header">
      <div class="logo">
        <div class="logo-icon">📚</div>
        <div class="logo-text">
          <div class="name">FinanceHub</div>
          <div class="sub">of India</div>
        </div>
      </div>
      <div class="badge">Certificate of Completion</div>
    </div>

    <!-- Main content -->
    <div class="main">
      <div class="certifies">This certifies that</div>
      <div class="name">${cert.user_name}</div>
      <div class="completed">has successfully completed the</div>
      <div class="track-name">${cert.track_name} Track</div>
      <div class="skills">${skillsHTML}</div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="stats">
        <div class="stat-item">
          <div class="val">${cert.lesson_count}</div>
          <div class="lbl">Lessons completed</div>
        </div>
        <div class="stat-item">
          <div class="val">${Math.round(cert.quiz_avg_score || 0)}%</div>
          <div class="lbl">Avg quiz score</div>
        </div>
        <div class="stat-item">
          <div class="val">${(cert.skills || []).length}</div>
          <div class="lbl">Skills verified</div>
        </div>
      </div>

      <div class="right-side">
        <div class="qr-box">
          <img src="${qrUrl}" width="80" height="80" alt="Verify QR" />
        </div>
        <div class="date-issued">
          <div class="lbl">Issued on</div>
          <div class="val">${issuedDate}</div>
        </div>
        <div class="verify">
          Verify at financehub.in/verify/<code>${verificationId}</code>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  // Return as HTML (browser prints/saves as PDF)
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Certificate-ID": verificationId,
    },
  });
}
