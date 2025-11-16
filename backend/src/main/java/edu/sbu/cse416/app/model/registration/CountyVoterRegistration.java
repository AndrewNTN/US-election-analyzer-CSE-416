package edu.sbu.cse416.app.model.registration;

public record CountyVoterRegistration(
        String countyName,
        Integer totalRegisteredVoters,
        Integer democraticVoters,
        Integer republicanVoters,
        Integer unaffiliatedVoters) {}
