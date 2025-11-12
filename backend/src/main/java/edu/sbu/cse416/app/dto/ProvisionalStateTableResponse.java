package edu.sbu.cse416.app.dto;

public record ProvisionalStateTableResponse(
        String jurisdictionName,
        String stateAbbr,
        ProvisionalStateTableMetrics provisionalBallots
) {}
