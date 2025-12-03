import { BaseBarChart } from "./base-bar-chart";
import { formatNumber } from "@/lib/utils";
import type { MailBallotsRejectedChartResponse } from "@/lib/api/voting-requests";

export interface MailBallotsRejectedBarChartProps {
  stateName: string;
  barData: MailBallotsRejectedChartResponse;
  metricLabels: Record<string, string>;
}

const METRIC_KEYS = [
  "late",
  "missingVoterSignature",
  "missingWitnessSignature",
  "nonMatchingVoterSignature",
  "unofficialEnvelope",
  "ballotMissingFromEnvelope",
  "noSecrecyEnvelope",
  "multipleBallotsInOneEnvelope",
  "envelopeNotSealed",
  "noPostmark",
  "noResidentAddressOnEnvelope",
  "voterDeceased",
  "voterAlreadyVoted",
  "missingDocumentation",
  "voterNotEligible",
  "noBallotApplication",
] as const;

export function MailBallotsRejectedBarChart({
  stateName,
  barData,
  metricLabels,
}: MailBallotsRejectedBarChartProps) {
  const transformedData = [barData];

  return (
    <BaseBarChart
      stateName={stateName}
      barData={transformedData}
      metricKeys={METRIC_KEYS}
      metricLabels={metricLabels}
      metricAccessor={(data, key) => data[key]}
      margin={{ top: 0, right: 16, left: 35, bottom: 50 }}
      yAxisLabel="Number of Rejected Ballots"
      yAxisTickFormatter={formatNumber}
      xAxisAngle={-28}
    />
  );
}
