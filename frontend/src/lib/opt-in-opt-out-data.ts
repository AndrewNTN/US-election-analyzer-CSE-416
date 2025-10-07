import optInOptOutDataJson from "../../data/optInVsOptOutComparison.json" with { type: "json" };
import type { OptInOptOutRow } from "@/components/table/opt-in-opt-out-columns.tsx";

// Transform opt-in vs opt-out data into table rows
const optInOptOutRaw = optInOptOutDataJson as {
  optInState: Record<string, string | number>;
  optOutWithSameDay: Record<string, string | number>;
  optOutWithoutSameDay: Record<string, string | number>;
};

export const optInOptOutData: OptInOptOutRow[] = [
  {
    metric: "State",
    optInValue: optInOptOutRaw.optInState.state,
    optOutWithSameDayValue: optInOptOutRaw.optOutWithSameDay.state,
    optOutWithoutSameDayValue: optInOptOutRaw.optOutWithoutSameDay.state,
  },
  {
    metric: "Registration Type",
    optInValue: optInOptOutRaw.optInState.registrationType,
    optOutWithSameDayValue: optInOptOutRaw.optOutWithSameDay.registrationType,
    optOutWithoutSameDayValue:
      optInOptOutRaw.optOutWithoutSameDay.registrationType,
  },
  {
    metric: "Same-Day Registration",
    optInValue: optInOptOutRaw.optInState.sameDayRegistration,
    optOutWithSameDayValue:
      optInOptOutRaw.optOutWithSameDay.sameDayRegistration,
    optOutWithoutSameDayValue:
      optInOptOutRaw.optOutWithoutSameDay.sameDayRegistration,
  },
  {
    metric: "Eligible Voters",
    optInValue: (
      optInOptOutRaw.optInState.eligibleVoters as number
    ).toLocaleString(),
    optOutWithSameDayValue: (
      optInOptOutRaw.optOutWithSameDay.eligibleVoters as number
    ).toLocaleString(),
    optOutWithoutSameDayValue: (
      optInOptOutRaw.optOutWithoutSameDay.eligibleVoters as number
    ).toLocaleString(),
  },
  {
    metric: "Registered Voters",
    optInValue: (
      optInOptOutRaw.optInState.registeredVoters as number
    ).toLocaleString(),
    optOutWithSameDayValue: (
      optInOptOutRaw.optOutWithSameDay.registeredVoters as number
    ).toLocaleString(),
    optOutWithoutSameDayValue: (
      optInOptOutRaw.optOutWithoutSameDay.registeredVoters as number
    ).toLocaleString(),
  },
  {
    metric: "Registration Rate",
    optInValue: `${optInOptOutRaw.optInState.registrationRate}%`,
    optOutWithSameDayValue: `${optInOptOutRaw.optOutWithSameDay.registrationRate}%`,
    optOutWithoutSameDayValue: `${optInOptOutRaw.optOutWithoutSameDay.registrationRate}%`,
  },
  {
    metric: "Total Votes Cast",
    optInValue: (
      optInOptOutRaw.optInState.totalVotesCast as number
    ).toLocaleString(),
    optOutWithSameDayValue: (
      optInOptOutRaw.optOutWithSameDay.totalVotesCast as number
    ).toLocaleString(),
    optOutWithoutSameDayValue: (
      optInOptOutRaw.optOutWithoutSameDay.totalVotesCast as number
    ).toLocaleString(),
  },
  {
    metric: "Turnout Rate (of Registered)",
    optInValue: `${optInOptOutRaw.optInState.turnoutRate}%`,
    optOutWithSameDayValue: `${optInOptOutRaw.optOutWithSameDay.turnoutRate}%`,
    optOutWithoutSameDayValue: `${optInOptOutRaw.optOutWithoutSameDay.turnoutRate}%`,
  },
  {
    metric: "Turnout Rate (of Eligible)",
    optInValue: `${optInOptOutRaw.optInState.turnoutOfEligible}%`,
    optOutWithSameDayValue: `${optInOptOutRaw.optOutWithSameDay.turnoutOfEligible}%`,
    optOutWithoutSameDayValue: `${optInOptOutRaw.optOutWithoutSameDay.turnoutOfEligible}%`,
  },
];

export const optInStateName = optInOptOutRaw.optInState.state as string;
export const optOutWithSameDayStateName = optInOptOutRaw.optOutWithSameDay
  .state as string;
export const optOutWithoutSameDayStateName = optInOptOutRaw.optOutWithoutSameDay
  .state as string;
