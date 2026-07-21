"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type MasteryTopic = {
  mastery_score: number;
  topic?: {
    title?: string;
    track_slug?: string;
    difficulty?: number;
  } | null;
};

type MasteryOverview = {
  totalTopics: number;
  mastered: number;
  learning: number;
  weak: number;
  avgMastery: number;
  topics: MasteryTopic[];
};

type WeakTopic = {
  lesson_id: string;
  lesson_title: string;
  topic_title: string;
  mastery_score: number;
};

type DueReview = {
  lesson_id: string;
  lesson_title: string;
  topic_title: string;
  mastery_score: number;
  days_overdue: number;
  priority: number;
};

const TRACK_COLORS: Record<string, string> = {
  "personal-finance": "#1D9E75",
  "trading-markets": "#185FA5",
  "crypto-defi": "#854F0B",
  "corporate-finance": "#534AB7",
};

const TRACK_LABELS: Record<string, string> = {
  "personal-finance": "Personal Finance",
  "trading-markets": "Trading",
  "crypto-defi": "Crypto",
  "corporate-finance": "Corporate",
};

export default function MasteryDashboard() {
  const [mastery, setMastery] = useState<MasteryOverview | null>(null);
  const [weak, setWeak] = useState<WeakTopic[]>([]);
  const [reviews, setReviews] = useState<DueReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${session.access_token}` };
      const [overviewRes, weakRes, reviewsRes] = await Promise.all([
        fetch("/api/mastery", { headers }),
        fetch("/api/mastery?type=weak", { headers }),
        fetch("/api/mastery?type=reviews", { headers }),
      ]);

      const [overview, weakData, reviewsData] = await Promise.all([
        overviewRes.json(),
        weakRes.json(),
        reviewsRes.json(),
      ]);

      if (!overviewRes.ok) throw new Error(overview.error || "Failed to load mastery data");

      setMastery(overview);
      setWeak(weakData.weakTopics || []);
      setReviews(reviewsData.dueReviews || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mastery data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={s.loading}>
        <div style={s.spinner} />
        <span style={s.loadingText}>Loading mastery...</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={s.empty}>
        <div style={s.emptyTitle}>Mastery data is unavailable</div>
        <div style={s.emptyText}>{error}</div>
        <button type="button" onClick={load} style={s.primaryButton}>
          Try again
        </button>
      </div>
    );
  }

  const byTrack: Record<string, MasteryTopic[]> = {};
  (mastery?.topics || []).forEach((topic) => {
    const trackSlug = topic.topic?.track_slug || "other";
    if (!byTrack[trackSlug]) byTrack[trackSlug] = [];
    byTrack[trackSlug].push(topic);
  });

  const trackAverages = Object.entries(byTrack).map(([slug, topics]) => ({
    slug,
    avg: topics.length
      ? Math.round(topics.reduce((sum, topic) => sum + topic.mastery_score, 0) / topics.length)
      : 0,
    count: topics.length,
  }));

  return (
    <div style={s.wrap}>
      <h2 style={s.title}>Your mastery map</h2>
      <p style={s.subtitle}>Knowledge depth across your finance topics.</p>

      <div style={s.statsGrid}>
        {[
          { label: "Mastered", value: mastery?.mastered || 0, bg: "#E1F5EE", color: "#0F6E56" },
          { label: "In progress", value: mastery?.learning || 0, bg: "#FAEEDA", color: "#854F0B" },
          { label: "Needs work", value: mastery?.weak || 0, bg: "#FEF2F2", color: "#B91C1C" },
          { label: "Avg mastery", value: `${mastery?.avgMastery || 0}%`, bg: "#EEEDFE", color: "#534AB7" },
        ].map((stat) => (
          <div key={stat.label} style={{ ...s.stat, background: stat.bg }}>
            <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {trackAverages.length > 0 ? (
        <section style={s.panel}>
          <div style={s.panelTitle}>Mastery by track</div>
          {trackAverages.map((track) => {
            const color = TRACK_COLORS[track.slug] || "#1D9E75";
            return (
              <div key={track.slug} style={s.trackRow}>
                <div style={s.trackHeader}>
                  <span style={s.trackName}>{TRACK_LABELS[track.slug] || track.slug}</span>
                  <span style={s.trackScore}>
                    {track.avg}% · {track.count} topics
                  </span>
                </div>
                <div style={s.progressRail}>
                  <div style={{ ...s.progressFill, width: `${track.avg}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section style={s.panel}>
          <div style={s.panelTitle}>Due for review</div>
          {reviews.map((review) => (
            <Link key={`${review.lesson_id}-${review.topic_title}`} href={`/learn/${review.lesson_id}`} style={s.itemLink}>
              <div>
                <div style={s.itemTitle}>{review.topic_title}</div>
                <div style={s.itemSubtitle}>{review.lesson_title}</div>
              </div>
              <div style={s.itemMeta}>{review.days_overdue > 0 ? `${review.days_overdue}d overdue` : "Due today"}</div>
            </Link>
          ))}
        </section>
      ) : null}

      {weak.length > 0 ? (
        <section style={s.panel}>
          <div style={s.panelTitle}>Needs attention</div>
          {weak.map((topic) => (
            <Link key={`${topic.lesson_id}-${topic.topic_title}`} href={`/learn/${topic.lesson_id}`} style={s.itemLink}>
              <div style={{ flex: 1 }}>
                <div style={s.itemTitle}>{topic.topic_title}</div>
                <div style={s.itemSubtitle}>{topic.lesson_title}</div>
              </div>
              <div style={s.miniProgress}>
                <div style={s.miniRail}>
                  <div style={{ ...s.miniFill, width: `${topic.mastery_score}%` }} />
                </div>
                <span style={s.weakScore}>{topic.mastery_score}%</span>
                <span style={s.reviewText}>Review</span>
              </div>
            </Link>
          ))}
        </section>
      ) : null}

      {mastery?.totalTopics === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyTitle}>Your mastery map is empty</div>
          <div style={s.emptyText}>Complete lessons and quizzes to build your knowledge map.</div>
          <Link href="/explore" style={s.primaryButton}>
            Start learning
          </Link>
        </div>
      ) : null}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { fontFamily: "system-ui,-apple-system,sans-serif", padding: "0 0 32px" },
  title: { fontSize: 18, fontWeight: 700, color: "#0a0a0a", margin: "0 0 4px" },
  subtitle: { fontSize: 13, color: "#888", margin: "0 0 20px" },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 12, fontFamily: "system-ui" },
  spinner: { width: 28, height: 28, border: "3px solid #eee", borderTop: "3px solid #1D9E75", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loadingText: { color: "#888", fontSize: 13 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 18 },
  stat: { borderRadius: 10, padding: "14px 12px" },
  statValue: { fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 3 },
  statLabel: { fontSize: 11, color: "#666" },
  panel: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "16px 18px", marginBottom: 16 },
  panelTitle: { fontSize: 13, fontWeight: 700, color: "#0a0a0a", marginBottom: 12 },
  trackRow: { marginBottom: 12 },
  trackHeader: { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 },
  trackName: { fontSize: 13, fontWeight: 600, color: "#222" },
  trackScore: { fontSize: 12, color: "#888" },
  progressRail: { height: 8, background: "#eee", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  itemLink: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, borderTop: "0.5px solid #f0f0f0", padding: "11px 0", textDecoration: "none" },
  itemTitle: { fontSize: 13, fontWeight: 700, color: "#0a0a0a", marginBottom: 2 },
  itemSubtitle: { fontSize: 11, color: "#aaa" },
  itemMeta: { fontSize: 11, fontWeight: 700, color: "#854F0B", whiteSpace: "nowrap" },
  miniProgress: { display: "flex", alignItems: "center", gap: 8 },
  miniRail: { width: 50, height: 5, background: "#eee", borderRadius: 3, overflow: "hidden" },
  miniFill: { height: "100%", background: "#EF4444", borderRadius: 3 },
  weakScore: { fontSize: 11, fontWeight: 700, color: "#B91C1C" },
  reviewText: { fontSize: 11, color: "#1D9E75", fontWeight: 700 },
  empty: { textAlign: "center", padding: "32px 20px", background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12 },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: "#0a0a0a", marginBottom: 6 },
  emptyText: { fontSize: 13, color: "#888", marginBottom: 16 },
  primaryButton: { display: "inline-block", padding: "10px 22px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 9, textDecoration: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" },
};
