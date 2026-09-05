"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import VideoPlayer from "@/components/video/VideoPlayer";

type Video = {
  id: string;
  title: string;
  channel_name: string;
  description: string | null;
  playlist_url: string | null;
  embed_id: string;
  embed_type: string | null;
  video_type: "video" | "playlist" | "short" | null;
  category: string | null;
  level: string | null;
  video_count: number | null;
  duration_hrs: number | null;
  curator_note: string | null;
  is_featured: boolean | null;
  is_published?: boolean | null;
};

type LessonVideoTabProps = {
  lessonId: string;
  trackSlug: string;
  trackColor?: string;
};

const TRACK_TO_CATEGORY: Record<string, string> = {
  "personal-finance": "personal-finance",
  "trading-markets": "trading-markets",
  "crypto-defi": "crypto-defi",
  "corporate-finance": "corporate-finance",
  "behavioral-finance": "behavioral-finance",
  "forex-currency": "forex-currency",
  "technical-analysis": "technical-analysis",
  investing: "trading-markets",
};

export default function LessonVideoTab({ lessonId, trackSlug, trackColor = "#0E6163" }: LessonVideoTabProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "video" | "playlist">("all");

  useEffect(() => {
    let cancelled = false;

    const loadVideos = async () => {
      setLoading(true);
      const category = TRACK_TO_CATEGORY[trackSlug] || trackSlug;

      const [directResult, mappedResult, trackResult] = await Promise.all([
        supabase
          .from("curated_playlists" as never)
          .select("*")
          .eq("lesson_id", lessonId)
          .eq("is_published", true)
          .order("is_featured", { ascending: false }),
        supabase
          .from("video_lessons" as never)
          .select("sort_order, video:curated_playlists(*)")
          .eq("lesson_id", lessonId)
          .order("sort_order", { ascending: true }),
        supabase
          .from("curated_playlists" as never)
          .select("*")
          .eq("category", category)
          .eq("is_published", true)
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

      if (cancelled) return;

      const directVideos = (directResult.data as unknown as Video[] | null) || [];
      const mappedVideos = ((mappedResult.data as unknown as Array<{ video: Video | Video[] | null }> | null) || [])
        .flatMap((row) => Array.isArray(row.video) ? row.video : row.video ? [row.video] : [])
        .filter((video) => video.is_published !== false);
      const trackVideos = (trackResult.data as unknown as Video[] | null) || [];

      const seen = new Set<string>();
      const combined = [...directVideos, ...mappedVideos, ...trackVideos]
        .map(normalizeVideo)
        .filter((video) => {
          if (!video.id || seen.has(video.id)) return false;
          seen.add(video.id);
          return true;
        });

      setVideos(combined);
      setActiveVideo((current) => {
        if (current && combined.some((video) => video.id === current.id)) return current;
        return combined.find((video) => video.is_featured) || combined[0] || null;
      });
      setLoading(false);
    };

    void loadVideos();
    return () => {
      cancelled = true;
    };
  }, [lessonId, trackSlug]);

  const filtered = videos.filter((video) => filter === "all" || getVideoType(video) === filter);

  if (loading) return <LoadingSkeleton />;

  if (videos.length === 0) {
    return (
      <div style={s.empty}>
        <div style={s.emptyTitle}>No videos curated for this lesson yet</div>
        <p style={s.emptySub}>
          Browse the <Link href="/library" style={{ color: trackColor }}>Finance Library</Link> for videos on this topic.
        </p>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <h3 style={s.headerTitle}>Watch and Learn</h3>
          <p style={s.headerSub}>Hand-picked videos to deepen this lesson.</p>
        </div>
        <div style={s.typeFilter}>
          {([
            { id: "all", label: `All (${videos.length})` },
            { id: "video", label: `Videos (${videos.filter((video) => getVideoType(video) === "video").length})` },
            { id: "playlist", label: `Playlists (${videos.filter((video) => getVideoType(video) === "playlist").length})` },
          ] as Array<{ id: "all" | "video" | "playlist"; label: string }>).filter((item) => {
            if (item.id === "video") return videos.some((video) => getVideoType(video) === "video");
            if (item.id === "playlist") return videos.some((video) => getVideoType(video) === "playlist");
            return true;
          }).map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              style={{
                ...s.typeBtn,
                ...(filter === item.id ? { ...s.typeBtnActive, borderColor: trackColor, color: trackColor, background: `${trackColor}12` } : {}),
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div style={s.layout}>
        <main style={s.playerSection}>
          {activeVideo ? (
            <div style={s.playerCard}>
              <VideoPlayer
                videoId={activeVideo.embed_id}
                videoType={getVideoType(activeVideo)}
                title={activeVideo.title}
                channel={activeVideo.channel_name}
                description={activeVideo.description}
                curatorNote={activeVideo.curator_note}
                externalUrl={activeVideo.playlist_url}
                size="md"
              />
              <div style={s.metaRow}>
                {activeVideo.is_featured ? <span style={s.featuredBadge}>Recommended</span> : null}
                <span style={s.levelChip}>{activeVideo.level || "beginner"}</span>
                {getVideoType(activeVideo) === "playlist" ? (
                  <span style={s.chip}>{activeVideo.video_count || 1} videos - {activeVideo.duration_hrs || 0}h total</span>
                ) : null}
              </div>
            </div>
          ) : null}

          <div style={s.practicePrompt}>
            <div>
              <div style={s.practiceTitle}>Ready to practice?</div>
              <div style={s.practiceSub}>Apply what you watched in the Practice tab.</div>
            </div>
          </div>
        </main>

        <aside style={s.sidebar}>
          <div style={s.sidebarTitle}>
            Up next - {filtered.length} video{filtered.length === 1 ? "" : "s"}
          </div>
          <div style={s.videoList}>
            {filtered.map((video, index) => (
              <VideoListItem
                key={video.id}
                video={video}
                index={index}
                active={activeVideo?.id === video.id}
                trackColor={trackColor}
                onClick={() => setActiveVideo(video)}
              />
            ))}
          </div>
          <Link href="/library" style={{ ...s.libraryLink, color: trackColor }}>
            View all library videos
          </Link>
        </aside>
      </div>

      <div style={s.disclaimer}>
        Videos are embedded from YouTube. FinanceHub curates publicly available educational content; rights belong to original creators.
      </div>
    </div>
  );
}

function VideoListItem({
  video,
  index,
  active,
  trackColor,
  onClick,
}: {
  video: Video;
  index: number;
  active: boolean;
  trackColor: string;
  onClick: () => void;
}) {
  const isPlaylist = getVideoType(video) === "playlist";

  return (
    <button
      onClick={onClick}
      style={{
        ...s.videoItem,
        ...(active ? { background: `${trackColor}10`, border: `1.5px solid ${trackColor}40` } : {}),
      }}
      type="button"
    >
      <span style={{ ...s.indexNum, color: active ? trackColor : "var(--text-muted, #718096)" }}>
        {index + 1}
      </span>
      <div style={{ ...s.thumbWrap, ...(isPlaylist ? s.thumbPlaylist : { backgroundImage: `url(https://img.youtube.com/vi/${video.embed_id}/default.jpg)` }) }}>
        <span style={s.thumbOverlay}>{isPlaylist ? "PL" : "PLAY"}</span>
        {isPlaylist ? <span style={s.playlistBadge}>{video.video_count || 1}</span> : null}
      </div>
      <div style={s.videoInfo}>
        <div style={{ ...s.videoTitle, color: active ? trackColor : "var(--text-primary, #1c2b3a)" }}>{video.title}</div>
        <div style={s.videoChannel}>{video.channel_name}</div>
        <div style={s.videoMeta}>
          <span>{video.level || "beginner"}</span>
          <span>{isPlaylist ? `${video.video_count || 1} videos` : `${video.duration_hrs || 0.2}h`}</span>
        </div>
      </div>
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div style={s.loadingWrap}>
      <div style={s.loadingTitle} />
      <div style={s.loadingGrid}>
        <div style={s.loadingPlayer} />
        <div style={s.loadingList}>
          {Array.from({ length: 4 }).map((_, index) => <div key={index} style={s.loadingItem} />)}
        </div>
      </div>
    </div>
  );
}

function normalizeVideo(video: Video): Video {
  return {
    ...video,
    video_type: getVideoType(video),
  };
}

function getVideoType(video: Video): "video" | "playlist" {
  return video.video_type === "playlist" || video.embed_type === "playlist" ? "playlist" : "video";
}

const s: Record<string, CSSProperties> = {
  wrap: { fontFamily: "var(--font-ui, system-ui)" },
  empty: { textAlign: "center", padding: "40px 20px", color: "var(--text-muted, #718096)" },
  emptyTitle: { fontWeight: 700, fontSize: 15, color: "var(--text-secondary, #4a5568)", marginBottom: 6 },
  emptySub: { fontSize: 13, lineHeight: 1.6, margin: 0 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 },
  headerTitle: { fontSize: 17, fontWeight: 800, color: "var(--text-primary, #1c2b3a)", margin: "0 0 4px" },
  headerSub: { fontSize: 13, color: "var(--text-muted, #718096)", margin: 0 },
  typeFilter: { display: "flex", gap: 5, flexWrap: "wrap" },
  typeBtn: { padding: "5px 12px", fontSize: 11, fontWeight: 600, border: "1px solid var(--border, #e2ddd5)", borderRadius: 20, background: "var(--bg-card, #fff)", color: "var(--text-muted, #718096)", cursor: "pointer", fontFamily: "var(--font-ui, system-ui)", transition: "all 0.15s" },
  typeBtnActive: { fontWeight: 700 },
  layout: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(240px, 300px)", gap: 20, alignItems: "start", marginBottom: 16 },
  playerSection: { minWidth: 0 },
  playerCard: { background: "var(--bg-card, #fff)", border: "1px solid var(--border, #e2ddd5)", borderRadius: 14, padding: 16, marginBottom: 12 },
  metaRow: { display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" },
  featuredBadge: { fontSize: 10, fontWeight: 800, color: "#9A6700", background: "#FDF6E3", padding: "2px 8px", borderRadius: 12 },
  levelChip: { fontSize: 10, fontWeight: 800, color: "#1D9E75", background: "#E1F5EE", padding: "2px 8px", borderRadius: 12 },
  chip: { fontSize: 10, color: "var(--text-muted, #718096)", background: "var(--bg-surface, #f5f5f3)", padding: "2px 8px", borderRadius: 12 },
  practicePrompt: { display: "flex", alignItems: "center", gap: 12, background: "var(--bg-surface, #f5f5f3)", border: "1px solid var(--border, #e2ddd5)", borderRadius: 10, padding: "12px 14px" },
  practiceTitle: { fontSize: 13, fontWeight: 700, color: "var(--text-primary, #1c2b3a)", marginBottom: 2 },
  practiceSub: { fontSize: 12, color: "var(--text-muted, #718096)" },
  sidebar: { background: "var(--bg-card, #fff)", border: "1px solid var(--border, #e2ddd5)", borderRadius: 14, padding: "12px 8px", maxHeight: 520, display: "flex", flexDirection: "column", minWidth: 0 },
  sidebarTitle: { fontSize: 11, fontWeight: 800, color: "var(--text-muted, #718096)", textTransform: "uppercase", letterSpacing: ".07em", padding: "4px 10px 10px", borderBottom: "1px solid var(--bg-surface, #f5f5f3)", marginBottom: 4, flexShrink: 0 },
  videoList: { flex: 1, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "var(--border, #e2ddd5) transparent" },
  videoItem: { width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 9, cursor: "pointer", border: "1.5px solid transparent", background: "transparent", transition: "all 0.15s", marginBottom: 3, textAlign: "left", fontFamily: "var(--font-ui, system-ui)" },
  indexNum: { fontSize: 11, minWidth: 18, textAlign: "center", flexShrink: 0 },
  thumbWrap: { width: 68, height: 44, borderRadius: 6, overflow: "hidden", flexShrink: 0, backgroundColor: "#0a0a0a", backgroundSize: "cover", backgroundPosition: "center", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" },
  thumbPlaylist: { background: "linear-gradient(135deg, #0f172a, #0e6163)" },
  thumbOverlay: { color: "#fff", background: "rgba(0,0,0,0.55)", fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 4 },
  playlistBadge: { position: "absolute", bottom: 2, right: 2, background: "rgba(0,0,0,0.85)", color: "#fff", fontSize: 7, fontWeight: 700, padding: "1px 3px", borderRadius: 3 },
  videoInfo: { flex: 1, minWidth: 0 },
  videoTitle: { fontSize: 12, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontWeight: 600 },
  videoChannel: { fontSize: 10, color: "var(--text-muted, #718096)", marginTop: 2 },
  videoMeta: { display: "flex", gap: 7, marginTop: 3, fontSize: 9, color: "var(--text-muted, #718096)", flexWrap: "wrap" },
  libraryLink: { display: "block", textAlign: "center", padding: "10px", fontSize: 12, fontWeight: 700, textDecoration: "none", borderTop: "1px solid var(--bg-surface, #f5f5f3)", marginTop: 8, flexShrink: 0 },
  disclaimer: { fontSize: 11, color: "var(--text-muted, #718096)", lineHeight: 1.6, background: "var(--bg-surface, #f5f5f3)", borderRadius: 9, padding: "10px 14px" },
  loadingWrap: { display: "flex", flexDirection: "column", gap: 16 },
  loadingTitle: { height: 24, width: "40%", background: "#eee", borderRadius: 8 },
  loadingGrid: { display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 },
  loadingPlayer: { aspectRatio: "16/9", background: "#eee", borderRadius: 12 },
  loadingList: { display: "flex", flexDirection: "column", gap: 10 },
  loadingItem: { height: 70, background: "#eee", borderRadius: 10 },
};
