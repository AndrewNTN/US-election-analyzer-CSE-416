import { Card } from "@/components/ui/card";
import {
  equipmentAgeScale,
  provisionalBallotsScale,
  activeVotersScale,
  pollbookDeletionsScale,
  mailBallotsRejectedScale,
  voterRegistrationScale,
  type ColorScale,
} from "@/lib/choropleth";
import {
  SPLASH_CHOROPLETH_OPTIONS,
  STATE_CHOROPLETH_OPTIONS,
  type ChoroplethOption,
} from "@/lib/choropleth";

interface ChoroplethLegendProps {
  choroplethOption: ChoroplethOption;
}

export function ChoroplethLegend({ choroplethOption }: ChoroplethLegendProps) {
  // Don't render if choropleth is off
  if (choroplethOption === "off") {
    return null;
  }

  // Get the appropriate color scale and labels for sequential legends
  let scale: ColorScale | null = null;
  let title = "";
  let unit = "";

  switch (choroplethOption) {
    case SPLASH_CHOROPLETH_OPTIONS.EQUIPMENT_AGE:
      scale = equipmentAgeScale;
      title = "Voting Equipment Age";
      unit = " years";
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
    <Card className="p-3.5">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="space-y-1.5">
        {scale.colors.map((color, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded border border-gray-300 flex-shrink-0"
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
