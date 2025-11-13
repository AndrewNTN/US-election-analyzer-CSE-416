import { BaseBarChart } from "./base-bar-chart";
import { formatNumber } from "@/lib/utils";
import type { ProvisionalChartResponse } from "@/lib/api/eavs-requests.ts";

export interface ProvisionalBallotsBarChartProps {
  stateName: string;
  barData: ProvisionalChartResponse;
}

const METRIC_KEYS = [
  "provReasonVoterNotOnList",
  "provReasonVoterLackedID",
  "provReasonElectionOfficialChallengedEligibility",
  "provReasonAnotherPersonChallengedEligibility",
  "provReasonVoterNotResident",
  "provReasonVoterRegistrationNotUpdated",
  "provReasonVoterDidNotSurrenderMailBallot",
  "provReasonJudgeExtendedVotingHours",
  "provReasonVoterUsedSDR",
  "provReasonOtherSum",
] as const;

export function ProvisionalBallotsBarChart({
  stateName,
  barData,
}: ProvisionalBallotsBarChartProps) {
  const { metricLabels, ...numericData } = barData;

  return (
    <BaseBarChart
      stateName={stateName}
      barData={[numericData]}
      metricKeys={METRIC_KEYS}
      metricLabels={metricLabels ?? {}}
      metricAccessor={(data, key) => data[key] ?? 0}
      yAxisLabel="Number of Ballots"
      yAxisTickFormatter={formatNumber}
    />
  );
}
