"use client";

import LoginPage from "@/app/login/page";

// Unified route: ensures /auth/login uses the exact same branded,
// battle-tested login experience as /login.
export default function AuthLoginPage() {
  return <LoginPage />;
}
