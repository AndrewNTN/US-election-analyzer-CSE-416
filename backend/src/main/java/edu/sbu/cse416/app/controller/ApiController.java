package edu.sbu.cse416.app.controller;

import edu.sbu.cse416.app.model.State;
import edu.sbu.cse416.app.service.StateServiceImpl;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final StateServiceImpl stateService;

    public ApiController(StateServiceImpl stateService) {
        this.stateService = stateService;
    }

    @GetMapping("/health")
    public String health() {
        return "ok";
    }

    @GetMapping("/states/team/{team}")
    public List<State> byTeam(@PathVariable String team) {
        return stateService.getStatesByTeam(team);
    }

    @GetMapping("/states")
    public List<State> getAllStates() {
        return stateService.getAllStates();
    }

    @GetMapping("/states/{id}")
    public State getStateById(@PathVariable String id) {
        return stateService.getStateById(id);
    }
}
