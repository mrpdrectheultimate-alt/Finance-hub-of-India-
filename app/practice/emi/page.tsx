import EmiCalculator from "@/components/simulators/EmiCalculator";

export default function EmiPracticePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", padding: "28px 20px 60px" }}>
      <EmiCalculator showBackBtn={true} />
    </div>
  );
}
