package edu.sbu.cse416.app.model.eavs;

public record ProvisionalBallots(
        // E1a-E1e
        Integer totalProv,
        Integer provCountFullyCounted,
        Integer provCountPartialCounted,
        Integer provRejected,
        Integer provisionalOtherStatus,
        // E2a-E2i
        Integer provReasonVoterNotOnList,
        Integer provReasonVoterLackedID,
        Integer provReasonElectionOfficialChallengedEligibility,
        Integer provReasonAnotherPersonChallengedEligibility,
        Integer provReasonVoterNotResident,
        Integer provReasonVoterRegistrationNotUpdated,
        Integer provReasonVoterDidNotSurrenderMailBallot,
        Integer provReasonJudgeExtendedVotingHours,
        Integer provReasonVoterUsedSDR,
        // E2j E2k E2l
        Integer provReasonOtherSum) {}
