package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.geojson.StateGeoJson;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StateGeoJsonRepository extends MongoRepository<StateGeoJson, String> {}
