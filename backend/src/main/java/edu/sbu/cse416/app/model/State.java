package edu.sbu.cse416.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("states")
public record State(@Id String id, String name, String teamTag) {}
