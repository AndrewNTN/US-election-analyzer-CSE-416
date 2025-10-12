import stateComparisonDataJson from "../../data/stateComparison.json" with { type: "json" };
import type { StateComparisonRow } from "@/components/table/state-comparison-columns.tsx";

// Transform state comparison data into table rows
const stateComparisonRaw = stateComparisonDataJson as {
  republicanState: {
    state: string;
    felonyVotingRights: string;
    mailBallots: number;
    mailBallotsPercentage: number;
    dropBoxBallots: number;
    dropBoxBallotsPercentage: number;
    totalVotesCast: number;
    turnoutPercentage: number;
    registeredVoters: number;
    voterRegistrationRate: number;
  };
  democraticState: {
    state: string;
    felonyVotingRights: string;
    mailBallots: number;
    mailBallotsPercentage: number;
    dropBoxBallots: number;
    dropBoxBallotsPercentage: number;
    totalVotesCast: number;
    turnoutPercentage: number;
    registeredVoters: number;
    voterRegistrationRate: number;
  };
};

export const stateComparisonData: StateComparisonRow[] = [
  {
    metric: "Felony Voting Rights",
    republicanValue: stateComparisonRaw.republicanState.felonyVotingRights,
    democraticValue: stateComparisonRaw.democraticState.felonyVotingRights,
  },
  {
    metric: "Mail Ballots",
    republicanValue: `${stateComparisonRaw.republicanState.mailBallots.toLocaleString()} (${stateComparisonRaw.republicanState.mailBallotsPercentage}%)`,
    democraticValue: `${stateComparisonRaw.democraticState.mailBallots.toLocaleString()} (${stateComparisonRaw.democraticState.mailBallotsPercentage}%)`,
  },
  {
    metric: "Drop Box Ballots",
    republicanValue: `${stateComparisonRaw.republicanState.dropBoxBallots.toLocaleString()} (${stateComparisonRaw.republicanState.dropBoxBallotsPercentage}%)`,
    democraticValue: `${stateComparisonRaw.democraticState.dropBoxBallots.toLocaleString()} (${stateComparisonRaw.democraticState.dropBoxBallotsPercentage}%)`,
  },
  {
    metric: "Turnout",
    republicanValue: `${stateComparisonRaw.republicanState.totalVotesCast.toLocaleString()} (${stateComparisonRaw.republicanState.turnoutPercentage}%)`,
    democraticValue: `${stateComparisonRaw.democraticState.totalVotesCast.toLocaleString()} (${stateComparisonRaw.democraticState.turnoutPercentage}%)`,
  },
  {
    metric: "Voter Registration",
    republicanValue: `${stateComparisonRaw.republicanState.registeredVoters.toLocaleString()} (${stateComparisonRaw.republicanState.voterRegistrationRate}%)`,
    democraticValue: `${stateComparisonRaw.democraticState.registeredVoters.toLocaleString()} (${stateComparisonRaw.democraticState.voterRegistrationRate}%)`,
  },
];

export const republicanStateName = stateComparisonRaw.republicanState.state;
export const democraticStateName = stateComparisonRaw.democraticState.state;
