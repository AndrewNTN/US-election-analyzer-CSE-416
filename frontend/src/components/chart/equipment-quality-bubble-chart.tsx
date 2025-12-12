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
}

interface ChartDataPoint {
  x: number;
  y: number;
  z: number;
  name: string;
  totalBallots: number;
  rejectedBallots: number;
  mailInRejected: number;
  provisionalRejected: number;
  uocavaRejected: number;
  party: "republican" | "democratic";
}

export function EquipmentQualityBubbleChart({
  data,
  regressionCoefficients,
}: EquipmentQualityBubbleChartProps) {
  const { chartData, regressionLines } = useMemo(() => {
    // Map all data points for a single Scatter with Cell coloring
    const allData: ChartDataPoint[] = data.map((d) => ({
      x: d.equipmentQuality,
      y: d.rejectedBallotPercentage,
      z: d.totalBallots,
      name: d.county,
      totalBallots: d.totalBallots,
      rejectedBallots: d.rejectedBallots,
      mailInRejected: d.mailInRejected,
      provisionalRejected: d.provisionalRejected,
      uocavaRejected: d.uocavaRejected,
      party: d.dominantParty,
    }));

    // Generate regression line data points
    // y = ax^2 + bx + c (quadratic regression)
    const generateRegressionLine = (coeffs: {
      a: number;
      b: number;
      c: number;
    }) => {
      // Find min/max x values from data to constrain regression line
      const xValues = data.map((d) => d.equipmentQuality);
      const yValues = data.map((d) => d.rejectedBallotPercentage);
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const maxY = Math.max(...yValues) + 0.5; // Cap Y at data max + 0.5%

      const points = [];
      for (let x = minX; x <= maxX; x += 0.005) {
        const y = coeffs.a * x * x + coeffs.b * x + coeffs.c;
        // Only include points within reasonable Y range (0 to maxY)
        if (y >= 0 && y <= maxY) {
          points.push({ x, y });
        }
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
      chartData: allData,
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
    payload?: Array<{ payload: ChartDataPoint }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      // Check if this is scatter data (has name property) or regression line data (doesn't)
      if (!data.name) {
        return null;
      }

      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-sm mb-1">{data.name}</p>
          <p className="text-xs text-gray-700">
            Equipment Quality: {data.x?.toFixed(2) ?? "N/A"}
          </p>
          <p className="text-xs text-gray-700">
            Rejected Ballots: {data.y?.toFixed(2) ?? "N/A"}%
          </p>
          <p className="text-xs text-gray-700">
            Total Ballots: {data.totalBallots?.toLocaleString() ?? "N/A"}
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
        <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name="Equipment Quality"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => value.toFixed(2)}
            label={{
              value: "Equipment Quality Score (0-1)",
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
            name="Total Ballots"
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ strokeWidth: 0 }}
            isAnimationActive={false}
            wrapperStyle={{ zIndex: 100 }}
          />
          <Legend
            verticalAlign="top"
            height={55}
            content={() => (
              <div className="flex justify-center gap-5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600" />
                  <span className="text-md text-gray-600">
                    Republican counties
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-md text-gray-600">
                    Democratic counties
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-0 border-t-2 border-dashed"
                    style={{ borderColor: "#dc2626" }}
                  />
                  <span className="text-md text-gray-600">Rep. regression</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-0 border-t-2 border-dashed"
                    style={{ borderColor: "#2563eb" }}
                  />
                  <span className="text-md text-gray-600">Dem. regression</span>
                </div>
              </div>
            )}
          />
          <Scatter name="Counties" data={chartData} fillOpacity={0.7}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.party === "republican" ? "#dc2626" : "#2563eb"}
              />
            ))}
          </Scatter>
          {/* Draw regression lines using Scatter with line prop for smoothness */}
          <Scatter
            data={regressionLines.republican}
            line={{ stroke: "#dc2626", strokeWidth: 2, strokeDasharray: "5 5" }}
            shape={() => <g />}
            legendType="none"
            isAnimationActive={false}
          />
          <Scatter
            data={regressionLines.democratic}
            line={{ stroke: "#2563eb", strokeWidth: 2, strokeDasharray: "5 5" }}
            shape={() => <g />}
            legendType="none"
            isAnimationActive={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
