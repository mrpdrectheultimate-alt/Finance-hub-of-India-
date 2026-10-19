import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?:      "sm" | "md" | "lg";
  href?:      string;
  dark?:      boolean;   // true = white text (for dark backgrounds)
  iconOnly?:  boolean;  // true = just the icon, no text
  className?: string;
}

const SIZE_CONFIG = {
  sm: { icon: 28, height: 26, width: 120 },
  md: { icon: 36, height: 34, width: 155 },
  lg: { icon: 48, height: 44, width: 200 },
};

export default function Logo({
  size      = "md",
  href      = "/",
  dark      = false,
  iconOnly  = false,
  className = "",
}: LogoProps) {
  const cfg = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  const logoSrc = iconOnly
    ? "/logo-icon.png"
    : dark
    ? "/logo-horizontal-white.png"
    : "/logo-horizontal.png";

  const width = iconOnly ? cfg.icon : cfg.width;
  const height = iconOnly ? cfg.icon : cfg.height;

  const inner = (
    <span
      className={className}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        textDecoration: "none",
        userSelect:     "none",
      }}
    >
      <Image
        src={logoSrc}
        alt="FinanceHub"
        width={width}
        height={height}
        priority
        style={{
          height:    height,
          width:     iconOnly ? height : "auto",
          objectFit: "contain",
        }}
      />
    </span>
  );

  if (!href) return inner;

  return (
    <Link href={href} style={{ textDecoration: "none", display: "inline-flex" }}>
      {inner}
    </Link>
  );
}

// ─── Inline SVG version (fallback for emails / RSS, no React Image) ───────────────
export function LogoSVG({ width = 160 }: { width?: number }) {
  const h = Math.round(width * 0.25);
  return (
    <svg width={width} height={h * 2} viewBox={`0 0 ${width} ${h * 2}`} xmlns="http://www.w3.org/2000/svg">
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
      <text x={h * 2.2} y={h * 1.1} fontFamily="system-ui,sans-serif" fontSize={h * 0.9} fontWeight="800" fill="#1c2b3a">
        Finance<tspan fill="#0E6163">Hub</tspan>
      </text>
      <text x={h * 2.2} y={h * 1.8} fontFamily="system-ui,sans-serif" fontSize={h * 0.42} fontWeight="500" fill="#718096" letterSpacing="2">
        OF INDIA
      </text>
    </svg>
  );
}
