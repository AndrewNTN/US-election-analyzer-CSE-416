package edu.sbu.cse416.app.dto;

/** DTO for chart data of provisional ballot reasons. */
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
        Integer provReasonOtherSum) {}
