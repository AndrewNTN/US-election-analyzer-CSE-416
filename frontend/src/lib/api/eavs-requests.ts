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
  metricLabels?: Record<string, string>;
}

export interface ProvisionalTableResponse {
  data: {
    eavsRegion: string;
    totalProv?: number;
    provCountFullyCounted?: number;
    provCountPartialCounted?: number;
    provRejected?: number;
    provisionalOtherStatus?: number;
  }[];
  metricLabels?: Record<string, string>;
}

export const getProvisionalChart = async (
  fipsPrefix: string,
): Promise<ProvisionalChartResponse> =>
  fetchJson(`/eavs/provisional/chart/${fipsPrefix}`);

export const getProvisionalTable = async (
  fipsPrefix: string,
): Promise<ProvisionalTableResponse> =>
  fetchJson(`/eavs/provisional/table/${fipsPrefix}`);

export interface ActiveVotersChartResponse {
  totalRegistered: number;
  totalActive: number;
  totalInactive: number;
  metricLabels?: Record<string, string>;
}

export interface ActiveVotersTableResponse {
  data: {
    eavsRegion: string;
    totalRegistered: number;
    totalActive: number;
    totalInactive: number;
  }[];
  metricLabels?: Record<string, string>;
}

export const getActiveVotersChart = async (
  fipsPrefix: string,
): Promise<ActiveVotersChartResponse> =>
  fetchJson(`/eavs/active-voters/chart/${fipsPrefix}`);

export const getActiveVotersTable = async (
  fipsPrefix: string,
): Promise<ActiveVotersTableResponse> =>
  fetchJson(`/eavs/active-voters/table/${fipsPrefix}`);

export interface PollbookDeletionsChartResponse {
  removedTotal: number;
  removedMoved: number;
  removedDeath: number;
  removedFelony: number;
  removedFailResponse: number;
  removedIncompetentToVote: number;
  removedVoterRequest: number;
  removedDuplicateRecords: number;
  metricLabels: Record<string, string>;
}

export interface MailBallotsRejectedTableResponse {
  data: MailBallotsRejectedData[];
  metricLabels: Record<string, string>;
}

export interface MailBallotsRejectedData {
  eavsRegion: string;
  late: number;
  missingVoterSignature: number;
  missingWitnessSignature: number;
  nonMatchingVoterSignature: number;
  unofficialEnvelope: number;
  ballotMissingFromEnvelope: number;
  noSecrecyEnvelope: number;
  multipleBallotsInOneEnvelope: number;
  envelopeNotSealed: number;
  noPostmark: number;
  noResidentAddressOnEnvelope: number;
  voterDeceased: number;
  voterAlreadyVoted: number;
  missingDocumentation: number;
  voterNotEligible: number;
  noBallotApplication: number;
}

export interface MailBallotsRejectedChartResponse {
  late: number;
  missingVoterSignature: number;
  missingWitnessSignature: number;
  nonMatchingVoterSignature: number;
  unofficialEnvelope: number;
  ballotMissingFromEnvelope: number;
  noSecrecyEnvelope: number;
  multipleBallotsInOneEnvelope: number;
  envelopeNotSealed: number;
  noPostmark: number;
  noResidentAddressOnEnvelope: number;
  voterDeceased: number;
  voterAlreadyVoted: number;
  missingDocumentation: number;
  voterNotEligible: number;
  noBallotApplication: number;
  metricLabels: Record<string, string>;
}

export const getPollbookDeletionsChart = async (
  fipsPrefix: string,
): Promise<PollbookDeletionsChartResponse> =>
  fetchJson(`/eavs/pollbook-deletions/chart/${fipsPrefix}`);

export const getMailBallotsRejectedTable = async (
  fipsPrefix: string,
): Promise<MailBallotsRejectedTableResponse> =>
  fetchJson(`/eavs/mail-ballots-rejected/table/${fipsPrefix}`);

export const getMailBallotsRejectedChart = async (
  fipsPrefix: string,
): Promise<MailBallotsRejectedChartResponse> =>
  fetchJson(`/eavs/mail-ballots-rejected/chart/${fipsPrefix}`);

export interface VoterRegistrationTableResponse {
  data: {
    eavsRegion: string;
    totalRegisteredVoters: number;
    democraticVoters: number;
    republicanVoters: number;
    unaffiliatedVoters: number;
  }[];
  metricLabels: Record<string, string>;
}

export interface VoterRegistrationChartResponse {
  data: {
    eavsRegion: string;
    registeredVoters2016: number;
    registeredVoters2020: number;
    registeredVoters2024: number;
  }[];
  metricLabels: Record<string, string>;
}

export const getVoterRegistrationTable = async (
  stateFips: string,
): Promise<VoterRegistrationTableResponse> =>
  fetchJson(`/eavs/voter-registration/table/${stateFips}`);

export const getVoterRegistrationChart = async (
  fipsPrefix: string,
): Promise<VoterRegistrationChartResponse> =>
  fetchJson(`/eavs/voter-registration/chart/${fipsPrefix}`);
