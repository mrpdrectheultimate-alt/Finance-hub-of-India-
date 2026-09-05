"use client";

import VideoPlayer from "@/components/video/VideoPlayer";

type YouTubeEmbedProps = {
  title: string;
  embedId: string;
  embedType?: string | null;
  videoType?: string | null;
  url?: string | null;
  channelName?: string | null;
  description?: string | null;
  curatorNote?: string | null;
  compact?: boolean;
};

export default function YouTubeEmbed({
  title,
  embedId,
  embedType,
  videoType,
  url,
  channelName,
  description,
  curatorNote,
  compact = false,
}: YouTubeEmbedProps) {
  const kind = videoType || embedType;

  return (
    <VideoPlayer
      videoId={embedId}
      videoType={kind === "playlist" ? "playlist" : "video"}
      title={title}
      channel={channelName}
      description={description}
      curatorNote={curatorNote}
      externalUrl={url}
      size={compact ? "md" : "lg"}
    />
  );
}
