import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useMemo, useState, useEffect } from "react";

type DemographicKey = "white" | "black" | "hispanic" | "asian" | "other";

/**
 * Data row:
 * - Accepts legacy `q` (0..100), auto-mapped to `ratePct`.
 * - Or use `rate` in [0,1] OR `ratePct` in [0,100] for the x-axis.
 * - Each demographic key maps to a density/relative probability value for that bucket.
 */
type Row = {
  q?: number; // legacy, 0..100
  rate?: number; // 0..1
  ratePct?: number; // 0..100
} & Partial<Record<DemographicKey, number>>;

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

export default function RejectedBallotsPDF({
  data,
  groups,
  xKey, // optional; auto-detects if omitted
  xLabel = "Rejected ballot rate",
  yLabel = "Posterior density (relative probability)",
}: {
  data: Row[];
  groups: DemographicKey[];
  xKey?: "rate" | "ratePct";
  xLabel?: string;
  yLabel?: string;
}) {
  // 1) Normalize data: if q present and no explicit x, map q -> ratePct
  const normalized = useMemo<Row[]>(() => {
    return data.map((d) => {
      if (d.rate == null && d.ratePct == null && typeof d.q === "number") {
        return { ...d, ratePct: d.q };
      }
      return d;
    });
  }, [data]);

  // 2) Resolve which x-axis key to use (auto-detect)
  const resolvedXKey: "rate" | "ratePct" = useMemo(() => {
    if (xKey) return xKey;
    const hasRate = normalized.some((d) => typeof d.rate === "number");
    const hasPct = normalized.some((d) => typeof d.ratePct === "number");
    return hasRate ? "rate" : hasPct ? "ratePct" : "ratePct";
  }, [xKey, normalized]);

  // 3) Only include groups that actually have numeric data
  const availableGroups = useMemo<DemographicKey[]>(
    () =>
      groups.filter((g) => normalized.some((r) => typeof r[g] === "number")),
    [groups, normalized],
  );

  // 4) Legend visibility state; sync when availableGroups change
  const [shown, setShown] = useState<Set<DemographicKey>>(
    new Set(availableGroups),
  );
  useEffect(() => {
    setShown(new Set(availableGroups));
  }, [availableGroups]);

  // 5) y-domain based on currently visible series
  const yDomain = useMemo<[number, number]>(() => {
    let maxY = 0;
    for (const r of normalized) {
      for (const g of availableGroups) {
        if (!shown.has(g)) continue;
        maxY = Math.max(maxY, r[g] ?? 0);
      }
    }
    // Add 10% padding to top for better visualization
    return [0, maxY * 1.1];
  }, [normalized, availableGroups, shown]);

  // 6) x-domain based on density distribution
  const xDomain = useMemo<[number, number]>(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let hasData = false;

    normalized.forEach((row) => {
      const x = row[resolvedXKey];
      if (typeof x !== "number") return;

      // Check if any VISIBLE group has significant density at this x
      // Threshold 0.01 ensures we don't zoom in on noise
      const hasDensity = availableGroups.some(
        (g) => shown.has(g) && (row[g] ?? 0) > 0.01,
      );

      if (hasDensity) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        hasData = true;
      }
    });

    if (!hasData) {
      return resolvedXKey === "rate" ? [0, 0.1] : [0, 10];
    }

    // Round to whole numbers to prevent duplicate tick labels
    const roundedMin = Math.floor(minX);
    const roundedMax = Math.ceil(maxX);
    return [Math.max(0, roundedMin), roundedMax];
  }, [normalized, availableGroups, shown, resolvedXKey]);

  // 7) Formatters
  const xTick = (v: number) =>
    resolvedXKey === "rate" ? `${(v * 100).toFixed(0)}%` : `${v.toFixed(0)}%`;

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
        {availableGroups.map((g) => (
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
          data={normalized}
          margin={{ top: 10, right: 70, bottom: 40, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={resolvedXKey}
            type="number"
            domain={xDomain}
            allowDataOverflow={true}
            allowDuplicatedCategory={false}
            tickFormatter={xTick}
            label={{
              value: xLabel,
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
              value: yLabel,
              angle: -90,
              position: "center",
              dx: -25,
              style: { fontSize: 14, fontWeight: 500 },
            }}
          />
          <Tooltip
            formatter={(v: number, k) => [
              (v as number).toFixed(4),
              META[k as DemographicKey]?.label ?? k,
            ]}
            labelFormatter={(label: number) =>
              resolvedXKey === "rate"
                ? `${(label * 100).toFixed(1)}%`
                : `${typeof label === "number" ? label.toFixed(1) : label}%`
            }
          />

          {availableGroups
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
