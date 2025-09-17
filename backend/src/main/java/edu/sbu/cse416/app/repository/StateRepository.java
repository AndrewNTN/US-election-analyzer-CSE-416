package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.State;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StateRepository extends MongoRepository<State, String> {
    List<State> findByTeamTag(String teamTag);
}
