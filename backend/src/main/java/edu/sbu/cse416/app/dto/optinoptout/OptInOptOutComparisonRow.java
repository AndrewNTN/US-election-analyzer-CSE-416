package edu.sbu.cse416.app.dto.optinoptout;

public record OptInOptOutComparisonRow(
        String metric, String optInValue, String optOutWithSameDayValue, String optOutWithoutSameDayValue) {}
