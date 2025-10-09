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
};


// 🎨 Custom color palette
const BAR_COLORS = [
  "#8e51ff", // purple
  "#8e51ff", // purple
  "#8e51ff", // purple
  "#8e51ff", // purple
  "#8e51ff", // purple
  "#8e51ff", // purple
  "#8e51ff", // purple
  "#8e51ff", // purple
];

export function ProvisionalBallotsBarChart({
  stateName,
  barData,
}: ProvisionalBallotsBarChartProps) {
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
          <YAxis
            label={{
              value: "Number of Ballots",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
          />
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
