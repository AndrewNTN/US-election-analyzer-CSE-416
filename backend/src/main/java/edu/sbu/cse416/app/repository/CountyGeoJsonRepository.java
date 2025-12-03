package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.geojson.CountyGeoJson;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CountyGeoJsonRepository extends MongoRepository<CountyGeoJson, String> {
    @Query("{ 'properties.geoid': { $regex: '^?0' } }")
    List<CountyGeoJson> findByFipsCode(String fipsPrefix);
}
