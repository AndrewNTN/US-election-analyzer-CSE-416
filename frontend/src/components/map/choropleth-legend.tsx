import { Card } from "@/components/ui/card";
import { type ColorScale } from "@/lib/choropleth";
import {
  SPLASH_CHOROPLETH_OPTIONS,
  STATE_CHOROPLETH_OPTIONS,
  type ChoroplethOption,
} from "@/lib/choropleth";

interface ChoroplethLegendProps {
  choroplethOption: ChoroplethOption;
  colorScale: ColorScale | null;
}

export function ChoroplethLegend({
  choroplethOption,
  colorScale,
}: ChoroplethLegendProps) {
  // Don't render if choropleth is off or no scale provided
  if (choroplethOption === "off" || !colorScale) {
    return null;
  }

  // Get the appropriate title and unit
  let title = "";
  let unit = "";

  switch (choroplethOption) {
    case SPLASH_CHOROPLETH_OPTIONS.EQUIPMENT_AGE:
      title = "Voting Equipment Age";
      unit = " years";
      break;
    case STATE_CHOROPLETH_OPTIONS.PROVISIONAL_BALLOTS:
      title = "Provisional Ballots";
      unit = "%";
      break;
    case STATE_CHOROPLETH_OPTIONS.ACTIVE_VOTERS:
      title = "Active Voters";
      unit = "%";
      break;
    case STATE_CHOROPLETH_OPTIONS.POLLBOOK_DELETIONS:
      title = "Pollbook Deletions";
      unit = "%";
      break;
    case STATE_CHOROPLETH_OPTIONS.MAIL_BALLOTS_REJECTED:
      title = "Mail Ballots Rejected";
      unit = "%";
      break;
    case STATE_CHOROPLETH_OPTIONS.VOTER_REGISTRATION:
      title = "Voter Registration";
      unit = "%";
      break;
  }

  // Helper to format numbers for display
  const formatNumber = (num: number) => {
    if (num === 0) return "0";
    if (Math.abs(num) < 0.01) {
      // Avoid scientific notation, use up to 5 decimal places for precision
      return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 5,
        minimumFractionDigits: 2,
      }).format(num);
    }
    return num.toFixed(2);
  };

  // Render sequential color scale legend
  return (
    <Card className="p-3.5">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="space-y-1.5">
        {colorScale.colors.map((color, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded border border-gray-300 flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <div className="text-sm">
              {idx === 0 ? (
                <span>
                  ≤ {formatNumber(colorScale.breaks[idx])}
                  {unit}
                </span>
              ) : idx === colorScale.colors.length - 1 ? (
                <span>
                  &gt; {formatNumber(colorScale.breaks[idx - 1])}
                  {unit}
                </span>
              ) : (
                <span>
                  {formatNumber(colorScale.breaks[idx - 1])} -{" "}
                  {formatNumber(colorScale.breaks[idx])}
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
