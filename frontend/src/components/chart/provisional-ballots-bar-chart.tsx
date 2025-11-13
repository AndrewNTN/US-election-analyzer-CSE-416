import { BaseBarChart } from "./base-bar-chart";
import { formatNumber } from "@/lib/utils";
import type { ProvisionalChartResponse } from "@/lib/api/eavs-requests.ts";

export interface ProvisionalBallotsBarChartProps {
  stateName: string;
  barData: ProvisionalChartResponse;
}

const METRICS = [
  { key: "provReasonVoterNotOnList", label: "E2a – Not on List" },
  { key: "provReasonVoterLackedID", label: "E2b – Lacked ID" },
  {
    key: "provReasonElectionOfficialChallengedEligibility",
    label: "E2c – Official Challenged Eligibility",
  },
  {
    key: "provReasonAnotherPersonChallengedEligibility",
    label: "E2d – Person Challenged Eligibility",
  },
  { key: "provReasonVoterNotResident", label: "E2e – Not Resident" },
  {
    key: "provReasonVoterRegistrationNotUpdated",
    label: "E2f – Registration Not Updated",
  },
  {
    key: "provReasonVoterDidNotSurrenderMailBallot",
    label: "E2g – Did Not Surrender Mail Ballot",
  },
  {
    key: "provReasonJudgeExtendedVotingHours",
    label: "E2h – Judge Extended Hours",
  },
  { key: "provReasonVoterUsedSDR", label: "E2i – Used SDR" },
  { key: "provReasonOtherSum", label: "Other" },
] as const;

export function ProvisionalBallotsBarChart({
  stateName,
  barData,
}: ProvisionalBallotsBarChartProps) {
  return (
    <BaseBarChart
      stateName={stateName}
      barData={[barData]}
      metricKeys={METRICS.map((m) => m.key)}
      metricLabels={
        Object.fromEntries(METRICS.map((m) => [m.key, m.label])) as Record<
          (typeof METRICS)[number]["key"],
          string
        >
      }
      metricAccessor={(data, key) =>
        data[key as keyof ProvisionalChartResponse] ?? 0
      }
      yAxisLabel="Number of Ballots"
      yAxisTickFormatter={formatNumber}
    />
  );
}
