package edu.sbu.cse416.app.model.eavs;

public record VoterDeletion(
        // A12b-A12h
        Integer removedTotal,
        Integer removedMoved,
        Integer removedDeath,
        Integer removedFelony,
        Integer removedFailResponse,
        Integer removedIncompetentToVote,
        Integer removedVoterRequest,
        Integer removedDuplicateRecords) {}
