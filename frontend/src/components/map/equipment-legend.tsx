import { VOTING_EQUIPMENT_COLORS } from "@/lib/choropleth";

interface EquipmentLegendProps {
  equipmentLabels?: Record<string, string>;
}

const defaultLabels: Record<string, string> = {
  dre_no_vvpat: "DRE (No VVPAT)",
  dre_with_vvpat: "DRE (With VVPAT)",
  ballot_marking_device: "Ballot Marking Device",
  scanner: "Scanner",
};

export function EquipmentLegend({ equipmentLabels }: EquipmentLegendProps) {
  const labels = equipmentLabels || defaultLabels;

  const legendItems = [
    {
      key: "dre_no_vvpat" as const,
      color: VOTING_EQUIPMENT_COLORS.dre_no_vvpat,
    },
    {
      key: "dre_with_vvpat" as const,
      color: VOTING_EQUIPMENT_COLORS.dre_with_vvpat,
    },
    {
      key: "ballot_marking_device" as const,
      color: VOTING_EQUIPMENT_COLORS.ballot_marking_device,
    },
    { key: "scanner" as const, color: VOTING_EQUIPMENT_COLORS.scanner },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200">
      <h4 className="text-xs font-semibold text-gray-700 mb-2 tracking-wide">
        Voting Equipment Type
      </h4>
      <div className="space-y-1.5">
        {legendItems.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm border border-gray-300 flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600">
              {labels[item.key] || item.key}
            </span>
          </div>
        ))}
        {/* Mixed indicator with stripes preview */}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-200 mt-1">
          <div
            className="w-4 h-4 rounded-sm border border-gray-300 flex-shrink-0 overflow-hidden"
            style={{
              background: `repeating-linear-gradient(
                45deg,
                ${VOTING_EQUIPMENT_COLORS.scanner},
                ${VOTING_EQUIPMENT_COLORS.scanner} 2px,
                ${VOTING_EQUIPMENT_COLORS.ballot_marking_device} 2px,
                ${VOTING_EQUIPMENT_COLORS.ballot_marking_device} 4px
              )`,
            }}
          />
          <span className="text-xs text-gray-600">Mixed (striped)</span>
        </div>
      </div>
    </div>
  );
}
