from fastapi import APIRouter, HTTPException, Query
from agents.health_agent import analyze_health

router = APIRouter()

@router.get("/{satellite_id}")
async def get_satellite_health(satellite_id: str, name: str = Query(..., description="The name of the satellite")):
    """
    Get health status for a specific satellite by its ID and name.
    """
    if not name:
        raise HTTPException(status_code=400, detail="Satellite name query parameter is required.")
        
    try:
        # The health agent can now run asynchronously
        health_data = await analyze_health(satellite_name=name, norad_id=satellite_id)
        return health_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze satellite health: {e}")