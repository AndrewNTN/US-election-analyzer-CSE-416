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

// 🎨 Custom color palette
const BAR_COLORS = [
  "#8e51ff", // purple
  "#8e51ff", // purple
  "#8e51ff", // purple
];

export function ActiveVotersBarChart({
  stateName,
  barData,
}: ActiveVotersBarChartProps) {
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
