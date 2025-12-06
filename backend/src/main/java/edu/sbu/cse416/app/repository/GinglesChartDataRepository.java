package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.GinglesChartData;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GinglesChartDataRepository extends MongoRepository<GinglesChartData, String> {
    Optional<GinglesChartData> findByStateFips(String stateFips);
}
