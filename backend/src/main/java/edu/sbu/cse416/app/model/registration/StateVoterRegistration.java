package edu.sbu.cse416.app.model.registration;

import java.util.List;

public record StateVoterRegistration(
        String stateFips,
        Integer totalRegisteredVoters,
        Integer democraticVoters,
        Integer republicanVoters,
        Integer unaffiliatedVoters,
        List<CountyVoterRegistration> countyVoterRegistrations
) {
}
