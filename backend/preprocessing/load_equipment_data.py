"""
Load Equipment Data from CSV into MongoDB.

This script reads the equipment data CSV, calculates quality scores,
and inserts the data into the equipment_data collection.

Florida equipment is marked with stateFips="12" based on user-provided list.
"""

import pandas as pd
from pymongo import MongoClient
import os
from pathlib import Path
from datetime import datetime
import re

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = "cse416"
COLLECTION_NAME = "equipment_data"

RESOURCES_DIR = Path(__file__).parent.parent / "src" / "main" / "resources"
CSV_FILE = "CSE416-S01 Equipment Data - Sheet1.csv"

# Current year for age calculation
CURRENT_YEAR = 2025

# Florida equipment models (per user specification)
FLORIDA_EQUIPMENT = {
    # DRE with VVPAT
    "ImageCast X": {"manufacturer": "Dominion", "type": "DRE Touchscreen"},
    "ImageCast X as DRE": {"manufacturer": "Dominion", "type": "DRE Touchscreen"},
    # BMD
    "AutoMARK": {"manufacturer": "ES&S", "type": "BMD"},
    "ExpressVote": {"manufacturer": "ES&S", "type": "BMD"},
    "ImageCast Evolution": {"manufacturer": "Dominion", "type": "Hybrid Optical Scanner/BMD"},
    # Scanner
    "Optech 400C": {"manufacturer": "Dominion", "type": "Batch-Fed Optical Scanner"},
    "DS200": {"manufacturer": "ES&S", "type": "Hand-Fed Optical Scanner"},
    "ImageCast Central": {"manufacturer": "Dominion", "type": "Batch-Fed Optical Scanner"},
    "DS450": {"manufacturer": "ES&S", "type": "Batch-Fed Optical Scanner"},
    "DS850": {"manufacturer": "ES&S", "type": "Batch-Fed Optical Scanner"},
    "ExpressVote XL": {"manufacturer": "ES&S", "type": "BMD/Tabulator"},
}


def parse_year(date_str):
    """Parse year from date string or year."""
    if pd.isna(date_str) or date_str == "":
        return None
    
    date_str = str(date_str).strip()
    
    # Try to extract just the year
    year_match = re.search(r'(\d{4})', date_str)
    if year_match:
        return int(year_match.group(1))
    
    # Try to parse as date
    try:
        # Format like "11/1/2003"
        dt = datetime.strptime(date_str, "%m/%d/%Y")
        return dt.year
    except ValueError:
        pass
    
    return None


def parse_boolean(val):
    """Parse boolean from string."""
    if pd.isna(val) or val == "":
        return None
    val = str(val).strip().upper()
    if val in ["TRUE", "YES", "1"]:
        return True
    elif val in ["FALSE", "NO", "0"]:
        return False
    return None


def parse_scanning_rate(rate_str):
    """Parse scanning rate to numeric value (ballots per minute)."""
    if pd.isna(rate_str) or rate_str == "":
        return None
    
    rate_str = str(rate_str).strip()
    
    # Extract numeric part
    match = re.search(r'(\d+(?:\.\d+)?)', rate_str)
    if match:
        return float(match.group(1))
    
    return None


def calculate_quality_score(row, age=None):
    """
    Calculate quality score (0-1) based on:
    - Security Risks (25%): No risks = 1.0, has risks = 0.3
    - VVPAT Support (15%): TRUE = 1.0, FALSE/None = 0.4
    - Certification Level (15%): VVSG 2.0 = 1.0, VVSG 1.0/1.1 = 0.7, other = 0.4
    - Discontinued Status (10%): Active = 1.0, Discontinued = 0.5
    - Technology Type (20%): Scanner = 1.0, BMD = 0.8, DRE+VVPAT = 0.6, DRE = 0.3
    - Equipment Age (15%): 0-5 years = 1.0, 6-10 years = 0.8, 11-15 years = 0.6, 16+ years = 0.4
    """
    # Security score
    security_risks = row.get("Security Risks", "")
    if pd.isna(security_risks) or security_risks == "" or security_risks.strip() == "":
        security_score = 1.0
    else:
        security_score = 0.3
    
    # VVPAT score
    vvpat = parse_boolean(row.get("VVPAT?"))
    if vvpat is True:
        vvpat_score = 1.0
    else:
        vvpat_score = 0.4
    
    # Certification score
    cert = str(row.get("Certification Level", "")).upper()
    if "2.0" in cert or "VVSG 2" in cert:
        cert_score = 1.0
    elif "1.0" in cert or "1.1" in cert or "VVSG 1" in cert:
        cert_score = 0.7
    elif cert == "" or pd.isna(row.get("Certification Level")):
        cert_score = 0.4
    else:
        cert_score = 0.5  # Other certifications like FEC
    
    # Discontinued score
    discontinued = parse_boolean(row.get("Discontinued"))
    if discontinued is True:
        active_score = 0.5
    else:
        active_score = 1.0

    # Technology Type score
    eq_type = str(row.get("Equipment Type", "")).lower()
    if "scanner" in eq_type:
        tech_score = 1.0
    elif "bmd" in eq_type or "marking" in eq_type:
        tech_score = 0.8
    elif "dre" in eq_type or "direct" in eq_type or "touchscreen" in eq_type:
        if vvpat is True:
            tech_score = 0.6
        else:
            tech_score = 0.3
    else:
        tech_score = 0.5

    # Age score - newer equipment is better
    if age is None or age <= 0:
        age_score = 0.7  # Unknown age, neutral score
    elif age <= 5:
        age_score = 1.0  # Very new
    elif age <= 10:
        age_score = 0.8  # Relatively new
    elif age <= 15:
        age_score = 0.6  # Getting old
    else:
        age_score = 0.4  # Old equipment
    
    quality = (
        0.25 * security_score +
        0.15 * vvpat_score +
        0.15 * cert_score +
        0.10 * active_score +
        0.20 * tech_score +
        0.15 * age_score
    )
    
    return round(quality, 2)


def calculate_simulated_metrics(row, age):
    """
    Calculate simulated error rate and reliability based on:
    - Age of equipment
    - Certification level
    - Security risks
    """
    # Base error rate: 0.1%
    base_error = 0.1
    
    # Age penalty: 0.05% per year
    age_penalty = (age or 0) * 0.05
    
    # Security penalty
    security_risks = row.get("Security Risks", "")
    if pd.notna(security_risks) and security_risks.strip() != "":
        security_penalty = 0.3
    else:
        security_penalty = 0.0
    
    # Certification bonus (negative penalty)
    cert = str(row.get("Certification Level", "")).upper()
    if "2.0" in cert:
        cert_bonus = -0.1
    elif "1.1" in cert:
        cert_bonus = -0.05
    else:
        cert_bonus = 0.0
    
    error_rate = base_error + age_penalty + security_penalty + cert_bonus
    error_rate = max(0.05, min(5.0, error_rate))  # Clamp between 0.05% and 5%
    
    # Reliability = 100 - (error_rate * 2), clamped
    reliability = 100 - (error_rate * 2)
    reliability = max(85.0, min(99.9, reliability))
    
    # Scan rate simulation based on equipment type
    eq_type = str(row.get("Equipment Type", "")).lower()
    if "batch" in eq_type or "central" in eq_type:
        scan_rate = 97.0 + (3.0 - (age or 0) * 0.2)  # High speed
    elif "hand" in eq_type or "precinct" in eq_type:
        scan_rate = 95.0 + (4.0 - (age or 0) * 0.3)  # Medium speed
    else:
        scan_rate = 96.0 + (3.0 - (age or 0) * 0.25)  # Default
    
    scan_rate = max(90.0, min(99.9, scan_rate))
    
    return round(error_rate, 2), round(reliability, 1), round(scan_rate, 1)


def is_florida_equipment(model_name, manufacturer):
    """Check if this equipment is used in Florida."""
    if pd.isna(model_name):
        return False
    
    model = str(model_name).strip()
    mfr = str(manufacturer).strip() if pd.notna(manufacturer) else ""
    
    for fl_model, fl_info in FLORIDA_EQUIPMENT.items():
        if fl_model.lower() in model.lower():
            # Additional check for manufacturer if specified
            if fl_info["manufacturer"].lower() in mfr.lower():
                return True
            # Also match if manufacturer not strict
            if fl_model.lower() == model.lower():
                return True
    
    return False


def load_equipment_data():
    """Load equipment data from CSV into MongoDB."""
    
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    
    # Check if data already exists
    if collection.count_documents({}) > 0:
        print(f"Data already exists in {COLLECTION_NAME}. Dropping and reloading...")
        collection.drop()
    
    csv_path = RESOURCES_DIR / CSV_FILE
    
    if not csv_path.exists():
        print(f"Error: CSV file not found at {csv_path}")
        client.close()
        return
    
    print(f"Reading CSV from: {csv_path}")
    df = pd.read_csv(csv_path, dtype=str)
    
    # Clean column names
    df = df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)
    
    print(f"Processing {len(df)} records...")
    
    documents = []
    florida_count = 0
    
    for _, row in df.iterrows():
        manufacturer = row.get("Manufacturer", "")
        model_name = row.get("Model Name", "")
        
        if pd.isna(model_name) or model_name.strip() == "":
            continue
        
        first_year = parse_year(row.get("First Manufactured"))
        last_year = parse_year(row.get("Last Manufactured"))
        discontinued = parse_boolean(row.get("Discontinued"))
        
        # Calculate age
        age = None
        if first_year:
            age = CURRENT_YEAR - first_year
        
        # Calculate quality score
        quality = calculate_quality_score(row, age)
        
        # Calculate simulated metrics
        error_rate, reliability, scan_rate = calculate_simulated_metrics(row, age)
        
        # Check if Florida equipment
        state_fips = "12" if is_florida_equipment(model_name, manufacturer) else None
        if state_fips == "12":
            florida_count += 1
        
        document = {
            "manufacturer": manufacturer.strip() if pd.notna(manufacturer) else None,
            "modelName": model_name.strip(),
            "equipmentType": row.get("Equipment Type", "").strip() if pd.notna(row.get("Equipment Type")) else None,
            "firstManufactured": first_year,
            "lastManufactured": last_year,
            "discontinued": discontinued,
            "operatingSystem": row.get("OS", "").strip() if pd.notna(row.get("OS")) else None,
            "firmwareVersion": row.get("Firmware Version", "").strip() if pd.notna(row.get("Firmware Version")) else None,
            "batteryLife": row.get("Battery Life", "").strip() if pd.notna(row.get("Battery Life")) else None,
            "scanningRate": row.get("Scanning Rate", "").strip() if pd.notna(row.get("Scanning Rate")) else None,
            "hasVvpat": parse_boolean(row.get("VVPAT?")),
            "paperCapacity": None,  # Not in CSV
            "certificationLevel": row.get("Certification Level", "").strip() if pd.notna(row.get("Certification Level")) else None,
            "securityRisks": row.get("Security Risks", "").strip() if pd.notna(row.get("Security Risks")) else None,
            "notes": row.get("Notes/Misc.", "").strip() if pd.notna(row.get("Notes/Misc.")) else None,
            "ageYears": age,
            "scanRate": row.get("Scanning Rate", "").strip() if pd.notna(row.get("Scanning Rate")) else None,
            "errorRate": error_rate,
            "reliability": reliability,
            "qualityScore": quality,
            "stateFips": state_fips
        }
        
        documents.append(document)
    
    # Deduplicate by manufacturer+modelName, keeping the record with more filled fields
    def count_non_null_fields(doc):
        """Count non-null/non-empty fields in a document."""
        count = 0
        for key, value in doc.items():
            if key == "_id":
                continue
            if value is not None and value != "":
                count += 1
        return count
    
    deduped_documents = {}
    for doc in documents:
        # Create key from manufacturer + model name (case-insensitive)
        mfr = (doc.get("manufacturer") or "").lower().strip()
        model = (doc.get("modelName") or "").lower().strip()
        key = f"{mfr}|{model}"
        
        if key in deduped_documents:
            # Keep the one with more filled fields
            existing_count = count_non_null_fields(deduped_documents[key])
            new_count = count_non_null_fields(doc)
            if new_count > existing_count:
                deduped_documents[key] = doc
        else:
            deduped_documents[key] = doc
    
    documents = list(deduped_documents.values())
    print(f"After deduplication: {len(documents)} unique equipment records")
    
    # Recount Florida equipment after deduplication
    florida_count = sum(1 for doc in documents if doc.get("stateFips") == "12")
    
    # Bulk insert
    if documents:
        result = collection.insert_many(documents)
        print(f"Successfully inserted {len(result.inserted_ids)} documents")
        print(f"Florida equipment marked: {florida_count}")
    else:
        print("No documents to insert")
    
    # Create indexes
    try:
        collection.create_index("stateFips")
        collection.create_index("manufacturer")
        collection.create_index("qualityScore")
        print("Created indexes on stateFips, manufacturer, qualityScore")
    except Exception as e:
        print(f"Index creation warning: {e}")
    
    # Show sample
    sample = collection.find_one()
    if sample:
        print(f"\nSample document:")
        for key, value in sample.items():
            if key != "_id":
                print(f"  {key}: {value}")
    
    # Show Florida equipment
    florida_docs = list(collection.find({"stateFips": "12"}))
    print(f"\nFlorida equipment ({len(florida_docs)} items):")
    for doc in florida_docs[:5]:
        print(f"  - {doc['manufacturer']} {doc['modelName']} (Quality: {doc['qualityScore']})")
    
    client.close()
    print("\nLoad complete.")


if __name__ == "__main__":
    try:
        load_equipment_data()
    except Exception as e:
        print(f"Error loading equipment data: {e}")
        import traceback
        traceback.print_exc()
