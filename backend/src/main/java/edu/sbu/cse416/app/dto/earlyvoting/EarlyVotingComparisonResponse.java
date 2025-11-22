package edu.sbu.cse416.app.dto.earlyvoting;

import java.util.List;

public record EarlyVotingComparisonResponse(
        List<EarlyVotingComparisonRow> data, String republicanState, String democraticState) {}
