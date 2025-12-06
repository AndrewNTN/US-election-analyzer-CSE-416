package edu.sbu.cse416.app.dto.gingles;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for the Gingles Chart endpoint.
 * Contains all precinct data points with demographics and regression curves for
 * all demographic groups.
 */
public record GinglesChartResponse(
        List<PrecinctDataDTO> precincts, Map<String, DemographicCurvesDTO> regressionCurves, MetadataDTO metadata) {

    /**
     * Flattened precinct data with vote and demographic percentages.
     */
    public record PrecinctDataDTO(
            String precinctId,
            String precinctName,
            String countyName,
            Integer republicanVotes,
            Integer democraticVotes,
            Integer totalVotes,
            Double republicanPercentage,
            Double democraticPercentage,
            Double white,
            Double black,
            Double hispanic,
            Double asian) {}

    /**
     * Regression curve points for Republican and Democratic parties.
     * Each point is [demographicPercentage, votePercentage].
     */
    public record DemographicCurvesDTO(List<double[]> republican, List<double[]> democratic) {}

    /**
     * Summary metadata about the dataset.
     */
    public record MetadataDTO(Integer totalPrecincts, Integer totalCounties) {}
}
