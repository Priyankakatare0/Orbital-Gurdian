import asyncio
import json
import re
import os

try:
    import google.generativeai as genai
except ImportError:
    genai = None

model = None
if genai and os.getenv('GEMINI_API_KEY'):
    genai.configure(api_key=os.environ['GEMINI_API_KEY'])
    model = genai.GenerativeModel('gemini-1.5-flash')


def _fallback_recommendation(risk_data: dict) -> dict:
    risk = risk_data.get('risk_level', 'LOW')
    battery = risk_data.get('battery', 0)
    health = risk_data.get('health_score', 0)
    mission_risk = risk_data.get('mission_risk', 0)
    collision_risk = risk_data.get('collision_risk', 'UNKNOWN')
    can_maneuver = risk_data.get('can_maneuver', False)

    observations = {
        'CRITICAL': f'Mission risk at {mission_risk}/100 with {collision_risk} collision probability and battery at {battery:.1f}%.',
        'HIGH':     f'Mission risk elevated to {mission_risk}/100; collision risk is {collision_risk} with health score {health}/100.',
        'MEDIUM':   f'Mission risk at {mission_risk}/100; conjunction geometry warrants review given {battery:.1f}% battery reserve.',
        'LOW':      f'Mission risk nominal at {mission_risk}/100; all subsystems within acceptable bounds.',
    }

    reasonings = {
        'CRITICAL': (
            f'Battery at {battery:.1f}% constrains delta-v budget. Health score of {health}/100 suggests '
            f'subsystem degradation that may amplify power draw during any corrective burn. '
            f'At this risk level, degraded thermal or power margins reduce maneuver windows.'
        ),
        'HIGH': (
            f'A {collision_risk} collision risk combined with health score {health}/100 indicates the spacecraft '
            f'may be operating near its thermal or power envelope. Waiting beyond 24 hours risks narrowing '
            f'the viable burn window as orbital geometry evolves.'
        ),
        'MEDIUM': (
            f'Current conjunction geometry is evolving. With battery at {battery:.1f}% and mission risk at '
            f'{mission_risk}/100, there is margin to wait for a refined TCA estimate before committing fuel.'
        ),
        'LOW': (
            f'All parameters — battery {battery:.1f}%, health {health}/100, mission risk {mission_risk}/100 — '
            f'are within nominal bounds. No anomalous trend detected in the current conjunction geometry.'
        ),
    }

    likely_causes = {
        'CRITICAL': 'Likely compounded by recent eclipse cycles reducing charge accumulation and/or elevated drag from atmospheric density variations at current orbital altitude.',
        'HIGH':     'Probable cause is degraded power subsystem efficiency reducing margin for orbital correction, possibly linked to thermal cycling stress on battery cells.',
        'MEDIUM':   'Conjunction geometry is likely the result of natural orbital drift; no anomalous propulsion or attitude event detected.',
        'LOW':      'No anomalous cause identified; situation is consistent with routine operational variance.',
    }

    impacts = {
        'CRITICAL': 'Without action, continued battery drain will eliminate maneuver capability within hours, leaving no delta-v reserve to avoid the conjunction. Risk of loss of mission.',
        'HIGH':     'Delaying maneuver allows the TCA window to close; residual conjunction risk rises as separation distance decreases and corrective delta-v cost increases.',
        'MEDIUM':   'Inaction is acceptable short-term but must be revisited after the next tracking update; failure to act on a worsening geometry risks an unplanned emergency burn.',
        'LOW':      'No significant consequence if no action taken; standard watchkeeping is sufficient.',
    }

    actions = {
        'CRITICAL': (
            f'Execute a minimum-fuel avoidance burn immediately using the remaining {battery:.1f}% battery reserve; '
            f'prioritize burn timing at the next perigee for maximum delta-v efficiency.'
            if can_maneuver else
            f'Maneuver is not currently possible at {battery:.1f}% battery; shed non-essential loads immediately '
            f'to recover charge margin, then reassess burn feasibility within 2 hours.'
        ),
        'HIGH': (
            f'Schedule a prograde avoidance maneuver within the next 24-hour window; '
            f'calculate minimum delta-v using latest TLE and target a miss distance of >5 km.'
            if can_maneuver else
            f'Maneuver capability is constrained; initiate load-shedding to recover battery margin '
            f'and coordinate with ground for emergency burn authority.'
        ),
        'MEDIUM': (
            f'Request a refined conjunction data message (CDM) update; hold maneuver decision '
            f'until next tracking pass confirms or reduces probability of collision.'
        ),
        'LOW': (
            f'Continue nominal operations; log conjunction event and schedule a routine review '
            f'after the next ground contact to confirm geometry is not evolving adversely.'
        ),
    }

    expected_improvements = {
        'CRITICAL': 'Avoidance burn increases miss distance beyond collision threshold, preserving mission continuity.',
        'HIGH':     'Timely maneuver reduces collision probability to <1e-5 and restores full operational margin.',
        'MEDIUM':   'Awaiting refined tracking data avoids unnecessary fuel expenditure while managing risk exposure.',
        'LOW':      'Situation remains stable; no fuel expenditure required.',
    }

    risk_reductions = {'CRITICAL': 65, 'HIGH': 45, 'MEDIUM': 20, 'LOW': 5}

    return {
        'observation':           observations.get(risk, f'Mission risk at {mission_risk}/100.'),
        'reasoning':             reasonings.get(risk, 'Insufficient data for detailed reasoning.'),
        'likely_cause':          likely_causes.get(risk, 'Cause undetermined from available telemetry.'),
        'impact_if_ignored':     impacts.get(risk, 'Unknown impact; further monitoring required.'),
        'action':                actions.get(risk, 'Review telemetry and await next tracking pass.'),
        'expected_improvement':  expected_improvements.get(risk, 'Outcome uncertain without more data.'),
        'risk_reduction':        risk_reductions.get(risk, 5),
    }


def _run_gemini_sync(prompt: str) -> dict:
    """Synchronous function to run the Gemini model."""
    if model is None:
        raise RuntimeError("Gemini is not configured")
    response = model.generate_content(prompt)
    json_str_match = re.search(r'\{.*\}', response.text, re.DOTALL)
    if json_str_match:
        return json.loads(json_str_match.group())
    raise ValueError("Failed to find JSON in Gemini response")


async def generate_recommendation(risk_data: dict, satellite_name: str) -> dict:
    """
    Ask Gemini to produce reasoning-driven mission intelligence, not threshold alerts.
    Runs the blocking API call in a separate thread.
    """
    battery      = risk_data['battery']
    health       = risk_data['health_score']
    mission_risk = risk_data['mission_risk']
    collision    = risk_data['collision_risk']
    risk_level   = risk_data['risk_level']
    can_maneuver = risk_data['can_maneuver']

    prompt = f"""You are an orbital mission analyst with deep expertise in spacecraft operations,
conjunction assessment, and subsystem fault reasoning. You are NOT a threshold-alert system.

Your job is to reason from first principles about what is physically happening to this spacecraft
and produce mission intelligence that a flight director can act on immediately.

--- TELEMETRY SNAPSHOT ---
Satellite:         {satellite_name}
Mission Risk:      {mission_risk}/100  (level: {risk_level})
Collision Risk:    {collision}
Health Score:      {health}/100
Battery Level:     {battery:.1f}%
Can Maneuver:      {can_maneuver}

--- YOUR ANALYTICAL TASK ---
Using the values above, reason about the spacecraft's actual physical state:

1. OBSERVATION — Describe the specific anomaly or condition exactly as the telemetry shows it.
   Reference the actual numbers; do not paraphrase generically.

2. REASONING — Explain the causal chain. Why is the battery at this level? Why is health degraded?
   How do these interact with the collision risk? Think in terms of orbital mechanics, thermal
   cycling, power budgets, eclipse periods, or attitude control stress.

3. LIKELY CAUSE — Name the most probable physical or environmental root cause (e.g., eclipse-driven
   charge depletion, atmospheric drag at low perigee, reaction wheel degradation, RF link anomaly).
   Be specific; do not say "system issue."

4. IMPACT IF IGNORED — Describe the concrete failure mode or mission outcome if no action is taken
   within the next 24 hours. Use the telemetry numbers to justify the timeline.

5. ACTION — State one precise, executable action that directly addresses the root cause.
   Include timing, subsystem, or parameter where relevant. Never say "monitor" or "check."

6. EXPECTED IMPROVEMENT — Quantify or clearly describe what changes after the action is taken.

7. RISK REDUCTION — Integer 0–100 representing the percentage reduction in mission risk from
   successfully executing the action.

Respond ONLY with valid JSON. No preamble, no explanation outside the JSON, no markdown fences.

{{
  "observation": "",
  "reasoning": "",
  "likely_cause": "",
  "impact_if_ignored": "",
  "action": "",
  "expected_improvement": "",
  "risk_reduction": 0
}}"""

    try:
        loop = asyncio.get_running_loop()
        recommendation = await loop.run_in_executor(None, _run_gemini_sync, prompt)
        return recommendation
    except Exception as e:
        print(f"Gemini unavailable, using rule-based fallback: {e}")
        return _fallback_recommendation(risk_data)