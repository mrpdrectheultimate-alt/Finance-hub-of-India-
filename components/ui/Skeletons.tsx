"use client";

// ============================================================
// FinanceHub — Skeleton Loading System
// Covers every data-loaded page to eliminate blank screens
// components/ui/Skeletons.tsx
// ============================================================

const shimmer: React.CSSProperties = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: 8,
};

// ─── Base skeleton block ──────────────────────────────────────
export function Skel({
  w = "100%",
  h = 16,
  r = 8,
  style = {},
}: {
  w?: string | number;
  h?: number;
  r?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ ...shimmer, width: w, height: h, borderRadius: r, flexShrink: 0, ...style }} />
  );
}

// ─── Dashboard skeleton ───────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div style={{ padding: "24px 20px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <Skel w={200} h={28} style={{ marginBottom: 8 }} />
          <Skel w={300} h={16} />
        </div>
        <Skel w={120} h={40} r={10} />
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
            <Skel w={40} h={40} r={10} style={{ marginBottom: 12 }} />
            <Skel w="60%" h={28} style={{ marginBottom: 6 }} />
            <Skel w="80%" h={14} />
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Left */}
        <div>
          <Skel w={180} h={20} style={{ marginBottom: 14 }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 16,
                marginBottom: 10,
                display: "flex",
                gap: 14,
              }}
            >
              <Skel w={56} h={56} r={10} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Skel w="70%" h={18} style={{ marginBottom: 8 }} />
                <Skel w="90%" h={14} style={{ marginBottom: 6 }} />
                <Skel w="40%" h={10} />
              </div>
            </div>
          ))}
        </div>

        {/* Right */}
        <div>
          <Skel w={140} h={20} style={{ marginBottom: 14 }} />
          <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                <Skel w={28} h={28} r={14} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Skel w="80%" h={14} style={{ marginBottom: 4 }} />
                  <Skel w="50%" h={10} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lesson player skeleton ───────────────────────────────────
export function LessonSkeleton() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <Skel w={80} h={14} />
        <Skel w={20} h={14} />
        <Skel w={120} h={14} />
        <Skel w={20} h={14} />
        <Skel w={160} h={14} />
      </div>

      {/* Title */}
      <Skel w="75%" h={36} style={{ marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <Skel w={80} h={22} r={12} />
        <Skel w={100} h={22} r={12} />
        <Skel w={70} h={22} r={12} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #eee", marginBottom: 24 }}>
        {["Learn", "Watch", "Notes", "Practice"].map((_, i) => (
          <Skel key={i} w={80} h={36} r={0} style={{ marginRight: 2 }} />
        ))}
      </div>

      {/* Content */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Skel
          key={i}
          h={i === 0 ? 24 : i % 4 === 0 ? 20 : 14}
          w={i % 3 === 2 ? "65%" : i % 3 === 1 ? "85%" : "100%"}
          style={{ marginBottom: i === 0 ? 14 : 8 }}
        />
      ))}

      {/* Callout box */}
      <div style={{ background: "#f0f9ff", borderRadius: 10, padding: 16, margin: "20px 0" }}>
        <Skel w="40%" h={16} style={{ marginBottom: 8 }} />
        <Skel w="90%" h={14} style={{ marginBottom: 6 }} />
        <Skel w="70%" h={14} />
      </div>

      {/* More content */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Skel key={i} h={14} w={i % 2 === 0 ? "100%" : "80%"} style={{ marginBottom: 8 }} />
      ))}

      {/* Complete button */}
      <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
        <Skel w={160} h={44} r={10} />
        <Skel w={120} h={44} r={10} />
      </div>
    </div>
  );
}

// ─── Library skeleton ─────────────────────────────────────────
export function LibrarySkeleton() {
  return (
    <div style={{ padding: "20px" }}>
      {/* Hero */}
      <div style={{ background: "#1a1a2e", borderRadius: 16, padding: "32px 28px", marginBottom: 22 }}>
        <Skel w={140} h={14} r={12} style={{ marginBottom: 12, background: "rgba(255,255,255,0.1)" }} />
        <Skel w="50%" h={40} style={{ marginBottom: 10, background: "rgba(255,255,255,0.15)" }} />
        <Skel w="70%" h={16} style={{ background: "rgba(255,255,255,0.1)" }} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" as const }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <Skel key={i} w={i === 0 ? 50 : 90 + i * 8} h={30} r={20} />
        ))}
      </div>

      {/* Main layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Player */}
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: 18 }}>
          <div style={{ aspectRatio: "16/9", background: "#1a1a2e", borderRadius: 10, marginBottom: 14 }}>
            <div
              style={{
                ...shimmer,
                width: "100%",
                height: "100%",
                borderRadius: 10,
                background: "linear-gradient(90deg, #1a1a2e 25%, #252540 50%, #1a1a2e 75%)",
              }}
            />
          </div>
          <Skel w="80%" h={20} style={{ marginBottom: 8 }} />
          <Skel w="40%" h={14} />
        </div>

        {/* Video list */}
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: "10px 8px" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "9px 10px", marginBottom: 4 }}>
              <Skel w={80} h={52} r={6} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Skel w="85%" h={13} style={{ marginBottom: 6 }} />
                <Skel w="55%" h={10} style={{ marginBottom: 5 }} />
                <Skel w="35%" h={10} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Simulator skeleton ───────────────────────────────────────
export function SimulatorSkeleton() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px" }}>
      <Skel w={200} h={32} style={{ marginBottom: 8 }} />
      <Skel w="60%" h={16} style={{ marginBottom: 28 }} />

      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <Skel w="40%" h={14} style={{ marginBottom: 8 }} />
            <Skel w="100%" h={44} r={9} />
          </div>
        ))}
        <Skel w="100%" h={48} r={10} style={{ marginTop: 8 }} />
      </div>

      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: 24, marginTop: 20 }}>
        <Skel w="50%" h={20} style={{ marginBottom: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ padding: 14, background: "#f8f8f8", borderRadius: 10 }}>
              <Skel w="60%" h={12} style={{ marginBottom: 8 }} />
              <Skel w="80%" h={28} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Notes skeleton ───────────────────────────────────────────
export function NotesSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        height: "calc(100vh - 120px)",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div style={{ borderRight: "1px solid #eee", padding: "14px 10px", background: "#f9f9f7" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <Skel w={120} h={22} />
          <Skel w={60} h={30} r={8} />
        </div>
        <Skel w="100%" h={36} r={8} style={{ marginBottom: 10 }} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 6 }}>
            <Skel w="80%" h={14} style={{ marginBottom: 6 }} />
            <Skel w="60%" h={11} style={{ marginBottom: 5 }} />
            <Skel w="90%" h={11} />
          </div>
        ))}
      </div>

      {/* Editor */}
      <div style={{ display: "flex", flexDirection: "column" as const, padding: "0" }}>
        <div style={{ padding: "8px 14px", borderBottom: "1px solid #eee", display: "flex", gap: 6 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <Skel key={i} w={i < 2 ? 80 : 36} h={30} r={6} />
          ))}
        </div>
        <div style={{ padding: "14px 20px" }}>
          <Skel w="60%" h={32} style={{ marginBottom: 16 }} />
          {Array.from({ length: 10 }).map((_, i) => (
            <Skel key={i} h={14} w={i % 3 === 2 ? "70%" : "100%"} style={{ marginBottom: 8 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Profile skeleton ─────────────────────────────────────────
export function ProfileSkeleton() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 28 }}>
        <Skel w={80} h={80} r={40} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <Skel w={200} h={28} style={{ marginBottom: 8 }} />
          <Skel w={150} h={16} style={{ marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <Skel w={90} h={24} r={12} />
            <Skel w={80} h={24} r={12} />
          </div>
        </div>
        <Skel w={130} h={42} r={10} />
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
            <Skel w="50%" h={32} style={{ marginBottom: 6 }} />
            <Skel w="70%" h={14} />
          </div>
        ))}
      </div>

      {/* Badges */}
      <Skel w={100} h={20} style={{ marginBottom: 14 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 24 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 16,
              textAlign: "center" as const,
            }}
          >
            <Skel w={48} h={48} r={24} style={{ margin: "0 auto 8px" }} />
            <Skel w="80%" h={12} style={{ margin: "0 auto" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Leaderboard skeleton ─────────────────────────────────────
export function LeaderboardSkeleton() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px" }}>
      <Skel w={180} h={32} style={{ marginBottom: 8 }} />
      <Skel w="50%" h={16} style={{ marginBottom: 24 }} />
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 8,
          }}
        >
          <Skel w={32} h={32} r={6} style={{ flexShrink: 0 }} />
          <Skel w={40} h={40} r={20} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Skel w="50%" h={16} style={{ marginBottom: 5 }} />
            <Skel w="30%" h={12} />
          </div>
          <Skel w={80} h={24} r={12} />
        </div>
      ))}
    </div>
  );
}

// ─── Generic card grid skeleton ───────────────────────────────
export function CardGridSkeleton({ count = 6, cols = 3 }: { count?: number; cols?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 14,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 18 }}>
          <Skel h={140} style={{ marginBottom: 14 }} />
          <Skel w="75%" h={20} style={{ marginBottom: 8 }} />
          <Skel w="90%" h={14} style={{ marginBottom: 6 }} />
          <Skel w="50%" h={14} />
        </div>
      ))}
    </div>
  );
}
