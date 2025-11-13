package edu.sbu.cse416.app.controller;

import edu.sbu.cse416.app.model.CountyGeoJson;
import edu.sbu.cse416.app.service.GeoJsonService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/geojson")
public class GeoJsonController {

    private final GeoJsonService geoJsonService;

    public GeoJsonController(GeoJsonService geoJsonService) {
        this.geoJsonService = geoJsonService;
    }

    /**
     * Get all counties for a specific state.
     * GET /geojson/counties/{fipsPrefix}
     */
    @GetMapping("/counties/state/{fipsPrefix}")
    public ResponseEntity<List<CountyGeoJson>> getCountiesByState(@PathVariable String fipsPrefix) {
        List<CountyGeoJson> counties = geoJsonService.getCountiesByState(fipsPrefix);
        return ResponseEntity.ok(counties);
    }
}
