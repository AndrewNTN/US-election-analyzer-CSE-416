package edu.sbu.cse416.app.controller;

import edu.sbu.cse416.app.dto.geojson.GeoJsonResponse;
import edu.sbu.cse416.app.model.geojson.CountyGeoJson;
import edu.sbu.cse416.app.model.geojson.StateGeoJson;
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
     * GET /geojson/counties/state/{fipsPrefix}
     */
    @GetMapping("/counties/state/{fipsPrefix}")
    public ResponseEntity<GeoJsonResponse<CountyGeoJson>> getCountiesByState(@PathVariable String fipsPrefix) {
        List<CountyGeoJson> counties = geoJsonService.getCountiesByState(fipsPrefix);
        return ResponseEntity.ok(GeoJsonResponse.of(counties));
    }

    /**
     * Get all state geoJSON data.
     * GET /geojson/states
     */
    @GetMapping("/states")
    public ResponseEntity<GeoJsonResponse<StateGeoJson>> getAllStates() {
        List<StateGeoJson> states = geoJsonService.getAllStates();
        return ResponseEntity.ok(GeoJsonResponse.of(states));
    }
}
