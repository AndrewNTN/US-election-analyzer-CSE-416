# python
import logging
from typing import Dict, Optional, Any, Set

import geopandas as gpd
from shapely.geometry import mapping
from shapely.geometry.base import BaseGeometry
from pymongo import MongoClient, GEOSPHERE

GEOJSON_URL = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "cse416"
COLLECTION_NAME = "states_geojson"
UNALLOWED_STATES = {'02': 'Alaska', '72': 'Puerto Rico'}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _normalize_state_fips(value: Any) -> str:
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

    # Get state FIPS code from "id" field
    state_raw = props.get("id", "")
    state_fips = _normalize_state_fips(state_raw)

    # Filter unallowed states
    if state_fips in UNALLOWED_STATES:
        return None

    if not state_fips:
        return None

    # Get state name from "name" field
    state_name = str(props.get("name", "")).strip()
    if not state_name:
        state_name = "Unknown"

    geom = _fix_geometry(row.geometry if hasattr(row, "geometry") else None)
    if geom is None:
        return None

    # Return GeoJSON Feature format
    doc: Dict = {
        "type": "Feature",
        "properties": {
            "stateFips": state_fips,
            "stateName": state_name,
        },
        "geometry": mapping(geom),
    }
    return doc


def load_with_geopandas():
    logger.info("Reading state GeoJSON from URL...")
    gdf = gpd.read_file(GEOJSON_URL)

    # Ensure geometry column exists
    if "geometry" not in gdf.columns:
        logger.error("No geometry column found in GeoJSON")
        return

    docs = []
    seen_state_fips: Set[str] = set()
    invalid_count = 0
    total = 0

    for _, row in gdf.iterrows():
        total += 1
        doc = _validate_and_transform_row(row)
        if doc is None:
            invalid_count += 1
            continue
        # Check stateFips from nested properties
        state_fips = doc["properties"]["stateFips"]
        if state_fips in seen_state_fips:
            # skip duplicates in source
            continue
        seen_state_fips.add(state_fips)
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
        col.create_index("properties.stateFips", unique=True)
        col.create_index("properties.stateName")
    except Exception:
        logger.exception("Index creation failed")

    client.close()
    logger.info("Load complete.")


if __name__ == "__main__":
    load_with_geopandas()
