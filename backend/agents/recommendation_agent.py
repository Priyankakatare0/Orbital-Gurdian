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
    actions = {
        'CRITICAL': 'Initiate emergency maneuver immediately if battery permits.',
        'HIGH':     'Schedule avoidance maneuver within 24 hours.',
        'MEDIUM':   'Monitor conjunction closely; prepare contingency maneuver.',
        'LOW':      'Continue normal operations; log for review.',
    }
    return {
        'action': actions.get(risk, 'Monitor satellite and review telemetry.'),
        'reason': 'Generated from rule-based fallback (Gemini unavailable).',
        'estimated_impact': 'Reduces mission risk based on current threat level.',
        'risk_reduction': {'CRITICAL': 60, 'HIGH': 40, 'MEDIUM': 20, 'LOW': 5}.get(risk, 5)
    }

def _run_gemini_sync(prompt: str) -> dict:
    """Synchronous function to run the Gemini model."""
    if model is None:
        raise RuntimeError("Gemini is not configured")
    response = model.generate_content(prompt)
    # Extract the JSON part of the response
    json_str_match = re.search(r'\{.*\}', response.text, re.DOTALL)
    if json_str_match:
        return json.loads(json_str_match.group())
    raise ValueError("Failed to find JSON in Gemini response")

async def generate_recommendation(risk_data: dict, satellite_name: str) -> dict:
    '''
    Ask Gemini to interpret the risk data and give an operator recommendation.
    This function now runs the blocking API call in a separate thread.
    '''
    prompt = f'''
You are an expert satellite operations AI. Analyze this risk data and give a
concise, specific recommendation for the operator. Be direct.

Satellite: {satellite_name}
Mission Risk Score: {risk_data['mission_risk']}/100 ({risk_data['risk_level']})
Collision Risk: {risk_data['collision_risk']}
Health Score: {risk_data['health_score']}/100
Battery Level: {risk_data['battery']:.1f}%
Can Perform Maneuver: {risk_data['can_maneuver']}

Respond ONLY in this JSON format:
{{
  "action": "<one clear action sentence>",
  "reason": "<one sentence explaining why>",
  "estimated_impact": "<what this achieves>",
  "risk_reduction": <number 0-100>
}}
'''

    try:
        # Run the synchronous, blocking call in a separate thread
        loop = asyncio.get_running_loop()
        recommendation = await loop.run_in_executor(None, _run_gemini_sync, prompt)
        return recommendation
    except Exception as e:
        print(f"Error generating recommendation with Gemini: {e}")
        return _fallback_recommendation(risk_data)
