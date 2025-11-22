"""
Load EAVS (Election Administration and Voting Survey) data into MongoDB.
Uses pandas for efficient data processing and transformation.
Supports data from 2016-2024 with year-specific column mappings.
"""

import pandas as pd
from pymongo import MongoClient
import os
from pathlib import Path

# MongoDB connection settings
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = "cse416"
COLLECTION_NAME = "eavs_data"

# Path to resources directory
RESOURCES_DIR = Path(__file__).parent.parent / "src" / "main" / "resources"

# CSV files for each year
CSV_FILES = {
    2024: "2024_EAVS_for_Public_Release_nolabel_V1.csv",
    2022: "2022_EAVS_for_Public_Release_nolabel_V1.1_CSV.csv",
    2020: "2020_EAVS_for_Public_Release_nolabel_V1.2_CSV.csv",
    2018: "EAVS_2018_for_Public_Release_Updates3.csv",
    2016: "EAVS_2016_Final_Data_for_Public_Release_nolabel_V1.1_CSV.csv"
}


def clean_numeric_value(val):
    """
    Clean numeric values: treat negative codes (-88, -99, etc.) as 0,
    handle missing values, and convert to int.
    """
    if pd.isna(val):
        return 0
    try:
        num = float(val)
        return int(num) if num >= 0 else 0
    except (ValueError, TypeError):
        return 0


def load_eavs_2024(collection, csv_path):
    """Load and transform 2024 EAVS data with full details."""

    print(f"Reading 2024 CSV from: {csv_path}")

    # Read CSV with pandas
    df = pd.read_csv(csv_path, dtype=str)

    # Strip quotes and whitespace from all string columns
    df = df.apply(lambda x: x.str.strip().str.strip('"') if x.dtype == "object" else x)

    # Filter out rows with missing or blank FIPS codes
    df = df[df["FIPSCode"].notna() & (df["FIPSCode"].str.strip() != "")]

    print(f"Processing {len(df)} records...")

    # Define column groups for nested documents
    voter_registration_cols = ["A1a", "A1b", "A1c"]
    voter_deletion_cols = ["A12b", "A12c", "A12d", "A12e", "A12f", "A12g", "A12h"]
    mail_rejected_cols = ["C9b", "C9c", "C9d", "C9e", "C9f", "C9g", "C9h", "C9i",
                          "C9j", "C9k", "C9l", "C9m", "C9n", "C9o", "C9p", "C9q"]
    provisional_e1_cols = ["E1a", "E1b", "E1c", "E1d", "E1e"]
    provisional_e2_cols = ["E2a", "E2b", "E2c", "E2d", "E2e", "E2f", "E2g", "E2h", "E2i"]
    provisional_e2_other_cols = ["E2j", "E2k", "E2l"]
    equipment_cols = [
        "F3c_1", "F3c_2", "F3c_3",
        "F4c_1", "F4c_2", "F4c_3",
        "F5c_1", "F5c_2", "F5c_3",
        "F6c_1", "F6c_2", "F6c_3",
    ]

    # Apply numeric cleaning to all relevant columns
    numeric_cols = (voter_registration_cols + voter_deletion_cols + mail_rejected_cols +
                    provisional_e1_cols + provisional_e2_cols + provisional_e2_other_cols +
                    equipment_cols + ["C1b", "C6a", "C5a", "F1f", "F1b", "C8a", "C9a", "B24a"]
                    )

    for col in numeric_cols:
        if col in df.columns:
            df[col] = df[col].apply(clean_numeric_value)

    # Build list of documents for MongoDB
    documents = []

    for _, row in df.iterrows():
        # Calculate voter deletion total
        voter_deletion_total = sum(row[col] for col in voter_deletion_cols if col in row)

        # Calculate provisional other reasons sum
        provisional_other_sum = sum(row[col] for col in provisional_e2_other_cols if col in row)

        # Equipment type counts
        dre_no_vvpat = sum(row[col] for col in ["F3c_1", "F3c_2", "F3c_3"] if col in row)
        dre_with_vvpat = sum(row[col] for col in ["F4c_1", "F4c_2", "F4c_3"] if col in row)
        ballot_marking_device = sum(row[col] for col in ["F5c_1", "F5c_2", "F5c_3"] if col in row)
        scanner = sum(row[col] for col in ["F6c_1", "F6c_2", "F6c_3"] if col in row)

        # Calculate ballot statistics
        # Total ballots = F1b (election day ballots) + C8a (counted mail ballots) + F1f (Early In-Person Ballots Counted) + E1b (provisional ballots counted)
        election_day_ballots = row.get("F1b", 0)
        counted_mail_ballots = row.get("C8a", 0)
        early_in_person_counted = row.get("F1f", 0)
        provisional_counted = row.get("E1b", 0)
        total_ballots = election_day_ballots + counted_mail_ballots + early_in_person_counted + provisional_counted

        # Total Rejected ballots = C9a (mail-in ballots rejected) + E1d (provisional ballots rejected) + B24a (UOCAVA ballots rejected)
        mail_rejected = row.get("C9a", 0)
        provisional_rejected = row.get("E1d", 0)
        uocava_rejected = row.get("B24a", 0)
        total_rejected_ballots = mail_rejected + provisional_rejected + uocava_rejected

        # Rejected ballots % = total rejected ballots / total ballots (avoid division by zero)
        percentage_rejected_ballots = (total_rejected_ballots / total_ballots * 100.0) if total_ballots > 0 else 0.0

        # Build the document structure matching the Java model
        document = {
            "fipsCode": row["FIPSCode"],
            "jurisdictionName": row["Jurisdiction_Name"],
            "stateFull": row["State_Full"],
            "stateAbbr": row["State_Abbr"],
            "electionYear": 2024,

            # Voter Registration (A1a-A1c)
            "voterRegistration": {
                "totalRegistered": row.get("A1a", 0),
                "totalActive": row.get("A1b", 0),
                "totalInactive": row.get("A1c", 0)
            },

            # Mail Ballots Rejected Reason (C9b-C9q)
            "mailBallotsRejectedReason": {
                "late": row.get("C9b", 0),
                "missingVoterSignature": row.get("C9c", 0),
                "missingWitnessSignature": row.get("C9d", 0),
                "nonMatchingVoterSignature": row.get("C9e", 0),
                "unofficialEnvelope": row.get("C9f", 0),
                "ballotMissingFromEnvelope": row.get("C9g", 0),
                "noSecrecyEnvelope": row.get("C9h", 0),
                "multipleBallotsInOneEnvelope": row.get("C9i", 0),
                "envelopeNotSealed": row.get("C9j", 0),
                "noPostmark": row.get("C9k", 0),
                "noResidentAddressOnEnvelope": row.get("C9l", 0),
                "voterDeceased": row.get("C9m", 0),
                "voterAlreadyVoted": row.get("C9n", 0),
                "missingDocumentation": row.get("C9o", 0),
                "voterNotEligible": row.get("C9p", 0),
                "noBallotApplication": row.get("C9q", 0)
            },

            # Provisional Ballots (E1a-E1e, E2a-E2i, E2j-E2l)
            "provisionalBallots": {
                "totalProv": row.get("E1a", 0),
                "provCountFullyCounted": row.get("E1b", 0),
                "provCountPartialCounted": row.get("E1c", 0),
                "provRejected": row.get("E1d", 0),
                "provisionalOtherStatus": row.get("E1e", 0),
                "provReasonVoterNotOnList": row.get("E2a", 0),
                "provReasonVoterLackedID": row.get("E2b", 0),
                "provReasonElectionOfficialChallengedEligibility": row.get("E2c", 0),
                "provReasonAnotherPersonChallengedEligibility": row.get("E2d", 0),
                "provReasonVoterNotResident": row.get("E2e", 0),
                "provReasonVoterRegistrationNotUpdated": row.get("E2f", 0),
                "provReasonVoterDidNotSurrenderMailBallot": row.get("E2g", 0),
                "provReasonJudgeExtendedVotingHours": row.get("E2h", 0),
                "provReasonVoterUsedSDR": row.get("E2i", 0),
                "provReasonOther": provisional_other_sum
            },

            # Voter Deletion (A12b-A12h)
            "voterDeletion": {
                "removedTotal": voter_deletion_total,
                "removedMoved": row.get("A12b", 0),
                "removedDeath": row.get("A12c", 0),
                "removedFelony": row.get("A12d", 0),
                "removedFailResponse": row.get("A12e", 0),
                "removedIncompetent": row.get("A12f", 0),
                "removedVoterRequest": row.get("A12g", 0),
                "removedDuplicate": row.get("A12h", 0)
            },

            # Equipment Summary
            "equipment": {
                "dreNoVVPAT": dre_no_vvpat,
                "dreWithVVPAT": dre_with_vvpat,
                "ballotMarkingDevice": ballot_marking_device,
                "scanner": scanner
            },

            # Top-level aggregates
            "mailBallotsCountedTotal": row.get("C1b", 0),
            "dropBoxesTotal": row.get("C6a", 0),
            "totalDropBoxesEarlyVoting": row.get("C5a", 0),
            "inPersonEarlyVoting": row.get("F1f", 0),

            # Ballot statistics
            "totalBallots": total_ballots,
            "totalRejectedBallots": total_rejected_ballots,
            "percentageRejectedBallots": round(percentage_rejected_ballots, 2)
        }

        documents.append(document)

    # Bulk insert into MongoDB
    if documents:
        result = collection.insert_many(documents)
        print(f"Successfully inserted {len(result.inserted_ids)} documents for year 2024")
    else:
        print("No documents to insert for year 2024")


def load_eavs_2022_2020_2018(collection, csv_path, year):
    """Load and transform 2022, 2020, or 2018 EAVS data with limited fields."""

    print(f"Reading {year} CSV from: {csv_path}")

    # Read CSV with pandas
    df = pd.read_csv(csv_path, dtype=str)

    # Strip quotes and whitespace from all string columns
    df = df.apply(lambda x: x.str.strip().str.strip('"') if x.dtype == "object" else x)

    # Filter out rows with missing or blank FIPS codes
    df = df[df["FIPSCode"].notna() & (df["FIPSCode"].str.strip() != "")]

    print(f"Processing {len(df)} records...")

    # Define equipment columns for these years
    equipment_cols = [
        "F5c_1", "F5c_2", "F5c_3",  # DRE no VVPAT
        "F6c_1", "F6c_2", "F6c_3",  # DRE with VVPAT
        "F7c_1", "F7c_2", "F7c_3",  # Ballot marking device
        "F8c_1", "F8c_2", "F8c_3",  # Scanner
        "A1a"  # Total registered
    ]

    # Apply numeric cleaning to all relevant columns
    for col in equipment_cols:
        if col in df.columns:
            df[col] = df[col].apply(clean_numeric_value)

    # Build list of documents for MongoDB
    documents = []

    for _, row in df.iterrows():
        # Equipment type counts
        dre_no_vvpat = sum(row[col] for col in ["F5c_1", "F5c_2", "F5c_3"] if col in row)
        dre_with_vvpat = sum(row[col] for col in ["F6c_1", "F6c_2", "F6c_3"] if col in row)
        ballot_marking_device = sum(row[col] for col in ["F7c_1", "F7c_2", "F7c_3"] if col in row)
        scanner = sum(row[col] for col in ["F8c_1", "F8c_2", "F8c_3"] if col in row)

        # Build the document structure
        document = {
            "fipsCode": row["FIPSCode"],
            "jurisdictionName": row["Jurisdiction_Name"],
            "stateFull": row["State_Full"],
            "stateAbbr": row["State_Abbr"],
            "electionYear": year,

            # Voter Registration - only total registered
            "voterRegistration": {
                "totalRegistered": row.get("A1a", 0),
                "totalActive": None,
                "totalInactive": None
            },

            # Equipment Summary
            "equipment": {
                "dreNoVVPAT": dre_no_vvpat,
                "dreWithVVPAT": dre_with_vvpat,
                "ballotMarkingDevice": ballot_marking_device,
                "scanner": scanner
            },

            # Null fields not needed for these years
            "mailBallotsRejectedReason": None,
            "provisionalBallots": None,
            "voterDeletion": None,
            "mailBallotsCountedTotal": None,
            "dropBoxesTotal": None,
            "totalDropBoxesEarlyVoting": None,
            "inPersonEarlyVoting": None,
            "totalBallots": None,
            "totalRejectedBallots": None,
            "percentageRejectedBallots": None
        }

        documents.append(document)

    # Bulk insert into MongoDB
    if documents:
        result = collection.insert_many(documents)
        print(f"Successfully inserted {len(result.inserted_ids)} documents for year {year}")
    else:
        print(f"No documents to insert for year {year}")


def load_eavs_2016(collection, csv_path):
    """Load and transform 2016 EAVS data with limited fields and different column names."""

    print(f"Reading 2016 CSV from: {csv_path}")

    # Read CSV with pandas (2016 uses different encoding)
    df = pd.read_csv(csv_path, dtype=str, encoding='latin-1')

    # Strip quotes and whitespace from all string columns
    df = df.apply(lambda x: x.str.strip().str.strip('"') if x.dtype == "object" else x)

    # Filter out rows with missing or blank FIPS codes
    df = df[df["FIPSCode"].notna() & (df["FIPSCode"].str.strip() != "")]

    print(f"Processing {len(df)} records...")

    # Define equipment columns for 2016 (different naming)
    equipment_cols = [
        "F7a_Number",   # DRE no VVPAT
        "F7b_Number",   # DRE with VVPAT
        "F7c_Number",   # Ballot marking device
        "F7d_NumCounters",  # Scanner
        "A1a"  # Total registered
    ]

    # Apply numeric cleaning to all relevant columns
    for col in equipment_cols:
        if col in df.columns:
            df[col] = df[col].apply(clean_numeric_value)

    # Build list of documents for MongoDB
    documents = []

    for _, row in df.iterrows():
        # Equipment type counts (2016 uses single columns, not summed)
        dre_no_vvpat = row.get("F7a_Number", 0)
        dre_with_vvpat = row.get("F7b_Number", 0)
        ballot_marking_device = row.get("F7c_Number", 0)
        scanner = row.get("F7d_NumCounters", 0)

        # Build the document structure
        document = {
            "fipsCode": row["FIPSCode"],
            "jurisdictionName": row["JurisdictionName"],
            "stateFull": None,  # Not available in 2016 data
            "stateAbbr": row["State"],
            "electionYear": 2016,

            # Voter Registration - only total registered
            "voterRegistration": {
                "totalRegistered": row.get("A1a", 0),
                "totalActive": None,
                "totalInactive": None
            },

            # Equipment Summary
            "equipment": {
                "dreNoVVPAT": dre_no_vvpat,
                "dreWithVVPAT": dre_with_vvpat,
                "ballotMarkingDevice": ballot_marking_device,
                "scanner": scanner
            },

            # Equipment Summary
            "equipment": {
                "dreNoVVPAT": dre_no_vvpat,
                "dreWithVVPAT": dre_with_vvpat,
                "ballotMarkingDevice": ballot_marking_device,
                "scanner": scanner
            },

            # Null fields not needed for 2016
            "mailBallotsRejectedReason": None,
            "provisionalBallots": None,
            "voterDeletion": None,
            "mailBallotsCountedTotal": None,
            "dropBoxesTotal": None,
            "totalDropBoxesEarlyVoting": None,
            "inPersonEarlyVoting": None,
            "totalBallots": None,
            "totalRejectedBallots": None,
            "percentageRejectedBallots": None
        }

        documents.append(document)

    # Bulk insert into MongoDB
    if documents:
        result = collection.insert_many(documents)
        print(f"Successfully inserted {len(result.inserted_ids)} documents for year 2016")
    else:
        print("No documents to insert for year 2016")


def load_eavs_data():
    """Main function to load all EAVS data from 2016-2024."""

    # Connect to MongoDB
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]

    # Check if data already exists
    if collection.count_documents({}) > 0:
        print("EAVS data already exists in MongoDB. Skipping load.")
        client.close()
        return

    # Load data for each year (descending order: 2024 -> 2016)
    for year, filename in sorted(CSV_FILES.items(), reverse=True):
        csv_path = RESOURCES_DIR / filename

        if not csv_path.exists():
            print(f"Warning: CSV file for {year} not found at {csv_path}")
            continue

        try:
            if year == 2024:
                load_eavs_2024(collection, csv_path)
            elif year in [2022, 2020, 2018]:
                load_eavs_2022_2020_2018(collection, csv_path, year)
            elif year == 2016:
                load_eavs_2016(collection, csv_path)
        except Exception as e:
            print(f"Error loading data for year {year}: {e}")
            import traceback
            traceback.print_exc()

    print(f"\nTotal documents in collection: {collection.count_documents({})}")
    client.close()


if __name__ == "__main__":
    try:
        load_eavs_data()
    except Exception as e:
        print(f"Error loading EAVS data: {e}")
        import traceback

        traceback.print_exc()
