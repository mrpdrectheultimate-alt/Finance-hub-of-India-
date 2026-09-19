"use client";

import React, { Component, type ReactNode } from "react";

// ============================================================
// FinanceHub — Error Boundary System
// Catches all React errors and shows user-friendly messages
// components/ui/ErrorBoundary.tsx
// ============================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string; // e.g. "lesson player", "quiz", "library"
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log to Sentry if available
    if (typeof window !== "undefined" && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: info });
    }
    console.error(`[ErrorBoundary:${this.props.context}]`, error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <ErrorCard
          context={this.props.context || "page"}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

// ─── User-friendly error card ─────────────────────────────────
function ErrorCard({ context, onRetry }: { context: string; onRetry: () => void }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px 24px",
        background: "#FFF5F5",
        border: "1px solid #FED7D7",
        borderRadius: 14,
        margin: "20px 0",
        fontFamily: "var(--font-ui, system-ui)",
      }}
    >
      <div style={{ fontSize: 44, marginBottom: 14 }}>⚠️</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#C53030", marginBottom: 8 }}>
        Something went wrong
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "#742A2A",
          lineHeight: 1.6,
          marginBottom: 20,
          maxWidth: 400,
          margin: "0 auto 20px",
        }}
      >
        The {context} couldn&apos;t load. This is usually a temporary issue. Please try again or refresh
        the page.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button
          onClick={onRetry}
          style={{
            padding: "9px 20px",
            background: "#C53030",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-ui, system-ui)",
          }}
          type="button"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "9px 20px",
            background: "#fff",
            color: "#C53030",
            border: "1px solid #FEB2B2",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-ui, system-ui)",
          }}
          type="button"
        >
          Refresh page
        </button>
      </div>
      <p style={{ fontSize: 12, color: "#A0AEC0", marginTop: 16 }}>
        If this keeps happening, contact{" "}
        <a href="mailto:support@financehub.in" style={{ color: "#C53030" }}>
          support@financehub.in
        </a>
      </p>
    </div>
  );
}

// ─── Inline error message (for API errors) ────────────────────
interface InlineErrorProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  type?: "error" | "warning" | "info";
}

export function InlineError({ message, onDismiss, onRetry, type = "error" }: InlineErrorProps) {
  const styles = {
    error: { bg: "#FFF5F5", border: "#FEB2B2", color: "#C53030", icon: "⚠️" },
    warning: { bg: "#FFFBEB", border: "#FBD38D", color: "#B7791F", icon: "⚠️" },
    info: { bg: "#EBF8FF", border: "#90CDF4", color: "#2B6CB0", icon: "ℹ️" },
  }[type];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: 10,
        margin: "12px 0",
        fontFamily: "var(--font-ui, system-ui)",
      }}
    >
      <span style={{ flexShrink: 0, fontSize: 16 }}>{styles.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, color: styles.color, lineHeight: 1.5, margin: 0 }}>
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              marginTop: 8,
              fontSize: 13,
              fontWeight: 600,
              color: styles.color,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
            type="button"
          >
            Try again →
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: styles.color,
            fontSize: 16,
            padding: 0,
            flexShrink: 0,
          }}
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ─── Empty state component ────────────────────────────────────
interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  action?: { label: string; onClick?: () => void; href?: string };
  style?: React.CSSProperties;
}

export function EmptyState({ icon, title, subtitle, action, style }: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 24px",
        fontFamily: "var(--font-ui, system-ui)",
        ...style,
      }}
    >
      <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary,#1c2b3a)", marginBottom: 8 }}>
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-muted,#718096)",
          lineHeight: 1.7,
          maxWidth: 360,
          margin: "0 auto 20px",
        }}
      >
        {subtitle}
      </p>
      {action &&
        (action.href ? (
          <a
            href={action.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 22px",
              background: "var(--accent,#0E6163)",
              color: "#fff",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {action.label} →
          </a>
        ) : (
          <button
            onClick={action.onClick}
            style={{
              padding: "10px 22px",
              background: "var(--accent,#0E6163)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-ui, system-ui)",
            }}
            type="button"
          >
            {action.label} →
          </button>
        ))}
    </div>
  );
}

// ─── Pre-built empty states for each section ──────────────────
export const EMPTY_STATES = {
  dashboard: {
    icon: "📚",
    title: "Start your finance journey",
    subtitle:
      "You haven't completed any lessons yet. Pick a track and start learning — your first lesson takes just 7 minutes.",
    action: { label: "Explore tracks", href: "/explore" },
  },
  notes: {
    icon: "📝",
    title: "Your notebook is empty",
    subtitle:
      "Take notes while reading lessons or watching videos. Notes are saved to the cloud and sync across all your devices.",
    action: { label: "Start a note" },
  },
  library: {
    icon: "▶",
    title: "No videos in this category",
    subtitle: "Try a different category or search term to find relevant videos.",
  },
  progress: {
    icon: "📊",
    title: "No progress yet",
    subtitle: "Complete your first lesson to start tracking your learning journey.",
    action: { label: "Find a lesson", href: "/explore" },
  },
  quiz: {
    icon: "🎯",
    title: "No quiz attempts yet",
    subtitle: "Complete lessons and take quizzes to test your knowledge.",
  },
  leaderboard: {
    icon: "🏆",
    title: "Leaderboard is empty",
    subtitle: "Be the first to earn XP! Complete lessons and quizzes to claim the top spot.",
    action: { label: "Start earning XP", href: "/explore" },
  },
  search: {
    icon: "🔍",
    title: "No results found",
    subtitle: "Try different keywords or browse by category.",
  },
  bookmarks: {
    icon: "🔖",
    title: "No bookmarks yet",
    subtitle: "Bookmark lessons, videos, and resources to find them quickly later.",
    action: { label: "Browse lessons", href: "/explore" },
  },
};
