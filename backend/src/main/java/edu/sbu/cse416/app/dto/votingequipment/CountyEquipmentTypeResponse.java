package edu.sbu.cse416.app.dto.votingequipment;

import java.util.List;
import java.util.Map;

public record CountyEquipmentTypeResponse(List<CountyEquipmentTypeDTO> data, Map<String, String> equipmentLabels) {

    public static Map<String, String> getDefaultEquipmentLabels() {
        return Map.of(
                "dre_no_vvpat", "DRE (No VVPAT)",
                "dre_with_vvpat", "DRE (With VVPAT)",
                "ballot_marking_device", "Ballot Marking Device",
                "scanner", "Scanner",
                "mixed", "Mixed Equipment");
    }
}
