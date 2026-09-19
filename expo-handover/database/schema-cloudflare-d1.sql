-- ==============================================================================
-- Small Goods Gym • Cloudflare D1 (SQLite) Relational Schema
-- Aligned with Javier Pereira's Production Stack & Joel Mullen's Biomechanics
--
-- Features:
-- 1. Strict separation of PII (users) from physical biometrics (biometrics table)
-- 2. Extended anthropometry: Femur, Torso, Forearm (Forelimb), Upper Arm (Humerus)
-- 3. 12-Platform capacity cap and session waitlist logic
-- 4. Automated GDPR / PII Anonymization on member hiatus or archive
-- ==============================================================================

-- 1. USERS TABLE (Synced via Clerk Webhook)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                       -- Internal UUID
    clerk_user_id TEXT UNIQUE NOT NULL,        -- Clerk JWT Sub claim
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('member', 'coach', 'physio', 'admin')) DEFAULT 'member',
    membership_status TEXT NOT NULL CHECK(membership_status IN ('active', 'hiatus', 'archived')) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(membership_status);

-- 2. BIOMETRICS TABLE (Isolated for Privacy & GDPR / PII Compliance)
CREATE TABLE IF NOT EXISTS biometrics (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    is_anonymized INTEGER DEFAULT 0 CHECK(is_anonymized IN (0, 1)),
    
    -- Anthropometric Measurements (cm) - Sanitized on hiatus/archive
    height_cm REAL,
    femur_length_cm REAL,
    torso_length_cm REAL,
    upper_arm_length_cm REAL,                 -- Humerus (Joel call requirement)
    forearm_length_cm REAL,                   -- Forelimb (Joel call requirement)
    arm_span_cm REAL,
    
    -- Kinematic Ratios
    femur_to_torso_ratio REAL,
    forearm_to_arm_ratio REAL,
    ape_index REAL,
    
    -- Categorical Lever Tags (Preserved permanently for aggregate research)
    leverage_tags TEXT DEFAULT '[]',          -- JSON array e.g. '["long_femur", "short_torso", "long_forearm"]'
    age_range TEXT,                           -- e.g. '25-34' (Sanitized from exact age)
    max_lifts_json TEXT DEFAULT '{}',         -- JSON e.g. '{"snatch_tier": "80-90kg", "squat_tier": "140-160kg"}'
    
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_biometrics_user_id ON biometrics(user_id);

-- 3. EXERCISE LIBRARY
CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    movement_pattern TEXT NOT NULL CHECK(movement_pattern IN ('squat', 'hinge', 'push', 'pull', 'olympic', 'accessory')),
    vbt_profile_type TEXT DEFAULT 'relative',  -- 'absolute' vs 'relative' velocity cutoff
    video_url TEXT,
    coaching_cues TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. USER PROGRAMS & MACROCYCLES
CREATE TABLE IF NOT EXISTS user_programs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    program_name TEXT NOT NULL,
    macrocycle_block INTEGER DEFAULT 1,       -- 12-week macrocycle (Blocks 1-3)
    cycle_week INTEGER DEFAULT 1,
    status TEXT NOT NULL CHECK(status IN ('active', 'completed', 'paused')) DEFAULT 'active',
    start_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_programs_user_id ON user_programs(user_id);

-- 5. PROGRAM SETS & VBT LOGS
CREATE TABLE IF NOT EXISTS program_sets (
    id TEXT PRIMARY KEY,
    program_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    prescribed_weight_kg REAL NOT NULL,
    prescribed_reps INTEGER NOT NULL,
    logged_weight_kg REAL,
    logged_reps INTEGER,
    logged_vbt_velocity REAL,                 -- Enode velocity in m/s
    is_completed INTEGER DEFAULT 0 CHECK(is_completed IN (0, 1)),
    cns_fatigue_flag INTEGER DEFAULT 0 CHECK(cns_fatigue_flag IN (0, 1)), -- 1 if velocity drop > 15%
    logged_at DATETIME,
    FOREIGN KEY (program_id) REFERENCES user_programs(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE INDEX IF NOT EXISTS idx_sets_program_id ON program_sets(program_id);

-- 6. EVENTS & 12-PLATFORM TRAINING SESSIONS
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,                       -- e.g. "Evening Barbell Session", "Sunday Community Breakfast Biscuits"
    event_type TEXT NOT NULL CHECK(event_type IN ('platform_session', 'community_event', 'clinic')),
    event_datetime DATETIME NOT NULL,
    capacity_cap INTEGER NOT NULL DEFAULT 12,  -- Strict Small Goods 12-Platform Limit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_rsvps (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    platform_number INTEGER CHECK(platform_number BETWEEN 1 AND 12),
    status TEXT NOT NULL CHECK(status IN ('confirmed', 'waitlist', 'cancelled')) DEFAULT 'confirmed',
    waitlist_position INTEGER,
    rsvp_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(event_id, platform_number)          -- Enforce 1 lifter per platform per session
);

CREATE INDEX IF NOT EXISTS idx_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id ON event_rsvps(user_id);

-- ==============================================================================
-- PRIVACY & ANONYMIZATION PIPELINE (GDPR / California PII Compliance)
-- ==============================================================================

-- Trigger: When a member's status is changed to 'hiatus' or 'archived',
-- wipe exact millimetric limb measurements while preserving non-identifiable
-- leverage tags and ratios for gym-floor biomechanical modeling.
CREATE TRIGGER IF NOT EXISTS trg_anonymize_member_biometrics
AFTER UPDATE OF membership_status ON users
WHEN NEW.membership_status IN ('hiatus', 'archived')
BEGIN
    UPDATE biometrics
    SET 
        is_anonymized = 1,
        height_cm = NULL,
        femur_length_cm = NULL,
        torso_length_cm = NULL,
        upper_arm_length_cm = NULL,
        forearm_length_cm = NULL,
        arm_span_cm = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.id;
END;

-- ==============================================================================
-- 7. COMPETITION RECORDS & 9-ATTEMPT ACCORDION (Lifter Passport)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS competition_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    meet_name TEXT NOT NULL,
    meet_date DATE NOT NULL,
    division TEXT NOT NULL,
    weight_class_kg REAL NOT NULL,
    federation TEXT NOT NULL,
    ipf_gl_points REAL,
    tier_rank TEXT CHECK(tier_rank IN ('Diamond', 'Platinum', 'Gold', 'Silver 1', 'Silver 2', 'Silver 3', 'Bronze')),
    best_squat_kg REAL,
    best_bench_kg REAL,
    best_deadlift_kg REAL,
    total_kg REAL,
    attempts_json TEXT NOT NULL DEFAULT '{}', -- JSON object with squat, bench, deadlift 3-attempt arrays
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_competitions_user_id ON competition_records(user_id);

-- ==============================================================================
-- 8. TROPHY CASE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS trophy_case (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,                     -- e.g. "WA State Champion", "APU Nationals Gold"
    level TEXT NOT NULL CHECK(level IN ('gold', 'silver', 'bronze')),
    awarded_date DATE,
    competition_record_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (competition_record_id) REFERENCES competition_records(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_trophies_user_id ON trophy_case(user_id);

