import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, LabelList
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
  q?: number;        // legacy, 0..100
  rate?: number;     // 0..1
  ratePct?: number;  // 0..100
} & Partial<Record<DemographicKey, number>>;

const META: Record<DemographicKey, { label: string; color: string; dash?: string }> = {
  white:   { label: "White",    color: "#6E56CF" },
  black:   { label: "Black",    color: "#1EA7FD", dash: "4 2" },
  hispanic:{ label: "Hispanic", color: "#E54D2E" },
  asian:   { label: "Asian",    color: "#2EB67D", dash: "2 2" },
  other:   { label: "Other",    color: "#8E8E93", dash: "6 3" },
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
      if ((d.rate == null && d.ratePct == null) && typeof d.q === "number") {
        return { ...d, ratePct: d.q };
      }
      return d;
    });
  }, [data]);

  // 2) Resolve which x-axis key to use (auto-detect)
  const resolvedXKey: "rate" | "ratePct" = useMemo(() => {
    if (xKey) return xKey;
    const hasRate = normalized.some((d) => typeof d.rate === "number");
    const hasPct  = normalized.some((d) => typeof d.ratePct === "number");
    return hasRate ? "rate" : hasPct ? "ratePct" : "ratePct";
  }, [xKey, normalized]);

  // 3) Only include groups that actually have numeric data
  const availableGroups = useMemo<DemographicKey[]>(
    () => groups.filter((g) => normalized.some((r) => typeof r[g] === "number")),
    [groups, normalized]
  );

  // 4) Legend visibility state; sync when availableGroups change
  const [shown, setShown] = useState<Set<DemographicKey>>(new Set(availableGroups));
  useEffect(() => {
    setShown(new Set(availableGroups));
  }, [availableGroups]);

  const [hovered, setHovered] = useState<DemographicKey | null>(null);

  // 5) y-domain based on currently visible series
  const yDomain = useMemo<[number, number]>(() => {
    let maxY = 0;
    for (const r of normalized) {
      for (const g of availableGroups) {
        if (!shown.has(g)) continue;
        maxY = Math.max(maxY, r[g] ?? 0);
      }
    }
    return [0, Math.max(0.01, Number(maxY.toFixed(3)))];
  }, [normalized, availableGroups, shown]);

  // 6) Formatters
  const xTick = (v: number) =>
    resolvedXKey === "rate" ? `${(v * 100).toFixed(0)}%` : `${v}%`;

  const toggle = (g: DemographicKey) =>
    setShown((s) => {
      const n = new Set(s);
      n.has(g) ? n.delete(g) : n.add(g);
      return n;
    });

  return (
    <div className="space-y-2">
      {/* Checkbox legend with color chips */}
      <div className="flex flex-wrap gap-3">
        {availableGroups.map((g) => (
          <label key={g} className="inline-flex items-center gap-2 cursor-pointer">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{
                background: META[g].color,
                outline: META[g].dash ? "1px dashed currentColor" : undefined,
              }}
            />
            <input
              type="checkbox"
              checked={shown.has(g)}
              onChange={() => toggle(g)}
            />
            <span className="capitalize">{META[g].label}</span>
          </label>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={normalized} margin={{ top: 10, right: 28, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={resolvedXKey}
            tickFormatter={xTick}
            label={{ value: xLabel, position: "insideBottom", offset: 0 }}
          />
          <YAxis
            domain={yDomain}
            label={{ value: yLabel, angle: -90, position: "insideLeft" }}
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
          <Legend
            formatter={(k: string) => META[k as DemographicKey]?.label ?? k}
            wrapperStyle={{ opacity: 0.75 }}
          />

          {availableGroups
            .filter((g) => shown.has(g))
            .map((g) => {
              const m = META[g];
              const faded = hovered && hovered !== g;
              return (
                <Line
                  key={g}
                  name={m.label}
                  type="monotone"
                  dataKey={g}
                  dot={false}
                  stroke={m.color}
                  strokeWidth={faded ? 2 : 3}
                  strokeOpacity={faded ? 0.25 : 1}
                  strokeDasharray={m.dash}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                  onMouseEnter={() => setHovered(g)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Inline end label on the last point */}
                  <LabelList
                    content={(props: any) => {
                      const { x, y, index, value } = props;
                      if (index !== normalized.length - 1 || value == null) return null;
                      return (
                        <text x={x + 6} y={y} dy={4} fontSize={12} fill={m.color}>
                          {m.label}
                        </text>
                      );
                    }}
                  />
                </Line>
              );
            })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}