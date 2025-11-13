package edu.sbu.cse416.app.service;

import edu.sbu.cse416.app.model.CountyGeoJson;
import edu.sbu.cse416.app.repository.CountyGeoJsonRepository;
import java.util.List;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class GeoJsonService {

    private final CountyGeoJsonRepository countyGeoJsonRepository;

    public GeoJsonService(CountyGeoJsonRepository countyGeoJsonRepository) {
        this.countyGeoJsonRepository = countyGeoJsonRepository;
    }

    /**
     * Get all counties for a specific state.
     */
    @Cacheable(value = "countiesByState", key = "#fipsPrefix")
    public List<CountyGeoJson> getCountiesByState(String fipsPrefix) {
        return countyGeoJsonRepository.findByFipsCode(fipsPrefix);
    }
}
