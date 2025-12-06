export interface StateDetails {
  name: string;
  fips: string;
  politicalDominance: "republican" | "democratic";
  registrationType: "opt-in" | "opt-out";
  sameDayRegistration: boolean;
  hasDetailedVoterData: boolean;
  hasDropBoxVoting: boolean;
  politicalPartyState: boolean;
  hasGinglesChart: boolean;
}

export const DETAILED_STATES = {
  florida: {
    name: "florida",
    fips: "12",
    politicalDominance: "republican",
    registrationType: "opt-in",
    sameDayRegistration: false,
    hasDetailedVoterData: true,
    hasDropBoxVoting: true,
    politicalPartyState: true,
    hasGinglesChart: true,
  },
  california: {
    name: "california",
    fips: "06",
    politicalDominance: "democratic",
    registrationType: "opt-out",
    sameDayRegistration: true,
    hasDetailedVoterData: false,
    hasDropBoxVoting: true,
    politicalPartyState: true,
    hasGinglesChart: false,
  },
  oregon: {
    name: "oregon",
    fips: "41",
    politicalDominance: "democratic",
    registrationType: "opt-out",
    sameDayRegistration: false,
    hasDetailedVoterData: false,
    hasDropBoxVoting: false,
    politicalPartyState: false,
    hasGinglesChart: false,
  },
} as const satisfies Record<string, StateDetails>;

export type DetailedStateName = keyof typeof DETAILED_STATES;

export function getStateDetails(stateName: string): StateDetails | undefined {
  return DETAILED_STATES[stateName as DetailedStateName];
}

export function getStateDetailsByFips(fips: string): StateDetails | undefined {
  return Object.values(DETAILED_STATES).find((state) => state.fips === fips);
}

export function hasDetailedVoterData(stateName: string): boolean {
  const state = getStateDetails(stateName);
  return state?.hasDetailedVoterData ?? false;
}

export function hasDropBoxVoting(stateName: string): boolean {
  const state = getStateDetails(stateName);
  return state?.hasDropBoxVoting ?? false;
}

export function hasGinglesChart(stateName: string): boolean {
  const state = getStateDetails(stateName);
  return state?.hasGinglesChart ?? false;
}
