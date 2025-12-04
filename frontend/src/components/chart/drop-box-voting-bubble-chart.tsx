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
  Cell,
} from "recharts";

import type { DropBoxVotingData } from "@/lib/api/voting-requests";

interface DropBoxVotingBubbleChartProps {
  data: DropBoxVotingData[];
}

interface TooltipData {
  x: number;
  y: number;
  z: number;
  name: string;
  republicanVotes: number;
  democraticVotes: number;
  totalDropBoxVotes: number;
  totalVotes: number;
  party: "republican" | "democratic";
}

export function DropBoxVotingBubbleChart({
  data,
}: DropBoxVotingBubbleChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      x: d.republicanPercentage,
      y: d.dropBoxPercentage,
      z: d.totalDropBoxVotes,
      name: d.eavsRegion,
      republicanVotes: d.republicanVotes,
      democraticVotes: d.democraticVotes,
      totalDropBoxVotes: d.totalDropBoxVotes,
      totalVotes: d.totalVotes,
      party: d.dominantParty,
    }));
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
            Republican Vote Percentage: {data.x.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-700">
            Total Drop Box Votes: {data.totalDropBoxVotes.toLocaleString()}
          </p>
          <p className="text-xs text-gray-700">
            Drop Box Voting Percentage: {data.y.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-700">
            Total Votes: {data.totalVotes.toLocaleString()}
          </p>
          <p className="text-xs text-gray-700">
            Republican Votes: {data.republicanVotes.toLocaleString()}
          </p>
          <p className="text-xs text-gray-700">
            Democratic Votes: {data.democraticVotes.toLocaleString()}
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
        <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 40 }}>
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
            range={[150, 4000]}
            name="Total Votes"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={55}
            content={() => (
              <div className="flex justify-center gap-5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600" />
                  <span className="text-md text-gray-600">
                    Republican-dominated regions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-md text-gray-600">
                    Democratic-dominated regions
                  </span>
                </div>
              </div>
            )}
          />
          <Scatter name="EAVS Regions" data={chartData} fillOpacity={0.65}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.party === "republican" ? "#dc2626" : "#2563eb"}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
