import { fetchJson } from "@/lib/api/api-client";

export interface ProvisionalChartResponse {
  provReasonVoterNotOnList?: number;
  provReasonVoterLackedID?: number;
  provReasonElectionOfficialChallengedEligibility?: number;
  provReasonAnotherPersonChallengedEligibility?: number;
  provReasonVoterNotResident?: number;
  provReasonVoterRegistrationNotUpdated?: number;
  provReasonVoterDidNotSurrenderMailBallot?: number;
  provReasonJudgeExtendedVotingHours?: number;
  provReasonVoterUsedSDR?: number;
  provReasonOtherSum?: number;
}

export interface ProvisionalTableResponse {
  jurisdictionName: string;
  totalProv?: number;
  provCountFullyCounted?: number;
  provCountPartialCounted?: number;
  provRejected?: number;
  provisionalOtherStatus?: number;
}

export const getProvisionalChart = async (
  fipsPrefix: string,
): Promise<ProvisionalChartResponse> =>
  fetchJson(`/eavs/provisional/chart/${fipsPrefix}`);

export const getProvisionalTable = async (
  fipsPrefix: string,
): Promise<ProvisionalTableResponse[]> =>
  fetchJson(`/eavs/provisional/table/${fipsPrefix}`);
