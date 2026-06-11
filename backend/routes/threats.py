from fastapi import APIRouter, HTTPException, Query
from agents.threat_agent import ThreatAgent
from models.satellite import SatellitePosition
from services.celestrak import fetch_satellites_from_celestrak
from services.tle_parser import tle_to_position
import random

router = APIRouter()

@router.get("/{satellite_id}")
async def get_threat_assessment(satellite_id: str, name: str = Query(..., description="The name of the satellite")):
    """
    Get a threat assessment for a specific satellite by its ID and name.
    This involves finding nearby satellites and calculating collision risk.
    """
    if not name:
        raise HTTPException(status_code=400, detail="Satellite name query parameter is required.")

    try:
        # Initialize the threat agent
        threat_agent = ThreatAgent()

        # Fetch a list of potential threats (other satellites)
        all_sats_data = await fetch_satellites_from_celestrak(limit=500)

        # Find the primary satellite and create a list of other satellites
        main_sat_position = None
        nearby_sats = []

        for sat_data in all_sats_data:
            current_id = sat_data.get('NORAD_CAT_ID', sat_data.get('OBJECT_NAME'))
            pos = tle_to_position(sat_data['TLE_LINE1'], sat_data['TLE_LINE2'])
            
            sat_pos = SatellitePosition(
                id=current_id,
                name=sat_data.get('OBJECT_NAME', 'Unknown'),
                norad_id=sat_data.get('NORAD_CAT_ID', 'N/A'),
                **pos
            )

            if str(current_id) == satellite_id:
                main_sat_position = sat_pos
            else:
                nearby_sats.append(sat_pos)

        if not main_sat_position:
            raise HTTPException(status_code=404, detail="Primary satellite not found in fetched data.")

        # Let the agent calculate the threat
        threat_assessment = threat_agent.calculate_threat_level(main_sat_position, nearby_sats)
        
        return {
            "satellite_id": satellite_id,
            "satellite_name": name,
            **threat_assessment
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get threat assessment: {e}")