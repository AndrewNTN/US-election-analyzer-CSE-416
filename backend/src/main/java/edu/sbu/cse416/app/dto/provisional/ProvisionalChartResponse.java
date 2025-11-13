package edu.sbu.cse416.app.dto.provisional;

import java.util.Map;

/**
 * DTO for chart data of provisional ballot reasons.
 */
public record ProvisionalChartResponse(
        Integer provReasonVoterNotOnList,
        Integer provReasonVoterLackedID,
        Integer provReasonElectionOfficialChallengedEligibility,
        Integer provReasonAnotherPersonChallengedEligibility,
        Integer provReasonVoterNotResident,
        Integer provReasonVoterRegistrationNotUpdated,
        Integer provReasonVoterDidNotSurrenderMailBallot,
        Integer provReasonJudgeExtendedVotingHours,
        Integer provReasonVoterUsedSDR,
        Integer provReasonOtherSum,
        Map<String, String> metricLabels) {

    public static Map<String, String> getDefaultMetricLabels() {
        return Map.of(
                "provReasonVoterNotOnList", "E2a – Not on List",
                "provReasonVoterLackedID", "E2b – Lacked ID",
                "provReasonElectionOfficialChallengedEligibility", "E2c – Official Challenged Eligibility",
                "provReasonAnotherPersonChallengedEligibility", "E2d – Person Challenged Eligibility",
                "provReasonVoterNotResident", "E2e – Not Resident",
                "provReasonVoterRegistrationNotUpdated", "E2f – Registration Not Updated",
                "provReasonVoterDidNotSurrenderMailBallot", "E2g – Did Not Surrender Mail Ballot",
                "provReasonJudgeExtendedVotingHours", "E2h – Judge Extended Hours",
                "provReasonVoterUsedSDR", "E2i – Used SDR",
                "provReasonOtherSum", "Other");
    }
}
