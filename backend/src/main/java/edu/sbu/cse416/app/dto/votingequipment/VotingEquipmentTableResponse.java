package edu.sbu.cse416.app.dto.votingequipment;

import java.util.List;
import java.util.Map;

public record VotingEquipmentTableResponse(List<VotingEquipmentDTO> data, Map<String, String> metricLabels) {
    
    public static Map<String, String> getDefaultMetricLabels() {
        return Map.of(
                "state", "State",
                "dreNoVVPAT", "DRE (No VVPAT)",
                "dreWithVVPAT", "DRE (With VVPAT)",
                "ballotMarkingDevice", "Ballot Marking Device",
                "scanner", "Scanner");
    }
}
