import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

import type { GinglesChartResponse } from "@/lib/api/voting-requests";

// Register Chart.js components
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface GinglesChartProps {
  data: GinglesChartResponse;
}

type DemographicKey = "white" | "black" | "hispanic" | "asian";

const demographicLabels: Record<DemographicKey, string> = {
  white: "White",
  black: "Black/African American",
  hispanic: "Hispanic/Latino",
  asian: "Asian",
};

export function GinglesChart({ data }: GinglesChartProps) {
  const [selectedDemographic, setSelectedDemographic] =
    useState<DemographicKey>("white");

  // Transform precinct data for Republican scatter points
  const republicanData = useMemo(() => {
    return data.precincts
      .filter(
        (p) => p[selectedDemographic] != null && p.republicanPercentage != null,
      )
      .map((p) => ({
        x: p[selectedDemographic] ?? 0,
        y: p.republicanPercentage ?? 0,
        precinctName: p.precinctName,
        countyName: p.countyName,
        totalVotes: p.totalVotes,
        republicanVotes: p.republicanVotes,
        democraticVotes: p.democraticVotes,
      }));
  }, [data.precincts, selectedDemographic]);

  // Transform precinct data for Democratic scatter points
  const democraticData = useMemo(() => {
    return data.precincts
      .filter(
        (p) => p[selectedDemographic] != null && p.democraticPercentage != null,
      )
      .map((p) => ({
        x: p[selectedDemographic] ?? 0,
        y: p.democraticPercentage ?? 0,
        precinctName: p.precinctName,
        countyName: p.countyName,
        totalVotes: p.totalVotes,
        republicanVotes: p.republicanVotes,
        democraticVotes: p.democraticVotes,
      }));
  }, [data.precincts, selectedDemographic]);

  // Get regression curve data - sorted by x for smooth line
  const regressionCurves = useMemo(() => {
    const curves = data.regressionCurves[selectedDemographic];
    if (!curves) return { republican: [], democratic: [] };

    return {
      republican: curves.republican
        .map((point) => ({ x: point[0], y: point[1] }))
        .sort((a, b) => a.x - b.x),
      democratic: curves.democratic
        .map((point) => ({ x: point[0], y: point[1] }))
        .sort((a, b) => a.x - b.x),
    };
  }, [data.regressionCurves, selectedDemographic]);

  const chartData = {
    datasets: [
      {
        label: "Republican Vote %",
        data: republicanData,
        backgroundColor: "rgba(239, 68, 68, 0.3)",
        borderColor: "rgba(239, 68, 68, 0.1)",
        pointRadius: 3,
        pointHoverRadius: 5,
        order: 2,
      },
      {
        label: "Democratic Vote %",
        data: democraticData,
        backgroundColor: "rgba(59, 130, 246, 0.3)",
        borderColor: "rgba(59, 130, 246, 0.1)",
        pointRadius: 3,
        pointHoverRadius: 5,
        order: 2,
      },
      {
        label: "REP Regression",
        data: regressionCurves.republican,
        type: "line" as const,
        borderColor: "#e60000ff",
        borderWidth: 4,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
        tension: 0,
        order: 0,
      },
      {
        label: "DEM Regression",
        data: regressionCurves.democratic,
        type: "line" as const,
        borderColor: "#0033ddff",
        borderWidth: 4,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
        tension: 0,
        order: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    interaction: {
      mode: "nearest" as const,
      intersect: true,
    },
    scales: {
      x: {
        type: "linear" as const,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: `${demographicLabels[selectedDemographic]} Population %`,
          font: { size: 14 },
        },
        ticks: {
          callback: (value: number | string) => `${value}%`,
        },
      },
      y: {
        type: "linear" as const,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: "Vote Percentage",
          font: { size: 14 },
        },
        ticks: {
          callback: (value: number | string) => `${value}%`,
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 24,
          font: {
            size: 13,
            weight: 500,
          },
          boxWidth: 10,
          boxHeight: 10,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#111827",
        bodyColor: "#374151",
        borderColor: "#d1d5db",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: {
          size: 13,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          title: (context: any) => {
            const point = context[0]?.raw;
            if (point?.precinctName) {
              return point.precinctName;
            }
            return "";
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (context: any) => {
            const point = context.raw;
            // Skip tooltip for regression lines
            if (!point.precinctName) {
              return "";
            }
            return "";
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          afterBody: (context: any) => {
            const point = context[0]?.raw;
            if (point?.precinctName) {
              const datasetLabel = context[0]?.dataset?.label || "";
              const isRepublican = datasetLabel.includes("Republican");
              return [
                `${point.countyName} County`,
                "",
                `${demographicLabels[selectedDemographic]}: ${point.x.toFixed(1)}%`,
                `${isRepublican ? "Republican" : "Democratic"} Vote: ${point.y.toFixed(1)}%`,
                "",
                `Total Votes: ${point.totalVotes?.toLocaleString() ?? "N/A"}`,
                `REP: ${point.republicanVotes?.toLocaleString() ?? "N/A"} | DEM: ${point.democraticVotes?.toLocaleString() ?? "N/A"}`,
              ];
            }
            return [];
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filter: (tooltipItem: any) => {
          // Only show tooltips for scatter points, not regression lines
          return tooltipItem.raw?.precinctName !== undefined;
        },
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[650px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Gingles Precinct Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Demographic Group:
          </label>
          <select
            value={selectedDemographic}
            onChange={(e) =>
              setSelectedDemographic(e.target.value as DemographicKey)
            }
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(demographicLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-[580px]">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Scatter data={chartData as any} options={options} />
      </div>
    </div>
  );
}
