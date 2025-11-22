package edu.sbu.cse416.app.dto.mailballots;

import java.util.Map;

public record MailBallotsRejectedTableResponse(java.util.List<Data> data, Map<String, String> metricLabels) {

    public record Data(
            String eavsRegion,
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
            Integer noBallotApplication) {}

    public static Map<String, String> getDefaultMetricLabels() {
        return MailBallotsRejectedChartResponse.getDefaultMetricLabels();
    }
}
