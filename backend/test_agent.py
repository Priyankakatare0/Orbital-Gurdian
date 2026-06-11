"""
test_agents.py  —  Run with:  python test_agents.py
Verifies all four agents produce valid output without a running server.
"""

import asyncio, json, sys, traceback

PASS = "\033[92m✓ PASS\033[0m"
FAIL = "\033[91m✗ FAIL\033[0m"

results = []

def check(name, condition, detail=""):
    status = PASS if condition else FAIL
    print(f"  {status}  {name}" + (f" — {detail}" if detail else ""))
    results.append(condition)


# ─────────────────────────────────────────────
# 1. TELEMETRY SERVICE
# ─────────────────────────────────────────────
print("\n[1] Telemetry Service")
try:
    from services.telemetry import generate_telemetry
    t = generate_telemetry("ISS (ZARYA)", "25544")
    check("Returns dict",          isinstance(t, dict))
    check("Has battery field",     "battery" in t and 40 <= t["battery"] <= 100)
    check("Has temperature field", "temperature" in t)
    check("Has signal field",      "signal" in t and 60 <= t["signal"] <= 100)
    check("Has satellite_name",    t.get("satellite_name") == "ISS (ZARYA)")
except Exception as e:
    print(f"  {FAIL}  Import/runtime error: {e}")
    traceback.print_exc()


# ─────────────────────────────────────────────
# 2. HEALTH AGENT
# ─────────────────────────────────────────────
print("\n[2] Health Agent")
try:
    from agents.health_agent import analyze_health
    h = analyze_health("ISS (ZARYA)", "25544")
    check("Returns dict",          isinstance(h, dict))
    check("health_score 0-100",    0 <= h.get("health_score", -1) <= 100,
          f"got {h.get('health_score')}")
    check("status is valid",       h.get("status") in ("Nominal", "Degraded", "Critical"),
          f"got '{h.get('status')}'")
    check("anomaly is bool",       isinstance(h.get("anomaly"), (bool, type(True))))
    check("anomaly_score present", "anomaly_score" in h)
    print(f"     → health_score={h['health_score']}  status={h['status']}  anomaly={h['anomaly']}")
except Exception as e:
    print(f"  {FAIL}  Import/runtime error: {e}")
    traceback.print_exc()


# ─────────────────────────────────────────────
# 3. THREAT AGENT
# ─────────────────────────────────────────────
print("\n[3] Threat Agent")
async def test_threat():
    try:
        from agents.threat_agent import analyze_threats
        threat = await analyze_threats("25544", 45.32, -75.69, 408)
        check("Returns dict",             isinstance(threat, dict))
        check("collision_risk is valid",  threat.get("collision_risk") in
              ("NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"),
              f"got '{threat.get('collision_risk')}'")
        check("probability 0-1",         0 <= threat.get("probability", -1) <= 1)
        check("distance_km > 0",         threat.get("distance_km", 0) > 0)
        check("nearby_objects >= 0",     threat.get("nearby_objects", -1) >= 0)
        print(f"     → risk={threat['collision_risk']}  dist={threat['distance_km']} km  "
              f"nearby={threat['nearby_objects']}")
    except Exception as e:
        print(f"  {FAIL}  Import/runtime error: {e}")
        traceback.print_exc()

asyncio.run(test_threat())


# ─────────────────────────────────────────────
# 4. DECISION AGENT
# ─────────────────────────────────────────────
print("\n[4] Decision Agent")
async def test_decision():
    try:
        from agents.decision_agent import analyze_mission_risk
        sat = {"name": "ISS (ZARYA)", "norad_id": "25544",
               "lat": 45.32, "lng": -75.69, "altitude": 408}
        risk = await analyze_mission_risk(sat)
        check("Returns dict",            isinstance(risk, dict))
        check("mission_risk 0-100",      0 <= risk.get("mission_risk", -1) <= 100,
              f"got {risk.get('mission_risk')}")
        check("risk_level is valid",     risk.get("risk_level") in
              ("LOW", "MEDIUM", "HIGH", "CRITICAL"),
              f"got '{risk.get('risk_level')}'")
        check("can_maneuver is bool",    isinstance(risk.get("can_maneuver"), bool))
        check("health_score present",    "health_score" in risk)
        check("collision_risk present",  "collision_risk" in risk)
        print(f"     → mission_risk={risk['mission_risk']}  level={risk['risk_level']}  "
              f"can_maneuver={risk['can_maneuver']}")
    except Exception as e:
        print(f"  {FAIL}  Import/runtime error: {e}")
        traceback.print_exc()

asyncio.run(test_decision())


# ─────────────────────────────────────────────
# 5. RECOMMENDATION AGENT
# ─────────────────────────────────────────────
print("\n[5] Recommendation Agent")
async def test_recommendation():
    try:
        from agents.decision_agent import analyze_mission_risk
        from agents.recommendation_agent import generate_recommendation

        sat = {"name": "ISS (ZARYA)", "norad_id": "25544",
               "lat": 45.32, "lng": -75.69, "altitude": 408}
        risk_data = await analyze_mission_risk(sat)
        rec = await generate_recommendation(risk_data, "ISS (ZARYA)")

        check("Returns dict",              isinstance(rec, dict))
        check("Has 'action' field",        bool(rec.get("action")))
        check("Has 'reason' field",        bool(rec.get("reason")))
        check("Has 'estimated_impact'",    bool(rec.get("estimated_impact")))
        check("risk_reduction 0-100",      0 <= rec.get("risk_reduction", -1) <= 100,
              f"got {rec.get('risk_reduction')}")
        print(f"     → action: {rec.get('action', '')[:80]}")
    except Exception as e:
        print(f"  {FAIL}  Import/runtime error: {e}")
        traceback.print_exc()

asyncio.run(test_recommendation())


# ─────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────
passed = sum(results)
total  = len(results)
color  = "\033[92m" if passed == total else "\033[91m"
print(f"\n{'─'*45}")
print(f"{color}Results: {passed}/{total} checks passed\033[0m")
if passed < total:
    print("Fix the failing agents before starting the server.")
sys.exit(0 if passed == total else 1)