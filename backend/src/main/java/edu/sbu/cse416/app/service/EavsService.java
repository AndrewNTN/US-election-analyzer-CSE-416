package edu.sbu.cse416.app.service;

import edu.sbu.cse416.app.dto.ProvisionalStateTableMetrics;
import edu.sbu.cse416.app.dto.ProvisionalStateTableResponse;
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

    /** Helper to normalize and anchor FIPS regex. */
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

    /** Null-safe helper. */
    private static int nz(Integer v) { return v == null ? 0 : v; }

    /** Generic aggregator for any set of ProvisionalBallots integer fields. */
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

    /** Aggregation for E2a–E2i + Other (E2j+E2k+E2l). */
    @Cacheable(value = "provisionalAggregates", key = "#fipsPrefix")
    public Map<String, Integer> getCachedAggregateProvisionalReasons(String fipsPrefix) {
        List<EavsData> rows = findByFipsPrefix(fipsPrefix, false);
        return aggregateProvisionalReasons(rows);
    }

    /** Core aggregation logic. */
    public Map<String, Integer> aggregateProvisionalReasons(List<EavsData> rows) {
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
        return sumProvisionalFields(rows, fields);
    }

    /** Generate per-record DTOs for table view. */
    public List<ProvisionalStateTableResponse> getProvisionalStateTable(String fipsPrefix) {
        List<EavsData> data = findByFipsPrefix(fipsPrefix, true);
        return data.stream().map(record -> {
            var p = record.provisionalBallots();
            if (p == null) {
                return new ProvisionalStateTableResponse(
                        record.jurisdictionName(),
                        record.stateAbbr(),
                        new ProvisionalStateTableMetrics(0, 0, 0, 0, 0, null)
                );
            }
            return new ProvisionalStateTableResponse(
                    record.jurisdictionName(),
                    record.stateAbbr(),
                    new ProvisionalStateTableMetrics(
                            nz(p.totalProv()),
                            nz(p.provCountFullyCounted()),
                            nz(p.provCountPartialCounted()),
                            nz(p.provRejected()),
                            nz(p.provisionalOtherStatus()),
                            null
                    )
            );
        }).toList();
    }

    /** Manual cache clear (optional). */
    @CacheEvict(value = { "provisionalByFips", "provisionalAggregates" }, allEntries = true)
    public void clearCaches() {}
}
