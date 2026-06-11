-- Orbital Guardian Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- Satellites table
CREATE TABLE IF NOT EXISTS satellites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    norad_id INTEGER,
    country VARCHAR(100),
    satellite_type VARCHAR(100),
    launch_date DATE,
    latitude FLOAT,
    longitude FLOAT,
    altitude FLOAT,
    velocity FLOAT,
    inclination FLOAT,
    eccentricity FLOAT,
    period FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Telemetry table (time-series optimized)
CREATE TABLE IF NOT EXISTS telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    satellite_id UUID REFERENCES satellites(id) ON DELETE CASCADE,
    satellite_name VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW(),
    battery_percentage FLOAT,
    temperature_celsius FLOAT,
    signal_strength FLOAT,
    attitude_roll FLOAT,
    attitude_pitch FLOAT,
    attitude_yaw FLOAT,
    sun_angle FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Risk assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    satellite_id UUID REFERENCES satellites(id) ON DELETE CASCADE,
    satellite_name VARCHAR(255),
    risk_score INTEGER,
    threat_level INTEGER,
    health_risk INTEGER,
    decision VARCHAR(255),
    priority INTEGER,
    confidence FLOAT,
    timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    satellite_id UUID REFERENCES satellites(id) ON DELETE CASCADE,
    satellite_name VARCHAR(255),
    recommendation TEXT,
    priority VARCHAR(50),
    actions TEXT[],
    generated BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts/Anomalies table
CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    satellite_id UUID REFERENCES satellites(id) ON DELETE CASCADE,
    satellite_name VARCHAR(255),
    anomaly_type VARCHAR(100),
    severity INTEGER,
    description TEXT,
    detected_at TIMESTAMP DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_satellites_name ON satellites(name);
CREATE INDEX idx_satellites_norad_id ON satellites(norad_id);
CREATE INDEX idx_telemetry_satellite_id ON telemetry(satellite_id);
CREATE INDEX idx_telemetry_timestamp ON telemetry(timestamp DESC);
CREATE INDEX idx_risk_satellite_id ON risk_assessments(satellite_id);
CREATE INDEX idx_risk_timestamp ON risk_assessments(timestamp DESC);
CREATE INDEX idx_recommendations_satellite_id ON recommendations(satellite_id);
CREATE INDEX idx_anomalies_satellite_id ON anomalies(satellite_id);

-- Enable Row Level Security (optional, for multi-tenant support)
ALTER TABLE satellites ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now, can be restricted later)
CREATE POLICY "Enable read access for all users" ON satellites
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON telemetry
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON risk_assessments
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON recommendations
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON anomalies
    FOR SELECT USING (true);
