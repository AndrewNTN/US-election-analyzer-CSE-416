package edu.sbu.cse416.app.model;

public record EquipmentDetail(
        String make,
        String model,
        Integer quantity,
        Integer age,
        String underlyingOs,
        Boolean vvsgCertified,
        String certificationLevel,
        Integer scanRate,
        Double errorRate,
        String equipmentType) {}
