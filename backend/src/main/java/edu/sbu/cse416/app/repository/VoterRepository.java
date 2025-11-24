package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.registration.Voter;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface VoterRepository extends MongoRepository<Voter, String> {
    List<Voter> findByCountyName(String countyName);

    Page<Voter> findByCountyNameAndPartyInAndNameRegex(
            String countyName, java.util.Collection<String> parties, String nameRegex, Pageable pageable);
}
