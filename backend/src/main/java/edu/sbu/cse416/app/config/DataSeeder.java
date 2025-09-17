package edu.sbu.cse416.app.config;

import edu.sbu.cse416.app.model.State;
import edu.sbu.cse416.app.repository.StateRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final StateRepository stateRepository;

    public DataSeeder(StateRepository stateRepository) {
        this.stateRepository = stateRepository;
    }

    @Override
    public void run(String... args) {
        if (stateRepository.count() == 0) {
            stateRepository.saveAll(List.of(
                    new State("CA", "California", "LAKERS"),
                    new State("OR", "Oregon", "LAKERS"),
                    new State("FL", "Florida", "LAKERS")));
        }
    }
}
