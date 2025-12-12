import { StateEquipmentSummaryTable } from "@/components/table/state-tables/state-equipment-summary-table.tsx";
import { useStateEquipmentSummaryQuery } from "@/lib/api/use-queries";

export function StateEquipmentSummaryView() {
  // Default to Florida (FIPS 12) for state equipment summary
  const stateFips = "12";

  const { data: stateEquipmentData, isLoading } =
    useStateEquipmentSummaryQuery(stateFips);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading state equipment data...</p>
      </div>
    );
  }

  if (!stateEquipmentData || stateEquipmentData.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          No equipment data available for this state
        </p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <StateEquipmentSummaryTable data={stateEquipmentData.data} />
    </div>
  );
}
