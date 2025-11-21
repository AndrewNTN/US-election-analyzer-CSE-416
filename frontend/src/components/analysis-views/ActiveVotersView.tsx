import { useMemo } from "react";
import { ActiveVotersTable } from "../table/state-tables/active-voters-table.tsx";
import activeVotersDataJson from "../../../data/activeVotersData.json" with { type: "json" };
import activeVotersDataCaliforniaJson from "../../../data/activeVotersData-california.json" with { type: "json" };
import activeVotersDataFloridaJson from "../../../data/activeVotersData-florida.json" with { type: "json" };
import { ActiveVotersBarChart } from "../chart/active-voters-bar-chart";

interface ActiveVotersViewProps {
  normalizedStateKey: string;
  stateName: string;
}

export function ActiveVotersView({
  normalizedStateKey,
  stateName,
}: ActiveVotersViewProps) {
  const activeVotersData = useMemo(() => {
    if (normalizedStateKey === "california") {
      return activeVotersDataCaliforniaJson;
    } else if (normalizedStateKey === "florida") {
      return activeVotersDataFloridaJson;
    }
    return activeVotersDataJson;
  }, [normalizedStateKey]);

  return (
    <div className="text-xs text-muted-foreground text-center">
      <ActiveVotersTable data={activeVotersData} />
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-900">
          Active Voters Status
        </h3>
        <ActiveVotersBarChart
          stateName={stateName}
          barData={activeVotersData}
        />
      </div>
    </div>
  );
}
