package edu.sbu.cse416.app.dto;

import java.util.Map;

/**
 * DTO representing list of provisional ballot table data and associated metric labels.
 */
public record ProvisionalTableResponse(
        ProvisionalTableData provisionalTableData,
        Map<String, String> metricLabels) {

    public static Map<String, String> getDefaultMetricLabels() {
        return Map.of(
                "totalProv", "Ballots Cast",
                "provCountFullyCounted", "Fully Counted",
                "provCountPartialCounted", "Partially Counted",
                "provRejected", "Rejected",
                "provisionalOtherStatus", "Other"
        );
    }
}
