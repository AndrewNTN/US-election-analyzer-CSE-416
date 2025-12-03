import { BaseBarChart } from "./base-bar-chart";
import { formatNumber } from "@/lib/utils";
import { type ActiveVotersChartResponse } from "@/lib/api/voting-requests";

export interface ActiveVotersBarChartProps {
  stateName: string;
  barData: ActiveVotersChartResponse;
  metricLabels?: Record<string, string>;
}

const METRIC_KEYS = [
  "totalRegistered",
  "totalActive",
  "totalInactive",
] as const;
type MetricKey = (typeof METRIC_KEYS)[number];

const DEFAULT_METRIC_LABELS: Record<MetricKey, string> = {
  totalRegistered: "Total Voters",
  totalActive: "Active Voters",
  totalInactive: "Inactive Voters",
};

export function ActiveVotersBarChart({
  stateName,
  barData,
  metricLabels,
}: ActiveVotersBarChartProps) {
  const chartData = [
    {
      name: stateName,
      totalActive: barData.totalActive,
      totalRegistered: barData.totalRegistered,
      totalInactive: barData.totalInactive,
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
      yAxisLabel="Number of Voters"
      yAxisTickFormatter={formatNumber}
    />
  );
}
