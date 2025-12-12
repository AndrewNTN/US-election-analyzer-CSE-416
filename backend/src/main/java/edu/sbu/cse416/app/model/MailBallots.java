package edu.sbu.cse416.app.model;

public record MailBallots(
        Integer totalMailBallotsTransmitted,
        Integer rejectedNoSignature,
        Integer rejectedSignatureMismatch,
        String rejectionComments) {}
