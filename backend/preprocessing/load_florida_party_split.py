import logging
from pathlib import Path
from typing import Dict, List
from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "cse416"
COLLECTION_NAME = "county_vote_split"

FLORIDA_FIPS = "12"

SCRIPT_DIR = Path(__file__).parent
RESOURCES_DIR = SCRIPT_DIR.parent / "src" / "main" / "resources"
RESULTS_DIR = RESOURCES_DIR / "2024-gen-outputofficial1"

COUNTY_MAPPINGS = {
    "ALA": "Alachua",
    "BAK": "Baker",
    "BAY": "Bay",
    "BRA": "Bradford",
    "BRE": "Brevard",
    "BRO": "Broward",
    "CAL": "Calhoun",
    "CHA": "Charlotte",
    "CIT": "Citrus",
    "CLA": "Clay",
    "CLL": "Collier",
    "CLM": "Columbia",
    "DAD": "Miami-Dade",
    "DES": "DeSoto",
    "DIX": "Dixie",
    "DUV": "Duval",
    "ESC": "Escambia",
    "FLA": "Flagler",
    "FRA": "Franklin",
    "GAD": "Gadsden",
    "GIL": "Gilchrist",
    "GLA": "Glades",
    "GUL": "Gulf",
    "HAM": "Hamilton",
    "HAR": "Hardee",
    "HEN": "Hendry",
    "HER": "Hernando",
    "HIG": "Highlands",
    "HIL": "Hillsborough",
    "HOL": "Holmes",
    "IND": "Indian River",
    "JAC": "Jackson",
    "JEF": "Jefferson",
    "LAF": "Lafayette",
    "LAK": "Lake",
    "LEE": "Lee",
    "LEO": "Leon",
    "LEV": "Levy",
    "LIB": "Liberty",
    "MAD": "Madison",
    "MAN": "Manatee",
    "MRN": "Marion",
    "MRT": "Martin",
    "MON": "Monroe",
    "NAS": "Nassau",
    "OKA": "Okaloosa",
    "OKE": "Okeechobee",
    "ORA": "Orange",
    "OSC": "Osceola",
    "PAL": "Palm Beach",
    "PAS": "Pasco",
    "PIN": "Pinellas",
    "POL": "Polk",
    "PUT": "Putnam",
    "SAN": "Santa Rosa",
    "SAR": "Sarasota",
    "SEM": "Seminole",
    "STJ": "St. Johns",
    "STL": "St. Lucie",
    "SUM": "Sumter",
    "SUW": "Suwannee",
    "TAY": "Taylor",
    "UNI": "Union",
    "VOL": "Volusia",
    "WAK": "Wakulla",
    "WAL": "Walton",
    "WAS": "Washington"
}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FloridaVoteSplitLoader:
    """Loads Florida county vote split data into MongoDB"""

    def __init__(self):
        self.county_vote_data: Dict[str, Dict] = {}

    def parse_precinct_file(self, file_path: Path, county_code: str) -> None:
        """
        Parse a single county precinct results file and aggregate votes.
        
        File format (tab-separated):
        CountyCode CountyName FIPSCode Date Election PrecinctNum Location ... 
        Race RaceSubCategory CandidateCode CandidateName Party ... Votes
        """
        logger.info(f"Processing {file_path.name}")

        county_name = COUNTY_MAPPINGS.get(county_code)
        if not county_name:
            logger.warning(f"Unknown county code: {county_code}")
            return

        if county_name not in self.county_vote_data:
            self.county_vote_data[county_name] = {
                "stateFips": FLORIDA_FIPS,
                "countyName": county_name,
                "republicanVotes": 0,
                "democraticVotes": 0,
                "totalVotes": 0
            }

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:

                    if not line or not line.strip():
                        continue

                    parts = line.strip().split('\t')

                    if len(parts) < 19:
                        continue

                    race = parts[11].strip() if parts[11] else ""
                    party = parts[15].strip() if parts[15] else ""
                    votes_str = parts[18].strip() if parts[18] else "0"

                    if not race:
                        continue

                    # Only process Presidential race
                    if "President" not in race:
                        continue

                    try:

                        votes_str_clean = ''.join(c for c in votes_str if c.isdigit() or c == '-')

                        if not votes_str_clean:
                            continue

                        votes = int(votes_str_clean)

                        if votes < 0:
                            logger.warning(f"Negative vote count in {file_path.name}: {votes}, skipping")
                            continue

                    except (ValueError, TypeError) as e:
                        logger.warning(f"Invalid vote count in {file_path.name}: '{votes_str}', skipping")
                        continue

                    self.county_vote_data[county_name]["totalVotes"] += votes

                    if party == "REP":
                        self.county_vote_data[county_name]["republicanVotes"] += votes
                    elif party == "DEM":
                        self.county_vote_data[county_name]["democraticVotes"] += votes

        except Exception as e:
            logger.error(f"Error processing {file_path.name}: {e}")

    def process_all_counties(self) -> None:
        """Process all county precinct result files"""
        if not RESULTS_DIR.exists():
            logger.error(f"Results directory not found: {RESULTS_DIR}")
            return

        for county_code in COUNTY_MAPPINGS.keys():
            file_path = RESULTS_DIR / f"{county_code}_PctResults20241105.txt"
            if file_path.exists():
                self.parse_precinct_file(file_path, county_code)
            else:
                logger.warning(f"File not found: {file_path.name}")

    def calculate_percentages(self) -> List[Dict]:
        """Calculate vote percentages and prepare documents for MongoDB"""
        documents = []

        for county_name, data in self.county_vote_data.items():
            try:
                rep_votes = int(data.get("republicanVotes", 0))
                dem_votes = int(data.get("democraticVotes", 0))
                total_votes = int(data.get("totalVotes", 0))

                if rep_votes < 0 or dem_votes < 0 or total_votes < 0:
                    logger.warning(f"Negative vote count detected for {county_name}, skipping")
                    continue

            except (ValueError, TypeError) as e:
                logger.warning(f"Invalid vote data for {county_name}: {e}, skipping")
                continue

            # Calculate percentages based on ALL votes cast
            if total_votes > 0:
                rep_percentage = round((rep_votes / total_votes) * 100, 2)
                dem_percentage = round((dem_votes / total_votes) * 100, 2)
            else:
                rep_percentage = 0.0
                dem_percentage = 0.0

            document = {
                "stateFips": data["stateFips"],
                "countyName": data["countyName"],
                "republicanVotes": rep_votes,
                "democraticVotes": dem_votes,
                "totalVotes": total_votes,
                "republicanPercentage": rep_percentage,
                "democraticPercentage": dem_percentage
            }

            documents.append(document)
            logger.info(f"{data['countyName']} County: R={rep_votes} ({rep_percentage}%), "
                        f"D={dem_votes} ({dem_percentage}%), Total={total_votes}")

        return documents

    def load_to_mongodb(self, documents: List[Dict]) -> None:
        """Insert vote split data into MongoDB"""
        if not documents:
            logger.warning("No documents to insert")
            return

        try:
            client = MongoClient(MONGO_URI)
            db = client[DATABASE_NAME]
            collection = db[COLLECTION_NAME]

            collection.delete_many({"stateFips": FLORIDA_FIPS})

            result = collection.insert_many(documents)
            logger.info(f"Inserted {len(result.inserted_ids)} county vote split records")

            collection.create_index([("stateFips", 1), ("countyName", 1)], unique=True)

            client.close()

        except Exception as e:
            logger.error(f"Error loading data to MongoDB: {e}")
            raise


def main():
    logger.info("Starting Florida vote split data load")

    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]

    if collection.count_documents({"stateFips": FLORIDA_FIPS}) > 0:
        logger.info(f"Florida data already exists in {COLLECTION_NAME}. Skipping load.")
        client.close()
        return
    client.close()

    loader = FloridaVoteSplitLoader()
    loader.process_all_counties()

    documents = loader.calculate_percentages()

    loader.load_to_mongodb(documents)

    logger.info(f"Completed loading {len(documents)} counties")


if __name__ == "__main__":
    main()
