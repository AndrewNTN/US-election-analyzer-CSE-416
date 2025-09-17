package edu.sbu.cse416.app.model;

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
        MailBallots mailBallots,
        ProvisionalBallots provisionalBallots,
        VotingEquipment votingEquipment) {}
