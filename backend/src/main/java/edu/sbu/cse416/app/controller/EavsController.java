package edu.sbu.cse416.app.controller;

import edu.sbu.cse416.app.dto.ProvisionalStateTableResponse;
import edu.sbu.cse416.app.service.EavsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/eavs")
public class EavsController {

    private final EavsService eavsService;

    public EavsController(EavsService eavsService) {
        this.eavsService = eavsService;
    }

    /** New endpoint: /api/eavs/provisional/table/{fipsPrefix} */
    @GetMapping("/provisional/table/{fipsPrefix}")
    public ResponseEntity<List<ProvisionalStateTableResponse>> getProvisionalTable(
            @PathVariable String fipsPrefix) {

        List<ProvisionalStateTableResponse> response = eavsService.getProvisionalStateTable(fipsPrefix);

        if (response.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(response);
    }

    /** New endpoint: /api/eavs/provisional/chart/{fipsPrefix} */
    @GetMapping("/provisional/chart/{fipsPrefix}")
    public ResponseEntity<Map<String, Integer>> getProvisionalChart(
            @PathVariable String fipsPrefix) {

        Map<String, Integer> totals = eavsService.getCachedAggregateProvisionalReasons(fipsPrefix);

        if (totals == null || totals.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(totals);
    }
}
