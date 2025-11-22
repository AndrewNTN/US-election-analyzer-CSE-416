package edu.sbu.cse416.app.service;

import edu.sbu.cse416.app.dto.activevoters.ActiveVotersChartResponse;
import edu.sbu.cse416.app.dto.activevoters.ActiveVotersTableResponse;
import edu.sbu.cse416.app.dto.mailballots.MailBallotsRejectedChartResponse;
import edu.sbu.cse416.app.dto.mailballots.MailBallotsRejectedTableResponse;
import edu.sbu.cse416.app.dto.pollbook.PollbookDeletionsChartResponse;
import edu.sbu.cse416.app.dto.provisional.ProvisionalChartResponse;
import edu.sbu.cse416.app.dto.provisional.ProvisionalTableResponse;
import edu.sbu.cse416.app.dto.voterregistration.VoterRegistrationChartResponse;
import edu.sbu.cse416.app.dto.voterregistration.VoterRegistrationTableResponse;
import edu.sbu.cse416.app.dto.votingequipment.VotingEquipmentChartResponse;
import edu.sbu.cse416.app.dto.votingequipment.VotingEquipmentDTO;
import edu.sbu.cse416.app.dto.votingequipment.VotingEquipmentTableResponse;
import edu.sbu.cse416.app.dto.votingequipment.VotingEquipmentYearlyDTO;
import edu.sbu.cse416.app.model.eavs.*;
import edu.sbu.cse416.app.repository.EavsDataRepository;
import edu.sbu.cse416.app.repository.StateVoterRegistrationRepository;
import edu.sbu.cse416.app.util.RecordAggregator;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EavsService {

    private final EavsDataRepository repo;
    private final StateVoterRegistrationRepository voterRegRepo;

    public EavsService(EavsDataRepository repo, StateVoterRegistrationRepository voterRegRepo) {
        this.repo = repo;
        this.voterRegRepo = voterRegRepo;
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
     * Get provisional ballot table data for a FIPS prefix.
     */
    @Cacheable(value = "provisionalTable", key = "#fipsPrefix")
    public ProvisionalTableResponse getProvisionalTable(String fipsPrefix) {
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        List<EavsData> data = repo.findByFipsCode("^" + prefix);
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
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        List<EavsData> data = repo.findByFipsCode("^" + prefix);

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
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        List<EavsData> data = repo.findByFipsCode("^" + prefix);
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
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        List<EavsData> data = repo.findByFipsCode("^" + prefix);

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
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        List<EavsData> data = repo.findByFipsCode("^" + prefix);

        PollbookDeletionsChartResponse response =
                RecordAggregator.aggregate(data, EavsData::voterDeletion, PollbookDeletionsChartResponse.class);

        return new PollbookDeletionsChartResponse(
                response.removedTotal(),
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
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        List<EavsData> data = repo.findByFipsCode("^" + prefix);
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
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        List<EavsData> data = repo.findByFipsCode("^" + prefix);

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
        // Get all data for year 2024 by filtering (continental US states only - exclude territories and non-continental states)
        List<EavsData> allData = repo.findByFipsCodeAllYears("^");
        
        List<String> excludedStates = List.of(
            "ALASKA", "HAWAII", "GUAM", "AMERICAN SAMOA", "PUERTO RICO", 
            "U.S. VIRGIN ISLANDS", "NORTHERN MARIANA ISLANDS", "DISTRICT OF COLUMBIA"
        );
        
        List<EavsData> data = allData.stream()
            .filter(record -> record.electionYear() != null && record.electionYear() == 2024)
            .filter(record -> record.stateFull() != null && 
                              !excludedStates.contains(record.stateFull()))
            .toList();

        Map<String, VotingEquipmentDTO> stateMap = new HashMap<>();

        for (EavsData record : data) {
            if (record.stateFull() == null || record.equipment() == null) continue;

            String state = record.stateFull();
            Equipment eq = record.equipment();

            stateMap.merge(state, new VotingEquipmentDTO(
                state,
                eq.dreNoVVPAT() != null ? eq.dreNoVVPAT() : 0,
                eq.dreWithVVPAT() != null ? eq.dreWithVVPAT() : 0,
                eq.ballotMarkingDevice() != null ? eq.ballotMarkingDevice() : 0,
                eq.scanner() != null ? eq.scanner() : 0
            ), (v1, v2) -> new VotingEquipmentDTO(
                state,
                v1.dreNoVVPAT() + v2.dreNoVVPAT(),
                v1.dreWithVVPAT() + v2.dreWithVVPAT(),
                v1.ballotMarkingDevice() + v2.ballotMarkingDevice(),
                v1.scanner() + v2.scanner()
            ));
        }

        List<VotingEquipmentDTO> sortedData = stateMap.values().stream()
            .sorted(Comparator.comparing(VotingEquipmentDTO::state))
            .collect(java.util.stream.Collectors.toList());

        return new VotingEquipmentTableResponse(sortedData, VotingEquipmentTableResponse.getDefaultMetricLabels());
    }

    /**
     * Get voting equipment data for the chart (aggregated by year for a specific state).
     */
    @Cacheable(value = "votingEquipmentChart", key = "#stateName")
    public VotingEquipmentChartResponse getVotingEquipmentChart(String stateName) {
        // Query all years and filter by state name
        List<EavsData> allData = repo.findByFipsCodeAllYears("^");
        List<EavsData> data = allData.stream()
            .filter(record -> record.stateFull() != null && 
                              record.stateFull().equalsIgnoreCase(stateName))
            .toList();

        if (data.isEmpty()) {
            return new VotingEquipmentChartResponse(
                List.of(),
                VotingEquipmentChartResponse.getDefaultMetricLabels(),
                "Year",
                "Quantity");
        }

        Map<Integer, VotingEquipmentYearlyDTO> yearMap = new HashMap<>();

        for (EavsData record : data) {
            if (record.electionYear() == null || record.equipment() == null) continue;

            Integer year = record.electionYear();
            Equipment eq = record.equipment();

            yearMap.merge(year, new VotingEquipmentYearlyDTO(
                year,
                eq.dreNoVVPAT() != null ? eq.dreNoVVPAT() : 0,
                eq.dreWithVVPAT() != null ? eq.dreWithVVPAT() : 0,
                eq.ballotMarkingDevice() != null ? eq.ballotMarkingDevice() : 0,
                eq.scanner() != null ? eq.scanner() : 0
            ), (v1, v2) -> new VotingEquipmentYearlyDTO(
                year,
                v1.dreNoVVPAT() + v2.dreNoVVPAT(),
                v1.dreWithVVPAT() + v2.dreWithVVPAT(),
                v1.ballotMarkingDevice() + v2.ballotMarkingDevice(),
                v1.scanner() + v2.scanner()
            ));
        }

        List<VotingEquipmentYearlyDTO> sortedData = yearMap.values().stream()
            .sorted(Comparator.comparing(VotingEquipmentYearlyDTO::year))
            .collect(java.util.stream.Collectors.toList());

        return new VotingEquipmentChartResponse(
            sortedData,
            VotingEquipmentChartResponse.getDefaultMetricLabels(),
            "Year",
            "Quantity");
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
                        cleanJurisdictionName(county.countyName()),
                        county.totalRegisteredVoters(),
                        county.democraticVoters(),
                        county.republicanVoters(),
                        county.unaffiliatedVoters()))
                .toList();

        return new VoterRegistrationTableResponse(tableData, VoterRegistrationTableResponse.getDefaultMetricLabels());
    }

    /**
     * Get voter registration chart data for a state FIPS prefix.
     * Returns historical voter registration totals (2016, 2020, 2024) by county.
     */
    @Cacheable(value = "voterRegistrationChart", key = "#fipsPrefix")
    public VoterRegistrationChartResponse getVoterRegistrationChart(String fipsPrefix) {
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        List<EavsData> data = repo.findByFipsCodeAllYears("^" + prefix);

        // Filter and group by jurisdiction, then pivot years into separate fields
        Map<String, Map<Integer, Integer>> jurisdictionData = data.stream()
                .filter(record -> {
                    Integer year = record.electionYear();
                    return year != null && (year == 2016 || year == 2020 || year == 2024);
                })
                .collect(java.util.stream.Collectors.groupingBy(
                        record -> cleanJurisdictionName(record.jurisdictionName()),
                        java.util.stream.Collectors.toMap(
                                EavsData::electionYear,
                                record -> {
                                    VoterRegistration vr = record.voterRegistration();
                                    Integer total = nz(vr == null ? null : vr.totalRegistered());
                                    Integer currentYear = record.electionYear();
                                    return total;
                                },
                                (existing, replacement) -> existing // In case of duplicates, keep first
                                )));

        // Convert to chart response data and sort by 2024 registration count
        List<VoterRegistrationChartResponse.Data> chartData = jurisdictionData.entrySet().stream()
                .map(entry -> new VoterRegistrationChartResponse.Data(
                        entry.getKey(),
                        entry.getValue().getOrDefault(2016, 0),
                        entry.getValue().getOrDefault(2020, 0),
                        entry.getValue().getOrDefault(2024, 0)))
                .sorted((a, b) -> Integer.compare(a.registeredVoters2024(), b.registeredVoters2024()))
                .toList();

        return new VoterRegistrationChartResponse(
                chartData,
                VoterRegistrationChartResponse.getDefaultMetricLabels(),
                "Counties (Ordered from Smallest to Largest by 2024 Registration)",
                "Number of Registered Voters");
    }
}
