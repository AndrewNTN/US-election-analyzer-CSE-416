package edu.sbu.cse416.app.dto.equipment;

/**
 * County-level data point for the equipment quality vs rejected ballots bubble
 * chart.
 * Each record represents one county on the chart.
 */
public record EquipmentQualityChartDTO(
        String county,
        Double equipmentQuality, // x-axis: calculated quality score (0-100)
        Double rejectedBallotPercentage, // y-axis
        Integer totalBallots, // bubble size
        Integer rejectedBallots,
        String dominantParty, // "republican" or "democratic"
        Integer mailInRejected,
        Integer provisionalRejected,
        Integer uocavaRejected) {}
