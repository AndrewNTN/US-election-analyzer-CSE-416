import { Card } from "@/components/ui/card";
import {
  VOTING_EQUIPMENT_COLORS,
  defaultDensityScale,
  republicanScale,
  democraticScale,
  equipmentAgeScale,
  provisionalBallotsScale,
  activeVotersScale,
  pollbookDeletionsScale,
  mailBallotsRejectedScale,
  voterRegistrationScale,
  type ColorScale,
} from "@/lib/colors";
import {
  SPLASH_CHOROPLETH_OPTIONS,
  STATE_CHOROPLETH_OPTIONS,
  type ChoroplethOption,
} from "@/constants/choropleth";

interface ChoroplethLegendProps {
  choroplethOption: ChoroplethOption;
  votingEquipmentData?: Array<{
    eavsRegion: string;
    equipmentTypes: string[];
    primaryEquipment: string;
  }>;
}

export function ChoroplethLegend({
  choroplethOption,
  votingEquipmentData,
}: ChoroplethLegendProps) {
  // Don't render if choropleth is off
  if (choroplethOption === "off") {
    return null;
  }

  // Voting Equipment Type Legend (categorical)
  if (choroplethOption === STATE_CHOROPLETH_OPTIONS.VOTING_EQUIPMENT_TYPE) {
    if (!votingEquipmentData || votingEquipmentData.length === 0) {
      return null;
    }

    const equipmentCounts = votingEquipmentData.reduce(
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
                <div className="text-sm font-medium">
                  {equipmentLabels[type]}
                </div>
                <div className="text-xs text-muted-foreground">
                  {count} {count === 1 ? "region" : "regions"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Political Legend (diverging - red vs blue)
  if (choroplethOption === SPLASH_CHOROPLETH_OPTIONS.POLITICAL) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Political Leaning</h3>
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium mb-2 text-red-700">
              Republican
            </div>
            <div className="flex items-center gap-1">
              {republicanScale.colors
                .slice(5)
                .reverse()
                .map((color, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-6 border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={`${republicanScale.breaks.slice(5).reverse()[idx]}%+`}
                  />
                ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Strong</span>
              <span>Light</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium mb-2 text-blue-700">
              Democratic
            </div>
            <div className="flex items-center gap-1">
              {democraticScale.colors
                .slice(5)
                .reverse()
                .map((color, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-6 border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={`${democraticScale.breaks.slice(5).reverse()[idx]}%+`}
                  />
                ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Strong</span>
              <span>Light</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Get the appropriate color scale and labels for sequential legends
  let scale: ColorScale | null = null;
  let title = "";
  let unit = "";

  switch (choroplethOption) {
    case SPLASH_CHOROPLETH_OPTIONS.DENSITY:
      scale = defaultDensityScale;
      title = "Population Density";
      unit = "per sq mi";
      break;
    case SPLASH_CHOROPLETH_OPTIONS.EQUIPMENT_AGE:
      scale = equipmentAgeScale;
      title = "Voting Equipment Age";
      unit = "years";
      break;
    case STATE_CHOROPLETH_OPTIONS.PROVISIONAL_BALLOTS:
      scale = provisionalBallotsScale;
      title = "Provisional Ballots";
      unit = "%";
      break;
    case STATE_CHOROPLETH_OPTIONS.ACTIVE_VOTERS:
      scale = activeVotersScale;
      title = "Active Voters";
      unit = "%";
      break;
    case STATE_CHOROPLETH_OPTIONS.POLLBOOK_DELETIONS:
      scale = pollbookDeletionsScale;
      title = "Pollbook Deletions";
      unit = "%";
      break;
    case STATE_CHOROPLETH_OPTIONS.MAIL_BALLOTS_REJECTED:
      scale = mailBallotsRejectedScale;
      title = "Mail Ballots Rejected";
      unit = "%";
      break;
    case STATE_CHOROPLETH_OPTIONS.VOTER_REGISTRATION:
      scale = voterRegistrationScale;
      title = "Voter Registration";
      unit = "%";
      break;
  }

  if (!scale) {
    return null;
  }

  // Render sequential color scale legend
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="space-y-2">
        {scale.colors.map((color, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <div className="text-sm">
              {idx === 0 ? (
                <span>
                  ≤ {scale.breaks[idx]}
                  {unit}
                </span>
              ) : idx === scale.colors.length - 1 ? (
                <span>
                  &gt; {scale.breaks[idx - 1]}
                  {unit}
                </span>
              ) : (
                <span>
                  {scale.breaks[idx - 1]} - {scale.breaks[idx]}
                  {unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
