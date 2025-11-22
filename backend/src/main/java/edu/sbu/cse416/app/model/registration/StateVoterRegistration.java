package edu.sbu.cse416.app.model.registration;

import java.util.List;

import org.springframework.data.mongodb.core.mapping.Document;

@Document("state_voter_registration")
public record StateVoterRegistration(
        String stateFips,
        Integer totalRegisteredVoters,
        Integer democraticVoters,
        Integer republicanVoters,
        Integer unaffiliatedVoters,
        List<CountyVoterRegistration> countyVoterRegistrations) {}
