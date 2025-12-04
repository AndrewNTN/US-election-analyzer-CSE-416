import { BaseBarChart } from "./base-bar-chart";
import { formatNumber } from "@/lib/utils";
import type { ProvisionalChartResponse } from "@/lib/api/voting-requests";

export interface ProvisionalBallotsBarChartProps {
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
  barData,
}: ProvisionalBallotsBarChartProps) {
  const { metricLabels, ...numericData } = barData;

  return (
    <BaseBarChart
      barData={[numericData]}
      metricKeys={METRIC_KEYS}
      metricLabels={metricLabels ?? {}}
      metricAccessor={(data, key) => data[key] ?? 0}
      yAxisLabel="Number of Ballots"
      yAxisTickFormatter={formatNumber}
    />
  );
}
