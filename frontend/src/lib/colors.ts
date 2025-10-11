// Color utility functions for choropleth maps

export interface ColorScale {
  colors: string[];
  breaks: number[];
}

// Default gray tint function
export const defaultGrayTint = () => "rgba(220,220,220,0.36)";

// Generic sequential palette for all choropleths (provisional ballots purple scale)
export const CHOROPLETH_COLORS: string[] = [
  "#fcfbfd",
  "#efedf5",
  "#dadaeb",
  "#bcbddc",
  "#9e9ac8",
  "#807dba",
  "#6a51a3",
  "#4a1486",
];

// Equipment age scale uses the generic palette; breaks tuned for age (years)
export const equipmentAgeScale: ColorScale = {
  colors: CHOROPLETH_COLORS,
  breaks: [0, 2, 4, 6, 8, 10, 12, 15],
};

// Provisional ballots percentage scale (uses generic palette)
export const provisionalBallotsScale: ColorScale = {
  colors: CHOROPLETH_COLORS,
  breaks: [0, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0],
};

// Active voters percentage scale (uses generic palette)
export const activeVotersScale: ColorScale = {
  colors: CHOROPLETH_COLORS,
  breaks: [85, 87, 89, 91, 93, 95, 97, 98],
};

// Pollbook deletions percentage scale (uses generic palette)
export const pollbookDeletionsScale: ColorScale = {
  colors: CHOROPLETH_COLORS,
  breaks: [0, 1, 2, 3, 4, 5, 6, 8],
};

// Mail ballots rejected percentage scale (uses generic palette)
export const mailBallotsRejectedScale: ColorScale = {
  colors: CHOROPLETH_COLORS,
  breaks: [0, 0.5, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0],
};

// Voter registration percentage scale (uses generic palette)
export const voterRegistrationScale: ColorScale = {
  colors: CHOROPLETH_COLORS,
  breaks: [50, 55, 60, 65, 70, 75, 80, 85],
};

// Voting equipment type colors (high contrast colors)
export const VOTING_EQUIPMENT_COLORS = {
  dre_no_vvpat: "#e41a1c", // Red
  dre_with_vvpat: "#ff7f00", // Orange
  ballot_marking_device: "#4daf4a", // Green
  scanner: "#377eb8", // Blue
  mixed: "#984ea3", // Purple (for multiple types)
} as const;

export type VotingEquipmentType =
  | "dre_no_vvpat"
  | "dre_with_vvpat"
  | "ballot_marking_device"
  | "scanner"
  | "mixed";

// Generic function to get color based on value and color scale
export function getColorFromScale(value: number, scale: ColorScale): string {
  for (let i = 0; i < scale.breaks.length; i++) {
    if (value <= scale.breaks[i]) {
      return scale.colors[i];
    }
  }
  return scale.colors[scale.colors.length - 1];
}

export function getEquipmentAgeColor(age: number): string {
  return getColorFromScale(age, equipmentAgeScale);
}

export function getProvisionalBallotsColor(percentage: number): string {
  return getColorFromScale(percentage, provisionalBallotsScale);
}

export function getActiveVotersColor(percentage: number): string {
  return getColorFromScale(percentage, activeVotersScale);
}

export function getPollbookDeletionsColor(percentage: number): string {
  return getColorFromScale(percentage, pollbookDeletionsScale);
}

export function getMailBallotsRejectedColor(percentage: number): string {
  return getColorFromScale(percentage, mailBallotsRejectedScale);
}

export function getVoterRegistrationColor(percentage: number): string {
  return getColorFromScale(percentage, voterRegistrationScale);
}

// Get voting equipment type color
export function getVotingEquipmentTypeColor(
  equipmentType: VotingEquipmentType,
): string {
  return (
    VOTING_EQUIPMENT_COLORS[equipmentType] || VOTING_EQUIPMENT_COLORS.mixed
  );
}
