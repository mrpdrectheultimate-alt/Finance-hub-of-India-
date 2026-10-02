"use client";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeProvider";

export default function Navbar() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #e5eaf0",
      padding: "0 24px",
    }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Brand Logo */}
        <Logo size="md" href="/" />

        {/* Navigation links */}
        <div style={{ display: "flex", gap: 28, fontSize: 14, fontWeight: 500, color: "#526173" }}>
          <Link href="/explore" style={{ color: "inherit", textDecoration: "none" }}>Tracks</Link>
          <Link href="/practice" style={{ color: "inherit", textDecoration: "none" }}>Simulators</Link>
          <Link href="/library" style={{ color: "inherit", textDecoration: "none" }}>Library</Link>
          <Link href="/ai-tutor" style={{ color: "inherit", textDecoration: "none" }}>AI Mentor</Link>
          <Link href="/pricing" style={{ color: "inherit", textDecoration: "none" }}>Pricing</Link>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ThemeToggle />
          <Link href="/dashboard" style={{
            padding: "8px 18px", fontSize: 13, fontWeight: 600,
            background: "#0E6163", color: "#fff",
            borderRadius: 8, textDecoration: "none",
          }}>
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
