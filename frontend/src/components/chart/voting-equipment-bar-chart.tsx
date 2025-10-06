import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { VOTING_EQUIPMENT_COLORS } from "@/lib/colors";

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
  stateName,
  data,
}: VotingEquipmentBarChartProps) {
  const categories = [
    {
      key: "dreNoVVPAT",
      label: "DRE (No VVPAT)",
      color: VOTING_EQUIPMENT_COLORS.dre_no_vvpat,
    },
    {
      key: "dreWithVVPAT",
      label: "DRE (With VVPAT)",
      color: VOTING_EQUIPMENT_COLORS.dre_with_vvpat,
    },
    {
      key: "ballotMarkingDevice",
      label: "Ballot Marking Device",
      color: VOTING_EQUIPMENT_COLORS.ballot_marking_device,
    },
    {
      key: "scanner",
      label: "Scanner",
      color: VOTING_EQUIPMENT_COLORS.scanner,
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-center">
        Voting Equipment by Category - {stateName}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <div key={category.key} className="bg-white rounded-lg border p-2">
            <h4 className="text-xs font-semibold mb-1 text-center">
              {category.label}
            </h4>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart
                data={data}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  label={{
                    value: "Year",
                    position: "insideBottom",
                    offset: -3,
                    style: { fontSize: 10 },
                  }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  label={{
                    value: "Qty",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 10 },
                  }}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  formatter={(value: number) => [
                    value.toLocaleString(),
                    "Devices",
                  ]}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Bar
                  dataKey={category.key}
                  fill={category.color}
                  name={category.label}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
