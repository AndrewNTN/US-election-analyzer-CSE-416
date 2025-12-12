package edu.sbu.cse416.app.dto.equipment;

/**
 * DTO for state-level equipment summary table.
 * Maps to the StateEquipmentSummary type in frontend.
 */
public record StateEquipmentSummaryDTO(
        String make,
        String model,
        Integer quantity,
        String equipmentType,
        String description,
        Integer age,
        String operatingSystem,
        String certification,
        String scanRate,
        Double errorRate,
        Double reliability,
        Boolean discontinued) {}
