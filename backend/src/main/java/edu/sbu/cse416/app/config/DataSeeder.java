package edu.sbu.cse416.app.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;

import edu.sbu.cse416.app.model.EavsData;
import edu.sbu.cse416.app.repository.EavsDataRepository;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private EavsDataRepository eavsRepo;

    @Override
    public void run(String... args) throws Exception {
        if (eavsRepo.count() > 0) {
            System.out.println("✅ EAVS data already seeded, skipping.");
            return; // don’t reseed if data already exists
        }

        int counter = 0;

        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                new ClassPathResource("2024_EAVS_for_Public_Release_nolabel_V1.csv").getInputStream()
        ))) {
            String line;
            boolean isHeader = true;

            while ((line = br.readLine()) != null) {
                if (isHeader) { // skip header
                    isHeader = false;
                    continue;
                }

                String[] values = line.split(","); // CSV is comma-delimited

                if (values.length < 4) continue; // sanity check

                // Map the first 4 fields into our record
                String fipsCode = values[0].replace("\"", "");
                String jurisdictionName = values[1].replace("\"", "");
                String stateFull = values[2].replace("\"", "");
                String stateAbbr = values[3].replace("\"", "");

                EavsData data = new EavsData(
                        null,              // id → Mongo will generate
                        fipsCode,
                        jurisdictionName,
                        stateFull,
                        stateAbbr,
                        2024,              // electionYear
                        null,              // voterRegistration
                        null,              // mailBallots
                        null,              // provisionalBallots
                        null               // votingEquipment
                );

                eavsRepo.save(data);
                counter++;
            }

            System.out.println("✅ Seeded " + counter + " rows from EAVS CSV into Mongo.");
        } catch (Exception e) {
            System.err.println("❌ Failed to read/seed CSV: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
