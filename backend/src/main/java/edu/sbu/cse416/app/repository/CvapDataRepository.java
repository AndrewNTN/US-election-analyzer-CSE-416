package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.CvapData;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CvapDataRepository extends MongoRepository<CvapData, String> {

    /** Find CVAP data by geoid (FIPS code). */
    CvapData findByGeoid(String geoid);

    /** Find all CVAP data for a state by geoid prefix (regex-based). */
    @Query("{ 'geoid': { $regex: ?0 } }")
    List<CvapData> findByGeoidPrefix(String geoidPrefix);
}
