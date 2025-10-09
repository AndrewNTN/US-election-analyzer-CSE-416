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
import org.springframework.http.HttpStatus;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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

    @GetMapping("/states/fips/{stateFips}")
    public ResponseEntity<StateWithJurisdictions> getStateWithJurisdictionsByFips(
            @PathVariable String stateFips,
            @RequestParam Integer electionYear,
            @RequestParam(defaultValue = "false") boolean includeJurisdictions) {

        StateWithJurisdictions result =
                aggregationService.getStateWithJurisdictionsByFips(stateFips, electionYear, includeJurisdictions);

        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/provisional/fips/{fipsCode}")
    public ResponseEntity<EavsData> getProvisionalByFips(@PathVariable String fipsCode) {
        EavsData record = eavsRepository.findByFipsCode(fipsCode); // <-- use eavsRepository
        if (record == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(record);
    }


    @GetMapping("/provisional/state/{fipsPrefix}")
    public ResponseEntity<List<EavsData>> getProvisionalByStateFipsPrefix(
            @PathVariable String fipsPrefix,
            @RequestParam(defaultValue = "2024") Integer electionYear) {

        fipsPrefix = fipsPrefix.trim();
        String regex = "0*" + fipsPrefix; // matches with leading zeros
        System.out.println("🔍 Querying for FIPS regex: " + regex);

        List<EavsData> data = eavsRepository.findByFipsCodeRegexAndElectionYear(regex, electionYear);

        if (data.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(data);
    }

    @GetMapping("/provisional/aggregate/{fipsPrefix}")
public ResponseEntity<Map<String, Object>> getProvisionalAggregateByStateFipsPrefix(
        @PathVariable String fipsPrefix,
        @RequestParam(defaultValue = "2024") Integer electionYear) {

    System.out.println("🔍 FIPS prefix request: " + fipsPrefix);

    // Find all EAVS data records where FIPS starts with prefix (e.g. "30" for Montana)
    String regex = "0*" + fipsPrefix; // matches with leading zeros
    List<EavsData> data = eavsRepository.findByFipsCodeRegexAndElectionYear(regex, electionYear);

    if (data == null || data.isEmpty()) {
        System.out.println("⚠️ No records found for FIPS prefix: " + fipsPrefix);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    int E2a = 0, E2b = 0, E2c = 0, E2d = 0, E2e = 0, E2f = 0, E2g = 0, E2h = 0;

    for (EavsData record : data) {
        var p = record.provisionalBallots(); // ✅ record-style accessor
        if (p != null) {
            E2a += p.totalProvisionalBallotsCast() != null ? p.totalProvisionalBallotsCast() : 0;
            E2b += p.provisionalBallotsFullyCounted() != null ? p.provisionalBallotsFullyCounted() : 0;
            E2c += p.provisionalBallotsRejected() != null ? p.provisionalBallotsRejected() : 0;
            E2d += p.provisionalBallotsPartiallyCounted() != null ? p.provisionalBallotsPartiallyCounted() : 0;
            E2e += p.reasonNoRegistration() != null ? p.reasonNoRegistration() : 0;
            E2f += p.reasonNameNotFound() != null ? p.reasonNameNotFound() : 0;
            // Currently we don't have fields for E2g, E2h, so leave as 0
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

    System.out.println("✅ Aggregated " + data.size() + " records for state prefix " + fipsPrefix);
    return ResponseEntity.ok(totals);
}


}
