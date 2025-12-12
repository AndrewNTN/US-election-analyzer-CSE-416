import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, LabelList
} from "recharts";
import { useMemo, useState } from "react";

type DemographicKey = "white" | "black" | "hispanic" | "asian" | "other";
type Row = { q: number } & Partial<Record<DemographicKey, number>>;

const META: Record<DemographicKey, { label: string; color: string; dash?: string }> = {
  white:   { label: "White",   color: "#6E56CF" },
  black:   { label: "Black",   color: "#1EA7FD", dash: "4 2" },
  hispanic:{ label: "Hispanic",color: "#E54D2E" },
  asian:   { label: "Asian",   color: "#2EB67D", dash: "2 2" },
  other:   { label: "Other",   color: "#8E8E93", dash: "6 3" },
};

export default function EquipmentQualityPDF({ data, groups }: { data: Row[]; groups: DemographicKey[] }) {
  const [shown, setShown] = useState<Set<DemographicKey>>(new Set(groups));
  const [hovered, setHovered] = useState<DemographicKey | null>(null);

  const yDomain = useMemo<[number, number]>(() => {
    let maxY = 0;
    for (const r of data) for (const g of groups) maxY = Math.max(maxY, r[g] ?? 0);
    return [0, Math.max(0.01, Number(maxY.toFixed(3)))];
  }, [data, groups]);

  const toggle = (g: DemographicKey) =>
    setShown(s => { const n = new Set(s); n.has(g) ? n.delete(g) : n.add(g); return n; });

  return (
    <div className="space-y-2">
      {/* Checkbox legend with color chips */}
      <div className="flex flex-wrap gap-3">
        {groups.map(g => (
          <label key={g} className="inline-flex items-center gap-2 cursor-pointer">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: META[g].color, outline: META[g].dash ? "1px dashed currentColor" : undefined }} />
            <input type="checkbox" checked={shown.has(g)} onChange={() => toggle(g)} />
            <span className="capitalize">{META[g].label}</span>
          </label>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={data} margin={{ top: 10, right: 28, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="q" label={{ value: "Equipment quality", position: "insideBottom", offset: 0 }} />
          <YAxis domain={yDomain} label={{ value: "Relative probability", angle: -90, position: "insideLeft" }} />
          <Tooltip formatter={(v: number, k) => [(v as number).toFixed(4), META[k as DemographicKey]?.label ?? k]} />
          <Legend
            formatter={(k: string) => META[k as DemographicKey]?.label ?? k}
            wrapperStyle={{ opacity: 0.75 }}
          />

          {groups.filter(g => shown.has(g)).map((g) => {
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
                    if (index !== data.length - 1 || value == null) return null;
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
