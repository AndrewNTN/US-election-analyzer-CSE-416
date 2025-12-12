package edu.sbu.cse416.app.dto.equipment;

import java.util.List;

/**
 * Response DTO for the equipment quality vs rejected ballots bubble chart
 * endpoint.
 * Contains county data points and regression coefficients for each party.
 */
public record EquipmentQualityChartResponse(
        List<EquipmentQualityChartDTO> equipmentQualityData, RegressionCoefficients regressionCoefficients) {

    /**
     * Regression coefficients for Republican and Democratic parties.
     */
    public record RegressionCoefficients(RegressionCoefficientsDTO republican, RegressionCoefficientsDTO democratic) {}
}
