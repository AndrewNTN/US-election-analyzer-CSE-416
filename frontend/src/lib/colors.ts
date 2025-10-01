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

// Generic function to get color based on value and color scale
export function getColorFromScale(value: number, scale: ColorScale): string {
  for (let i = 0; i < scale.breaks.length; i++) {
    if (value <= scale.breaks[i]) {
      return scale.colors[i];
    }
  }
  return scale.colors[scale.colors.length - 1];
}

// Convenience functions for common scales
export function getDensityColor(density: number): string {
  return getColorFromScale(density, defaultDensityScale);
}

export function getRepublicanColor(percentage: number): string {
  return getColorFromScale(percentage, republicanScale);
}

export function getDemocraticColor(percentage: number): string {
  return getColorFromScale(percentage, democraticScale);
}

// Function to create a custom color scale
export function createColorScale(
  colors: string[],
  breaks: number[],
): ColorScale {
  if (colors.length !== breaks.length) {
    throw new Error("Colors and breaks arrays must have the same length");
  }
  return { colors, breaks };
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
