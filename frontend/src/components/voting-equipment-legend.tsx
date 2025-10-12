import { Card } from "@/components/ui/card";
import { VOTING_EQUIPMENT_COLORS } from "@/lib/choropleth";

interface VotingEquipmentLegendProps {
  data: Array<{
    eavsRegion: string;
    equipmentTypes: string[];
    primaryEquipment: string;
  }>;
}

export function VotingEquipmentLegend({ data }: VotingEquipmentLegendProps) {
  // Get unique equipment types from the data
  const equipmentCounts = data.reduce(
    (acc, item) => {
      const equipmentType =
        item.equipmentTypes.length > 1 ? "mixed" : item.primaryEquipment;
      acc[equipmentType] = (acc[equipmentType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const equipmentLabels: Record<string, string> = {
    dre_no_vvpat: "DRE without VVPAT",
    dre_with_vvpat: "DRE with VVPAT",
    ballot_marking_device: "Ballot Marking Device",
    scanner: "Scanner",
    mixed: "Mixed Equipment Types",
  };

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Voting Equipment Types</h3>
      <div className="space-y-2">
        {Object.entries(equipmentCounts).map(([type, count]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{
                backgroundColor:
                  VOTING_EQUIPMENT_COLORS[
                    type as keyof typeof VOTING_EQUIPMENT_COLORS
                  ],
              }}
            />
            <div className="flex-1">
              <div className="text-xs font-medium">{equipmentLabels[type]}</div>
              <div className="text-xs text-muted-foreground">
                {count} {count === 1 ? "region" : "regions"}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
        <p className="mb-2">
          <strong>Legend:</strong> Colors indicate the primary voting equipment
          type used in each EAVS region.
        </p>
        <p>
          Regions using multiple equipment types are shown in purple (mixed).
        </p>
      </div>
    </Card>
  );
}
