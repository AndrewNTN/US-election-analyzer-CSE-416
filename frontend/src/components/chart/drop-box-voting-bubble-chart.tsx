import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from "recharts";

export interface DropBoxVotingData {
  eavsRegion: string;
  totalDropBoxVotes: number;
  republicanVotes: number;
  democraticVotes: number;
  otherVotes: number;
  totalVotes: number;
  republicanPercentage: number;
  dropBoxPercentage: number;
  dominantParty: "republican" | "democratic";
}

interface DropBoxVotingBubbleChartProps {
  data: DropBoxVotingData[];
  stateName: string;
}

interface TooltipData {
  x: number;
  y: number;
  z: number;
  name: string;
  republicanVotes: number;
  democraticVotes: number;
  totalDropBoxVotes: number;
}

export function DropBoxVotingBubbleChart({
  data,
}: DropBoxVotingBubbleChartProps) {
  // Split data by party dominance for different colored bubbles
  const { republicanData, democraticData } = useMemo(() => {
    const repData = data
      .filter((d) => d.dominantParty === "republican")
      .map((d) => ({
        x: d.republicanPercentage,
        y: d.dropBoxPercentage,
        z: d.totalDropBoxVotes / 1000, // Scale for bubble size
        name: d.eavsRegion,
        republicanVotes: d.republicanVotes,
        democraticVotes: d.democraticVotes,
        totalDropBoxVotes: d.totalDropBoxVotes,
      }));

    const demData = data
      .filter((d) => d.dominantParty === "democratic")
      .map((d) => ({
        x: d.republicanPercentage,
        y: d.dropBoxPercentage,
        z: d.totalDropBoxVotes / 1000, // Scale for bubble size
        name: d.eavsRegion,
        republicanVotes: d.republicanVotes,
        democraticVotes: d.democraticVotes,
        totalDropBoxVotes: d.totalDropBoxVotes,
      }));

    return { republicanData: repData, democraticData: demData };
  }, [data]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: TooltipData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-sm mb-1">{data.name}</p>
          <p className="text-xs text-gray-700">
            Republican Votes: {data.x.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-700">
            Drop Box Voting: {data.y.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-700">
            Total Drop Box Votes: {data.totalDropBoxVotes.toLocaleString()}
          </p>
          <p className="text-xs text-gray-700">
            Republican: {data.republicanVotes.toLocaleString()}
          </p>
          <p className="text-xs text-gray-700">
            Democratic: {data.democraticVotes.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[600px]">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Drop Box Voting by EAVS Region
      </h3>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Bubble size represents total drop box votes. Color indicates party
        dominance in 2024 Presidential election.
      </p>
      <ResponsiveContainer width="100%" height="85%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name="Republican Vote %"
            unit="%"
            domain={[0, 100]}
            label={{
              value: "Republican Vote Percentage",
              position: "insideBottom",
              offset: -20,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Drop Box Voting %"
            unit="%"
            domain={[0, "auto"]}
            label={{
              value: "Drop Box Voting Percentage",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
              offset: -10,
            }}
          />
          <ZAxis
            type="number"
            dataKey="z"
            range={[100, 1000]}
            name="Total Votes (thousands)"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ paddingBottom: "10px" }}
          />
          <Scatter
            name="Republican-dominated regions"
            data={republicanData}
            fill="#dc2626"
            fillOpacity={0.7}
          />
          <Scatter
            name="Democratic-dominated regions"
            data={democraticData}
            fill="#2563eb"
            fillOpacity={0.7}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
