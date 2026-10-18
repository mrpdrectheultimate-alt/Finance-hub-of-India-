import AiRoadmapPlanner from "@/components/ai/AiRoadmapPlanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Learning Roadmap Planner | FinanceHub",
  description: "Personalized AI-powered finance study roadmaps for students, professionals, traders, and founders.",
};

export default function AiRoadmapPlannerPage() {
  return <AiRoadmapPlanner />;
}
