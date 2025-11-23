package edu.sbu.cse416.app.dto.votingequipment;

public record VotingEquipmentDTO(
        String state,
        String stateFips,
        Integer dreNoVVPAT,
        Integer dreWithVVPAT,
        Integer ballotMarkingDevice,
        Integer scanner) {}
