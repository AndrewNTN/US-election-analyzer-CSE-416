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

  const {
    data: tableData,
    isPending: tableLoading,
    isError: tableHasError,
    error: tableError,
  } = useActiveVotersTableQuery(stateFipsPrefix);

  const isLoading = chartLoading || tableLoading;
  const hasError = chartHasError || tableHasError;
  const errorMessage = hasError
    ? (chartError?.message ?? tableError?.message ?? "Unknown error")
    : null;

  return (
    <div className="text-xs text-muted-foreground text-center">
      {isLoading ? (
        <p>Loading active voters data...</p>
      ) : errorMessage ? (
        <p className="py-8">Error loading data: {errorMessage}</p>
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
    </div>
  );
}
