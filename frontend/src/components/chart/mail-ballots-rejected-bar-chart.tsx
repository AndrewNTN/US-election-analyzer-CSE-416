import { BaseBarChart } from "./base-bar-chart";

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
  C9b: "C9b – Missing signature",
  C9c: "C9c – Non-matching signature",
  C9d: "C9d – Missing witness signature",
  C9e: "C9e – Non-matching witness signature",
  C9f: "C9f – Ballot envelope not sealed",
  C9g: "C9g – No ballot in envelope",
  C9h: "C9h – Arrived after deadline",
  C9i: "C9i – Voter deceased",
  C9j: "C9j – Envelope not signed",
  C9k: "C9k – No voter registration record",
  C9l: "C9l – Already voted",
  C9m: "C9m – Invalid voter address",
  C9n: "C9n – Duplicate ballot",
  C9o: "C9o – Ballot damaged/illegible",
  C9p: "C9p – Other mail ballot issue",
  C9q: "C9q – Rejected - voter ID",
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
      margin={{ top: 0, right: 16, left: 35, bottom: 8 }}
      yAxisLabel="Number of Rejected Ballots"
    />
  );
}
