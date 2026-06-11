import httpx
from typing import List, Dict, Optional
import math
from datetime import datetime

class CelesTrakService:
    """Service for fetching satellite data from CelesTrak JSON API."""
    
    # CelesTrak JSON API endpoint
    BASE_URL = "https://celestrak.org/NORAD/elements/gp.php"

    
    # Earth's gravitational parameter (km³/s²)
    MU = 398600.4418
    # Earth's radius (km)
    EARTH_RADIUS_KM = 6371.0
    
    @staticmethod
    def _calculate_altitude_from_mean_motion(mean_motion: float) -> float:
        """
        Calculate altitude from mean motion.
        
        Args:
            mean_motion: Mean motion in revolutions per day
        
        Returns:
            Altitude in kilometers
        """
        try:
            # Convert mean motion from revolutions/day to radians/second
            n_rad_per_sec = (mean_motion * 2 * math.pi) / (24 * 3600)
            
            # Calculate semi-major axis: a = (μ / n²)^(1/3)
            semi_major_axis = (CelesTrakService.MU / (n_rad_per_sec ** 2)) ** (1/3)
            
            # Calculate altitude
            altitude = semi_major_axis - CelesTrakService.EARTH_RADIUS_KM
            
            return altitude
        except Exception as e:
            print(f"Error calculating altitude from mean motion: {e}")
            return 0.0
    
    @staticmethod
    async def fetch_satellites(limit: int = 20) -> List[dict]:
        """
        Fetch satellite data from CelesTrak JSON API.
        
        Args:
            limit: Maximum number of satellites to return
        
        Returns:
            List of structured satellite data
        """
        try:
            async with httpx.AsyncClient() as client:
                url = f"{CelesTrakService.BASE_URL}?GROUP=STATIONS&FORMAT=JSON"
                
                response = await client.get( url, timeout=10)
                response.raise_for_status()
                
                data = response.json()
                
                satellites = []
                for i, sat in enumerate(data):
                    if i >= limit:
                        break
                    
                    try:
                    # Extract mean motion and calculate altitude
                        mean_motion = sat.get('MEAN_MOTION', 0)
                        altitude = CelesTrakService._calculate_altitude_from_mean_motion(mean_motion)

                        # Demo-friendly coordinates so satellites are spread around Earth
                        latitude = ((i * 37) % 180) - 90
                        longitude = ((i * 53) % 360) - 180

                        satellite = {
                            'OBJECT_NAME': sat.get('OBJECT_NAME', ''),
                            'NORAD_CAT_ID': sat.get('NORAD_CAT_ID', None),
                            # 'TLE_LINE1': sat.get('TLE_LINE1', ''),
                            # 'TLE_LINE2': sat.get('TLE_LINE2', ''),
                            'name': sat.get('OBJECT_NAME', ''),
                            'norad_id': sat.get('NORAD_CAT_ID', None),

                            'latitude': latitude,
                            'longitude': longitude,

                            'inclination': sat.get('INCLINATION', 0),
                            'eccentricity': sat.get('ECCENTRICITY', 0),
                            'mean_motion': mean_motion,
                            'altitude': altitude,
                            'orbit_type': CelesTrakService.classify_orbit(altitude),
                            'epoch': sat.get('EPOCH', ''),
                        }
                        satellites.append(satellite)
                    except Exception as e:
                        print(f"Error processing satellite {sat.get('OBJECT_NAME', 'Unknown')}: {e}")
                        continue
                
                return satellites
                
        except Exception as e:
            print(f"Error fetching satellites from CelesTrak: {e}")
            return []
    
    @staticmethod
    def classify_orbit(altitude_km: float) -> str:
        """
        Classify orbit type by altitude.
        
        Args:
            altitude_km: Altitude in kilometers
        
        Returns:
            Orbit type (LEO, GEO, or HEO)
        """
        if altitude_km < 35786:
            return 'LEO'
        elif altitude_km == 35786:
            return 'GEO'
        else:
            return 'HEO'

async def fetch_satellites_from_celestrak(limit: int = 20) -> List[Dict]:
    """Backward-compatible route helper for fetching CelesTrak satellite data."""
    return await CelesTrakService.fetch_satellites(limit)
