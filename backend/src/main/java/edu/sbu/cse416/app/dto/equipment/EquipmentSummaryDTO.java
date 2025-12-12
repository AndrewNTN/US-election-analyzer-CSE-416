package edu.sbu.cse416.app.dto.equipment;

/**
 * DTO for equipment summary table (modal view).
 * Maps to the EquipmentSummary type in frontend.
 */
public record EquipmentSummaryDTO(
        String make,
        String model,
        Integer quantity,
        Integer age,
        String operatingSystem,
        String certification,
        String scanRate,
        Double errorRate,
        Double reliability,
        Double quality) {}
