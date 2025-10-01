// Choropleth visualization options
export const CHOROPLETH_OPTIONS = {
  POLITICAL: "political",
  DENSITY: "density",
  OFF: "off",
} as const;

export type ChoroplethOption =
  (typeof CHOROPLETH_OPTIONS)[keyof typeof CHOROPLETH_OPTIONS];

export const CHOROPLETH_LABELS: Record<ChoroplethOption, string> = {
  [CHOROPLETH_OPTIONS.DENSITY]: "Population Density",
  [CHOROPLETH_OPTIONS.POLITICAL]: "Political Leaning",
  [CHOROPLETH_OPTIONS.OFF]: "Off",
};
