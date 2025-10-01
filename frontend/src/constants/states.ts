export interface StateDetails {
  name: string;
  politicalDominance: "republican" | "democratic";
  registrationType: "opt-in" | "opt-out";
  sameDayRegistration: boolean;
  hasDetailedVoterData: boolean;
}

export const DETAILED_STATES = {
  florida: {
    name: "florida",
    politicalDominance: "republican",
    registrationType: "opt-in",
    sameDayRegistration: false,
    hasDetailedVoterData: true,
  },
  california: {
    name: "california",
    politicalDominance: "democratic",
    registrationType: "opt-out",
    sameDayRegistration: true,
    hasDetailedVoterData: false,
  },
  colorado: {
    name: "colorado",
    politicalDominance: "democratic",
    registrationType: "opt-out",
    sameDayRegistration: false,
    hasDetailedVoterData: false,
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
