import { BaseBarChart } from "./base-bar-chart";
import { formatNumber } from "@/lib/utils";

export interface MailBallotsRejectedData {
  eavsRegion: string;
  C9b: number;
  C9c: number;
  C9d: number;
  C9e: number;
  C9f: number;
  C9g: number;
  C9h: number;
  C9i: number;
  C9j: number;
  C9k: number;
  C9l: number;
  C9m: number;
  C9n: number;
  C9o: number;
  C9p: number;
  C9q: number;
  notes: string;
}

export interface MailBallotsRejectedBarChartProps {
  stateName: string;
  barData: MailBallotsRejectedData[];
}

const METRIC_KEYS = [
  "C9b",
  "C9c",
  "C9d",
  "C9e",
  "C9f",
  "C9g",
  "C9h",
  "C9i",
  "C9j",
  "C9k",
  "C9l",
  "C9m",
  "C9n",
  "C9o",
  "C9p",
  "C9q",
] as const;
type MetricKey = (typeof METRIC_KEYS)[number];

const METRIC_LABELS: Record<MetricKey, string> = {
  C9b: "C9b – Late",
  C9c: "C9c – Missing voter signature",
  C9d: "C9d – Missing witness signature",
  C9e: "C9e – Non-matching voter signature",
  C9f: "C9f – Unofficial Envelope",
  C9g: "C9g – Empty Envelope",
  C9h: "C9h – No Secrecy Envelope",
  C9i: "C9i – Multiple Ballots in Envelope",
  C9j: "C9j – Envelope not sealed",
  C9k: "C9k – No Postmark",
  C9l: "C9l – No Address",
  C9m: "C9m – Voter Deceased",
  C9n: "C9n – Already Voted",
  C9o: "C9o – Missing Documentation",
  C9p: "C9p – Not Eligible",
  C9q: "C9q – No Ballot Application",
};

export function MailBallotsRejectedBarChart({
  stateName,
  barData,
}: MailBallotsRejectedBarChartProps) {
  return (
    <BaseBarChart
      stateName={stateName}
      barData={barData}
      metricKeys={METRIC_KEYS}
      metricLabels={METRIC_LABELS}
      metricAccessor={(data, key) => data[key]}
      margin={{ top: 0, right: 16, left: 35, bottom: 50 }}
      yAxisLabel="Number of Rejected Ballots"
      yAxisTickFormatter={formatNumber}
      xAxisAngle={-28}
    />
  );
}
