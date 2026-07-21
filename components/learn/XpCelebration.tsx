"use client";

import { useEffect, useState } from "react";

interface XpCelebrationProps {
  xp: number;
  reason: string;
  badge?: string | null;
  onClose: () => void;
}

type Particle = {
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
};

export default function XpCelebration({ xp, reason, badge, onClose }: XpCelebrationProps) {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ["#1D9E75", "#FAC775", "#B5D4F4", "#CECBF6", "#F5C4B3", "#C0DD97"];
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        x: 20 + Math.random() * 60,
        y: -10,
        color: colors[i % colors.length],
        size: 4 + Math.random() * 6,
        angle: Math.random() * 360,
      })),
    );

    requestAnimationFrame(() => setVisible(true));

    const timeout = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3500);

    return () => clearTimeout(timeout);
  }, [onClose]);

  const dismiss = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      <div onClick={dismiss} style={{ position: "fixed", inset: 0, zIndex: 199 }} />

      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 200,
          background: "#fff",
          border: "0.5px solid #e5e5e5",
          borderRadius: 16,
          padding: "20px 24px",
          maxWidth: 280,
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          opacity: visible ? 1 : 0,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          fontFamily: "system-ui,-apple-system,sans-serif",
          overflow: "hidden",
        }}
      >
        {particles.map((particle, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${particle.x}%`,
              top: visible ? `${110 + i * 8}%` : `${particle.y}px`,
              width: particle.size,
              height: particle.size,
              background: particle.color,
              borderRadius: i % 3 === 0 ? "50%" : 2,
              transform: `rotate(${particle.angle}deg)`,
              transition: `top ${1.2 + i * 0.08}s cubic-bezier(0.25, 1, 0.5, 1) ${i * 0.04}s`,
              pointerEvents: "none",
            }}
          />
        ))}

        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: "#1D9E75",
              letterSpacing: "-1px",
              lineHeight: 1,
              transform: visible ? "scale(1)" : "scale(0.5)",
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s",
            }}
          >
            +{xp} XP
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#aaa",
              marginTop: 4,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            {reason}
          </div>
        </div>

        {badge ? (
          <div
            style={{
              background: "#E1F5EE",
              border: "0.5px solid #9FE1CB",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13, color: "#04342C" }}>Badge unlocked</div>
            <div style={{ fontSize: 12, color: "#0F6E56", marginTop: 2 }}>{badge}</div>
          </div>
        ) : null}

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0a0a0a", marginBottom: 4 }}>
            {xp >= 50 ? "Excellent work" : "Keep going"}
          </div>
          <div style={{ fontSize: 12, color: "#888" }}>Click anywhere to continue</div>
        </div>
      </div>
    </>
  );
}
