import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a state name to URL-friendly format
 * Examples: "New York" -> "new-york", "California" -> "california"
 */
export function formatStateNameForUrl(stateName: string): string {
  return stateName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Formats large numbers with K/M suffixes for better readability in charts
 * Examples: 1,500,000 -> "1.5M", 2,500 -> "2.5K", 500 -> "500"
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}
