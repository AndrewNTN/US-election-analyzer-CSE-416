package edu.sbu.cse416.app.dto.mailballots;

import java.util.Map;

public record MailBallotsRejectedChartResponse(
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
        Integer noBallotApplication,
        Map<String, String> metricLabels) {

    public static Map<String, String> getDefaultMetricLabels() {
        return Map.ofEntries(
                Map.entry("late", "Late"),
                Map.entry("missingVoterSignature", "Missing"),
                Map.entry("missingWitnessSignature", "Miss wit"),
                Map.entry("nonMatchingVoterSignature", "Mismatch"),
                Map.entry("unofficialEnvelope", "Unoff."),
                Map.entry("ballotMissingFromEnvelope", "Empty"),
                Map.entry("noSecrecyEnvelope", "No Sec"),
                Map.entry("multipleBallotsInOneEnvelope", "Mult."),
                Map.entry("envelopeNotSealed", "Unseal"),
                Map.entry("noPostmark", "No PM"),
                Map.entry("noResidentAddressOnEnvelope", "No Addr"),
                Map.entry("voterDeceased", "Dead"),
                Map.entry("voterAlreadyVoted", "Voted"),
                Map.entry("missingDocumentation", "No Doc"),
                Map.entry("voterNotEligible", "Not Eligible"),
                Map.entry("noBallotApplication", "No Application"));
    }
}
