import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { formatNumber } from "@/lib/utils";

interface VotingEquipmentBarChartProps {
  stateName: string;
  data: {
    year: number;
    dreNoVVPAT: number;
    dreWithVVPAT: number;
    ballotMarkingDevice: number;
    scanner: number;
  }[];
}

export function VotingEquipmentBarChart({
  data,
}: VotingEquipmentBarChartProps) {
  const categories = [
    {
      key: "dreNoVVPAT",
      label: "DRE (No VVPAT)",
      color: "#8e51ff",
    },
    {
      key: "dreWithVVPAT",
      label: "DRE (With VVPAT)",
      color: "#8e51ff",
    },
    {
      key: "ballotMarkingDevice",
      label: "Ballot Marking Device",
      color: "#8e51ff",
    },
    {
      key: "scanner",
      label: "Scanner",
      color: "#8e51ff",
    },
  ];

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-center py-2">
        Voting Equipment by State
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {categories.map((category) => (
          <div
            key={category.key}
            className="bg-white rounded-lg border p-1.5 overflow-hidden"
          >
            <h4 className="text-xs font-semibold text-center mb-0.5">
              {category.label}
            </h4>
            <div className="overflow-visible">
              <ResponsiveContainer width="100%" height={150}>
                <BarChart
                  data={data}
                  margin={{ top: 3, right: 3, left: 0, bottom: 3 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    label={{
                      value: "Year",
                      position: "insideBottom",
                      offset: -3,
                      style: { fontSize: 12 },
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{
                      value: "Quantity",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fontSize: 12 },
                      offset: 12,
                    }}
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatNumber}
                    domain={[0, "auto"]}
                    tickCount={6}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        labelFormatter={(label) => `Year: ${label}`}
                        valueFormatter={(value) =>
                          typeof value === "number"
                            ? value.toLocaleString()
                            : String(value)
                        }
                        unitLabel="Devices"
                      />
                    }
                    wrapperStyle={{ zIndex: 1000, pointerEvents: "none" }}
                  />
                  <Bar
                    dataKey={category.key}
                    fill={category.color}
                    name={category.label}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={80}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
