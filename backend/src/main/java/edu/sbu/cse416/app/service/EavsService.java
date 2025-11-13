package edu.sbu.cse416.app.service;

import edu.sbu.cse416.app.dto.ProvisionalStateTableDto;
import edu.sbu.cse416.app.dto.ProvisionalChartDto;
import edu.sbu.cse416.app.model.EavsData;
import edu.sbu.cse416.app.model.ProvisionalBallots;
import edu.sbu.cse416.app.repository.EavsDataRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.ToIntFunction;

@Service
public class EavsService {

    private final EavsDataRepository repo;

    public EavsService(EavsDataRepository repo) {
        this.repo = repo;
    }

    private static int nz(Integer v) { return v == null ? 0 : v; }

    private String buildFipsRegex(String fipsPrefix, boolean anchorStart) {
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        return (anchorStart ? "^" : "") + "0*" + prefix;
    }

    /** Fetch rows by FIPS prefix. */
    @Cacheable(value = "provisionalByFips", key = "#fipsPrefix + '-' + #anchorStart")
    public List<EavsData> findByFipsPrefix(String fipsPrefix, boolean anchorStart) {
        String regex = buildFipsRegex(fipsPrefix, anchorStart);
        return repo.findByFipsCode(regex);
    }

    /** Build DTO list for table view. */
    public List<ProvisionalStateTableDto> getProvisionalStateTable(String fipsPrefix) {
        List<EavsData> data = findByFipsPrefix(fipsPrefix, true);
        return data.stream().map(record -> {
            ProvisionalBallots p = record.provisionalBallots();
            return new ProvisionalStateTableDto(
                    record.jurisdictionName(),
                    record.stateAbbr(),
                    nz(p == null ? null : p.totalProv()),
                    nz(p == null ? null : p.provCountFullyCounted()),
                    nz(p == null ? null : p.provCountPartialCounted()),
                    nz(p == null ? null : p.provRejected()),
                    nz(p == null ? null : p.provisionalOtherStatus()),
                    null
            );
        }).toList();
    }

    /** Generic aggregator for any ProvisionalBallots integer fields. */
    private Map<String, Integer> sumProvisionalFields(
            List<EavsData> rows,
            LinkedHashMap<String, ToIntFunction<ProvisionalBallots>> fields
    ) {
        Map<String, Integer> totals = new LinkedHashMap<>();
        fields.keySet().forEach(k -> totals.put(k, 0));

        for (EavsData row : rows) {
            ProvisionalBallots pb = row.provisionalBallots();
            if (pb == null) continue;
            for (var e : fields.entrySet()) {
                int val = e.getValue().applyAsInt(pb);
                totals.put(e.getKey(), totals.get(e.getKey()) + val);
            }
        }
        return totals;
    }

    /** Aggregation for chart reasons (E2a–E2i + Other). */
    @Cacheable(value = "provisionalAggregates", key = "#fipsPrefix")
    public ProvisionalChartDto getCachedAggregateProvisionalReasons(String fipsPrefix) {
        List<EavsData> rows = findByFipsPrefix(fipsPrefix, false);
        LinkedHashMap<String, ToIntFunction<ProvisionalBallots>> fields = new LinkedHashMap<>();
        fields.put("E2a", pb -> nz(pb.provReasonVoterNotOnList()));
        fields.put("E2b", pb -> nz(pb.provReasonVoterLackedID()));
        fields.put("E2c", pb -> nz(pb.provReasonElectionOfficialChallengedEligibility()));
        fields.put("E2d", pb -> nz(pb.provReasonAnotherPersonChallengedEligibility()));
        fields.put("E2e", pb -> nz(pb.provReasonVoterNotResident()));
        fields.put("E2f", pb -> nz(pb.provReasonVoterRegistrationNotUpdated()));
        fields.put("E2g", pb -> nz(pb.provReasonVoterDidNotSurrenderMailBallot()));
        fields.put("E2h", pb -> nz(pb.provReasonJudgeExtendedVotingHours()));
        fields.put("E2i", pb -> nz(pb.provReasonVoterUsedSDR()));
        fields.put("Other", pb -> nz(pb.provReasonOtherSum()));

        Map<String, Integer> totals = sumProvisionalFields(rows, fields);
        return new ProvisionalChartDto(fipsPrefix, totals);
    }

    @CacheEvict(value = { "provisionalByFips", "provisionalAggregates" }, allEntries = true)
    public void clearCaches() {}
}
