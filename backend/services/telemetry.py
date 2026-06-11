# backend/services/telemetry.py
import numpy as np

def generate_telemetry(satellite_name: str, norad_id: str) -> dict:
    return {
        'satellite_name': satellite_name,
        'norad_id': norad_id,
        'battery': round(float(np.random.uniform(40, 100)), 2),
        'temperature': round(float(np.random.normal(22, 15)), 2),
        'signal': round(float(np.random.uniform(60, 100)), 2),
    }