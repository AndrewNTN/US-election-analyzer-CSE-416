import { BaseBarChart } from "./base-bar-chart";
import { formatNumber } from "@/lib/utils";
import { type PollbookDeletionsChartResponse } from "@/lib/api/voting-requests";

export interface PollbookDeletionsBarChartProps {
  barData: PollbookDeletionsChartResponse;
  metricLabels?: Record<string, string>;
}

const METRIC_KEYS = [
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
  removedMoved: "Moved",
  removedDeath: "Deceased",
  removedFelony: "Felony Conviction",
  removedFailResponse: "Failure to Respond",
  removedIncompetentToVote: "Mental Incompetence",
  removedVoterRequest: "Voter Request",
  removedDuplicateRecords: "Duplicate",
};

export function PollbookDeletionsBarChart({
  barData,
  metricLabels,
}: PollbookDeletionsBarChartProps) {
  const chartData = [
    {
      ...barData,
    },
  ];

  const labels = { ...DEFAULT_METRIC_LABELS, ...metricLabels };

  return (
    <BaseBarChart
      barData={chartData}
      metricKeys={METRIC_KEYS}
      metricLabels={labels}
      metricAccessor={(data, key) => data[key]}
      yAxisLabel="Number of Deletions"
      yAxisTickFormatter={formatNumber}
    />
  );
}
