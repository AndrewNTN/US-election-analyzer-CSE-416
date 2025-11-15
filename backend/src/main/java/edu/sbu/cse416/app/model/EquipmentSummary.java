package edu.sbu.cse416.app.model;

public record EquipmentSummary(
    String make,
    String model,
    Integer quantity,
    String equipmentType,
    String description,
    Integer age,
    String operatingSystem,
    String certification,
    Double scanRate,
    Double errorRate,
    Double reliability,
    Boolean discontinued,
    Double quality,
    String stateFips
) {
}
