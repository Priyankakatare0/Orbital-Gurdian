from agents.health_agent import analyze_health
from agents.threat_agent import analyze_threats

async def analyze_mission_risk(satellite: dict) -> dict:
    '''
    The core innovation: combine health + collision risk.
    Returns a mission risk score AND whether a maneuver is feasible.
    '''
    health = await analyze_health(satellite['name'], satellite['norad_id'])
    threat = await analyze_threats(
        satellite['norad_id'],
        satellite.get('lat', 0),
        satellite.get('lng', 0),
        satellite.get('altitude', 400)
    )

    # Convert risk levels to numeric (0-100)
    collision_numeric = _risk_to_score(threat['collision_risk'])
    health_numeric    = 100 - health['health_score']  # invert: higher = worse

    # THE FORMULA
    mission_risk = round((collision_numeric * 0.6) + (health_numeric * 0.4), 1)

    # Can we perform a maneuver? Need battery >= 40% and no thermal anomaly
    can_maneuver = (health['battery'] >= 40 and
                not bool(health['anomaly']) and   # <-- add bool()
                health['health_score'] >= 50)

    return {
        'mission_risk': mission_risk,
        'collision_risk': threat['collision_risk'],
        'health_score': health['health_score'],
        'can_maneuver': can_maneuver,
        'battery': health['battery'],
        'health_detail': health,
        'threat_detail': threat,
        'risk_level': _mission_risk_level(mission_risk)
    }

def _risk_to_score(risk: str) -> float:
    return {'NONE': 5, 'LOW': 25, 'MEDIUM': 50, 'HIGH': 80, 'CRITICAL': 95}.get(risk, 5)

def _mission_risk_level(score: float) -> str:
    if score >= 75: return 'CRITICAL'
    if score >= 50: return 'HIGH'
    if score >= 25: return 'MEDIUM'
    return 'LOW'
