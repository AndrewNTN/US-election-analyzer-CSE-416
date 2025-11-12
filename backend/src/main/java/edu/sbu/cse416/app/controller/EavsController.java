package edu.sbu.cse416.app.controller;

import edu.sbu.cse416.app.dto.ProvisionalStateTableMetrics;
import edu.sbu.cse416.app.dto.ProvisionalStateTableResponse;
import edu.sbu.cse416.app.model.EavsData;
import edu.sbu.cse416.app.repository.EavsDataRepository;
import edu.sbu.cse416.app.service.EavsService;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/eavs")
public class EavsController {

    private final EavsService aggregationService;
    private final EavsDataRepository eavsRepository;

    public EavsController(EavsService aggregationService, EavsDataRepository eavsRepository) {
        this.aggregationService = aggregationService;
        this.eavsRepository = eavsRepository;
    }

    // Simple helper to avoid null checks everywhere
    private static int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    @GetMapping("/api/eavs/states")
    public ResponseEntity<List<Object>> getAllStatesPlaceholder() {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/provisional/state/{fipsPrefix}")
    public ResponseEntity<List<ProvisionalStateTableResponse>> getProvisionalByStateFipsPrefix(
            @PathVariable String fipsPrefix,
            @RequestParam(defaultValue = "2024") Integer electionYear) {

        // This one WAS anchored at start; keep that behavior via anchorStart=true
        List<EavsData> data = aggregationService.findByFipsPrefix(fipsPrefix, electionYear, true);
        if (data.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<ProvisionalStateTableResponse> response = data.stream()
                .map(record -> {
                    var p = record.provisionalBallots();

                    // If no provisional data, just return zeros so the table code stays simple
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

        List<EavsData> data = aggregationService.findByFipsPrefix(fipsPrefix, electionYear, false);

        if (data == null || data.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Map<String, Integer> totals = aggregationService.aggregateProvisionalReasons(data);
        return ResponseEntity.ok(new LinkedHashMap<>(totals));
    }

}
