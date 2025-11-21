package edu.sbu.cse416.app.dto.provisional;

import java.util.List;
import java.util.Map;

/**
 * DTO representing list of provisional ballot table data and associated metric labels.
 */
public record ProvisionalTableResponse(List<Data> data, Map<String, String> metricLabels) {

    public record Data(
            String jurisdictionName,
            Integer totalProv,
            Integer provCountFullyCounted,
            Integer provCountPartialCounted,
            Integer provRejected,
            Integer provisionalOtherStatus) {}

    public static Map<String, String> getDefaultMetricLabels() {
        return Map.of(
                "totalProv", "Ballots Cast",
                "provCountFullyCounted", "Fully Counted",
                "provCountPartialCounted", "Partially Counted",
                "provRejected", "Rejected",
                "provisionalOtherStatus", "Other");
    }
}
