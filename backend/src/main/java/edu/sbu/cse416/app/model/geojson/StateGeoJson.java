package edu.sbu.cse416.app.model.geojson;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("states_geojson")
public record StateGeoJson(@Id String id, String type, Properties properties, Geometry geometry) {

    public record Properties(String stateFips, String stateName) {}

    public record Geometry(String type, Object coordinates) {}
}
