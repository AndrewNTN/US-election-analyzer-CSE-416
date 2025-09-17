package edu.sbu.cse416.app;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import java.util.List;

interface StateRepo extends MongoRepository<State,String> {
  List<State> findByTeamTag(String teamTag);
}

@RestController @RequestMapping("/api")
class ApiController {
  private final StateRepo repo;
  ApiController(StateRepo repo){ this.repo=repo; }
  @GetMapping("/health") public String health(){ return "ok"; }
  @GetMapping("/states/team/{team}") public List<State> byTeam(@PathVariable String team){
    return repo.findByTeamTag(team);
  }
}

@Component
class Seed implements CommandLineRunner {
  private final StateRepo repo;
  Seed(StateRepo repo){ this.repo=repo; }
  @Override public void run(String... args){
    if (repo.count()==0){
      repo.saveAll(List.of(
        new State("CA","California","LAKERS"),
        new State("OR","Oregon","LAKERS"),
        new State("FL","Florida","LAKERS")
      ));
    }
  }
}
