package edu.sbu.cse416.app.model;

import java.util.List;
import java.util.Map;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "ei_data")
public class EIData {
    @Id
    private String id;

    private String type;
    private String state;
    private Map<String, Map<String, List<Point>>> demographics;
    private String summary;

    public static class Point {
        private double x;
        private double y;

        public Point() {}

        public Point(double x, double y) {
            this.x = x;
            this.y = y;
        }

        public double getX() {
            return x;
        }

        public void setX(double x) {
            this.x = x;
        }

        public double getY() {
            return y;
        }

        public void setY(double y) {
            this.y = y;
        }
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Map<String, Map<String, List<Point>>> getDemographics() {
        return demographics;
    }

    public void setDemographics(Map<String, Map<String, List<Point>>> demographics) {
        this.demographics = demographics;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }
}
