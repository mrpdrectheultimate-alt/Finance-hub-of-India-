import LessonPlayer from "@/components/learn/LessonPlayer";

interface LessonPageProps {
  params: { lessonId: string };
}

export default function LessonPage({ params }: LessonPageProps) {
  return <LessonPlayer lessonId={params.lessonId} />;
}
