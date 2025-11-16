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
                    if not row or not row[0].strip():
                        continue

                    first_col = row[0].strip()

                    # Check if this is a county name row (not "Percent" and not "State Totals")
                    if first_col and "Percent" not in first_col and "State Totals" not in first_col:
                        current_county = first_col

                        # Extract vote counts for ALL candidates (columns 1-7)
                        # Remove commas and convert to int
                        try:
                            # Column 1: Harris (DEM), Column 2: Trump (REP)
                            dem_votes_str = row[1].strip().replace(',', '').replace('"', '')
                            rep_votes_str = row[2].strip().replace(',', '').replace('"', '')

                            dem_votes = int(dem_votes_str)
                            rep_votes = int(rep_votes_str)

                            # Sum ALL candidate votes (columns 1-7) for accurate total
                            total_votes = 0
                            for col_idx in range(1, 8):  # Columns 1-7 contain vote counts
                                if col_idx < len(row):
                                    vote_str = row[col_idx].strip().replace(',', '').replace('"', '')
                                    if vote_str and vote_str.isdigit():
                                        total_votes += int(vote_str)

                            # Store temporarily, will get percentages from next row
                            self.county_vote_data.append({
                                "countyName": current_county,
                                "democraticVotes": dem_votes,
                                "republicanVotes": rep_votes,
                                "totalVotes": total_votes,
                                "democraticPercentage": 0.0,
                                "republicanPercentage": 0.0
                            })
                        except (ValueError, IndexError) as e:
                            logger.warning(f"Error parsing votes for {current_county}: {e}")

                    elif first_col and "Percent" in first_col and current_county:
                        # This is the percentage row
                        try:
                            # Extract percentages (columns 1=Harris/DEM, 2=Trump/REP)
                            dem_pct_str = row[1].strip().replace('%', '')
                            rep_pct_str = row[2].strip().replace('%', '')

                            dem_pct = float(dem_pct_str)
                            rep_pct = float(rep_pct_str)

                            # Update the last county entry with percentages
                            if self.county_vote_data and self.county_vote_data[-1]["countyName"] == current_county:
                                self.county_vote_data[-1]["democraticPercentage"] = dem_pct
                                self.county_vote_data[-1]["republicanPercentage"] = rep_pct
                        except (ValueError, IndexError) as e:
                            logger.warning(f"Error parsing percentages for {current_county}: {e}")

                        current_county = None

        except Exception as e:
            logger.error(f"Error reading CSV file: {e}")
            raise

    def prepare_documents(self) -> List[Dict]:
        """Add stateFips to all documents and prepare for MongoDB"""
        documents = []

        for data in self.county_vote_data:
            document = {
                "stateFips": CALIFORNIA_FIPS,
                "countyName": data["countyName"],
                "republicanVotes": data["republicanVotes"],
                "democraticVotes": data["democraticVotes"],
                "totalVotes": data["totalVotes"],
                "republicanPercentage": data["republicanPercentage"],
                "democraticPercentage": data["democraticPercentage"]
            }

            documents.append(document)
            logger.info(f"{data['countyName']} County: R={data['republicanVotes']} ({data['republicanPercentage']}%), "
                       f"D={data['democraticVotes']} ({data['democraticPercentage']}%), Total={data['totalVotes']}")

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

