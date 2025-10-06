export interface StateDetails {
  name: string;
  politicalDominance: "republican" | "democratic";
  registrationType: "opt-in" | "opt-out";
  sameDayRegistration: boolean;
  hasDetailedVoterData: boolean;
  hasDropBoxVoting: boolean;
}

export const DETAILED_STATES = {
  florida: {
    name: "florida",
    politicalDominance: "republican",
    registrationType: "opt-in",
    sameDayRegistration: false,
    hasDetailedVoterData: true,
    hasDropBoxVoting: true,
  },
  california: {
    name: "california",
    politicalDominance: "democratic",
    registrationType: "opt-out",
    sameDayRegistration: true,
    hasDetailedVoterData: false,
    hasDropBoxVoting: true,
  },
  colorado: {
    name: "colorado",
    politicalDominance: "democratic",
    registrationType: "opt-out",
    sameDayRegistration: false,
    hasDetailedVoterData: false,
    hasDropBoxVoting: false,
  },
} as const satisfies Record<string, StateDetails>;

export type DetailedStateName = keyof typeof DETAILED_STATES;

export function getStateDetails(stateName: string): StateDetails | undefined {
  return DETAILED_STATES[stateName as DetailedStateName];
}

export function hasDetailedVoterData(stateName: string): boolean {
  const state = getStateDetails(stateName);
  return state?.hasDetailedVoterData ?? false;
}

export function hasDropBoxVoting(stateName: string): boolean {
  const state = getStateDetails(stateName);
  return state?.hasDropBoxVoting ?? false;
}
