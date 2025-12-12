package edu.sbu.cse416.app.config;

import edu.sbu.cse416.app.model.EavsData;
import edu.sbu.cse416.app.repository.EavsDataRepository;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private EavsDataRepository eavsRepo;

    // ✅ helper function must be defined at class level, not inside run()
    private double parseVal(String s) {
        try {
            double v = Double.parseDouble(s.trim());
            return (v < 0) ? 0 : v; // EAVS uses -99/-88 as missing
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public void run(String... args) throws Exception {
        if (eavsRepo.count() > 0) {
            System.out.println("✅ EAVS data already seeded, skipping.");
            return; // don’t reseed if data already exists
        }

        int counter = 0;

        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                new ClassPathResource("2024_EAVS_for_Public_Release_nolabel_V1.csv").getInputStream()))) {
            String line;
            boolean isHeader = true;

            while ((line = br.readLine()) != null) {
                if (isHeader) { // skip header
                    isHeader = false;
                    continue;
                }

                String[] values = line.split(",");
                if (values.length < 500) continue;

                String fipsCode = values[0].replace("\"", "");
                String jurisdictionName = values[1].replace("\"", "");
                String stateFull = values[2].replace("\"", "");
                String stateAbbr = values[3].replace("\"", "");

                int E2a = 379;
                int E2b = 380;
                int E2c = 381;
                int E2d = 382;
                int E2e = 383;
                int E2f = 384;
                int E2g = 385;
                int E2h = 386;
                int E2i = 387;

                edu.sbu.cse416.app.model.ProvisionalBallots prov = new edu.sbu.cse416.app.model.ProvisionalBallots(
                        (int) parseVal(values[E2a]), // totalProvisionalBallotsCast
                        (int) parseVal(values[E2b]), // provisionalBallotsFullyCounted
                        (int) parseVal(values[E2c]), // provisionalBallotsPartiallyCounted
                        (int) parseVal(values[E2d]), // provisionalBallotsRejected
                        (int) parseVal(values[E2e]), // reasonNoRegistration
                        (int) parseVal(values[E2f]), // reasonNameNotFound
                        values.length > E2i ? values[E2i].replace("\"", "") : "" // provisionalComments
                        );

                EavsData data = new EavsData(
                        null,
                        fipsCode,
                        jurisdictionName,
                        stateFull,
                        stateAbbr,
                        2024,
                        new edu.sbu.cse416.app.model.VoterRegistration(0, 0, 0, "not loaded yet"),
                        new edu.sbu.cse416.app.model.MailBallots(0, 0, 0, "not loaded yet"),
                        prov,
                        null);

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
