package edu.sbu.cse416.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("county_vote_split")
public record CountyVoteSplit(
        @Id String id,
        String stateFips, // "12" for Florida
        String countyName,
        Integer republicanVotes,
        Integer democraticVotes,
        Integer totalVotes,
        Double republicanPercentage,
        Double democraticPercentage) {}
