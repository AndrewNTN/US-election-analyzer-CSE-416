import { useQuery } from "@tanstack/react-query";

/**
 * Fetches provisional ballot table data by state FIPS prefix.
 * Backend endpoint: /api/eavs/provisional/table/{fipsPrefix}
 */
export async function fetchProvisionalStateTable(fipsPrefix: string) {
  const response = await fetch(`/api/eavs/provisional/table/${fipsPrefix}`);
  if (!response.ok) {
    throw new Error("Failed to fetch provisional state table data");
  }
  return response.json();
}

/**
 * Fetches provisional ballot aggregate data (chart) by state FIPS prefix.
 * Backend endpoint: /api/eavs/provisional/chart/{fipsPrefix}
 */
export async function fetchProvisionalChart(fipsPrefix: string) {
  const response = await fetch(`/api/eavs/provisional/chart/${fipsPrefix}`);
  if (!response.ok) {
    throw new Error("Failed to fetch provisional chart data");
  }
  return response.json();
}

/**
 * React Query hook to fetch provisional ballot table data.
 */
export function useProvisionalStateQuery(fipsPrefix: string) {
  return useQuery({
    queryKey: ["provisionalTable", fipsPrefix],
    queryFn: () => fetchProvisionalStateTable(fipsPrefix),
    enabled: !!fipsPrefix,
  });
}

/**
 * React Query hook to fetch provisional ballot aggregate (chart) data.
 */
export function useProvisionalAggregateQuery(fipsPrefix: string) {
  return useQuery({
    queryKey: ["provisionalChart", fipsPrefix],
    queryFn: () => fetchProvisionalChart(fipsPrefix),
    enabled: !!fipsPrefix,
  });
}
