// Color utility functions for choropleth maps

export interface ColorScale {
  colors: string[];
  breaks: number[];
}

// Default gray tint function
export const defaultGrayTint = () => "rgba(220,220,220,0.36)";

// Default color scale for density data
export const defaultDensityScale: ColorScale = {
  colors: [
    "#f7fcf5",
    "#e5f5e0",
    "#c7e9c0",
    "#a1d99b",
    "#74c476",
    "#41ab5d",
    "#238b45",
    "#005a32",
  ],
  breaks: [0, 10, 20, 50, 100, 200, 500, 1000],
};

// Red color scale for Republican-leaning data
export const republicanScale: ColorScale = {
  colors: [
    "#fff5f0",
    "#fee0d2",
    "#fcbba1",
    "#fc9272",
    "#fb6a4a",
    "#ef3b2c",
    "#cb181d",
    "#99000d",
  ],
  breaks: [0, 10, 20, 30, 40, 50, 60, 70],
};

// Blue color scale for Democratic-leaning data
export const democraticScale: ColorScale = {
  colors: [
    "#f7fbff",
    "#deebf7",
    "#c6dbef",
    "#9ecae1",
    "#6baed6",
    "#4292c6",
    "#2171b5",
    "#08519c",
  ],
  breaks: [0, 10, 20, 30, 40, 50, 60, 70],
};

// Equipment age color scale (yellow to red, older = redder)
export const equipmentAgeScale: ColorScale = {
  colors: [
    "#ffffcc",
    "#ffeda0",
    "#fed976",
    "#feb24c",
    "#fd8d3c",
    "#fc4e2a",
    "#e31a1c",
    "#b10026",
  ],
  breaks: [0, 2, 4, 6, 8, 10, 12, 15],
};

// Provisional ballots color scale (light to dark purple)
export const provisionalBallotsScale: ColorScale = {
  colors: [
    "#fcfbfd",
    "#efedf5",
    "#dadaeb",
    "#bcbddc",
    "#9e9ac8",
    "#807dba",
    "#6a51a3",
    "#4a1486",
  ],
  breaks: [0, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0],
};

// Active voters color scale (light to dark green)
export const activeVotersScale: ColorScale = {
  colors: [
    "#f7fcf5",
    "#e5f5e0",
    "#c7e9c0",
    "#a1d99b",
    "#74c476",
    "#41ab5d",
    "#238b45",
    "#005a32",
  ],
  breaks: [85, 87, 89, 91, 93, 95, 97, 98],
};

// Pollbook deletions color scale (light to dark orange)
export const pollbookDeletionsScale: ColorScale = {
  colors: [
    "#fff5eb",
    "#fee6ce",
    "#fdd0a2",
    "#fdae6b",
    "#fd8d3c",
    "#f16913",
    "#d94801",
    "#8c2d04",
  ],
  breaks: [0, 1, 2, 3, 4, 5, 6, 8],
};

// Mail ballots rejected color scale (light to dark red)
export const mailBallotsRejectedScale: ColorScale = {
  colors: [
    "#fff5f0",
    "#fee0d2",
    "#fcbba1",
    "#fc9272",
    "#fb6a4a",
    "#ef3b2c",
    "#cb181d",
    "#99000d",
  ],
  breaks: [0, 0.5, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0],
};

// Voter registration color scale (light to dark blue)
export const voterRegistrationScale: ColorScale = {
  colors: [
    "#f7fbff",
    "#deebf7",
    "#c6dbef",
    "#9ecae1",
    "#6baed6",
    "#4292c6",
    "#2171b5",
    "#08519c",
  ],
  breaks: [50, 55, 60, 65, 70, 75, 80, 85],
};

// Generic function to get color based on value and color scale
export function getColorFromScale(value: number, scale: ColorScale): string {
  for (let i = 0; i < scale.breaks.length; i++) {
    if (value <= scale.breaks[i]) {
      return scale.colors[i];
    }
  }
  return scale.colors[scale.colors.length - 1];
}

export function getDensityColor(density: number): string {
  return getColorFromScale(density, defaultDensityScale);
}

export function getRepublicanColor(percentage: number): string {
  return getColorFromScale(percentage, republicanScale);
}

export function getDemocraticColor(percentage: number): string {
  return getColorFromScale(percentage, democraticScale);
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

// Function to get political color based on which party has higher percentage
export function getPoliticalColor(
  republicanPct: number,
  democraticPct: number,
): string {
  if (republicanPct > democraticPct) {
    // Use Republican color scale based on the margin of victory
    const margin = republicanPct - democraticPct;
    return getRepublicanColor(Math.min(70, 40 + margin)); // Scale margin to color intensity
  } else {
    // Use Democratic color scale based on the margin of victory
    const margin = democraticPct - republicanPct;
    return getDemocraticColor(Math.min(70, 40 + margin)); // Scale margin to color intensity
  }
}
