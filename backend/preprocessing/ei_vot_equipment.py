import pymongo
import pandas as pd
import numpy as np
from pyei.r_by_c import RowByColumnEI
from scipy.stats import gaussian_kde
import os
import sys

# Equipment type quality scores based on security research
# Higher = better quality/security
EQUIPMENT_TYPE_QUALITY = {
    "scanner": 0.90,           # Optical scanners - best security, paper trail
    "ballotMarkingDevice": 0.80,  # BMD - good, creates paper record
    "dreWithVVPAT": 0.60,      # DRE with paper trail - acceptable
    "dreNoVVPAT": 0.30,        # DRE without paper trail - security risk
}

def run_ei_equipment():
    """
    EI Analysis for Equipment Quality.
    Uses EAVS equipment type frequency data per county to calculate
    weighted equipment quality scores, then runs EI analysis.
    """
    print("Starting EI Equipment Quality Analysis...")
    
    # Connect to MongoDB
    try:
        client = pymongo.MongoClient("mongodb://localhost:27017/")
        db = client["cse416"]
        ei_collection = db["ei_data"]
        eavs_collection = db["eavs_data"]
        print("Connected to MongoDB.")
        
        # Check if data already exists
        if ei_collection.count_documents({"type": "equipment_quality", "state": "FL"}) > 0:
            print("Data for equipment_quality (FL) already exists in MongoDB. Skipping analysis.")
            client.close()
            return
            
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        sys.exit(1)

    # Get Florida county EAVS data with equipment info
    fl_eavs = list(eavs_collection.find({"stateAbbr": "FL", "electionYear": 2020}))
    
    if not fl_eavs:
        print("No Florida EAVS data found for 2020. Exiting.")
        sys.exit(1)
    
    print(f"Found {len(fl_eavs)} Florida counties with EAVS data")
    
    # Calculate equipment quality score per county
    county_quality = {}
    for doc in fl_eavs:
        fips = doc.get("fipsCode", "")[:5]  # Get 5-digit FIPS
        equipment = doc.get("equipment", {})
        
        # Get equipment counts
        dre_no_vvpat = equipment.get("dreNoVVPAT", 0) or 0
        dre_with_vvpat = equipment.get("dreWithVVPAT", 0) or 0
        bmd = equipment.get("ballotMarkingDevice", 0) or 0
        scanner = equipment.get("scanner", 0) or 0
        
        total_equipment = dre_no_vvpat + dre_with_vvpat + bmd + scanner
        
        if total_equipment > 0:
            # Weighted average quality based on equipment type frequency
            quality = (
                dre_no_vvpat * EQUIPMENT_TYPE_QUALITY["dreNoVVPAT"] +
                dre_with_vvpat * EQUIPMENT_TYPE_QUALITY["dreWithVVPAT"] +
                bmd * EQUIPMENT_TYPE_QUALITY["ballotMarkingDevice"] +
                scanner * EQUIPMENT_TYPE_QUALITY["scanner"]
            ) / total_equipment
        else:
            # Default to average if no equipment data
            quality = 0.65
        
        county_quality[fips] = quality
    
    print(f"Calculated quality for {len(county_quality)} counties")
    print(f"Quality range: {min(county_quality.values()):.3f} - {max(county_quality.values()):.3f}")
    
    # Load demographic data
    base_dir = os.path.dirname(os.path.abspath(__file__))
    race_data_path = os.path.join(base_dir, "../../analysis/ei_test/florida_race_data.csv")

    try:
        race_df = pd.read_csv(race_data_path)
    except FileNotFoundError as e:
        print(f"Error loading demographic data: {e}")
        sys.exit(1)

    # Add FIPS for matching
    race_df['FIPS_5'] = race_df['geoid'].astype(str)
    
    # Add equipment quality to race data
    race_df['equipment_quality'] = race_df['FIPS_5'].map(county_quality)
    race_df['equipment_quality'] = race_df['equipment_quality'].fillna(0.65)  # Default for unmatched
    
    # Calculate high/low quality fractions
    race_df['high_quality'] = race_df['equipment_quality']
    race_df['low_quality'] = 1 - race_df['equipment_quality']
    
    print(f"Matched {race_df['equipment_quality'].notna().sum()} counties with quality scores")

    # Define demographic groups
    group_cols = {
        'white_pct': 'White',
        'black_african_ame_pct': 'Black',
        'hispanic_pct': 'Hispanic',
        'asian_pct': 'Asian',
        'american_ind_alaska_native_pct': 'Native',
        'hawaiian_pacific_pct': 'Pacific Islander',
        'two_or_more_races_pct': 'Two Or More'
    }
    
    groups = list(group_cols.keys())
    group_names = list(group_cols.values())
    candidate_names = ["HighQuality", "LowQuality"]

    # Prepare data for PyEI
    group_fractions = race_df[groups].fillna(0)
    quality_fractions = race_df[['high_quality', 'low_quality']].fillna(0)
    total_votes = race_df['fixed_total'].fillna(0).astype(int).values

    # Filter invalid rows
    group_sums = group_fractions.sum(axis=1)
    quality_sums = quality_fractions.sum(axis=1)
    valid_indices = (total_votes > 0) & (group_sums > 0) & (quality_sums > 0)
    
    group_fractions = group_fractions[valid_indices]
    quality_fractions = quality_fractions[valid_indices]
    total_votes = total_votes[valid_indices]
    
    if len(total_votes) == 0:
        print("Error: No valid data after filtering.")
        sys.exit(1)

    # Robust Normalization Function
    def robust_normalize(df):
        values = df.values.astype(np.float64)
        values = np.maximum(values, 0)
        row_sums = values.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1
        values = values / row_sums
        
        row_sums = values.sum(axis=1)
        diffs = 1.0 - row_sums
        max_indices = values.argmax(axis=1)
        rows = np.arange(len(values))
        values[rows, max_indices] += diffs
        
        values = np.maximum(values, 0)
        row_sums = values.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1
        values = values / row_sums
        
        return pd.DataFrame(values, columns=df.columns, index=df.index)

    group_fractions = robust_normalize(group_fractions)
    quality_fractions = robust_normalize(quality_fractions)

    # Run EI
    print("Running RowByColumnEI for Equipment Quality...")
    ei = RowByColumnEI(model_name='multinomial-dirichlet-modified', pareto_shape=100, pareto_scale=100)
    
    group_fractions_np = group_fractions.values.T
    quality_fractions_np = quality_fractions.values.T
    
    print(f"Group Fractions Shape (Transposed): {group_fractions_np.shape}")
    print(f"Quality Fractions Shape (Transposed): {quality_fractions_np.shape}")
    print(f"Total Votes Shape: {total_votes.shape}")
    
    ei.fit(group_fractions_np, quality_fractions_np, total_votes, 
           demographic_group_names=group_names, 
           candidate_names=candidate_names,
           draws=1000, tune=500)

    print("EI Fit Complete.")

    # --- Generate KDE Data ---
    print("Generating KDE Data...")
    
    kde_results = {}
    sampled_voting_prefs = ei.sampled_voting_prefs
    x_grid = np.linspace(0, 1, 200)
    
    for g_idx, group in enumerate(group_names):
        kde_results[group] = {}
        for c_idx, candidate in enumerate(candidate_names):
            samples = sampled_voting_prefs[:, g_idx, c_idx]
            try:
                kde = gaussian_kde(samples)
                y_vals = kde(x_grid)
                points = [{"x": float(x), "y": float(y)} for x, y in zip(x_grid, y_vals)]
                kde_results[group][candidate] = points
            except Exception as e:
                print(f"Error generating KDE for {group}-{candidate}: {e}")
                kde_results[group][candidate] = []

    # --- Insert into MongoDB ---
    avg_quality = np.mean(list(county_quality.values()))
    doc = {
        "type": "equipment_quality",
        "state": "FL",
        "demographics": kde_results,
        "averageEquipmentQuality": float(avg_quality),
        "summary": str(ei.summary())
    }
    
    ei_collection.update_one(
        {"type": "equipment_quality", "state": "FL"},
        {"$set": doc},
        upsert=True
    )
    
    client.close()
    print("Equipment Quality Data inserted into MongoDB successfully.")

if __name__ == "__main__":
    run_ei_equipment()
