package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.CountyVoteSplit;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CountyVoteSplitRepository extends MongoRepository<CountyVoteSplit, String> {
    List<CountyVoteSplit> findByStateFips(String stateFips);
}
