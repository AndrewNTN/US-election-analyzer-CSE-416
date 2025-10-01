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
