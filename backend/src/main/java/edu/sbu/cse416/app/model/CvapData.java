package edu.sbu.cse416.app.model;

public record CvapData(
        String geoid,
        String countyName,
        String stateName,
        Integer totalCvapEstimate,
        Integer asian,
        Integer black,
        Integer white,
        Integer hispanic
) {
}
