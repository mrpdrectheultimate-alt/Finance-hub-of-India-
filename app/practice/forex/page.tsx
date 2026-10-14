import ForexPaperTrader from "@/components/trading/ForexPaperTrader";

export const metadata = {
  title: "Forex Paper Trading | FinanceHub",
  description: "Practice currency trading in real-time with virtual money. Zero financial risk.",
};

export default function ForexPracticePage() {
  return (
    <main className="min-h-screen bg-[#0B1A2B] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ForexPaperTrader />
      </div>
    </main>
  );
}
