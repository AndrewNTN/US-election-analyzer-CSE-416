package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.CountyGeoJson;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CountyGeoJsonRepository extends MongoRepository<CountyGeoJson, String> {
    /** Find all counties by state FIPS code (first 2 digits of geoid). */
    @Query("{ 'properties.geoid': { $regex: '^?0' } }")
    List<CountyGeoJson> findByFipsCode(String fipsPrefix);
}
