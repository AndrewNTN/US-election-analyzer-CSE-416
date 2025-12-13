package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.EIData;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EIDataRepository extends MongoRepository<EIData, String> {
    Optional<EIData> findByTypeAndState(String type, String state);
}
