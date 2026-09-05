"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FIRST_LEVEL_BY_TRACK: Record<string, string> = {
  "personal-finance": "beginner",
  "trading-markets": "markets-101",
  "crypto-defi": "crypto-basics",
  "corporate-finance": "business-basics",
  "behavioral-finance": "money-psychology",
  "forex-currency": "forex-basics",
  "technical-analysis": "chart-reading-fundamentals",
};

export default function TrackRedirectPage({ params }: { params: { slug: string } }) {
  const firstLevelSlug = FIRST_LEVEL_BY_TRACK[params.slug];
  const router = useRouter();

  useEffect(() => {
    router.replace(firstLevelSlug ? `/track/${params.slug}/${firstLevelSlug}` : "/explore");
  }, [firstLevelSlug, params.slug, router]);

  return (
    <div style={s.page}>
      <div style={s.logoMark}>F</div>
      <div style={s.title}>Opening track...</div>
      <Link href={firstLevelSlug ? `/track/${params.slug}/${firstLevelSlug}` : "/explore"} style={s.link}>
        Continue
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
    background: "#1D9E75",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },
  title: { fontSize: 14, color: "#555", fontWeight: 600 },
  link: { fontSize: 13, color: "#1D9E75", textDecoration: "none", fontWeight: 700 },
};
