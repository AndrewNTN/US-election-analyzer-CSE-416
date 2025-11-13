package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.EavsData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EavsDataRepository extends MongoRepository<EavsData, String> {

    /** Fetch EAVS records by FIPS code prefix (regex-based). */
    @Query("{ 'fipsCode': { $regex: ?0 } }")
    List<EavsData> findByFipsCode(String fipsRegex);
}
