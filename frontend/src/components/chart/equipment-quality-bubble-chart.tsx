import { useMemo } from "react";
import {
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
  Line,
  ComposedChart,
} from "recharts";

export interface EquipmentQualityData {
  county: string;
  equipmentQuality: number;
  rejectedBallotPercentage: number;
  totalBallots: number;
  rejectedBallots: number;
  dominantParty: "republican" | "democratic";
  mailInRejected: number;
  provisionalRejected: number;
  uocavaRejected: number;
}

export interface RegressionCoefficients {
  republican: {
    a: number;
    b: number;
    c: number;
  };
  democratic: {
    a: number;
    b: number;
    c: number;
  };
}

interface EquipmentQualityBubbleChartProps {
  data: EquipmentQualityData[];
  regressionCoefficients: RegressionCoefficients;
  stateName: string;
}

interface TooltipData {
  x: number;
  y: number;
  z: number;
  name: string;
  totalBallots: number;
  rejectedBallots: number;
  mailInRejected: number;
  provisionalRejected: number;
  uocavaRejected: number;
}

export function EquipmentQualityBubbleChart({
  data,
  regressionCoefficients,
}: EquipmentQualityBubbleChartProps) {
  // Split data by party dominance for different colored bubbles
  const { republicanData, democraticData, regressionLines } = useMemo(() => {
    const repData = data
      .filter((d) => d.dominantParty === "republican")
      .map((d) => ({
        x: d.equipmentQuality,
        y: d.rejectedBallotPercentage,
        z: d.totalBallots,
        name: d.county,
        totalBallots: d.totalBallots,
        rejectedBallots: d.rejectedBallots,
        mailInRejected: d.mailInRejected,
        provisionalRejected: d.provisionalRejected,
        uocavaRejected: d.uocavaRejected,
      }));

    const demData = data
      .filter((d) => d.dominantParty === "democratic")
      .map((d) => ({
        x: d.equipmentQuality,
        y: d.rejectedBallotPercentage,
        z: d.totalBallots,
        name: d.county,
        totalBallots: d.totalBallots,
        rejectedBallots: d.rejectedBallots,
        mailInRejected: d.mailInRejected,
        provisionalRejected: d.provisionalRejected,
        uocavaRejected: d.uocavaRejected,
      }));

    // Generate regression line data points
    // y = ax^2 + bx + c (quadratic regression)
    const generateRegressionLine = (
      coeffs: { a: number; b: number; c: number },
      minX = 60,
      maxX = 90,
    ) => {
      const points = [];
      for (let x = minX; x <= maxX; x += 1) {
        const y = coeffs.a * x * x + coeffs.b * x + coeffs.c;
        points.push({ x, y });
      }
      return points;
    };

    const repRegressionLine = generateRegressionLine(
      regressionCoefficients.republican,
    );
    const demRegressionLine = generateRegressionLine(
      regressionCoefficients.democratic,
    );

    return {
      republicanData: repData,
      democraticData: demData,
      regressionLines: {
        republican: repRegressionLine,
        democratic: demRegressionLine,
      },
    };
  }, [data, regressionCoefficients]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: TooltipData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      // Check if this is scatter data (has name property) or regression line data (doesn't)
      if (!data.name) {
        // This is a regression line point, don't show tooltip
        return null;
      }

      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-sm mb-1">{data.name} County</p>
          <p className="text-xs text-gray-700">
            Equipment Quality: {data.x?.toFixed(0) ?? "N/A"}
          </p>
          <p className="text-xs text-gray-700">
            Rejected Ballots: {data.y?.toFixed(2) ?? "N/A"}%
          </p>
          <p className="text-xs text-gray-700">
            Total Ballots: {data.totalBallots?.toLocaleString() ?? "N/A"}
          </p>
          <p className="text-xs text-gray-700 mt-1 font-semibold">
            Rejected Breakdown:
          </p>
          <p className="text-xs text-gray-700 ml-2">
            Mail-in: {data.mailInRejected?.toLocaleString() ?? "N/A"}
          </p>
          <p className="text-xs text-gray-700 ml-2">
            Provisional: {data.provisionalRejected?.toLocaleString() ?? "N/A"}
          </p>
          <p className="text-xs text-gray-700 ml-2">
            UOCAVA: {data.uocavaRejected?.toLocaleString() ?? "N/A"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[600px]">
      <h3 className="text-lg font-semibold mb-2 text-center">
        Voting Equipment Quality vs Rejected Ballots
      </h3>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Bubble size represents total ballots. Color indicates county party
        dominance. Lines show quadratic regression by party.
      </p>
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name="Equipment Quality"
            domain={[60, 90]}
            label={{
              value: "Equipment Quality Score",
              position: "insideBottom",
              offset: -20,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Rejected Ballots %"
            unit="%"
            domain={[0, "auto"]}
            label={{
              value: "Rejected Ballot Percentage",
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
            name="Total Ballots (10k)"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ paddingBottom: "10px" }}
          />

          {/* Regression lines */}
          <Line
            type="monotone"
            data={regressionLines.republican}
            dataKey="y"
            stroke="#dc2626"
            strokeWidth={2}
            dot={false}
            name="Republican regression"
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            data={regressionLines.democratic}
            dataKey="y"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="Democratic regression"
            strokeDasharray="5 5"
          />

          {/* Scatter plots */}
          <Scatter
            name="Republican counties"
            data={republicanData}
            fill="#dc2626"
            fillOpacity={0.7}
          />
          <Scatter
            name="Democratic counties"
            data={democraticData}
            fill="#2563eb"
            fillOpacity={0.7}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
