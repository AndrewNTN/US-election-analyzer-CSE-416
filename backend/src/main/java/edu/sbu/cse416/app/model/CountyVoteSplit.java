package edu.sbu.cse416.app.model;

public record CountyVoteSplit(
        String stateFips, // "12" for Florida
        String countyName,
        Integer republicanVotes,
        Integer democraticVotes,
        Integer totalVotes,
        Double republicanPercentage,
        Double democraticPercentage) {}
