package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.CvapData;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CvapDataRepository extends MongoRepository<CvapData, String> {

    /**
     * Find a specific county's CVAP data by its 5-digit FIPS code (geoid).
     */
    CvapData findByGeoid(String geoid);

    /**
     * Find all counties in a state by the state's 2-digit FIPS code prefix.
     */
    List<CvapData> findByGeoidStartingWith(String geoidPrefix);
}
