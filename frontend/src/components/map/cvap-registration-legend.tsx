import { Card } from "@/components/ui/card";
import type { ActiveVotersData } from "@/components/table/state-tables/active-voters-columns";

interface CvapRegistrationLegendProps {
  data: ActiveVotersData[];
}

export function CvapRegistrationLegend({ data }: CvapRegistrationLegendProps) {
  const regionsWithRate = data.filter(
    (region) => typeof region.registrationRate === "number",
  );

  if (regionsWithRate.length === 0) {
    return null;
  }

  const rates = regionsWithRate.map((region) => region.registrationRate ?? 0);
  const total = rates.reduce((sum, rate) => sum + rate, 0);
  const averageRate = total / rates.length;

  const formatRate = (rate: number | undefined) =>
    rate === undefined ? "N/A" : `${rate.toFixed(1)}%`;

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">CVAP Registration</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            Average Rate:{" "}
            <span className="font-medium">{formatRate(averageRate)}</span>
          </span>
        </div>
      </div>
    </Card>
  );
}
