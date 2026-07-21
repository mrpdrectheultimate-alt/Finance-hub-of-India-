export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#fafafa",
      fontFamily: "system-ui,-apple-system,sans-serif",
      gap: 16,
    }}>
      <div style={{
        width: 44,
        height: 44,
        background: "#1D9E75",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: 20,
        animation: "pulse 1.5s ease-in-out infinite",
      }}>
        F
      </div>
      <div style={{
        display: "flex",
        gap: 6,
        alignItems: "center",
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#1D9E75",
            opacity: 0.4,
            animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}
