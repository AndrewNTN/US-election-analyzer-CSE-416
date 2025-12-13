import pymongo
import pandas as pd
import numpy as np
from pyei.r_by_c import RowByColumnEI
from scipy.stats import gaussian_kde
import os
import sys

def run_ei_rejected_ballots():
    print("Starting EI Rejected Ballots Analysis (Mail Ballots)...")
    
    # Connect to MongoDB and check if data already exists
    try:
        client = pymongo.MongoClient("mongodb://localhost:27017/")
        db = client["cse416"]
        collection = db["ei_data"]
        print("Connected to MongoDB.")
        
        # Check if data already exists
        if collection.count_documents({"type": "rejected_ballots", "state": "FL"}) > 0:
            print("Data for rejected_ballots (FL) already exists in MongoDB. Skipping analysis.")
            client.close()
            return
            
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        sys.exit(1)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Adjust paths to point to analysis/ei_test
    race_data_path = os.path.join(base_dir, "../../analysis/ei_test/florida_race_data.csv")
    rejection_data_path = os.path.join(base_dir, "../../analysis/ei_test/florida_rejection_rates.csv")

    print(f"Loading data from: {race_data_path} and {rejection_data_path}")

    # Load Data
    try:
        race_df = pd.read_csv(race_data_path)
        rejection_df = pd.read_csv(rejection_data_path)
    except FileNotFoundError as e:
        print(f"Error loading files: {e}")
        sys.exit(1)

    # Prepare FIPS for merging
    race_df['FIPS_5'] = race_df['geoid'].astype(str)
    rejection_df['FIPS_5'] = rejection_df['FIPSCode'].astype(str).str[:5]
    
    # Merge
    merged_df = pd.merge(race_df, rejection_df, on='FIPS_5', how='inner')
    
    if merged_df.empty:
        print("Error: Merged dataframe is empty. Check FIPS matching.")
        sys.exit(1)

    # Define Groups and Candidates
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
    
    candidate_cols = {
        'rejection_pct': 'Rejected',
        'not_rejection_pct': 'NotRejected'
    }
    candidates = list(candidate_cols.keys())
    candidate_names = list(candidate_cols.values())

    # Prepare data for PyEI
    group_fractions = merged_df[groups].fillna(0)
    votes_fractions = merged_df[candidates].fillna(0)
    # Use fixed_total (CVAP) as population to match notebook
    total_votes = merged_df['fixed_total'].fillna(0).astype(int).values

    # Filter invalid rows BEFORE normalization
    group_sums = group_fractions.sum(axis=1)
    vote_sums = votes_fractions.sum(axis=1)
    
    valid_indices = (total_votes > 0) & (group_sums > 0) & (vote_sums > 0)
    
    group_fractions = group_fractions[valid_indices]
    votes_fractions = votes_fractions[valid_indices]
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
        
        # Force sum to exactly 1.0
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
    votes_fractions = robust_normalize(votes_fractions)

    # Filter out any rows that are still not 1.0
    g_sums = group_fractions.sum(axis=1)
    v_sums = votes_fractions.sum(axis=1)
    
    valid_g = np.abs(g_sums - 1.0) < 1e-10
    valid_v = np.abs(v_sums - 1.0) < 1e-10
    valid_rows = valid_g & valid_v
    
    if not valid_rows.all():
        print(f"Dropping {len(valid_rows) - valid_rows.sum()} rows due to normalization issues.")
        group_fractions = group_fractions[valid_rows]
        votes_fractions = votes_fractions[valid_rows]
        total_votes = total_votes[valid_rows]

    # Run EI
    print("Running RowByColumnEI for Rejected Ballots...")
    ei = RowByColumnEI(model_name='multinomial-dirichlet-modified', pareto_shape=100, pareto_scale=100)
    
    # Convert to numpy arrays and TRANSPOSE to match (num_groups, num_precincts)
    group_fractions_np = group_fractions.values.T
    votes_fractions_np = votes_fractions.values.T
    
    print(f"Group Fractions Shape (Transposed): {group_fractions_np.shape}")
    print(f"Votes Fractions Shape (Transposed): {votes_fractions_np.shape}")
    print(f"Total Votes Shape: {total_votes.shape}")
    
    # Fit
    ei.fit(group_fractions_np, votes_fractions_np, total_votes, 
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
    doc = {
        "type": "rejected_ballots",
        "state": "FL",
        "demographics": kde_results,
        "summary": str(ei.summary())
    }
    
    collection.update_one(
        {"type": "rejected_ballots", "state": "FL"},
        {"$set": doc},
        upsert=True
    )
    
    client.close()
    print("Rejected Ballots Data inserted into MongoDB successfully.")

if __name__ == "__main__":
    run_ei_rejected_ballots()
