import { StateEquipmentSummaryTable } from "@/components/table/state-tables/state-equipment-summary-table.tsx";
import type { StateEquipmentSummary } from "@/components/table/state-tables/state-equipment-summary-columns.tsx";
import stateEquipmentSummaryJson from "../../../data/stateEquipmentSummary.json" with { type: "json" };

export function StateEquipmentSummaryView() {
  return (
    <div className="h-full">
      <StateEquipmentSummaryTable
        data={stateEquipmentSummaryJson as StateEquipmentSummary[]}
      />
    </div>
  );
}
