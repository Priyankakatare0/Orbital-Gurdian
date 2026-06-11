from fastapi import APIRouter, HTTPException, Query
from agents.recommendation_agent import generate_recommendation
from agents.decision_agent import analyze_mission_risk

router = APIRouter()

@router.get("/{satellite_id}")
async def get_recommendation(
    satellite_id: str, 
    name: str = Query(..., description="The name of the satellite")
):
    """
    Get an AI-generated recommendation for a specific satellite based on its
    overall mission risk.
    """
    if not name:
        raise HTTPException(status_code=400, detail="Satellite name query parameter is required.")

    try:
        # The decision_agent combines health + threat into a unified risk dict
        # We pass a simplified satellite object to it
        satellite_context = {
            "id": satellite_id,
            "name": name,
            "norad_id": satellite_id, # Assuming satellite_id is the NORAD ID
        }
        risk_data = await analyze_mission_risk(satellite_context)

        # The recommendation_agent takes the risk data and satellite name
        recommendation = await generate_recommendation(risk_data, name)

        return {
            "satellite_id": satellite_id,
            "satellite_name": name,
            "mission_risk": risk_data.get("mission_risk"),
            "risk_level": risk_data.get("risk_level"),
            **recommendation,
        }
    except Exception as e:
        # Log the exception for debugging
        print(f"Error getting recommendation for {name} ({satellite_id}): {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendation: {e}")