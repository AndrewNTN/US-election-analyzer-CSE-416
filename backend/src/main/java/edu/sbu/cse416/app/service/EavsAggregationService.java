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
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("electionYear").is(electionYear)),
                Aggregation.group("stateAbbr")
                        .first("stateFull")
                        .as("stateFull")
                        .first("electionYear")
                        .as("electionYear")
                        .sum("voterRegistration.totalRegistered")
                        .as("totalRegistered")
                        .sum("voterRegistration.totalActive")
                        .as("totalActive")
                        .sum("voterRegistration.totalInactive")
                        .as("totalInactive")
                        .sum("mailBallots.totalMailBallotsTransmitted")
                        .as("totalMailBallots")
                        .count()
                        .as("jurisdictionCount"));

        AggregationResults<StateEavsData> results =
                mongoTemplate.aggregate(aggregation, "eavs_data", StateEavsData.class);

        return results.getMappedResults();
    }

    public List<EavsData> getJurisdictionsInState(String stateAbbr, Integer electionYear) {
        return eavsRepository.findByStateAbbrAndElectionYear(stateAbbr, electionYear);
    }

    public StateWithJurisdictions getStateWithJurisdictions(
            String stateAbbr, Integer electionYear, boolean includeJurisdictions) {
        // Get aggregated state data
        List<StateEavsData> stateData = getStateAggregatedData(electionYear).stream()
                .filter(state -> state.stateAbbr().equals(stateAbbr))
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
