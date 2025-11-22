package edu.sbu.cse416.app.model.eavs;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("eavs_data")
public record EavsData(
        @Id String id,
        String fipsCode,
        String jurisdictionName,
        String stateFull,
        String stateAbbr,
        Integer electionYear,
        VoterRegistration voterRegistration,
        MailBallotsRejectedReason mailBallotsRejectedReason,
        ProvisionalBallots provisionalBallots,
        VoterDeletion voterDeletion,
        Equipment equipment,
        Integer mailTransmittedTotal,
        Integer mailBallotsCountedTotal,
        Integer dropBoxesTotal,
        Integer totalDropBoxesEarlyVoting,
        Integer inPersonEarlyVoting,
        Integer totalRejectedBallots,
        Integer totalBallots,
        Double percentageRejectedBallots) {}
