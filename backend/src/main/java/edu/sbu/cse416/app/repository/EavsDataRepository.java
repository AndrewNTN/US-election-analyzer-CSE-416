package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.eavs.EavsData;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EavsDataRepository extends MongoRepository<EavsData, String> {

    /**
     * Fetch EAVS records by 2-letter state abbreviation for 2024 only, excluding
     * UOCAVA.
     */
    @Query("{ 'stateAbbr': ?0, 'electionYear': 2024, 'jurisdictionName': { $not: { $regex: '^UOCAVA' } } }")
    List<EavsData> findByStateAbbr(String stateAbbr);

    /**
     * Fetch EAVS records by 2-letter state abbreviation for all years, excluding
     * UOCAVA.
     */
    @Query("{ 'stateAbbr': ?0, 'jurisdictionName': { $not: { $regex: '^UOCAVA' } } }")
    List<EavsData> findByStateAbbrAllYears(String stateAbbr);

    /** Fetch all EAVS records excluding UOCAVA. */
    @Query("{ 'jurisdictionName': { $not: { $regex: '^UOCAVA' } } }")
    List<EavsData> findAllNonUocava();
}
