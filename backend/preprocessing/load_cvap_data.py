import csv
import logging
from pathlib import Path
from typing import Dict, Optional
from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "cse416"
COLLECTION_NAME = "cvap_data"

ALLOWED_STATES = {'06': 'California', '12': 'Florida', '41': 'Oregon'}
LINE_NUMBERS = {
    '1': 'total',
    '4': 'asian',
    '5': 'black',
    '7': 'white',
    '13': 'hispanic'
}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _extract_state_fips(geoid: str) -> Optional[str]:
    """Extract state FIPS code from geoid like '0500000US06001'."""
    if not geoid or len(geoid) < 11:
        return None
    # Format: 0500000US + 2-digit state + 3-digit county
    # Extract positions 9-10 (0-indexed)
    return geoid[9:11]


def _extract_county_fips(geoid: str) -> Optional[str]:
    """Extract full county FIPS (state + county) from geoid."""
    if not geoid or len(geoid) < 14:
        return None
    # Return the last 5 digits (state + county)
    return geoid[9:14]


def _parse_county_name(geoname: str) -> str:
    """Extract county name from 'County Name, State' format."""
    if ',' in geoname:
        return geoname.split(',')[0].strip()
    return geoname.strip()


def load_cvap_data():
    """Load county CVAP data from CSV file into MongoDB."""

    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    if collection.count_documents({}) > 0:
        logger.info(f"Data already exists in {COLLECTION_NAME}. Skipping load.")
        client.close()
        return

    client.close()

    script_dir = Path(__file__).parent
    csv_path = script_dir.parent / "src" / "main" / "resources" / "CVAP_2019-2023_ACS_csv_files" / "County.csv"

    if not csv_path.exists():
        logger.error(f"File not found: {csv_path}")
        return

    logger.info(f"Reading CVAP data from {csv_path}...")

    county_data: Dict[str, Dict] = {}

    encodings = ['latin-1', 'cp1252', 'iso-8859-1', 'utf-8']
    reader = None
    file_handle = None

    for encoding in encodings:
        try:
            file_handle = open(csv_path, 'r', encoding=encoding, errors='strict')
            reader = csv.DictReader(file_handle)
            # Test by reading multiple rows to catch encoding errors
            for i, row in enumerate(reader):
                if i > 100:
                    break
            file_handle.seek(0)
            reader = csv.DictReader(file_handle)
            logger.info(f"Successfully opened file with {encoding} encoding")
            break
        except (UnicodeDecodeError, StopIteration, Exception) as e:
            if file_handle:
                file_handle.close()
                file_handle = None
            continue

    if not file_handle or not reader:
        logger.error("Could not open file with any supported encoding")
        return

    try:
        for row in reader:
            geoid = row.get('geoid', '').strip()
            lnnumber = row.get('lnnumber', '').strip()

            if lnnumber not in LINE_NUMBERS:
                continue

            state_fips = _extract_state_fips(geoid)
            if state_fips not in ALLOWED_STATES:
                continue

            county_fips = _extract_county_fips(geoid)
            if not county_fips:
                continue

            # Initialize county record if not exists
            if county_fips not in county_data:
                geoname = row.get('geoname', '')
                county_data[county_fips] = {
                    'geoid': county_fips,
                    'countyName': _parse_county_name(geoname),
                    'stateName': ALLOWED_STATES[state_fips],
                    'totalCvapEstimate': 0,
                    'asian': 0,
                    'black': 0,
                    'white': 0,
                    'hispanic': 0
                }

            # Parse CVAP estimate
            cvap_est = row.get('cvap_est', '0').strip()
            try:
                cvap_value = int(cvap_est) if cvap_est else 0
            except ValueError:
                cvap_value = 0

            # Map to field name and store value
            field_name = LINE_NUMBERS[lnnumber]
            if field_name == 'total':
                county_data[county_fips]['totalCvapEstimate'] = cvap_value
            else:
                county_data[county_fips][field_name] = cvap_value
    finally:
        if file_handle:
            file_handle.close()

    docs = list(county_data.values())

    if not docs:
        logger.warning("No data found matching criteria")
        return

    logger.info(f"Processed {len(docs)} county CVAP records")

    # Connect to MongoDB
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    col = db[COLLECTION_NAME]

    # Clear existing data
    deleted_count = col.delete_many({}).deleted_count
    logger.info(f"Deleted {deleted_count} existing records")

    # Insert the data
    try:
        result = col.insert_many(docs, ordered=False)
        logger.info(f"Successfully inserted {len(result.inserted_ids)} records")
    except Exception as e:
        logger.exception(f"Failed to insert data: {e}")
        client.close()
        return

    # Create indexes
    try:
        col.create_index("geoid", unique=True)
        col.create_index("stateName")
        col.create_index("countyName")
        logger.info("Created indexes")
    except Exception as e:
        logger.warning(f"Index creation failed (may already exist): {e}")

    count = col.count_documents({})
    logger.info(f"Collection now contains {count} documents")

    # Show sample documents from each state
    for state_fips, state_name in ALLOWED_STATES.items():
        sample = col.find_one({"stateName": state_name})
        if sample:
            logger.info(f"Sample {state_name} document: {sample}")

    ca_count = col.count_documents({"stateName": "California"})
    fl_count = col.count_documents({"stateName": "Florida"})
    logger.info(f"California counties: {ca_count}, Florida counties: {fl_count}")

    client.close()
    logger.info("Load complete.")


if __name__ == "__main__":
    load_cvap_data()
