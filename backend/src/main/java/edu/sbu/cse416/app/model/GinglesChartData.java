package edu.sbu.cse416.app.model;

import java.util.List;
import java.util.Map;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Model for Gingles Chart data stored in MongoDB.
 * Contains precinct-level voting data with county demographics and regression
 * curves.
 */
@Document("gingles_chart_data")
public record GinglesChartData(
        @Id String id,
        String stateFips,
        List<PrecinctData> precincts,
        Map<String, DemographicCurves> regressionCurves,
        Metadata metadata) {

    /**
     * Voting data for a single precinct with inherited county demographics.
     */
    public record PrecinctData(
            String precinctId,
            String precinctName,
            String countyName,
            Integer republicanVotes,
            Integer democraticVotes,
            Integer totalVotes,
            Double republicanPercentage,
            Double democraticPercentage,
            Map<String, Double> demographics) {}

    /**
     * Regression curve points for Republican and Democratic parties.
     * Each list contains [x, y] coordinate pairs.
     */
    public record DemographicCurves(List<List<Double>> republican, List<List<Double>> democratic) {}

    /**
     * Summary metadata about the dataset.
     */
    public record Metadata(Integer totalPrecincts, Integer totalCounties) {}
}
