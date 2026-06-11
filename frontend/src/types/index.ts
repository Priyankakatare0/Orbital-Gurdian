export interface Satellite {
    id: string;
    name: string;
    norad_id: number | string;
    country?: string;
    satellite_type?: string;
    launch_date?: string;
    latitude: number;
    longitude: number;
    altitude: number;
    velocity?: number;
    inclination?: number;
    period?: number;
    risk_score?: number;
    health_status?: string;
    telemetry?: Telemetry;
    created_at?: string;
    updated_at?: string;
}

export interface Telemetry {
    satellite_id?: string;
    battery?: number;
    temperature?: number;
    signal?: number;
    battery_percentage?: number;
    temperature_celsius?: number;
    signal_strength?: number;
}

export interface TelemetryData {
    satellite_name: string;
    timestamp: string;
    battery_percentage: number;
    temperature_celsius: number;
    signal_strength: number;
    attitude_roll?: number;
    attitude_pitch?: number;
    attitude_yaw?: number;
    sun_angle?: number;
}

export interface HealthReport {
    satellite_name: string;
    health_score: number;
    is_anomaly: boolean;
    battery_percentage: number;
    temperature_celsius: number;
    signal_strength: number;
    status: string;
    warnings: string[];
}

export interface ThreatReport {
    satellite_name: string;
    threat_level: number;
    min_distance_km: number;
    closest_satellite?: string;
    nearby_count: number;
    message: string;
}

export interface RiskAssessment {
    satellite_name: string;
    risk_score: number;
    threat_level: number;
    health_risk: number;
    decision: string;
    priority: number;
    confidence: number;
    timestamp: string;
}

export interface Recommendation {
    satellite_name: string;
    recommendation: string;
    priority: string;
    actions: string[];
    generated: boolean;
}
