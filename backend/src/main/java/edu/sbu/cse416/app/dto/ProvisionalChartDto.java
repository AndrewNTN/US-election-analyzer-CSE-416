package edu.sbu.cse416.app.dto;

import java.util.Map;

/** DTO for chart data of provisional ballot reasons. */
public record ProvisionalChartDto(
        String fipsPrefix,
        Map<String, Integer> reasonCounts
) {}
