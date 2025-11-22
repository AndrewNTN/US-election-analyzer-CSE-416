package edu.sbu.cse416.app.dto.optinoptout;

import java.util.List;

public record OptInOptOutComparisonResponse(
        List<OptInOptOutComparisonRow> data,
        String optInState,
        String optOutWithSameDayState,
        String optOutWithoutSameDayState) {}
