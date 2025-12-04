import logging
import math
import requests
from pymongo import MongoClient, UpdateOne
from multiprocessing import Pool, cpu_count
import time

MONGO_URI = "mongodb://localhost:27017/"
DATABASE = "cse416"
COLLECTION = "florida_voters"

# -----------------------------
# TUNABLE OPTIONS
# -----------------------------
SAMPLE_FRACTION = 0.01          # 1% of voters
MAX_PER_RUN = 20000             # Voters to process per run
WORKERS = min(32, cpu_count())  # Number of parallel processes
BATCH_SIZE = 500                # MongoDB bulk write size
LOG_EVERY = 500
GEOCODER_TIMEOUT = 5
RETRY_LIMIT = 3

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# IMPORTANT: use the *geographies* endpoint, not locations
CENSUS_GEOCODE_URL = (
    "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress"
)

# one Session per process
SESSION = requests.Session()


CENSUS_GEOCODE_URL = (
    "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress"
)

def geocode_address(address: str):
    """Call Census geocoder and return lat/lng + census block GEOID."""
    if not address:
        return {}

    session = requests.Session()

    for attempt in range(RETRY_LIMIT):
        try:
            params = {
                "address": address,
                "benchmark": "Public_AR_Current",
                "vintage": "Current_Current",   # required for geographies
                "format": "json",
                # "layers": "all",  # optional; default already includes blocks
            }

            resp = session.get(
                CENSUS_GEOCODE_URL,
                params=params,
                timeout=GEOCODER_TIMEOUT,
            )
            resp.raise_for_status()
            data = resp.json()

            result = data.get("result", {})
            matches = result.get("addressMatches", [])
            if not matches:
                return {}

            m = matches[0]

            coords = m.get("coordinates", {}) or {}
            lat = coords.get("y")
            lng = coords.get("x")

            # IMPORTANT: geographies is on the match, not on result
            geos = m.get("geographies", {}) or {}

            # Try a few possible keys for blocks
            blocks = (
                geos.get("Census Blocks")
                or geos.get("2020 Census Blocks")
                or geos.get("Census Blocks 2020")
                or geos.get("Blocks")
            )

            census_block = None
            if blocks:
                b0 = blocks[0]
                # Full 15-digit block GEOID if present
                census_block = b0.get("GEOID") or b0.get("BLOCK")

            return {
                "lat": lat,
                "lng": lng,
                "censusBlock": census_block,
            }

        except Exception:
            time.sleep(0.5)
            if attempt == RETRY_LIMIT - 1:
                return {
                    "lat": None,
                    "lng": None,
                    "censusBlock": None,
                }


def normalize_address(address: str):
    """Simple canonical normalization."""
    if not address:
        return {}
    cleaned = " ".join(address.strip().title().split())

    zip_code = None
    parts = cleaned.split()
    if parts and parts[-1].isdigit() and len(parts[-1]) == 5:
        zip_code = parts[-1]

    return {"cleaned": cleaned, "zip": zip_code}


def process_single_voter(voter):
    """Run for each worker in parallel."""
    voter_id = voter["_id"]
    address = voter.get("address", "")

    normalized = normalize_address(address)
    geocode = geocode_address(address)

    analysis = {
        "normalizedAddress": normalized,
        "geocode": geocode,
        "automatedService": "Parallel Census Geocoder + Local Normalizer",
    }

    return (voter_id, analysis)


def run_analysis():
    client = MongoClient(MONGO_URI)
    collection = client[DATABASE][COLLECTION]

    total = collection.count_documents({})
    required = math.ceil(total * SAMPLE_FRACTION)

    logger.info(f"Total voters: {total:,}")
    logger.info(f"Target (1%): {required:,}")

    while True:
        already = collection.count_documents({"automatedAnalysis": {"$exists": True}})
        remaining = max(required - already, 0)

        logger.info("\n=== STATUS ===")
        logger.info(f"Already analyzed: {already:,}")
        logger.info(f"Still needed :   {remaining:,}")

        if remaining <= 0:
            logger.info("🎉 Finished! 1% requirement satisfied.")
            client.close()
            return

        to_process = min(remaining, MAX_PER_RUN)
        logger.info(
            f"\nProcessing next batch of {to_process:,} voters "
            f"using {WORKERS} workers...\n"
        )

        cursor = list(
            collection.aggregate([
                {"$match": {"automatedAnalysis": {"$exists": False}}},
                {"$sample": {"size": to_process}},
            ])
        )

        updates = []
        processed = 0

        try:
            with Pool(WORKERS) as p:
                for voter_id, analysis in p.imap(
                    process_single_voter, cursor, chunksize=50
                ):
                    updates.append(
                        UpdateOne(
                            {"_id": voter_id},
                            {"$set": {"automatedAnalysis": analysis}},
                        )
                    )

                    processed += 1

                    if len(updates) >= BATCH_SIZE:
                        collection.bulk_write(updates)
                        updates = []

                    if processed % LOG_EVERY == 0:
                        logger.info(f"Processed {processed}/{to_process}...")

        except KeyboardInterrupt:
            logger.warning("⚠ Interrupted! Saving partial progress...")
            if updates:
                collection.bulk_write(updates)
            client.close()
            return

        if updates:
            collection.bulk_write(updates)

        logger.info(f"\nBatch complete. Processed {processed:,} voters.\n")
        logger.info("Starting next batch automatically...\n")

        time.sleep(1)


if __name__ == "__main__":
    run_analysis()
