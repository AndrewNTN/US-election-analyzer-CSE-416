package edu.sbu.cse416.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * MongoDB document for voting equipment data.
 * Stores detailed information about each equipment model.
 */
@Document("equipment_data")
public record EquipmentData(
        @Id String id,
        // Basic identification
        String manufacturer, // Maps to "Make" in table
        String modelName, // Maps to "Model" in table
        String equipmentType, // Maps to "Type" (BMD, Scanner, DRE, etc.)

        // Manufacturing info
        Integer firstManufactured, // Year
        Integer lastManufactured, // Year (null if still active)
        Boolean discontinued,

        // Technical specs
        String operatingSystem,
        String firmwareVersion,
        String batteryLife,
        String scanningRate, // Raw string like "72 ballots/minute"

        // Compliance
        Boolean hasVvpat, // VVPAT support
        Integer paperCapacity,
        String certificationLevel,

        // Quality/Risk
        String securityRisks,
        String notes,

        // Calculated metrics
        Integer ageYears, // Calculated from manufacturing dates
        String scanRate, // Raw scanning rate from CSV (e.g., "300 ballots/minute")
        Double errorRate, // Simulated
        Double reliability, // Simulated
        Double qualityScore, // Calculated 0-1

        // State association (null for general, "12" for Florida, etc.)
        String stateFips) {}
