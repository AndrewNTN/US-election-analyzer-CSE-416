import optInOptOutDataJson from "../../data/optInVsOptOutComparison.json" with { type: "json" };
import type { OptInOptOutRow } from "@/components/table/opt-in-opt-out-columns.tsx";

interface StateData {
  state: string;
  registeredVoters: number;
  registrationRate: number;
  turnoutRate: number;
  turnoutVotes: number;
}

// Transform opt-in vs opt-out data into table rows
const optInOptOutRaw = optInOptOutDataJson as {
  optInState: StateData;
  optOutWithSameDay: StateData;
  optOutWithoutSameDay: StateData;
};

export const optInOptOutData: OptInOptOutRow[] = [
  {
    metric: "Voter Registration (Count)",
    optInValue: optInOptOutRaw.optInState.registeredVoters.toLocaleString(),
    optOutWithSameDayValue:
      optInOptOutRaw.optOutWithSameDay.registeredVoters.toLocaleString(),
    optOutWithoutSameDayValue:
      optInOptOutRaw.optOutWithoutSameDay.registeredVoters.toLocaleString(),
  },
  {
    metric: "Voter Registration (%)",
    optInValue: `${optInOptOutRaw.optInState.registrationRate}%`,
    optOutWithSameDayValue: `${optInOptOutRaw.optOutWithSameDay.registrationRate}%`,
    optOutWithoutSameDayValue: `${optInOptOutRaw.optOutWithoutSameDay.registrationRate}%`,
  },
  {
    metric: "Turnout (Votes)",
    optInValue: optInOptOutRaw.optInState.turnoutVotes.toLocaleString(),
    optOutWithSameDayValue:
      optInOptOutRaw.optOutWithSameDay.turnoutVotes.toLocaleString(),
    optOutWithoutSameDayValue:
      optInOptOutRaw.optOutWithoutSameDay.turnoutVotes.toLocaleString(),
  },
  {
    metric: "Turnout (%)",
    optInValue: `${optInOptOutRaw.optInState.turnoutRate}%`,
    optOutWithSameDayValue: `${optInOptOutRaw.optOutWithSameDay.turnoutRate}%`,
    optOutWithoutSameDayValue: `${optInOptOutRaw.optOutWithoutSameDay.turnoutRate}%`,
  },
];
export const optInStateName = optInOptOutRaw.optInState.state as string;
export const optOutWithSameDayStateName = optInOptOutRaw.optOutWithSameDay
  .state as string;
export const optOutWithoutSameDayStateName = optInOptOutRaw.optOutWithoutSameDay
  .state as string;
