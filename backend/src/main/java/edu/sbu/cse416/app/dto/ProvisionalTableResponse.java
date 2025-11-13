package edu.sbu.cse416.app.dto;

/**
 * Combined DTO representing one row of provisional ballot table data.
 */
public record ProvisionalTableResponse(
        String jurisdictionName,
        Integer totalProv,
        Integer provCountFullyCounted,
        Integer provCountPartialCounted,
        Integer provRejected,
        Integer provisionalOtherStatus) {}
