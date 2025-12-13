import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useMemo, useState } from "react";

type DemographicKey = "white" | "black" | "hispanic" | "asian" | "other";
type Row = { q: number } & Partial<Record<DemographicKey, number>>;

const META: Record<
  DemographicKey,
  { label: string; color: string; dash?: string }
> = {
  white: { label: "White", color: "#6E56CF" },
  black: { label: "Black", color: "#1EA7FD" },
  hispanic: { label: "Hispanic", color: "#E54D2E" },
  asian: { label: "Asian", color: "#2EB67D" },
  other: { label: "Other", color: "#8E8E93" },
};

export default function EquipmentQualityPDF({
  data,
  groups,
}: {
  data: Row[];
  groups: DemographicKey[];
}) {
  const [shown, setShown] = useState<Set<DemographicKey>>(new Set(groups));

  const yDomain = useMemo<[number, number]>(() => {
    let maxY = 0;
    for (const r of data)
      for (const g of groups) maxY = Math.max(maxY, r[g] ?? 0);
    // Add 10% padding to top for better visualization
    return [0, maxY * 1.1];
  }, [data, groups]);

  const toggle = (g: DemographicKey) =>
    setShown((s) => {
      const n = new Set(s);
      if (n.has(g)) {
        n.delete(g);
      } else {
        n.add(g);
      }
      return n;
    });

  return (
    <div className="space-y-8">
      {/* Checkbox legend with color chips - styled to match app */}
      <div className="flex flex-wrap items-center gap-4 px-2">
        {groups.map((g) => (
          <label
            key={g}
            className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900"
          >
            <input
              type="checkbox"
              checked={shown.has(g)}
              onChange={() => toggle(g)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: META[g].color }}
            />
            <span className="font-medium">{META[g].label}</span>
          </label>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={480}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 70, bottom: 40, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="q"
            type="number"
            domain={[0.75, 1]}
            tickFormatter={(v: number) => v.toFixed(2)}
            allowDataOverflow={true}
            label={{
              value: "Equipment Quality",
              position: "insideBottom",
              offset: -15,
              style: { fontSize: 14, fontWeight: 500 },
            }}
          />
          <YAxis
            domain={yDomain}
            tickFormatter={(v: number) =>
              v >= 1000
                ? `${(v / 1000).toFixed(0)}k`
                : v >= 1
                  ? v.toFixed(0)
                  : v.toFixed(2)
            }
            label={{
              value: "Relative Probability",
              angle: -90,
              position: "center",
              dx: -25,
              style: { fontSize: 14, fontWeight: 500 },
            }}
          />
          <Tooltip
            formatter={(v: number, k) => [
              (v as number).toFixed(2),
              META[k as DemographicKey]?.label ?? k,
            ]}
            labelFormatter={(label: number) => `Quality: ${label.toFixed(2)}`}
          />

          {groups
            .filter((g) => shown.has(g))
            .map((g) => {
              const m = META[g];
              return (
                <Line
                  key={g}
                  name={m.label}
                  type="monotone"
                  dataKey={g}
                  dot={false}
                  stroke={m.color}
                  strokeWidth={2}
                  strokeDasharray={m.dash}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              );
            })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
