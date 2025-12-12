package edu.sbu.cse416.app.repository;

import edu.sbu.cse416.app.model.EquipmentData;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentDataRepository extends MongoRepository<EquipmentData, String> {

    /** Find all equipment data (for national summary view). */
    List<EquipmentData> findAll();

    /** Find equipment for a specific state by FIPS code. */
    List<EquipmentData> findByStateFips(String stateFips);

    /** Find equipment where stateFips is null (general/national equipment). */
    @Query("{ 'stateFips': null }")
    List<EquipmentData> findGeneralEquipment();

    /** Find equipment for a state OR general equipment for state views. */
    @Query("{ '$or': [ { 'stateFips': ?0 }, { 'stateFips': null } ] }")
    List<EquipmentData> findByStateFipsOrGeneral(String stateFips);
}
