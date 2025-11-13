package edu.sbu.cse416.app.service;

import edu.sbu.cse416.app.model.geojson.CountyGeoJson;
import edu.sbu.cse416.app.model.geojson.StateGeoJson;
import edu.sbu.cse416.app.repository.CountyGeoJsonRepository;
import edu.sbu.cse416.app.repository.StateGeoJsonRepository;
import java.util.List;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class GeoJsonService {

    private final CountyGeoJsonRepository countyGeoJsonRepository;
    private final StateGeoJsonRepository stateGeoJsonRepository;

    public GeoJsonService(
            CountyGeoJsonRepository countyGeoJsonRepository, StateGeoJsonRepository stateGeoJsonRepository) {
        this.countyGeoJsonRepository = countyGeoJsonRepository;
        this.stateGeoJsonRepository = stateGeoJsonRepository;
    }

    /**
     * Get all counties for a specific state.
     */
    @Cacheable(value = "countiesByState", key = "#fipsPrefix")
    public List<CountyGeoJson> getCountiesByState(String fipsPrefix) {
        return countyGeoJsonRepository.findByFipsCode(fipsPrefix);
    }

    /**
     * Get all state geoJSON data.
     */
    @Cacheable(value = "states")
    public List<StateGeoJson> getAllStates() {
        return stateGeoJsonRepository.findAll();
    }
}
