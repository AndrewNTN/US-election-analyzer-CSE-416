package edu.sbu.cse416.app.model.geojson;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("counties_geojson")
public record CountyGeoJson(@Id String id, String type, Properties properties, Geometry geometry) {

    public record Properties(String geoid, String stateName, String countyName) {}

    public record Geometry(String type, Object coordinates) {}
}
