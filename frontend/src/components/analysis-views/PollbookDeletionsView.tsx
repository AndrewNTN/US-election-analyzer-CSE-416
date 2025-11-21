import { useMemo } from "react";
import { ActiveVotersTable } from "../table/state-tables/active-voters-table.tsx";
import { PollbookDeletionsBarChart } from "../chart/pollbook-deletions-bar-chart";
import pollbookDeletionsDataJson from "../../../data/pollbookDeletionsData.json" with { type: "json" };
import activeVotersDataJson from "../../../data/activeVotersData.json" with { type: "json" };
import activeVotersDataCaliforniaJson from "../../../data/activeVotersData-california.json" with { type: "json" };
import activeVotersDataFloridaJson from "../../../data/activeVotersData-florida.json" with { type: "json" };

interface PollbookDeletionsViewProps {
  normalizedStateKey: string;
  stateName: string;
}

export function PollbookDeletionsView({
  normalizedStateKey,
  stateName,
}: PollbookDeletionsViewProps) {
  const activeVotersData = useMemo(() => {
    if (normalizedStateKey === "california") {
      return activeVotersDataCaliforniaJson.map((item: any) => ({
        jurisdiction: item.eavsRegion,
        totalActive: item.activeVoters,
        totalRegistered: item.totalVoters,
        totalInactive: item.inactiveVoters,
      }));
    } else if (normalizedStateKey === "florida") {
      return activeVotersDataFloridaJson.map((item: any) => ({
        jurisdiction: item.eavsRegion,
        totalActive: item.activeVoters,
        totalRegistered: item.totalVoters,
        totalInactive: item.inactiveVoters,
      }));
    }
    return activeVotersDataJson.map((item: any) => ({
      jurisdiction: item.eavsRegion,
      totalActive: item.activeVoters,
      totalRegistered: item.totalVoters,
      totalInactive: item.inactiveVoters,
    }));
  }, [normalizedStateKey]);

  return (
    <div className="text-xs text-muted-foreground text-center">
      <ActiveVotersTable data={activeVotersData} />
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-900">
          Pollbook Deletions by Reason
        </h3>
        <PollbookDeletionsBarChart
          stateName={stateName}
          barData={pollbookDeletionsDataJson}
        />
      </div>
    </div>
  );
}
