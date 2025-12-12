package edu.sbu.cse416.app.dto.equipment;

import java.util.List;
import java.util.Map;

/**
 * Response wrapper for state equipment summary table.
 */
public record StateEquipmentSummaryResponse(List<StateEquipmentSummaryDTO> data, Map<String, String> metricLabels) {

    public static Map<String, String> getDefaultMetricLabels() {
        return Map.ofEntries(
                Map.entry("make", "Make"),
                Map.entry("model", "Model"),
                Map.entry("quantity", "Quantity"),
                Map.entry("equipmentType", "Type"),
                Map.entry("description", "Description"),
                Map.entry("age", "Age (Yrs)"),
                Map.entry("operatingSystem", "OS"),
                Map.entry("certification", "Certification"),
                Map.entry("scanRate", "Scan Rate"),
                Map.entry("errorRate", "Error Rate"),
                Map.entry("reliability", "Reliability"),
                Map.entry("discontinued", "Discontinued"));
    }
}
