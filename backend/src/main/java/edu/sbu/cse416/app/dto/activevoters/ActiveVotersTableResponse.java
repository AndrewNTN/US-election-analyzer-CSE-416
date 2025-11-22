package edu.sbu.cse416.app.dto.activevoters;

import java.util.List;
import java.util.Map;

public record ActiveVotersTableResponse(List<Data> data, Map<String, String> metricLabels) {

    public record Data(String eavsRegion, Integer totalRegistered, Integer totalActive, Integer totalInactive) {}

    public static Map<String, String> getDefaultMetricLabels() {
        return Map.of(
                "totalRegistered", "Total Registered",
                "totalActive", "Active",
                "totalInactive", "Inactive");
    }
}
