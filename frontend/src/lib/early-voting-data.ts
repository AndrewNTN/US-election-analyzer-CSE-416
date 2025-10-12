import earlyVotingDataJson from "../../data/earlyVotingComparison.json" with { type: "json" };
import type { EarlyVotingRow } from "@/components/table/early-voting-columns.tsx";

// Transform early voting data into table rows
const earlyVotingRaw = earlyVotingDataJson as {
  republicanState: {
    state: string;
    politicalDominance: string;
    totalVotesCast: number;
    earlyVotingCategories: {
      inPersonEarlyVoting: { votes: number; percentage: number };
      mailInAbsenteeVoting: { votes: number; percentage: number };
      dropBoxVoting: { votes: number; percentage: number };
      totalEarlyVoting: { votes: number; percentage: number };
    };
    electionDayVoting: { votes: number; percentage: number };
  };
  democraticState: {
    state: string;
    politicalDominance: string;
    totalVotesCast: number;
    earlyVotingCategories: {
      inPersonEarlyVoting: { votes: number; percentage: number };
      mailInAbsenteeVoting: { votes: number; percentage: number };
      dropBoxVoting: { votes: number; percentage: number };
      totalEarlyVoting: { votes: number; percentage: number };
    };
    electionDayVoting: { votes: number; percentage: number };
  };
};

export const earlyVotingData: EarlyVotingRow[] = [
  {
    metric: "Total Votes Cast",
    republicanValue:
      earlyVotingRaw.republicanState.totalVotesCast.toLocaleString(),
    democraticValue:
      earlyVotingRaw.democraticState.totalVotesCast.toLocaleString(),
  },
  {
    metric: "In-Person Early Voting (Votes)",
    republicanValue:
      earlyVotingRaw.republicanState.earlyVotingCategories.inPersonEarlyVoting.votes.toLocaleString(),
    democraticValue:
      earlyVotingRaw.democraticState.earlyVotingCategories.inPersonEarlyVoting.votes.toLocaleString(),
  },
  {
    metric: "In-Person Early Voting (%)",
    republicanValue: `${earlyVotingRaw.republicanState.earlyVotingCategories.inPersonEarlyVoting.percentage}%`,
    democraticValue: `${earlyVotingRaw.democraticState.earlyVotingCategories.inPersonEarlyVoting.percentage}%`,
  },
  {
    metric: "Total Early Voting (Votes)",
    republicanValue:
      earlyVotingRaw.republicanState.earlyVotingCategories.totalEarlyVoting.votes.toLocaleString(),
    democraticValue:
      earlyVotingRaw.democraticState.earlyVotingCategories.totalEarlyVoting.votes.toLocaleString(),
  },
  {
    metric: "Total Early Voting (%)",
    republicanValue: `${earlyVotingRaw.republicanState.earlyVotingCategories.totalEarlyVoting.percentage}%`,
    democraticValue: `${earlyVotingRaw.democraticState.earlyVotingCategories.totalEarlyVoting.percentage}%`,
  },
];

export const earlyVotingRepublicanStateName =
  earlyVotingRaw.republicanState.state;
export const earlyVotingDemocraticStateName =
  earlyVotingRaw.democraticState.state;
