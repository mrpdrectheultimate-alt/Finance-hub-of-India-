"use client";

export default function SecurityBadges() {
  const BADGES = [
    { icon: "🔒", title: "256-bit Encryption", sub: "TLS 1.3 Secure Data" },
    { icon: "📜", title: "DPDP Act 2023", sub: "India Data Privacy Compliant" },
    { icon: "💳", title: "Razorpay Verified", sub: "PCI-DSS Payment Gateway" },
    { icon: "🏛️", title: "RBI & SEBI Context", sub: "Grounded in Official Sources" },
  ];

  return (
    <div style={s.container}>
      {BADGES.map((b, idx) => (
        <div key={idx} style={s.card}>
          <span style={s.icon}>{b.icon}</span>
          <div>
            <div style={s.title}>{b.title}</div>
            <div style={s.sub}>{b.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    margin: "24px 0",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "10px",
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },
  icon: {
    fontSize: "20px",
  },
  title: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#111827",
  },
  sub: {
    fontSize: "11px",
    color: "#6B7280",
  },
};
