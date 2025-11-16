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
        MailBallotsRejectedReason mailBallotsRejected,
        ProvisionalBallots provisionalBallots,
        VoterDeletion voterDeletion,
        EquipmentTypeCount equipmentTypeCount,
        Integer mailTransmittedTotal,
        Integer dropBoxesTotal,
        Integer totalDropBoxesEarlyVoting,
        Integer inPersonEarlyVoting,
        Integer totalRejectedBallots,
        Integer totalBallots,
        Double percentageRejectedBallots) {}
