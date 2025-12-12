import { EquipmentQualityBubbleChart } from "../chart/equipment-quality-bubble-chart";
import { useEquipmentQualityChartQuery } from "@/lib/api/use-queries";

interface EquipmentQualityViewProps {
  stateFipsPrefix?: string;
}

export function EquipmentQualityView({
  stateFipsPrefix,
}: EquipmentQualityViewProps) {
  const { data, isLoading, isError, error } =
    useEquipmentQualityChartQuery(stateFipsPrefix);

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">
            Loading equipment quality data...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">
            Failed to load equipment quality data
          </p>
          <p className="text-sm text-gray-500">
            {error?.message || "Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  // Transform API response to match chart component expectations
  const chartData = data.equipmentQualityData.map((item) => ({
    county: item.county,
    equipmentQuality: item.equipmentQuality,
    rejectedBallotPercentage: item.rejectedBallotPercentage,
    totalBallots: item.totalBallots,
    rejectedBallots: item.rejectedBallots,
    dominantParty: item.dominantParty,
    mailInRejected: item.mailInRejected,
    provisionalRejected: item.provisionalRejected,
    uocavaRejected: item.uocavaRejected,
  }));

  return (
    <div className="h-[600px]">
      <EquipmentQualityBubbleChart
        data={chartData}
        regressionCoefficients={data.regressionCoefficients}
      />
    </div>
  );
}
