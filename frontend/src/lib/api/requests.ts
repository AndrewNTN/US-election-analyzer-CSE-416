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
  fetchJson(`/provisional/chart/${fipsPrefix}`);

export const getProvisionalTable = async (
  fipsPrefix: string,
): Promise<ProvisionalTableResponse> =>
  fetchJson(`/provisional/table/${fipsPrefix}`);

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
  fetchJson(`/active-voters/chart/${fipsPrefix}`);

export const getActiveVotersTable = async (
  fipsPrefix: string,
): Promise<ActiveVotersTableResponse> =>
  fetchJson(`/active-voters/table/${fipsPrefix}`);

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
  fetchJson(`/pollbook-deletions/chart/${fipsPrefix}`);

export const getMailBallotsRejectedTable = async (
  fipsPrefix: string,
): Promise<MailBallotsRejectedTableResponse> =>
  fetchJson(`/mail-ballots-rejected/table/${fipsPrefix}`);

export const getMailBallotsRejectedChart = async (
  fipsPrefix: string,
): Promise<MailBallotsRejectedChartResponse> =>
  fetchJson(`/mail-ballots-rejected/chart/${fipsPrefix}`);

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
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const getVoterRegistrationTable = async (
  stateFips: string,
): Promise<VoterRegistrationTableResponse> =>
  fetchJson(`/voter-registration/table/${stateFips}`);

export const getVoterRegistrationChart = async (
  fipsPrefix: string,
): Promise<VoterRegistrationChartResponse> =>
  fetchJson(`/voter-registration/chart/${fipsPrefix}`);

export interface VotingEquipmentTableResponse {
  data: {
    state: string;
    dreNoVVPAT: number;
    dreWithVVPAT: number;
    ballotMarkingDevice: number;
    scanner: number;
  }[];
  metricLabels: Record<string, string>;
}

export interface VotingEquipmentChartResponse {
  data: {
    year: number;
    dreNoVVPAT: number;
    dreWithVVPAT: number;
    ballotMarkingDevice: number;
    scanner: number;
  }[];
  metricLabels: Record<string, string>;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const getVotingEquipmentTable =
  async (): Promise<VotingEquipmentTableResponse> =>
    fetchJson(`/voting-equipment/table`);

export const getVotingEquipmentChart = async (
  stateName: string,
): Promise<VotingEquipmentChartResponse> =>
  fetchJson(
    `/voting-equipment/chart?stateName=${encodeURIComponent(stateName)}`,
  );

export interface CvapRegistrationRateResponse {
  registrationRate: number;
  label: string;
}

export const getCvapRegistrationRate = async (
  fipsPrefix: string,
): Promise<CvapRegistrationRateResponse> =>
  fetchJson(`/cvap-registration-rate/${fipsPrefix}`);

export interface StateComparisonResponse {
  data: {
    metric: string;
    republicanValue: string;
    democraticValue: string;
  }[];
  metricLabels: Record<string, string>;
  republicanState: string;
  democraticState: string;
}

export const getStateComparison = async (
  republicanStateFips: string,
  democraticStateFips: string,
): Promise<StateComparisonResponse> =>
  fetchJson(
    `/state-comparison?republicanStateFips=${republicanStateFips}&democraticStateFips=${democraticStateFips}`,
  );
