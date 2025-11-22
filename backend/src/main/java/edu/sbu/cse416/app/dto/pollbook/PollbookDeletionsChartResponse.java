package edu.sbu.cse416.app.dto.pollbook;

import java.util.Map;

public record PollbookDeletionsChartResponse(
        Integer removedMoved,
        Integer removedDeath,
        Integer removedFelony,
        Integer removedFailResponse,
        Integer removedIncompetentToVote,
        Integer removedVoterRequest,
        Integer removedDuplicateRecords,
        Map<String, String> metricLabels) {

    public static Map<String, String> getDefaultMetricLabels() {
        return Map.of(
                "removedMoved", "Moved",
                "removedDeath", "Deceased",
                "removedFelony", "Felony Conviction",
                "removedFailResponse", "Failure to Respond",
                "removedIncompetentToVote", "Mental Incompetence",
                "removedVoterRequest", "Voter Request",
                "removedDuplicateRecords", "Duplicate");
    }
}
