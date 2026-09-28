import SipCalculator from "@/components/simulators/SipCalculator";
import CompoundInterestVisualiser from "@/components/visualisers/CompoundInterestVisualiser";

export default function SipPracticePage() {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 16px 60px", display: "flex", flexDirection: "column", gap: 32 }}>
      <SipCalculator />
      <CompoundInterestVisualiser />
    </div>
  );
}
