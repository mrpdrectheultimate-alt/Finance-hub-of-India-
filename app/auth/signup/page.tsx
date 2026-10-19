"use client";

import SignupPage from "@/app/signup/page";

// Unified route: ensures /auth/signup uses the exact same branded,
// battle-tested registration experience as /signup.
export default function AuthSignupPage() {
  return <SignupPage />;
}
