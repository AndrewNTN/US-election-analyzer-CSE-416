import {
  useActiveVotersChartQuery,
  useActiveVotersTableQuery,
} from "@/lib/api/use-queries.ts";
import { ActiveVotersTable } from "../table/state-tables/active-voters-table.tsx";
import { ActiveVotersBarChart } from "../chart/active-voters-bar-chart";

interface ActiveVotersViewProps {
  stateFipsPrefix?: string;
}

export function ActiveVotersView({ stateFipsPrefix }: ActiveVotersViewProps) {
  const {
    data: chartData,
    isPending: chartLoading,
    isError: chartHasError,
    error: chartError,
  } = useActiveVotersChartQuery(stateFipsPrefix);

  const { data: tableData } = useActiveVotersTableQuery(stateFipsPrefix);

  const errorMessage = chartHasError
    ? (chartError?.message ?? "Unknown error")
    : null;

  return (
    <div className="text-xs text-muted-foreground text-center">
      {chartLoading ? (
        <p>Loading active voters data...</p>
      ) : errorMessage ? (
        <p className="py-8">Error loading data: {errorMessage}</p>
      ) : (
        <>
          {chartData &&
          chartData.totalRegistered === 0 &&
          chartData.totalActive === 0 &&
          chartData.totalInactive === 0 ? (
            <p className="py-8 text-lg font-semibold">
              Data not reported for this state.
            </p>
          ) : (
            <>
              {tableData && (
                <ActiveVotersTable
                  data={tableData.data}
                  metricLabels={tableData.metricLabels}
                />
              )}
              {chartData && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-4 text-center text-gray-900">
                    Active Voters Status
                  </h3>
                  <ActiveVotersBarChart
                    barData={chartData}
                    metricLabels={chartData.metricLabels}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
