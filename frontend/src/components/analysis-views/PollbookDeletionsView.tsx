import { PollbookDeletionsBarChart } from "../chart/pollbook-deletions-bar-chart";
import {
  usePollbookDeletionsChartQuery,
  useActiveVotersTableQuery,
} from "@/lib/api/use-eavs-queries.ts";
import { getStateFipsCode } from "@/constants/stateFips.ts";
import { ActiveVotersTable } from "../table/state-tables/active-voters-table.tsx";

interface PollbookDeletionsViewProps {
  stateName: string;
}

export function PollbookDeletionsView({
  stateName,
}: PollbookDeletionsViewProps) {
  const stateFipsPrefix = getStateFipsCode(stateName);

  const {
    data: chartData,
    isPending: chartLoading,
    isError: chartHasError,
    error: chartError,
  } = usePollbookDeletionsChartQuery(stateFipsPrefix);

  const {
    data: tableData,
    isPending: tableLoading,
    isError: tableHasError,
    error: tableError,
  } = useActiveVotersTableQuery(stateFipsPrefix);

  const chartErrorMessage = chartHasError
    ? (chartError?.message ?? "Unknown error")
    : null;

  const tableErrorMessage = tableHasError
    ? (tableError?.message ?? "Unknown error")
    : null;

  return (
    <div className="text-xs text-muted-foreground text-center">
      {tableLoading ? (
        <p>Loading active voters data...</p>
      ) : tableErrorMessage ? (
        <p className="py-8">
          Error loading {stateName} table data: {tableErrorMessage}
        </p>
      ) : tableData ? (
        <ActiveVotersTable
          data={tableData.data}
          metricLabels={tableData.metricLabels}
        />
      ) : null}

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-900">
          Pollbook Deletions by Reason
        </h3>
        {chartLoading ? (
          <p>Loading pollbook deletions data...</p>
        ) : chartErrorMessage ? (
          <p className="py-8">
            Error loading {stateName} data: {chartErrorMessage}
          </p>
        ) : chartData ? (
          <PollbookDeletionsBarChart
            stateName={stateName}
            barData={chartData}
            metricLabels={chartData.metricLabels}
          />
        ) : null}
      </div>
    </div>
  );
}
