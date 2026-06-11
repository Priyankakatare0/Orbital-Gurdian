import asyncio
import numpy as np
from sklearn.ensemble import IsolationForest
from services.telemetry import generate_telemetry

TRAINING_DATA = np.array([
    [95, 22, 98],
    [88, 20, 91],
    [76, 27, 85],
    [68, 18, 78],
    [55, 35, 72],
    [45, -5, 65],
    [42, 52, 61],
    [98, 24, 96],
])

MODEL = IsolationForest(contamination=0.2, random_state=42)
MODEL.fit(TRAINING_DATA)

def _run_health_analysis_sync(satellite_name: str, norad_id: str) -> dict:
    """Synchronous function to run the health analysis."""
    telemetry = generate_telemetry(satellite_name, norad_id)

    # Isolation Forest scores: -1 = anomaly, 1 = normal
    features = [[telemetry['battery'], telemetry['temperature'], telemetry['signal']]]
    anomaly_score = MODEL.decision_function(features)[0]
    is_anomaly = bool(MODEL.predict(features)[0] == -1)

    # Convert to 0-100 health score
    health_score = _calculate_health_score(telemetry, anomaly_score)

    return {
        **telemetry,
        'health_score': round(health_score, 1),
        'anomaly': bool(is_anomaly),
        'anomaly_score': round(float(anomaly_score), 4),
        'status': _health_status(health_score)
    }

async def analyze_health(satellite_name: str, norad_id: str) -> dict:
    """
    Analyzes satellite health asynchronously by running the blocking analysis
    in a separate thread.
    """
    loop = asyncio.get_running_loop()
    health_data = await loop.run_in_executor(
        None, _run_health_analysis_sync, satellite_name, norad_id
    )
    return health_data

def _calculate_health_score(t: dict, anomaly_score: float) -> float:
    battery_score   = t['battery']
    temp_score      = max(0, 100 - abs(t['temperature'] - 22) * 2)
    signal_score    = t['signal']
    anomaly_penalty = 20 if anomaly_score < -0.1 else 0
    return max(0, (battery_score * 0.4 + temp_score * 0.3 + signal_score * 0.3) - anomaly_penalty)

def _health_status(score: float) -> str:
    if score >= 80: return 'Nominal'
    if score >= 55: return 'Degraded'
    return 'Critical'
