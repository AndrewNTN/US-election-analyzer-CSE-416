import json
import logging
from pathlib import Path
from typing import Dict, List

from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "cse416"
COLLECTION_NAME = "felony_data"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_felony_data():
    """Load felony voting rights data from JSON file into MongoDB."""
    
    # Check if data already exists
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    if collection.count_documents({}) > 0:
        logger.info(f"Data already exists in {COLLECTION_NAME}. Skipping load.")
        client.close()
        return
    client.close()

    # Get the path to the felony_data.json file
    script_dir = Path(__file__).parent
    json_path = script_dir.parent / "src" / "main" / "resources" / "felony_data.json"

    if not json_path.exists():
        logger.error(f"File not found: {json_path}")
        return

    logger.info(f"Reading felony data from {json_path}...")

    # Load the JSON data
    with open(json_path, 'r', encoding='utf-8') as f:
        data: List[Dict] = json.load(f)

    if not data:
        logger.warning("No data found in JSON file")
        return

    logger.info(f"Loaded {len(data)} felony voting rights records")

    # Connect to MongoDB
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    col = db[COLLECTION_NAME]

    # Clear existing data
    deleted_count = col.delete_many({}).deleted_count
    logger.info(f"Deleted {deleted_count} existing records")

    # Insert the data
    try:
        result = col.insert_many(data, ordered=False)
        logger.info(f"Successfully inserted {len(result.inserted_ids)} records")
    except Exception as e:
        logger.exception(f"Failed to insert data: {e}")
        client.close()
        return

    # Create index on stateFips for faster lookups
    try:
        col.create_index("stateFips", unique=True)
        logger.info("Created unique index on stateFips")
    except Exception as e:
        logger.warning(f"Index creation failed (may already exist): {e}")

    # Verify the data
    count = col.count_documents({})
    logger.info(f"Collection now contains {count} documents")

    # Show sample document
    sample = col.find_one()
    if sample:
        logger.info(f"Sample document: {sample}")

    client.close()
    logger.info("Load complete.")


if __name__ == "__main__":
    load_felony_data()

