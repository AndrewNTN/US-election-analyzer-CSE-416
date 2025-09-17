package edu.sbu.cse416.app.service;

import edu.sbu.cse416.app.model.State;
import java.util.List;

public interface StateService {
    List<State> getStatesByTeam(String teamTag);

    List<State> getAllStates();

    State getStateById(String id);
}
