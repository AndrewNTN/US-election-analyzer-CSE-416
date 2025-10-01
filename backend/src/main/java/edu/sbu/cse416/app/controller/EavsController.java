package edu.sbu.cse416.app.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.sbu.cse416.app.dto.StateEavsData;
import edu.sbu.cse416.app.dto.StateWithJurisdictions;
import edu.sbu.cse416.app.model.EavsData;
import edu.sbu.cse416.app.repository.EavsDataRepository;
import edu.sbu.cse416.app.service.EavsAggregationService;

import java.util.List;

@RestController
@RequestMapping("/api/eavs")
public class EavsController {

    private final EavsAggregationService aggregationService;
    private final EavsDataRepository eavsRepository;

    public EavsController(EavsAggregationService aggregationService, EavsDataRepository eavsRepository) {
        this.aggregationService = aggregationService;
        this.eavsRepository = eavsRepository;
    }

    // ✅ NEW: Pagination endpoint
    @GetMapping
    public Page<EavsData> getAll(@RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "10") int size) {
        return eavsRepository.findAll(PageRequest.of(page, size));
    }

    @GetMapping("/states")
    public ResponseEntity<List<StateEavsData>> getAllStates(@RequestParam Integer electionYear) {
        List<StateEavsData> states = aggregationService.getStateAggregatedData(electionYear);
        return ResponseEntity.ok(states);
    }

    @GetMapping("/states/{stateAbbr}")
    public ResponseEntity<StateWithJurisdictions> getStateWithJurisdictions(
            @PathVariable String stateAbbr,
            @RequestParam Integer electionYear,
            @RequestParam(defaultValue = "false") boolean includeJurisdictions) {

        StateWithJurisdictions result =
                aggregationService.getStateWithJurisdictions(stateAbbr, electionYear, includeJurisdictions);

        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/jurisdictions/{fipsCode}")
    public ResponseEntity<EavsData> getJurisdiction(@PathVariable String fipsCode,
                                                    @RequestParam Integer electionYear) {

        EavsData jurisdiction = eavsRepository.findByFipsCodeAndElectionYear(fipsCode, electionYear);
        if (jurisdiction == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(jurisdiction);
    }

    @GetMapping("/states/compare")
    public ResponseEntity<List<StateEavsData>> compareStates(
            @RequestParam List<String> stateAbbrs, @RequestParam Integer electionYear) {

        List<StateEavsData> comparison = aggregationService.compareStates(stateAbbrs, electionYear);
        return ResponseEntity.ok(comparison);
    }
}
