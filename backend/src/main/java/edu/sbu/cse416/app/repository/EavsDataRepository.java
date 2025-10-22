package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.EavsData;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EavsDataRepository extends MongoRepository<EavsData, String> {

    // Used by EavsAggregationService
    List<EavsData> findByStateAbbrAndElectionYear(String stateAbbr, Integer electionYear);

    // Used by EavsController (provisional endpoints)
    @Query("{ 'fipsCode': { $regex: ?0 }, 'electionYear': ?1 }")
    List<EavsData> findByFipsCodeRegexAndElectionYear(String regex, Integer electionYear);
}
