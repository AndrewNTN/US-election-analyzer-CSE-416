import logging
import csv
from pathlib import Path
from typing import Dict, List
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "cse416"
COLLECTION_NAME = "county_vote_split"

# California state FIPS code
CALIFORNIA_FIPS = "06"

# Path to California election results CSV
SCRIPT_DIR = Path(__file__).parent
RESOURCES_DIR = SCRIPT_DIR.parent / "src" / "main" / "resources"
CSV_FILE = RESOURCES_DIR / "pres-summary-by-county(california).csv"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CaliforniaVoteSplitLoader:
    """Loads California county vote split data into MongoDB"""

    def __init__(self):
        self.county_vote_data: List[Dict] = []

    def parse_csv_file(self) -> None:
        """
        Parse the California county-level presidential results CSV file.

        CSV format has two rows per county:
        - First row: County name, vote counts (with commas)
        - Second row: "  Percent", percentages (with % symbols)
        """
        logger.info(f"Reading CSV from: {CSV_FILE}")

        if not CSV_FILE.exists():
            logger.error(f"CSV file not found: {CSV_FILE}")
            return

        try:
            with open(CSV_FILE, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)

                # Skip header rows
                next(reader)  # Skip candidate names
                next(reader)  # Skip party affiliations

                current_county = None

                for row in reader:
                    # Skip empty rows
                    if not row or not row[0] or not row[0].strip():
                        continue

                    first_col = row[0].strip()

                    # Check if this is a county name row (not "Percent" and not "State Totals")
                    if first_col and "Percent" not in first_col and "State Totals" not in first_col:
                        current_county = first_col

                        # Extract vote counts for ALL candidates (columns 1-7)
                        # Remove commas and convert to int
                        try:
                            # Validate row has enough columns
                            if len(row) < 8:
                                logger.warning(f"Insufficient columns for {current_county}, skipping")
                                current_county = None
                                continue

                            # Column 1: Harris (DEM), Column 2: Trump (REP)
                            dem_votes_str = row[1].strip().replace(',', '').replace('"', '') if row[1] else ""
                            rep_votes_str = row[2].strip().replace(',', '').replace('"', '') if row[2] else ""

                            # Validate strings are not empty and are digits
                            if not dem_votes_str or not rep_votes_str:
                                logger.warning(f"Empty vote data for {current_county}, skipping")
                                current_county = None
                                continue

                            if not dem_votes_str.isdigit() or not rep_votes_str.isdigit():
                                logger.warning(f"Non-numeric vote data for {current_county}, skipping")
                                current_county = None
                                continue

                            dem_votes = int(dem_votes_str)
                            rep_votes = int(rep_votes_str)

                            # Validate non-negative values
                            if dem_votes < 0 or rep_votes < 0:
                                logger.warning(f"Negative vote count for {current_county}, skipping")
                                current_county = None
                                continue

                            # Sum ALL candidate votes (columns 1-7) for accurate total
                            total_votes = 0
                            for col_idx in range(1, 8):  # Columns 1-7 contain vote counts
                                if col_idx < len(row) and row[col_idx]:
                                    vote_str = row[col_idx].strip().replace(',', '').replace('"', '')
                                    if vote_str and vote_str.isdigit():
                                        vote_count = int(vote_str)
                                        if vote_count >= 0:  # Only add non-negative values
                                            total_votes += vote_count

                            # Store temporarily, will get percentages from next row
                            self.county_vote_data.append({
                                "countyName": current_county,
                                "democraticVotes": dem_votes,
                                "republicanVotes": rep_votes,
                                "totalVotes": total_votes,
                                "democraticPercentage": 0.0,
                                "republicanPercentage": 0.0
                            })
                        except (ValueError, IndexError, TypeError) as e:
                            logger.warning(f"Error parsing votes for {current_county}: {e}")
                            current_county = None

                    elif first_col and "Percent" in first_col and current_county:
                        # This is the percentage row
                        try:
                            # Validate row has enough columns
                            if len(row) < 3:
                                logger.warning(f"Insufficient columns for {current_county} percentages, skipping")
                                current_county = None
                                continue

                            # Extract percentages (columns 1=Harris/DEM, 2=Trump/REP)
                            dem_pct_str = row[1].strip().replace('%', '') if row[1] else ""
                            rep_pct_str = row[2].strip().replace('%', '') if row[2] else ""

                            # Validate strings are not empty
                            if not dem_pct_str or not rep_pct_str:
                                logger.warning(f"Empty percentage data for {current_county}, using 0.0")
                                current_county = None
                                continue

                            dem_pct = float(dem_pct_str)
                            rep_pct = float(rep_pct_str)

                            # Validate percentage range (0-100)
                            if dem_pct < 0 or dem_pct > 100 or rep_pct < 0 or rep_pct > 100:
                                logger.warning(f"Invalid percentage range for {current_county}: DEM={dem_pct}%, REP={rep_pct}%")
                                current_county = None
                                continue

                            # Update the last county entry with percentages
                            if self.county_vote_data and self.county_vote_data[-1]["countyName"] == current_county:
                                self.county_vote_data[-1]["democraticPercentage"] = dem_pct
                                self.county_vote_data[-1]["republicanPercentage"] = rep_pct
                        except (ValueError, IndexError, TypeError) as e:
                            logger.warning(f"Error parsing percentages for {current_county}: {e}")

                        current_county = None

        except Exception as e:
            logger.error(f"Error reading CSV file: {e}")
            raise

    def prepare_documents(self) -> List[Dict]:
        """Add stateFips to all documents and prepare for MongoDB"""
        documents = []

        for data in self.county_vote_data:
            # Validate all numeric fields
            try:
                county_name = data.get("countyName", "")
                if not county_name:
                    logger.warning("County with empty name, skipping")
                    continue

                rep_votes = int(data.get("republicanVotes", 0))
                dem_votes = int(data.get("democraticVotes", 0))
                total_votes = int(data.get("totalVotes", 0))
                rep_pct = float(data.get("republicanPercentage", 0.0))
                dem_pct = float(data.get("democraticPercentage", 0.0))

                # Validate non-negative values
                if rep_votes < 0 or dem_votes < 0 or total_votes < 0:
                    logger.warning(f"Negative vote count for {county_name}, skipping")
                    continue

                # Validate percentage range
                if rep_pct < 0 or rep_pct > 100 or dem_pct < 0 or dem_pct > 100:
                    logger.warning(f"Invalid percentage range for {county_name}: DEM={dem_pct}%, REP={rep_pct}%, skipping")
                    continue

            except (ValueError, TypeError) as e:
                logger.warning(f"Invalid data types for county: {e}, skipping")
                continue

            document = {
                "stateFips": CALIFORNIA_FIPS,
                "countyName": county_name,
                "republicanVotes": rep_votes,
                "democraticVotes": dem_votes,
                "totalVotes": total_votes,
                "republicanPercentage": rep_pct,
                "democraticPercentage": dem_pct
            }

            documents.append(document)
            logger.info(f"{county_name} County: R={rep_votes} ({rep_pct}%), "
                       f"D={dem_votes} ({dem_pct}%), Total={total_votes}")

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

            # Clear existing California data
            collection.delete_many({"stateFips": CALIFORNIA_FIPS})

            # Insert new data
            result = collection.insert_many(documents)
            logger.info(f"Inserted {len(result.inserted_ids)} county vote split records")

            # Create indexes (if not already created)
            collection.create_index([("stateFips", 1), ("countyName", 1)], unique=True)

            client.close()

        except Exception as e:
            logger.error(f"Error loading data to MongoDB: {e}")
            raise


def main():
    """Main execution function"""
    logger.info("Starting California vote split data load")

    # Check if data already exists
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    
    # Check specifically for California data
    if collection.count_documents({"stateFips": CALIFORNIA_FIPS}) > 0:
        logger.info(f"California data already exists in {COLLECTION_NAME}. Skipping load.")
        client.close()
        return
    client.close()

    loader = CaliforniaVoteSplitLoader()

    # Parse CSV file
    loader.parse_csv_file()

    # Prepare documents
    documents = loader.prepare_documents()

    # Load to MongoDB
    loader.load_to_mongodb(documents)

    logger.info(f"Completed loading {len(documents)} counties")


if __name__ == "__main__":
    main()

