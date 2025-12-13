package edu.sbu.cse416.app.service;

import edu.sbu.cse416.app.model.EIData;
import edu.sbu.cse416.app.repository.EIDataRepository;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EIDataService {

    @Autowired
    private EIDataRepository eiDataRepository;

    public EIData getEIData(String type, String state) {
        // Default to FL if state is not provided or handle appropriately
        // Currently scripts only support FL
        String targetState = (state != null && !state.isEmpty()) ? state : "FL";

        // Map FIPS prefix (e.g. "12") to state abbr ("FL") if necessary
        // For now assuming state abbr is passed or we default to FL
        if ("12".equals(targetState)) targetState = "FL";

        Optional<EIData> data = eiDataRepository.findByTypeAndState(type, targetState);
        return data.orElse(null);
    }
}
