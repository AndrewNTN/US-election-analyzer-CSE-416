package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.EavsData;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EavsDataRepository extends MongoRepository<EavsData, String> {
    List<EavsData> findByStateAbbr(String stateAbbr);

    List<EavsData> findByElectionYear(Integer year);

    @Query("{ 'stateAbbr': { $in: ?0 }, 'electionYear': ?1 }")
    List<EavsData> findByStatesAndYear(List<String> stateAbbrs, Integer year);

    List<EavsData> findByStateAbbrAndElectionYear(String stateAbbr, Integer electionYear);

    List<EavsData> findByStateFullAndElectionYear(String stateFull, Integer electionYear);

    @Query("{ 'fipsCode': { $regex: ?0, $options: 'i' }, 'electionYear': ?1 }")
List<EavsData> findByFipsCodeStartingWithAndElectionYear(String regex, Integer electionYear);

    EavsData findByFipsCode(String fipsCode);

    EavsData findByFipsCodeAndElectionYear(String fipsCode, Integer electionYear);

    @Query("{ 'fipsCode': { $regex: ?0, $options: 'i' }, 'electionYear': ?1 }")
    List<EavsData> findByFipsPatternAndElectionYear(String regex, Integer electionYear);


}

