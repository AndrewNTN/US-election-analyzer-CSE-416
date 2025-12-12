import { fetchJson } from "@/lib/api/api-client";

export interface FloridaVoter {
  name: string;
  party: string;
}
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
    missingNamePct: number;
    missingAddressPct: number;
    missingEmailPct: number;
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

export interface VotingEquipment {
  state: string;
  stateFips: string;
  dreNoVVPAT: number;
  dreWithVVPAT: number;
  ballotMarkingDevice: number;
  scanner: number;
}

export interface VotingEquipmentTableResponse {
  data: VotingEquipment[];
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
  fipsPrefix: string,
): Promise<VotingEquipmentChartResponse> =>
  fetchJson(`/voting-equipment/chart/${fipsPrefix}`);

// Equipment Summary types and functions
export interface EquipmentSummary {
  make: string;
  model: string;
  quantity: number | null;
  age: number | null;
  operatingSystem: string | null;
  certification: string | null;
  scanRate: string | null;
  errorRate: number | null;
  reliability: number | null;
  quality: number | null;
}

export interface EquipmentSummaryResponse {
  data: EquipmentSummary[];
  metricLabels: Record<string, string>;
}

export const getEquipmentSummary =
  async (): Promise<EquipmentSummaryResponse> =>
    fetchJson(`/equipment-summary`);

export interface StateEquipmentSummary {
  make: string;
  model: string;
  quantity: number | null;
  equipmentType: string | null;
  description: string | null;
  age: number | null;
  operatingSystem: string | null;
  certification: string | null;
  scanRate: string | null;
  errorRate: number | null;
  reliability: number | null;
  discontinued: boolean | null;
}

export interface StateEquipmentSummaryResponse {
  data: StateEquipmentSummary[];
  metricLabels: Record<string, string>;
}

export const getStateEquipmentSummary = async (
  stateFips: string,
): Promise<StateEquipmentSummaryResponse> =>
  fetchJson(`/state-equipment-summary/${stateFips}`);

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

export interface EarlyVotingComparisonRow {
  metric: string;
  republicanValue: string;
  democraticValue: string;
}

export interface EarlyVotingComparisonResponse {
  data: EarlyVotingComparisonRow[];
  republicanState: string;
  democraticState: string;
}

export const getEarlyVotingComparison = async (
  republicanStateFips: string,
  democraticStateFips: string,
): Promise<EarlyVotingComparisonResponse> =>
  fetchJson(
    `/early-voting-comparison?republicanStateFips=${republicanStateFips}&democraticStateFips=${democraticStateFips}`,
  );

export interface OptInOptOutComparisonRow {
  metric: string;
  optInValue: string;
  optOutWithSameDayValue: string;
  optOutWithoutSameDayValue: string;
}

export interface OptInOptOutComparisonResponse {
  data: OptInOptOutComparisonRow[];
  optInState: string;
  optOutWithSameDayState: string;
  optOutWithoutSameDayState: string;
}

export const getOptInOptOutComparison = async (
  optInFips: string,
  optOutSameDayFips: string,
  optOutNoSameDayFips: string,
): Promise<OptInOptOutComparisonResponse> =>
  fetchJson(
    `/opt-in-opt-out-comparison?optInFips=${optInFips}&optOutSameDayFips=${optOutSameDayFips}&optOutNoSameDayFips=${optOutNoSameDayFips}`,
  );

export interface FloridaVotersResponse {
  metricLabels: string[];
  voters: FloridaVoter[];
  totalPages: number;
  totalElements: number;
}

export async function getFloridaVoters(
  countyName: string,
  page: number,
  size: number,
  sort?: string,
  party?: string,
): Promise<FloridaVotersResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (sort) {
    params.append("sort", sort);
  }

  if (party && party !== "all") {
    params.append("party", party);
  }

  const response = await fetch(
    `http://localhost:8080/api/florida-voters/${countyName}?${params.toString()}`,
  );
  return response.json();
}

export interface DropBoxVotingData {
  eavsRegion: string;
  totalDropBoxVotes: number;
  republicanVotes: number;
  democraticVotes: number;
  totalVotes: number;
  republicanPercentage: number;
  democraticPercentage: number;
  dropBoxPercentage: number;
  dominantParty: "republican" | "democratic";
}

export const getDropBoxVotingData = async (
  fipsPrefix: string,
): Promise<DropBoxVotingData[]> => fetchJson(`/drop-box-voting/${fipsPrefix}`);

export interface GinglesPrecinctData {
  precinctId: string;
  precinctName: string;
  countyName: string;
  republicanVotes: number;
  democraticVotes: number;
  totalVotes: number;
  republicanPercentage: number;
  democraticPercentage: number;
  white: number;
  black: number;
  hispanic: number;
  asian: number;
}

export interface GinglesDemographicCurves {
  republican: [number, number][];
  democratic: [number, number][];
}

export interface GinglesChartMetadata {
  totalPrecincts: number;
  totalCounties: number;
}

export interface GinglesChartResponse {
  precincts: GinglesPrecinctData[];
  regressionCurves: Record<string, GinglesDemographicCurves>;
  metadata: GinglesChartMetadata;
}

export const getGinglesChartData = async (
  fipsPrefix: string,
): Promise<GinglesChartResponse> => fetchJson(`/gingles-chart/${fipsPrefix}`);

export type VotingEquipmentType =
  | "dre_no_vvpat"
  | "dre_with_vvpat"
  | "ballot_marking_device"
  | "scanner"
  | "mixed";

export interface CountyEquipmentType {
  fipsCode: string;
  jurisdictionName: string;
  equipmentType: VotingEquipmentType;
  dreNoVVPAT: number;
  dreWithVVPAT: number;
  ballotMarkingDevice: number;
  scanner: number;
}

export interface CountyEquipmentTypeResponse {
  data: CountyEquipmentType[];
  equipmentLabels: Record<string, string>;
}

export const getCountyEquipmentTypes = async (
  fipsPrefix: string,
): Promise<CountyEquipmentTypeResponse> =>
  fetchJson(`/voting-equipment/types/${fipsPrefix}`);

// Equipment Quality vs Rejected Ballots Chart
export interface EquipmentQualityData {
  county: string;
  equipmentQuality: number;
  rejectedBallotPercentage: number;
  totalBallots: number;
  rejectedBallots: number;
  dominantParty: "republican" | "democratic";
  mailInRejected: number;
  provisionalRejected: number;
  uocavaRejected: number;
}

export interface RegressionCoefficients {
  a: number;
  b: number;
  c: number;
}

export interface EquipmentQualityChartResponse {
  equipmentQualityData: EquipmentQualityData[];
  regressionCoefficients: {
    republican: RegressionCoefficients;
    democratic: RegressionCoefficients;
  };
}

export const getEquipmentQualityChart = async (
  fipsPrefix: string,
): Promise<EquipmentQualityChartResponse> =>
  fetchJson(`/equipment-quality-chart/${fipsPrefix}`);
