import logging
from pathlib import Path
from typing import Dict, Optional, List
from pymongo import MongoClient
from dotenv import load_dotenv
import requests
import asyncio
import aiohttp
import time
import sys

# Import validators
from email_validator import EmailValidatorService
from fl_address_validator import USPSAPIService

# Load environment variables
load_dotenv()

MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "cse416"
COLLECTION_NAME = "florida_voters"
STATE_REGISTRATION_COLLECTION = "state_voter_registration"

# Florida state FIPS code
FLORIDA_FIPS = "12"

# Path to voter detail files
SCRIPT_DIR = Path(__file__).parent
RESOURCES_DIR = SCRIPT_DIR.parent / "src" / "main" / "resources"
VOTER_DIR = RESOURCES_DIR / "Florida Department of State Statewide Voter Registration and Voting History Extract File" / "20251014_VoterDetail"

# County code mappings
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


def safe_async_run(coro, timeout=60):
    """Run async coroutine with timeout to prevent hangs"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(asyncio.wait_for(coro, timeout=timeout))
        finally:
            loop.close()
    except asyncio.TimeoutError:
        logger.error(f"Async operation timed out after {timeout}s")
        return []
    except Exception as e:
        logger.error(f"Error in async operation: {e}", exc_info=True)
        return []


class FloridaVoterLoader:
    """Loads Florida voter registration data into MongoDB with validation"""

    def __init__(self, batch_size: int = 1000, max_concurrent: int = 50):
        self.email_validator = EmailValidatorService()
        self.address_validator = USPSAPIService()
        self.address_validator.get_access_token()  # Get token once at initialization

        self.batch_size = batch_size
        self.max_concurrent = max_concurrent

        self.stats = {
            'total_rows': 0,
            'skipped_exemption': 0,
            'skipped_invalid_address': 0,
            'skipped_invalid_email': 0,
            'skipped_missing_data': 0,
            'inserted': 0,
            'errors': 0
        }

        # Track county registration statistics
        self.county_registration_stats = {}

        # Cache for validation results (address_tuple -> bool, email -> bool)
        self._address_cache = {}
        self._email_cache = {}

        # Timing statistics for validation
        self._address_validation_times = []
        self._email_validation_times = []

    async def _validate_email_async(self, session: aiohttp.ClientSession, email: str) -> bool:
        """Async email validation with caching"""
        if not email or '@' not in email:
            return False

        # Check cache first
        if email in self._email_cache:
            return self._email_cache[email]

        start_time = time.time()
        try:
            params = {'email': email}
            async with session.get(self.email_validator.base_url, params=params, timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    data = await response.json()
                    result = data.get('status') == 'VALID'
                    self._email_cache[email] = result

                    # Track timing
                    elapsed_ms = (time.time() - start_time) * 1000
                    self._email_validation_times.append(elapsed_ms)

                    return result
        except Exception:
            pass

        self._email_cache[email] = False

        # Track timing even for failures
        elapsed_ms = (time.time() - start_time) * 1000
        self._email_validation_times.append(elapsed_ms)

        return False

    async def _validate_address_async(self, session: aiohttp.ClientSession, street: str, city: str, state: str, zipcode: str) -> bool:
        """Async address validation with caching"""
        if not street or not state:
            return False

        # Create cache key
        cache_key = (street, city, state, zipcode)
        if cache_key in self._address_cache:
            return self._address_cache[cache_key]

        start_time = time.time()
        try:
            url = f'{self.address_validator.base_url}/addresses/v3/address'
            params = {'streetAddress': street, 'state': state}

            if zipcode:
                params['ZIPCode'] = zipcode
            elif city:
                params['city'] = city
            else:
                self._address_cache[cache_key] = False
                return False

            headers = {
                'accept': 'application/json',
                'Authorization': f'Bearer {self.address_validator.access_token}'
            }

            async with session.get(url, params=params, headers=headers, timeout=aiohttp.ClientTimeout(total=5)) as response:
                result = response.status == 200
                self._address_cache[cache_key] = result

                # Track timing
                elapsed_ms = (time.time() - start_time) * 1000
                self._address_validation_times.append(elapsed_ms)

                return result

        except Exception:
            pass

        self._address_cache[cache_key] = False

        # Track timing even for failures
        elapsed_ms = (time.time() - start_time) * 1000
        self._address_validation_times.append(elapsed_ms)

        return False

    async def _validate_batch_async(self, voters_data: List[Dict]) -> List[Dict]:
        """Validate a batch of voters concurrently - VALIDATION TEMPORARILY DISABLED"""
        if not voters_data:
            return []

        valid_voters = []

        # TEMPORARILY SKIP ALL VALIDATION - Accept all records
        for voter_data in voters_data:
            # Create final voter record with null email if not present
            voter_record = {
                'name': voter_data['name'],
                'countyName': voter_data['countyName'],
                'party': voter_data['party'],
                'address': voter_data['address'],
                'email': voter_data['email'] if voter_data['email'] else None  # Use None for missing emails
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

        return valid_voters

    def _validate_email_silent(self, email: str) -> bool:
        """Validate email without printing output"""
        if not email or '@' not in email:
            return False

        try:
            response = requests.get(
                self.email_validator.base_url,
                params={'email': email},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                return data.get('status') == 'VALID'
        except Exception:
            pass
        return False

    def _validate_address_silent(self, street: str, city: str, state: str, zipcode: str) -> bool:
        """Validate address without printing output"""
        if not street or not state:
            return False

        try:
            url = f'{self.address_validator.base_url}/addresses/v3/address'
            params = {'streetAddress': street, 'state': state}

            if zipcode:
                params['ZIPCode'] = zipcode
            elif city:
                params['city'] = city
            else:
                return False

            headers = {
                'accept': 'application/json',
                'Authorization': f'Bearer {self.address_validator.access_token}'
            }

            response = requests.get(url, params=params, headers=headers, timeout=5)
            return response.status_code == 200

        except Exception:
            return False

    def _parse_row(self, line: str, county_code: str) -> Optional[Dict]:
        """Parse a single row from the voter file"""
        parts = line.split('\t')

        if len(parts) < 38:
            return None

        # Check if public records exemption (column 7, index 6)
        exemption = parts[6].strip().upper()
        if exemption == 'Y':
            self.stats['skipped_exemption'] += 1
            return None

        # Extract fields
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

        # Get county name
        county_name = COUNTY_CODES.get(county_code, county_code)

        # Get party
        party = parts[23].strip()

        # Build address
        address_line1 = parts[7].strip()
        address_line2 = parts[8].strip()
        address_city = parts[9].strip()
        address_state = parts[10].strip() if parts[10].strip() else 'FL'  # Default to FL if empty
        address_zip = parts[11].strip()

        # Combine address parts
        address_parts = [address_line1]
        if address_line2:
            address_parts.append(address_line2)
        if address_city:
            address_parts.append(address_city)
        address_parts.append(address_state)  # Always include state (now defaults to FL)
        if address_zip:
            address_parts.append(address_zip)
        address = ', '.join(address_parts)

        # Get email
        email = parts[37].strip() if len(parts) > 37 else ''

        # Check required fields (state no longer checked since it defaults to FL)
        if not name or not address_line1:
            self.stats['skipped_missing_data'] += 1
            return None

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

        # Force flush logs
        for handler in logger.handlers:
            handler.flush()

        start_time = time.time()

        total_inserted = 0
        batch = []

        # Initialize county stats if not exists
        if county_name not in self.county_registration_stats:
            self.county_registration_stats[county_name] = {
                'totalRegisteredVoters': 0,
                'democraticVoters': 0,
                'republicanVoters': 0,
                'unaffiliatedVoters': 0
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

                    # Progress report every 10000 rows
                    if line_num % 10000 == 0:
                        elapsed = time.time() - start_time
                        rate = line_num / elapsed if elapsed > 0 else 0

                        # Calculate average validation times
                        avg_addr_ms = sum(self._address_validation_times) / len(self._address_validation_times) if self._address_validation_times else 0
                        avg_email_ms = sum(self._email_validation_times) / len(self._email_validation_times) if self._email_validation_times else 0

                        logger.info(f"  {county_name}: {line_num:,} rows ({total_inserted:,} inserted) - {rate:.0f} rows/sec | Addr: {avg_addr_ms:.0f}ms | Email: {avg_email_ms:.0f}ms")

                        # Flush logs to ensure they're written
                        for handler in logger.handlers:
                            handler.flush()

                    # Process and insert batch when it reaches batch_size
                    if len(batch) >= self.batch_size:
                        try:
                            valid_batch = safe_async_run(self._validate_batch_async(batch), timeout=30)

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
                        valid_batch = safe_async_run(self._validate_batch_async(batch), timeout=30)

                        # Insert remaining voters
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

        elapsed = time.time() - start_time
        logger.info(f"  Completed {county_name}: {total_inserted:,} valid voters inserted in {elapsed:.1f}s")
        return total_inserted

    def _save_registration_statistics(self, db):
        """Save state voter registration statistics with embedded county data to MongoDB"""
        logger.info("Saving voter registration statistics...")

        # Prepare county registration documents (as array for embedding)
        county_docs = []
        for county_name, stats in self.county_registration_stats.items():
            county_doc = {
                'countyName': county_name,
                'totalRegisteredVoters': stats['totalRegisteredVoters'],
                'democraticVoters': stats['democraticVoters'],
                'republicanVoters': stats['republicanVoters'],
                'unaffiliatedVoters': stats['unaffiliatedVoters']
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
        logger.info("Starting Florida voter data load - VALIDATION DISABLED:")
        logger.info(f"  - Skipping all address/email validation")
        logger.info(f"  - Accepting all records (batch size: {self.batch_size})")
        logger.info(f"  - Null emails will be stored as None")
        logger.info("=" * 70)
        logger.info(f"Voter directory: {VOTER_DIR}")

        overall_start_time = time.time()

        if not VOTER_DIR.exists():
            logger.error(f"Voter directory not found: {VOTER_DIR}")
            return

        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]

        # Check if data already exists
        if not force_reload and self._check_existing_data(db):
            logger.error("Aborting: Data already exists. Use force_reload=True to override.")
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
            county_start = time.time()

            # Check MongoDB connection health
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
                inserted_count = self._process_file(file_path, col)
                county_elapsed = time.time() - county_start
                logger.info(f"County completed successfully in {county_elapsed:.1f}s")
            except Exception as e:
                logger.error(f"FATAL ERROR processing county {file_path.name}: {e}", exc_info=True)
                raise

            completed_counties += 1

            # Overall progress report after each county
            elapsed = time.time() - overall_start_time
            progress_pct = (completed_counties / len(txt_files)) * 100
            avg_county_time = elapsed / completed_counties
            eta_seconds = avg_county_time * (len(txt_files) - completed_counties)

            # Calculate average validation times
            avg_addr_ms = sum(self._address_validation_times) / len(self._address_validation_times) if self._address_validation_times else 0
            avg_email_ms = sum(self._email_validation_times) / len(self._email_validation_times) if self._email_validation_times else 0

            logger.info(f"\n{'=' * 70}")
            logger.info(f"PROGRESS: {completed_counties}/{len(txt_files)} counties ({progress_pct:.1f}%)")
            logger.info(f"Inserted so far: {self.stats['inserted']:,} voters")
            logger.info(f"Elapsed: {elapsed/60:.1f}min | ETA: {eta_seconds/60:.1f}min")
            logger.info(f"Cache stats - Addr: {len(self._address_cache):,} | Email: {len(self._email_cache):,}")
            logger.info(f"Avg validation time - Addr: {avg_addr_ms:.0f}ms | Email: {avg_email_ms:.0f}ms")
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

        # Print statistics
        total_time = time.time() - overall_start_time
        logger.info(f"\nTotal processing time: {total_time/60:.1f} minutes")
        logger.info(f"Average rate: {self.stats['total_rows']/total_time:.0f} rows/sec")
        logger.info(f"Final cache stats - Addresses: {len(self._address_cache):,}, Emails: {len(self._email_cache):,}")
        self._print_stats()

    def _print_stats(self):
        """Print loading statistics"""
        logger.info("\n" + "=" * 60)
        logger.info("Florida Voter Data Load Complete")
        logger.info("=" * 60)
        logger.info(f"Total rows processed: {self.stats['total_rows']:,}")
        logger.info(f"Skipped (exemption): {self.stats['skipped_exemption']:,}")
        logger.info(f"Skipped (invalid address): {self.stats['skipped_invalid_address']:,}")
        logger.info(f"Skipped (invalid email): {self.stats['skipped_invalid_email']:,}")
        logger.info(f"Skipped (missing data): {self.stats['skipped_missing_data']:,}")
        logger.info(f"Successfully inserted: {self.stats['inserted']:,}")
        logger.info(f"Errors: {self.stats['errors']}")
        logger.info("=" * 60)


def main():
    """Main entry point"""
    loader = FloridaVoterLoader()
    loader.load_all_voters()


if __name__ == "__main__":
    main()

