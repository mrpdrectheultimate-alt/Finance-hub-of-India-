import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Finance Lesson";
  const track = searchParams.get("track") || "FinanceHub";
  const free = searchParams.get("free") === "true";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0D1117 0%, #1A2A40 60%, #0E6163 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 22, color: "#1D9E75", fontWeight: 700, marginBottom: 16 }}>
          FinanceHub · {track}
        </div>
        <div style={{ fontSize: 52, color: "#fff", fontWeight: 800, lineHeight: 1.2, maxWidth: 900 }}>
          {title}
        </div>
        {free && (
          <div
            style={{
              marginTop: 24,
              fontSize: 16,
              color: "#1D9E75",
              fontWeight: 600,
              background: "rgba(29,158,117,0.15)",
              padding: "8px 16px",
              borderRadius: 8,
            }}
          >
            🆓 Free Lesson
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
