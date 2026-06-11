# backend/services/telemetry.py
import numpy as np

# Store last known values to make changes gradual
last_telemetry: dict[str, dict] = {}

def generate_telemetry(satellite_name: str, norad_id: str) -> dict:
    # If we have existing data for this satellite, make small adjustments
    if norad_id in last_telemetry:
        prev = last_telemetry[norad_id]
        # Only change values by ±2% max - realistic for satellite telemetry
        new_battery = max(40, min(100, prev['battery'] + np.random.uniform(-2, 2)))
        new_temp = max(-40, min(60, prev['temperature'] + np.random.uniform(-3, 3)))
        new_signal = max(50, min(100, prev['signal'] + np.random.uniform(-5, 5)))
    else:
        # First time - initialize with reasonable starting values
        new_battery = round(float(np.random.uniform(70, 90)), 2)
        new_temp = round(float(np.random.normal(15, 5)), 2)
        new_signal = round(float(np.random.uniform(70, 90)), 2)
    
    # Save for next time
    last_telemetry[norad_id] = {
        'battery': new_battery,
        'temperature': new_temp,
        'signal': new_signal
    }
    
    return {
        'satellite_name': satellite_name,
        'norad_id': norad_id,
        'battery': round(new_battery, 2),
        'temperature': round(new_temp, 2),
        'signal': round(new_signal, 2),
    }