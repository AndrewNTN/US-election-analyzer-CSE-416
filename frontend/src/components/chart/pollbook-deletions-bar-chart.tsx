import { BaseBarChart } from "./base-bar-chart";
import { formatNumber } from "@/lib/utils";
import { type PollbookDeletionsChartResponse } from "@/lib/api/eavs-requests";

export interface PollbookDeletionsBarChartProps {
  stateName: string;
  barData: PollbookDeletionsChartResponse;
  metricLabels?: Record<string, string>;
}

const METRIC_KEYS = [
  "removedTotal",
  "removedMoved",
  "removedDeath",
  "removedFelony",
  "removedFailResponse",
  "removedIncompetentToVote",
  "removedVoterRequest",
  "removedDuplicateRecords",
] as const;
type MetricKey = (typeof METRIC_KEYS)[number];

const DEFAULT_METRIC_LABELS: Record<MetricKey, string> = {
  removedTotal: "Total Removed",
  removedMoved: "Moved",
  removedDeath: "Deceased",
  removedFelony: "Felony Conviction",
  removedFailResponse: "Failure to Respond",
  removedIncompetentToVote: "Mental Incompetence",
  removedVoterRequest: "Voter Request",
  removedDuplicateRecords: "Duplicate",
};

export function PollbookDeletionsBarChart({
  stateName,
  barData,
  metricLabels,
}: PollbookDeletionsBarChartProps) {
  const chartData = [
    {
      name: stateName,
      ...barData,
    },
  ];

  const labels = { ...DEFAULT_METRIC_LABELS, ...metricLabels };

  return (
    <BaseBarChart
      stateName={stateName}
      barData={chartData}
      metricKeys={METRIC_KEYS}
      metricLabels={labels}
      metricAccessor={(data, key) => data[key]}
      yAxisLabel="Number of Deletions"
      yAxisTickFormatter={formatNumber}
    />
  );
}
