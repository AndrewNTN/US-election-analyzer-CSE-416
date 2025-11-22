package edu.sbu.cse416.app.dto.votingequipment;

import java.util.List;
import java.util.Map;

public record VotingEquipmentChartResponse(
        List<VotingEquipmentYearlyDTO> data, Map<String, String> metricLabels, String xAxisLabel, String yAxisLabel) {

    public static Map<String, String> getDefaultMetricLabels() {
        return Map.of(
                "year", "Year",
                "dreNoVVPAT", "DRE (No VVPAT)",
                "dreWithVVPAT", "DRE (With VVPAT)",
                "ballotMarkingDevice", "Ballot Marking Device",
                "scanner", "Scanner");
    }
}
