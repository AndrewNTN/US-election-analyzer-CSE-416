package edu.sbu.cse416.app.dto.statecomparison;

import java.util.List;
import java.util.Map;

public record StateComparisonResponse(
        List<StateComparisonRow> data,
        String republicanState,
        String democraticState) {
}
