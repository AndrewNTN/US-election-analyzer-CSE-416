import { BaseBarChart } from "./base-bar-chart";
import { formatNumber } from "@/lib/utils";

export interface ProvisionBallotsData {
  E2a: number; // Not on List
  E2b: number; // Lacked ID
  E2c: number; // Challenged Eligibility
  E2d: number; // Not Eligible
  E2e: number; // Not Resident
  E2f: number; // Registration Not Updated
  E2g: number; // Did Not Surrender Mail Ballot
  E2h: number; // Judge Extended Hours
  E2i: number; // Used SDR
  Other: number; // Other
}

export interface ProvisionalBallotsBarChartProps {
  stateName: string;
  barData: ProvisionBallotsData[];
}

const METRIC_KEYS = [
  "E2a",
  "E2b",
  "E2c",
  "E2d",
  "E2e",
  "E2f",
  "E2g",
  "E2h",
  "E2i",
  "Other",
] as const;
type MetricKey = (typeof METRIC_KEYS)[number];

const METRIC_LABELS: Record<MetricKey, string> = {
  E2a: "E2a – Not on List",
  E2b: "E2b – Lacked ID",
  E2c: "E2c – Challenged Eligibility",
  E2d: "E2d – Not Eligible",
  E2e: "E2e – Not Resident",
  E2f: "E2f – Registration Not Updated",
  E2g: "E2g – Did Not Surrender Mail Ballot",
  E2h: "E2h – Judge Extended Hours",
  E2i: "E2i – Used SDR",
  Other: "Other",
};

export function ProvisionalBallotsBarChart({
  stateName,
  barData,
}: ProvisionalBallotsBarChartProps) {
  return (
    <BaseBarChart
      stateName={stateName}
      barData={barData}
      metricKeys={METRIC_KEYS}
      metricLabels={METRIC_LABELS}
      metricAccessor={(data, key) => data[key]}
      yAxisLabel="Number of Ballots"
      yAxisTickFormatter={formatNumber}
    />
  );
}
