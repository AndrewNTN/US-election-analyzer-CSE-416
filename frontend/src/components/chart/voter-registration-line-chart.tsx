import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type VoterRegistrationData = {
  jurisdiction: string;
  registeredVoters2016: number;
  registeredVoters2020: number;
  registeredVoters2024: number;
};

type ChartDataPoint = {
  jurisdiction: number;
  jurisdictionName: string;
  "2016": number;
  "2020": number;
  "2024": number;
};

interface VoterRegistrationLineChartProps {
  data: VoterRegistrationData[];
}

export function VoterRegistrationLineChart({
  data,
}: VoterRegistrationLineChartProps) {
  // Transform data for the line chart
  // The data is already sorted by 2024 registered voters in ascending order
  const chartData: ChartDataPoint[] = data.map((item, index) => ({
    jurisdiction: index + 1, // Use index for x-axis (sorted order)
    jurisdictionName: item.jurisdiction,
    "2016": item.registeredVoters2016,
    "2020": item.registeredVoters2020,
    "2024": item.registeredVoters2024,
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: ChartDataPoint;
      value: number;
      dataKey: string;
    }>;
  }) => {
    if (active && payload && payload.length) {
      const tooltipData = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">
            {tooltipData.jurisdictionName}
          </p>
          <p className="text-sm text-blue-600">
            2016: {tooltipData["2016"].toLocaleString()} voters
          </p>
          <p className="text-sm text-green-600">
            2020: {tooltipData["2020"].toLocaleString()} voters
          </p>
          <p className="text-sm text-orange-600">
            2024: {tooltipData["2024"].toLocaleString()} voters
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 30, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="jurisdiction"
            label={{
              value: "Jurisdictions (sorted by 2024 voter count)",
              position: "insideBottom",
              offset: -10,
            }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{
              value: "Registered Voters",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toLocaleString()}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ paddingBottom: "10px" }}
          />
          <Line
            type="monotone"
            dataKey="2016"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
            name="2016 Registered Voters"
            strokeOpacity={0.9}
          />
          <Line
            type="monotone"
            dataKey="2020"
            stroke="#16a34a"
            strokeWidth={3}
            dot={false}
            name="2020 Registered Voters"
            strokeOpacity={0.9}
          />
          <Line
            type="monotone"
            dataKey="2024"
            stroke="#ea580c"
            strokeWidth={3}
            dot={false}
            name="2024 Registered Voters"
            strokeOpacity={0.9}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
