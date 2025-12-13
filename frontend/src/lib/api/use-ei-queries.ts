import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  getEIEquipmentData,
  getEIRejectedBallotsData,
  type EIData,
} from "@/lib/api/ei-requests";

export const useEIEquipmentDataQuery = (
  stateFips: string | null | undefined,
): UseQueryResult<EIData, Error> =>
  useQuery({
    queryKey: ["ei-equipment", stateFips ?? "no-fips"],
    queryFn: async () => {
      if (!stateFips) {
        throw new Error("Missing state FIPS for EI equipment query");
      }
      return getEIEquipmentData(stateFips);
    },
    enabled: Boolean(stateFips),
  });

export const useEIRejectedBallotsDataQuery = (
  stateFips: string | null | undefined,
): UseQueryResult<EIData, Error> =>
  useQuery({
    queryKey: ["ei-rejected-ballots", stateFips ?? "no-fips"],
    queryFn: async () => {
      if (!stateFips) {
        throw new Error("Missing state FIPS for EI rejected ballots query");
      }
      return getEIRejectedBallotsData(stateFips);
    },
    enabled: Boolean(stateFips),
  });
