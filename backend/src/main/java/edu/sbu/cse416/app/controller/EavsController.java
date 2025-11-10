package edu.sbu.cse416.app.controller;

import edu.sbu.cse416.app.model.EavsData;
import edu.sbu.cse416.app.repository.EavsDataRepository;
import edu.sbu.cse416.app.service.EavsAggregationService;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/eavs")
public class EavsController {

    private final EavsAggregationService aggregationService;
    private final EavsDataRepository eavsRepository;

    public EavsController(EavsAggregationService aggregationService, EavsDataRepository eavsRepository) {
        this.aggregationService = aggregationService;
        this.eavsRepository = eavsRepository;
    }

    // Simple helper to avoid null checks everywhere
    private static int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    // Matches the shape of ProvisionalBallotsApiResponse.provisionalBallots in the frontend
    public record ProvisionalStateMetrics(
            Integer E1a,
            Integer E1b,
            Integer E1c,
            Integer E1d,
            Integer E1e,
            String E1e_Other
    ) {}

    // Matches ProvisionalBallotsApiResponse rows the table expects
    public record ProvisionalStateResponse(
            String jurisdictionName,
            String stateAbbr,
            ProvisionalStateMetrics provisionalBallots
    ) {}


    @GetMapping("/api/eavs/states")
    public ResponseEntity<List<Object>> getAllStatesPlaceholder() {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/provisional/state/{fipsPrefix}")
    public ResponseEntity<List<ProvisionalStateResponse>> getProvisionalByStateFipsPrefix(
            @PathVariable String fipsPrefix,
            @RequestParam(defaultValue = "2024") Integer electionYear) {

        fipsPrefix = fipsPrefix.trim();
        // anchor at start so "01" doesn't accidentally match weird places
        String regex = "^0*" + fipsPrefix;
        System.out.println("🔍 Querying for FIPS regex: " + regex);

        List<EavsData> data = eavsRepository.findByFipsCodeRegexAndElectionYear(regex, electionYear);

        if (data.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<ProvisionalStateResponse> response = data.stream()
                .map(record -> {
                    var p = record.provisionalBallots();

                    // If no provisional data, just return zeros so the table code stays simple
                    if (p == null) {
                        return new ProvisionalStateResponse(
                                record.jurisdictionName(),
                                record.stateAbbr(),
                                new ProvisionalStateMetrics(0, 0, 0, 0, 0, null)
                        );
                    }

                    return new ProvisionalStateResponse(
                            record.jurisdictionName(),
                            record.stateAbbr(),
                            new ProvisionalStateMetrics(
                                    safeInt(p.totalProv()),               // E1a
                                    safeInt(p.provCountFullyCounted()),   // E1b
                                    safeInt(p.provCountPartialCounted()), // E1c
                                    safeInt(p.provRejected()),            // E1d
                                    safeInt(p.provisionalOtherStatus()),  // E1e
                                    null                                  // E1e_Other (no free-text in CSV)
                            )
                    );
                })
                .toList();

        return ResponseEntity.ok(response);
    }


    @GetMapping("/provisional/aggregate/{fipsPrefix}")
    public ResponseEntity<Map<String, Object>> getProvisionalAggregateByStateFipsPrefix(
            @PathVariable String fipsPrefix,
            @RequestParam(defaultValue = "2024") Integer electionYear) {

        System.out.println("🔍 FIPS prefix request: " + fipsPrefix);

        String regex = "0*" + fipsPrefix; // matches with leading zeros
        List<EavsData> data = eavsRepository.findByFipsCodeRegexAndElectionYear(regex, electionYear);

        if (data == null || data.isEmpty()) {
            System.out.println("⚠️ No records found for FIPS prefix: " + fipsPrefix);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        int E2a = 0, E2b = 0, E2c = 0, E2d = 0, E2e = 0, E2f = 0, E2g = 0, E2h = 0, E2i = 0, other = 0;

        for (EavsData record : data) {
            var p = record.provisionalBallots(); // record accessor
            if (p != null) {
                E2a += p.provReasonVoterNotOnList() != null ? p.provReasonVoterNotOnList() : 0;
                E2b += p.provReasonVoterLackedID() != null ? p.provReasonVoterLackedID() : 0;
                E2c += p.provReasonElectionOfficialChallengedEligibility() != null
                        ? p.provReasonElectionOfficialChallengedEligibility() : 0;
                E2d += p.provReasonAnotherPersonChallengedEligibility() != null
                        ? p.provReasonAnotherPersonChallengedEligibility() : 0;
                E2e += p.provReasonVoterNotResident() != null ? p.provReasonVoterNotResident() : 0;
                E2f += p.provReasonVoterRegistrationNotUpdated() != null
                        ? p.provReasonVoterRegistrationNotUpdated() : 0;
                E2g += p.provReasonVoterDidNotSurrenderMailBallot() != null
                        ? p.provReasonVoterDidNotSurrenderMailBallot() : 0;
                E2h += p.provReasonJudgeExtendedVotingHours() != null
                        ? p.provReasonJudgeExtendedVotingHours() : 0;
                E2i += p.provReasonVoterUsedSDR() != null ? p.provReasonVoterUsedSDR() : 0;
                other += p.provReasonOtherSum() != null ? p.provReasonOtherSum() : 0;
            }
        }

        Map<String, Object> totals = new LinkedHashMap<>();
        totals.put("E2a", E2a);
        totals.put("E2b", E2b);
        totals.put("E2c", E2c);
        totals.put("E2d", E2d);
        totals.put("E2e", E2e);
        totals.put("E2f", E2f);
        totals.put("E2g", E2g);
        totals.put("E2h", E2h);
        totals.put("E2i", E2i);
        totals.put("Other", other);

        System.out.println("✅ Aggregated " + data.size() + " records for state prefix " + fipsPrefix);
        return ResponseEntity.ok(totals);
    }

}
