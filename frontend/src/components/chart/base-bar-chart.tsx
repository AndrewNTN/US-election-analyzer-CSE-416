import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { TooltipProps } from "recharts";
import { ChartTooltip, type ChartTooltipOptions } from "./chart-tooltip";

interface BaseBarChartProps<TData, TMetricKey extends string> {
  stateName: string;
  barData: TData[];
  metricKeys: readonly TMetricKey[];
  metricLabels: Record<TMetricKey, string>;
  metricAccessor: (data: TData, key: TMetricKey) => number;
  barColors?: string[];
  yAxisLabel?: string;
  yAxisTickFormatter?: (value: number) => string;
  height?: string;
  margin?: { top: number; right: number; left: number; bottom: number };
  tooltipOptions?: ChartTooltipOptions;
  xAxisAngle?: number;
}

const DEFAULT_BAR_COLOR = "#8e51ff";
const DEFAULT_HEIGHT = "h-64";
const DEFAULT_MARGIN = { top: 8, right: 16, left: 8, bottom: 8 };
const PIXELS_PER_BAR = 100;
const MIN_CHART_WIDTH = 400;
const Y_AXIS_PADDING = 100;

export function BaseBarChart<TData, TMetricKey extends string>({
  stateName,
  barData,
  metricKeys,
  metricLabels,
  metricAccessor,
  barColors,
  yAxisLabel,
  yAxisTickFormatter,
  height = DEFAULT_HEIGHT,
  margin = DEFAULT_MARGIN,
  tooltipOptions,
  xAxisAngle,
}: BaseBarChartProps<TData, TMetricKey>) {
  const totals: Record<TMetricKey, number> = {} as Record<TMetricKey, number>;
  metricKeys.forEach((key) => {
    totals[key] = barData.reduce<number>(
      (sum: number, row: TData) => sum + (metricAccessor(row, key) ?? 0),
      0,
    );
  });

  // Transform data for Recharts
  const data = metricKeys.map((key) => ({
    code: key,
    name: metricLabels[key],
    value: totals[key],
  }));

  const colors = barColors || metricKeys.map(() => DEFAULT_BAR_COLOR);
  const calculatedWidth = Math.max(
    data.length * PIXELS_PER_BAR + Y_AXIS_PADDING,
    MIN_CHART_WIDTH,
  );

  return (
    <div className={`w-full ${height} flex justify-center`}>
      <div
        className="max-w-full h-full"
        style={{ width: `${calculatedWidth}px` }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              interval={0}
              angle={xAxisAngle ?? -15}
              textAnchor="end"
              height={60}
            />
            <YAxis
              label={
                yAxisLabel
                  ? {
                      value: yAxisLabel,
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle" },
                    }
                  : undefined
              }
              tickFormatter={yAxisTickFormatter}
            />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.2)" }}
              wrapperStyle={{ pointerEvents: "none", zIndex: 1000 }}
              content={(tooltipProps: TooltipProps<number, string>) => (
                <ChartTooltip
                  {...tooltipProps}
                  labelFormatter={(label) => `${label}`}
                  {...tooltipOptions}
                />
              )}
            />
            <Bar dataKey="value" name={stateName} maxBarSize={80}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
