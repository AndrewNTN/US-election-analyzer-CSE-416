package edu.sbu.cse416.app.service;

import edu.sbu.cse416.app.dto.JurisdictionSummary;
import edu.sbu.cse416.app.dto.StateEavsData;
import edu.sbu.cse416.app.dto.StateWithJurisdictions;
import edu.sbu.cse416.app.model.EavsData;
import edu.sbu.cse416.app.repository.EavsDataRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

@Service
public class EavsAggregationService {
    private final MongoTemplate mongoTemplate;
    private final EavsDataRepository eavsRepository;

    public EavsAggregationService(MongoTemplate mongoTemplate, EavsDataRepository eavsRepository) {
        this.mongoTemplate = mongoTemplate;
        this.eavsRepository = eavsRepository;
    }

    public List<StateEavsData> getStateAggregatedData(Integer electionYear) {
        Criteria criteria = new Criteria().andOperator(
                Criteria.where("electionYear").is(electionYear),
                Criteria.where("stateFull").ne(null),
                Criteria.where("stateFull").not().regex("^[0-9]+$"), // exclude numeric junk
                Criteria.where("stateFull").not().regex("(?i)(NOT|BALLOT|AFFIDAVIT|MISSING|APPEARED|APPLY|CODE|SPOILED|ENVELOPE|REGISTERED)") // exclude malformed text rows
        );
    
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(criteria),
                Aggregation.group("stateFull")
                        .first("stateFull").as("stateFull")
                        .first("stateAbbr").as("stateAbbr")
                        .first("electionYear").as("electionYear")
                        .sum("voterRegistration.totalRegistered").as("totalRegistered")
                        .sum("voterRegistration.totalActive").as("totalActive")
                        .sum("voterRegistration.totalInactive").as("totalInactive")
                        .sum("mailBallots.totalMailBallotsTransmitted").as("totalMailBallots")
                        .count().as("jurisdictionCount")
        );
    
        AggregationResults<StateEavsData> results =
                mongoTemplate.aggregate(aggregation, "eavs_data", StateEavsData.class);
    
        return results.getMappedResults();
    }
    

    public List<EavsData> getJurisdictionsInState(String stateAbbr, Integer electionYear) {
        // Try by abbreviation first
        List<EavsData> byAbbr = eavsRepository.findByStateAbbrAndElectionYear(stateAbbr.toUpperCase(), electionYear);
        if (!byAbbr.isEmpty()) return byAbbr;
    
        // If no matches, try by full state name
        return eavsRepository.findByStateFullAndElectionYear(stateAbbr.toUpperCase(), electionYear);
    }
    

    public StateWithJurisdictions getStateWithJurisdictions(
            String stateAbbr, Integer electionYear, boolean includeJurisdictions) {
        // Get aggregated state data
        List<StateEavsData> stateData = getStateAggregatedData(electionYear).stream()
                .filter(state -> state.stateAbbr().equalsIgnoreCase(stateAbbr)
                || state.stateFull().equalsIgnoreCase(stateAbbr))
                .toList();

        if (stateData.isEmpty()) {
            return null;
        }

        StateWithJurisdictions result = new StateWithJurisdictions(stateData.get(0), null);

        if (includeJurisdictions) {
            List<EavsData> jurisdictions = getJurisdictionsInState(stateAbbr, electionYear);
            


            List<JurisdictionSummary> summaries = jurisdictions.stream()
                    .map(this::convertToJurisdictionSummary)
                    .collect(Collectors.toList());
            result = new StateWithJurisdictions(result.stateData(), summaries);
        }

        return result;
    }

    public StateWithJurisdictions getStateWithJurisdictionsByFips(
        String stateFips, Integer electionYear, boolean includeJurisdictions) {

    List<EavsData> records =
            eavsRepository.findByFipsCodeStartingWithAndElectionYear(stateFips, electionYear);

    if (records.isEmpty()) {
        return null;
    }

    // 🟩 Aggregate totals using your actual record fields
    int totalRegistered = records.stream()
            .mapToInt(d -> d.voterRegistration() != null ? d.voterRegistration().totalRegistered() : 0)
            .sum();

    int totalMailBallots = records.stream()
            .mapToInt(d -> d.mailBallots() != null ? d.mailBallots().totalMailBallotsTransmitted() : 0)
            .sum();

    int totalProvisionalBallots = records.stream()
            .mapToInt(d -> d.provisionalBallots() != null ? d.provisionalBallots().totalProvisionalBallotsCast() : 0)
            .sum();

    EavsData first = records.get(0);

    // 🟦 Construct StateEavsData record (fill missing fields with defaults)
    StateEavsData stateData = new StateEavsData(
            stateFips,
            first.stateAbbr(),
            first.stateFull(),
            electionYear,
            (long) totalRegistered,  // totalRegistered
            0L,                      // totalActive
            0L,                      // totalInactive
            (long) totalMailBallots, // totalMailBallots
            records.size()           // jurisdictionCount
    );

    // 🟨 Optionally include each jurisdiction
    List<JurisdictionSummary> jurisdictionsList = includeJurisdictions
            ? records.stream()
                .map(record -> new JurisdictionSummary(
                        record.fipsCode(),
                        record.jurisdictionName(),
                        record.voterRegistration() != null ? record.voterRegistration().totalRegistered() : 0,
                        record.mailBallots() != null ? record.mailBallots().totalMailBallotsTransmitted() : 0,
                        record.provisionalBallots() != null ? record.provisionalBallots().totalProvisionalBallotsCast() : 0
                ))
                .toList()
            : List.of();

    return new StateWithJurisdictions(stateData, jurisdictionsList);
}




    public List<StateEavsData> compareStates(List<String> stateAbbrs, Integer electionYear) {
        return getStateAggregatedData(electionYear).stream()
                .filter(state -> stateAbbrs.contains(state.stateAbbr()))
                .collect(Collectors.toList());
    }

    private JurisdictionSummary convertToJurisdictionSummary(EavsData eavsData) {
        Integer totalRegistered = null;
        Integer totalMailBallots = null;
        Integer totalProvisionalBallots = null;

        if (eavsData.voterRegistration() != null) {
            totalRegistered = eavsData.voterRegistration().totalRegistered();
        }
        if (eavsData.mailBallots() != null) {
            totalMailBallots = eavsData.mailBallots().totalMailBallotsTransmitted();
        }
        if (eavsData.provisionalBallots() != null) {
            totalProvisionalBallots = eavsData.provisionalBallots().totalProvisionalBallotsCast();
        }

        return new JurisdictionSummary(
                eavsData.fipsCode(),
                eavsData.jurisdictionName(),
                totalRegistered,
                totalMailBallots,
                totalProvisionalBallots);
    }
}
