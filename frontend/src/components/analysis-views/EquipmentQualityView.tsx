import { EquipmentQualityBubbleChart } from "../chart/equipment-quality-bubble-chart";
import equipmentQualityDataJson from "../../../data/equipmentQualityVsRejectedBallots.json" with { type: "json" };

interface EquipmentQualityViewProps {
  stateName: string;
}

export function EquipmentQualityView({ stateName }: EquipmentQualityViewProps) {
  // Get equipment quality data for current state
  const getEquipmentQualityData = () => {
    // The JSON has the structure: { equipmentQualityData: [...], regressionCoefficients: {...} }
    // Provided JSON is for Arizona (based on counties)
    // TODO: Adjust to state specific data
    return {
      data: (equipmentQualityDataJson.equipmentQualityData || []) as {
        county: string;
        equipmentQuality: number;
        rejectedBallotPercentage: number;
        totalBallots: number;
        rejectedBallots: number;
        dominantParty: "republican" | "democratic";
        mailInRejected: number;
        provisionalRejected: number;
        uocavaRejected: number;
      }[],
      regressionCoefficients:
        equipmentQualityDataJson.regressionCoefficients as {
          republican: { a: number; b: number; c: number };
          democratic: { a: number; b: number; c: number };
        },
    };
  };

  return (
    <div className="h-[600px]">
      <EquipmentQualityBubbleChart
        stateName={stateName}
        data={getEquipmentQualityData().data}
        regressionCoefficients={
          getEquipmentQualityData().regressionCoefficients
        }
      />
    </div>
  );
}
