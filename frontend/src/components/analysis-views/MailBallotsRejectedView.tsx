import { MailBallotsRejectedTable } from "../table/state-tables/mail-ballots-rejected-table.tsx";
import { MailBallotsRejectedBarChart } from "../chart/mail-ballots-rejected-bar-chart";
import {
  useMailBallotsRejectedChartQuery,
  useMailBallotsRejectedTableQuery,
} from "@/lib/api/use-queries.ts";
import { getStateFipsCode } from "@/constants/stateFips.ts";

interface MailBallotsRejectedViewProps {
  stateName: string;
}

export function MailBallotsRejectedView({
  stateName,
}: MailBallotsRejectedViewProps) {
  const stateFipsPrefix = getStateFipsCode(stateName);

  const {
    data: chartData,
    isPending: chartLoading,
    isError: chartHasError,
    error: chartError,
  } = useMailBallotsRejectedChartQuery(stateFipsPrefix);

  const {
    data: tableData,
    isPending: tableLoading,
    isError: tableHasError,
    error: tableError,
  } = useMailBallotsRejectedTableQuery(stateFipsPrefix);

  const chartErrorMessage = chartHasError
    ? (chartError?.message ?? "Unknown error")
    : null;

  const tableErrorMessage = tableHasError
    ? (tableError?.message ?? "Unknown error")
    : null;

  return (
    <div className="text-xs text-muted-foreground text-center">
      {tableLoading ? (
        <p>Loading mail ballots rejected data...</p>
      ) : tableErrorMessage ? (
        <p className="py-8">
          Error loading {stateName} table data: {tableErrorMessage}
        </p>
      ) : tableData ? (
        <MailBallotsRejectedTable
          data={tableData.data}
          metricLabels={tableData.metricLabels}
        />
      ) : null}

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-900">
          Mail Ballots Rejected by Reason
        </h3>
        {chartLoading ? (
          <p>Loading mail ballots rejected data...</p>
        ) : chartErrorMessage ? (
          <p className="py-8">
            Error loading {stateName} data: {chartErrorMessage}
          </p>
        ) : chartData ? (
          <MailBallotsRejectedBarChart
            stateName={stateName}
            barData={chartData}
            metricLabels={chartData.metricLabels}
          />
        ) : null}
      </div>
    </div>
  );
}
