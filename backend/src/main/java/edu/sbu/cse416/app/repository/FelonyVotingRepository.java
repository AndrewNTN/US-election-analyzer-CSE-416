package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.FelonyVoting;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FelonyVotingRepository extends MongoRepository<FelonyVoting, String> {
    
    /** Find felony voting rights by state FIPS code. */
    Optional<FelonyVoting> findByStateFips(String stateFips);
}
