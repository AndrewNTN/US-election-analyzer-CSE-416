import { BaseBarChart } from "./base-bar-chart";
import { formatNumber } from "@/lib/utils";

export interface PollbookDeletionsData {
  eavsRegion: string;
  A12b: number;
  A12c: number;
  A12d: number;
  A12e: number;
  A12f: number;
  A12g: number;
  A12h: number;
  notes: string;
}

export interface PollbookDeletionsBarChartProps {
  stateName: string;
  barData: PollbookDeletionsData[];
}

const METRIC_KEYS = [
  "A12b",
  "A12c",
  "A12d",
  "A12e",
  "A12f",
  "A12g",
  "A12h",
] as const;
type MetricKey = (typeof METRIC_KEYS)[number];

const METRIC_LABELS: Record<MetricKey, string> = {
  A12b: "A12b – Moved",
  A12c: "A12c – Death",
  A12d: "A12d – Felony",
  A12e: "A12e – Fail Response",
  A12f: "A12f – Incompetent to Vote",
  A12g: "A12g – Voter Request",
  A12h: "A12h – Duplicate Record",
};

export function PollbookDeletionsBarChart({
  stateName,
  barData,
}: PollbookDeletionsBarChartProps) {
  return (
    <BaseBarChart
      stateName={stateName}
      barData={barData}
      metricKeys={METRIC_KEYS}
      metricLabels={METRIC_LABELS}
      metricAccessor={(data, key) => data[key]}
      yAxisLabel="Number of Deletions"
      yAxisTickFormatter={formatNumber}
    />
  );
}
