// ============================================================
// FinanceHub — Dynamic OG Image Generator
// app/api/og/route.tsx
// Generates 1200×630 social share images for every page
// Usage: /api/og?title=SIP+Calculator&sub=Free+India+SIP+tool
// ============================================================

import { ImageResponse } from "next/og";
import { NextRequest }   from "next/server";

export const runtime = "edge";

const BRAND_GREEN = "#1D9E75";
const BRAND_TEAL  = "#0E6163";
const BRAND_NAVY  = "#0B1A2B";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const title    = searchParams.get("title")    || "FinanceHub — Finance Education for India";
  const sub      = searchParams.get("sub")      || "Learn. Practice. Master Finance.";
  const track    = searchParams.get("track")    || "";
  const type     = searchParams.get("type")     || "page";
  const isFree   = searchParams.get("free")     === "1";
  const isHindi  = searchParams.get("hindi")    === "1";

  // Icon per type
  const icons: Record<string, string> = {
    page:      "📈",
    lesson:    "📖",
    track:     "🗺️",
    quiz:      "🎯",
    case:      "📋",
    practice:  "🧮",
    ai:        "🤖",
    library:   "📚",
    cert:      "🎓",
  };
  const icon = icons[type] || "📈";

  return new ImageResponse(
    (
      <div
        style={{
          width:           "100%",
          height:          "100%",
          display:         "flex",
          flexDirection:   "column",
          background:      BRAND_NAVY,
          padding:         "56px 64px",
          justifyContent:  "space-between",
          fontFamily:      "system-ui, -apple-system, sans-serif",
          position:        "relative",
        }}
      >
        {/* Background accent */}
        <div style={{
          position: "absolute",
          top: -120, right: -120,
          width: 480, height: 480,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND_TEAL}30 0%, transparent 70%)`,
        }} />
        <div style={{
          position: "absolute",
          bottom: -80, left: -80,
          width: 320, height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND_GREEN}20 0%, transparent 70%)`,
        }} />

        {/* Top: Logo + badges */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `linear-gradient(135deg, ${BRAND_TEAL}, ${BRAND_GREEN})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26,
            }}>
              📈
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
                Finance<span style={{ color: BRAND_GREEN }}>Hub</span>
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
                OF INDIA
              </span>
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: "flex", gap: 8 }}>
            {isFree && (
              <div style={{
                padding: "6px 14px", borderRadius: 20,
                background: `${BRAND_GREEN}25`,
                border: `1px solid ${BRAND_GREEN}60`,
                fontSize: 13, fontWeight: 600, color: BRAND_GREEN,
              }}>
                Free
              </div>
            )}
            {isHindi && (
              <div style={{
                padding: "6px 14px", borderRadius: 20,
                background: "rgba(185,28,28,0.2)",
                border: "1px solid rgba(185,28,28,0.5)",
                fontSize: 13, fontWeight: 600, color: "#FCA5A5",
              }}>
                🇮🇳 Hindi
              </div>
            )}
            {track && (
              <div style={{
                padding: "6px 14px", borderRadius: 20,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                fontSize: 13, color: "rgba(255,255,255,0.6)",
              }}>
                {track}
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", padding: "16px 0" }}>
          {/* Type icon */}
          <div style={{ fontSize: 52, marginBottom: 20 }}>{icon}</div>

          {/* Title */}
          <div style={{
            fontSize:   title.length > 60 ? 44 : title.length > 40 ? 52 : 60,
            fontWeight: 800,
            color:      "#ffffff",
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            marginBottom: 20,
            maxWidth:   900,
          }}>
            {title}
          </div>

          {/* Subtitle */}
          <div style={{
            fontSize:   22,
            color:      "rgba(255,255,255,0.5)",
            lineHeight: 1.5,
            maxWidth:   740,
          }}>
            {sub}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          paddingTop:     24,
          borderTop:      "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ fontSize: 16, color: BRAND_GREEN, fontWeight: 600 }}>
            financehub.in
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
            Free to start · No credit card · Hindi &amp; English
          </div>
        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
    }
  );
}
