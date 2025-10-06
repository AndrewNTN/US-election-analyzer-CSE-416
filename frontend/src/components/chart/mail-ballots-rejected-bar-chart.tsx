import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

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

// 🎨 Custom color palette
const BAR_COLORS = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#0ea5e9", // sky blue
  "#10b981", // emerald
  "#f97316", // orange
  "#4f46e5", // indigo
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f43f5e", // rose
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#a855f7", // purple
  "#eab308", // yellow
  "#6366f1", // indigo-500
  "#22c55e", // green
];

export function MailBallotsRejectedBarChart({
  stateName,
  barData,
}: MailBallotsRejectedBarChartProps) {
  const totals = METRIC_KEYS.reduce(
    (acc, key) => {
      acc[key] = barData.reduce((sum, row) => sum + (row[key] ?? 0), 0);
      return acc;
    },
    {} as Record<MetricKey, number>,
  );

  const data = METRIC_KEYS.map((key) => ({
    code: key,
    name: METRIC_LABELS[key],
    value: totals[key],
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, left: 35, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            interval={0}
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name={stateName}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={BAR_COLORS[index % BAR_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
