package edu.sbu.cse416.app.model;

public record MailBallotsRejectedReason(
        // A12b-A12h
        Integer late,
        Integer missingVoterSignature,
        Integer missingWitnessSignature,
        Integer nonMatchingVoterSignature,
        Integer unofficialEnvelope,
        Integer ballotMissingFromEnvelope,
        Integer noSecrecyEnvelope,
        Integer multipleBallotsInOneEnvelope,
        Integer envelopeNotSealed,
        Integer noPostmark,
        Integer noResidentAddressOnEnvelope,
        Integer voterDeceased,
        Integer voterAlreadyVoted,
        Integer missingDocumentation,
        Integer voterNotEligible,
        Integer noBallotApplication
        ) {}
