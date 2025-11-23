// Choropleth visualization options and color utilities

// Choropleth visualization options for splash page
export const SPLASH_CHOROPLETH_OPTIONS = {
  OFF: "off",
  EQUIPMENT_AGE: "equipment_age",
} as const;

// Choropleth visualization options for state analysis (detailed states)
export const STATE_CHOROPLETH_OPTIONS = {
  PROVISIONAL_BALLOTS: "provisional_ballots",
  ACTIVE_VOTERS: "active_voters",
  POLLBOOK_DELETIONS: "pollbook_deletions",
  MAIL_BALLOTS_REJECTED: "mail_ballots_rejected",
  VOTER_REGISTRATION: "voter_registration",
  OFF: "off",
} as const;

export type SplashChoroplethOption =
  (typeof SPLASH_CHOROPLETH_OPTIONS)[keyof typeof SPLASH_CHOROPLETH_OPTIONS];

export type StateChoroplethOption =
  (typeof STATE_CHOROPLETH_OPTIONS)[keyof typeof STATE_CHOROPLETH_OPTIONS];

export type ChoroplethOption = SplashChoroplethOption | StateChoroplethOption;

export const SPLASH_CHOROPLETH_LABELS: Record<SplashChoroplethOption, string> =
  {
    [SPLASH_CHOROPLETH_OPTIONS.OFF]: "Off",
    [SPLASH_CHOROPLETH_OPTIONS.EQUIPMENT_AGE]: "Voting Equipment Age",
  };

export const STATE_CHOROPLETH_LABELS: Record<StateChoroplethOption, string> = {
  [STATE_CHOROPLETH_OPTIONS.PROVISIONAL_BALLOTS]: "Provisional Ballots",
  [STATE_CHOROPLETH_OPTIONS.ACTIVE_VOTERS]: "2024 EAVS Active Voters",
  [STATE_CHOROPLETH_OPTIONS.POLLBOOK_DELETIONS]: "2024 EAVS Pollbook Deletions",
  [STATE_CHOROPLETH_OPTIONS.MAIL_BALLOTS_REJECTED]: "Mail Ballots Rejected",
  [STATE_CHOROPLETH_OPTIONS.VOTER_REGISTRATION]: "Voter Registration",
  [STATE_CHOROPLETH_OPTIONS.OFF]: "Off",
};

// Color utility functions for choropleth maps

export interface ColorScale {
  colors: string[];
  breaks: number[];
}

// Default gray tint function
export const defaultGrayTint = () => "rgba(220,220,220,0.36)";

// Generic sequential palette for all choropleths (provisional ballots purple scale)
export const CHOROPLETH_COLORS_SPLASH: string[] = [
  "#fcfbfd",
  "#efedf5",
  "#dadaeb",
  "#bcbddc",
  "#9e9ac8",
  "#807dba",
  "#6a51a3",
  "#4a1486",
];

export const CHOROPLETH_COLORS: string[] = [
  "#fcfbfd",
  "#dadaeb",
  "#9e9ac8",
  "#6a51a3",
  "#4a1486",
];

// Equipment age scale uses the generic palette; breaks tuned for age (years)
export const equipmentAgeScale: ColorScale = {
  colors: CHOROPLETH_COLORS_SPLASH.slice(2, 8),
  breaks: [2, 4, 6, 8, 10, 100],
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

// Get voting equipment type color
export function getVotingEquipmentTypeColor(
  equipmentType: VotingEquipmentType,
): string {
  return (
    VOTING_EQUIPMENT_COLORS[equipmentType] || VOTING_EQUIPMENT_COLORS.mixed
  );
}
// Generate a color scale based on data quantiles
export function generateColorScale(
  values: number[],
  colors: string[],
): ColorScale {
  // Filter out invalid values and sort
  const sorted = values
    .filter((v) => v !== null && v !== undefined && !isNaN(v))
    .sort((a, b) => a - b);

  if (sorted.length === 0) {
    return { colors, breaks: [] };
  }

  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  // Handle zero variance (all values are the same)
  if (min === max) {
    const numColors = colors.length;
    const numBreaks = numColors - 1;
    const breaks: number[] = [];

    // If value is 0, we create an arbitrary small range (0-1) so 0 maps to first bin
    const upper = max === 0 ? 1 : max;

    for (let i = 1; i <= numBreaks; i++) {
      breaks.push((upper * i) / numColors);
    }

    return { colors, breaks };
  }

  // Calculate quantiles
  const breaks: number[] = [];
  const numColors = colors.length;
  const numBreaks = numColors - 1;

  for (let i = 1; i <= numBreaks; i++) {
    const percentile = i / numColors;
    const index = Math.min(
      Math.floor(percentile * sorted.length),
      sorted.length - 1,
    );

    breaks.push(sorted[index]);
  }

  // Deduplicate breaks
  const uniqueBreaks = Array.from(new Set(breaks)).sort((a, b) => a - b);

  if (uniqueBreaks.length < numBreaks) {
    const linearBreaks: number[] = [];
    const range = max - min;
    const step = range / numColors;

    for (let i = 1; i <= numBreaks; i++) {
      linearBreaks.push(min + step * i);
    }

    // We use the full set of colors
    return { colors, breaks: linearBreaks };
  }

  // Otherwise, use the unique quantile breaks
  const adjustedColors = colors.slice(0, uniqueBreaks.length + 1);

  return { colors: adjustedColors, breaks: uniqueBreaks };
}
