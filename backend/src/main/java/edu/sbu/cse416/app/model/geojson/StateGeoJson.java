package edu.sbu.cse416.app.model.geojson;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("states_geojson")
public record StateGeoJson(@Id String id, String type, Properties properties, Geometry geometry) {

    public record Properties(
            String stateName, String density, String stateFips, String stateAbbr, Double EQUIPMENT_AGE) {}

    public record Geometry(String type, Object coordinates) {}
}
