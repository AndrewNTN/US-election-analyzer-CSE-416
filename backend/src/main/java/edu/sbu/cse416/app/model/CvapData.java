package edu.sbu.cse416.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("cvap_data")
public record CvapData(
        @Id String id,
        String geoid,
        String countyName,
        String stateName,
        Integer totalCvapEstimate,
        Integer asian,
        Integer black,
        Integer white,
        Integer hispanic) {}

