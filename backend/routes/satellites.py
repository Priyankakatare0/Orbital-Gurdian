from fastapi import APIRouter, HTTPException, Query
from typing import List
import random
from services.celestrak import fetch_satellites_from_celestrak
# from services.tle_parser import tle_to_position
from models.satellite import Satellite, SatellitePosition

router = APIRouter()

@router.get("", response_model=List[SatellitePosition])
async def get_satellites(limit: int = Query(20, ge=1, le=100)):
    """
    Fetch a list of active satellites from CelesTrak.
    """
    try:
        tle_data = await fetch_satellites_from_celestrak(limit)
        
        satellites = []
        for sat in tle_data:
            # Use the TLE parser to get current position
            satellites.append(
    SatellitePosition(
        id=sat.get('norad_id', sat.get('name')),
        name=sat.get('name', 'Unknown'),
        norad_id=sat.get('norad_id'),
        latitude=sat.get('latitude', 0),
        longitude=sat.get('longitude', 0),
        altitude=sat.get('altitude', 400),
        risk_score=round(random.uniform(5, 40), 1)
    )
)
        return satellites
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch or process satellite data: {e}")

@router.get("/{satellite_id}", response_model=SatellitePosition)
async def get_satellite_by_id(satellite_id: str):
    """
    Fetch a single satellite by its ID (NORAD ID or name).
    Note: This is a simplified implementation. A real-world scenario would
    query a database that is kept in sync with TLE data.
    """
    try:
        # Fetch all satellites and find the one with the matching ID
        tle_data = await fetch_satellites_from_celestrak(limit=2000) # Fetch a larger list to find the satellite
        
        found_sat = None
        for sat in tle_data:
            current_id = sat.get('NORAD_CAT_ID', sat.get('OBJECT_NAME'))
            if str(current_id) == satellite_id:
                found_sat = sat
                break
        
        if not found_sat:
            raise HTTPException(status_code=404, detail="Satellite not found")

        position_data = tle_to_position(found_sat['TLE_LINE1'], found_sat['TLE_LINE2'])
        
        return SatellitePosition(
            id=found_sat.get('NORAD_CAT_ID', found_sat.get('OBJECT_NAME')),
            name=found_sat.get('OBJECT_NAME', 'Unknown'),
            norad_id=found_sat.get('NORAD_CAT_ID', 'N/A'),
            latitude=position_data['latitude'],
            longitude=position_data['longitude'],
            altitude=position_data['altitude'],
            risk_score=round(random.uniform(5, 40), 1)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch satellite data: {e}")
