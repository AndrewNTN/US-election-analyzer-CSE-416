package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.CvapData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CvapDataRepository extends MongoRepository<CvapData, String> {
    
    /** Find CVAP data by geoid (FIPS code). */
    CvapData findByGeoid(String geoid);
    
    /** Find all CVAP data for a state by geoid prefix (regex-based). */
    @Query("{ 'geoid': { $regex: ?0 } }")
    List<CvapData> findByGeoidPrefix(String geoidPrefix);
}
