package edu.sbu.cse416.app.service;

import edu.sbu.cse416.app.dto.ProvisionalChartResponse;
import edu.sbu.cse416.app.dto.ProvisionalTableData;
import edu.sbu.cse416.app.dto.ProvisionalTableResponse;
import edu.sbu.cse416.app.model.EavsData;
import edu.sbu.cse416.app.model.ProvisionalBallots;
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
     * Get provisional ballot table data for a FIPS prefix.
     */
    @Cacheable(value = "provisionalTable", key = "#fipsPrefix")
    public List<ProvisionalTableResponse> getProvisionalTable(String fipsPrefix) {
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        List<EavsData> data = repo.findByFipsCode("^0*" + prefix);
        return data.stream()
                .map(record -> {
                    ProvisionalBallots p = record.provisionalBallots();
                    return new ProvisionalTableResponse(
                            new ProvisionalTableData(
                                    record.jurisdictionName(),
                                    nz(p == null ? null : p.totalProv()),
                                    nz(p == null ? null : p.provCountFullyCounted()),
                                    nz(p == null ? null : p.provCountPartialCounted()),
                                    nz(p == null ? null : p.provRejected()),
                                    nz(p == null ? null : p.provisionalOtherStatus())
                                    ),
                            ProvisionalTableResponse.getDefaultMetricLabels());
                })
                .toList();
    }

    /**
     * Get provisional ballot chart data aggregated by reason for a FIPS prefix.
     */
    @Cacheable(value = "provisionalChart", key = "#fipsPrefix")
    public ProvisionalChartResponse getProvisionalChart(String fipsPrefix) {
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        List<EavsData> data = repo.findByFipsCode("0*" + prefix);

        ProvisionalChartResponse response = RecordAggregator.aggregate(data, EavsData::provisionalBallots, ProvisionalChartResponse.class);

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
                ProvisionalChartResponse.getDefaultMetricLabels()
        );
    }
}












