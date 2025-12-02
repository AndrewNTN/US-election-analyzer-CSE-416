import { VoterRegistrationTable } from "../table/state-tables/voter-registration-table.tsx";
import { VoterRegistrationLineChart } from "../chart/voter-registration-line-chart";
import { hasDetailedVoterData } from "@/constants/states.ts";
import {
  useVoterRegistrationTableQuery,
  useVoterRegistrationChartQuery,
} from "@/lib/api/use-queries.ts";

import { useMemo } from "react";

interface VoterRegistrationViewProps {
  normalizedStateKey: string;
  stateFips: string | undefined;
}

export function VoterRegistrationView({
  normalizedStateKey,
  stateFips,
}: VoterRegistrationViewProps) {
  // Fetch data using query hooks
  const { data: tableData } = useVoterRegistrationTableQuery(stateFips);
  const { data: chartData } = useVoterRegistrationChartQuery(stateFips);

  // Transform chart data to match expected format
  const transformedChartData = useMemo(() => {
    if (!chartData?.data) return [];
    // Sort by 2024 registered voters (already sorted from backend)
    return chartData.data.map((item) => ({
      eavsRegion: item.eavsRegion,
      registeredVoters2016: item.registeredVoters2016,
      registeredVoters2020: item.registeredVoters2020,
      registeredVoters2024: item.registeredVoters2024,
    }));
  }, [chartData]);

  return (
    <div>
      {hasDetailedVoterData(normalizedStateKey) && (
        <VoterRegistrationTable data={tableData?.data || []} />
      )}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 text-center text-gray-900">
          Voter Registration by County
        </h3>
        <div className="h-[350px]">
          <VoterRegistrationLineChart
            data={transformedChartData}
            xAxisLabel={chartData?.xAxisLabel}
            yAxisLabel={chartData?.yAxisLabel}
          />
        </div>
      </div>
    </div>
  );
}
