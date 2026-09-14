import os
import csv
import pandas as pd
import numpy as np
import uuid
import json
from datetime import datetime

# Define paths
SCRATCH_DIR = "/workspace/scratch"
MESSY_CSV_PATH = os.path.join(SCRATCH_DIR, "messy_google_sheets_export.csv")
MIGRATION_REPORT_PATH = os.path.join(SCRATCH_DIR, "migration-audit-report.json")
FINAL_SCRIPT_PATH = "/workspace/out/simulate-sheets-migration.py"

# Ensure scratch directory exists
os.makedirs(SCRATCH_DIR, exist_ok=True)

# ==========================================
# STEP 1: GENERATE MESSY GOOGLE SHEETS DATA
# ==========================================
def generate_messy_csv():
    # Messy real-world data showing varied capitalization, trailing units, ranges, and typos
    messy_rows = [
        {
            "Athlete Email": "joel.mullen@smallgoodsgym.com.au",
            "Date": "2026-09-01",
            "Exercise": "High Bar Back Squat",
            "Prescribed Sets": "3",
            "Prescribed Reps": "5",
            "Target RPE": "7-8",
            "Logged Reps": "5",
            "Logged Weight": "140 kg",
            "Logged RPE": "8",
            "VBT Mean Velocity (m/s)": "0.38"
        },
        {
            "Athlete Email": "Holly.Hunt@SmallGoodsGym.com.au ", # Trailing space, mixed case
            "Date": "2026-09-01",
            "Exercise": "Benchpress", # Typo/unstandardized name
            "Prescribed Sets": "4",
            "Prescribed Reps": "6",
            "Target RPE": "8",
            "Logged Reps": "6",
            "Logged Weight": "75kg", # Attached unit
            "Logged RPE": "8.5",
            "VBT Mean Velocity (m/s)": "0.22"
        },
        {
            "Athlete Email": "athlete_one@gmail.com",
            "Date": "2026-09-01",
            "Exercise": "Deadlift - Conventional",
            "Prescribed Sets": "1",
            "Prescribed Reps": "5",
            "Target RPE": "9",
            "Logged Reps": "5",
            "Logged Weight": "220KG", # Uppercase unit
            "Logged RPE": "9-9.5", # Range RPE
            "VBT Mean Velocity (m/s)": "0.18"
        },
        {
            "Athlete Email": "joel.mullen@smallgoodsgym.com.au",
            "Date": "2026-09-02",
            "Exercise": "HBBS", # Acronym
            "Prescribed Sets": "3",
            "Prescribed Reps": "5",
            "Target RPE": "8",
            "Logged Reps": "4", # Missed rep
            "Logged Weight": "145",
            "Logged RPE": "9.5",
            "VBT Mean Velocity (m/s)": "0.29"
        },
        {
            "Athlete Email": "invalid-email-format", # Malformed email
            "Date": "2026-09-02",
            "Exercise": "Back Squat",
            "Prescribed Sets": "3",
            "Prescribed Reps": "5",
            "Target RPE": "7",
            "Logged Reps": "", # Empty set (missed)
            "Logged Weight": "",
            "Logged RPE": "",
            "VBT Mean Velocity (m/s)": ""
        },
        {
            "Athlete Email": "holly.hunt@smallgoodsgym.com.au",
            "Date": "2026-09-02",
            "Exercise": "Unknown Movement X", # Unresolvable exercise
            "Prescribed Sets": "2",
            "Prescribed Reps": "8",
            "Target RPE": "6",
            "Logged Reps": "8",
            "Logged Weight": "40 kg",
            "Logged RPE": "6",
            "VBT Mean Velocity (m/s)": "0.65"
        }
    ]
    
    with open(MESSY_CSV_PATH, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=messy_rows[0].keys())
        writer.writeheader()
        writer.writerows(messy_rows)
    print(f"[PREPARE] Created simulated messy Google Sheet export at: {MESSY_CSV_PATH}")

# ==========================================
# STEP 2: BUILD CLEAN ETL PARSER
# ==========================================

# Canonical mapping for unstandardized coach nomenclature
EXERCISE_MAP = {
    "high bar back squat": "Back Squat",
    "hbbs": "Back Squat",
    "back squat": "Back Squat",
    "benchpress": "Bench Press",
    "bench press": "Bench Press",
    "deadlift - conventional": "Deadlift (Conventional)",
    "conventional deadlift": "Deadlift (Conventional)",
    "deadlift": "Deadlift (Conventional)"
}

# Pre-defined mock databases representing Javier's auth user base and Joel's active exercise registry
MOCK_USERS = {
    "joel.mullen@smallgoodsgym.com.au": str(uuid.uuid4()),
    "holly.hunt@smallgoodsgym.com.au": str(uuid.uuid4()),
    "athlete_one@gmail.com": str(uuid.uuid4())
}

# Mapping exercise name to canonical UUID
MOCK_CANONICAL_EXERCISES = {
    "Back Squat": {
        "id": str(uuid.uuid4()),
        "video_url": "https://vimeo.com/smallgoods/squat-guide",
        "category": "Squat",
        "mechanical_tags": ["quad_dominant", "hip_hinge"]
    },
    "Bench Press": {
        "id": str(uuid.uuid4()),
        "video_url": "https://vimeo.com/smallgoods/bench-guide",
        "category": "Bench",
        "mechanical_tags": ["horizontal_push"]
    },
    "Deadlift (Conventional)": {
        "id": str(uuid.uuid4()),
        "video_url": "https://vimeo.com/smallgoods/deadlift-guide",
        "category": "Deadlift",
        "mechanical_tags": ["posterior_chain", "hip_hinge"]
    }
}

def clean_numeric(val, default=None):
    """Safely extracts numeric values from messy user input (Postel's Law)."""
    if pd.isna(val) or val == "":
        return default
    
    # Strip letters, spaces, common units (kg, KG, lbs)
    cleaned = str(val).lower()
    for unit in ["kg", "lbs", "rpe", "m/s", "lbs."]:
        cleaned = cleaned.replace(unit, "")
    cleaned = cleaned.strip()
    
    # Handle ranges like "7-8" or "9-9.5" by selecting the upper limit
    if "-" in cleaned:
        try:
            parts = [float(p.strip()) for p in cleaned.split("-") if p.strip()]
            if parts:
                return max(parts) # Upper bound target
        except ValueError:
            pass
            
    try:
        return float(cleaned) if "." in cleaned else int(cleaned)
    except ValueError:
        return default

def run_etl_migration():
    df = pd.read_csv(MESSY_CSV_PATH)
    
    cleaned_rows = []
    audit_logs = {
        "total_records_read": len(df),
        "successful_migrations": 0,
        "failed_migrations": 0,
        "warnings": [],
        "failures": []
    }
    
    print("\n" + "="*80)
    print("SMALL GOODS GYM - MIGRATION PIPELINE START")
    print("="*80)
    
    for idx, row in df.iterrows():
        raw_email = row["Athlete Email"]
        raw_exercise = row["Exercise"]
        row_id = idx + 1
        
        # 1. Standardize and resolve user (Athlete Profile)
        email_clean = str(raw_email).strip().lower() if not pd.isna(raw_email) else ""
        athlete_id = MOCK_USERS.get(email_clean)
        
        if not athlete_id:
            audit_logs["failures"].append({
                "row": row_id,
                "reason": "Unresolvable Athlete User",
                "details": f"Email '{raw_email}' not found in Javier's auth database."
            })
            audit_logs["failed_migrations"] += 1
            print(f"❌ Row {row_id}: Failed to resolve athlete '{raw_email}'")
            continue
            
        # 2. Map and resolve exercise from canonical library
        exercise_key = str(raw_exercise).strip().lower() if not pd.isna(raw_exercise) else ""
        canonical_name = EXERCISE_MAP.get(exercise_key)
        exercise_meta = MOCK_CANONICAL_EXERCISES.get(canonical_name) if canonical_name else None
        
        if not exercise_meta:
            audit_logs["failures"].append({
                "row": row_id,
                "reason": "Unresolvable Exercise Name",
                "details": f"Exercise '{raw_exercise}' could not be matched to our standardized video library."
            })
            audit_logs["failed_migrations"] += 1
            print(f"❌ Row {row_id}: Failed to resolve exercise name '{raw_exercise}'")
            continue
            
        # 3. Clean numeric fields under Postel's Law
        prescribed_sets = clean_numeric(row["Prescribed Sets"], default=1)
        prescribed_reps = clean_numeric(row["Prescribed Reps"], default=5)
        target_rpe = clean_numeric(row["Target RPE"], default=None)
        
        logged_reps = clean_numeric(row["Logged Reps"], default=None)
        logged_weight = clean_numeric(row["Logged Weight"], default=None)
        logged_rpe = clean_numeric(row["Logged RPE"], default=None)
        vbt_velocity = clean_numeric(row["VBT Mean Velocity (m/s)"], default=None)
        
        # Detect adjustments or warnings
        if str(row["Logged Weight"]) != str(logged_weight) and logged_weight is not None:
            audit_logs["warnings"].append({
                "row": row_id,
                "type": "Data Normalization",
                "message": f"Sanitized logged weight from '{row['Logged Weight']}' to {logged_weight} kg."
            })
            
        if "-" in str(row["Target RPE"]):
            audit_logs["warnings"].append({
                "row": row_id,
                "type": "Range Normalization",
                "message": f"Standardized target RPE range '{row['Target RPE']}' to upper limit: {target_rpe}."
            })

        # 4. Construct clean relational schemas for target insertion
        session_id = str(uuid.uuid4())
        
        clean_row = {
            "session_id": session_id,
            "athlete_id": athlete_id,
            "athlete_email": email_clean,
            "scheduled_date": row["Date"],
            "exercise_id": exercise_meta["id"],
            "exercise_name": canonical_name,
            "exercise_video_url": exercise_meta["video_url"],
            "prescribed_sets": int(prescribed_sets),
            "prescribed_reps": int(prescribed_reps),
            "prescribed_rpe": float(target_rpe) if target_rpe else None,
            "logged_sets_captured": []
        }
        
        # If the athlete logged values, construct the set logs
        if logged_reps is not None or logged_weight is not None:
            # Recreate logs for the sets (simulating a simple single-set logger data row)
            for set_num in range(1, int(prescribed_sets) + 1):
                clean_row["logged_sets_captured"].append({
                    "log_id": str(uuid.uuid4()),
                    "set_number": set_num,
                    "logged_reps": int(logged_reps) if logged_reps is not None else int(prescribed_reps),
                    "logged_weight": float(logged_weight) if logged_weight is not None else None,
                    "logged_rpe": float(logged_rpe) if logged_rpe is not None else None,
                    "velocity_m_s": float(vbt_velocity) if vbt_velocity is not None else None
                })
                
        cleaned_rows.append(clean_row)
        audit_logs["successful_migrations"] += 1
        print(f"✓ Row {row_id}: Successfully matched athlete '{email_clean}' to {canonical_name} ({logged_weight or 0}kg)")

    print("\n" + "="*80)
    print("MIGRATION AUDIT COMPLETE")
    print("="*80)
    print(f"Successfully Migrated: {audit_logs['successful_migrations']} rows")
    print(f"Failed / Ignored:     {audit_logs['failed_migrations']} rows")
    print(f"Warnings Handled:     {len(audit_logs['warnings'])}")
    print("="*80 + "\n")
    
    # Save the audit reports
    with open(MIGRATION_REPORT_PATH, 'w') as f:
        json.dump(audit_logs, f, indent=2)
        
    return cleaned_rows

if __name__ == "__main__":
    generate_messy_csv()
    cleaned_records = run_etl_migration()
    
    # Output visual demonstration of migration mappings
    print("\nSAMPLE TARGET INSERTION SCHEMA (JSON READY FOR FASTAPI):")
    if cleaned_records:
        print(json.dumps(cleaned_records[0], indent=2))
