import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import {
  eavsKeys,
  getProvisionalAggregate,
  getProvisionalState,
  type ProvisionalAggregateResponse,
  type ProvisionalBallotsApiResponse,
} from "@/lib/api/eavs-requests";

export const useProvisionalAggregateQuery = (
  fipsPrefix: string | null | undefined,
): UseQueryResult<ProvisionalAggregateResponse, Error> =>
  useQuery({
    queryKey: fipsPrefix
      ? eavsKeys.provisional.aggregate(fipsPrefix)
      : [...eavsKeys.provisional.root(), "aggregate", "no-fips"],
    queryFn: async () => {
      if (!fipsPrefix) {
        throw new Error("Missing FIPS prefix for provisional aggregate query");
      }
      return getProvisionalAggregate(fipsPrefix);
    },
    enabled: Boolean(fipsPrefix),
  });

export const useProvisionalStateQuery = (
  fipsPrefix: string | null | undefined,
): UseQueryResult<ProvisionalBallotsApiResponse[], Error> =>
  useQuery({
    queryKey: fipsPrefix
      ? eavsKeys.provisional.state(fipsPrefix)
      : [...eavsKeys.provisional.root(), "state", "no-fips"],
    queryFn: async () => {
      if (!fipsPrefix) {
        throw new Error("Missing FIPS prefix for provisional state query");
      }
      return getProvisionalState(fipsPrefix);
    },
    enabled: Boolean(fipsPrefix),
  });
