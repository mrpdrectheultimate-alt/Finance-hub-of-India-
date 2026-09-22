"use client";
import KnowledgeGraph from "@/components/learn/KnowledgeGraph";

// ============================================================
// FinanceHub — Interactive Knowledge Map Page
// app/knowledge-map/page.tsx
// Visualizes 50 financial concepts, prerequisites, & mastery
// ============================================================

export default function KnowledgeMapPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base, #f7f4ee)", fontFamily: "var(--font-ui, system-ui)" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0D1117 0%, #1a2a40 100%)",
        padding: "40px 24px 32px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1D9E75", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>
          Interactive Learning Graph
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 8 }}>
          Financial Knowledge Map
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
          Explore how 50 core financial concepts connect. See required prerequisites, track color codes, and your real-time concept mastery.
        </p>
      </div>

      {/* Main Visualizer Container */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <KnowledgeGraph height={620} showLegend />
        </div>
      </div>
    </div>
  );
}
