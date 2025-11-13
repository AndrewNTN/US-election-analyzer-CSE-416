package edu.sbu.cse416.app.dto.geojson;

import java.util.List;

public record GeoJsonResponse<T>(String type, List<T> features) {
    public static <T> GeoJsonResponse<T> of(List<T> features) {
        return new GeoJsonResponse<>("FeatureCollection", features);
    }
}
