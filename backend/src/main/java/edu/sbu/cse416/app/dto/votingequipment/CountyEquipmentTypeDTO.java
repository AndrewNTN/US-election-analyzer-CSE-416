package edu.sbu.cse416.app.dto.votingequipment;

public record CountyEquipmentTypeDTO(
        String fipsCode,
        String jurisdictionName,
        String equipmentType,
        Integer dreNoVVPAT,
        Integer dreWithVVPAT,
        Integer ballotMarkingDevice,
        Integer scanner) {}
