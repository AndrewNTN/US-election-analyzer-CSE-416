import EquipmentQualityPDF from "../chart/ei-equipment-graph";

interface EIEquipmentViewProps {
  stateFipsPrefix: string | undefined;
}

import { useEIEquipmentDataQuery } from "@/lib/api/use-ei-queries";
import { useMemo } from "react";

const DEMOGRAPHIC_GROUPS: ("white" | "black" | "hispanic" | "asian")[] = [
  "white",
  "black",
  "hispanic",
  "asian",
];

export function EIEquipmentView({ stateFipsPrefix }: EIEquipmentViewProps) {
  const { data, isLoading, isError } = useEIEquipmentDataQuery(stateFipsPrefix);

  const chartData = useMemo(() => {
    if (!data || !data.demographics) return [];

    // Get x-values from first group/candidate
    const firstGroupKey = Object.keys(data.demographics)[0];
    if (!firstGroupKey) return [];
    const firstGroup = data.demographics[firstGroupKey];
    const firstPoints = firstGroup["HighQuality"] || [];

    return firstPoints.map((p, i) => {
      const row: Record<string, number> = { q: p.x };
      Object.entries(data.demographics).forEach(([group, candidates]) => {
        const key = group.toLowerCase();
        const candidateData = candidates["HighQuality"];
        if (candidateData && candidateData[i]) {
          row[key] = candidateData[i].y;
        }
      });
      return row as { q: number } & Partial<Record<string, number>>;
    });
  }, [data]);

  if (!stateFipsPrefix) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="text-gray-500">No state selected</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="text-gray-500">Loading analysis data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="text-red-500">Error loading analysis data</div>
      </div>
    );
  }

  return (
    <div className="h-[650px]">
      <h3 className="text-lg font-semibold mb-2">
        Equipment Quality by Demographics
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Posterior density distribution of equipment quality scores across
        demographic groups. Higher peaks indicate more probable quality levels.
      </p>
      <EquipmentQualityPDF data={chartData} groups={DEMOGRAPHIC_GROUPS} />
    </div>
  );
}
