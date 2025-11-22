import {
  useProvisionalChartQuery,
  useProvisionalTableQuery,
} from "@/lib/api/use-queries.ts";
import { ProvisionBallotsTable } from "../table/state-tables/provisional-ballot-table.tsx";
import { ProvisionalBallotsBarChart } from "../chart/provisional-ballots-bar-chart";

interface ProvisionalBallotViewProps {
  stateFipsPrefix: string | undefined;
  stateName: string;
}

export function ProvisionalBallotView({
  stateFipsPrefix,
  stateName,
}: ProvisionalBallotViewProps) {
  const {
    data: provChartData,
    isPending: provLoading,
    isError: provChartHasError,
    error: provChartError,
  } = useProvisionalChartQuery(stateFipsPrefix);

  const {
    data: provTableData,
    isPending: provTableLoading,
    isError: provTableHasError,
    error: provTableError,
  } = useProvisionalTableQuery(stateFipsPrefix);

  const provErrorMessage = provChartHasError
    ? (provChartError?.message ?? "Unknown error")
    : null;

  return (
    <div className="text-xs text-muted-foreground text-center">
      {provLoading ? (
        <p>Loading provisional ballot data...</p>
      ) : provErrorMessage ? (
        <p className="py-8">
          Error loading {stateName} data: {provErrorMessage}
        </p>
      ) : (
        <>
          {provTableData && (
            <ProvisionBallotsTable
              data={provTableData}
              isPending={provTableLoading}
              isError={provTableHasError}
              error={provTableError}
            />
          )}
          {provChartData && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-4 text-center text-gray-900">
                Provisional Ballots by Reason
              </h3>
              <ProvisionalBallotsBarChart
                stateName={stateName}
                barData={provChartData}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
