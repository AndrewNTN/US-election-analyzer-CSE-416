package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.registration.StateVoterRegistration;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface StateVoterRegistrationRepository extends MongoRepository<StateVoterRegistration, String> {

    @Query("{ 'stateFips': ?0 }")
    Optional<StateVoterRegistration> findByStateFips(String stateFips);
}
