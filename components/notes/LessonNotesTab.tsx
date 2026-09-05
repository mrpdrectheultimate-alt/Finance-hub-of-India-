"use client";

import React from "react";
import RoughBook from "@/components/notes/RoughBook";

export default function LessonNotesTab({
  lessonId,
  lessonTitle,
  trackSlug,
  trackIcon,
  trackColor = "#1D9E75",
}: {
  lessonId: string;
  lessonTitle: string;
  trackSlug?: string;
  trackIcon?: string;
  trackColor?: string;
}) {
  return (
    <div className="space-y-4 animate-fade-in">
      <RoughBook
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        trackSlug={trackSlug}
        trackIcon={trackIcon}
        trackColor={trackColor}
        mode="panel"
      />
    </div>
  );
}
