import { GinglesChart } from "../chart/gingles-chart";
import { useGinglesChartQuery } from "@/lib/api/use-queries";

interface GinglesChartViewProps {
  stateFipsPrefix: string | undefined;
}

export function GinglesChartView({ stateFipsPrefix }: GinglesChartViewProps) {
  const { data, isLoading, isError } = useGinglesChartQuery(stateFipsPrefix);

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="text-gray-500">Loading Gingles Chart data...</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="text-red-500">
          Failed to load Gingles Chart data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="h-[650px]">
      <GinglesChart data={data} />
    </div>
  );
}
