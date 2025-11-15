# python
import logging
from pathlib import Path
from typing import Dict, Optional, Any, Set

import geopandas as gpd
from shapely.geometry import mapping
from shapely.geometry.base import BaseGeometry
from pymongo import MongoClient, GEOSPHERE

# Path to local GeoJSON file in resources folder
SCRIPT_DIR = Path(__file__).parent
RESOURCES_DIR = SCRIPT_DIR.parent / "src" / "main" / "resources"
GEOJSON_FILE = RESOURCES_DIR / "counties.json"

MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "cse416"
COLLECTION_NAME = "counties_geojson"
ALLOWED_STATES = {'06': 'California', '12': 'Florida', '41': 'Oregon'}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _normalize_state(value: Any) -> str:
    s = str(value).strip()
    if s == "" or s.lower() == "nan":
        return ""
    # handle numeric states like 6 -> "06"
    if s.isdigit():
        return s.zfill(2)
    return s.zfill(2)


def _fix_geometry(geom: Optional[BaseGeometry]) -> Optional[BaseGeometry]:
    if geom is None:
        return None
    try:
        if geom.is_valid:
            return geom
        # try common fix: buffer(0)
        fixed = geom.buffer(0)
        if fixed is not None and fixed.is_valid:
            return fixed
    except Exception:
        pass
    return None


def _validate_and_transform_row(row) -> Optional[Dict]:
    # row is a GeoPandas Series with geometry
    props = row.drop("geometry").to_dict() if "geometry" in row.index else row.to_dict()

    # Get state FIPS code
    state_raw = props.get("STATEFP", "")
    state_code = _normalize_state(state_raw)
    if state_code not in ALLOWED_STATES:
        return None

    # Get geo id
    geo_id = str(props.get("GEOID", "")).strip()

    # fallback: construct from state + county FIPS if GEOID is missing
    if not geo_id:
        countyfp = props.get("COUNTYFP", "")
        if countyfp and str(countyfp).strip() != "":
            geo_id = state_code + str(countyfp).zfill(3)

    if not geo_id:
        return None

    # Get county name
    name = str(props.get("NAME", "")).strip()
    if not name:
        name = geo_id

    geom = _fix_geometry(row.geometry if hasattr(row, "geometry") else None)
    if geom is None:
        return None

    # Return GeoJSON Feature format
    doc: Dict = {
        "type": "Feature",
        "properties": {
            "geoid": geo_id,
            "stateName": ALLOWED_STATES.get(state_code, "Unknown"),
            "countyName": name,
        },
        "geometry": mapping(geom),
    }
    return doc


def load_with_geopandas():
    logger.info(f"Reading GeoJSON from local file: {GEOJSON_FILE}")

    if not GEOJSON_FILE.exists():
        logger.error(f"GeoJSON file not found at: {GEOJSON_FILE}")
        return

    gdf = gpd.read_file(GEOJSON_FILE)

    # Ensure geometry column exists
    if "geometry" not in gdf.columns:
        logger.error("No geometry column found in GeoJSON")
        return

    docs = []
    seen_geo_ids: Set[str] = set()
    invalid_count = 0
    total = 0

    for _, row in gdf.iterrows():
        total += 1
        doc = _validate_and_transform_row(row)
        if doc is None:
            invalid_count += 1
            continue
        # Check geoid from nested properties
        geoid = doc["properties"]["geoid"]
        if geoid in seen_geo_ids:
            # skip duplicates in source
            continue
        seen_geo_ids.add(geoid)
        docs.append(doc)

    logger.info(f"Processed {total} features, valid: {len(docs)}, invalid/skipped: {invalid_count}")

    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    col = db[COLLECTION_NAME]

    # Clear existing and insert in chunks
    col.delete_many({})
    chunk = 500
    for i in range(0, len(docs), chunk):
        try:
            col.insert_many(docs[i: i + chunk], ordered=False)
        except Exception as e:
            logger.exception("Bulk insert chunk failed: %s", e)

    # Create indexes on nested properties and geometry
    try:
        col.create_index([("geometry", GEOSPHERE)])
        col.create_index("properties.geoid", unique=True)
        col.create_index("properties.stateName")
        col.create_index("properties.countyName")
    except Exception:
        logger.exception("Index creation failed")

    client.close()
    logger.info("Load complete.")


if __name__ == "__main__":
    load_with_geopandas()
