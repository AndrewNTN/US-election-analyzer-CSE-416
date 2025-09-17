package edu.sbu.cse416.app.model;

import java.util.List;

public record VotingEquipment(
        List<EquipmentDetail> dreNoVvpat,
        List<EquipmentDetail> dreWithVvpat,
        List<EquipmentDetail> ballotMarkingDevices,
        List<EquipmentDetail> opticalScanners) {}
