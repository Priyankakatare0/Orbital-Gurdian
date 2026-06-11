from skyfield.api import load, EarthSatellite, wgs84
from datetime import datetime, timezone

def tle_to_position(tle_line1: str, tle_line2: str) -> dict:
    """
    Converts TLE data to geographic coordinates (latitude, longitude, altitude)
    using the Skyfield library. This is a highly accurate method.

    Args:
        tle_line1: The first line of the TLE data.
        tle_line2: The second line of the TLE data.

    Returns:
        A dictionary containing:
        - latitude (float): Latitude in degrees.
        - longitude (float): Longitude in degrees.
        - altitude (float): Altitude in kilometers.
    """
    try:
        # Load the timescale data needed for calculations
        ts = load.timescale()
        
        # Create a satellite object from the TLE data
        satellite = EarthSatellite(tle_line1, tle_line2, 'SAT', ts)
        
        # Get the current time in UTC
        now = datetime.now(timezone.utc)
        t = ts.utc(now.year, now.month, now.day, now.hour, now.minute, now.second)
        
        # Calculate the satellite's position at the current time
        geocentric = satellite.at(t)
        
        # Convert to geographic coordinates without requiring an external IERS file.
        subpoint = wgs84.subpoint(geocentric)
        lat = subpoint.latitude
        lon = subpoint.longitude
        altitude_km = subpoint.elevation.km
        
        return {
            "latitude": lat.degrees,
            "longitude": lon.degrees,
            "altitude": altitude_km
        }
    except Exception as e:
        # If any error occurs (e.g., invalid TLE format), return default values
        print(f"Error parsing TLE or calculating position: {e}")
        return {
            "latitude": 0.0,
            "longitude": 0.0,
            "altitude": 400.0 # Default altitude
        }

if __name__ == '__main__':
    # Example TLE for the International Space Station (ISS)
    iss_tle1 = '1 25544U 98067A   24164.50000000  .00000000  00000-0  00000-0 0  9999'
    iss_tle2 = '2 25544  51.6400 250.0000 0006781  30.0000 330.0000 15.49000000123456'
    
    position = tle_to_position(iss_tle1, iss_tle2)
    print("ISS Position:", position)
