import { BaseBarChart } from "./base-bar-chart";

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

// Format large numbers in millions (e.g., 1,500,000 -> "1.5M")
const formatMillions = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
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
      yAxisTickFormatter={formatMillions}
    />
  );
}
