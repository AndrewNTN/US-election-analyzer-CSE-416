package edu.sbu.cse416.app.dto;

public record StateEavsData(
        String stateFips,
        String stateAbbr,
        String stateFull,
        Integer electionYear,
        Long totalRegistered,
        Long totalActive,
        Long totalInactive,
        Long totalMailBallots,
        Integer jurisdictionCount) {}
