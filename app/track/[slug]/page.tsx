"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CANONICAL_MAP: Record<string, string> = {
  "personal-finance": "personal-finance",
  pf: "personal-finance",
  "trading-markets": "trading-markets",
  "stock-market": "trading-markets",
  trading: "trading-markets",
  tm: "trading-markets",
  "crypto-defi": "crypto-defi",
  crypto: "crypto-defi",
  cr: "crypto-defi",
  "corporate-finance": "corporate-finance",
  cf: "corporate-finance",
  "behavioral-finance": "behavioral-finance",
  bf: "behavioral-finance",
  "forex-currency": "forex-currency",
  "forex-currencies": "forex-currency",
  fx: "forex-currency",
  "technical-analysis": "technical-analysis",
  ta: "technical-analysis",
  hi: "hindi",
  hindi: "hindi",
  "hindi-finance": "hindi",
};

export default function TrackRedirectPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const rawSlug = (params?.slug || "").toLowerCase().trim();
  const target = CANONICAL_MAP[rawSlug] || rawSlug;

  useEffect(() => {
    router.replace(`/tracks/${target}`);
  }, [target, router]);

  return (
    <div style={s.page}>
      <div style={s.logoMark}>F</div>
      <div style={s.title}>Opening track...</div>
      <Link href={`/tracks/${target}`} style={s.link}>
        Continue to Track Syllabus →
      </Link>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    background: "#fafafa",
    fontFamily: "system-ui,-apple-system,sans-serif",
  },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "#0E6163",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },
  title: { fontSize: 14, color: "#555", fontWeight: 600 },
  link: { fontSize: 13, color: "#0E6163", textDecoration: "none", fontWeight: 700 },
};
