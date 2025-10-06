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
  A12b: "A12b – Death",
  A12c: "A12c – Felony conviction",
  A12d: "A12d – Mental incapacity",
  A12e: "A12e – Moved out of jurisdiction",
  A12f: "A12f – Voter request",
  A12g: "A12g – Failed to respond",
  A12h: "A12h – Other",
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
];

export function PollbookDeletionsBarChart({
  stateName,
  barData,
}: PollbookDeletionsBarChartProps) {
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
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
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
