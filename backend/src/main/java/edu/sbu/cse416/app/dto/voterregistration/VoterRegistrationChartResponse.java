package edu.sbu.cse416.app.dto.voterregistration;

import java.util.List;
import java.util.Map;

public record VoterRegistrationChartResponse(List<Data> data, Map<String, String> metricLabels) {

    public record Data(
            String eavsRegion,
            Integer registeredVoters2016,
            Integer registeredVoters2020,
            Integer registeredVoters2024) {}

    public static Map<String, String> getDefaultMetricLabels() {
        return Map.of(
                "eavsRegion", "County",
                "registeredVoters2016", "2016 Registered Voters",
                "registeredVoters2020", "2020 Registered Voters",
                "registeredVoters2024", "2024 Registered Voters");
    }
}
