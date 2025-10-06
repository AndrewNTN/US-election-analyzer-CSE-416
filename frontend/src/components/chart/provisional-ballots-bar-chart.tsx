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
  E2a: number; // Total provisional ballots issued
  E2b: number; // Counted
  E2c: number; // Rejected
  E2d: number; // Pending
  E2e: number; // Reject: not registered
  E2f: number; // Reject: wrong jurisdiction
  E2g: number; // Reject: missing signature / ID
  E2h: number; // Reject: other reasons
  E2i: string; // Notes
}

export interface ProvisionalBallotsBarChartProps {
  stateName: string;
  barData: ProvisionBallotsData[];
}

const METRIC_KEYS = ["E2a","E2b","E2c","E2d","E2e","E2f","E2g","E2h"] as const;
type MetricKey = typeof METRIC_KEYS[number];

const METRIC_LABELS: Record<MetricKey, string> = {
  E2a: "E2a – Issued",
  E2b: "E2b – Counted",
  E2c: "E2c – Rejected",
  E2d: "E2d – Pending",
  E2e: "E2e – Rej: Not registered",
  E2f: "E2f – Rej: Wrong jurisdiction",
  E2g: "E2g – Rej: Missing ID/Signature",
  E2h: "E2h – Rej: Other",
};

// 🎨 Custom color palette
const BAR_COLORS = [
  "#4f46e5", // indigo
  "#16a34a", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#0ea5e9", // sky blue
  "#8b5cf6", // violet
  "#f97316", // orange
  "#10b981", // emerald
];

export function ProvisionalBallotsBarChart({ stateName, barData }: ProvisionalBallotsBarChartProps) {
  const totals = METRIC_KEYS.reduce((acc, key) => {
    acc[key] = barData.reduce((sum, row) => sum + (row[key] ?? 0), 0);
    return acc;
  }, {} as Record<MetricKey, number>);

  const data = METRIC_KEYS.map((key) => ({
    code: key,
    name: METRIC_LABELS[key],
    value: totals[key],
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name={stateName}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
