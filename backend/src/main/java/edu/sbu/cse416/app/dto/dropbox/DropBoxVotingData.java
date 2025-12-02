package edu.sbu.cse416.app.dto.dropbox;

public record DropBoxVotingData(
        String eavsRegion,
        Integer totalDropBoxVotes,
        Integer republicanVotes,
        Integer democraticVotes,
        Integer totalVotes,
        Double republicanPercentage,
        Double democraticPercentage,
        Double dropBoxPercentage,
        String dominantParty) {}
