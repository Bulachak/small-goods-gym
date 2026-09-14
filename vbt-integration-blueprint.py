import uuid
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

# =====================================================================
# FASTAPI BACKEND ARCHITECTURE & SCHEMA DEFINITIONS (Phase 2 Scaffolding)
# =====================================================================
# This module implements the FastAPI routes, validation schemas (Pydantic),
# and business logic to ingest Velocity-Based Training (VBT) telemetry.
# It enforces the Single Responsibility Principle (SRP) by separating 
# network validation from data access and analytical modeling.

class VBTRepSchema(BaseModel):
    rep_number: int = Field(..., ge=1, description="Sequential number of the repetition within the set")
    concentric_mean_velocity_m_s: float = Field(..., gt=0.0, le=3.0, description="Mean velocity of the concentric phase in meters/second")
    concentric_peak_velocity_m_s: Optional[float] = Field(None, gt=0.0)
    concentric_mean_power_watts: Optional[float] = Field(None, gt=0.0)
    bar_displacement_cm: Optional[float] = Field(None, gt=0.0, description="Vertical displacement of the barbell")
    
    @field_validator("concentric_mean_velocity_m_s")
    @classmethod
    def validate_velocity(cls, v: float) -> float:
        # Safeguard input under Postel's Law: strip unreasonable readings from faulty sensors
        if v > 2.5:
            raise ValueError("Velocity reading exceeds physiological human limits (>2.5 m/s). Check device calibration.")
        return round(v, 2)


class VBTSetIngestSchema(BaseModel):
    athlete_id: uuid.UUID
    exercise_id: uuid.UUID
    set_number: int = Field(..., ge=1)
    logged_reps: int = Field(..., ge=1)
    logged_weight: float = Field(..., ge=0.0, description="Logged weight in kilograms")
    logged_rpe: Optional[float] = Field(None, ge=1.0, le=10.0, description="Rate of Perceived Exertion (1-10 scale)")
    device_id: Optional[uuid.UUID] = None
    reps_telemetry: List[VBTRepSchema] = Field(default=[], description="Rep-by-rep sensor telemetry")

    @field_validator("logged_reps")
    @classmethod
    def validate_rep_match(cls, v: int, info) -> int:
        # Validate that telemetry reps match the total logged repetitions
        reps_telemetry = info.data.get("reps_telemetry", [])
        if reps_telemetry and len(reps_telemetry) != v:
            raise ValueError(f"Telemetry contains {len(reps_telemetry)} reps, but logged_reps is set to {v}.")
        return v


# =====================================================================
# FASTAPI CORE INGESTION ROUTER
# =====================================================================
# This router defines the API endpoints connecting the Next.js client
# and the FastAPI processing service, implementing Protected Variations 
# by wrapping the raw database connections behind abstract contracts.

from fastapi import APIRouter, HTTPException, Depends, status

router = APIRouter(prefix="/api/v1/vbt", tags=["VBT Telemetry Engine"])

# Mock Database session provider for demonstration purposes
def get_db():
    # In production, this yields a PostgreSQL SQLAlchemy or SQLModel session
    yield "db_session"

@router.post("/ingest-set", status_code=status.HTTP_201_CREATED)
async def ingest_vbt_set(payload: VBTSetIngestSchema, db=Depends(get_db)):
    """
    Ingests a complete lift set along with its high-resolution rep-by-rep telemetry.
    Calculates fatigue decay and flags biomechanical variances on-the-fly.
    """
    try:
        # 1. Calculate metrics in-memory first (Information Expert Pattern)
        fastest_rep_speed = 0.0
        slowest_rep_speed = float('inf')
        total_velocity = 0.0
        
        for rep in payload.reps_telemetry:
            vel = rep.concentric_mean_velocity_m_s
            total_velocity += vel
            if vel > fastest_rep_speed:
                fastest_rep_speed = vel
            if vel < slowest_rep_speed:
                slowest_rep_speed = vel
                
        # 2. Determine Velocity Decay (Fatigue Index)
        velocity_decay_pct = 0.0
        if fastest_rep_speed > 0 and len(payload.reps_telemetry) > 1:
            # Velocity loss is calculated comparing the final/slowest rep to the peak speed
            velocity_decay_pct = round(((fastest_rep_speed - payload.reps_telemetry[-1].concentric_mean_velocity_m_s) / fastest_rep_speed) * 100, 2)

        # 3. Formulate Automated Co-Pilot Feedback (Human-in-the-Loop scaffolding)
        co_pilot_flag = None
        if velocity_decay_pct >= 30.0:
            co_pilot_flag = "NEUROMUSCULAR_FATIGUE_WARNING: Velocity decay crossed 30%. Recommend reducing load by 5-10%."
        elif velocity_decay_pct >= 20.0:
            co_pilot_flag = "MODERATE_FATIGUE: Target velocity loss met. Complete set and extend rest interval."

        # Return computed telemetry payload to Next.js client for sub-400ms UI feedback (Doherty Threshold)
        return {
            "status": "success",
            "message": "Set and telemetry logged successfully.",
            "metrics": {
                "fastest_rep_m_s": fastest_rep_speed,
                "slowest_rep_m_s": slowest_rep_speed if slowest_rep_speed != float('inf') else 0.0,
                "average_velocity_m_s": round(total_velocity / len(payload.reps_telemetry), 2) if payload.reps_telemetry else 0.0,
                "velocity_decay_percentage": velocity_decay_pct,
                "co_pilot_flag": co_pilot_flag
            }
        }
        
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(val_err))
    except Exception as e:
        # Fail-Fast Principle: surface unexpected system errors cleanly
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"System Error: {str(e)}")


# =====================================================================
# SQL ANALYTICS SCRIPT (PostgreSQL Queries)
# =====================================================================
# Run these analytical queries directly on your PostgreSQL database to calculate
# advanced metrics such as Estimated 1-Rep Max (1RM) and Fatigue Decay.

SQL_ANALYTICS_QUERIES = """
-- QUERY 1: ESTIMATED 1-REP MAX (1RM) CALCULATION (Epley's Formula)
-- Automatically calculates the athlete's theoretical 1RM across lift variations 
-- based on logged heavy sets (Logged RPE >= 7, Logged Reps <= 10).
-- This query acts as the data generator for the PB Tracking dashboard.

SELECT 
    ap.user_id,
    e.name AS exercise_name,
    el.logged_weight,
    el.logged_reps,
    -- Epley 1RM Formula: Weight * (1 + Reps / 30.0)
    ROUND(el.logged_weight * (1 + el.logged_reps / 30.0), 2) AS calculated_1rm,
    ws.completed_at::date AS date_achieved
FROM exercise_logs el
JOIN workout_sessions ws ON el.session_id = ws.id
JOIN athlete_profiles ap ON ws.athlete_id = ap.id
JOIN exercises e ON el.exercise_id = e.id
WHERE el.logged_reps > 0 
  AND el.logged_weight > 0
  AND el.logged_rpe >= 7.0 -- Focuses on high-effort strength sets
ORDER BY calculated_1rm DESC, date_achieved DESC;


-- QUERY 2: VELOCITY DECAY & CONCENTRIC CONSISTENCY ANALYSIS
-- Analyzes rep-by-rep telemetry to pinpoint fatigue accumulation.
-- Identifies sets where velocity drop-off exceeded 30%, which Joel and Holly 
-- can use to audit programming volume and athlete readiness.

WITH rep_analysis AS (
    SELECT 
        vrl.set_log_id,
        MIN(vrl.concentric_mean_velocity_m_s) AS slowest_rep_speed,
        MAX(vrl.concentric_mean_velocity_m_s) AS fastest_rep_speed,
        COUNT(vrl.id) AS total_reps,
        -- Get the final rep's velocity based on sequence
        (ARRAY_AGG(vrl.concentric_mean_velocity_m_s ORDER BY vrl.rep_number DESC))[1] AS final_rep_speed
    FROM vbt_rep_logs vrl
    GROUP BY vrl.set_log_id
)
SELECT 
    ap.user_id,
    e.name AS exercise_name,
    el.set_number,
    el.logged_weight,
    ra.total_reps,
    ra.fastest_rep_speed AS peak_velocity_m_s,
    ra.final_rep_speed AS final_velocity_m_s,
    -- Decay Formula: ((Peak - Final) / Peak) * 100
    ROUND(((ra.fastest_rep_speed - ra.final_rep_speed) / ra.fastest_rep_speed) * 100, 2) AS velocity_loss_percentage,
    CASE 
        WHEN ((ra.fastest_rep_speed - ra.final_rep_speed) / ra.fastest_rep_speed) >= 0.30 THEN 'CRITICAL: Neuromuscular Fatigue (>30% loss)'
        WHEN ((ra.fastest_rep_speed - ra.final_rep_speed) / ra.fastest_rep_speed) >= 0.20 THEN 'WARNING: Substantial Fatigue (20-30% loss)'
        ELSE 'STABLE: Velocity within targets'
    END AS fatigue_classification
FROM rep_analysis ra
JOIN exercise_logs el ON ra.set_log_id = el.id
JOIN workout_sessions ws ON el.session_id = ws.id
JOIN athlete_profiles ap ON ws.athlete_id = ap.id
JOIN exercises e ON el.exercise_id = e.id
WHERE ra.fastest_rep_speed > 0;
"""
