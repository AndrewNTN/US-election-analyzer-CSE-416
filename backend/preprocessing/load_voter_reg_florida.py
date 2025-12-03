import logging
from pathlib import Path
from typing import Dict, Optional, List
from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "cse416"
COLLECTION_NAME = "florida_voters"
STATE_REGISTRATION_COLLECTION = "state_voter_registration"

FLORIDA_FIPS = "12"

SCRIPT_DIR = Path(__file__).parent
RESOURCES_DIR = SCRIPT_DIR.parent / "src" / "main" / "resources"
VOTER_DIR = RESOURCES_DIR / "Florida Department of State Statewide Voter Registration and Voting History Extract File" / "20251014_VoterDetail"

COUNTY_CODES = {
    "ALA": "Alachua", "BAK": "Baker", "BAY": "Bay", "BRA": "Bradford",
    "BRE": "Brevard", "BRO": "Broward", "CAL": "Calhoun", "CHA": "Charlotte",
    "CIT": "Citrus", "CLA": "Clay", "CLL": "Collier", "CLM": "Columbia",
    "DAD": "Miami-Dade", "DES": "Desoto", "DIX": "Dixie", "DUV": "Duval",
    "ESC": "Escambia", "FLA": "Flagler", "FRA": "Franklin", "GAD": "Gadsden",
    "GIL": "Gilchrist", "GLA": "Glades", "GUL": "Gulf", "HAM": "Hamilton",
    "HAR": "Hardee", "HEN": "Hendry", "HER": "Hernando", "HIG": "Highlands",
    "HIL": "Hillsborough", "HOL": "Holmes", "IND": "Indian River", "JAC": "Jackson",
    "JEF": "Jefferson", "LAF": "Lafayette", "LAK": "Lake", "LEE": "Lee",
    "LEO": "Leon", "LEV": "Levy", "LIB": "Liberty", "MAD": "Madison",
    "MAN": "Manatee", "MRN": "Marion", "MRT": "Martin", "MON": "Monroe",
    "NAS": "Nassau", "OKA": "Okaloosa", "OKE": "Okeechobee", "ORA": "Orange",
    "OSC": "Osceola", "PAL": "Palm Beach", "PAS": "Pasco", "PIN": "Pinellas",
    "POL": "Polk", "PUT": "Putnam", "SAN": "Santa Rosa", "SAR": "Sarasota",
    "SEM": "Seminole", "STJ": "St. Johns", "STL": "St. Lucie", "SUM": "Sumter",
    "SUW": "Suwannee", "TAY": "Taylor", "UNI": "Union", "VOL": "Volusia",
    "WAK": "Wakulla", "WAL": "Walton", "WAS": "Washington"
}

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class FloridaVoterLoader:
    """Loads Florida voter registration data into MongoDB with validation"""

    def __init__(self, batch_size: int = 1000):
        self.batch_size = batch_size

        self.stats = {
            'total_rows': 0,
            'skipped_exemption': 0,
            'skipped_invalid_address': 0,
            'skipped_invalid_email': 0,
            'skipped_missing_data': 0,
            'inserted': 0,
            'errors': 0
        }

        self.county_registration_stats = {}

    def _process_batch(self, voters_data: List[Dict]) -> List[Dict]:
        if not voters_data:
            return []

        valid_voters = []

        for voter_data in voters_data:
            # Create final voter record with null email if not present
            voter_record = {
                'name': voter_data['name'],
                'countyName': voter_data['countyName'],
                'party': voter_data['party'],
                'address': voter_data['address'],
                'email': voter_data['email'] if voter_data['email'] else None
            }

            valid_voters.append(voter_record)

            # Update county registration statistics
            county_name = voter_data['countyName']
            party = voter_data['party'].upper()
            self.county_registration_stats[county_name]['totalRegisteredVoters'] += 1

            if party == 'DEM':
                self.county_registration_stats[county_name]['democraticVoters'] += 1
            elif party == 'REP':
                self.county_registration_stats[county_name]['republicanVoters'] += 1
            else:
                self.county_registration_stats[county_name]['unaffiliatedVoters'] += 1

            # Check for missing data
            if not voter_data.get('name'):
                self.county_registration_stats[county_name]['missingName'] += 1

            if not voter_data.get('address_line1') or not voter_data.get('address_zip'):
                self.county_registration_stats[county_name]['missingAddress'] += 1

            if not voter_data.get('email'):
                self.county_registration_stats[county_name]['missingEmail'] += 1

        return valid_voters

    def _parse_row(self, line: str, county_code: str) -> Optional[Dict]:
        parts = line.split('\t')

        name_last = parts[2].strip()
        name_first = parts[4].strip()
        name_middle = parts[5].strip()
        name_suffix = parts[3].strip()

        # Build full name
        name_parts = [name_first]
        if name_middle:
            name_parts.append(name_middle)
        name_parts.append(name_last)
        if name_suffix:
            name_parts.append(name_suffix)
        name = ' '.join(name_parts)

        county_name = COUNTY_CODES.get(county_code, county_code)

        party = parts[23].strip()

        # Build address
        address_line1 = parts[7].strip()
        address_line2 = parts[8].strip()
        address_city = parts[9].strip()
        address_state = parts[10].strip() if parts[10].strip() else 'FL'
        address_zip = parts[11].strip()

        address_parts = [address_line1]
        if address_line2:
            address_parts.append(address_line2)
        if address_city:
            address_parts.append(address_city)
        address_parts.append(address_state)
        if address_zip:
            address_parts.append(address_zip)
        address = ', '.join(address_parts)

        email = parts[37].strip() if len(parts) > 37 else ''

        return {
            'name': name,
            'countyName': county_name,
            'party': party,
            'address': address,
            'email': email,
            'address_line1': address_line1,
            'address_city': address_city,
            'address_state': address_state,
            'address_zip': address_zip
        }

    def _process_file(self, file_path: Path, db_collection) -> int:
        """Process a single voter file with batch async validation and insert to DB incrementally"""
        county_code = file_path.name[:3].upper()
        county_name = COUNTY_CODES.get(county_code, county_code)

        logger.info(f"Processing {county_name} ({county_code})...")

        total_inserted = 0
        batch = []

        # Initialize county stats if not exists
        if county_name not in self.county_registration_stats:
            self.county_registration_stats[county_name] = {
                'totalRegisteredVoters': 0,
                'democraticVoters': 0,
                'republicanVoters': 0,
                'unaffiliatedVoters': 0,
                'missingName': 0,
                'missingAddress': 0,
                'missingEmail': 0
            }

        try:
            with open(file_path, 'r', encoding='latin-1', errors='ignore') as f:
                for line_num, line in enumerate(f, 1):
                    self.stats['total_rows'] += 1

                    # Parse row
                    voter_data = self._parse_row(line, county_code)
                    if not voter_data:
                        continue

                    batch.append(voter_data)

                    # Process and insert batch when it reaches batch_size
                    if len(batch) >= self.batch_size:
                        try:
                            valid_batch = self._process_batch(batch)

                            # Insert immediately in smaller chunks
                            if valid_batch:
                                chunk_size = 500
                                for i in range(0, len(valid_batch), chunk_size):
                                    chunk = valid_batch[i:i + chunk_size]
                                    try:
                                        db_collection.insert_many(chunk, ordered=False)
                                        self.stats['inserted'] += len(chunk)
                                        total_inserted += len(chunk)
                                    except Exception as e:
                                        logger.error(f"Error inserting chunk at line {line_num}: {e}", exc_info=True)
                                        self.stats['errors'] += 1
                        except Exception as e:
                            logger.error(f"Error processing batch at line {line_num}: {e}", exc_info=True)
                            self.stats['errors'] += 1

                        batch = []

                # Process remaining batch
                if batch:
                    try:
                        valid_batch = self._process_batch(batch)

                        if valid_batch:
                            chunk_size = 500
                            for i in range(0, len(valid_batch), chunk_size):
                                chunk = valid_batch[i:i + chunk_size]
                                try:
                                    db_collection.insert_many(chunk, ordered=False)
                                    self.stats['inserted'] += len(chunk)
                                    total_inserted += len(chunk)
                                except Exception as e:
                                    logger.error(f"Error inserting final chunk: {e}", exc_info=True)
                                    self.stats['errors'] += 1
                    except Exception as e:
                        logger.error(f"Error processing final batch: {e}", exc_info=True)
                        self.stats['errors'] += 1

        except Exception as e:
            logger.error(f"Error processing file {file_path}: {e}")
            self.stats['errors'] += 1

        logger.info(f"  Completed {county_name}: {total_inserted:,} valid voters inserted")
        return total_inserted

    def _save_registration_statistics(self, db):
        """Save state voter registration statistics with embedded county data to MongoDB"""
        logger.info("Saving voter registration statistics...")

        # Prepare county registration documents
        county_docs = []
        for county_name, stats in self.county_registration_stats.items():
            total = stats['totalRegisteredVoters']
            missing_name_pct = (stats['missingName'] / total * 100) if total > 0 else 0
            missing_address_pct = (stats['missingAddress'] / total * 100) if total > 0 else 0
            missing_email_pct = (stats['missingEmail'] / total * 100) if total > 0 else 0

            county_doc = {
                'countyName': county_name,
                'totalRegisteredVoters': stats['totalRegisteredVoters'],
                'democraticVoters': stats['democraticVoters'],
                'republicanVoters': stats['republicanVoters'],
                'unaffiliatedVoters': stats['unaffiliatedVoters'],
                'missingNamePct': round(missing_name_pct, 2),
                'missingAddressPct': round(missing_address_pct, 2),
                'missingEmailPct': round(missing_email_pct, 2)
            }
            county_docs.append(county_doc)

        logger.info(f"Prepared {len(county_docs)} county registration records")

        # Aggregate state-level statistics
        state_stats = {
            'totalRegisteredVoters': 0,
            'democraticVoters': 0,
            'republicanVoters': 0,
            'unaffiliatedVoters': 0
        }

        for stats in self.county_registration_stats.values():
            state_stats['totalRegisteredVoters'] += stats['totalRegisteredVoters']
            state_stats['democraticVoters'] += stats['democraticVoters']
            state_stats['republicanVoters'] += stats['republicanVoters']
            state_stats['unaffiliatedVoters'] += stats['unaffiliatedVoters']

        # Prepare state registration document with embedded county array
        state_doc = {
            'stateFips': FLORIDA_FIPS,
            'totalRegisteredVoters': state_stats['totalRegisteredVoters'],
            'democraticVoters': state_stats['democraticVoters'],
            'republicanVoters': state_stats['republicanVoters'],
            'unaffiliatedVoters': state_stats['unaffiliatedVoters'],
            'countyVoterRegistrations': county_docs
        }

        # Save state registration data (county data embedded as array)
        state_col = db[STATE_REGISTRATION_COLLECTION]
        state_col.delete_many({'stateFips': FLORIDA_FIPS})
        state_col.insert_one(state_doc)
        logger.info(f"Saved state registration record for Florida (FIPS: {FLORIDA_FIPS})")
        logger.info(f"  Includes {len(county_docs)} counties embedded in countyVoterRegistrations array")

        # Log summary
        logger.info(f"State totals - Total: {state_stats['totalRegisteredVoters']:,}, "
                    f"DEM: {state_stats['democraticVoters']:,}, "
                    f"REP: {state_stats['republicanVoters']:,}, "
                    f"Unaffiliated: {state_stats['unaffiliatedVoters']:,}")

    def _check_existing_data(self, db) -> bool:
        """Check if data already exists in the database"""
        voters_col = db[COLLECTION_NAME]
        state_col = db[STATE_REGISTRATION_COLLECTION]

        voters_count = voters_col.count_documents({})
        state_exists = state_col.count_documents({'stateFips': FLORIDA_FIPS}) > 0

        if voters_count > 0 or state_exists:
            logger.warning("=" * 70)
            logger.warning("EXISTING DATA DETECTED")
            logger.warning("=" * 70)
            logger.warning(f"Florida voters collection has {voters_count:,} records")
            logger.warning(f"State registration exists: {state_exists}")
            logger.warning("")
            logger.warning("To reload the data, you must manually delete the existing collections:")
            logger.warning(f"  db.{COLLECTION_NAME}.drop()")
            logger.warning(f"  db.{STATE_REGISTRATION_COLLECTION}.deleteMany({{stateFips: '{FLORIDA_FIPS}'}})")
            logger.warning("")
            logger.warning("=" * 70)
            return True

        return False

    def load_all_voters(self, force_reload: bool = False):
        """Load all Florida voter data into MongoDB with optimized async processing"""
        logger.info("=" * 70)
        logger.info("Starting Florida voter data load: ")
        logger.info(f"  - Skipping all address/email validation")
        logger.info(f"  - Accepting all records (batch size: {self.batch_size})")
        logger.info(f"  - Null emails will be stored as None")
        logger.info("=" * 70)
        logger.info(f"Voter directory: {VOTER_DIR}")

        if not VOTER_DIR.exists():
            logger.error(f"Voter directory not found: {VOTER_DIR}")
            return

        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]

        # Check if data already exists
        if not force_reload and self._check_existing_data(db):
            logger.error("Aborting: Data already exists.")
            client.close()
            return

        # Get all .txt files
        txt_files = sorted(VOTER_DIR.glob("*.txt"))
        logger.info(f"Found {len(txt_files)} voter files\n")

        col = db[COLLECTION_NAME]

        # Clear existing data (only if force_reload or no data exists)
        if force_reload:
            logger.info("Force reload: Clearing existing voter data...")
            col.delete_many({})
            db[STATE_REGISTRATION_COLLECTION].delete_many({'stateFips': FLORIDA_FIPS})

        # Process files sequentially but with fast async validation
        completed_counties = 0

        for file_path in txt_files:
            try:
                db.command('ping')
            except Exception as e:
                logger.error(f"MongoDB connection lost! Error: {e}")
                logger.info("Attempting to reconnect...")
                try:
                    client.close()
                    client = MongoClient(MONGO_URI)
                    db = client[DATABASE_NAME]
                    col = db[COLLECTION_NAME]
                    db.command('ping')
                    logger.info("Reconnected successfully")
                except Exception as e2:
                    logger.error(f"Failed to reconnect: {e2}")
                    raise

            # Pass db collection for incremental insertion
            try:
                self._process_file(file_path, col)
                logger.info(f"County completed successfully")
            except Exception as e:
                logger.error(f"FATAL ERROR processing county {file_path.name}: {e}", exc_info=True)
                raise

            completed_counties += 1

            # Overall progress report after each county
            progress_pct = (completed_counties / len(txt_files)) * 100

            logger.info(f"\n{'=' * 70}")
            logger.info(f"PROGRESS: {completed_counties}/{len(txt_files)} counties ({progress_pct:.1f}%)")
            logger.info(f"Inserted so far: {self.stats['inserted']:,} voters")
            logger.info(f"{'=' * 70}\n")

        # Create indexes
        logger.info("Creating indexes...")
        try:
            col.create_index("countyName")
            col.create_index("party")
            col.create_index("email")
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")

        # Save registration statistics
        self._save_registration_statistics(db)

        client.close()
        self._print_stats()

    def _print_stats(self):
        """Print loading statistics"""
        logger.info("\n" + "=" * 60)
        logger.info("Florida Voter Data Load Complete")
        logger.info("=" * 60)
        logger.info(f"Total rows processed: {self.stats['total_rows']:,}")
        logger.info(f"Successfully inserted: {self.stats['inserted']:,}")
        logger.info(f"Errors: {self.stats['errors']}")
        logger.info("=" * 60)


def main():
    loader = FloridaVoterLoader()
    loader.load_all_voters()


if __name__ == "__main__":
    main()
