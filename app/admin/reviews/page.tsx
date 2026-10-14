"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ReviewLesson = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  last_reviewed_at: string | null;
  next_review_due: string | null;
  needs_review: boolean;
  quality_score: number | null;
  updated_at: string;
  level?: {
    title: string;
    track?: {
      title: string;
      color_hex: string;
    };
  };
};

export default function AdminReviewQueuePage() {
  const [lessons, setLessons] = useState<ReviewLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "overdue" | "flagged" | "unreviewed">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("lessons")
      .select(`
        id, title, slug, is_published, last_reviewed_at, next_review_due,
        needs_review, quality_score, updated_at,
        level:levels (
          title,
          track:tracks (
            title,
            color_hex
          )
        )
      `)
      .order("next_review_due", { ascending: true, nullsFirst: true });

    if (!error && data) {
      setLessons(data as ReviewLesson[]);
    }
    setLoading(false);
  };

  const markReviewed = async (id: string) => {
    setUpdatingId(id);
    const now = new Date();
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + 90); // Next review in 90 days

    await (supabase as any)
      .from("lessons")
      .update({
        last_reviewed_at: now.toISOString(),
        next_review_due: nextDue.toISOString(),
        needs_review: false,
      })
      .eq("id", id);

    setLessons(prev =>
      prev.map(l =>
        l.id === id
          ? {
              ...l,
              last_reviewed_at: now.toISOString(),
              next_review_due: nextDue.toISOString(),
              needs_review: false,
            }
          : l
      )
    );
    setUpdatingId(null);
  };

  const isOverdue = (nextDue: string | null) => {
    if (!nextDue) return true;
    return new Date(nextDue) < new Date();
  };

  const filtered = lessons.filter(l => {
    if (filter === "overdue") return isOverdue(l.next_review_due);
    if (filter === "flagged") return l.needs_review;
    if (filter === "unreviewed") return !l.last_reviewed_at;
    return true;
  });

  const totalOverdue = lessons.filter(l => isOverdue(l.next_review_due)).length;
  const totalFlagged = lessons.filter(l => l.needs_review).length;
  const totalUnreviewed = lessons.filter(l => !l.last_reviewed_at).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "32px 24px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Navigation & Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Link href="/admin/dashboard" style={{ color: "#0E6163", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                ← Admin Dashboard
              </Link>
              <span style={{ color: "#cbd5e1" }}>/</span>
              <span style={{ color: "#64748b", fontSize: 13 }}>Content Review Queue</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0B1A2B", margin: 0 }}>
              📋 Content Review Queue
            </h1>
            <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>
              Audit lessons for regulatory updates, tax changes (Union Budget), and factual accuracy.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Link
              href="/admin/cms"
              style={{
                background: "#0E6163", color: "#fff", padding: "10px 18px", borderRadius: 8,
                textDecoration: "none", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6
              }}
            >
              ✏️ Open CMS
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Lessons", val: lessons.length, color: "#0B1A2B", bg: "#f1f5f9" },
            { label: "Overdue for Review", val: totalOverdue, color: "#b91c1c", bg: "#fef2f2" },
            { label: "Flagged / Needs Review", val: totalFlagged, color: "#d97706", bg: "#fffbeb" },
            { label: "Never Reviewed", val: totalUnreviewed, color: "#4f46e5", bg: "#eef2ff" },
          ].map((stat, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, marginTop: 4 }}>
                {stat.val}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { id: "all", label: `All (${lessons.length})` },
            { id: "overdue", label: `Overdue (${totalOverdue})` },
            { id: "flagged", label: `Flagged (${totalFlagged})` },
            { id: "unreviewed", label: `Unreviewed (${totalUnreviewed})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                border: filter === tab.id ? "1px solid #0E6163" : "1px solid #e2e8f0",
                background: filter === tab.id ? "#0E6163" : "#fff",
                color: filter === tab.id ? "#fff" : "#475569",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lessons Table */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr 130px 130px 140px", padding: "12px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".06em" }}>
            <span>Lesson</span>
            <span>Track & Level</span>
            <span>Last Review</span>
            <span>Next Due</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading lessons...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
              🎉 No lessons in this queue. Everything is up to date!
            </div>
          ) : (
            filtered.map((item) => {
              const overdue = isOverdue(item.next_review_due);
              return (
                <div
                  key={item.id}
                  style={{
                    display: "grid", gridTemplateColumns: "3fr 2fr 130px 130px 140px",
                    padding: "14px 20px", borderBottom: "1px solid #f1f5f9", alignItems: "center",
                    background: overdue ? "#fffdfd" : "#fff",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, color: "#0B1A2B", fontSize: 14 }}>
                        {item.title}
                      </span>
                      {item.needs_review && (
                        <span style={{ background: "#fef2f2", color: "#b91c1c", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                          FLAGGED
                        </span>
                      )}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>
                      /{item.slug}
                    </div>
                  </div>

                  <div>
                    <span style={{
                      display: "inline-block", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: item.level?.track?.color_hex ? `${item.level.track.color_hex}15` : "#e2e8f0",
                      color: item.level?.track?.color_hex || "#334155",
                    }}>
                      {item.level?.track?.title || "Track"} · {item.level?.title || "Level"}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: item.last_reviewed_at ? "#475569" : "#94a3b8" }}>
                    {item.last_reviewed_at ? new Date(item.last_reviewed_at).toLocaleDateString("en-IN") : "Never"}
                  </div>

                  <div>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: overdue ? "#b91c1c" : "#166534"
                    }}>
                      {item.next_review_due ? new Date(item.next_review_due).toLocaleDateString("en-IN") : "Overdue"}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button
                      onClick={() => markReviewed(item.id)}
                      disabled={updatingId === item.id}
                      style={{
                        background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0",
                        padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer"
                      }}
                    >
                      {updatingId === item.id ? "Saving..." : "✓ Reviewed"}
                    </button>
                    <Link
                      href={`/learn/${item.id}`}
                      target="_blank"
                      style={{
                        background: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1",
                        padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: "none"
                      }}
                    >
                      Preview ↗
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
