package edu.sbu.cse416.app.dto;

// Matches the shape of ProvisionalBallotsApiResponse.provisionalBallots in the frontend
public record ProvisionalStateTableMetrics(
        Integer E1a,
        Integer E1b,
        Integer E1c,
        Integer E1d,
        Integer E1e,
        String E1e_Other
) {}
