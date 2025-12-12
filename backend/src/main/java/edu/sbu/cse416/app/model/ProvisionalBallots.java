package edu.sbu.cse416.app.model;

public record ProvisionalBallots(
        Integer totalProvisionalBallotsCast,
        Integer provisionalBallotsFullyCounted,
        Integer provisionalBallotsPartiallyCounted,
        Integer provisionalBallotsRejected,
        Integer reasonNoRegistration,
        Integer reasonNameNotFound,
        String provisionalComments) {}
