package edu.sbu.cse416.app.model.registration;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "florida_voters")
@CompoundIndex(def = "{'countyName': 1, 'party': 1, 'name': 1}")
public record Voter(String name, String countyName, String party, String address, String email) {}
