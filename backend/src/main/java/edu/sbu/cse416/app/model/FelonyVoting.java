package edu.sbu.cse416.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("felony_data")
public record FelonyVoting(@Id String id, String stateFips, String felonyVotingRights) {}
