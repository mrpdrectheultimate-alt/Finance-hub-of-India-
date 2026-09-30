import Link from "next/link";

interface LogoProps {
  size?:    "sm" | "md" | "lg";
  href?:    string;
  dark?:    boolean;   // true = white text (for dark backgrounds)
  iconOnly?: boolean;  // true = just the icon, no text
}

const SIZE_CONFIG = {
  sm: { icon: 28, iconFont: 14, textSize: 15, gap: 8,  radius: 8  },
  md: { icon: 36, iconFont: 18, textSize: 18, gap: 10, radius: 10 },
  lg: { icon: 48, iconFont: 24, textSize: 24, gap: 12, radius: 14 },
};

export default function Logo({
  size     = "md",
  href     = "/",
  dark     = false,
  iconOnly = false,
}: LogoProps) {
  const cfg = SIZE_CONFIG[size];

  const inner = (
    <span style={{
      display:    "inline-flex",
      alignItems: "center",
      gap:        cfg.gap,
      textDecoration: "none",
      userSelect: "none",
    }}>
      {/* Icon mark — coin + chart symbol */}
      <span style={{
        width:          cfg.icon,
        height:         cfg.icon,
        borderRadius:   cfg.radius,
        background:     "linear-gradient(135deg, #0E6163 0%, #1D9E75 100%)",
        display:        "inline-flex",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:     0,
        boxShadow:      "0 2px 8px rgba(14,97,99,0.35)",
        position:       "relative",
        overflow:       "hidden",
      }}>
        {/* Chart bars SVG mark */}
        <svg
          width={cfg.iconFont}
          height={cfg.iconFont}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rupee symbol stylised as bar chart */}
          <rect x="2"  y="10" width="3" height="8"  rx="1" fill="rgba(255,255,255,0.6)" />
          <rect x="7"  y="6"  width="3" height="12" rx="1" fill="rgba(255,255,255,0.8)" />
          <rect x="12" y="2"  width="3" height="16" rx="1" fill="rgba(255,255,255,1)"   />
          {/* Trend line */}
          <path
            d="M2 12 L7 8 L12 4 L17 2"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Dot at tip */}
          <circle cx="17" cy="2" r="1.5" fill="#fff" />
        </svg>
      </span>

      {/* Text mark */}
      {!iconOnly && (
        <span style={{
          display:       "inline-flex",
          flexDirection: "column",
          lineHeight:    1.1,
        }}>
          <span style={{
            fontSize:    cfg.textSize,
            fontWeight:  800,
            letterSpacing: "-0.4px",
            fontFamily:  "var(--font-ui, system-ui)",
            color:       dark ? "#ffffff" : "#1c2b3a",
            lineHeight:  1,
          }}>
            Finance<span style={{ color: "#0E6163" }}>Hub</span>
          </span>
          {size !== "sm" && (
            <span style={{
              fontSize:    cfg.textSize * 0.48,
              fontWeight:  500,
              color:       dark ? "rgba(255,255,255,0.55)" : "#718096",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontFamily:  "var(--font-ui, system-ui)",
              marginTop:   2,
            }}>
              of India
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (!href) return inner;

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  );
}

// ─── Inline SVG version (for emails, no React) ───────────────
export function LogoSVG({ width = 160 }: { width?: number }) {
  const h = Math.round(width * 0.25);
  return (
    <svg width={width} height={h * 2} viewBox={`0 0 ${width} ${h * 2}`} xmlns="http://www.w3.org/2000/svg">
      {/* Icon */}
      <rect x="0" y="0" width={h * 2} height={h * 2} rx={h * 0.3} fill="url(#grad)" />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#0E6163" />
          <stop offset="100%" stopColor="#1D9E75" />
        </linearGradient>
      </defs>
      <rect x={h * 0.3}  y={h * 1.1} width={h * 0.35} height={h * 0.8}  rx={2} fill="rgba(255,255,255,0.6)" />
      <rect x={h * 0.75} y={h * 0.7} width={h * 0.35} height={h * 1.2}  rx={2} fill="rgba(255,255,255,0.8)" />
      <rect x={h * 1.2}  y={h * 0.25} width={h * 0.35} height={h * 1.65} rx={2} fill="#fff" />
      {/* Text */}
      <text x={h * 2.2} y={h * 1.1} fontFamily="system-ui,sans-serif" fontSize={h * 0.9} fontWeight="800" fill="#1c2b3a">
        Finance<tspan fill="#0E6163">Hub</tspan>
      </text>
      <text x={h * 2.2} y={h * 1.8} fontFamily="system-ui,sans-serif" fontSize={h * 0.42} fontWeight="500" fill="#718096" letterSpacing="2">
        OF INDIA
      </text>
    </svg>
  );
}
