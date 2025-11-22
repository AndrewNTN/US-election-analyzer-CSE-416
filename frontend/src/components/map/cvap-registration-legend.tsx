import { Card } from "@/components/ui/card";
import { useCvapRegistrationRateQuery } from "@/lib/api/use-queries";

interface CvapRegistrationLegendProps {
  fipsPrefix: string | null | undefined;
}

export function CvapRegistrationLegend({
  fipsPrefix,
}: CvapRegistrationLegendProps) {
  const { data: cvapData, isLoading } =
    useCvapRegistrationRateQuery(fipsPrefix);

  if (isLoading || !cvapData) {
    return null;
  }

  const formatRate = (rate: number | undefined) =>
    rate === undefined ? "N/A" : `${rate.toFixed(1)}%`;

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">CVAP Registration</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span>
            {cvapData.label}:{" "}
            <span className="font-medium">
              {formatRate(cvapData.registrationRate)}
            </span>
          </span>
        </div>
      </div>
    </Card>
  );
}
