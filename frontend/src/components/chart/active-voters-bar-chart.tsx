import { BaseBarChart } from "./base-bar-chart";
import { formatNumber } from "@/lib/utils";

export interface ActiveVotersData {
  eavsRegion: string;
  activeVoters: number;
  totalVoters: number;
  inactiveVoters: number;
  notes: string;
}

export interface ActiveVotersBarChartProps {
  stateName: string;
  barData: ActiveVotersData[];
}

const METRIC_KEYS = ["activeVoters", "totalVoters", "inactiveVoters"] as const;
type MetricKey = (typeof METRIC_KEYS)[number];

const METRIC_LABELS: Record<MetricKey, string> = {
  activeVoters: "Active Voters",
  totalVoters: "Total Voters",
  inactiveVoters: "Inactive Voters",
};

export function ActiveVotersBarChart({
  stateName,
  barData,
}: ActiveVotersBarChartProps) {
  return (
    <BaseBarChart
      stateName={stateName}
      barData={barData}
      metricKeys={METRIC_KEYS}
      metricLabels={METRIC_LABELS}
      metricAccessor={(data, key) => data[key]}
      yAxisLabel="Number of Voters"
      yAxisTickFormatter={formatNumber}
    />
  );
}
