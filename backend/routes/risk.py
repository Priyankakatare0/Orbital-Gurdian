from fastapi import APIRouter, HTTPException, Query
from agents.decision_agent import analyze_mission_risk

router = APIRouter()

@router.get("/{satellite_id}")
async def get_mission_risk(
    satellite_id: str, 
    name: str = Query(..., description="The name of the satellite")
):
    """
    Get a comprehensive mission risk assessment for a specific satellite.
    This is orchestrated by the decision agent, which combines health and threat data.
    """
    if not name:
        raise HTTPException(status_code=400, detail="Satellite name query parameter is required.")

    try:
        # The decision_agent needs a context object for the satellite
        satellite_context = {
            "id": satellite_id,
            "name": name,
            "norad_id": satellite_id, # Assuming satellite_id is the NORAD ID
        }
        
        # Get the unified risk data from the decision agent
        risk_data = await analyze_mission_risk(satellite_context)

        return {
            "satellite_id": satellite_id,
            "satellite_name": name,
            **risk_data,
        }
    except Exception as e:
        # Log the exception for debugging
        print(f"Error getting mission risk for {name} ({satellite_id}): {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze mission risk: {e}")