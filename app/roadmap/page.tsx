import AiRoadmapPlanner from "@/components/ai/AiRoadmapPlanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Learning Roadmap | FinanceHub",
  description: "Generate a personalized day-by-day financial mastery curriculum tailored to your goals, available hours, and target exams.",
};

export default function RoadmapPage() {
  return <AiRoadmapPlanner />;
}
