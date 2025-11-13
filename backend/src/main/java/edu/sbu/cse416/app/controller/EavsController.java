package edu.sbu.cse416.app.controller;

import edu.sbu.cse416.app.dto.ProvisionalChartResponse;
import edu.sbu.cse416.app.dto.ProvisionalTableResponse;
import edu.sbu.cse416.app.service.EavsService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/eavs")
public class EavsController {

    private final EavsService eavsService;

    public EavsController(EavsService eavsService) {
        this.eavsService = eavsService;
    }

    @GetMapping("/provisional/table/{fipsPrefix}")
    public ResponseEntity<List<ProvisionalTableResponse>> getProvisionalTable(@PathVariable String fipsPrefix) {
        var response = eavsService.getProvisionalTable(fipsPrefix);
        return response.isEmpty() ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(response);
    }

    @GetMapping("/provisional/chart/{fipsPrefix}")
    public ResponseEntity<ProvisionalChartResponse> getProvisionalChart(@PathVariable String fipsPrefix) {
        var dto = eavsService.getProvisionalChart(fipsPrefix);
        return (dto == null) ? ResponseEntity.status(HttpStatus.NOT_FOUND).build() : ResponseEntity.ok(dto);
    }
}
