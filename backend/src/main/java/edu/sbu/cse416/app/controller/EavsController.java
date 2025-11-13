package edu.sbu.cse416.app.controller;

import edu.sbu.cse416.app.dto.ProvisionalStateTableDto;
import edu.sbu.cse416.app.dto.ProvisionalChartDto;
import edu.sbu.cse416.app.service.EavsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/eavs")
public class EavsController {

    private final EavsService eavsService;

    public EavsController(EavsService eavsService) {
        this.eavsService = eavsService;
    }

    @GetMapping("/provisional/table/{fipsPrefix}")
    public ResponseEntity<List<ProvisionalStateTableDto>> getProvisionalTable(
            @PathVariable String fipsPrefix) {
        var response = eavsService.getProvisionalStateTable(fipsPrefix);
        return response.isEmpty()
                ? ResponseEntity.status(HttpStatus.NOT_FOUND).build()
                : ResponseEntity.ok(response);
    }

    @GetMapping("/provisional/chart/{fipsPrefix}")
    public ResponseEntity<ProvisionalChartDto> getProvisionalChart(
            @PathVariable String fipsPrefix) {
        var dto = eavsService.getCachedAggregateProvisionalReasons(fipsPrefix);
        return (dto == null || dto.reasonCounts().isEmpty())
                ? ResponseEntity.status(HttpStatus.NOT_FOUND).build()
                : ResponseEntity.ok(dto);
    }
}
