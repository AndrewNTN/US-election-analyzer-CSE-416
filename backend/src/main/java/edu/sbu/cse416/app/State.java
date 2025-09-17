package edu.sbu.cse416.app;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("states")
public class State {
  @Id public String id;      // "CA", "OR", "FL"
  public String name;
  public String teamTag;     // "LAKERS"
  public State() {}
  public State(String id, String name, String teamTag){ this.id=id; this.name=name; this.teamTag=teamTag; }
}
