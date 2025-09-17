package edu.sbu.cse416.app.service;

import edu.sbu.cse416.app.model.State;
import edu.sbu.cse416.app.repository.StateRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class StateServiceImpl implements StateService {
    private final StateRepository stateRepository;

    public StateServiceImpl(StateRepository stateRepository) {
        this.stateRepository = stateRepository;
    }

    @Override
    public List<State> getStatesByTeam(String teamTag) {
        return stateRepository.findByTeamTag(teamTag);
    }

    @Override
    public List<State> getAllStates() {
        return stateRepository.findAll();
    }

    @Override
    public State getStateById(String id) {
        return stateRepository.findById(id).orElse(null);
    }
}
