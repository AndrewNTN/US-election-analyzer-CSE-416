package edu.sbu.cse416.app.service;

import edu.sbu.cse416.app.model.EavsData;
import edu.sbu.cse416.app.model.ProvisionalBallots;
import edu.sbu.cse416.app.repository.EavsDataRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.ToIntFunction;
import org.springframework.stereotype.Service;

@Service
public class EavsService {

    private final EavsDataRepository repo;

    public EavsService(EavsDataRepository repo) {
        this.repo = repo;
    }

    /** Fetch rows by FIPS prefix with optional anchoring and standard 0* normalization. */
    public List<EavsData> findByFipsPrefix(String fipsPrefix, Integer electionYear, boolean anchorStart) {
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        String regex = (anchorStart ? "^" : "") + "0*" + prefix;
        return repo.findByFipsCodeRegexAndElectionYear(regex, electionYear);
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

    /** Aggregation for E2a–E2i + Other (E2j+E2k+E2l) used by the bar chart/table. */
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

    /** Example: if you need a general-purpose “sum over rows” for any field in EavsData. */
    public int sum(List<EavsData> rows, java.util.function.ToIntFunction<EavsData> getter) {
        int total = 0;
        for (EavsData row : rows) total += getter.applyAsInt(row);
        return total;
    }
}
