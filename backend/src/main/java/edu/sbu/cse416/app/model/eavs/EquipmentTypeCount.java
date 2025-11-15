package edu.sbu.cse416.app.model.eavs;

// Will need these counts for 2016, 2020, 2024 eavs data
public record EquipmentTypeCount(
        Integer dreNoVVPAT,
        Integer dreWithVVPAT,
        Integer ballotMarkingDevice,
        Integer scanner
) {
}
