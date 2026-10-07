"use client";

import React from "react";
import * as Sentry from "@sentry/nextjs";

interface ErrorBoundaryState { hasError: boolean; errorId?: string; }
interface ErrorBoundaryProps { children: React.ReactNode; fallback?: React.ReactNode; }

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    try {
      Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
      console.error("FinanceHub error boundary caught:", error, info);
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center",
          justifyContent: "center", padding: 20, fontFamily: "system-ui",
        }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1c2b3a", marginBottom: 8 }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: 14, color: "#718096", marginBottom: 20, lineHeight: 1.6 }}>
              We&apos;ve logged this error and will fix it. Please reload the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "10px 24px", background: "#0E6163", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Reload page
            </button>
            <div style={{ marginTop: 12 }}>
              <a href="/" style={{ fontSize: 13, color: "#0E6163" }}>Go to homepage →</a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
