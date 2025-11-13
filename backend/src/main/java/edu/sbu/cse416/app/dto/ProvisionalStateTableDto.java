package edu.sbu.cse416.app.dto;

/**
 * Combined DTO representing one row of provisional ballot table data.
 * Matches frontend ProvisionalBallotsApiResponse.provisionalBallots.
 */
public record ProvisionalStateTableDto(
        String jurisdictionName,
        String stateAbbr,
        Integer E1a, // totalProv
        Integer E1b, // provCountFullyCounted
        Integer E1c, // provCountPartialCounted
        Integer E1d, // provRejected
        Integer E1e, // provisionalOtherStatus
        String E1e_Other
) {}
