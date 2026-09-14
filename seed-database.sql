-- ==============================================================================
-- SMALL GOODS GYM - DATABASE SCHEMA & SEED CONFIGURATION
-- TARGET DATABASE: PostgreSQL 15+
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DROP TABLES IF EXISTS (For clean slate testing)
DROP TABLE IF EXISTS vbt_rep_logs CASCADE;
DROP TABLE IF EXISTS vbt_training_zones CASCADE;
DROP TABLE IF EXISTS vbt_devices CASCADE;
DROP TABLE IF EXISTS personal_bests CASCADE;
DROP TABLE IF EXISTS exercise_logs CASCADE;
DROP TABLE IF EXISTS workout_sessions CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS athlete_profiles CASCADE;

-- 1. ATHLETE PROFILE
CREATE TABLE athlete_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL, -- Reference to Javier's auth user table
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    height_cm NUMERIC(5,2) NOT NULL,
    femur_length_cm NUMERIC(4,2) NOT NULL,
    torso_length_cm NUMERIC(4,2) NOT NULL,
    arm_span_cm NUMERIC(5,2) NOT NULL,
    leverage_tags VARCHAR[] DEFAULT '{}', -- Calculated from biomechanical ratios
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. EXERCISE LIBRARY
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    video_url TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Squat', 'Bench', 'Deadlift', 'Weightlifting', 'Accessory'
    mechanical_tags VARCHAR[] DEFAULT '{}', -- e.g., {'quad_dominant', 'hip_hinge', 'vertical_push'}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. WORKOUT SESSIONS
CREATE TABLE workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    coaches_notes TEXT,
    athletes_notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'missed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. EXERCISE LOGS (Set-by-set workout performance)
CREATE TABLE exercise_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE RESTRICT,
    set_number INT NOT NULL,
    prescribed_reps INT NOT NULL,
    prescribed_weight NUMERIC(6,2),
    prescribed_rpe NUMERIC(3,1),
    logged_reps INT,
    logged_weight NUMERIC(6,2),
    logged_rpe NUMERIC(3,1),
    velocity_m_s NUMERIC(4,2), -- Average concentric velocity for the set
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PERSONAL BESTS
CREATE TABLE personal_bests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE RESTRICT,
    weight NUMERIC(6,2) NOT NULL,
    reps INT NOT NULL,
    calculated_1rm NUMERIC(6,2) NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL,
    log_id UUID REFERENCES exercise_logs(id) ON DELETE CASCADE
);

-- 6. VBT SENSOR HARDWARE REGISTRY
CREATE TABLE vbt_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    hardware_type VARCHAR(30) NOT NULL, -- 'linear_position_transducer', 'accelerometer'
    connection_protocol VARCHAR(20) DEFAULT 'bluetooth_le',
    firmware_version VARCHAR(20),
    calibration_offset_multiplier NUMERIC(5,4) DEFAULT 1.0000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. VBT PHYSIOLOGICAL ZONE THRESHOLDS
CREATE TABLE vbt_training_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name VARCHAR(50) UNIQUE NOT NULL,
    min_velocity_m_s NUMERIC(3,2) NOT NULL,
    max_velocity_m_s NUMERIC(3,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. GRANULAR VBT REP TELEMETRY
CREATE TABLE vbt_rep_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_log_id UUID REFERENCES exercise_logs(id) ON DELETE CASCADE,
    device_id UUID REFERENCES vbt_devices(id) ON DELETE SET NULL,
    rep_number INT NOT NULL,
    concentric_mean_velocity_m_s NUMERIC(4,2) NOT NULL,
    concentric_peak_velocity_m_s NUMERIC(4,2),
    concentric_mean_power_watts NUMERIC(6,1),
    concentric_peak_power_watts NUMERIC(6,1),
    eccentric_mean_velocity_m_s NUMERIC(4,2),
    bar_displacement_cm NUMERIC(5,2),
    concentric_duration_ms INT,
    peak_acceleration_g NUMERIC(4,2),
    velocity_loss_percentage NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- SEED DATA SETS
-- ==============================================================================

-- 1. SEED DEFAULT EXERCISE LIBRARY
INSERT INTO exercises (name, video_url, category, mechanical_tags) VALUES
('Back Squat', 'https://vimeo.com/smallgoods/back-squat', 'Squat', '{"quad_dominant", "knee_flexion", "axial_loading"}'),
('Front Squat', 'https://vimeo.com/smallgoods/front-squat', 'Squat', '{"quad_dominant", "knee_flexion", "thoracic_extension"}'),
('Bench Press (Competition)', 'https://vimeo.com/smallgoods/bench-press', 'Bench', '{"horizontal_push", "chest_dominant", "upper_body_triple_extension"}'),
('Conventional Deadlift', 'https://vimeo.com/smallgoods/deadlift-conventional', 'Deadlift', '{"hip_hinge", "posterior_chain", "axial_loading"}'),
('Sumo Deadlift', 'https://vimeo.com/smallgoods/deadlift-sumo', 'Deadlift', '{"hip_hinge", "hip_abduction", "quad_assisted"}'),
('Overhead Press (Press)', 'https://vimeo.com/smallgoods/overhead-press', 'Accessory', '{"vertical_push", "shoulder_dominant", "anterior_deltoid"}'),
('Power Clean', 'https://vimeo.com/smallgoods/power-clean', 'Weightlifting', '{"hip_extension", "explosive_triple_extension", "pulling_strength"}'),
('Power Snatch', 'https://vimeo.com/smallgoods/power-snatch', 'Weightlifting', '{"hip_extension", "explosive_triple_extension", "shoulder_stability"}'),
('Romanian Deadlift (RDL)', 'https://vimeo.com/smallgoods/rdl', 'Accessory', '{"hip_hinge", "hamstring_isolation", "posterior_chain"}'),
('Chest-Supported Row', 'https://vimeo.com/smallgoods/chest-supported-row', 'Accessory', '{"horizontal_pull", "lat_dominant", "upper_back"}');

-- 2. SEED DEFAULT VBT HARDWARE DEVICES
INSERT INTO vbt_devices (name, hardware_type, connection_protocol, firmware_version, calibration_offset_multiplier) VALUES
('RepOne Tether Unit 01', 'linear_position_transducer', 'bluetooth_le', 'v2.1.4', 1.0000),
('RepOne Tether Unit 02', 'linear_position_transducer', 'bluetooth_le', 'v2.1.4', 1.0000),
('GymAware Flex Laser 01', 'laser_optics', 'bluetooth_le', 'v4.0.2', 1.0012);

-- 3. SEED DEFAULT VBT PHYSIOLOGICAL TRAINING ZONES
INSERT INTO vbt_training_zones (zone_name, min_velocity_m_s, max_velocity_m_s, description) VALUES
('Absolute Strength / Max Effort', 0.15, 0.35, 'Heavy loads (85-100% 1RM) aimed at maximal force production. High central nervous system demand.'),
('Accelerative Strength', 0.45, 0.75, 'Moderate-to-heavy loads (65-85% 1RM) accelerated with maximal intent to recruit high-threshold motor units.'),
('Power / Explosive Strength', 0.75, 1.00, 'Moderate loads (45-65% 1RM) maximizing power output (Watts). Useful for speed and athletic recovery.'),
('Speed-Strength', 1.00, 1.30, 'Light loads (30-45% 1RM) moved with high speed. Focuses on explosive triple-extension speed.'),
('Starting Strength', 1.30, 2.00, 'Minimal loads (less than 30% 1RM) emphasizing instantaneous rate of force development (RFD).');

-- 4. SEED TEST ATHLETES (Simulated linkage to Javier's Authentication layer)
INSERT INTO athlete_profiles (id, user_id, email, first_name, last_name, height_cm, femur_length_cm, torso_length_cm, arm_span_cm, leverage_tags) VALUES
('cf995098-a20d-4abb-8901-aeff2e127191', '0190a6e3-1b91-764a-bd5a-fa7d5a5700a1', 'joel.mullen@smallgoodsgym.com.au', 'Joel', 'Mullen', 180.50, 48.00, 61.00, 185.00, '{"balanced_leverages", "olympic_weightlifting_optimal"}'),
('e4d94b0d-b891-4cfd-b4b3-d6c412534571', '0190a6e3-1b91-764a-bd5a-fa7d5a5700a2', 'holly.hunt@smallgoodsgym.com.au', 'Holly', 'Hunt', 165.00, 45.50, 52.00, 161.00, '{"long_femurs", "short_torso", "leverage_squat_deficit"}'),
('cf995098-a20d-4abb-8901-aeff2e127192', '0190a6e3-1b91-764a-bd5a-fa7d5a5700a3', 'athlete_one@gmail.com', 'Sarah', 'Connor', 170.00, 41.00, 58.50, 178.00, '{"short_femurs", "long_arms", "deadlift_monster"}');
