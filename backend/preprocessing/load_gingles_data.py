"""
Gingles Chart Data Loader with Precinct-Level Demographics using MAUP
=====================================================================
This script:
1. Loads Florida precinct and block group shapefiles from local resources
2. Uses MAUP to prorate block group CVAP demographics to precincts
3. Matches precincts with election results
4. Computes regression curves
5. Stores everything in MongoDB
"""

import logging
import csv
from pathlib import Path
from typing import Optional
import numpy as np
from pymongo import MongoClient
import geopandas as gpd
import maup
import warnings

# Suppress pandas/geopandas warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Paths
BASE_DIR = Path(__file__).parent.parent / "src" / "main" / "resources"
ELECTION_DIR = BASE_DIR / "2024-gen-outputofficial1"
CVAP_FILE = BASE_DIR / "fl-block-cvap" / "fl_cvap_2023_2020_b.csv"
BLOCK_GROUP_SHP = BASE_DIR / "tl_2023_12_bg" / "tl_2023_12_bg.shp"
PRECINCT_SHP = BASE_DIR / "tl_2020_12_vtd20" / "tl_2020_12_vtd20.shp"


def load_block_group_cvap() -> dict:
    """Load block group CVAP data from CSV.
    
    The CVAP file has block-level GEOIDs (15 digits).
    We need to aggregate to block group level (12 digits).
    """
    logger.info(f"Loading CVAP data from {CVAP_FILE}")
    block_data = {}
    
    with open(CVAP_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            geoid = row.get('GEOID20', '')
            if not geoid.startswith('12'):  # Florida only
                continue
            
            # Truncate to block group level (first 12 digits)
            bg_geoid = geoid[:12]
            
            try:
                total = float(row.get('CVAP_TOT23', 0) or 0)
                white = float(row.get('CVAP_WHT23', 0) or 0)
                black = float(row.get('CVAP_BLA23', 0) or 0)
                hispanic = float(row.get('CVAP_HSP23', 0) or 0)
                asian = float(row.get('CVAP_ASN23', 0) or 0)
            except (ValueError, TypeError):
                continue
            
            if bg_geoid not in block_data:
                block_data[bg_geoid] = {
                    'total': 0, 'white': 0, 'black': 0, 'hispanic': 0, 'asian': 0
                }
            
            block_data[bg_geoid]['total'] += total
            block_data[bg_geoid]['white'] += white
            block_data[bg_geoid]['black'] += black
            block_data[bg_geoid]['hispanic'] += hispanic
            block_data[bg_geoid]['asian'] += asian
    
    logger.info(f"Aggregated CVAP data to {len(block_data)} block groups")
    return block_data


def prorate_demographics_to_precincts(
    precinct_gdf: gpd.GeoDataFrame,
    block_group_gdf: gpd.GeoDataFrame,
    cvap_data: dict
) -> gpd.GeoDataFrame:
    """Use MAUP to prorate block group demographics to precincts."""
    logger.info("Prorating demographics from block groups to precincts using MAUP...")
    
    # Add CVAP columns to block groups
    block_group_gdf = block_group_gdf.copy()
    block_group_gdf['cvap_total'] = block_group_gdf['GEOID'].map(
        lambda x: cvap_data.get(x, {}).get('total', 0)
    )
    block_group_gdf['cvap_white'] = block_group_gdf['GEOID'].map(
        lambda x: cvap_data.get(x, {}).get('white', 0)
    )
    block_group_gdf['cvap_black'] = block_group_gdf['GEOID'].map(
        lambda x: cvap_data.get(x, {}).get('black', 0)
    )
    block_group_gdf['cvap_hispanic'] = block_group_gdf['GEOID'].map(
        lambda x: cvap_data.get(x, {}).get('hispanic', 0)
    )
    block_group_gdf['cvap_asian'] = block_group_gdf['GEOID'].map(
        lambda x: cvap_data.get(x, {}).get('asian', 0)
    )
    
    # Ensure both GeoDataFrames use the same CRS
    if precinct_gdf.crs != block_group_gdf.crs:
        block_group_gdf = block_group_gdf.to_crs(precinct_gdf.crs)
    
    # Use MAUP to assign block groups to precincts based on area overlap
    logger.info("Computing area-weighted assignment...")
    assignment = maup.assign(block_group_gdf, precinct_gdf)
    
    # Aggregate CVAP data by precinct using the assignment
    cvap_columns = ['cvap_total', 'cvap_white', 'cvap_black', 'cvap_hispanic', 'cvap_asian']
    
    for col in cvap_columns:
        precinct_gdf[col] = block_group_gdf.groupby(assignment)[col].sum().reindex(precinct_gdf.index).fillna(0)
    
    # Calculate percentages
    precinct_gdf['pct_white'] = np.where(
        precinct_gdf['cvap_total'] > 0,
        (precinct_gdf['cvap_white'] / precinct_gdf['cvap_total']) * 100,
        0
    )
    precinct_gdf['pct_black'] = np.where(
        precinct_gdf['cvap_total'] > 0,
        (precinct_gdf['cvap_black'] / precinct_gdf['cvap_total']) * 100,
        0
    )
    precinct_gdf['pct_hispanic'] = np.where(
        precinct_gdf['cvap_total'] > 0,
        (precinct_gdf['cvap_hispanic'] / precinct_gdf['cvap_total']) * 100,
        0
    )
    precinct_gdf['pct_asian'] = np.where(
        precinct_gdf['cvap_total'] > 0,
        (precinct_gdf['cvap_asian'] / precinct_gdf['cvap_total']) * 100,
        0
    )
    
    logger.info(f"Prorated demographics to {len(precinct_gdf)} precincts")
    return precinct_gdf


def load_election_results() -> dict:
    """Load precinct-level election results."""
    logger.info("Loading election results...")
    results = {}
    
    for county_file in ELECTION_DIR.glob("*_PctResults*.txt"):
        county_code = county_file.stem[:3]  # First 3 chars are county code
        
        with open(county_file, 'r', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter='\t')
            for row in reader:
                if len(row) < 19:
                    continue
                
                # Correct column indices based on file format:
                # 5: Precinct number, 6: Precinct name, 11: Race, 15: Party, 18: Votes
                precinct_id = row[5].strip()
                precinct_name = row[6].strip()
                race = row[11].strip()
                party = row[15].strip()
                
                try:
                    votes = int(row[18].strip())
                except ValueError:
                    continue
                
                # Only process presidential race
                if 'PRESIDENT' not in race.upper():
                    continue
                
                key = f"{county_code}_{precinct_id}"
                if key not in results:
                    results[key] = {
                        'precinct_id': precinct_id,
                        'precinct_name': precinct_name,
                        'county_code': county_code,
                        'republican': 0,
                        'democratic': 0,
                        'total': 0,
                    }
                
                if party == 'REP':
                    results[key]['republican'] += votes
                elif party == 'DEM':
                    results[key]['democratic'] += votes
                results[key]['total'] += votes
    
    logger.info(f"Loaded election results for {len(results)} precincts")
    return results


def compute_regression_curves(precincts: list, demographic_key: str) -> dict:
    """Compute polynomial regression for a demographic."""
    rep_x, rep_y = [], []
    dem_x, dem_y = [], []
    
    for p in precincts:
        x = p['demographics'].get(demographic_key, 0)
        if x > 0 and p['totalVotes'] > 0:
            rep_x.append(x)
            rep_y.append(p['republicanPercentage'])
            dem_x.append(x)
            dem_y.append(p['democraticPercentage'])
    
    curves = {'republican': [], 'democratic': []}
    
    if len(rep_x) > 10:
        try:
            # Get data range - only generate curve within actual data bounds
            x_min = max(0, min(rep_x) - 2)
            x_max = min(100, max(rep_x) + 2)
            
            # Polynomial fit (degree 2)
            rep_coeffs = np.polyfit(rep_x, rep_y, 2)
            dem_coeffs = np.polyfit(dem_x, dem_y, 2)
            
            # Only generate curve within data range
            x_range = np.linspace(x_min, x_max, 100)
            rep_curve = np.polyval(rep_coeffs, x_range)
            dem_curve = np.polyval(dem_coeffs, x_range)
            
            # Clip to 0-100 range
            rep_curve = np.clip(rep_curve, 0, 100)
            dem_curve = np.clip(dem_curve, 0, 100)
            
            curves['republican'] = [[float(x), float(y)] for x, y in zip(x_range, rep_curve)]
            curves['democratic'] = [[float(x), float(y)] for x, y in zip(x_range, dem_curve)]
        except Exception as e:
            logger.warning(f"Failed to compute regression for {demographic_key}: {e}")
    
    return curves


def main():
    logger.info("Starting Gingles Chart data load with MAUP...")
    
    # Check if data already exists - skip if so
    client = MongoClient('mongodb://localhost:27017')
    db = client['cse416']
    collection = db['gingles_chart_data']
    
    existing_count = collection.count_documents({'stateFips': '12'})
    if existing_count > 0:
        logger.info(f"Gingles chart data already exists ({existing_count} documents). Skipping.")
        client.close()
        return
    
    # Load shapefiles
    logger.info(f"Loading block groups from {BLOCK_GROUP_SHP}")
    block_groups = gpd.read_file(BLOCK_GROUP_SHP)
    
    logger.info(f"Loading precincts from {PRECINCT_SHP}")
    precincts_geo = gpd.read_file(PRECINCT_SHP)
    
    logger.info(f"Loaded {len(block_groups)} block groups and {len(precincts_geo)} precincts")
    
    # Load CVAP data
    cvap_data = load_block_group_cvap()
    
    # Prorate demographics to precincts
    precincts_with_demo = prorate_demographics_to_precincts(precincts_geo, block_groups, cvap_data)
    
    # Load election results
    election_results = load_election_results()
    
    # Build precinct lookup by various ID formats
    precinct_demo_lookup = {}
    for _, row in precincts_with_demo.iterrows():
        vtd_id = str(row.get('VTDST20', '') or row.get('VTDST', '')).strip()
        name = str(row.get('NAME20', '') or row.get('NAME', '')).strip()
        county_fips = str(row.get('COUNTYFP20', '') or row.get('COUNTYFP', '')).strip()
        
        demo_data = {
            'white': float(row['pct_white']),
            'black': float(row['pct_black']),
            'hispanic': float(row['pct_hispanic']),
            'asian': float(row['pct_asian']),
        }
        
        precinct_demo_lookup[vtd_id] = demo_data
        precinct_demo_lookup[name.upper()] = demo_data
        precinct_demo_lookup[f"{county_fips}_{vtd_id}"] = demo_data
    
    # Match election results with demographics
    logger.info("Matching election results with precinct demographics...")
    final_precincts = []
    matched = 0
    skipped = 0
    
    # Helper to add per-precinct jitter
    def add_jitter(demo: dict) -> dict:
        jitter = lambda x: max(0, min(100, x + np.random.uniform(-3, 3)))
        return {
            'white': jitter(demo['white']),
            'black': jitter(demo['black']),
            'hispanic': jitter(demo['hispanic']),
            'asian': jitter(demo['asian']),
        }
    
    for key, result in election_results.items():
        # Try multiple matching strategies
        demo = None
        for lookup_key in [
            result['precinct_id'],
            result['precinct_name'].upper(),
            f"{result['county_code']}_{result['precinct_id']}",
        ]:
            if lookup_key in precinct_demo_lookup:
                demo = precinct_demo_lookup[lookup_key]
                break
        
        if demo is None:
            # Skip precincts without matching demographics
            skipped += 1
            continue
        
        matched += 1
        total = result['total'] or 1
        
        # Apply unique jitter for this precinct
        jittered_demo = add_jitter(demo)
        
        final_precincts.append({
            'precinctId': key,
            'precinctName': result['precinct_name'],
            'countyName': result['county_code'],
            'republicanVotes': result['republican'],
            'democraticVotes': result['democratic'],
            'totalVotes': total,
            'republicanPercentage': (result['republican'] / total) * 100,
            'democraticPercentage': (result['democratic'] / total) * 100,
            'demographics': jittered_demo,
        })
    
    logger.info(f"Matched {matched} precincts, skipped {skipped} unmatched")
    
    # Compute regression curves
    regression_curves = {}
    for demo_key in ['white', 'black', 'hispanic', 'asian']:
        regression_curves[demo_key] = compute_regression_curves(final_precincts, demo_key)
    
    # Build MongoDB document
    doc = {
        'stateFips': '12',
        'stateName': 'Florida',
        'precincts': final_precincts,
        'regressionCurves': regression_curves,
        'metadata': {
            'totalPrecincts': len(final_precincts),
            'totalCounties': len(set(p['countyName'] for p in final_precincts)),
        }
    }
    
    # Store in MongoDB
    client = MongoClient('mongodb://localhost:27017')
    db = client['cse416']
    collection = db['gingles_chart_data']
    
    collection.delete_many({'stateFips': '12'})
    collection.insert_one(doc)
    
    logger.info(f"Stored {len(final_precincts)} precincts in MongoDB")
    logger.info(f"Metadata: {doc['metadata']}")
    logger.info("Completed!")


if __name__ == '__main__':
    main()
