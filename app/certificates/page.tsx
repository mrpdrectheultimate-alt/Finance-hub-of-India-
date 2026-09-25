"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Profile, Track } from "@/types/database";
import CertificateGenerator from "@/components/certificates/CertificateGenerator";

type TrackWithProgress = Track & {
  totalLessons: number;
  completedLessons: number;
  isComplete: boolean;
};

export default function CertificatesPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tracks, setTracks] = useState<TrackWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCert, setActiveCert] = useState<{ slug: string; title: string } | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const [{ data: prof }, { data: allTracks }, { data: progress }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("tracks").select("*").eq("is_active", true).order("order_index"),
      supabase.from("user_progress").select("lesson_id").eq("user_id", user.id),
    ]);

    setProfile(prof as any);
    const completedIds = new Set(progress?.map((item) => item.lesson_id) || []);

    if (allTracks) {
      const tracksWithProgress = await Promise.all(
        (allTracks as any[]).map(async (track: any) => {
          const { data: levels } = await supabase.from("levels").select("id").eq("track_id", track.id);
          const levelIds = (levels as any[])?.map((level: any) => level.id) || [];

          const { data: lessons } = levelIds.length
            ? await supabase.from("lessons").select("id").in("level_id", levelIds).eq("is_published", true)
            : { data: [] };

          const total = (lessons as any[])?.length || 0;
          const completed = (lessons as any[])?.filter((lesson: any) => completedIds.has(lesson.id)).length || 0;

          return {
            ...track,
            totalLessons: total,
            completedLessons: completed,
            isComplete: total > 0 && completed === total,
          };
        }),
      );

      setTracks(tracksWithProgress);
    }

    setLoading(false);
  };

  const isPro = profile?.role === "pro" || profile?.role === "expert";

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <Link href="/dashboard" style={s.back}>
          ← Dashboard
        </Link>

        <div style={s.header}>
          <h1 style={s.title}>Certificates</h1>
          <p style={s.sub}>Complete a track to earn a shareable certificate of completion.</p>
        </div>

        {!profile ? (
          <div style={s.upgradeBar}>
            <div>
              <div style={s.upgradeTitle}>Log in to view certificates</div>
              <div style={s.upgradeSub}>Your track progress and certificates appear after signing in.</div>
            </div>
            <Link href="/auth/login" style={s.upgradeBtn}>
              Log in
            </Link>
          </div>
        ) : null}

        {profile && !isPro ? (
          <div style={s.upgradeBar}>
            <div>
              <div style={s.upgradeTitle}>Certificates require Pro or Expert plan</div>
              <div style={s.upgradeSub}>Upgrade to unlock certificates on all completed tracks.</div>
            </div>
            <Link href="/pricing" style={s.upgradeBtn}>
              Upgrade to Pro
            </Link>
          </div>
        ) : null}

        {loading ? (
          <div style={s.loadingWrap}>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} style={s.skeleton} />
            ))}
          </div>
        ) : (
          <div style={s.grid}>
            {tracks.map((track) => {
              const percent = track.totalLessons > 0 ? Math.round((track.completedLessons / track.totalLessons) * 100) : 0;

              return (
                <div key={track.id} style={{ ...s.trackCard, ...(track.isComplete ? s.trackCardComplete : {}) }}>
                  <div style={{ ...s.trackTop, background: `${track.color_hex}22` }}>
                    <div style={s.trackIcon}>{track.icon || "F"}</div>
                    <div style={s.trackInfo}>
                      <div style={s.trackTitle}>{track.title}</div>
                      <div style={s.trackMeta}>
                        {track.completedLessons} / {track.totalLessons} lessons
                      </div>
                    </div>
                    {track.isComplete ? <div style={s.completeBadge}>Complete</div> : null}
                  </div>

                  <div style={s.progressWrap}>
                    <div style={s.progressTrack}>
                      <div style={{ ...s.progressFill, width: `${percent}%`, background: track.color_hex }} />
                    </div>
                    <span style={s.progressPct}>{percent}%</span>
                  </div>

                  {track.isComplete ? (
                    <div style={s.certReady}>
                      <div style={s.certPreview}>
                        <div style={s.certF}>F</div>
                        <div style={s.certName}>Certificate of Completion</div>
                        <div style={{ ...s.certTrackName, color: track.color_hex }}>{track.title}</div>
                      </div>
                      <button
                        onClick={() => (isPro ? setActiveCert({ slug: track.slug, title: track.title }) : null)}
                        style={{ ...s.claimBtn, background: isPro ? track.color_hex : "#ccc", cursor: isPro ? "pointer" : "not-allowed" }}
                        type="button"
                      >
                        {isPro ? "Download certificate" : "Requires Pro"}
                      </button>
                    </div>
                  ) : (
                    <div style={s.inProgress}>
                      <div style={s.inProgressText}>{track.totalLessons - track.completedLessons} lessons remaining to unlock certificate</div>
                      <Link href={`/track/${track.slug}`} style={{ ...s.continueBtn, borderColor: track.color_hex, color: track.color_hex }}>
                        Continue learning →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={s.howSection}>
          <h2 style={s.howTitle}>How certificates work</h2>
          <div style={s.howGrid}>
            {[
              { title: "Complete all lessons", desc: "Finish every published lesson in a learning track, including quizzes." },
              { title: "Upgrade to Pro", desc: "Certificates are a Pro and Expert feature. Free users can track progress." },
              { title: "Generate your PDF", desc: "Click download certificate and your personalised PDF generates instantly." },
              { title: "Share anywhere", desc: "Add to LinkedIn, paste on your resume, or share the verification link." },
            ].map((step, index) => (
              <div key={step.title} style={s.howCard}>
                <div style={s.howIcon}>{index + 1}</div>
                <div style={s.howCardTitle}>{step.title}</div>
                <div style={s.howCardDesc}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeCert ? <CertificateGenerator trackSlug={activeCert.slug} trackTitle={activeCert.title} onClose={() => setActiveCert(null)} /> : null}
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui, -apple-system, sans-serif", padding: "28px 20px 60px" },
  inner: { maxWidth: 800, margin: "0 auto" },
  back: { fontSize: 13, color: "#888", textDecoration: "none", display: "block", marginBottom: 16 },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700, letterSpacing: 0, margin: "0 0 6px", color: "#0a0a0a" },
  sub: { fontSize: 14, color: "#666", margin: 0 },
  upgradeBar: { background: "#0a0a0a", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 },
  upgradeTitle: { fontWeight: 600, fontSize: 14, color: "#fff", marginBottom: 3 },
  upgradeSub: { fontSize: 12, color: "#aaa" },
  upgradeBtn: { padding: "9px 18px", background: "#1D9E75", color: "#fff", borderRadius: 9, textDecoration: "none", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" },
  loadingWrap: { display: "flex", flexDirection: "column", gap: 14 },
  skeleton: { height: 180, background: "#eee", borderRadius: 14 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginBottom: 40 },
  trackCard: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 14, overflow: "hidden" },
  trackCardComplete: { border: "0.5px solid #9FE1CB" },
  trackTop: { display: "flex", alignItems: "center", gap: 12, padding: "16px 18px" },
  trackIcon: { width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#0a0a0a", background: "rgba(255,255,255,.55)", flexShrink: 0 },
  trackInfo: { flex: 1 },
  trackTitle: { fontWeight: 600, fontSize: 15, color: "#0a0a0a" },
  trackMeta: { fontSize: 12, color: "#888", marginTop: 2 },
  completeBadge: { fontSize: 11, fontWeight: 700, color: "#0F6E56", background: "#E1F5EE", padding: "3px 10px", borderRadius: 20 },
  progressWrap: { display: "flex", alignItems: "center", gap: 10, padding: "0 18px 14px" },
  progressTrack: { flex: 1, height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3, transition: "width .5s" },
  progressPct: { fontSize: 12, fontWeight: 600, color: "#888", minWidth: 32, textAlign: "right" },
  certReady: { padding: "0 18px 18px" },
  certPreview: { background: "#fafafa", border: "0.5px solid #eee", borderRadius: 8, padding: 14, marginBottom: 12, textAlign: "center" },
  certF: { fontSize: 16, fontWeight: 700, color: "#1D9E75", marginBottom: 4 },
  certName: { fontSize: 9, color: "#aaa", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 },
  certTrackName: { fontSize: 13, fontWeight: 700 },
  claimBtn: { width: "100%", padding: "10px", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 9, color: "#fff", fontFamily: "system-ui" },
  inProgress: { padding: "0 18px 18px" },
  inProgressText: { fontSize: 12, color: "#aaa", marginBottom: 10 },
  continueBtn: { display: "block", padding: "9px", fontSize: 12, fontWeight: 600, border: "1.5px solid", borderRadius: 8, background: "transparent", textDecoration: "none", textAlign: "center" },
  howSection: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 14, padding: 24 },
  howTitle: { fontSize: 17, fontWeight: 600, color: "#0a0a0a", margin: "0 0 18px" },
  howGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 },
  howCard: { textAlign: "center" },
  howIcon: { width: 28, height: 28, borderRadius: "50%", background: "#E1F5EE", color: "#0F6E56", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, margin: "0 auto 8px" },
  howCardTitle: { fontWeight: 600, fontSize: 13, color: "#0a0a0a", marginBottom: 4 },
  howCardDesc: { fontSize: 12, color: "#666", lineHeight: 1.5 },
};
