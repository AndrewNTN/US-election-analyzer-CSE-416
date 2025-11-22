package edu.sbu.cse416.app.dto.voterregistration;

import java.util.List;
import java.util.Map;

public record VoterRegistrationTableResponse(List<Data> data, Map<String, String> metricLabels) {

    public record Data(
            String eavsRegion,
            Integer totalRegisteredVoters,
            Integer democraticVoters,
            Integer republicanVoters,
            Integer unaffiliatedVoters) {}

    public static Map<String, String> getDefaultMetricLabels() {
        return Map.of(
                "eavsRegion", "County",
                "totalRegisteredVoters", "Total Registered",
                "democraticVoters", "Democratic",
                "republicanVoters", "Republican",
                "unaffiliatedVoters", "Unaffiliated");
    }
}
