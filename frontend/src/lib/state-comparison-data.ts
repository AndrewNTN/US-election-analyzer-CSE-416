import stateComparisonDataJson from "../../data/stateComparison.json" with { type: "json" };
import type { StateComparisonRow } from "@/components/table/state-comparison-columns.tsx";

// Transform state comparison data into table rows
const stateComparisonRaw = stateComparisonDataJson as {
  republicanState: Record<string, string | number>;
  democraticState: Record<string, string | number>;
};

export const stateComparisonData: StateComparisonRow[] = [
  {
    metric: "Felony Voting Rights",
    republicanValue: stateComparisonRaw.republicanState.felonyVotingRights,
    democraticValue: stateComparisonRaw.democraticState.felonyVotingRights,
  },
  {
    metric: "Mail Ballot Percentage",
    republicanValue: `${stateComparisonRaw.republicanState.mailBallotPercentage}%`,
    democraticValue: `${stateComparisonRaw.democraticState.mailBallotPercentage}%`,
  },
  {
    metric: "Drop Box Ballot Percentage",
    republicanValue: `${stateComparisonRaw.republicanState.dropBoxBallotPercentage}%`,
    democraticValue: `${stateComparisonRaw.democraticState.dropBoxBallotPercentage}%`,
  },
  {
    metric: "Turnout",
    republicanValue: `${stateComparisonRaw.republicanState.turnout}%`,
    democraticValue: `${stateComparisonRaw.democraticState.turnout}%`,
  },
  {
    metric: "Registered Voters",
    republicanValue: (
      stateComparisonRaw.republicanState.registeredVoters as number
    ).toLocaleString(),
    democraticValue: (
      stateComparisonRaw.democraticState.registeredVoters as number
    ).toLocaleString(),
  },
  {
    metric: "Total Votes Cast",
    republicanValue: (
      stateComparisonRaw.republicanState.totalVotes as number
    ).toLocaleString(),
    democraticValue: (
      stateComparisonRaw.democraticState.totalVotes as number
    ).toLocaleString(),
  },
  {
    metric: "Early Voting Percentage",
    republicanValue: `${stateComparisonRaw.republicanState.earlyVotingPercentage}%`,
    democraticValue: `${stateComparisonRaw.democraticState.earlyVotingPercentage}%`,
  },
  {
    metric: "Same-Day Registration",
    republicanValue: stateComparisonRaw.republicanState.sameDayRegistration,
    democraticValue: stateComparisonRaw.democraticState.sameDayRegistration,
  },
  {
    metric: "Voter ID Required",
    republicanValue: stateComparisonRaw.republicanState.voterIdRequired,
    democraticValue: stateComparisonRaw.democraticState.voterIdRequired,
  },
  {
    metric: "Polls Open Time",
    republicanValue: stateComparisonRaw.republicanState.pollsOpenTime,
    democraticValue: stateComparisonRaw.democraticState.pollsOpenTime,
  },
  {
    metric: "Polls Close Time",
    republicanValue: stateComparisonRaw.republicanState.pollsCloseTime,
    democraticValue: stateComparisonRaw.democraticState.pollsCloseTime,
  },
  {
    metric: "Absentee Ballot Deadline",
    republicanValue: stateComparisonRaw.republicanState.absenteeBallotDeadline,
    democraticValue: stateComparisonRaw.democraticState.absenteeBallotDeadline,
  },
  {
    metric: "Provisional Ballots Cast",
    republicanValue: (
      stateComparisonRaw.republicanState.provisionalBallotsCast as number
    ).toLocaleString(),
    democraticValue: (
      stateComparisonRaw.democraticState.provisionalBallotsCast as number
    ).toLocaleString(),
  },
  {
    metric: "Rejected Ballots",
    republicanValue: (
      stateComparisonRaw.republicanState.rejectedBallots as number
    ).toLocaleString(),
    democraticValue: (
      stateComparisonRaw.democraticState.rejectedBallots as number
    ).toLocaleString(),
  },
  {
    metric: "Average Wait Time (minutes)",
    republicanValue: stateComparisonRaw.republicanState.averageWaitTime,
    democraticValue: stateComparisonRaw.democraticState.averageWaitTime,
  },
];

export const republicanStateName = stateComparisonRaw.republicanState
  .state as string;
export const democraticStateName = stateComparisonRaw.democraticState
  .state as string;
