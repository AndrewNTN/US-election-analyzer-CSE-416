package edu.sbu.cse416.app.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import java.util.Random;

import edu.sbu.cse416.app.model.EavsData;
import edu.sbu.cse416.app.repository.EavsDataRepository;

import java.io.BufferedReader;
import java.io.InputStreamReader;
@Component
public class DataSeeder implements CommandLineRunner {

    private static final int COL_FIPS = 0;
    private static final int COL_JURISDICTION = 1;
    private static final int COL_STATE_FULL = 2;
    private static final int COL_STATE_ABBR = 3;
    // E1a-E1e, 
    private static final int COL_E1a = 386;
    private static final int COL_E1b = 387;
    private static final int COL_E1c = 388;
    private static final int COL_E1d = 389;
    private static final int COL_E1e = 391;
    // E2a-E2i,
    private static final int COL_E2a = 393;
    private static final int COL_E2b = 394;
    private static final int COL_E2c = 395;
    private static final int COL_E2d = 396;
    private static final int COL_E2e = 397;
    private static final int COL_E2f = 398;
    private static final int COL_E2g = 399;
    private static final int COL_E2h = 400;
    private static final int COL_E2i = 401;
    // (one var) sum of E2j E2k E2l



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
                new ClassPathResource("2024_EAVS_for_Public_Release_nolabel_V1.csv").getInputStream()
        ))) {
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


                // 
                


                // , A1a-A1c, A12b-A12h, C9b-C9q, C3a, F1f, C5a, C1a, C3a 


                edu.sbu.cse416.app.model.ProvisionalBallots prov =
                    new edu.sbu.cse416.app.model.ProvisionalBallots(
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
                    new edu.sbu.cse416.app.model.VoterRegistration(
                        0, 0, 0, "not loaded yet"
                    ),
                    new edu.sbu.cse416.app.model.MailBallots(
                        0, 0, 0, "not loaded yet"
                    ),
                    prov,
                    null
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
