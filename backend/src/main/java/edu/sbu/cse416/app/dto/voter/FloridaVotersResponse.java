package edu.sbu.cse416.app.dto.voter;

import java.util.List;

public record FloridaVotersResponse(
        List<String> metricLabels, List<FloridaVoterDTO> voters, int totalPages, long totalElements) {}
