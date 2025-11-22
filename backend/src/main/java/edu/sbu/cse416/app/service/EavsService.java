package edu.sbu.cse416.app.service;

import edu.sbu.cse416.app.dto.activevoters.ActiveVotersChartResponse;
import edu.sbu.cse416.app.dto.activevoters.ActiveVotersTableResponse;
import edu.sbu.cse416.app.dto.mailballots.MailBallotsRejectedChartResponse;
import edu.sbu.cse416.app.dto.mailballots.MailBallotsRejectedTableResponse;
import edu.sbu.cse416.app.dto.pollbook.PollbookDeletionsChartResponse;
import edu.sbu.cse416.app.dto.provisional.ProvisionalChartResponse;
import edu.sbu.cse416.app.dto.provisional.ProvisionalTableResponse;
import edu.sbu.cse416.app.model.eavs.EavsData;
import edu.sbu.cse416.app.model.eavs.MailBallotsRejectedReason;
import edu.sbu.cse416.app.model.eavs.ProvisionalBallots;
import edu.sbu.cse416.app.model.eavs.VoterDeletion;
import edu.sbu.cse416.app.model.eavs.VoterRegistration;
import edu.sbu.cse416.app.repository.EavsDataRepository;
import edu.sbu.cse416.app.util.RecordAggregator;
import java.util.List;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class EavsService {

    private final EavsDataRepository repo;

    public EavsService(EavsDataRepository repo) {
        this.repo = repo;
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

        MailBallotsRejectedChartResponse response =
                RecordAggregator.aggregate(data, EavsData::mailBallotsRejectedReason, MailBallotsRejectedChartResponse.class);

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
}
