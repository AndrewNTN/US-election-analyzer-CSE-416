package edu.sbu.cse416.app.service;

import edu.sbu.cse416.app.model.CvapData;
import edu.sbu.cse416.app.model.eavs.EavsData;
import edu.sbu.cse416.app.model.geojson.CountyGeoJson;
import edu.sbu.cse416.app.model.geojson.StateGeoJson;
import edu.sbu.cse416.app.repository.CountyGeoJsonRepository;
import edu.sbu.cse416.app.repository.CvapDataRepository;
import edu.sbu.cse416.app.repository.EavsDataRepository;
import edu.sbu.cse416.app.repository.StateGeoJsonRepository;
import edu.sbu.cse416.app.util.FipsUtil;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class GeoJsonService {

    private final CountyGeoJsonRepository countyGeoJsonRepository;
    private final StateGeoJsonRepository stateGeoJsonRepository;
    private final EavsDataRepository eavsDataRepository;
    private final CvapDataRepository cvapDataRepository;

    public GeoJsonService(
            CountyGeoJsonRepository countyGeoJsonRepository,
            StateGeoJsonRepository stateGeoJsonRepository,
            EavsDataRepository eavsDataRepository,
            CvapDataRepository cvapDataRepository) {
        this.countyGeoJsonRepository = countyGeoJsonRepository;
        this.stateGeoJsonRepository = stateGeoJsonRepository;
        this.eavsDataRepository = eavsDataRepository;
        this.cvapDataRepository = cvapDataRepository;
    }

    /**
     * Get all counties for a specific state with choropleth metrics.
     */
    @Cacheable(value = "countiesByState", key = "#fipsPrefix")
    public List<CountyGeoJson> getCountiesByState(String fipsPrefix) {
        List<CountyGeoJson> counties = countyGeoJsonRepository.findByFipsCode(fipsPrefix);

        // Fetch EAVS data for this state
        String prefix = (fipsPrefix == null ? "" : fipsPrefix.trim());
        String stateAbbr = FipsUtil.getStateAbbr(prefix);
        List<EavsData> eavsData;
        if (stateAbbr != null) {
            eavsData = eavsDataRepository.findByStateAbbr(stateAbbr);
        } else {
            eavsData = List.of();
        }

        // Build a map of FIPS -> EAVS data for faster lookup
        Map<String, EavsData> eavsMap = new HashMap<>();
        for (EavsData data : eavsData) {
            String fips = data.fipsCode();
            if (fips != null && fips.length() >= 5) {
                fips = fips.substring(0, 5);
                eavsMap.put(fips, data);
            }
        }

        return counties.stream()
                .map(county -> {
                    String fips = county.properties().geoid();
                    EavsData eavs = eavsMap.get(fips);

                    if (eavs == null) {
                        // No EAVS data, return county with null metrics
                        return new CountyGeoJson(
                                county.id(),
                                county.type(),
                                new CountyGeoJson.Properties(
                                        county.properties().geoid(),
                                        county.properties().stateName(),
                                        county.properties().countyName(),
                                        null,
                                        null,
                                        null,
                                        null,
                                        null),
                                county.geometry());
                    }

                    // Calculate metrics
                    // Provisional Ballots %
                    Double provPct = null;
                    if (eavs.totalBallots() != null
                            && eavs.totalBallots() > 0
                            && eavs.provisionalBallots() != null
                            && eavs.provisionalBallots().totalProv() != null) {
                        provPct = (eavs.provisionalBallots().totalProv() / (double) eavs.totalBallots()) * 100;
                    }

                    // Active Voters %
                    Double activePct = null;
                    if (eavs.voterRegistration() != null
                            && eavs.voterRegistration().totalActive() != null
                            && eavs.voterRegistration().totalActive() > 0
                            && eavs.voterRegistration().totalRegistered() != null) {
                        activePct = (eavs.voterRegistration().totalActive()
                                        / (double) eavs.voterRegistration().totalRegistered())
                                * 100;
                    }

                    // Pollbook Deletions %
                    Double pollbookPct = null;
                    if (eavs.voterRegistration() != null
                            && eavs.voterRegistration().totalActive() != null
                            && eavs.voterRegistration().totalActive() > 0
                            && eavs.voterDeletion() != null
                            && eavs.voterDeletion().removedTotal() != null) {
                        pollbookPct = (eavs.voterDeletion().removedTotal()
                                        / (double) eavs.voterRegistration().totalActive())
                                * 100;
                    }

                    // Mail Ballots Rejected %
                    Double mailRejectedPct = null;
                    if (eavs.mailCountedTotal() != null
                            && eavs.mailCountedTotal() > 0
                            && eavs.totalRejectedBallots() != null) {
                        mailRejectedPct = (eavs.totalRejectedBallots() / (double) eavs.mailCountedTotal()) * 100;
                    }

                    // Voter Registration % - Calculate using CVAP data
                    Double voterRegPct = null;
                    if (eavs.voterRegistration() != null
                            && eavs.voterRegistration().totalActive() != null) {
                        CvapData cvapData = cvapDataRepository.findByGeoid(fips);
                        if (cvapData != null
                                && cvapData.totalCvapEstimate() != null
                                && cvapData.totalCvapEstimate() > 0) {
                            voterRegPct =
                                    (eavs.voterRegistration().totalActive() * 100.0) / cvapData.totalCvapEstimate();
                        }
                    }

                    return new CountyGeoJson(
                            county.id(),
                            county.type(),
                            new CountyGeoJson.Properties(
                                    county.properties().geoid(),
                                    county.properties().stateName(),
                                    county.properties().countyName(),
                                    provPct,
                                    activePct,
                                    pollbookPct,
                                    mailRejectedPct,
                                    voterRegPct),
                            county.geometry());
                })
                .toList();
    }

    /**
     * Get all state geoJSON data with equipment age metrics.
     */
    @Cacheable(value = "states")
    public List<StateGeoJson> getAllStates() {
        List<StateGeoJson> states = stateGeoJsonRepository.findAll();

        // Hardcoded equipment age map
        Map<String, Double> equipmentAgeMap = new HashMap<>();
        equipmentAgeMap.put("01", 5.6); // Alabama
        equipmentAgeMap.put("02", 8.2); // Alaska
        equipmentAgeMap.put("04", 5.9); // Arizona
        equipmentAgeMap.put("05", 13.3); // Arkansas
        equipmentAgeMap.put("06", 12.4); // California
        equipmentAgeMap.put("08", 4.1); // Colorado
        equipmentAgeMap.put("09", 14.2); // Connecticut
        equipmentAgeMap.put("10", 2.5); // Delaware
        equipmentAgeMap.put("12", 6.8); // Florida
        equipmentAgeMap.put("13", 1.2); // Georgia
        equipmentAgeMap.put("15", 3.5); // Hawaii
        equipmentAgeMap.put("16", 7.9); // Idaho
        equipmentAgeMap.put("17", 11.5); // Illinois
        equipmentAgeMap.put("18", 9.8); // Indiana
        equipmentAgeMap.put("19", 8.4); // Iowa
        equipmentAgeMap.put("20", 10.1); // Kansas
        equipmentAgeMap.put("21", 6.3); // Kentucky
        equipmentAgeMap.put("22", 15.0); // Louisiana
        equipmentAgeMap.put("23", 12.8); // Maine
        equipmentAgeMap.put("24", 5.2); // Maryland
        equipmentAgeMap.put("25", 13.7); // Massachusetts
        equipmentAgeMap.put("26", 4.8); // Michigan
        equipmentAgeMap.put("27", 9.5); // Minnesota
        equipmentAgeMap.put("28", 16.2); // Mississippi
        equipmentAgeMap.put("29", 11.9); // Missouri
        equipmentAgeMap.put("30", 7.4); // Montana
        equipmentAgeMap.put("31", 8.9); // Nebraska
        equipmentAgeMap.put("32", 3.8); // Nevada
        equipmentAgeMap.put("33", 14.5); // New Hampshire
        equipmentAgeMap.put("34", 10.8); // New Jersey
        equipmentAgeMap.put("35", 6.5); // New Mexico
        equipmentAgeMap.put("36", 12.1); // New York
        equipmentAgeMap.put("37", 2.9); // North Carolina
        equipmentAgeMap.put("38", 5.5); // North Dakota
        equipmentAgeMap.put("39", 7.2); // Ohio
        equipmentAgeMap.put("40", 9.1); // Oklahoma
        equipmentAgeMap.put("41", 13.9); // Oregon
        equipmentAgeMap.put("42", 1.5); // Pennsylvania
        equipmentAgeMap.put("44", 4.5); // Rhode Island
        equipmentAgeMap.put("45", 0.8); // South Carolina
        equipmentAgeMap.put("46", 11.2); // South Dakota
        equipmentAgeMap.put("47", 8.6); // Tennessee
        equipmentAgeMap.put("48", 6.9); // Texas
        equipmentAgeMap.put("49", 5.1); // Utah
        equipmentAgeMap.put("50", 14.8); // Vermont
        equipmentAgeMap.put("51", 4.2); // Virginia
        equipmentAgeMap.put("53", 9.9); // Washington
        equipmentAgeMap.put("54", 10.5); // West Virginia
        equipmentAgeMap.put("55", 7.6); // Wisconsin
        equipmentAgeMap.put("56", 6.1); // Wyoming

        return states.stream()
                .map(state -> {
                    String fips = state.properties().stateFips();
                    Double equipmentAge = equipmentAgeMap.get(fips);

                    return new StateGeoJson(
                            state.id(),
                            state.type(),
                            new StateGeoJson.Properties(
                                    state.properties().stateName(),
                                    state.properties().density(),
                                    state.properties().stateFips(),
                                    state.properties().stateAbbr(),
                                    equipmentAge),
                            state.geometry());
                })
                .toList();
    }
}
