package edu.sbu.cse416.app.dto.activevoters;

import java.util.Map;

public record ActiveVotersChartResponse(
        Integer totalRegistered, Integer totalActive, Integer totalInactive, Map<String, String> metricLabels) {

    public static Map<String, String> getDefaultMetricLabels() {
        return Map.of(
                "totalRegistered", "Total Registered",
                "totalActive", "Active",
                "totalInactive", "Inactive");
    }
}
