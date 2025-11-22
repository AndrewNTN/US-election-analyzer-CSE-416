package edu.sbu.cse416.app.dto.statecomparison;

import java.util.List;

public record StateComparisonResponse(List<StateComparisonRow> data, String republicanState, String democraticState) {}
