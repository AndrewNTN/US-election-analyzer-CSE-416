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
  getPollbookDeletionsChart,
  type PollbookDeletionsChartResponse,
  getMailBallotsRejectedTable,
  getMailBallotsRejectedChart,
  type MailBallotsRejectedTableResponse,
  type MailBallotsRejectedChartResponse,
  getVoterRegistrationTable,
  getVoterRegistrationChart,
  type VoterRegistrationTableResponse,
  type VoterRegistrationChartResponse,
  getVotingEquipmentTable,
  getVotingEquipmentChart,
  type VotingEquipmentTableResponse,
  type VotingEquipmentChartResponse,
  getCvapRegistrationRate,
  type CvapRegistrationRateResponse,
  getStateComparison,
  type StateComparisonResponse,
  getEarlyVotingComparison,
  type EarlyVotingComparisonResponse,
  getOptInOptOutComparison,
  type OptInOptOutComparisonResponse,
} from "@/lib/api/requests.ts";

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

export const usePollbookDeletionsChartQuery = (
  fipsPrefix: string | null | undefined,
): UseQueryResult<PollbookDeletionsChartResponse, Error> =>
  useQuery({
    queryKey: ["pollbook-deletions-chart", fipsPrefix ?? "no-fips"],
    queryFn: async () => {
      if (!fipsPrefix) {
        throw new Error(
          "Missing FIPS prefix for pollbook deletions chart query",
        );
      }
      return getPollbookDeletionsChart(fipsPrefix);
    },
    enabled: Boolean(fipsPrefix),
  });

export const useMailBallotsRejectedTableQuery = (
  fipsPrefix: string | null | undefined,
): UseQueryResult<MailBallotsRejectedTableResponse, Error> =>
  useQuery({
    queryKey: ["mail-ballots-rejected-table", fipsPrefix ?? "no-fips"],
    queryFn: async () => {
      if (!fipsPrefix) {
        throw new Error(
          "Missing FIPS prefix for mail ballots rejected table query",
        );
      }
      return getMailBallotsRejectedTable(fipsPrefix);
    },
    enabled: Boolean(fipsPrefix),
  });

export const useMailBallotsRejectedChartQuery = (
  fipsPrefix: string | null | undefined,
): UseQueryResult<MailBallotsRejectedChartResponse, Error> =>
  useQuery({
    queryKey: ["mail-ballots-rejected-chart", fipsPrefix ?? "no-fips"],
    queryFn: async () => {
      if (!fipsPrefix) {
        throw new Error(
          "Missing FIPS prefix for mail ballots rejected chart query",
        );
      }
      return getMailBallotsRejectedChart(fipsPrefix);
    },
    enabled: Boolean(fipsPrefix),
  });

export const useVoterRegistrationTableQuery = (
  stateFips: string | null | undefined,
): UseQueryResult<VoterRegistrationTableResponse, Error> =>
  useQuery({
    queryKey: ["voter-registration-table", stateFips ?? "no-fips"],
    queryFn: async () => {
      if (!stateFips) {
        throw new Error(
          "Missing state FIPS for voter registration table query",
        );
      }
      return getVoterRegistrationTable(stateFips);
    },
    enabled: Boolean(stateFips),
  });

export const useVoterRegistrationChartQuery = (
  fipsPrefix: string | null | undefined,
): UseQueryResult<VoterRegistrationChartResponse, Error> =>
  useQuery({
    queryKey: ["voter-registration-chart", fipsPrefix ?? "no-fips"],
    queryFn: async () => {
      if (!fipsPrefix) {
        throw new Error(
          "Missing FIPS prefix for voter registration chart query",
        );
      }
      return getVoterRegistrationChart(fipsPrefix);
    },
    enabled: Boolean(fipsPrefix),
  });

export const useVotingEquipmentTableQuery = (options?: {
  enabled?: boolean;
}): UseQueryResult<VotingEquipmentTableResponse, Error> =>
  useQuery({
    queryKey: ["voting-equipment-table"],
    queryFn: async () => {
      return getVotingEquipmentTable();
    },
    ...options,
  });

export const useVotingEquipmentChartQuery = (
  stateName: string | null | undefined,
): UseQueryResult<VotingEquipmentChartResponse, Error> =>
  useQuery({
    queryKey: ["voting-equipment-chart", stateName ?? "no-state"],
    queryFn: async () => {
      if (!stateName) {
        throw new Error("Missing state name for voting equipment chart query");
      }
      return getVotingEquipmentChart(stateName);
    },
    enabled: Boolean(stateName),
  });

export const useCvapRegistrationRateQuery = (
  fipsPrefix: string | null | undefined,
): UseQueryResult<CvapRegistrationRateResponse, Error> =>
  useQuery({
    queryKey: ["cvap-registration-rate", fipsPrefix ?? "no-fips"],
    queryFn: async () => {
      if (!fipsPrefix) {
        throw new Error("Missing FIPS prefix for CVAP registration rate query");
      }
      return getCvapRegistrationRate(fipsPrefix);
    },
    enabled: Boolean(fipsPrefix),
  });

export const useStateComparisonQuery = (
  republicanStateFips: string,
  democraticStateFips: string,
  options?: { enabled?: boolean },
): UseQueryResult<StateComparisonResponse, Error> =>
  useQuery({
    queryKey: ["state-comparison", republicanStateFips, democraticStateFips],
    queryFn: async () => {
      return getStateComparison(republicanStateFips, democraticStateFips);
    },
    ...options,
  });

export const useEarlyVotingComparisonQuery = (
  republicanStateFips: string,
  democraticStateFips: string,
  options?: { enabled?: boolean },
): UseQueryResult<EarlyVotingComparisonResponse, Error> =>
  useQuery({
    queryKey: [
      "early-voting-comparison",
      republicanStateFips,
      democraticStateFips,
    ],
    queryFn: async () => {
      return getEarlyVotingComparison(republicanStateFips, democraticStateFips);
    },
    ...options,
  });

export const useOptInOptOutComparisonQuery = (
  optInFips: string,
  optOutSameDayFips: string,
  optOutNoSameDayFips: string,
  options?: { enabled?: boolean },
): UseQueryResult<OptInOptOutComparisonResponse, Error> =>
  useQuery({
    queryKey: [
      "opt-in-opt-out-comparison",
      optInFips,
      optOutSameDayFips,
      optOutNoSameDayFips,
    ],
    queryFn: async () => {
      return getOptInOptOutComparison(
        optInFips,
        optOutSameDayFips,
        optOutNoSameDayFips,
      );
    },
    ...options,
  });
