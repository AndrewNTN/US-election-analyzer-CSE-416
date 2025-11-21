import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import {
  getProvisionalChart,
  getProvisionalTable,
  type ProvisionalChartResponse,
  type ProvisionalTableResponse,
  getActiveVotersChart,
  getActiveVotersTable,
  type ActiveVotersChartResponse,
  type ActiveVotersTableResponse,
} from "@/lib/api/eavs-requests";

export const useProvisionalChartQuery = (
  fipsPrefix: string | null | undefined,
): UseQueryResult<ProvisionalChartResponse, Error> =>
  useQuery({
    queryKey: ["provisional-chart", fipsPrefix ?? "no-fips"],
    queryFn: async () => {
      if (!fipsPrefix) {
        throw new Error("Missing FIPS prefix for provisional chart query");
      }
      return getProvisionalChart(fipsPrefix);
    },
    enabled: Boolean(fipsPrefix),
  });

export const useProvisionalTableQuery = (
  fipsPrefix: string | null | undefined,
): UseQueryResult<ProvisionalTableResponse, Error> =>
  useQuery({
    queryKey: ["provisional-table", fipsPrefix ?? "no-fips"],
    queryFn: async () => {
      if (!fipsPrefix) {
        throw new Error("Missing FIPS prefix for provisional table query");
      }
      return getProvisionalTable(fipsPrefix);
    },
    enabled: Boolean(fipsPrefix),
  });

export const useActiveVotersChartQuery = (
  fipsPrefix: string | null | undefined,
): UseQueryResult<ActiveVotersChartResponse, Error> =>
  useQuery({
    queryKey: ["active-voters-chart", fipsPrefix ?? "no-fips"],
    queryFn: async () => {
      if (!fipsPrefix) {
        throw new Error("Missing FIPS prefix for active voters chart query");
      }
      return getActiveVotersChart(fipsPrefix);
    },
    enabled: Boolean(fipsPrefix),
  });

export const useActiveVotersTableQuery = (
  fipsPrefix: string | null | undefined,
): UseQueryResult<ActiveVotersTableResponse, Error> =>
  useQuery({
    queryKey: ["active-voters-table", fipsPrefix ?? "no-fips"],
    queryFn: async () => {
      if (!fipsPrefix) {
        throw new Error("Missing FIPS prefix for active voters table query");
      }
      return getActiveVotersTable(fipsPrefix);
    },
    enabled: Boolean(fipsPrefix),
  });
