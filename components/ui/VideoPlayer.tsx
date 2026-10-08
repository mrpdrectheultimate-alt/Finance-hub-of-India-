"use client";

import { useRef, useState, type CSSProperties } from "react";

export type VideoPlayerProps = {
  videoId: string;
  videoType: "video" | "playlist";
  title: string;
  channel?: string | null;
  description?: string | null;
  curatorNote?: string | null;
  size?: "sm" | "md" | "lg";
  autoplay?: boolean;
  externalUrl?: string | null;
  onPlay?: () => void;
};

const SIZES: Record<NonNullable<VideoPlayerProps["size"]>, { maxWidth: number; aspectRatio: string }> = {
  sm: { maxWidth: 520, aspectRatio: "16/9" },
  md: { maxWidth: 680, aspectRatio: "16/9" },
  lg: { maxWidth: 860, aspectRatio: "16/9" },
};

export default function VideoPlayer({
  videoId,
  videoType,
  title,
  channel,
  description,
  curatorNote,
  size = "md",
  autoplay = false,
  externalUrl,
  onPlay,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(autoplay);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sz = SIZES[size];
  const isPlaylist = videoType === "playlist";
  const safeVideoId = encodeURIComponent(videoId);

  const embedUrl = isPlaylist
    ? `https://www.youtube.com/embed/videoseries?list=${safeVideoId}&rel=0&modestbranding=1&color=white&enablejsapi=1`
    : `https://www.youtube.com/embed/${safeVideoId}?rel=0&modestbranding=1&color=white&enablejsapi=1`;

  const youtubeUrl = externalUrl || (isPlaylist
    ? `https://www.youtube.com/playlist?list=${videoId}`
    : `https://www.youtube.com/watch?v=${videoId}`);

  const handlePlay = () => {
    setPlaying(true);
    onPlay?.();
  };

  return (
    <div style={{ ...s.shell, maxWidth: sz.maxWidth }}>
      <div style={{ ...s.player, aspectRatio: sz.aspectRatio }}>
        {!playing ? (
          <button
            onClick={handlePlay}
            type="button"
            aria-label={`Play ${title}`}
            style={{
              ...s.poster,
              ...(isPlaylist ? s.posterPlaylist : {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.45)), url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`,
              }),
            }}
          >
            <span style={s.playButton} aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            {isPlaylist ? (
              <span style={s.playlistBadge}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                </svg>
                Playlist
              </span>
            ) : null}
          </button>
        ) : (
          <iframe
            ref={iframeRef}
            src={`${embedUrl}${autoplay || playing ? "&autoplay=1" : ""}`}
            title={title}
            style={s.iframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        )}
      </div>

      <div style={s.info}>
        <div style={s.titleRow}>
          <div style={s.copy}>
            <h4 style={s.title}>{title}</h4>
            {channel ? <div style={s.channel}>{channel}</div> : null}
          </div>
          <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" style={s.youtubeLink}>
            YouTube
          </a>
        </div>

        {description ? <p style={s.description}>{description}</p> : null}
        {curatorNote ? (
          <div style={s.note}>
            <span style={s.noteLabel}>Tip</span>
            <span>{curatorNote}</span>
          </div>
        ) : null}
      </div>

      <p style={s.legal}>
        Video hosted on YouTube. FinanceHub embeds publicly available educational content; rights belong to the original creators.
      </p>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  shell: {
    width: "100%",
    margin: "0 auto",
    fontFamily: "var(--font-ui, system-ui)",
  },
  player: {
    position: "relative",
    width: "100%",
    borderRadius: "var(--radius-lg, 14px)",
    overflow: "hidden",
    background: "#0a0a0a",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    border: "1px solid var(--border, #e2e2e2)",
  },
  poster: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: 0,
  },
  posterPlaylist: {
    background: "linear-gradient(135deg, #0f172a, #14532d 55%, #0f766e)",
  },
  playButton: {
    width: 62,
    height: 62,
    borderRadius: "50%",
    background: "#FF0000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
  },
  playlistBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    background: "rgba(0,0,0,0.78)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: 7,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  iframe: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    border: "none",
  },
  info: { marginTop: 12, padding: "0 2px" },
  titleRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 },
  copy: { minWidth: 0 },
  title: { fontSize: 15, fontWeight: 700, color: "var(--text-primary, #1c2b3a)", lineHeight: 1.4, margin: 0 },
  channel: { fontSize: 13, color: "var(--text-muted, #718096)", marginTop: 4 },
  youtubeLink: {
    fontSize: 12,
    fontWeight: 700,
    color: "#B91C1C",
    textDecoration: "none",
    flexShrink: 0,
    padding: "5px 9px",
    border: "1px solid #FECDD3",
    borderRadius: 7,
    background: "#FFF5F5",
    whiteSpace: "nowrap",
  },
  description: { fontSize: 13, color: "var(--text-secondary, #4a5568)", lineHeight: 1.55, margin: "0 0 8px" },
  note: {
    display: "flex",
    gap: 8,
    background: "var(--accent-light, #e6f3f3)",
    border: "1px solid var(--accent-muted, #6bb5b6)",
    borderRadius: 8,
    padding: "8px 10px",
    marginTop: 6,
    fontSize: 13,
    color: "var(--text-secondary, #4a5568)",
    lineHeight: 1.5,
  },
  noteLabel: { fontWeight: 800, color: "var(--accent, #1D9E75)", flexShrink: 0 },
  legal: { fontSize: 11, color: "var(--text-muted, #718096)", marginTop: 10, lineHeight: 1.5 },
};
