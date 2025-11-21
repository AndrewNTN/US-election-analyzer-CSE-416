package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.eavs.EavsData;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EavsDataRepository extends MongoRepository<EavsData, String> {

    /** Fetch EAVS records by FIPS code prefix (regex-based) for 2024 only. */
    @Query("{ 'fipsCode': { $regex: ?0 }, 'jurisdictionName': { $not: { $regex: '^UOCAVA' } }, 'electionYear': 2024 }")
    List<EavsData> findByFipsCode(String fipsPrefix);

    /** Fetch EAVS records by FIPS code prefix (regex-based) for all years. */
    @Query("{ 'fipsCode': { $regex: ?0 }, 'jurisdictionName': { $not: { $regex: '^UOCAVA' } } }")
    List<EavsData> findByFipsCodeAllYears(String fipsPrefix);
}
