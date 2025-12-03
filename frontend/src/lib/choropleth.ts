// Choropleth visualization options and color utilities
export const SPLASH_CHOROPLETH_OPTIONS = {
  OFF: "off",
  EQUIPMENT_AGE: "equipment_age",
} as const;

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

// Color utility functions for choropleth maps
export interface ColorScale {
  colors: string[];
  breaks: number[];
}

export const defaultGrayTint = () => "rgba(220,220,220,0.36)";

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

export const equipmentAgeScale: ColorScale = {
  colors: CHOROPLETH_COLORS_SPLASH.slice(2, 8),
  breaks: [2, 4, 6, 8, 10, 100],
};

export const VOTING_EQUIPMENT_COLORS = {
  dre_no_vvpat: "#e41a1c",
  dre_with_vvpat: "#ff7f00",
  ballot_marking_device: "#4daf4a",
  scanner: "#377eb8",
  mixed: "#984ea3",
} as const;

export type VotingEquipmentType =
  | "dre_no_vvpat"
  | "dre_with_vvpat"
  | "ballot_marking_device"
  | "scanner"
  | "mixed";

export function getColorFromScale(value: number, scale: ColorScale): string {
  for (let i = 0; i < scale.breaks.length; i++) {
    if (value <= scale.breaks[i]) {
      return scale.colors[i];
    }
  }
  return scale.colors[scale.colors.length - 1];
}

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
  const sorted = values
    .filter((v) => v !== null && v !== undefined && !isNaN(v))
    .sort((a, b) => a - b);

  if (sorted.length === 0) {
    return { colors, breaks: [] };
  }

  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  if (min === max) {
    const numColors = colors.length;
    const numBreaks = numColors - 1;
    const breaks: number[] = [];

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

  const uniqueBreaks = Array.from(new Set(breaks)).sort((a, b) => a - b);

  if (uniqueBreaks.length < numBreaks) {
    const linearBreaks: number[] = [];
    const range = max - min;
    const step = range / numColors;

    for (let i = 1; i <= numBreaks; i++) {
      linearBreaks.push(min + step * i);
    }

    return { colors, breaks: linearBreaks };
  }

  const adjustedColors = colors.slice(0, uniqueBreaks.length + 1);

  return { colors: adjustedColors, breaks: uniqueBreaks };
}
