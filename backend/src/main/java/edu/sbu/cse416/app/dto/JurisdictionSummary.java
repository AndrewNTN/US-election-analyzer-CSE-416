package edu.sbu.cse416.app.dto;

public record JurisdictionSummary(
        String fipsCode,
        String jurisdictionName,
        Integer totalRegistered,
        Integer totalMailBallots,
        Integer totalProvisionalBallots) {}
