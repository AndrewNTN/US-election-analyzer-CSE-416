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
                "provReasonVoterNotOnList", "Not on List",
                "provReasonVoterLackedID", "Lacked ID",
                "provReasonElectionOfficialChallengedEligibility", "Official Challenged Eligibility",
                "provReasonAnotherPersonChallengedEligibility", "Person Challenged Eligibility",
                "provReasonVoterNotResident", "Not Resident",
                "provReasonVoterRegistrationNotUpdated", "Registration Not Updated",
                "provReasonVoterDidNotSurrenderMailBallot", "Did Not Surrender Mail Ballot",
                "provReasonJudgeExtendedVotingHours", "Judge Extended Hours",
                "provReasonVoterUsedSDR", "Used SDR",
                "provReasonOtherSum", "Other");
    }
}
