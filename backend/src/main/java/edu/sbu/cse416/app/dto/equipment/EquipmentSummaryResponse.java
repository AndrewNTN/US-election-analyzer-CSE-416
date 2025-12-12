package edu.sbu.cse416.app.dto.equipment;

import java.util.List;
import java.util.Map;

/**
 * Response wrapper for equipment summary table.
 */
public record EquipmentSummaryResponse(List<EquipmentSummaryDTO> data, Map<String, String> metricLabels) {

    public static Map<String, String> getDefaultMetricLabels() {
        return Map.of(
                "make", "Make",
                "model", "Model",
                "quantity", "Quantity",
                "age", "Age (Years)",
                "operatingSystem", "OS",
                "certification", "Certification",
                "scanRate", "Scan Rate",
                "errorRate", "Error Rate",
                "reliability", "Reliability",
                "quality", "Quality");
    }
}
