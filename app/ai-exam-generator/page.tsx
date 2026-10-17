import AiExamGenerator from "@/components/ai/AiExamGenerator";

export const metadata = {
  title: "AI Exam Generator | FinanceHub",
  description:
    "Generate custom practice exams on any finance topic. Grounded in CFA, FRM, CA, and SEBI regulatory standards.",
};

export default function AiExamGeneratorPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <AiExamGenerator />
      </div>
    </main>
  );
}
