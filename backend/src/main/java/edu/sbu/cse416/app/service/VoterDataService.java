package edu.sbu.cse416.app.service;

import edu.sbu.cse416.app.dto.activevoters.ActiveVotersChartResponse;
import edu.sbu.cse416.app.dto.activevoters.ActiveVotersTableResponse;
import edu.sbu.cse416.app.dto.cvap.CvapRegistrationRateResponse;
import edu.sbu.cse416.app.dto.dropbox.DropBoxVotingData;
import edu.sbu.cse416.app.dto.earlyvoting.EarlyVotingComparisonResponse;
import edu.sbu.cse416.app.dto.earlyvoting.EarlyVotingComparisonRow;
import edu.sbu.cse416.app.dto.mailballots.MailBallotsRejectedChartResponse;
import edu.sbu.cse416.app.dto.mailballots.MailBallotsRejectedTableResponse;
import edu.sbu.cse416.app.dto.optinoptout.OptInOptOutComparisonResponse;
import edu.sbu.cse416.app.dto.optinoptout.OptInOptOutComparisonRow;
import edu.sbu.cse416.app.dto.pollbook.PollbookDeletionsChartResponse;
import edu.sbu.cse416.app.dto.provisional.ProvisionalChartResponse;
import edu.sbu.cse416.app.dto.provisional.ProvisionalTableResponse;
import edu.sbu.cse416.app.dto.statecomparison.StateComparisonResponse;
import edu.sbu.cse416.app.dto.statecomparison.StateComparisonRow;
import edu.sbu.cse416.app.dto.voter.FloridaVoterDTO;
import edu.sbu.cse416.app.dto.voter.FloridaVotersResponse;
import edu.sbu.cse416.app.dto.voterregistration.VoterRegistrationChartResponse;
import edu.sbu.cse416.app.dto.voterregistration.VoterRegistrationTableResponse;
import edu.sbu.cse416.app.dto.votingequipment.VotingEquipmentChartResponse;
import edu.sbu.cse416.app.dto.votingequipment.VotingEquipmentDTO;
import edu.sbu.cse416.app.dto.votingequipment.VotingEquipmentTableResponse;
import edu.sbu.cse416.app.dto.votingequipment.VotingEquipmentYearlyDTO;
import edu.sbu.cse416.app.model.CountyVoteSplit;
import edu.sbu.cse416.app.model.CvapData;
import edu.sbu.cse416.app.model.FelonyVoting;
import edu.sbu.cse416.app.model.eavs.*;
import edu.sbu.cse416.app.model.registration.Voter;
import edu.sbu.cse416.app.repository.CountyVoteSplitRepository;
import edu.sbu.cse416.app.repository.CvapDataRepository;
import edu.sbu.cse416.app.repository.EavsDataRepository;
import edu.sbu.cse416.app.repository.FelonyVotingRepository;
import edu.sbu.cse416.app.repository.StateVoterRegistrationRepository;
import edu.sbu.cse416.app.repository.VoterRepository;
import edu.sbu.cse416.app.util.FipsUtil;
import edu.sbu.cse416.app.util.RecordAggregator;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class VoterDataService {

    private final EavsDataRepository repo;
    private final StateVoterRegistrationRepository voterRegRepo;
    private final CvapDataRepository cvapRepo;
    private final FelonyVotingRepository felonyVotingRepo;
    private final VoterRepository voterRepo;
    private final CountyVoteSplitRepository countyVoteSplitRepo;

    public VoterDataService(
            EavsDataRepository repo,
            StateVoterRegistrationRepository voterRegRepo,
            CvapDataRepository cvapRepo,
            FelonyVotingRepository felonyVotingRepo,
            VoterRepository voterRepo,
            CountyVoteSplitRepository countyVoteSplitRepo) {
        this.repo = repo;
        this.voterRegRepo = voterRegRepo;
        this.cvapRepo = cvapRepo;
        this.felonyVotingRepo = felonyVotingRepo;
        this.voterRepo = voterRepo;
        this.countyVoteSplitRepo = countyVoteSplitRepo;
    }

    /**
     * Null-to-zero helper.
     */
    private static int nz(Integer v) {
        return v == null ? 0 : v;
    }

    /**
     * Clean jurisdiction name by removing leading and trailing numbers.
     * E.g., "01 - Belknap County" becomes "Belknap County"
     * E.g., "LACONIA 01" becomes "LACONIA"
     */
    private static String cleanJurisdictionName(String name) {
        if (name == null) {
            return null;
        }
        // Remove leading digits, spaces, hyphens, and subsequent spaces
        String cleaned = name.replaceAll("^\\d+\\s*-?\\s*", "");
        // Remove trailing spaces and digits
        cleaned = cleaned.replaceAll("\\s+\\d+$", "");
        return cleaned;
    }

    /**
     * Filter EAVS data to ensure it matches the expected state and has valid FIPS
     * codes.
     * This prevents cross-state contamination (e.g., Wisconsin towns with FIPS
     * starting with "12").
     */
    /**
     * Helper to filter EAVS data by state name using FipsUtil.
     */
    private List<EavsData> filterByState(List<EavsData> data, String fipsPrefix) {
        String expectedState = FipsUtil.getStateName(fipsPrefix);
        if (expectedState == null) {
            return data;
        }
        return data.stream()
                .filter(d -> d.stateFull() != null && d.stateFull().equalsIgnoreCase(expectedState))
                .toList();
    }

    /**
     * Helper to fetch EAVS data by FIPS prefix with fallback to state abbreviation.
     * Handles Wisconsin (55) specifically by using state abbreviation.
     */
    private List<EavsData> fetchEavsData(String fipsPrefix) {
        String stateAbbr = FipsUtil.getStateAbbr(fipsPrefix);
        if (stateAbbr != null) {
            return repo.findByStateAbbr(stateAbbr);
        }
        // Fallback or empty if not found (shouldn't happen with valid FIPS)
        return List.of();
    }

    /**
     * Helper to fetch and filter EAVS data in one step.
     */
    private List<EavsData> getFilteredEavsData(String fipsPrefix) {
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        List<EavsData> rawData = fetchEavsData(prefix);
        return filterByState(rawData, prefix);
    }

    @Cacheable(value = "provisionalTable", key = "#fipsPrefix")
    public ProvisionalTableResponse getProvisionalTable(String fipsPrefix) {
        List<EavsData> data = getFilteredEavsData(fipsPrefix);
        List<ProvisionalTableResponse.Data> tableData = data.stream()
                .map(record -> {
                    ProvisionalBallots p = record.provisionalBallots();
                    return new ProvisionalTableResponse.Data(
                            cleanJurisdictionName(record.jurisdictionName()),
                            nz(p == null ? null : p.totalProv()),
                            nz(p == null ? null : p.provCountFullyCounted()),
                            nz(p == null ? null : p.provCountPartialCounted()),
                            nz(p == null ? null : p.provRejected()),
                            nz(p == null ? null : p.provisionalOtherStatus()));
                })
                .toList();
        return new ProvisionalTableResponse(tableData, ProvisionalTableResponse.getDefaultMetricLabels());
    }

    /**
     * Get provisional ballot chart data aggregated by reason for a FIPS prefix.
     */
    @Cacheable(value = "provisionalChart", key = "#fipsPrefix")
    public ProvisionalChartResponse getProvisionalChart(String fipsPrefix) {
        List<EavsData> data = getFilteredEavsData(fipsPrefix);

        ProvisionalChartResponse response =
                RecordAggregator.aggregate(data, EavsData::provisionalBallots, ProvisionalChartResponse.class);

        return new ProvisionalChartResponse(
                response.provReasonVoterNotOnList(),
                response.provReasonVoterLackedID(),
                response.provReasonElectionOfficialChallengedEligibility(),
                response.provReasonAnotherPersonChallengedEligibility(),
                response.provReasonVoterNotResident(),
                response.provReasonVoterRegistrationNotUpdated(),
                response.provReasonVoterDidNotSurrenderMailBallot(),
                response.provReasonJudgeExtendedVotingHours(),
                response.provReasonVoterUsedSDR(),
                response.provReasonOtherSum(),
                ProvisionalChartResponse.getDefaultMetricLabels());
    }

    /**
     * Get active voters table data for a FIPS prefix.
     */
    @Cacheable(value = "activeVotersTable", key = "#fipsPrefix")
    public ActiveVotersTableResponse getActiveVotersTable(String fipsPrefix) {
        List<EavsData> data = getFilteredEavsData(fipsPrefix);
        List<ActiveVotersTableResponse.Data> tableData = data.stream()
                .map(record -> {
                    VoterRegistration vr = record.voterRegistration();
                    return new ActiveVotersTableResponse.Data(
                            cleanJurisdictionName(record.jurisdictionName()),
                            nz(vr == null ? null : vr.totalRegistered()),
                            nz(vr == null ? null : vr.totalActive()),
                            nz(vr == null ? null : vr.totalInactive()));
                })
                .toList();
        return new ActiveVotersTableResponse(tableData, ActiveVotersTableResponse.getDefaultMetricLabels());
    }

    /**
     * Get active voters chart data aggregated for a FIPS prefix.
     */
    @Cacheable(value = "activeVotersChart", key = "#fipsPrefix")
    public ActiveVotersChartResponse getActiveVotersChart(String fipsPrefix) {
        List<EavsData> data = getFilteredEavsData(fipsPrefix);

        ActiveVotersChartResponse response =
                RecordAggregator.aggregate(data, EavsData::voterRegistration, ActiveVotersChartResponse.class);

        return new ActiveVotersChartResponse(
                response.totalRegistered(),
                response.totalActive(),
                response.totalInactive(),
                ActiveVotersChartResponse.getDefaultMetricLabels());
    }

    /**
     * Get pollbook deletions chart data aggregated for a FIPS prefix.
     */
    @Cacheable(value = "pollbookDeletionsChart", key = "#fipsPrefix")
    public PollbookDeletionsChartResponse getPollbookDeletionsChart(String fipsPrefix) {
        List<EavsData> data = getFilteredEavsData(fipsPrefix);

        PollbookDeletionsChartResponse response =
                RecordAggregator.aggregate(data, EavsData::voterDeletion, PollbookDeletionsChartResponse.class);

        return new PollbookDeletionsChartResponse(
                response.removedMoved(),
                response.removedDeath(),
                response.removedFelony(),
                response.removedFailResponse(),
                response.removedIncompetentToVote(),
                response.removedVoterRequest(),
                response.removedDuplicateRecords(),
                PollbookDeletionsChartResponse.getDefaultMetricLabels());
    }

    /**
     * Get mail ballots rejected table data for a FIPS prefix.
     */
    @Cacheable(value = "mailBallotsRejectedTable", key = "#fipsPrefix")
    public MailBallotsRejectedTableResponse getMailBallotsRejectedTable(String fipsPrefix) {
        List<EavsData> data = getFilteredEavsData(fipsPrefix);
        List<MailBallotsRejectedTableResponse.Data> tableData = data.stream()
                .map(record -> {
                    MailBallotsRejectedReason mbr = record.mailBallotsRejectedReason();
                    return new MailBallotsRejectedTableResponse.Data(
                            cleanJurisdictionName(record.jurisdictionName()),
                            nz(mbr == null ? null : mbr.late()),
                            nz(mbr == null ? null : mbr.missingVoterSignature()),
                            nz(mbr == null ? null : mbr.missingWitnessSignature()),
                            nz(mbr == null ? null : mbr.nonMatchingVoterSignature()),
                            nz(mbr == null ? null : mbr.unofficialEnvelope()),
                            nz(mbr == null ? null : mbr.ballotMissingFromEnvelope()),
                            nz(mbr == null ? null : mbr.noSecrecyEnvelope()),
                            nz(mbr == null ? null : mbr.multipleBallotsInOneEnvelope()),
                            nz(mbr == null ? null : mbr.envelopeNotSealed()),
                            nz(mbr == null ? null : mbr.noPostmark()),
                            nz(mbr == null ? null : mbr.noResidentAddressOnEnvelope()),
                            nz(mbr == null ? null : mbr.voterDeceased()),
                            nz(mbr == null ? null : mbr.voterAlreadyVoted()),
                            nz(mbr == null ? null : mbr.missingDocumentation()),
                            nz(mbr == null ? null : mbr.voterNotEligible()),
                            nz(mbr == null ? null : mbr.noBallotApplication()));
                })
                .toList();
        return new MailBallotsRejectedTableResponse(
                tableData, MailBallotsRejectedTableResponse.getDefaultMetricLabels());
    }

    /**
     * Get mail ballots rejected chart data aggregated for a FIPS prefix.
     */
    @Cacheable(value = "mailBallotsRejectedChart", key = "#fipsPrefix")
    public MailBallotsRejectedChartResponse getMailBallotsRejectedChart(String fipsPrefix) {
        List<EavsData> data = getFilteredEavsData(fipsPrefix);

        MailBallotsRejectedChartResponse response = RecordAggregator.aggregate(
                data, EavsData::mailBallotsRejectedReason, MailBallotsRejectedChartResponse.class);

        return new MailBallotsRejectedChartResponse(
                response.late(),
                response.missingVoterSignature(),
                response.missingWitnessSignature(),
                response.nonMatchingVoterSignature(),
                response.unofficialEnvelope(),
                response.ballotMissingFromEnvelope(),
                response.noSecrecyEnvelope(),
                response.multipleBallotsInOneEnvelope(),
                response.envelopeNotSealed(),
                response.noPostmark(),
                response.noResidentAddressOnEnvelope(),
                response.voterDeceased(),
                response.voterAlreadyVoted(),
                response.missingDocumentation(),
                response.voterNotEligible(),
                response.noBallotApplication(),
                MailBallotsRejectedChartResponse.getDefaultMetricLabels());
    }

    /**
     * Get voting equipment data for the table (2024 only, aggregated by state).
     */
    @Cacheable(value = "votingEquipmentTable")
    public VotingEquipmentTableResponse getVotingEquipmentTable() {
        // Get all data for year 2024 by filtering (continental US states only - exclude
        // territories and non-continental
        // states)
        List<EavsData> allData = repo.findAllNonUocava();

        List<String> excludedStates = List.of(
                "ALASKA",
                "HAWAII",
                "GUAM",
                "AMERICAN SAMOA",
                "PUERTO RICO",
                "U.S. VIRGIN ISLANDS",
                "NORTHERN MARIANA ISLANDS",
                "DISTRICT OF COLUMBIA");

        List<EavsData> data = allData.stream()
                .filter(record -> record.electionYear() != null && record.electionYear() == 2024)
                .filter(record -> record.stateFull() != null && !excludedStates.contains(record.stateFull()))
                .toList();

        Map<String, VotingEquipmentDTO> stateMap = new HashMap<>();

        for (EavsData record : data) {
            if (record.stateFull() == null || record.equipment() == null) continue;

            String state = record.stateFull();
            Equipment eq = record.equipment();

            stateMap.merge(
                    state,
                    new VotingEquipmentDTO(
                            state,
                            record.fipsCode() != null && record.fipsCode().length() >= 2
                                    ? record.fipsCode().substring(0, 2)
                                    : null,
                            eq.dreNoVVPAT() != null ? eq.dreNoVVPAT() : 0,
                            eq.dreWithVVPAT() != null ? eq.dreWithVVPAT() : 0,
                            eq.ballotMarkingDevice() != null ? eq.ballotMarkingDevice() : 0,
                            eq.scanner() != null ? eq.scanner() : 0),
                    (v1, v2) -> new VotingEquipmentDTO(
                            state,
                            v1.stateFips(),
                            v1.dreNoVVPAT() + v2.dreNoVVPAT(),
                            v1.dreWithVVPAT() + v2.dreWithVVPAT(),
                            v1.ballotMarkingDevice() + v2.ballotMarkingDevice(),
                            v1.scanner() + v2.scanner()));
        }

        List<VotingEquipmentDTO> sortedData = stateMap.values().stream()
                .sorted(Comparator.comparing(VotingEquipmentDTO::state))
                .collect(java.util.stream.Collectors.toList());

        return new VotingEquipmentTableResponse(sortedData, VotingEquipmentTableResponse.getDefaultMetricLabels());
    }

    /**
     * Get voting equipment data for the chart (aggregated by year for a specific
     * state).
     */
    @Cacheable(value = "votingEquipmentChart", key = "#fipsPrefix")
    public VotingEquipmentChartResponse getVotingEquipmentChart(String fipsPrefix) {
        // Query all years and filter by state name
        String stateAbbr = FipsUtil.getStateAbbr(fipsPrefix);
        List<EavsData> data;
        if (stateAbbr != null) {
            data = repo.findByStateAbbrAllYears(stateAbbr);
        } else {
            data = List.of();
        }

        if (data.isEmpty()) {
            return new VotingEquipmentChartResponse(
                    List.of(), VotingEquipmentChartResponse.getDefaultMetricLabels(), "Year", "Quantity");
        }

        Map<Integer, VotingEquipmentYearlyDTO> yearMap = new HashMap<>();

        for (EavsData record : data) {
            if (record.electionYear() == null || record.equipment() == null) continue;

            Integer year = record.electionYear();
            Equipment eq = record.equipment();

            yearMap.merge(
                    year,
                    new VotingEquipmentYearlyDTO(
                            year,
                            eq.dreNoVVPAT() != null ? eq.dreNoVVPAT() : 0,
                            eq.dreWithVVPAT() != null ? eq.dreWithVVPAT() : 0,
                            eq.ballotMarkingDevice() != null ? eq.ballotMarkingDevice() : 0,
                            eq.scanner() != null ? eq.scanner() : 0),
                    (v1, v2) -> new VotingEquipmentYearlyDTO(
                            year,
                            v1.dreNoVVPAT() + v2.dreNoVVPAT(),
                            v1.dreWithVVPAT() + v2.dreWithVVPAT(),
                            v1.ballotMarkingDevice() + v2.ballotMarkingDevice(),
                            v1.scanner() + v2.scanner()));
        }

        List<VotingEquipmentYearlyDTO> sortedData = yearMap.values().stream()
                .sorted(Comparator.comparing(VotingEquipmentYearlyDTO::year))
                .collect(java.util.stream.Collectors.toList());

        return new VotingEquipmentChartResponse(
                sortedData, VotingEquipmentChartResponse.getDefaultMetricLabels(), "Year", "Quantity");
    }

    /**
     * Get voter registration table data for a state FIPS code.
     * Returns county-level party affiliation data.
     */
    @Cacheable(value = "voterRegistrationTable", key = "#stateFips")
    public VoterRegistrationTableResponse getVoterRegistrationTable(String stateFips) {
        var stateData = voterRegRepo.findByStateFips(stateFips);

        if (stateData.isEmpty()) {
            return new VoterRegistrationTableResponse(
                    List.of(), VoterRegistrationTableResponse.getDefaultMetricLabels());
        }

        List<VoterRegistrationTableResponse.Data> tableData = stateData.get().countyVoterRegistrations().stream()
                .map(county -> new VoterRegistrationTableResponse.Data(
                        cleanJurisdictionName(county.countyName()) + " COUNTY",
                        county.totalRegisteredVoters(),
                        county.democraticVoters(),
                        county.republicanVoters(),
                        county.unaffiliatedVoters()))
                .toList();

        return new VoterRegistrationTableResponse(tableData, VoterRegistrationTableResponse.getDefaultMetricLabels());
    }

    /**
     * Hardcoded fix for specific California counties with data mismatches.
     */
    private static String normalizeFips(String fips) {
        if (fips == null) {
            return null;
        }
        // Hardcoded fixes for specific data mismatches
        if ("600100000".equals(fips)) {
            return "0600100000"; // Alameda County
        }
        if ("600900000".equals(fips)) {
            return "0600900000"; // Calaveras County
        }
        return fips;
    }

    /**
     * Get voter registration chart data for a state FIPS prefix.
     * Returns historical voter registration totals (2016, 2020, 2024) by county.
     */
    @Cacheable(value = "voterRegistrationChart", key = "#fipsPrefix")
    public VoterRegistrationChartResponse getVoterRegistrationChart(String fipsPrefix) {
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        String stateAbbr = FipsUtil.getStateAbbr(prefix);
        List<EavsData> data = (stateAbbr != null) ? repo.findByStateAbbrAllYears(stateAbbr) : List.of();

        // Group by NORMALIZED FIPS code
        Map<String, List<EavsData>> groupedByFips = data.stream()
                .filter(record -> {
                    Integer year = record.electionYear();
                    return year != null && (year == 2016 || year == 2020 || year == 2024);
                })
                .filter(record -> record.fipsCode() != null)
                .collect(java.util.stream.Collectors.groupingBy(record -> normalizeFips(record.fipsCode())));

        // Convert to chart response data
        List<VoterRegistrationChartResponse.Data> chartData = groupedByFips.values().stream()
                .map(records -> {
                    // Find name from 2024 record, fallback to first available
                    String name = records.stream()
                            .filter(r -> r.electionYear() == 2024)
                            .findFirst()
                            .map(r -> cleanJurisdictionName(r.jurisdictionName()))
                            .orElse(
                                    records.isEmpty()
                                            ? "Unknown"
                                            : cleanJurisdictionName(
                                                    records.get(0).jurisdictionName()));

                    Map<Integer, Integer> counts = records.stream()
                            .collect(java.util.stream.Collectors.toMap(
                                    EavsData::electionYear,
                                    r -> nz(
                                            r.voterRegistration() == null
                                                    ? null
                                                    : r.voterRegistration().totalRegistered()),
                                    (a, b) -> a));

                    return new VoterRegistrationChartResponse.Data(
                            name,
                            counts.getOrDefault(2016, 0),
                            counts.getOrDefault(2020, 0),
                            counts.getOrDefault(2024, 0));
                })
                .sorted(Comparator.comparingInt(VoterRegistrationChartResponse.Data::registeredVoters2024))
                .toList();

        return new VoterRegistrationChartResponse(
                chartData,
                VoterRegistrationChartResponse.getDefaultMetricLabels(),
                "Counties (Ordered from Smallest to Largest by 2024 Registration)",
                "Number of Registered Voters");
    }

    /**
     * Get CVAP registration rate for an entire state.
     * Calculates percentage registered as: (total registered voters from EAVS 2024
     * / total CVAP) * 100
     */
    @Cacheable(value = "cvapRegistrationRate", key = "#fipsPrefix")
    public CvapRegistrationRateResponse getCvapRegistrationRate(String fipsPrefix) {
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());

        // Get EAVS 2024 data for the state
        List<EavsData> eavsData = getFilteredEavsData(prefix);

        // Get CVAP data for the state
        List<CvapData> rawCvapData = cvapRepo.findByGeoidPrefix("^" + prefix);

        // Filter CVAP by state name
        String expectedState = FipsUtil.getStateName(prefix);
        List<CvapData> cvapDataList;
        if (expectedState != null) {
            cvapDataList = rawCvapData.stream()
                    .filter(d -> d.stateName() != null && d.stateName().equalsIgnoreCase(expectedState))
                    .toList();
        } else {
            cvapDataList = rawCvapData;
        }

        // Create map of geoid -> cvap data for easy lookup
        Map<String, CvapData> cvapMap = new HashMap<>();
        for (CvapData cvap : cvapDataList) {
            cvapMap.put(cvap.geoid(), cvap);
        }

        // Aggregate totals across all counties
        long totalRegisteredVoters = 0;
        long totalCvapEstimate = 0;

        for (EavsData eavs : eavsData) {
            if (eavs.fipsCode() == null || eavs.voterRegistration() == null) continue;

            // Truncate EAVS FIPS code to 5 digits to match CVAP geoid format
            String eavsFips = eavs.fipsCode().length() >= 5 ? eavs.fipsCode().substring(0, 5) : eavs.fipsCode();

            // Match EAVS data with CVAP data by FIPS code
            CvapData cvap = cvapMap.get(eavsFips);
            if (cvap == null) {
                continue;
            }

            if (cvap.totalCvapEstimate() == null || cvap.totalCvapEstimate() == 0) {
                continue;
            }

            Integer registered = eavs.voterRegistration().totalActive();
            if (registered == null || registered == 0) {
                continue;
            }

            totalRegisteredVoters += registered;
            totalCvapEstimate += cvap.totalCvapEstimate();
        }

        // Calculate state-level registration rate
        double rate = 0.0;
        if (totalCvapEstimate > 0) {
            rate = (totalRegisteredVoters / (double) totalCvapEstimate) * 100;
            rate = Math.round(rate * 100.0) / 100.0; // Round to 2 decimal places
        }

        return new CvapRegistrationRateResponse(rate, CvapRegistrationRateResponse.getDefaultLabel());
    }

    /**
     * Get state comparison data for Republican vs Democratic states.
     * Returns comparison table with mail ballots, drop box, turnout, and voter
     * registration.
     */
    @Cacheable(value = "stateComparison", key = "#republicanStateFips + '-' + #democraticStateFips")
    public StateComparisonResponse getStateComparison(String republicanStateFips, String democraticStateFips) {
        // Get data for both states
        var repData = getStateAggregateData(republicanStateFips);
        var demData = getStateAggregateData(democraticStateFips);

        // Get raw values
        long repMailBallots = (Long) repData.get("mailBallots");
        long demMailBallots = (Long) demData.get("mailBallots");
        long repDropBox = (Long) repData.get("dropBox");
        long demDropBox = (Long) demData.get("dropBox");
        long repTotalVotes = (Long) repData.get("totalVotesCast");
        long demTotalVotes = (Long) demData.get("totalVotesCast");
        long repVoterReg = (Long) repData.get("activeRegistration");
        long demVoterReg = (Long) demData.get("activeRegistration");
        long repCvap = (Long) repData.get("totalCvap");
        long demCvap = (Long) demData.get("totalCvap");

        // Calculate percentages
        double repMailPct = repTotalVotes > 0 ? (repMailBallots / (double) repTotalVotes) * 100 : 0;
        double demMailPct = demTotalVotes > 0 ? (demMailBallots / (double) demTotalVotes) * 100 : 0;
        double repDropPct = repTotalVotes > 0 ? (repDropBox / (double) repTotalVotes) * 100 : 0;
        double demDropPct = demTotalVotes > 0 ? (demDropBox / (double) demTotalVotes) * 100 : 0;
        double repVoterRegRate = repCvap > 0 ? (repVoterReg / (double) repCvap) * 100 : 0;
        double demVoterRegRate = demCvap > 0 ? (demVoterReg / (double) demCvap) * 100 : 0;

        // Turnout is already calculated as percentage
        double repTurnout = ((Number) repData.get("turnout")).doubleValue() / 100.0;
        double demTurnout = ((Number) demData.get("turnout")).doubleValue() / 100.0;

        String repFelony = (String) repData.get("felonyVotingRights");
        String demFelony = (String) demData.get("felonyVotingRights");

        // Create rows matching the original mock data structure
        List<StateComparisonRow> rows = List.of(
                new StateComparisonRow(
                        "Felony Voting Rights",
                        repFelony != null ? repFelony : "N/A",
                        demFelony != null ? demFelony : "N/A"),
                new StateComparisonRow(
                        "Mail Ballots (Count)",
                        String.format("%,d", repMailBallots),
                        String.format("%,d", demMailBallots)),
                new StateComparisonRow(
                        "Mail Ballots (%)", String.format("%.1f%%", repMailPct), String.format("%.1f%%", demMailPct)),
                new StateComparisonRow(
                        "Drop Box Ballots (Count)", String.format("%,d", repDropBox), String.format("%,d", demDropBox)),
                new StateComparisonRow(
                        "Drop Box Ballots (%)",
                        String.format("%.1f%%", repDropPct), String.format("%.1f%%", demDropPct)),
                new StateComparisonRow(
                        "Turnout (Count)", String.format("%,d", repTotalVotes), String.format("%,d", demTotalVotes)),
                new StateComparisonRow(
                        "Turnout (%)", String.format("%.1f%%", repTurnout), String.format("%.1f%%", demTurnout)),
                new StateComparisonRow(
                        "Voter Registration (Count)",
                        String.format("%,d", repVoterReg),
                        String.format("%,d", demVoterReg)),
                new StateComparisonRow(
                        "Voter Registration (%)",
                        String.format("%.1f%%", repVoterRegRate), String.format("%.1f%%", demVoterRegRate)));

        return new StateComparisonResponse(rows, (String) repData.get("stateName"), (String) demData.get("stateName"));
    }

    /**
     * Get early voting comparison data for Republican vs Democratic states.
     * Returns comparison table with in-person early voting, mail/absentee voting,
     * and total early voting.
     */
    @Cacheable(value = "earlyVotingComparison", key = "#republicanStateFips + '-' + #democraticStateFips")
    public EarlyVotingComparisonResponse getEarlyVotingComparison(
            String republicanStateFips, String democraticStateFips) {
        // Get data for both states
        var repData = getEarlyVotingAggregateData(republicanStateFips);
        var demData = getEarlyVotingAggregateData(democraticStateFips);

        // Get raw values
        long repInPersonEarly = (Long) repData.get("inPersonEarlyVoting");
        long demInPersonEarly = (Long) demData.get("inPersonEarlyVoting");
        long repMailAbsentee = (Long) repData.get("mailAbsenteeVoting");
        long demMailAbsentee = (Long) demData.get("mailAbsenteeVoting");
        long repTotalBallots = (Long) repData.get("totalBallots");
        long demTotalBallots = (Long) demData.get("totalBallots");

        // Calculate totals
        long repTotalEarlyVoting = repInPersonEarly + repMailAbsentee;
        long demTotalEarlyVoting = demInPersonEarly + demMailAbsentee;

        // Calculate percentages
        double repInPersonPct = repTotalBallots > 0 ? (repInPersonEarly / (double) repTotalBallots) * 100 : 0;
        double demInPersonPct = demTotalBallots > 0 ? (demInPersonEarly / (double) demTotalBallots) * 100 : 0;
        double repMailPct = repTotalBallots > 0 ? (repMailAbsentee / (double) repTotalBallots) * 100 : 0;
        double demMailPct = demTotalBallots > 0 ? (demMailAbsentee / (double) demTotalBallots) * 100 : 0;
        double repTotalEarlyPct = repTotalBallots > 0 ? (repTotalEarlyVoting / (double) repTotalBallots) * 100 : 0;
        double demTotalEarlyPct = demTotalBallots > 0 ? (demTotalEarlyVoting / (double) demTotalBallots) * 100 : 0;

        // Create rows
        List<EarlyVotingComparisonRow> rows = List.of(
                new EarlyVotingComparisonRow(
                        "In-Person Early Voting (Count)",
                        String.format("%,d", repInPersonEarly),
                        String.format("%,d", demInPersonEarly)),
                new EarlyVotingComparisonRow(
                        "In-Person Early Voting (%)",
                        String.format("%.1f%%", repInPersonPct), String.format("%.1f%%", demInPersonPct)),
                new EarlyVotingComparisonRow(
                        "Mail/Absentee Voting (Count)",
                        String.format("%,d", repMailAbsentee),
                        String.format("%,d", demMailAbsentee)),
                new EarlyVotingComparisonRow(
                        "Mail/Absentee Voting (%)",
                        String.format("%.1f%%", repMailPct), String.format("%.1f%%", demMailPct)),
                new EarlyVotingComparisonRow(
                        "Total Early Voting (Count)",
                        String.format("%,d", repTotalEarlyVoting),
                        String.format("%,d", demTotalEarlyVoting)),
                new EarlyVotingComparisonRow(
                        "Total Early Voting (%)",
                        String.format("%.1f%%", repTotalEarlyPct), String.format("%.1f%%", demTotalEarlyPct)));

        return new EarlyVotingComparisonResponse(
                rows, (String) repData.get("stateName"), (String) demData.get("stateName"));
    }

    /**
     * Get comparison data for Opt-in vs Opt-out states.
     */
    @Cacheable(
            value = "optInOptOutComparison",
            key = "#optInFips + '-' + #optOutSameDayFips + '-' + #optOutNoSameDayFips")
    public OptInOptOutComparisonResponse getOptInOptOutComparison(
            String optInFips, String optOutSameDayFips, String optOutNoSameDayFips) {
        var optInData = getStateAggregateData(optInFips);
        var optOutSameDayData = getStateAggregateData(optOutSameDayFips);
        var optOutNoSameDayData = getStateAggregateData(optOutNoSameDayFips);

        // Helper to extract values
        long optInReg = (long) optInData.getOrDefault("voterRegistration", 0L);
        long optInActive = (long) optInData.getOrDefault("activeRegistration", 0L);
        long optInCvap = (long) optInData.getOrDefault("totalCvap", 0L);
        long optInVotes = (long) optInData.getOrDefault("totalVotesCast", 0L);
        long optInTurnout = (long) optInData.getOrDefault("turnout", 0L);

        long optOutSameDayReg = (long) optOutSameDayData.getOrDefault("voterRegistration", 0L);
        long optOutSameDayActive = (long) optOutSameDayData.getOrDefault("activeRegistration", 0L);
        long optOutSameDayCvap = (long) optOutSameDayData.getOrDefault("totalCvap", 0L);
        long optOutSameDayVotes = (long) optOutSameDayData.getOrDefault("totalVotesCast", 0L);
        long optOutSameDayTurnout = (long) optOutSameDayData.getOrDefault("turnout", 0L);

        long optOutNoSameDayReg = (long) optOutNoSameDayData.getOrDefault("voterRegistration", 0L);
        long optOutNoSameDayActive = (long) optOutNoSameDayData.getOrDefault("activeRegistration", 0L);
        long optOutNoSameDayCvap = (long) optOutNoSameDayData.getOrDefault("totalCvap", 0L);
        long optOutNoSameDayVotes = (long) optOutNoSameDayData.getOrDefault("totalVotesCast", 0L);
        long optOutNoSameDayTurnout = (long) optOutNoSameDayData.getOrDefault("turnout", 0L);

        // Calculate percentages
        double optInActivePct = optInCvap > 0 ? (optInActive / (double) optInCvap) * 100 : 0;
        double optOutSameDayActivePct =
                optOutSameDayCvap > 0 ? (optOutSameDayActive / (double) optOutSameDayCvap) * 100 : 0;
        double optOutNoSameDayActivePct =
                optOutNoSameDayCvap > 0 ? (optOutNoSameDayActive / (double) optOutNoSameDayCvap) * 100 : 0;

        List<OptInOptOutComparisonRow> rows = List.of(
                new OptInOptOutComparisonRow(
                        "Voter Registration (Count)",
                        String.format("%,d", optInReg),
                        String.format("%,d", optOutSameDayReg),
                        String.format("%,d", optOutNoSameDayReg)),
                new OptInOptOutComparisonRow(
                        "Voter Registration (%)",
                        String.format("%.1f%%", optInActivePct),
                        String.format("%.1f%%", optOutSameDayActivePct),
                        String.format("%.1f%%", optOutNoSameDayActivePct)),
                new OptInOptOutComparisonRow(
                        "Turnout (Votes)",
                        String.format("%,d", optInVotes),
                        String.format("%,d", optOutSameDayVotes),
                        String.format("%,d", optOutNoSameDayVotes)),
                new OptInOptOutComparisonRow(
                        "Turnout (%)",
                        String.format("%.1f%%", optInTurnout / 100.0),
                        String.format("%.1f%%", optOutSameDayTurnout / 100.0),
                        String.format("%.1f%%", optOutNoSameDayTurnout / 100.0)));

        return new OptInOptOutComparisonResponse(
                rows, (String) optInData.get("stateName"), (String) optOutSameDayData.get("stateName"), (String)
                        optOutNoSameDayData.get("stateName"));
    }

    /**
     * Get drop box voting data for a state FIPS prefix.
     */
    @Cacheable(value = "dropBoxVotingData", key = "#fipsPrefix")
    public List<DropBoxVotingData> getDropBoxVotingData(String fipsPrefix) {

        List<CountyVoteSplit> countySplits = countyVoteSplitRepo.findByStateFips(fipsPrefix);
        List<EavsData> eavsData = getFilteredEavsData(fipsPrefix);

        // Create a map of EavsData by normalized jurisdiction name
        Map<String, EavsData> eavsMap = eavsData.stream()
                .collect(java.util.stream.Collectors.toMap(
                        d -> cleanJurisdictionName(d.jurisdictionName())
                                .toUpperCase()
                                .replace(" COUNTY", "")
                                .trim(),
                        d -> d,
                        (a, b) -> a // Merge function if duplicates
                        ));

        List<DropBoxVotingData> result = new java.util.ArrayList<>();

        for (CountyVoteSplit split : countySplits) {
            String normalizedName =
                    split.countyName().toUpperCase().replace(" COUNTY", "").trim();
            EavsData eavs = eavsMap.get(normalizedName);

            if (eavs != null) {
                int totalDropBoxVotes = nz(eavs.dropBoxesTotal());
                int totalBallots = nz(eavs.totalBallots());

                Double dropBoxPercentage = totalBallots > 0 ? (totalDropBoxVotes / (double) totalBallots) * 100 : 0.0;

                String dominantParty = (split.republicanVotes() != null
                                && split.democraticVotes() != null
                                && split.republicanVotes() > split.democraticVotes())
                        ? "republican"
                        : "democratic";

                result.add(new DropBoxVotingData(
                        split.countyName(),
                        totalDropBoxVotes,
                        split.republicanVotes(),
                        split.democraticVotes(),
                        totalBallots,
                        split.republicanPercentage(),
                        split.democraticPercentage(),
                        dropBoxPercentage,
                        dominantParty));
            }
        }
        return result;
    }

    private Map<String, Object> getEarlyVotingAggregateData(String stateFips) {
        Map<String, Object> result = new HashMap<>();

        // Get EAVS data for the state
        List<EavsData> rawEavsData = fetchEavsData(stateFips);
        List<EavsData> eavsData = filterByState(rawEavsData, stateFips);

        long inPersonEarlyVoting = 0;
        long mailAbsenteeVoting = 0;
        long totalBallots = 0;
        String stateName = "Unknown";

        for (EavsData eavs : eavsData) {
            if (eavs.stateFull() != null && stateName.equals("Unknown")) {
                stateName = eavs.stateFull();
            }

            // In-Person Early Voting (F1f)
            if (eavs.inPersonEarlyVoting() != null) {
                inPersonEarlyVoting += nz(eavs.inPersonEarlyVoting());
            }

            // Mail/Absentee Voting (F1d or F1g - use mailCountedTotal which is F1d)
            if (eavs.mailCountedTotal() != null) {
                mailAbsenteeVoting += nz(eavs.mailCountedTotal());
            }

            // Total Ballots
            if (eavs.totalBallots() != null) {
                totalBallots += nz(eavs.totalBallots());
            }
        }

        result.put("inPersonEarlyVoting", inPersonEarlyVoting);
        result.put("mailAbsenteeVoting", mailAbsenteeVoting);
        result.put("totalBallots", totalBallots);
        result.put("stateName", stateName);

        return result;
    }

    /**
     * Helper method to aggregate state-level data from EAVS and CVAP for state
     * comparison
     */
    private Map<String, Object> getStateAggregateData(String stateFips) {
        Map<String, Object> result = new HashMap<>();

        // Get EAVS data for the state
        List<EavsData> rawEavsData = fetchEavsData(stateFips);
        List<EavsData> eavsData = filterByState(rawEavsData, stateFips);

        // Get CVAP data for the state
        List<CvapData> rawCvapData = cvapRepo.findByGeoidPrefix("^" + stateFips);

        // Filter CVAP by state name
        String expectedState = FipsUtil.getStateName(stateFips);
        List<CvapData> cvapDataList;
        if (expectedState != null) {
            cvapDataList = rawCvapData.stream()
                    .filter(d -> d.stateName() != null && d.stateName().equalsIgnoreCase(expectedState))
                    .toList();
        } else {
            cvapDataList = rawCvapData;
        }

        // Get felony voting rights
        var felonyData = felonyVotingRepo.findByStateFips(stateFips);
        result.put(
                "felonyVotingRights",
                felonyData.map(FelonyVoting::felonyVotingRights).orElse("N/A"));

        // Aggregate metrics
        long totalMailBallots = 0;
        long totalDropBox = 0;
        long totalVotesCast = 0;
        long totalRegistered = 0;
        long totalActive = 0;
        long totalCvap = 0;
        String stateName = "Unknown";

        for (EavsData eavs : eavsData) {
            if (eavs.stateFull() != null && stateName.equals("Unknown")) {
                stateName = eavs.stateFull();
            }

            // Mail ballots (C8a) - use mailBallotsReturned field (counted ballots, not
            // transmitted)
            if (eavs.mailBallotsReturned() != null) {
                totalMailBallots += nz(eavs.mailBallotsReturned());
            }

            // Drop box ballots (C6a) - Total mail ballots returned via drop box
            if (eavs.dropBoxesTotal() != null) {
                totalDropBox += nz(eavs.dropBoxesTotal());
            }

            // Total votes cast (F1a) - use totalBallots field
            if (eavs.totalBallots() != null) {
                totalVotesCast += nz(eavs.totalBallots());
            }

            // Voter registration (A1a) and Active (A1b)
            if (eavs.voterRegistration() != null) {
                if (eavs.voterRegistration().totalRegistered() != null) {
                    totalRegistered += nz(eavs.voterRegistration().totalRegistered());
                }
                if (eavs.voterRegistration().totalActive() != null) {
                    totalActive += nz(eavs.voterRegistration().totalActive());
                }
            }
        }

        // Aggregate CVAP
        for (CvapData cvap : cvapDataList) {
            if (cvap.totalCvapEstimate() != null) {
                totalCvap += cvap.totalCvapEstimate();
            }
        }

        // Calculate turnout percentage (F1a / CVAP_est * 100)
        double turnout = totalCvap > 0 ? (totalVotesCast / (double) totalCvap) * 100 * 100 : 0;
        turnout = Math.round(turnout) / 100.0;

        result.put("mailBallots", totalMailBallots);
        result.put("dropBox", totalDropBox);
        result.put("totalVotesCast", totalVotesCast);
        result.put("turnout", (long) (turnout * 100)); // Store as basis points for formatting
        result.put("voterRegistration", totalRegistered);
        result.put("activeRegistration", totalActive);
        result.put("totalCvap", totalCvap);
        result.put("stateName", stateName);

        return result;
    }

    /**
     * Get list of registered voters for a specific Florida county.
     * Filters for DEM/REP and formats party names.
     */
    public FloridaVotersResponse getFloridaVoters(
            String countyName, String party, org.springframework.data.domain.Pageable pageable) {
        List<String> partiesToFilter;
        if ("Republican".equalsIgnoreCase(party)) {
            partiesToFilter = List.of("REP");
        } else if ("Democrat".equalsIgnoreCase(party)) {
            partiesToFilter = List.of("DEM");
        } else {
            partiesToFilter = List.of("DEM", "REP");
        }

        org.springframework.data.domain.Page<Voter> voterPage =
                voterRepo.findByCountyNameAndPartyInAndNameRegex(countyName, partiesToFilter, "^[a-zA-Z]", pageable);

        List<FloridaVoterDTO> filteredVoters = voterPage.stream()
                .map(v -> {
                    String partyName = "DEM".equals(v.party()) ? "Democrat" : "Republican";
                    return new FloridaVoterDTO(v.name().toUpperCase(), partyName);
                })
                .toList();

        List<String> metricLabels = List.of("Name", "Party");
        return new FloridaVotersResponse(
                metricLabels, filteredVoters, voterPage.getTotalPages(), voterPage.getTotalElements());
    }
}
