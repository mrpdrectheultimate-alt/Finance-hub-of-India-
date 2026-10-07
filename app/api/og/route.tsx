import { ImageResponse } from "next/og";
import { NextRequest }   from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "FinanceHub — Finance Education for India";
  const sub   = searchParams.get("sub")   || "Learn. Practice. Master Finance.";

  return new ImageResponse(
    (
      <div style={{
        width:           "100%",
        height:          "100%",
        display:         "flex",
        flexDirection:   "column",
        background:      "#0B1A2B",
        padding:         "60px 64px",
        justifyContent:  "flex-end",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:"linear-gradient(135deg,#0E6163,#1D9E75)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>📈</div>
          <div style={{ display:"flex", flexDirection:"column" }}>
            <span style={{ fontSize:22, fontWeight:700, color:"#fff" }}>FinanceHub</span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em" }}>OF INDIA</span>
          </div>
        </div>
        {/* Title */}
        <div style={{ fontSize:52, fontWeight:800, color:"#fff", lineHeight:1.1, marginBottom:20, maxWidth:900 }}>
          {title}
        </div>
        {/* Subtitle */}
        <div style={{ fontSize:22, color:"rgba(255,255,255,0.55)", lineHeight:1.5 }}>
          {sub}
        </div>
        {/* Tagline */}
        <div style={{ marginTop:32, fontSize:16, color:"#1D9E75", fontWeight:600 }}>
          financehub.in — Free to start. No credit card.
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
