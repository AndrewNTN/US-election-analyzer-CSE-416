package edu.sbu.cse416.app.config;

import edu.sbu.cse416.app.model.EavsData;
import edu.sbu.cse416.app.model.MailBallotsRejectedReason;
import edu.sbu.cse416.app.model.ProvisionalBallots;
import edu.sbu.cse416.app.model.VoterDeletion;
import edu.sbu.cse416.app.model.VoterRegistration;
import edu.sbu.cse416.app.repository.EavsDataRepository;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final int COL_FIPS = 0;
private static final int COL_JURISDICTION = 1;
private static final int COL_STATE_FULL = 2;
private static final int COL_STATE_ABBR = 3;

// A1a–A1c
private static final int COL_A1a = 4;
private static final int COL_A1b = 5;
private static final int COL_A1c = 6;

// A12b–A12h
private static final int COL_A12b = 7;
private static final int COL_A12c = 8;
private static final int COL_A12d = 9;
private static final int COL_A12e = 10;
private static final int COL_A12f = 11;
private static final int COL_A12g = 12;
private static final int COL_A12h = 13;

// C1a, C3a, C5a, F1f
private static final int COL_C1a = 14;
private static final int COL_C3a = 15;
private static final int COL_C5a = 16;
private static final int COL_F1f = 50;

// C9b–C9q
private static final int COL_C9b = 17;
private static final int COL_C9c = 18;
private static final int COL_C9d = 19;
private static final int COL_C9e = 20;
private static final int COL_C9f = 21;
private static final int COL_C9g = 22;
private static final int COL_C9h = 23;
private static final int COL_C9i = 24;
private static final int COL_C9j = 25;
private static final int COL_C9k = 26;
private static final int COL_C9l = 27;
private static final int COL_C9m = 28;
private static final int COL_C9n = 29;
private static final int COL_C9o = 30;
private static final int COL_C9p = 31;
private static final int COL_C9q = 32;

// E1a–E1e
private static final int COL_E1a = 33;
private static final int COL_E1b = 34;
private static final int COL_E1c = 35;
private static final int COL_E1d = 36;
private static final int COL_E1e = 37;

// E2a–E2i
private static final int COL_E2a = 38;
private static final int COL_E2b = 39;
private static final int COL_E2c = 40;
private static final int COL_E2d = 41;
private static final int COL_E2e = 42;
private static final int COL_E2f = 43;
private static final int COL_E2g = 44;
private static final int COL_E2h = 45;
private static final int COL_E2i = 46;

// E2j–E2l
private static final int COL_E2j = 47;
private static final int COL_E2k = 48;
private static final int COL_E2l = 49;


    @Autowired
    private EavsDataRepository eavsRepo;

    // parse numeric fields, treating negative codes (-88, -99, etc.) as 0
    private double parseVal(String s) {
        if (s == null) return 0;
        String t = s.replace("\"", "").trim();
        if (t.isEmpty()) return 0;
        try {
            double v = Double.parseDouble(t);
            return v < 0 ? 0 : v;
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    private int getInt(String[] values, int idx) {
        if (idx < 0 || idx >= values.length) return 0;
        return (int) parseVal(values[idx]);
    }

    private String getString(String[] values, int idx) {
        if (idx < 0 || idx >= values.length) return null;
        return values[idx] == null ? null : values[idx].replace("\"", "").trim();
    }

    @Override
    public void run(String... args) throws Exception {
        if (eavsRepo.count() > 0) {
            System.out.println("✅ EAVS data already seeded, skipping.");
            return;
        }

        int counter = 0;

        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(
                        new ClassPathResource("eavs_trimmed.csv")
                                .getInputStream()
                )
        )) {
            String line;
            boolean isHeader = true;

            while ((line = br.readLine()) != null) {
                if (isHeader) {
                    isHeader = false; // skip header row
                    continue;
                }

                // keep empty trailing columns
                String[] values = line.split(",", -1);
                // sanity – we need at least up to F1f
                if (values.length <= COL_F1f) continue;

                // basic identifying info
                String fipsCode = getString(values, COL_FIPS);
                String jurisdictionName = getString(values, COL_JURISDICTION);
                String stateFull = getString(values, COL_STATE_FULL);
                String stateAbbr = getString(values, COL_STATE_ABBR);

                if (fipsCode == null || fipsCode.isBlank()) {
                    // skip summary / bad rows
                    continue;
                }

                // --- VoterRegistration: A1a–A1c ---
                VoterRegistration voterRegistration = new VoterRegistration(
                        getInt(values, COL_A1a),  // totalRegistered
                        getInt(values, COL_A1b),  // totalActive
                        getInt(values, COL_A1c)  // totalInactive
                );

                // --- VoterDeletion: A12b–A12h (and compute total) ---
                int removedMoved          = getInt(values, COL_A12b);
                int removedDeath          = getInt(values, COL_A12c);
                int removedFelony         = getInt(values, COL_A12d);
                int removedFailResponse   = getInt(values, COL_A12e);
                int removedIncompetent    = getInt(values, COL_A12f);
                int removedVoterRequest   = getInt(values, COL_A12g);
                int removedDuplicate      = getInt(values, COL_A12h);
                int removedTotal          = removedMoved + removedDeath + removedFelony
                        + removedFailResponse + removedIncompetent + removedVoterRequest + removedDuplicate;

                VoterDeletion voterDeletion = new VoterDeletion(
                        removedTotal,
                        removedMoved,
                        removedDeath,
                        removedFelony,
                        removedFailResponse,
                        removedIncompetent,
                        removedVoterRequest,
                        removedDuplicate
                );

                // --- MailBallotsRejectedReason: C9b–C9q ---
                MailBallotsRejectedReason mailRejected = new MailBallotsRejectedReason(
                        getInt(values, COL_C9b),  // late
                        getInt(values, COL_C9c),  // missingVoterSignature
                        getInt(values, COL_C9d),  // missingWitnessSignature
                        getInt(values, COL_C9e),  // nonMatchingVoterSignature
                        getInt(values, COL_C9f),  // unofficialEnvelope
                        getInt(values, COL_C9g),  // ballotMissingFromEnvelope
                        getInt(values, COL_C9h),  // noSecrecyEnvelope
                        getInt(values, COL_C9i),  // multipleBallotsInOneEnvelope
                        getInt(values, COL_C9j),  // envelopeNotSealed
                        getInt(values, COL_C9k),  // noPostmark
                        getInt(values, COL_C9l),  // noResidentAddressOnEnvelope
                        getInt(values, COL_C9m),  // voterDeceased
                        getInt(values, COL_C9n),  // voterAlreadyVoted
                        getInt(values, COL_C9o),  // missingDocumentation
                        getInt(values, COL_C9p),  // voterNotEligible
                        getInt(values, COL_C9q)   // noBallotApplication
                );

                // --- ProvisionalBallots: E1a–E1e, E2a–E2i, (E2j + E2k + E2l) ---
                int e1a = getInt(values, COL_E1a);
                int e1b = getInt(values, COL_E1b);
                int e1c = getInt(values, COL_E1c);
                int e1d = getInt(values, COL_E1d);
                int e1e = getInt(values, COL_E1e);

                int e2a = getInt(values, COL_E2a);
                int e2b = getInt(values, COL_E2b);
                int e2c = getInt(values, COL_E2c);
                int e2d = getInt(values, COL_E2d);
                int e2e = getInt(values, COL_E2e);
                int e2f = getInt(values, COL_E2f);
                int e2g = getInt(values, COL_E2g);
                int e2h = getInt(values, COL_E2h);
                int e2i = getInt(values, COL_E2i);

                int otherReasonsSum =
                        getInt(values, COL_E2j)
                      + getInt(values, COL_E2k)
                      + getInt(values, COL_E2l);

                ProvisionalBallots provisional = new ProvisionalBallots(
                        // E1a–E1e
                        e1a,  // totalProv
                        e1b,  // provCountFullyCounted
                        e1c,  // provCountPartialCounted
                        e1d,  // provRejected
                        e1e,  // provisionalOtherStatus
                        // E2a–E2i
                        e2a,  // provReasonVoterNotOnList
                        e2b,  // provReasonVoterLackedID
                        e2c,  // provReasonElectionOfficialChallengedEligibility
                        e2d,  // provReasonAnotherPersonChallengedEligibility
                        e2e,  // provReasonVoterNotResident
                        e2f,  // provReasonVoterRegistrationNotUpdated
                        e2g,  // provReasonVoterDidNotSurrenderMailBallot
                        e2h,  // provReasonJudgeExtendedVotingHours
                        e2i,  // provReasonVoterUsedSDR
                        // E2j–E2l sum
                        otherReasonsSum
                );

                // --- Top-level mail / early-voting aggregates ---
                Integer mailTransmittedTotal      = getInt(values, COL_C1a);
                Integer dropBoxesTotal            = getInt(values, COL_C3a);
                Integer totalDropBoxesEarlyVoting = getInt(values, COL_C5a);
                Integer inPersonEarlyVoting       = getInt(values, COL_F1f);

                EavsData row = new EavsData(
                        null,               // id – Mongo will fill
                        fipsCode,
                        jurisdictionName,
                        stateFull,
                        stateAbbr,
                        2024,               // electionYear
                        voterRegistration,
                        mailRejected,
                        provisional,
                        voterDeletion,
                        mailTransmittedTotal,
                        dropBoxesTotal,
                        totalDropBoxesEarlyVoting,
                        inPersonEarlyVoting
                );

                eavsRepo.save(row);
                counter++;
            }

            System.out.println("✅ Seeded " + counter + " EAVS records into Mongo.");
        } catch (Exception e) {
            System.err.println("❌ Failed to seed EAVS data: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
